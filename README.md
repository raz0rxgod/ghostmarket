# 👻 GhostMarket

**Полнофункциональный интернет-магазин** (уровень re:Store, без онлайн-оплаты на первом этапе) —
каталог с фильтрами по атрибутам, корзина, оформление заказа, избранное, личный кабинет и админ-панель
для управления товарами, категориями, брендами и контентом сайта.

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2ea44f?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-informational)

Стек: **Next.js 15 + React 19** (frontend, тёмная тема с градиентом) · **NestJS + Prisma + PostgreSQL** (backend) · **Redis** · **S3/MinIO** · **Docker Compose** · **Nginx**.

> 📄 Подробный и актуальный технический статус — [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md).
> 🚀 Гайд по развёртыванию на VPS — [`docs/DEPLOY.md`](docs/DEPLOY.md).
> Этот README — только обзор и быстрый старт.

## Содержание

- [Возможности](#возможности)
- [Структура](#структура)
- [Быстрый старт](#быстрый-старт-локально-без-docker-для-backendfrontend)
- [Запуск через Docker Compose](#запуск-всего-через-docker-compose)
- [Roadmap](#что-дальше-по-плану)
- [Лицензия](#лицензия)

## Возможности

- 🛍️ Каталог товаров с фильтрами по категориям/брендам/атрибутам, сортировкой и поиском
- 🛒 Корзина, оформление заказа без онлайн-оплаты, статусы заказов
- ❤️ Избранное, личный кабинет
- 🔐 JWT-аутентификация (access + refresh) с ролями `ADMIN / MANAGER / EDITOR / CUSTOMER`
- 🖼️ Загрузка и обработка изображений (Multer + Sharp: ресайз, конвертация в WebP)
- 🛠️ Админ-панель: товары, категории, бренды, атрибуты, статические страницы, тексты сайта
- 🐳 Полностью контейнеризовано: Postgres, Redis, MinIO, backend, frontend, nginx

## Структура

```
shop/
├── frontend/     Next.js (сайт + /admin)
├── backend/      NestJS API
├── nginx/        reverse proxy
├── docker-compose.yml
└── docs/
```

Backend уже разбит на модули (`backend/src/modules/*`) по всем разделам из плана: auth, users, products, categories, brands, attributes, product-images, cart, orders, reviews, favorites, search, seo, banners, pages, settings, uploads, notifications, analytics.

**Полностью реализованы:**
- `auth` — регистрация, логин, JWT + refresh token
- `products` — CRUD, фильтры (включая по атрибутам), пагинация, поиск, slug
- `categories` — дерево категорий, CRUD, slug
- `brands` — CRUD, slug
- `attributes` — атрибуты и их значения (источник фильтров каталога и характеристик товара)
- `cart` — добавление/удаление/изменение количества, подсчёт суммы (нужна авторизация)
- `orders` — оформление заказа из корзины (без оплаты), статусы, список для админки
- `favorites` — добавление/удаление/список избранного
- `product-images` — загрузка, привязка к товару, сортировка, главная картинка
- `uploads` — загрузка изображений (Multer + Sharp, ресайз + webp), раздаются статически из `/uploads`
- `users` — пока только `GET /users/me` (профиль + роль, нужен фронту для защиты `/admin`)
- `settings` — тексты сайта (название магазина, контакты, hero-заголовок/подзаголовок, текст в футере)
- `pages` — статические страницы (О компании, Доставка и т.п.), CRUD + публичный вывод

Роли проверяются через `RolesGuard` (`common/guards/roles.guard.ts`) + декоратор `@Roles('ADMIN', 'MANAGER', ...)`.

**Остальные модули — заготовки** (`reviews`, `search` (полнотекстовый), `seo`, `banners`, `notifications`, `analytics`) — `*.controller.ts` / `*.service.ts` со `// TODO`, делаются по аналогии с `products` / `cart`.

**Frontend** — полностью рабочий сквозной сценарий "зашёл → выбрал → купил": главная (`/`), каталог с фильтром по категориям/атрибутам и сортировкой (`/catalog`), карточка товара (`/product/[slug]`), корзина (`/cart`), оформление заказа (`/checkout`), избранное (`/favorites`), личный кабинет (`/account`), авторизация (`/login`, `/register`), статические страницы (`/pages/[slug]`). Тёмная дизайн-система "GhostMarket" (`frontend/src/app/globals.css`, `tailwind.config.ts`). Тексты на главной и в футере подтягиваются из `GET /settings`, а не захардкожены.

**Админка** (`/admin`) — создание/редактирование карточек товаров (название, sku, цена, остаток, категория, бренд, характеристики-атрибуты, описание, фото), категорий, брендов, атрибутов, статических страниц и текстов сайта. Доступ защищён по роли: `AdminGuard` на фронте запрашивает `GET /api/users/me` и скрывает саму админку от ролей, кроме ADMIN/MANAGER (а не только блокирует действия) — **как выдать роль см. `docs/PROJECT_STATUS.md`, раздел 4.1** (кратко: один SQL-запрос в контейнере Postgres, без перелогина — роль подхватится после обновления страницы).

## Быстрый старт (локально, без Docker для backend/frontend)

```bash
# 1. Поднять только инфраструктуру (порты уже разведены, см. ниже)
docker compose up -d postgres redis minio

# 2. Backend
cd backend
cp .env.example .env
# ⚠️ т.к. backend теперь запускается НЕ в докере, а postgres/redis — в докере
# с проброшенными портами 5433/6380, в .env нужно поменять хосты и порты:
#   DATABASE_URL="postgresql://shop:shop_password@localhost:5433/shop?schema=public"
#   REDIS_URL="redis://localhost:6380"
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev       # http://localhost:4000/api

# 3. Frontend (в отдельном терминале)
cd ../frontend
npm install
npm run dev -- -p 3002   # ⚠️ порт 3002, т.к. 3000 может быть занят другим проектом на сервере — http://localhost:3002
```

## Запуск рядом с другим проектом на той же машине

Порты в `docker-compose.yml` уже разведены, чтобы не мешать другому Docker Compose проекту
на этой же виртуалке (например, если на `3000`/`3001`/`5432`/`6379`/`9000`/`9001`/`80` уже что-то висит):

| Сервис    | Порт на хосте | Было по умолчанию |
|-----------|---------------|--------------------|
| Postgres  | 5433          | 5432               |
| Redis     | 6380          | 6379               |
| MinIO API | 9002          | 9000               |
| MinIO Console | 9003      | 9001               |
| Backend   | 4000          | 4000 (без изменений) |
| Frontend  | 3002          | 3000               |
| Nginx     | 8080          | 80                 |

Это влияет только на порты, видимые **с хоста**. Внутри docker-сети контейнеры по-прежнему
обращаются друг к другу по внутренним портам (`postgres:5432`, `redis:6379` и т.д.) — `.env`
файлы менять не нужно, если backend/frontend тоже запускаются в докере.

**Перед первым запуском обязательно проверьте на сервере:**

```bash
sudo ss -tulnp | grep LISTEN          # что реально слушает порты
docker ps --format "table {{.Names}}\t{{.Ports}}"   # какие контейнеры уже работают
```

Если какой-то из портов (5433/6380/9002/9003/4000/3002/8080) всё же занят другим проектом —
поменяйте левую часть (host-порт) в `docker-compose.yml` на свободный, правую (порт контейнера)
не трогайте.

**Имена контейнеров** (`container_name`) — `shop_postgres`, `shop_redis`, `shop_minio`,
`shop_backend`, `shop_frontend`, `shop_nginx`. Если у другого проекта контейнеры называются так же —
`docker compose up` откажется стартовать с ошибкой `Conflict. The container name "..." is already in use`.
Проверьте `docker ps -a --format "{{.Names}}"` — если совпадений нет, старый проект не тронется.

Проект держите в **отдельной директории**, отличной от директории МИД-проекта
(например `/home/shop/project`, а не `/home/mid/project`) — тогда Docker Compose
сам не перепутает автосоздаваемые сети и volumes (у них имена берутся из имени директории).



## Запуск всего через Docker Compose

```bash
docker compose up --build
```

- Сайт: http://localhost:8080 (через Nginx)
- API напрямую: http://localhost:4000/api
- Frontend напрямую (минуя Nginx): http://localhost:3002
- MinIO консоль: http://localhost:9003 (minioadmin / minioadmin)
- Postgres снаружи (например, для DBeaver): localhost:5433

## Что дальше (по плану)

1. Реализовать оставшиеся модули: `reviews`, `search` (полнотекстовый, сейчас `contains`), `seo`, `banners`. Модуль `users` частично готов (`GET /users/me` — есть, редактирование профиля/адресов и список пользователей для админки — нет).
2. Раздел заказов в `/admin` (backend `GET /api/orders` для списка уже готов, на фронте не выведен).
3. Фильтры по атрибутам сейчас работают как единый AND по всем выбранным значениям (в т.ч. внутри одного атрибута) — если понадобится классическая OR-внутри-атрибута/AND-между-атрибутами логика, см. `docs/PROJECT_STATUS.md`, раздел 8, п.10.
4. `uploads`: сейчас пишет на диск backend-контейнера — при масштабировании заменить на MinIO/S3 (`@aws-sdk/client-s3`), заготовка помечена TODO в `uploads.service.ts`.
5. SEO: sitemap.xml, robots.txt, OpenGraph, JSON-LD — таблица `seo` в БД уже готова.
6. Второй этап (см. документ плана): онлайн-оплата, промокоды, бонусы, 1С/CRM.

Полный план — см. присланный документ с описанием этапов 1–6. Подробный технический статус — `docs/PROJECT_STATUS.md`, раздел 8 (roadmap).

## Лицензия

Проект распространяется под лицензией [MIT](LICENSE).

## Контрибьютинг

Правила по работе с репозиторием, соглашения по коммитам и структуре кода — см. [`CONTRIBUTING.md`](CONTRIBUTING.md).
