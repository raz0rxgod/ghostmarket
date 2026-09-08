# Деплой на ВПС (по IP, dev-режим, без HTTPS)

Этот гайд разворачивает проект **как есть**, в dev-режиме (`next dev` / `nest start --watch`,
как локально) — через `docker-compose.yml`, который уже есть в репозитории. Это годится для
тестового/демо-окружения на ВПС без домена. Никакие production-сборки (multi-stage Docker,
`next build`/`start:prod`) здесь не делаются — если позже появится домен и захочется HTTPS +
production-сборки, это отдельный шаг (см. раздел 10 в конце).

Перед этим гайдом были исправлены два файла в репозитории (уже в архиве, который вы скачали):
- `nginx/nginx.conf` — баг, из-за которого API отдавал бы 404 при обращении через nginx
  (обрезался префикс `/api`). Раньше это не проявлялось, потому что фронт в dev ходил в backend
  напрямую по IP, минуя nginx.
- `frontend/.env.example` — раньше отсутствовал (только `.env`, который не попадает в git).

Everything below assumes Ubuntu 22.04/24.04 на ВПС и подключение по SSH под пользователем с `sudo`.

---

## 1. Подготовка ВПС

```bash
ssh root@ВАШ_IP        # или ваш sudo-пользователь

apt update && apt upgrade -y
```

### Установка Docker + Docker Compose plugin

```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER     # чтобы не писать sudo перед каждой docker-командой
newgrp docker                 # применить группу в текущей сессии
docker --version
docker compose version
```

### Файрвол — открываем только SSH и HTTP

```bash
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw enable
ufw status
```

Порты Postgres/Redis/MinIO/backend/frontend **не открываем** в файрволе — наружу торчит только
nginx на 80-м. Даже если в `docker-compose.yml` у них проброшены хостовые порты, `ufw` со
стандартным `deny incoming` не пропустит к ним внешние подключения (это не отменяет того, что
Docker сам по себе открывает эти порты на всех интерфейсах — просто ufw их дополнительно
блокирует снаружи; подробнее в разделе 10).

---

## 2. Клонирование проекта

```bash
cd /opt
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ> ghostmarket
cd ghostmarket/shop
```

Если репозитория в git нет — залейте архив на ВПС любым способом (`scp`, `rsync`) и распакуйте
в `/opt/ghostmarket`.

---

## 3. Настройка `.env`-файлов

`.env` в git не попадают (см. `.gitignore`) — после клонирования их нет, нужно создать из
`.env.example`.

### 3.1 Backend

```bash
cd /opt/ghostmarket/shop/backend
cp .env.example .env
nano .env
```

Что обязательно поменять в `backend/.env`:

| Переменная | Что поставить |
|---|---|
| `JWT_ACCESS_SECRET` | случайная строка, **не** `change_me_access_secret` |
| `JWT_REFRESH_SECRET` | случайная строка, отличная от access-секрета |
| `CORS_ORIGIN` | `http://ВАШ_IP` (без порта — сайт будет висеть на 80-м) |

`DATABASE_URL`, `REDIS_URL`, `S3_ENDPOINT` трогать не нужно — там уже правильные имена сервисов
из docker-сети (`postgres`, `redis`, `minio`), это НЕ то же самое, что `localhost` — контейнеры
обращаются друг к другу по именам сервисов из `docker-compose.yml`, а не по `localhost`.

Секреты можно сгенерировать так:

```bash
openssl rand -base64 48
```

Сгенерируйте **два разных** значения — отдельно для `JWT_ACCESS_SECRET` и `JWT_REFRESH_SECRET`.

### 3.2 Frontend

```bash
cd /opt/ghostmarket/shop/frontend
cp .env.example .env
nano .env
```

```
NEXT_PUBLIC_API_URL=http://ВАШ_IP/api
```

Важно: это URL, по которому к API будет обращаться **браузер пользователя**, а не docker-сеть —
поэтому здесь именно публичный IP ВПС, а не `backend` или `localhost`. Порт не указываем — идёт
через nginx на 80-м, вместе с самим сайтом.

---

## 4. Один порт наружу — правим `docker-compose.yml`

По умолчанию nginx в `docker-compose.yml` смотрит на хостовый порт `8080`. Меняем на стандартный
`80`, чтобы сайт открывался по `http://ВАШ_IP` без `:8080` в адресе:

```bash
cd /opt/ghostmarket/shop
nano docker-compose.yml
```

Найдите блок `nginx:` и поменяйте:

```diff
   nginx:
     ...
     ports:
-      - "8080:80"
+      - "80:80"
```

Остальное (`postgres`, `redis`, `minio`, `backend`, `frontend`) не трогаем — их хостовые порты
(`5433`, `6380`, `9002`/`9003`, `4000`, `3002`) удобны для отладки через SSH-туннель и наружу
файрволом всё равно закрыты (см. раздел 1).

---

## 5. Сборка и запуск

```bash
cd /opt/ghostmarket/shop
docker compose build
docker compose up -d
docker compose ps
```

Все контейнеры должны быть в статусе `running` (у `postgres` — ещё и `healthy` через
несколько секунд). Первый `docker compose build` займёт несколько минут — ставятся зависимости
`npm install` для backend и frontend внутри образов.

Смотреть логи по ходу запуска:

```bash
docker compose logs -f
# или конкретный сервис:
docker compose logs -f backend
docker compose logs -f frontend
```

`Ctrl+C` — просто выходит из просмотра логов, контейнеры продолжают работать.

---

## 6. Миграции БД и сид

Применяем миграции Prisma и заполняем базовые данные (роли, настройки магазина) — **внутри уже
запущенного контейнера backend**, не на хосте:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

`migrate deploy` (не `migrate dev`!) — применяет уже существующие миграции из
`backend/prisma/migrations` без интерактивных вопросов, это правильный способ для не-локального
окружения.

---

## 7. Первый администратор

Регистрация через `/register` выдаёт роль `CUSTOMER`. Чтобы попасть в `/admin`, зарегистрируйте
аккаунт на сайте, а затем повысьте его роль напрямую в базе:

```bash
docker compose exec postgres psql -U shop -d shop -c \
  "UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN') WHERE email = 'ваш@email';"
```

Проверить, что применилось:

```bash
docker compose exec postgres psql -U shop -d shop -c \
  "SELECT email, role_id FROM users WHERE email = 'ваш@email';"
```

---

## 8. Проверка

Открыть в браузере: `http://ВАШ_IP`

Быстрая проверка с самого сервера, что API отвечает через nginx (а не только напрямую):

```bash
curl -i http://localhost/api/settings
```

Должен быть `200 OK` с JSON, а не `404` (если `404` — вернитесь к разделу про `nginx.conf`,
значит правка `/api/` не применилась или редактировался другой файл).

---

## 9. Повседневная эксплуатация

**Автозапуск после перезагрузки ВПС** — уже настроен: у всех сервисов в `docker-compose.yml`
стоит `restart: unless-stopped`, а сам Docker включается в автозагрузку скриптом `get.docker.com`
автоматически. Проверить:

```bash
systemctl is-enabled docker
```

**Обновление кода после `git push`:**

```bash
cd /opt/ghostmarket/shop
git pull
docker compose build
docker compose up -d
docker compose exec backend npx prisma migrate deploy   # если были новые миграции
```

**Остановить/перезапустить:**

```bash
docker compose down          # остановить всё (volumes с данными сохраняются)
docker compose restart backend
```

**Бэкап базы данных** (данные лежат в named volume `postgres_data` — переживают
`docker compose down`, но не переживают `docker compose down -v` или удаление volume):

```bash
docker compose exec postgres pg_dump -U shop shop > backup_$(date +%F).sql
```

Восстановление из бэкапа:

```bash
cat backup_2026-08-17.sql | docker compose exec -T postgres psql -U shop -d shop
```

**Загруженные изображения товаров** хранятся на диске backend-контейнера в примонтированной
папке `backend/uploads` (bind mount из `docker-compose.yml`) — то есть физически лежат прямо на
ВПС в `/opt/ghostmarket/shop/backend/uploads`, бэкапить их можно как обычную папку (`rsync`,
`tar`).

---

## 10. На заметку — если позже появится домен

Этот гайд намеренно не включает production-сборки и HTTPS. Когда появится домен, для перехода
понадобится отдельно:

1. Собрать production-образы (`next build && next start` вместо `next dev`,
   `nest build && node dist/main` вместо `start:dev`) — сейчас `Dockerfile` у backend и frontend
   рассчитаны на разработку, не оптимизированы по размеру и скорости старта.
2. Поставить Certbot (Let's Encrypt) и добавить `server { listen 443 ssl; }` в `nginx.conf`.
3. Плотнее закрыть порты `postgres`/`redis`/`minio`/`backend`/`frontend` в
   `docker-compose.yml` — сейчас они проброшены на все интерфейсы хоста (`0.0.0.0`), файрвол их
   прикрывает, но привязка портов к `127.0.0.1` (`"127.0.0.1:5433:5432"` вместо `"5433:5432"`)
   даёт защиту даже при ошибке в правилах `ufw`.

Если понадобится — попросите отдельно, подготовлю production `Dockerfile`/`docker-compose.prod.yml`.

---

## 11. Диагностика — если что-то не поднялось

**`docker compose ps` показывает `Restarting` у какого-то сервиса:**

```bash
docker compose logs --tail 100 <имя_сервиса>
```

**Postgres не стартует с `PANIC: could not write to file ... No space left on device`** —
диск ВПС заполнен, база зациклится в бесконечном restart, пока не появится место:

```bash
df -h
docker system df
docker system prune -a --volumes   # чистит неиспользуемые образы/volumes, не трогает рабочие
```

**Сайт открывается, но карточки товаров пустые / ошибки в консоли браузера про CORS или
Failed to fetch** — почти всегда означает, что `NEXT_PUBLIC_API_URL` в `frontend/.env` не
совпадает с тем, как вы реально открываете сайт (например, в `.env` указан IP, а сайт открыт
по домену, или наоборот). Поправьте `.env` и `docker compose restart frontend`.
