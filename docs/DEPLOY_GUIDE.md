# DEPLOY_GUIDE.md — Deploy no Render

## Objetivo

Publicar o Açaí Lunar S+ Super com:

- Web Service Node.js
- PostgreSQL em produção
- variáveis de ambiente seguras
- Prisma Client gerado
- banco sincronizado
- seed inicial
- link público para portfólio

---

## 1. Preparar repositório

Antes do deploy, confirme:

```bash
npm run check:all
```

O projeto deve conter:

```txt
package.json
.env.example
.gitignore
render.yaml
src/
public/
prisma/
docs/
README.md
```

O `.env` não deve ser enviado ao GitHub.

---

## 2. Criar PostgreSQL no Render

No Render:

1. New
2. PostgreSQL
3. Defina nome do banco
4. Copie a `External Database URL`

Essa URL será usada para aplicar Prisma localmente.

---

## 3. Criar Web Service

No Render:

1. New
2. Web Service
3. Conectar repositório GitHub
4. Configurar ambiente Node

Build Command:

```bash
npm install && npx prisma generate
```

Start Command:

```bash
npm run start
```

---

## 4. Variáveis de ambiente

No Web Service, configurar:

```env
NODE_ENV=production
DATABASE_URL=URL_INTERNA_OU_EXTERNA_DO_POSTGRES_RENDER
JWT_SECRET=SEGREDO_FORTE_DE_PRODUCAO
JWT_EXPIRES_IN=7d
```

Use um segredo forte para `JWT_SECRET`.

---

## 5. Aplicar Prisma em produção

No terminal local, usando a URL externa do banco Render:

### PowerShell

```powershell
$env:DATABASE_URL="COLE_A_EXTERNAL_DATABASE_URL_DO_RENDER"
npx prisma generate
npx prisma db push
npm run db:seed
```

### Bash

```bash
DATABASE_URL="COLE_A_EXTERNAL_DATABASE_URL_DO_RENDER" npx prisma generate
DATABASE_URL="COLE_A_EXTERNAL_DATABASE_URL_DO_RENDER" npx prisma db push
DATABASE_URL="COLE_A_EXTERNAL_DATABASE_URL_DO_RENDER" npm run db:seed
```

---

## 6. Testar produção

Acesse:

```txt
https://seu-projeto.onrender.com
https://seu-projeto.onrender.com/api/health
```

Teste:

- login owner
- login cliente
- cardápio
- cupom
- checkout
- admin
- alteração de status
- área cliente
- relatórios
- favicon
- responsividade

---

## 7. Checklist pós-deploy

- [ ] Site público abre
- [ ] API health retorna `ok: true`
- [ ] Banco conectado
- [ ] Imagens carregam
- [ ] CSS carrega
- [ ] JS carrega
- [ ] Favicon aparece
- [ ] Login funciona
- [ ] Checkout cria pedido
- [ ] Admin lista pedido
- [ ] Status sincroniza com cliente
- [ ] Relatórios carregam
- [ ] Sem erro vermelho no console
