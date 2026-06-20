# 🌙 Açaí Lunar S+ Super

![Açaí Lunar S+ Super](docs/readme-assets/cover.png)

<p align="center">
  <strong>Plataforma fullstack premium de delivery de açaí</strong><br/>
  Cardápio, carrinho, checkout real, área do cliente, painel administrativo, relatórios e deploy em produção.
</p>

<p align="center">
  <a href="https://acai-lunar-s-plus.onrender.com">🚀 Deploy</a>
  ·
  <a href="https://github.com/Washuen/acai-lunar-s-plus">💻 GitHub</a>
  ·
  <a href="#-credenciais-demo">🔐 Credenciais demo</a>
  ·
  <a href="#-stack">🧱 Stack</a>
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-111?style=for-the-badge&logo=node.js" />
  <img alt="Express" src="https://img.shields.io/badge/Express-API-111?style=for-the-badge&logo=express" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-111?style=for-the-badge&logo=postgresql" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-111?style=for-the-badge&logo=prisma" />
  <img alt="Render" src="https://img.shields.io/badge/Render-Deploy-111?style=for-the-badge&logo=render" />
</p>

---

## ✨ Visão geral

O **Açaí Lunar S+ Super** é uma plataforma fullstack de delivery criada para simular uma marca premium real de açaí.  
O projeto une uma vitrine visual forte com funcionalidades reais de produto: autenticação, checkout, pedidos no banco, área do cliente, painel administrativo, gestão de produtos/cupons e relatórios.

![Screenshots oficiais](docs/readme-assets/screenshots-overview.png)

---

## 🚀 Deploy

```txt
https://acai-lunar-s-plus.onrender.com
```

Health check:

```txt
https://acai-lunar-s-plus.onrender.com/api/health
```

---

## 🔐 Credenciais demo

### Cliente

```txt
E-mail: cliente@acailunar.dev
Senha: 123456
```

### Owner/Admin

```txt
E-mail: owner@acailunar.dev
Senha: 123456
```

---

## 🧭 Funcionalidades principais

### Vitrine pública

- Home premium com identidade visual própria.
- Cardápio com produtos reais vindos da API.
- Busca e categorias.
- Combos comerciais.
- Seção de delivery.
- Momentos Lunares.
- Layout responsivo.

### Carrinho e checkout

- Adicionar/remover produtos.
- Quantidades.
- Cupom `LUNAR15`.
- Cálculo de total.
- Checkout com dados do cliente.
- Pedido real salvo no banco.
- Acompanhamento de status.

### Área do cliente

- Login e cadastro.
- Histórico de pedidos.
- Status sincronizado com o admin.
- Perfil e endereço.
- Repetir pedido.
- Acompanhar pedido.

### Painel administrativo

- Dashboard operacional.
- Gestão de pedidos.
- Alteração de status.
- Gestão de produtos.
- Estoque.
- Cupons.
- Clientes.
- Relatórios.
- Auditoria recente.

---

## 🧱 Stack

```txt
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express
Banco: PostgreSQL
ORM: Prisma
Auth: JWT
Deploy: Render
Banco em produção: Neon
Documentação: Markdown
```

![Arquitetura](docs/readme-assets/architecture.png)

---

## 🗂️ Estrutura do projeto

```txt
.
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── assets/
├── src/
│   ├── server.js
│   ├── routes/
│   ├── middlewares/
│   └── services/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── scripts/
│   ├── production-check.js
│   └── production-fullcheck.js
├── docs/
│   ├── readme-assets/
│   ├── screenshots/
│   └── RELATORIO_POS_DEPLOY_BLOCO_3_4.md
├── render.yaml
└── package.json
```

---

## ⚙️ Rodando localmente

Clone o repositório:

```bash
git clone https://github.com/Washuen/acai-lunar-s-plus.git
cd acai-lunar-s-plus
```

Instale as dependências:

```bash
npm install
```

Crie o `.env`:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL="postgresql://postgres:123456@localhost:5433/acai_lunar?schema=public"
JWT_SECRET="acai_lunar_super_secret_2026"
JWT_EXPIRES_IN="7d"
```

Prepare o banco:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Inicie:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3333
```

---

## ✅ Validação de produção

Teste rápido:

```bash
npm run production:check -- https://acai-lunar-s-plus.onrender.com
```

Teste completo:

```bash
npm run production:fullcheck -- https://acai-lunar-s-plus.onrender.com
```

Esses comandos validam API, banco, textos publicados, login, cupom, checkout real, pedidos, admin, status e relatórios.

---

## 📸 Screenshots oficiais

A pasta `docs/screenshots` está preparada para receber os prints reais do projeto publicado.

Lista recomendada:

```txt
01-home.png
02-cardapio.png
03-monte-seu-acai.png
04-carrinho.png
05-checkout.png
06-area-cliente.png
07-acompanhamento.png
08-admin-resumo.png
09-admin-pedidos.png
10-admin-produtos.png
11-admin-cupons.png
12-relatorios.png
13-mobile-home.png
14-mobile-carrinho.png
```

---

## 🧪 Status do projeto

```txt
Deploy: aprovado
Banco em produção: aprovado
Checkout real: aprovado
Área do cliente: aprovada
Admin: aprovado
Relatórios: aprovados
Documentação: profissional
Status: S+ / obra-prima de portfólio
```

---



---



---

## 🏷️ Release oficial

Versão estável:

```txt
v1.0.0 — Official Stable Release
```

Arquivos de release:

```txt
RELEASE_NOTES_v1.0.0.md
CHECKLIST_RELEASE_v1.0.0.md
docs/RELEASE_GUIDE.md
```

Comandos para criar a tag:

```bash
git tag -a v1.0.0 -m "Açaí Lunar S+ Super official stable release"
git push origin v1.0.0
```

## 🏁 GitHub final

Este repositório foi preparado para apresentação pública com:

```txt
README visual
Deploy público
Credenciais demo
Documentação técnica
Validação de produção
Guia de screenshots
Apresentação para portfólio
```

Documentos úteis:

```txt
docs/GITHUB_FINAL_SETUP.md
docs/PORTFOLIO_PRESENTATION.md
docs/REPOSITORY_QUALITY_REPORT_BLOCO_3_6.md
CHECKLIST_GITHUB_FINAL_BLOCO_3_6.md
```

## 👨‍💻 Autor

Desenvolvido por **Luiz Silva** como projeto fullstack premium para portfólio.

```txt
Node.js • Express • PostgreSQL • Prisma • JWT • Render • Neon
```
