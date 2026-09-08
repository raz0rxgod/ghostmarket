# Документация проекта: интернет-магазин (re:Store-like, без оплаты на первом этапе)

Этот файл — точка входа для любого агента (человека или AI), который продолжит разработку.
Он описывает: что уже сделано и работает, что сделано частично (заготовки), что не сделано вообще,
и как всё это устроено, чтобы не пришлось читать весь код с нуля.

Первоисточник требований — документ с планом, присланный заказчиком (этапы 1–6 + roadmap v2).
Этот файл дополняет его фактическим статусом реализации.

---

## 1. Технологический стек (зафиксирован, не менять без причины)

| Часть        | Технология                              |
|--------------|------------------------------------------|
| Frontend     | Next.js 15 (App Router) + React 19 + TypeScript |
| UI           | Tailwind CSS (shadcn/ui из плана — **пока не подключён**, используется чистый Tailwind) |
| Backend      | NestJS 10                                |
| ORM          | Prisma 5                                 |
| БД           | PostgreSQL 16                            |
| Кэш          | Redis 7 (контейнер поднят, **в коде пока не используется** — нет ни одного `@Inject` Redis) |
| Файлы        | MinIO (S3-совместимо), контейнер поднят, **backend пока пишет на локальный диск**, не в MinIO |
| Авторизация  | JWT (access + refresh), passport-jwt     |
| Docker       | Docker Compose (postgres, redis, minio, backend, frontend, nginx) |
| Reverse proxy| Nginx                                    |

Админка **не вынесена отдельно** — живёт внутри frontend на `/admin` (`frontend/src/app/admin`), как и планировалось.

---

## 2. Структура репозитория

```
shop/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       ← вся схема БД (см. раздел 3)
│   │   └── seed.ts             ← сидит роли + базовые settings
│   ├── src/
│   │   ├── main.ts             ← bootstrap, helmet, CORS, /api prefix, /uploads static
│   │   ├── app.module.ts       ← собирает ВСЕ модули (список — раздел 5)
│   │   ├── prisma/             ← PrismaService/PrismaModule (глобальный, @Global())
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts   ← проверяет наличие валидного JWT
│   │   │   │   └── roles.guard.ts      ← проверяет роль пользователя из БД
│   │   │   └── decorators/
│   │   │       ├── roles.decorator.ts        ← @Roles('ADMIN', ...)
│   │   │       └── current-user.decorator.ts ← @CurrentUser() достаёт {userId,email} из req.user
│   │   └── modules/<name>/     ← 19 модулей, статус см. раздел 5
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example / .env
│   └── nest-cli.json, tsconfig.json
├── frontend/
│   ├── src/app/                ← Next.js App Router — тёмная тема "GhostMarket" (см. globals.css/tailwind.config.ts)
│   │   ├── page.tsx             ← главная: hero-баннер на градиенте, категории, популярные товары
│   │   ├── catalog/page.tsx     ← фильтр по категории, рабочая сортировка по цене (SortSelect)
│   │   ├── product/[slug]/page.tsx ← карточка товара, кнопка "В корзину", кнопка избранного
│   │   ├── cart/page.tsx        ← готово
│   │   ├── checkout/page.tsx    ← готово
│   │   ├── favorites/page.tsx   ← готово
│   │   ├── account/page.tsx     ← готово (без истории заказов)
│   │   └── admin/               ← готово: guard по логину, товары (CRUD+фото), категории, бренды
│   ├── src/components/Header.tsx, Footer.tsx, ProductCard.tsx, icons.tsx, admin/
│   ├── src/lib/api.ts           ← fetch-клиент к backend, включая admin CRUD через authFetch
│   └── Dockerfile, package.json, tailwind.config.ts
├── nginx/nginx.conf            ← / → frontend, /api/ → backend, /uploads/ → backend
├── docker-compose.yml
├── docs/PROJECT_STATUS.md      ← этот файл
├── README.md                   ← краткая версия для быстрого старта
└── .gitignore
```

---

## 3. Схема базы данных (Prisma) — реализована полностью

Файл: `backend/prisma/schema.prisma`. Все таблицы из исходного плана присутствуют:

- **Пользователи и роли**: `User`, `Role` (enum: ADMIN/MANAGER/EDITOR/CUSTOMER), `RefreshToken`, `Address`
- **Каталог**: `Category` (self-relation для дерева, привязка к `Seo`), `Brand`, `Product` (привязка к `Category`, `Brand`, `Seo`), `ProductImage`
- **Атрибуты (EAV)**: `Attribute`, `AttributeValue`, `ProductAttributeValue` — API реализован (модуль `attributes`, см. раздел 5), используется и для фильтров каталога, и для характеристик в карточке товара
- **Корзина/Избранное**: `Cart` (1:1 с User, **гостевой корзины нет**), `CartItem`, `Favorite`
- **Заказы**: `Order` (enum `OrderStatus`: NEW/IN_PROGRESS/SHIPPED/COMPLETED/CANCELLED), `OrderItem` (хранит снапшот title/price на момент заказа)
- **Отзывы**: `Review` (rating, text, photos[], isApproved) — таблица готова, **API не реализован**
- **Контент**: `Seo` (title/description/keywords/slug, привязан к Category и Product 1:1, **API не реализован**), `Banner` (**API не реализован**), `Page` (API реализован, см. раздел 5), `Setting` (key-value, API реализован — см. раздел 5)

⚠️ Важно для следующего агента:
- ✅ Миграции применены и проверены — пользователь прогнал полный сценарий (регистрация → выдача роли ADMIN → категории/бренды/атрибуты → товары → фото → каталог, см. раздел 4.1) на реальной БД. Если разворачиваете с нуля — `npx prisma migrate dev` всё равно нужно выполнить один раз (см. раздел 4).
- Схема `schema.prisma` с этой сессии не менялась — новые backend-модули (`attributes`, `settings`, `pages`) используют таблицы, которые в БД уже были с самого начала (`Attribute`/`AttributeValue`/`ProductAttributeValue`, `Setting`, `Page`) — новая миграция под них не требовалась.
- Все ID — `uuid()`. Все `slug` — генерируются backend'ом функцией `slugify()` (транслитерации нет, только `[a-z0-9а-яё]`, кириллица остаётся как есть — для полноценного SEO может понадобиться транслитерация в латиницу).

---

## 4. Как поднять проект (для нового агента/разработчика)

⚠️ **Если на той же машине уже крутится другой проект** (например, портал МИД на портах
3000/3001/5432/6379/9000/9001/80) — этот `docker-compose.yml` уже адаптирован под соседство:
Postgres → `5433`, Redis → `6380`, MinIO → `9002`/`9003`, Frontend → `3002`, Nginx → `8080`,
Backend остался на `4000` (не пересекается). Подробности и команды диагностики — в README.md,
раздел "Запуск рядом с другим проектом на той же машине". Ничего выключать не нужно —
Docker Compose проекты в разных директориях изолированы по сети/volumes автоматически,
опасны только совпадающие host-порты и `container_name`.

```bash
# 1. Инфраструктура
cd shop
docker compose up -d postgres redis minio

# 2. Backend
cd backend
cp .env.example .env   # уже сделано в архиве, но проверить актуальность
npm install
npx prisma migrate dev --name init   # ⚠️ ЕЩЁ НИ РАЗУ НЕ ВЫПОЛНЕНО
npm run prisma:seed                  # создаёт роли ADMIN/MANAGER/EDITOR/CUSTOMER + базовые settings
npm run start:dev                    # http://localhost:4000/api

# 3. Frontend
cd ../frontend
npm install
npm run dev                          # http://localhost:3000
```

Через Docker целиком: `docker compose up --build` (nginx отдаёт всё на `http://localhost`).

**Если backend запускается локально (не в докере)** — в `backend/.env` заменить хосты `postgres`/`redis`/`minio` на `localhost`, т.к. эти имена резолвятся только внутри docker-сети.

---

## 4.1. Выдать роль ADMIN пользователю (проверено, рабочий способ)

Обязательный шаг после регистрации — без него `/admin` открывается (см. `AdminGuard`), но любое
изменяющее действие (создание/правка/удаление товара, категории, бренда) вернёт `403`, потому что
при обычной регистрации выдаётся роль `CUSTOMER` (см. `RolesGuard`, раздел 7.3).

```bash
# 1. Убедиться, что пользователь и роли есть в БД
docker exec -it shop_postgres psql -U shop -d shop -c "SELECT email, role_id FROM users;"
docker exec -it shop_postgres psql -U shop -d shop -c "SELECT * FROM roles;"

# Если roles пустая — сиды не прогонялись:
docker exec -it shop_backend npx prisma db seed

# 2. Выдать ADMIN конкретному email (подставить реальный, не по шаблону)
docker exec -it shop_postgres psql -U shop -d shop -c \
  "UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'ADMIN') WHERE email = 'name@example.com';"

# 3. Проверить, что применилось
docker exec -it shop_postgres psql -U shop -d shop -c \
  "SELECT u.email, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = 'name@example.com';"
```

Если backend/postgres подняты не через Docker — тот же SQL через `psql "$DATABASE_URL"` (значение
берётся из `backend/.env`).

Роль проверяется в БД на каждый запрос (`RolesGuard` делает `prisma.user.findUnique` с `include: { role: true }`,
JWT-payload роли не содержит) — значит **перелогиниваться не нужно**, достаточно обновить страницу
в браузере после `UPDATE`.

`GET /users/me` теперь реализован (см. раздел 5 и roadmap п.6) и используется фронтом для показа/скрытия
админки — но выдача самой роли ADMIN всё ещё делается только через прямой SQL, как описано выше.
Кнопки "Сделать администратором" в UI или management-команды (`npm run make-admin -- email`) — осознанно
не сделаны, чтобы не плодить лишний небезопасный код в тестовом прототипе.

---

## 5. Статус backend-модулей (`backend/src/modules/*`)

### ✅ Полностью реализованы (есть DTO, валидация, сервис, контроллер, роли)

| Модуль | Эндпоинты | Доступ |
|---|---|---|
| **auth** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout` | Публично |
| **products** | `GET /api/products` (фильтры: categoryId, brandId, search, attributeValueIds, page, limit, sort), `GET /api/products/:slug`, `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id` | GET публично; создание/правка — ADMIN/MANAGER; удаление — ADMIN |
| **categories** | `GET /api/categories` (дерево), `GET /api/categories/flat` (плоский список), `GET /api/categories/:slug`, `POST`, `PATCH /:id`, `DELETE /:id` | GET публично; CUD — ADMIN/MANAGER, удаление — ADMIN |
| **brands** | `GET /api/brands`, `GET /api/brands/:slug`, `POST`, `PATCH /:id`, `DELETE /:id` | Аналогично categories |
| **attributes** | `GET /api/attributes` (атрибуты со значениями), `POST /api/attributes`, `DELETE /api/attributes/:id`, `POST /api/attributes/:id/values`, `DELETE /api/attributes/values/:valueId` | GET публично; создание/добавление значений — ADMIN/MANAGER; удаление — ADMIN |
| **cart** | `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `DELETE /api/cart` (очистить) | Требует JWT (любой авторизованный пользователь) |
| **orders** | `POST /api/orders` (создать заказ из текущей корзины, обнуляет её), `GET /api/orders/my`, `GET /api/orders/:id`, `GET /api/orders` (все, для админки), `PATCH /api/orders/:id/status` | Создание/просмотр своих — любой авторизованный; список всех и смена статуса — ADMIN/MANAGER |
| **favorites** | `GET /api/favorites`, `POST /api/favorites/:productId`, `DELETE /api/favorites/:productId` | Требует JWT |
| **uploads** | `POST /api/uploads/image` (multipart, поле `file`) — ресайз до 1200px, конвертация в WebP, сохранение на диск backend-контейнера (`backend/uploads/`), раздаётся статикой по `/uploads/<filename>` | ADMIN/MANAGER/EDITOR |
| **product-images** | `GET /api/product-images/product/:productId`, `POST /api/product-images` (привязать уже загруженный через `uploads` файл к товару), `PATCH /api/product-images/:id` (сортировка / смена главной), `DELETE /api/product-images/:id` | GET публично; остальное — ADMIN/MANAGER/EDITOR |
| **users** | `GET /api/users/me` (профиль + роль) | Требует JWT |
| **settings** | `GET /api/settings` (тексты сайта: `shop_name`, `phone`, `email`, `address`, `hero_title`, `hero_subtitle`, `footer_description` — с дефолтами, если строки в БД ещё нет), `PATCH /api/settings` | GET публично; PATCH — ADMIN/MANAGER |
| **pages** | `GET /api/pages` (список), `GET /api/pages/:slug`, `POST /api/pages`, `PATCH /api/pages/:id`, `DELETE /api/pages/:id` | GET публично; CUD — ADMIN/MANAGER/EDITOR, удаление — ADMIN |

Модуль `users` пока реализует только `me` — редактирование профиля, адреса, список пользователей/блокировка для админки ещё не сделаны (см. roadmap п.7 ниже).

**Атрибуты и фильтры**: `attributeValueIds` в `products.findAll` — упрощённая логика: **AND между всеми переданными id**, в том числе внутри одного атрибута (если передать id "Красный" и id "Синий" от атрибута "Цвет" одновременно — товаров с обоими цветами сразу не найдётся, а не OR как в типичном фасетном фильтре). Осознанное упрощение для тестового прототипа — если понадобится классическая "OR внутри атрибута / AND между атрибутами" логика, нужно группировать переданные id по `attributeId` перед сборкой `where` (сейчас это не сделано ни на backend, ни на фронте — `AttributeFilters.tsx` просто кладёт все выбранные id в один список).

**`settings`**: `UpdateSettingsDto` — явный список полей (`shop_name`/`phone`/`email`/`address`/`hero_title`/`hero_subtitle`/`footer_description`), не произвольный `Record<string,string>` — сознательно, чтобы через админку нельзя было записать в БД что угодно под любым ключом. Если нужно новое редактируемое поле — добавить и в DTO (backend), и в `SettingsService.DEFAULTS`, и в `FIELDS` на `/admin/settings` (frontend).

Логика `product-images`: ровно одна главная (`isMain`) картинка на товар — при простановке новой главной остальные сбрасываются; при удалении главной следующая по `sortOrder` становится главной автоматически; первая загруженная картинка товара становится главной по умолчанию.

Общая логика ролей: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN', ...)` на нужных методах. Если `@Roles` не указан — доступ разрешён любому авторизованному (`JwtAuthGuard` без `RolesGuard`).

### ⚠️ Заготовки (модуль + пустой сервис/контроллер с `// TODO`, БЕЗ логики)

Эти модули подключены в `app.module.ts` и физически стартуют (не сломают приложение), но **не имеют ни одного эндпоинта**:

- `reviews` — нужно: оставить отзыв (rating, text, photos), модерация (isApproved) для админки
- `search` — нужно: отдельный полнотекстовый поиск (сейчас поиск есть только как параметр `search` внутри `products.findAll`, через `contains`/`insensitive`, не через PostgreSQL Full Text Search, как планировалось)
- `seo` — нужно: CRUD для таблицы `Seo`, отдача meta-тегов по slug страницы
- `banners` — нужно: CRUD баннеров для главной/акций
- `notifications` — не спроектирован даже на уровне DTO/модели (нет таблицы в Prisma). Нужно решить: email/push/оба, добавить таблицу если нужна история
- `analytics` — не спроектирован (нет таблицы). Нужно определить, что именно считаем (продажи, просмотры, конверсия) прежде чем писать код

---

## 6. Статус frontend (`frontend/src/app/*`)

### Дизайн: GhostMarket, тёмная тема с градиентом
Ребрендинг под «GhostMarket» + тёмная дизайн-система:
- `tailwind.config.ts` — палитра (`bg`/`bg-surface`/`bg-raised`), градиент `ghost-gradient` (violet → fuchsia → cyan), тени `glow`/`glow-sm`
- `src/app/globals.css` — фиксированный фон с размытыми градиентными пятнами (`.app-backdrop`), утилити-классы `.glass-card`, `.glass-panel`, `.btn-gradient`, `.btn-ghost-outline`, `.input-dark`, `.text-gradient`
- `src/components/icons.tsx` — набор inline SVG-иконок (без внешних npm-пакетов вроде lucide, чтобы не тащить новые зависимости в тестовый прототип)
- shadcn/ui из исходного плана по-прежнему не подключён, используется чистый Tailwind

### ✅ Готово
- `/` — hero-баннер, список категорий, сетка популярных товаров (`ProductCard`)
- `/catalog` — фильтр по категории (сайдбар) + **фильтры по атрибутам** (`AttributeFilters.tsx` — чекбоксы, состояние в `?attrs=id1,id2`, сохраняется при смене сортировки/категории), рабочая сортировка по цене через `SortSelect.tsx` (переписан, чтобы сохранять все текущие query-параметры при смене сортировки, а не только `categoryId` — раньше `<select>` вообще ничего не делал без JS, это ещё раньше было починено)
- `/product/[slug]` — галерея (`ProductGallery.tsx`, кликабельные миниатюры с crossfade), кнопка "В корзину", кнопка избранного (`FavoriteButton`)
- `/pages/[slug]` — **новое**: публичный вывод статических страниц, созданных в `/admin/pages` (например «О компании», «Доставка»)
- `/cart`, `/checkout` — полностью рабочий сценарий заказа (см. п.4–5 roadmap ниже)
- `/favorites` — список избранного, `src/lib/favorites.ts` + `src/components/FavoritesProvider.tsx` (контекст, аналогично `CartProvider`), кнопка-сердечко на карточке товара и на странице товара
- `/account` — гейт по логину, баннер подтверждения заказа, бейдж роли рядом с email, ссылка "Перейти в админку" для персонала
- `Header`/`AuthNav`, `Footer` — ссылка "Админка" видна только `isStaff` (`role === 'ADMIN' || 'MANAGER'`), обычные покупатели её не видят вовсе
- **Тексты сайта редактируются из админки** — `layout.tsx` (server component) запрашивает `GET /settings` + `GET /pages` при рендере и прокидывает их в `Header`*/`Footer`/главную страницу; hero-заголовок/подзаголовок на `/` и текст в футере, телефон/email — теперь не захардкожены, а берутся из БД. Если backend недоступен на момент рендера — используется захардкоженный fallback (`FALLBACK_SETTINGS` в `layout.tsx` и в `page.tsx`), чтобы сайт не падал целиком
- **Инлайн-редактирование прямо на сайте** — `EditableText.tsx` + `SiteEditModeProvider`/`EditModeToggle` (плавающая кнопка внизу справа, только для персонала): клик по hero-тексту, описанию/контактам в футере или тексту статической страницы превращает его в поле ввода на месте, без похода в `/admin`. Подробности, ограничения (нет синхронизации между вкладками без перезагрузки) — раздел 8, пункт 7.1
- **Админка** (`/admin/*`) — переработана полностью:
  - `admin/layout.tsx` + `AdminGuard` (`src/components/admin/AdminGuard.tsx`) — общий сайдбар (Дашборд/Товары/Категории/Бренды/Атрибуты/Страницы/Тексты сайта), **защита по роли** (не только по факту логина, см. ✅ ниже): CUSTOMER видит экран "Недостаточно прав" вместо содержимого
  - `/admin/products` — список с фото, ссылками "Изменить"/"Фото" и удалением
  - `/admin/products/new`, `/admin/products/[id]/edit` — форма создания/редактирования карточки товара (название, sku, цена/старая цена, остаток, категория, бренд, **характеристики-атрибуты**, описание) — `src/components/admin/ProductForm.tsx`
  - `/admin/products/[id]/images` — загрузка/удаление фото, назначение главной; через обычный `authFetch` (без ручной вставки токена)
  - `/admin/categories`, `/admin/brands` — создание/удаление категорий и брендов. Это было необходимо, потому что `seed.ts` не создаёт ни одной категории — без этого экрана карточку товара было бы невозможно создать
  - `/admin/attributes` — **новое**: создание атрибутов ("Цвет", "Память") и их значений ("Красный", "128GB") — это же становится фильтрами в `/catalog` и чекбоксами в `ProductForm`
  - `/admin/pages` — **новое**: список + создание/редактирование/удаление статических страниц (заголовок + текст), инлайн-форма прямо в списке (без отдельного роута `/new`)
  - `/admin/settings` — **новое**: форма редактирования текстов сайта (название магазина, телефон, email, адрес, заголовок/подзаголовок hero на главной, текст в футере) — это и есть "правка текста на всём сайте" из запроса пользователя
  - `AdminForbiddenNotice` — баннер на случай, если конкретное действие (создание/правка/удаление) всё же вернуло 403 от backend, хотя `AdminGuard` пропустил на страницу (например, роль понизили в БД прямо во время активной сессии, а закэшированное в контексте значение `role` ещё не обновилось) — показывает ту же SQL-инструкцию
- `src/lib/api.ts` — `apiFetch` (без токена), `authFetch` (с токеном + авто-refresh при 401), `authFetchForm` (для multipart-загрузки файлов через обычный токен пользователя, без ручной вставки). Полный CRUD: `createProduct`/`updateProduct`/`deleteProduct` (включая `attributeValueIds`), `createCategory`/`deleteCategory`/`getCategoriesFlat`, `createBrand`/`deleteBrand`/`getBrands`, `createAttribute`/`deleteAttribute`/`addAttributeValue`/`deleteAttributeValue`, `getSettings`/`updateSettings`, `createPage`/`updatePage`/`deletePage`/`getPageBySlug`
- **Убран `AdminTokenBox`** (ручная вставка JWT-токена админа в localStorage) — вся админка теперь работает через обычный логин (`useAuth()`/`authFetch`), как и остальной сайт

⚠️ **Упрощение фильтров по атрибутам, важно знать**: и на backend (`query-products.dto.ts`), и на фронте (`AttributeFilters.tsx`) выбранные значения атрибутов работают как единый список с AND-логикой между ВСЕМИ id — в том числе внутри одного атрибута. То есть если пользователь отметит одновременно "Красный" и "Синий" у атрибута "Цвет", результат будет пустым (нужен товар с обоими цветами сразу), а не объединением (что ожидалось бы в типичном фасетном фильтре). Для тестового прототипа это приемлемо и явно закомментировано в коде с обеих сторон; если понадобится классическая OR-внутри-атрибута/AND-между-атрибутами логика — нужно группировать id по `attributeId` перед сборкой запроса.

✅ **Ограничение авторизации, описанное здесь раньше, снято**: access-токен по-прежнему содержит только `{ sub, email }` (роли в JWT нет и не будет — так и задумано, роль всегда проверяется в БД), но теперь `/admin/*` защищён по факту через отдельный запрос `GET /api/users/me` при заходе на сайт: `AdminGuard` скрывает саму админку от CUSTOMER целиком, а не только блокирует действия — см. **раздел 8, пункт 6** (roadmap) с деталями реализации и **раздел 4.1** (рабочий способ выдать роль ADMIN, проверено вручную).

### ❌ Не сделано / заглушки
- `/account` — нет истории заказов на фронте (`GET /api/orders/my` на backend готов, но не выводится)
- `/admin` — нет разделов: заказы, баннеры, отзывы (соответствующие backend-модули тоже ещё заглушки, см. раздел 5)
- Нет sitemap.xml / robots.txt / OpenGraph / JSON-LD

---

## 7. Известные архитектурные решения и их причины (чтобы не переделывать зря)

1. **Корзина только для авторизованных пользователей** (`Cart.userId` обязателен, не nullable). Гостевой корзины (localStorage / session) в схеме БД нет. Если нужна — потребуется либо разрешить анонимные заказы через `sessionId`, либо реализовать гостевую корзину полностью на фронте и мержить её при логине.
2. **Slug генерируется на backend**, а не приходит от клиента — при создании товара/категории/бренда клиент передаёт только `title`/`name`, slug вычисляется и проверяется на уникальность (добавляется `-1`, `-2`...).
3. **RolesGuard делает отдельный запрос в БД** за ролью пользователя на каждый защищённый запрос (JWT payload содержит только `userId`/`email`, не роль) — простое, но не самое быстрое решение. Если появится нагрузка — стоит либо класть роль в JWT payload (тогда придётся инвалидировать токены при смене роли), либо кэшировать в Redis.
4. **Redis и MinIO подняты в docker-compose, но не используются в коде.** Redis — под будущее кэширование каталога/сессий. MinIO — под будущую замену локального диска в `uploads.service.ts` (там явный `// TODO` с указанием использовать `@aws-sdk/client-s3`).
5. **OrderItem хранит снапшот `title`/`price`** на момент заказа (не ссылку на текущую цену товара) — это осознанно, чтобы старые заказы не "переписывались" при изменении цены товара.

---

## 8. Приоритетный roadmap для следующего агента

Порядок предложен по критичности для получения рабочего сквозного сценария "зашёл → выбрал → купил":

1. ✅ **Миграции + первый запуск** — выполнено, backend и frontend подняты и работают.
2. ✅ **product-images модуль** — backend CRUD + `/admin/products/[id]/images` на фронте, реальные фото на главной/каталоге/карточке товара. Раньше использовался костыль (ручная вставка admin-токена в localStorage) — убран, см. п.6 ниже, теперь работает через обычный логин.
3. ✅ **Авторизация на фронте** — `/login`, `/register`, `useAuth()`, токены в localStorage, `authFetch()` с авто-refresh при 401. Роли в самом JWT по-прежнему нет (осознанное решение), но это больше не проблема — см. п.6 ниже (`GET /users/me` + защита `/admin` по роли).
4. ✅ **Корзина на фронте** — `/cart` полностью рабочая (список, +/−, удаление, очистка, сумма), кнопка "В корзину" на странице товара, счётчик в шапке.
5. ✅ **Checkout** — `/checkout` (форма: имя, телефон, email — предзаполняется из аккаунта, способ получения курьер/самовывоз, комментарий) → `POST /api/orders`. После успеха — редирект на `/account?orderSuccess=1&orderNumber=...` с баннером подтверждения. Кнопка "Оформить заказ" на `/cart` теперь ведёт на `/checkout`. `src/lib/cart.ts` — добавлены `createOrder()`/типы `Order`/`OrderItem`/`CreateOrderInput`; `CartProvider` — добавлен `refresh()` в контекст (нужен, чтобы после заказа обновить обнулённую на backend корзину).
5.1. ✅ **Полная тёмная тема "GhostMarket" + админка для карточек товаров** — редизайн всех страниц (`tailwind.config.ts`, `globals.css`, общие компоненты `ProductCard`/`icons.tsx`/`Footer.tsx`), реализовано `/favorites` (было заглушкой), в админке добавлены создание/редактирование товаров (`ProductForm`), категорий и брендов (их не было вообще — только управление фото у существующих товаров). Убран костыль `AdminTokenBox`, вся админка работает через обычный логин. **Выдача роли ADMIN проверена вручную заказчиком и подтверждена рабочей** (раздел 4.1) — полный сквозной сценарий "регистрация → выдать ADMIN → создать категорию/бренд → создать товар → загрузить фото → увидеть в каталоге" пройден целиком.
5.2. ✅ **Реальный логотип + анимации** — заказчик прислал готовый логотип (PNG), из него вырезаны `frontend/public/ghost-icon.png` (иконка-призрак в круге, прозрачный фон, для шапки/футера) и `ghost-logo.png` (полный лок-ап с надписью, для `/login`/`/register`), плюс `app/icon.png` (favicon). Подключены везде вместо прежней плейсхолдер-SVG. Добавлен `src/components/ScrollReveal.tsx` — переиспользуемая обёртка на `IntersectionObserver` (без сторонних анимационных библиотек), даёт fade+slide-up при прокрутке до элемента; применена каскадом (`delay={i*60}`) к сеткам товаров на `/`, `/catalog`, `/favorites`. Hero на главной анимируется отдельно — каскадом при монтировании (CSS `animate-fade-up` из `tailwind.config.ts`), т.к. виден сразу без скролла. `src/components/ProductGallery.tsx` — галерея на странице товара стала интерактивной: миниатюры кликабельны (раньше не были), переключение фото — с плавным crossfade, hover-zoom на главном фото.
6. ✅ **`GET /users/me` + защита `/admin` по роли** — реализовано:
   - Backend: `modules/users/*` — раньше была пустая заготовка (`TODO` в сервисе и контроллере), теперь `UsersController` (`@UseGuards(JwtAuthGuard)`, паттерн 1-в-1 как в `favorites`) отдаёт `GET /api/users/me` → `{ id, email, phone, firstName, lastName, createdAt, role }`, где `role` — строка `'ADMIN' | 'MANAGER' | 'EDITOR' | 'CUSTOMER'` (join на таблицу `roles` через Prisma `select`)
   - Frontend: `src/lib/users.ts` (`getMe()`), `AuthProvider.tsx` теперь после логина/при заходе на сайт с валидным токеном сам подгружает роль и кладёт в контекст (`role`, `roleLoading`, `isStaff = role === 'ADMIN' || role === 'MANAGER'`)
   - `AdminGuard.tsx` — теперь **настоящая** защита по роли, не только по факту логина: CUSTOMER видит понятный экран "Недостаточно прав" с той же SQL-инструкцией вместо самой админки. `roleLoading` инициализируется `true`, чтобы не было вспышки "недостаточно прав" на долю секунды, пока роль ещё грузится
   - Ссылка "Админка" в `Header`/`AuthNav` и в `Footer` теперь показывается только `isStaff` — обычные покупатели её не видят вовсе
   - `/account` показывает бейдж роли рядом с email, плюс быструю ссылку "Перейти в админку" для персонала
   - `AdminForbiddenNotice` (баннер на единичное действие, вернувшее 403) оставлен как есть — на случай, если роль понизили прямо во время активной сессии на сервере, а закэшированный в контексте `role` на фронте ещё не обновился (обновляется по F5)
7. ✅ **Атрибуты/фильтры каталога + правка текстов сайта из админки** — реализовано:
   - Backend: `modules/attributes/*` — раньше пустая заготовка, теперь `GET /attributes` (публично), `POST/DELETE /attributes`, `POST /attributes/:id/values`, `DELETE /attributes/values/:valueId` (ADMIN/MANAGER, удаление — ADMIN). `products` module: `CreateProductDto`/`UpdateProductDto` получили `attributeValueIds?: string[]`, `products.service.ts` синхронизирует связи `ProductAttributeValue` при create/update (полная пересборка через `deleteMany` + `create` при update — если поле передано, даже пустым массивом); `QueryProductsDto` — новый параметр `attributeValueIds` (через запятую), фильтрация в `findAll` через `AND` по каждому id (см. ⚠️ ниже про упрощение)
   - Backend: `modules/settings/*` — было пусто, теперь `GET /settings` (публично, с дефолтами) и `PATCH /settings` (ADMIN/MANAGER) с явным `UpdateSettingsDto` (не произвольный key-value)
   - Backend: `modules/pages/*` — было пусто, теперь полноценный CRUD (`GET /pages`, `GET /pages/:slug` публично; `POST`/`PATCH`/`DELETE` — ADMIN/MANAGER/EDITOR, удаление — ADMIN), генерация slug из title как у products/categories/brands
   - Frontend: `/admin/attributes` (создание атрибутов и их значений), `/admin/pages` (список + инлайн-форма создания/редактирования/удаления страниц), `/admin/settings` (форма редактирования hero-заголовка/подзаголовка, текста в футере, названия магазина, телефона/email/адреса)
   - Frontend: `ProductForm.tsx` — блок выбора значений атрибутов (кнопки-чипы, множественный выбор), `AttributeFilters.tsx` — чекбоксы в сайдбаре `/catalog` (состояние в `?attrs=id1,id2`, сохраняется при смене категории/сортировки), `SortSelect.tsx` переписан, чтобы сохранять все текущие query-параметры при смене сортировки (раньше терял `categoryId`, затем и `attrs`, если бы не переписали)
   - Frontend: `layout.tsx` (server component) при рендере запрашивает `GET /settings` + `GET /pages`, передаёт в `Header`/`Footer`/главную страницу — hero-текст на `/` и текст в футере больше не захардкожены. Публичный роут `/pages/[slug]` для просмотра страниц
   - ⚠️ **Упрощение фильтров**: AND между всеми выбранными id атрибутов, включая значения одного атрибута между собой (не OR, как в типичном фасетном фильтре) — подробности и почему это осознанно см. в разделе 6
7.1. ✅ **Инлайн-редактирование текстов прямо на сайте** — по запросу заказчика ("хочу кликнуть на текст и поменять", а не только через форму `/admin/settings`). Реализовано:
   - `src/components/EditableText.tsx` — переиспользуемый компонент: клик по тексту (только для `isStaff`, и только когда включён глобальный режим редактирования) превращает его в `<input>`/`<textarea>` на месте; сохранение по Enter (или Ctrl/Cmd+Enter для многострочных) либо по уходу фокуса, отмена — Escape. Индикация: пунктирная рамка при наведении, иконка карандаша, зелёная галочка на 1.5 сек после сохранения, текст ошибки при сбое. Для обычных посетителей рендерится как обычный текст без какой-либо разметки — обёртка `canEdit` полностью убирает лишние классы и обработчики
   - `src/components/SiteEditModeProvider.tsx` + `EditModeToggle.tsx` — глобальный переключатель "режима редактирования" (плавающая кнопка внизу справа, видна только персоналу), состояние в `sessionStorage`, чтобы не сбрасывалось при переходах между страницами
   - Подключено: hero-заголовок/подзаголовок на `/` (`src/components/HeroText.tsx`, через `updateSettings`), описание/телефон/email/название магазина в `Footer.tsx` (через `updateSettings`), заголовок и текст статической страницы на `/pages/[slug]` (`src/components/EditablePageContent.tsx`, через `updatePage` — редактирование title не трогает slug, страница остаётся по тому же адресу)
   - Форма `/admin/settings` и раздел `/admin/pages` (п.7 выше) никуда не делись — это дополнительный способ редактирования этих же данных, не замена. Оба пути пишут в одни и те же поля БД
   - ⚠️ **Не синхронизируется между открытыми вкладками/компонентами без перезагрузки**: `EditableText` хранит текущее значение в собственном локальном state, инициализированном из пропа при монтировании. Если открыть `/` и `/pages/о-компании` в двух вкладках и отредактировать одно и то же поле в одной — вторая вкладка узнает об изменении только после обновления страницы. Для тестового прототипа это приемлемо; если понадобится живая синхронизация — нужен глобальный клиентский стор настроек (напр. через `SiteEditModeProvider` или отдельный контекст с `revalidate`/`SWR`), а не пропсы от layout по одному разу за рендер
   - Ранее убранный трюк с частичной покраской hero-заголовка градиентом по слову "GhostMarket" (`text-gradient` вокруг конкретного слова) — **убран из `page.tsx`**, т.к. несовместим со свободным редактированием текста (админ может убрать/переименовать слово). Осталась декоративная точка-бейдж над заголовком вместо этого
7.2. ✅ **Локализация на французский (FR)** — по запросу заказчика: сайт делается для французского клиента. Переведён весь пользовательский текст:
   - Frontend: все страницы (`/`, `/catalog`, `/product/[slug]`, `/cart`, `/checkout`, `/favorites`, `/login`, `/register`, `/account`, `/pages/[slug]`), вся админка (`/admin/*` целиком, включая `ProductForm.tsx`, `AdminGuard.tsx`), все общие компоненты (`Header`, `Footer`, `AuthNav`, `ProductCard` и т.д.). `layout.tsx`: `<html lang="fr">`, `metadata.title`/`description`, `FALLBACK_SETTINGS` — на французском
   - Символ валюты **₽ → €** по всему фронтенду (формат числа остался с точкой как разделителем дробной части, не с запятой — полноценная французская локаль чисел `Intl.NumberFormat('fr-FR')` не подключалась, см. ⚠️ ниже)
   - Backend: пользовательские сообщения об ошибках (`NotFoundException`/`ConflictException`/`BadRequestException`/`ForbiddenException`) во всех реализованных модулях (`auth`, `products`, `categories`, `brands`, `attributes`, `cart`, `orders`, `users`, `pages`, `product-images`, `common/guards/roles.guard.ts`) — переведены на французский. Заглушки (`reviews`/`banners`/`seo`/`search`/`notifications`/`analytics`) не трогали — там нет реального пользовательского текста
   - `modules/settings/settings.service.ts` (`DEFAULTS`) и `prisma/seed.ts` — дефолтные тексты сайта (`shop_name`, `phone`, `address`, `hero_title`, `hero_subtitle`, `footer_description`) переведены на французский, номер телефона и адрес — на французский формат (`+33 ...`, `Paris`)
   - **Важный сопутствующий фикс**: функция `slugify()` (дублируется в `products.service.ts`/`categories.service.ts`/`brands.service.ts`/`pages.service.ts` — 4 независимые копии, не вынесены в общий util) раньше пропускала французские буквы с диакритикой (é, è, ç, à...) — они не входили в `[a-z0-9а-яё]` и превращались в `-`, ломая slug (напр. "Écouteurs" → "couteurs", теряя смысл слова). Добавлен шаг `.normalize('NFD').replace(/[\u0300-\u036f]/g, '')` **до** приведения к нижнему регистру — стандартный приём: раскладывает "é" на "e" + отдельный диакритический знак и вырезает знак. Кириллица в допустимых символах намеренно оставлена (на случай мультиязычного контента в будущем), просто больше не единственный поддерживаемый не-ASCII алфавит
   - ⚠️ **Не переведено осознанно**: код-комментарии для разработчиков (`//` и `/* */`) — оставлены на русском, это внутренняя документация, не текст сайта. Список полностью реализованных вещей, которые НЕ трогали: `docs/PROJECT_STATUS.md`, `README.md` (документация репозитория, не часть сайта)
   - ⚠️ **Что стоит сделать, если понадобится "по-настоящему" французская локаль чисел**: сейчас `{price} €` — это сырая строка из БД (Prisma `Decimal` → строка через API) с точкой как разделителем, напрямую подставленная в JSX. Французский стандарт — запятая и пробел как разделитель тысяч (`1 234,56 €`). Чтобы это сделать правильно, нужно везде, где рендерится цена (сейчас это делается напрямую как `{product.price} €`, без форматирования, в `ProductCard.tsx`, `product/[slug]/page.tsx`, `cart/page.tsx`, `checkout/page.tsx`, `admin/products/page.tsx`), обернуть в `new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(price))` — не сделано в этой сессии, т.к. это отдельная по объёму задача (нужно пройтись по тем же ~6 файлам ещё раз)
8. Оставшиеся backend-модули: `reviews`, `banners`, `seo`. Модуль `users` частично готов (см. п.6) — не хватает редактирования профиля/адресов и списка пользователей для админки.
9. `search`: перейти с `contains` на PostgreSQL Full Text Search (`tsvector`/`tsquery`), как и было в исходном плане.
10. Классическая фасетная логика фильтров (OR внутри атрибута / AND между атрибутами) — если понадобится вместо текущего упрощённого AND-по-всем-id (см. п.7).
11. Замена `uploads` на MinIO/S3, если планируется несколько backend-инстансов.
12. Второй этап по исходному плану: онлайн-оплата, промокоды, бонусы, интеграции (1С/CRM), мобильное API, PWA.

---

## 9. Конвенции для нового кода (чтобы стиль оставался единым)

- Каждый модуль: `dto/create-*.dto.ts`, `dto/update-*.dto.ts` (через `PartialType` из `@nestjs/mapped-types`), `*.service.ts`, `*.controller.ts`, `*.module.ts`.
- Валидация — `class-validator` декораторы прямо в DTO, `ValidationPipe` уже включён глобально (`whitelist: true, forbidNonWhitelisted: true`) в `main.ts`.
- Публичные GET — без гвардов. Изменяющие операции (`POST`/`PATCH`/`DELETE`) для контента, управляемого админкой (каталог, категории, бренды, баннеры и т.д.) — `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`. Для пользовательских данных (корзина, избранное, заказы, отзывы) — только `@UseGuards(JwtAuthGuard)`, доступ проверяется по `userId` из `@CurrentUser()`, а не по роли.
- Slug — всегда генерировать на backend через `slugify()` (копипастить из `products.service.ts`/`categories.service.ts`/`brands.service.ts`, вынести в общий `common/utils/slugify.ts`, если понадобится в 4-м месте).
- Тексты ошибок — на русском (`NotFoundException('Товар не найден')` и т.п.), для консистентности с остальным кодом.
