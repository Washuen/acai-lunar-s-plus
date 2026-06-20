# Deploy Plan — Açaí Lunar S+

## Render Web Service
- Runtime: Node
- Build Command: `npm install && npx prisma generate`
- Start Command: `npm run start`

## Environment variables
- `NODE_ENV=production`
- `PORT=3333`
- `DATABASE_URL=<Internal PostgreSQL URL>`
- `JWT_SECRET=<strong random secret>`
- `JWT_EXPIRES_IN=7d`

## Database setup
Depois de criar o PostgreSQL no Render, rode localmente com a External Database URL:

```powershell
$env:DATABASE_URL="postgresql://..."
npx prisma db push
npm run db:seed
```

## Production checklist
- API health: `/api/health`
- Home: `/`
- Produtos: `/api/products`
- Login owner: `owner@acailunar.dev` / `123456`
- Cupom: `LUNAR15`
