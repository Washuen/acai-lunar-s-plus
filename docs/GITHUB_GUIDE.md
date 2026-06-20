# GITHUB_GUIDE.md — Preparação para GitHub

## Objetivo

Subir o Açaí Lunar S+ Super para o GitHub de forma organizada, profissional e segura.

---

## Nome recomendado do repositório

```txt
acai-lunar-s-plus
```

## Descrição do repositório

```txt
Fullstack premium açaí delivery platform with customer area, admin dashboard, real checkout, PostgreSQL, Prisma, JWT authentication and Render deploy prep.
```

## Website

Depois do deploy, usar o link do Render:

```txt
https://seu-projeto.onrender.com
```

Enquanto ainda não houver deploy, pode deixar em branco ou preencher depois.

---

## Topics recomendados

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

---

## Antes do primeiro commit

Rode:

```bash
npm run check:all
npm run github:preflight
```

Confirme que não existem:

```txt
.env
node_modules/
logs
arquivos temporários
```

O `.env.example` deve existir e o `.env` real não deve ir ao GitHub.

---

## Comandos para subir

### 1. Inicializar Git

```bash
git init
```

### 2. Verificar status

```bash
git status
```

### 3. Adicionar arquivos

```bash
git add .
```

### 4. Criar commit inicial

```bash
git commit -m "feat: release Acai Lunar S Plus fullstack system"
```

### 5. Definir branch principal

```bash
git branch -M main
```

### 6. Conectar ao GitHub

Troque `SEU_USUARIO` pelo usuário correto:

```bash
git remote add origin https://github.com/SEU_USUARIO/acai-lunar-s-plus.git
```

### 7. Enviar

```bash
git push -u origin main
```

---

## Depois de subir

No GitHub, configure:

### About

Description:

```txt
Fullstack premium açaí delivery platform with customer area, admin dashboard, real checkout, PostgreSQL, Prisma, JWT authentication and Render deploy prep.
```

Website:

```txt
https://seu-projeto.onrender.com
```

Topics:

```txt
nodejs, express, postgresql, prisma, jwt-authentication, delivery-platform, restaurant-system, admin-dashboard, customer-area, fullstack, portfolio, render-deploy, acai
```

---

## Arquivos que valorizam o repositório

```txt
README.md
docs/ARCHITECTURE.md
docs/BUSINESS_RULES.md
docs/DEPLOY_GUIDE.md
docs/PROJECT_PRESENTATION.md
docs/TEST_PLAN.md
docs/RELEASE_NOTES_v1.0.0.md
CHECKLIST_FINAL_BLOCO_3_0.md
.env.example
render.yaml
```

---

## Tag e release futura

Depois do deploy validado:

```bash
git tag -a v1.0.0 -m "Acai Lunar S Plus official stable release"
git push origin v1.0.0
```

Criar release:

```txt
Açaí Lunar S Plus v1.0.0 — Official Stable Release
```
