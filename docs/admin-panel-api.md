# Admin Panel API (единый список)

Актуально на 2026-05-05.  
Бэкенд: FeathersJS REST.

Основной источник по всем маршрутам, ролям, payload и ответам:

- [docs/api-complete-contract.md](/Users/sarvat/WebstormProjects/agrostock-backend/docs/api-complete-contract.md)

Для админки добавляются обязательные ограничители доступа (`admin`, `moderator`, `superadmin`) и разбор бизнес-ответов из единого контракта.

## Базовые правила

- Авторизация: `Authorization: Bearer <JWT>`
- `Content-Type: application/json` для `POST/PATCH/PUT`
- Базовые CRUD-методы Feathers для большинства сервисов:
  - `GET /service` (`find`)
  - `GET /service/:id` (`get`)
  - `POST /service` (`create`)
  - `PATCH /service/:id` (`patch`)
  - `PUT /service/:id` (`update`)
  - `DELETE /service/:id` (`remove`)

### Обязательные headers (для админки)

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

Для `GET` обычно достаточно только `Authorization`.

## Авторизация

- `/authentication` - login/JWT операции (Feathers auth)

### Пример запроса логина

```http
POST /authentication
Content-Type: application/json
```

```json
{
  "strategy": "local",
  "email": "admin@example.com",
  "password": "secret"
}
```

### Пример ответа логина

```json
{
  "accessToken": "<jwt>",
  "authentication": {
    "strategy": "local"
  },
  "user": {
    "id": 1,
    "type": "admin"
  }
}
```

## Staff/Admin маршруты (явно ограничены ролями)

- `/categories` - `admin`, `superadmin`
- `/cities` - `admin`, `superadmin`
- `/countries` - `admin`, `superadmin`
- `/news` - `admin`, `superadmin`
- `/tariffs` - `admin`, `superadmin`
- `/chat-blocked-words` - `admin`, `moderator`, `superadmin`
- `/chat-message-moderation` - `admin`, `moderator`, `superadmin`
- `/product-moderation` - `admin`, `moderator`, `superadmin`
- `/block-user` - `admin`, `moderator`, `superadmin`
- `/truck-moderation` - `admin`, `moderator`, `superadmin`

## Формат запросов/ответов для админ API

## 1) `GET /service` (find)

### Request

```http
GET /products?$limit=20&$skip=0
Authorization: Bearer <JWT>
```

### Response

```json
{
  "total": 120,
  "limit": 20,
  "skip": 0,
  "data": []
}
```

## 2) `GET /service/:id` (get)

### Request

```http
GET /products/101
Authorization: Bearer <JWT>
```

### Response

```json
{
  "id": 101
}
```

## 3) `POST /service` (create)

### Request

```http
POST /news
Authorization: Bearer <JWT>
Content-Type: application/json
```

```json
{
  "title": "Новая новость",
  "text": "Текст новости"
}
```

### Response

```json
{
  "id": 55,
  "title": "Новая новость",
  "text": "Текст новости"
}
```

## 4) `PATCH /service/:id` (patch)

### Request

```http
PATCH /product-moderation/1
Authorization: Bearer <JWT>
Content-Type: application/json
```

```json
{
  "status": "approved",
  "comment": "Проверено модератором"
}
```

### Response

```json
{
  "id": 1,
  "status": "approved",
  "comment": "Проверено модератором"
}
```

## 5) `DELETE /service/:id` (remove)

### Request

```http
DELETE /news/55
Authorization: Bearer <JWT>
```

### Response

```json
{
  "id": 55
}
```

## Типовые ответы с ошибкой

### `401 Unauthorized`

```json
{
  "name": "NotAuthenticated",
  "message": "Invalid authentication token",
  "code": 401
}
```

### `403 Forbidden`

```json
{
  "name": "Forbidden",
  "message": "You are not allowed to access this resource",
  "code": 403
}
```

### `400 Bad Request`

```json
{
  "name": "BadRequest",
  "message": "Validation failed",
  "code": 400,
  "errors": {}
}
```

## Все зарегистрированные API endpoints

- `/api/filter-templates`
- `/api/listings`
- `/bank-accounts`
- `/block-user`
- `/categories`
- `/categories-translates`
- `/chat-blocked-words`
- `/chat-company`
- `/chat-info`
- `/chat-message-moderation`
- `/chats`
- `/chats-messages`
- `/cities`
- `/common-chat-companies`
- `/common-chat-messages`
- `/companies`
- `/companies-balances`
- `/companies-documents`
- `/companies-feedbacks`
- `/company-email-confirm`
- `/countries`
- `/deal-cancel-request`
- `/deal-safe-request`
- `/deals`
- `/deals-documents`
- `/deals-transactions`
- `/exchange-rates`
- `/homepage/catalog-showcase`
- `/homepage/catalog-showcase/favorite-toggle`
- `/info/counters`
- `/info/profile-menu`
- `/info/searchs`
- `/languages`
- `/legal-entity-check`
- `/news`
- `/notifications`
- `/password-reset`
- `/product-moderation`
- `/products`
- `/products-changes`
- `/products-offers`
- `/products-photos`
- `/products-promotions`
- `/products-reports`
- `/products-saved`
- `/products-views`
- `/send-email`
- `/stats/line`
- `/stats/line-transactions`
- `/stats/pie`
- `/tariffs`
- `/tender-define-winner`
- `/tenders`
- `/tenders-bets`
- `/tenders-changes`
- `/tenders-documents`
- `/tenders-photos`
- `/tenders-reports`
- `/transactions`
- `/trucks`
- `/truck-moderation`
- `/trucks-dictionaries`
- `/uploads`
- `/users`

## Модерация trucks (новое)

### Роуты админ-панели

- `GET /truck-moderation`
- `GET /truck-moderation/:id`
- `POST /truck-moderation`
- `PATCH /truck-moderation/:id`
- `PUT /truck-moderation/:id`
- `DELETE /truck-moderation/:id`

### Что происходит

- При `create/update/patch` грузовика пользователем типа `company` грузовик помечается как `moderationStatus = pending`.
- Автоматически создается запись в `/truck-moderation` со статусом `pending`.
- Админ/модератор меняет статус в `/truck-moderation`.
- После изменения модерации синхронизируется `trucks.moderationStatus` и `trucks.moderationComment`.
- Для `rejected`/`banned` грузовик автоматически переводится в `status = offline`.

### Контракт `/trucks` для админки (`#/trucks/edit/:id`)

- `GET /trucks/:id` всегда возвращает плоский объект в одном формате (без оберток `{ truck }`/`{ data }`).
- `PATCH /trucks/:id` принимает канонические поля и legacy-алиасы.
- Канонический ответ использует `moderationComment`; для обратной совместимости также дублируется `comment`.

Канонические поля:

- `id`
- `name`
- `number`
- `owner_name`
- `contacts`
- `brand`
- `model`
- `year`
- `bodyType`
- `capacity`
- `volume`
- `countryId`
- `cityId`
- `address`
- `status` (`active | offline | banned`)
- `moderationStatus` (`pending | approved | rejected | banned`)
- `moderationComment` (string, может быть пустой)
- `country` (`object | null`)
- `city` (`object | null`)
- `photoId` (`integer | null`)
- `photosIds` (`number[]`)
- `photo` (`{ id, path } | null`, optional)
- `photos` (`[{ id, path }]`, optional)

Legacy-алиасы (вход PATCH/create):

- `comment` -> `moderationComment` (если переданы оба, приоритет у `moderationComment`)
- `transport_type` -> `bodyType`
- `location` -> `address`
- `country_id` -> `countryId`
- `city_id` -> `cityId`
- `name`/`vehicle_name` поддерживаются как совместимые алиасы для названия транспорта
- `owner_name`/`ownerName`/`contactName` поддерживаются как алиасы для контактного имени
- `contacts`/`contactPhone` поддерживаются как алиасы для контактного номера
- `photoId` — канонически для одного фото, `photosIds` — канонически для нескольких фото.
- `status: online` поддерживается как алиас и нормализуется в `active`

Дефолты:

- `status: active`
- `moderationStatus: pending`
- `moderationComment: ''`

## Примечание

Часть сервисов имеет дополнительную бизнес-авторизацию в hooks (например, доступ только к своим данным, ограничения по операциям, кастомные query-параметры). Для админ-панели этого списка достаточно как полного реестра доступных API путей.

## Products Offers (`/products-offers`)

### Create (`POST /products-offers`) schema

- `productId`: `number` (required)
- `price`: `number|string` (required, must be `> 0`)
- `batchSize`: `number|string` (required)
- `delivery`: `'pickup' | 'delivery'` (required)
- `isDeliveryIncludesInPrice`: `boolean` (optional)
- `deliveryPrice`: `number|string` (optional)
- `countryId`: `number` (optional)
- `cityId`: `number` (optional)
- `address`: `string` (optional)
- `isSafe`: `boolean` (optional)

### Patch (`PATCH /products-offers/:id`) schema

- `price`: `number|string` (optional, if present must be `> 0`)
- Остальные поля сохраняют прежнее поведение и совместимость.

### Validation

- На `create` поле `price` обязательно.
- `price` может быть строкой, но будет приведен к `number`, если это валидное число.
- Невалидный `price` или `price <= 0` -> `400 BadRequest`.

### Create example

```json
{
  "productId": 101,
  "price": "1250.50",
  "batchSize": "1000",
  "delivery": "pickup",
  "isDeliveryIncludesInPrice": false,
  "deliveryPrice": "0",
  "countryId": 1,
  "cityId": 15,
  "address": "Dushanbe",
  "isSafe": false
}
```

### Response example (`get/find/create/patch`)

```json
{
  "id": 77,
  "productId": 101,
  "companyId": 55,
  "price": "1250.50",
  "batchSize": "1000.00",
  "delivery": "pickup",
  "isDeliveryIncludesInPrice": false,
  "deliveryPrice": "0.00",
  "countryId": 1,
  "cityId": 15,
  "address": "Dushanbe",
  "isSafe": false,
  "status": "new",
  "createdAt": "2026-05-06T00:00:00.000Z",
  "updatedAt": "2026-05-06T00:00:00.000Z"
}
```
