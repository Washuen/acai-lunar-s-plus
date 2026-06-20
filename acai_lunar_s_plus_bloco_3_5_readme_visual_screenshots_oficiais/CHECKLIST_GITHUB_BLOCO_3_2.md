# CHECKLIST_GITHUB_BLOCO_3_2.md

## Antes de subir

- [ ] Projeto roda localmente
- [ ] `npm run check:all` passou
- [ ] `npm run test:smoke` passou
- [ ] `npm run github:preflight` passou
- [ ] `.env` não existe na pasta ou não será commitado
- [ ] `node_modules/` não será commitado
- [ ] `.env.example` existe
- [ ] README profissional existe
- [ ] docs principais existem
- [ ] render.yaml existe

## Criar repositório

- [ ] Nome: `acai-lunar-s-plus`
- [ ] Público ou privado decidido
- [ ] Sem README automático do GitHub, para evitar conflito
- [ ] Sem `.gitignore` automático, pois o projeto já tem
- [ ] Sem licença automática, se preferir manter o arquivo local/package

## Comandos

```bash
git init
git add .
git commit -m "feat: release Acai Lunar S Plus fullstack system"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/acai-lunar-s-plus.git
git push -u origin main
```

## About do GitHub

Description:

```txt
Fullstack premium açaí delivery platform with customer area, admin dashboard, real checkout, PostgreSQL, Prisma, JWT authentication and Render deploy prep.
```

Topics:

```txt
nodejs
express
postgresql
prisma
jwt-authentication
delivery-platform
restaurant-system
admin-dashboard
customer-area
fullstack
portfolio
render-deploy
acai
```

## Depois de subir

- [ ] README renderiza corretamente
- [ ] Pastas `src`, `public`, `prisma`, `docs`, `scripts` aparecem
- [ ] `.env` não aparece
- [ ] `node_modules` não aparece
- [ ] GitHub About configurado
- [ ] Topics configurados
- [ ] Link de deploy será adicionado depois
