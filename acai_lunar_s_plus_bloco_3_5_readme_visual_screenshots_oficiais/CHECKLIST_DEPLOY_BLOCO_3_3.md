# CHECKLIST_DEPLOY_BLOCO_3_3.md

## Pré-deploy

- [ ] Projeto está no Bloco 3.2 ou superior
- [ ] `npm run check:all` passou
- [ ] `npm run github:preflight` passou
- [ ] `npm run deploy:preflight` passou
- [ ] Repositório GitHub criado
- [ ] Código enviado ao GitHub
- [ ] `.env` não foi enviado
- [ ] `node_modules/` não foi enviado

## Render PostgreSQL

- [ ] PostgreSQL criado no Render
- [ ] Internal Database URL copiada
- [ ] External Database URL copiada
- [ ] Banco está ativo

## Render Web Service

- [ ] Web Service criado
- [ ] Repositório conectado
- [ ] Build Command configurado
- [ ] Start Command configurado
- [ ] Health Check Path `/api/health` configurado
- [ ] Variáveis adicionadas

## Variáveis

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=Internal Database URL`
- [ ] `JWT_SECRET=segredo forte`
- [ ] `JWT_EXPIRES_IN=7d`

## Prisma produção

- [ ] `npx prisma generate` executado com External Database URL
- [ ] `npx prisma db push` executado com External Database URL
- [ ] `npm run db:seed` executado com External Database URL

## Pós-deploy

- [ ] Site público abre
- [ ] `/api/health` retorna `ok: true`
- [ ] Banco retorna `connected`
- [ ] Produtos aparecem
- [ ] Login owner funciona
- [ ] Login cliente funciona
- [ ] Checkout cria pedido
- [ ] Admin mostra pedido
- [ ] Status sincroniza
- [ ] Relatórios carregam
- [ ] Favicon aparece
- [ ] Mobile ok
- [ ] Console sem erros vermelhos

## Comando de pós-check

```bash
npm run deploy:postcheck -- https://acai-lunar-s-plus.onrender.com
```
