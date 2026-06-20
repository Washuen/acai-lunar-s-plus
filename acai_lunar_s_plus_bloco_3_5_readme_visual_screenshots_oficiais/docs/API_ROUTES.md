# Açaí Lunar S+ — API Routes

Base URL local: `http://localhost:3333/api`

## Health
- `GET /api/health` — verifica servidor e conexão com banco.

## Auth
- `POST /api/auth/register` — cria cliente.
- `POST /api/auth/login` — autentica cliente/admin.
- `GET /api/auth/me` — retorna usuário autenticado.

Credenciais seed:
- Owner: `owner@acailunar.dev` / `123456`
- Cliente: `cliente@acailunar.dev` / `123456`

## Products
- `GET /api/products` — lista produtos ativos.
- `GET /api/products/categories` — lista categorias.
- `POST /api/products` — cria produto. Requer OWNER/ADMIN.
- `PATCH /api/products/:id` — atualiza produto. Requer OWNER/ADMIN.

## Orders
- `POST /api/orders` — cria pedido público ou autenticado.
- `GET /api/orders` — lista todos os pedidos. Requer OWNER/ADMIN.
- `GET /api/orders/mine` — lista pedidos do cliente autenticado.
- `PATCH /api/orders/:id/status` — atualiza status. Requer OWNER/ADMIN.

Status aceitos:
- `RECEIVED`
- `PREPARING`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `CANCELED`

## Coupons
- `POST /api/coupons/validate` — valida cupom.
- `GET /api/coupons` — lista cupons. Requer OWNER/ADMIN.
- `POST /api/coupons` — cria cupom. Requer OWNER/ADMIN.
- `PATCH /api/coupons/:id` — atualiza cupom. Requer OWNER/ADMIN.

## Customers
- `GET /api/customers` — lista clientes. Requer OWNER/ADMIN.
- `PATCH /api/customers/:id` — atualiza cliente. Requer OWNER/ADMIN.

## Settings
- `GET /api/settings/store` — retorna configurações públicas da loja.
- `PUT /api/settings/store` — atualiza configurações. Requer OWNER/ADMIN.

## Reports
- `GET /api/reports/summary` — resumo administrativo, pedidos recentes, baixo estoque e auditoria. Requer OWNER/ADMIN.
