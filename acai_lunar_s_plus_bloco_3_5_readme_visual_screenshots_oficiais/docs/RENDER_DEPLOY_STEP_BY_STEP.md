# RENDER_DEPLOY_STEP_BY_STEP.md — Açaí Lunar S+ Super

## Objetivo

Publicar o Açaí Lunar S+ Super no Render usando:

- Web Service Node.js
- PostgreSQL Render
- Prisma
- seed de produção
- health check
- link público para portfólio

---

## 1. Antes de começar

Na pasta do projeto, rode:

```bash
npm install
npm run check:all
npm run github:preflight
npm run deploy:preflight
```

Todos devem passar antes do deploy.

---

## 2. Subir o projeto para GitHub

O Render vai puxar o código do GitHub.  
Use o guia:

```txt
docs/GITHUB_GUIDE.md
```

Depois de subir, confirme que o repositório contém:

```txt
src/
public/
prisma/
docs/
scripts/
package.json
render.yaml
README.md
.env.example
```

E que **não contém**:

```txt
.env
node_modules/
```

---

## 3. Criar PostgreSQL no Render

No Render:

1. Clique em **New**
2. Escolha **PostgreSQL**
3. Nome sugerido:

```txt
acai-lunar-db
```

4. Região: escolha a mesma região do Web Service
5. Plano: Free, se disponível
6. Clique em Create Database

Depois copie:

```txt
Internal Database URL
External Database URL
```

Uso recomendado:

- `Internal Database URL`: para variável `DATABASE_URL` no Web Service
- `External Database URL`: para rodar `prisma db push` e `seed` pelo seu computador

---

## 4. Criar Web Service

No Render:

1. Clique em **New**
2. Escolha **Web Service**
3. Conecte o repositório GitHub
4. Nome sugerido:

```txt
acai-lunar-s-plus
```

5. Runtime:

```txt
Node
```

6. Build Command:

```bash
npm install && npx prisma generate
```

7. Start Command:

```bash
npm run start
```

8. Health Check Path:

```txt
/api/health
```

---

## 5. Variáveis de ambiente no Render

Configure no Web Service:

```env
NODE_ENV=production
DATABASE_URL=COLE_A_INTERNAL_DATABASE_URL_DO_POSTGRES_RENDER
JWT_SECRET=CRIE_UM_SEGREDO_FORTE
JWT_EXPIRES_IN=7d
```

Sugestão de `JWT_SECRET`:

```txt
acai_lunar_s_plus_prod_uma_chave_bem_grande_e_unica_2026
```

Não use o mesmo segredo simples do desenvolvimento.

---

## 6. Aplicar Prisma no banco de produção

No seu computador, dentro da pasta do projeto, use a **External Database URL** do PostgreSQL Render.

### PowerShell

```powershell
$env:DATABASE_URL="COLE_A_EXTERNAL_DATABASE_URL_DO_RENDER"
npx prisma generate
npx prisma db push
npm run db:seed
```

### Git Bash/Bash

```bash
DATABASE_URL="COLE_A_EXTERNAL_DATABASE_URL_DO_RENDER" npx prisma generate
DATABASE_URL="COLE_A_EXTERNAL_DATABASE_URL_DO_RENDER" npx prisma db push
DATABASE_URL="COLE_A_EXTERNAL_DATABASE_URL_DO_RENDER" npm run db:seed
```

---

## 7. Testar o deploy

Acesse:

```txt
https://acai-lunar-s-plus.onrender.com
```

Health:

```txt
https://acai-lunar-s-plus.onrender.com/api/health
```

Também pode rodar:

```bash
node scripts/render-postdeploy-check.js https://acai-lunar-s-plus.onrender.com
```

Ou:

```bash
npm run deploy:postcheck -- https://acai-lunar-s-plus.onrender.com
```

---

## 8. Teste manual em produção

Teste no link do Render:

- [ ] site abre
- [ ] favicon aparece
- [ ] imagens carregam
- [ ] login owner funciona
- [ ] login cliente funciona
- [ ] cardápio aparece
- [ ] cupom `LUNAR15` aplica
- [ ] checkout cria pedido
- [ ] Admin mostra pedido
- [ ] owner altera status
- [ ] cliente vê status atualizado
- [ ] relatórios carregam
- [ ] mobile não quebra

---

## 9. Credenciais demo de produção

Após rodar seed:

```txt
Owner:
owner@acailunar.dev
123456

Cliente:
cliente@acailunar.dev
123456
```

Depois do deploy final, considere trocar senhas demo caso queira reforçar segurança.
