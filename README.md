# Online Store — React + TypeScript + Express + MongoDB

Учебный full-stack интернет-магазин с каталогом товаров, авторизацией, корзиной, оформлением заказов и административным управлением товарами.

Frontend построен на **React + TypeScript** с архитектурой **Feature-Sliced Design (FSD)**. Backend — **Express + TypeScript + MongoDB/Mongoose**.

---

## Содержание

- [Возможности](#возможности)
- [Технологии](#технологии)
- [Маршруты приложения](#маршруты-приложения)
- [Авторизация](#авторизация)
- [Корзина и оформление заказа](#корзина-и-оформление-заказа)
- [Администрирование товаров](#администрирование-товаров)
- [Архитектура frontend](#архитектура-frontend)
- [Архитектура backend](#архитектура-backend)
- [Runtime validation и безопасность](#runtime-validation-и-безопасность)
- [Производительность](#производительность)
- [Адаптивность](#адаптивность)
- [Структура проекта](#структура-проекта)
- [Локальный запуск](#локальный-запуск)
- [Переменные окружения](#переменные-окружения)
- [Основные npm scripts](#основные-npm-scripts)
- [Production configuration](#production-configuration)

---

## Возможности

### Каталог

- просмотр списка товаров;
- поиск товаров с debounce;
- фильтрация по категориям;
- сортировка;
- переход на отдельную страницу товара;
- отображение доступного остатка товара;
- сохранение состояния каталога в query parameters.

### Авторизация

- регистрация по email/password;
- вход и выход из аккаунта;
- восстановление пользовательской сессии после перезагрузки;
- guest-only маршруты `/login` и `/register`;
- role-based доступ к административной странице;
- refresh-сессии с ротацией refresh token.

### Корзина

- добавление товаров;
- изменение количества;
- удаление товаров;
- проверка доступного остатка;
- локальная корзина для гостя;
- серверная корзина для авторизованного пользователя;
- синхронизация корзины после авторизации;
- расчёт количества товаров и общей стоимости.

### Заказы

- оформление заказа из корзины;
- проверка актуальных остатков перед checkout;
- обработка конфликтов при недостаточном количестве товара;
- подтверждение checkout;
- защита от повторного списания остатков при повторном подтверждении.

### Admin

Для пользователя с ролью `admin` доступен маршрут:

```text
/admin/products
```

Возможности:

- просмотр списка товаров;
- поиск;
- пагинация;
- создание товара;
- редактирование товара;
- удаление товара с подтверждением;
- выбор категории;
- генерация slug;
- управление ценой, остатком и изображением.

---

## Технологии

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Redux Toolkit
- RTK Query
- React Redux
- Material UI
- Emotion
- React Hook Form
- Yup
- SCSS Modules
- Sass

### Backend

- Node.js
- TypeScript
- Express 5
- MongoDB
- Mongoose
- JSON Web Token
- bcrypt
- cookie-parser
- Helmet
- express-rate-limit
- compression
- CORS
- dotenv

---

## Маршруты приложения

### Public

```text
/                 — каталог
/product/:slug    — страница товара
/cart             — корзина
/login            — вход
/register         — регистрация
*                 — Not Found
```

### Guest only

```text
/login
/register
```

Авторизованный пользователь при прямом переходе на эти маршруты перенаправляется на `/`.

### Admin only

```text
/admin/products
```

Маршрут защищён последовательно:

```text
RequireAuth
    ↓
RequireRole("admin")
    ↓
AdminProductsPage
```

---

## Авторизация

Backend использует access/refresh JWT-сессию.

Основная схема:

```text
login / register
        ↓
access token + refresh session
        ↓
authenticated API requests
        ↓
access token expired
        ↓
refresh
        ↓
new session tokens
```

Refresh token хранится в cookie с настройками:

- `httpOnly`;
- `sameSite: strict`;
- `secure` в production;
- ограниченный path `/api/auth`.

Refresh token ротируется при обновлении сессии.

На frontend состояние пользователя хранится в Redux, а при старте приложения выполняется восстановление сессии.

Приватные маршруты защищены через `RequireAuth` и `RequireRole`, а маршруты авторизации — через `RequireGuest`.

---

## Корзина и оформление заказа

Корзина поддерживает два режима.

### Guest

Корзина хранится локально в браузере.

### Authenticated user

Корзина сохраняется через backend API.

После авторизации выполняется синхронизация локальной и серверной корзины.

Backend повторно проверяет:

- идентификаторы товаров;
- количество;
- существование товара;
- доступный stock.

Невалидный HTTP payload не трактуется как пустая корзина и не может случайно удалить существующее содержимое cart.

При checkout backend повторно проверяет актуальные остатки товаров.

---

## Администрирование товаров

Admin API отделён от публичного каталога.

Для product input выполняется runtime validation:

- `title`;
- `slug`;
- `description`;
- `price`;
- `stock`;
- `images`;
- `categoryId`;
- MongoDB identifiers.

HTTP DTO отделены от Mongoose persistence documents, поэтому клиенту не возвращаются внутренние поля вроде:

```text
__v
createdAt
updatedAt
```

если они не являются частью API contract.

---

## Архитектура frontend

Frontend организован по Feature-Sliced Design:

```text
src/
├── app/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

### `app`

Инициализация приложения:

- Redux store;
- router;
- theme;
- auth bootstrap;
- синхронизация auth/cart;
- ErrorBoundary;
- global styles.

### `pages`

Страницы приложения:

- catalog;
- product;
- cart;
- login;
- register;
- admin products;
- not found.

### `widgets`

Крупные UI-блоки:

- application header;
- product grid;
- category sidebar;
- search bar;
- sort controls;
- cart item;
- cart summary.

### `features`

Пользовательские сценарии:

- auth;
- cart;
- orders;
- admin products.

### `entities`

Доменные сущности:

- products;
- categories.

### `shared`

Переиспользуемые элементы:

- UI components;
- hooks;
- API utilities;
- type guards / helpers;
- styles;
- assets.

Используются aliases:

```text
@app
@pages
@widgets
@features
@entities
@shared
```

Внутри одного slice используются относительные imports, между слоями — публичные API и aliases.

---

## Архитектура backend

Backend организован по предметным модулям:

```text
api/src/
├── config/
├── modules/
│   ├── auth/
│   ├── cart/
│   ├── categories/
│   ├── orders/
│   └── products/
├── scripts/
├── shared/
└── app.ts
```

### `modules`

Каждый модуль содержит относящиеся к нему:

- routes;
- Mongoose models;
- DTO;
- domain/service logic.

### `shared`

Общая backend-инфраструктура:

- auth middleware;
- JWT helpers;
- Express type augmentation;
- MongoDB error helpers;
- product search helpers.

Backend написан на TypeScript и собирается в:

```text
api/dist/
```

---

## Runtime validation и безопасность

TypeScript проверяет код во время разработки, но входящие HTTP данные считаются `unknown` до runtime-проверки.

Backend валидирует внешние данные до передачи их в domain/persistence layer.

Проверяются, в частности:

- auth input;
- cart payload;
- order identifiers;
- product identifiers;
- category identifiers;
- admin product payload.

Невалидные клиентские данные возвращают `4xx`, а не приводят к Mongoose cast errors и случайным `500`.

### Security

В API используются:

- Helmet;
- общий rate limiter;
- отдельные rate limits для login/register/refresh;
- ограничение JSON body;
- `httpOnly` refresh cookie;
- `sameSite: strict`;
- `secure` cookie в production;
- раздельные access/refresh JWT secrets;
- generic response для внутренних `5xx` ошибок;
- production guards для обязательной конфигурации.

---

## Производительность

### Route-level lazy loading

Основные pages загружаются через:

```ts
lazy(...)
```

и:

```tsx
Suspense;
```

Это уменьшает initial JavaScript bundle и создаёт отдельные route chunks.

### Bundle analysis

Для анализа production bundle используется:

```bash
npm run analyze
```

Команда создаёт:

```text
client/dist/stats.html
```

с treemap через `rollup-plugin-visualizer`.

Ручной `manualChunks` не используется: текущего автоматического code splitting Vite/Rollup достаточно.

### Images

Для изображений товаров используются browser loading hints:

- lazy loading для карточек/корзины;
- eager loading для главного изображения ProductPage;
- `decoding="async"`;
- повышенный fetch priority для основного изображения товара.

### Source maps

Production build создаёт hidden source maps.

---

## Адаптивность

Интерфейс адаптирован под:

- desktop;
- tablet portrait;
- tablet landscape;
- smartphone portrait.

Основные layout breakpoints проекта:

```text
640px
768px
1024px
```

Они используются по необходимости конкретного layout, а не как обязательная универсальная сетка.

### Smartphone

На узкой ширине:

- header использует burger navigation;
- имя авторизованного пользователя остаётся вне burger-menu;
- catalog переходит в одну колонку;
- ProductPage становится вертикальным;
- cart items становятся вертикальными;
- CartSummary занимает доступную ширину;
- admin table использует локальный horizontal scroll;
- формы не создают horizontal overflow.

### Tablet

На tablet portrait admin form располагается над таблицей.

На более широкой tablet/desktop ширине admin page переходит к layout:

```text
form | products
```

---

## ErrorBoundary

Приложение содержит собственный React ErrorBoundary.

При render error показывается fallback с возможностью перезагрузить страницу.

Error state сбрасывается при изменении:

```text
pathname
search
```

При обычной навигации приложение при этом не remount'ится и auth bootstrap не запускается повторно.

---

## Структура проекта

```text
online-store/
├── api/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── ...
```

Проект является monorepo без общего root `package.json`: frontend и backend устанавливаются и запускаются отдельно.

---

## Локальный запуск

### Требования

Необходимы:

- Node.js;
- npm;
- MongoDB.

### 1. Клонировать репозиторий

```bash
git clone https://github.com/l893/online-store.git
cd online-store
```

### 2. Backend

Перейти в API:

```bash
cd api
npm install
```

Создать локальный:

```text
api/.env
```

на основе:

```text
api/.env.example
```

Пример для локальной MongoDB без авторизации:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shop
JWT_ACCESS_SECRET=local_access_secret
JWT_REFRESH_SECRET=local_refresh_secret
```

Запустить development server:

```bash
npm run dev
```

API по умолчанию:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

### 3. Frontend

В другом терминале:

```bash
cd client
npm install
```

При локальном запуске frontend и backend на разных портах создайте локальный файл:

```text
client/.env.local
```

с:

```env
VITE_API_BASE=http://localhost:3000/api
```

После этого:

```bash
npm run dev
```

Frontend Vite development server обычно доступен по адресу:

```text
http://localhost:5173
```

Development CORS backend разрешает этот origin.

---

## Переменные окружения

### API

Файл-пример:

```text
api/.env.example
```

Переменные:

```text
PORT
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
```

### Client

Frontend поддерживает:

```text
VITE_API_BASE
```

Если переменная не задана, используется:

```text
/api
```

Такой вариант подходит для same-origin production deployment.

---

## Основные npm scripts

### Client

Из директории:

```bash
cd client
```

#### Development

```bash
npm run dev
```

#### TypeScript check

```bash
npm run typecheck
```

#### ESLint

```bash
npm run lint
```

#### Production build

```bash
npm run build
```

#### Preview production build

```bash
npm run preview
```

#### Bundle analysis

```bash
npm run analyze
```

#### Format source

```bash
npm run format
```

---

### API

Из директории:

```bash
cd api
```

#### Development

```bash
npm run dev
```

#### TypeScript check

```bash
npm run typecheck
```

#### Build

```bash
npm run build
```

#### Start compiled API

```bash
npm start
```

#### Remove expired refresh tokens

```bash
npm run cleanup:tokens
```

#### Seed

```bash
npm run seed
```

`seed` изменяет данные categories/products в подключённой базе.

Запуск seed в:

```text
NODE_ENV=production
```

заблокирован приложением.

Перед локальным запуском seed необходимо убедиться, что `MONGODB_URI` указывает именно на нужную development database.

---

## Production configuration

В production environment необходимо явно установить:

```text
NODE_ENV=production
```

Также обязательны:

```text
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
```

Production API использует fail-fast configuration: при отсутствии обязательных значений приложение не должно стартовать с development fallback.

JWT access/refresh secrets должны быть разными и достаточно длинными.

Refresh cookie в production получает:

```text
Secure
HttpOnly
SameSite=Strict
```

Текущая frontend конфигурация поддерживает same-origin API через:

```text
/api
```

Если frontend и API будут опубликованы на разных origins, необходимо отдельно настроить:

- `VITE_API_BASE`;
- production CORS;
- cookie policy;
- proxy topology / `trust proxy`.

Эти настройки должны соответствовать конкретному hosting provider.
