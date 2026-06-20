# TEST_PLAN.md — Açaí Lunar S+ Super

## Objetivo

Garantir que os fluxos críticos do Açaí Lunar estejam estáveis antes do deploy e da release oficial.

## Testes automatizados incluídos

### `npm run check:all`

Executa verificação estrutural:

- arquivos essenciais
- scripts npm
- sintaxe JavaScript dos arquivos principais
- presença de favicon
- presença de frontend/backend/prisma

### `npm run test:smoke`

Executa um teste de ponta a ponta contra o servidor local:

- health check
- login owner
- login cliente
- produtos
- cupom LUNAR15
- criação de pedido real
- pedido em Meus Pedidos
- pedido no Admin
- atualização de status pelo owner
- sincronização do status para o cliente
- relatório administrativo

## Pré-requisitos

```powershell
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Em outro terminal:

```powershell
npm run check:all
npm run test:smoke
```

## Variáveis opcionais do smoke test

```powershell
$env:SMOKE_BASE_URL="http://localhost:3333"
$env:SMOKE_OWNER_EMAIL="owner@acailunar.dev"
$env:SMOKE_OWNER_PASSWORD="123456"
$env:SMOKE_CUSTOMER_EMAIL="cliente@acailunar.dev"
$env:SMOKE_CUSTOMER_PASSWORD="123456"
npm run test:smoke
```

## Observação

O smoke test cria um pedido real no banco local e reduz estoque do produto usado no teste.
Isso é esperado em ambiente de desenvolvimento.
