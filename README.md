# Açaí Lunar S+ Super

> Plataforma fullstack premium de delivery de açaí, criada como projeto de portfólio nível S+, com experiência visual marcante, checkout real, área do cliente, painel administrativo, relatórios, autenticação JWT, PostgreSQL, Prisma e preparação para deploy profissional.

---

## Visão geral

O **Açaí Lunar S+ Super** é uma aplicação fullstack de delivery com foco em produto real, experiência premium e arquitetura organizada.  
A proposta não é ser apenas uma açaiteria online comum, mas uma marca digital com identidade própria: noite tropical, estética lunar, cardápio visual, fluxo de compra completo, administração operacional e documentação profissional.

O sistema permite que clientes naveguem pelo cardápio, montem bowls personalizados, apliquem cupons, finalizem pedidos reais e acompanhem status. No lado administrativo, owner/admin pode gerenciar pedidos, produtos, estoque, cupons, clientes e relatórios.

---

## Status do projeto

```txt
Status: Bloco 3.1 — Documentação Profissional
Tier alvo: Super S+
Estado: Fullstack local estável e documentado
Próxima etapa: Preparação para GitHub e Deploy
```

---

## Destaques

- Landing page premium e responsiva
- Biblioteca visual com imagens de produtos e conceito de marca
- Cardápio com categorias, busca e produtos destacados
- Carrinho com quantidades, remoção, cupom e resumo financeiro
- Monte seu açaí com tamanho, base, adicionais e preço dinâmico
- Checkout real conectado à API
- Cadastro e login com JWT
- Sessão persistente sem flicker visual
- Área do cliente com resumo, pedidos, perfil e cupons
- Repetir pedido e acompanhar pedido
- Painel administrativo protegido
- CRUD de produtos
- Controle de estoque
- CRUD de cupons
- Gestão de pedidos e status
- Relatórios administrativos
- Auditoria de ações principais
- Favicon autoral
- Confirmações customizadas no estilo visual do projeto
- Testes estruturais e smoke test

---

## Tecnologias

### Frontend

- HTML5
- CSS3
- JavaScript Vanilla
- Responsividade mobile/tablet/desktop
- UX com toasts, modais, confirmações customizadas e estados de carregamento

### Backend

- Node.js
- Express
- JWT
- bcryptjs
- Helmet
- Morgan
- CORS

### Banco de dados

- PostgreSQL
- Prisma ORM
- Seed inicial
- Modelagem relacional para usuários, produtos, pedidos, cupons, configurações e auditoria

### Qualidade e estabilidade

- Scripts de verificação estrutural
- Smoke test fullstack
- Checklist manual de estabilidade
- Documentação técnica

---

## Funcionalidades por perfil

### Cliente

- Criar conta
- Entrar e sair
- Navegar pelo cardápio
- Adicionar produtos ao carrinho
- Montar açaí personalizado
- Aplicar cupom
- Finalizar pedido real
- Acompanhar status do pedido
- Ver histórico de pedidos
- Repetir pedido
- Editar perfil
- Salvar endereço para checkout

### Owner/Admin

- Acessar painel administrativo
- Ver resumo operacional
- Gerenciar pedidos
- Alterar status dos pedidos
- Criar, editar, ativar e desativar produtos
- Ajustar estoque
- Criar, editar, ativar e desativar cupons
- Visualizar clientes
- Consultar relatórios profissionais
- Ver auditoria recente

---

## Credenciais demo

Após rodar o seed, use:

### Owner/Admin

```txt
E-mail: owner@acailunar.dev
Senha: 123456
```

### Cliente

```txt
E-mail: cliente@acailunar.dev
Senha: 123456
```

---

## Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
# Server
NODE_ENV=development
PORT=3333

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:123456@localhost:5433/acai_lunar?schema=public"

# Auth
JWT_SECRET="acai_lunar_super_secret_2026"
JWT_EXPIRES_IN="7d"
```

> Ajuste usuário, senha, porta e nome do banco conforme sua instalação local do PostgreSQL.

### 3. Gerar Prisma Client

```bash
npx prisma generate
```

### 4. Aplicar schema no banco

```bash
npx prisma db push
```

### 5. Rodar seed

```bash
npm run db:seed
```

### 6. Iniciar servidor

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3333
```

Health check:

```txt
http://localhost:3333/api/health
```

---

## Scripts disponíveis

```bash
npm run dev          # inicia servidor em modo desenvolvimento
npm run start        # inicia servidor em modo produção
npm run db:generate  # gera Prisma Client
npm run db:push      # aplica schema no banco
npm run db:seed      # popula banco com dados iniciais
npm run db:studio    # abre Prisma Studio
npm run check        # checa sintaxe principal
npm run check:all    # checa estrutura, scripts e sintaxe
npm run test:smoke   # executa teste fullstack contra servidor local
npm run test:manual  # imprime checklist manual no terminal
```

---

## Testes

Com o servidor rodando em `http://localhost:3333`, execute em outro terminal:

```bash
npm run check:all
npm run test:smoke
```

O smoke test cobre:

- API health
- login owner
- login cliente
- produtos
- cupom `LUNAR15`
- criação de pedido real
- pedido em Meus Pedidos
- pedido no Admin
- alteração de status pelo owner
- sincronização para cliente
- relatórios

Checklist manual:

```bash
npm run test:manual
```

---

## Estrutura do projeto

```txt
.
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── assets/
│       ├── images/
│       ├── images_webp/
│       └── favicon/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── lib/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── scripts/
│   ├── check-project.js
│   ├── smoke-test.js
│   └── print-manual-checklist.js
├── docs/
│   ├── API_ROUTES.md
│   ├── DATABASE_MODELS.md
│   ├── BUSINESS_RULES.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOY_GUIDE.md
│   ├── TEST_PLAN.md
│   └── PROJECT_PRESENTATION.md
├── CHECKLIST_FINAL_BLOCO_3_0.md
├── .env.example
├── package.json
└── README.md
```

---

## Principais rotas da API

### Auth

```txt
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/me
```

### Produtos

```txt
GET    /api/products
GET    /api/products/categories
POST   /api/products
PATCH  /api/products/:id
PATCH  /api/products/:id/stock
```

### Cupons

```txt
GET    /api/coupons
POST   /api/coupons/validate
POST   /api/coupons
PATCH  /api/coupons/:id
```

### Pedidos

```txt
GET    /api/orders
GET    /api/orders/mine
POST   /api/orders
PATCH  /api/orders/:id/status
```

### Clientes, configurações e relatórios

```txt
GET    /api/customers
GET    /api/settings
PATCH  /api/settings
GET    /api/reports/summary
GET    /api/health
```

---

## Regras de negócio principais

- Cliente precisa estar logado para criar pedido real
- Carrinho vazio não pode finalizar pedido
- Produto inativo não pode ser comprado
- Produto sem estoque suficiente bloqueia pedido
- Preço do produto vem do banco, não do frontend
- Cupom precisa existir, estar ativo e dentro do período válido
- Cupom pode ter no máximo 90% de desconto
- Pedido mínimo é definido nas configurações da loja
- Loja fechada bloqueia novos pedidos
- Apenas owner/admin acessa rotas administrativas
- Status finalizado/cancelado não pode ser alterado para outro status
- Alterações importantes geram registros de auditoria

---

## Deploy

O projeto está preparado para deploy no Render.

Documentação detalhada:

```txt
docs/DEPLOY_GUIDE.md
```

Variáveis esperadas em produção:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
```

---

## Diferenciais para portfólio

Este projeto demonstra:

- domínio de frontend responsivo e premium
- construção de produto com identidade visual forte
- integração fullstack real
- autenticação e autorização
- persistência com banco relacional
- modelagem com Prisma
- regras de negócio de e-commerce/delivery
- painel administrativo completo
- relatórios e indicadores
- preocupação com UX, estabilidade e documentação

---

## Roadmap

### Concluído

- Frontend premium
- Backend Express
- PostgreSQL/Prisma
- Auth JWT
- Carrinho e checkout real
- Área do cliente
- Admin real
- CRUD produtos/cupons/estoque
- Relatórios
- Segurança e validações
- Confirmações customizadas
- Favicon
- Testes estruturais
- Smoke test
- Documentação profissional

### Próximos passos

- Preparação final para GitHub
- Deploy no Render
- Seed em produção
- Ajustes pós-deploy
- Release `v1.0.0`
- Screenshots e README visual
- Auditoria final 100/100

---

## Autor

Projeto desenvolvido por **Luiz Silva** como projeto de portfólio fullstack nível S+.


---

## Preparação para GitHub

Esta versão inclui a preparação para subir o projeto no GitHub.

Comando de preflight:

```bash
npm run github:preflight
```

Documentação:

```txt
docs/GITHUB_GUIDE.md
docs/RELEASE_NOTES_v1.0.0.md
CHECKLIST_GITHUB_BLOCO_3_2.md
```

Nome recomendado do repositório:

```txt
acai-lunar-s-plus
```


---

## Bloco 3.3 — Deploy no Render

Esta versão adiciona a preparação final para deploy no Render.

Novos comandos:

```bash
npm run deploy:preflight
npm run deploy:postcheck -- https://seu-projeto.onrender.com
```

Documentos adicionados:

```txt
docs/RENDER_DEPLOY_STEP_BY_STEP.md
docs/PRODUCTION_ENV.md
CHECKLIST_DEPLOY_BLOCO_3_3.md
```

Configuração principal:

```txt
render.yaml
```

Resumo Render:

```txt
Build Command: npm install && npx prisma generate
Start Command: npm run start
Health Check Path: /api/health
```


---

## Bloco 3.3.1 — Polimento Comercial Pós-Deploy

Esta versão remove linguagem técnica da página pública e aproxima o site de uma experiência real de marca premium de açaí.

Principais ajustes:

```txt
Hero mais comercial
Cardápio com linguagem de venda real
Combos mais naturais
Delivery com foco em experiência do cliente
Área do cliente com texto menos técnico
Galeria transformada em Momentos Lunares
Seção técnica de UX transformada em diferenciais da marca
Admin preview transformado em central interna de gestão
```
