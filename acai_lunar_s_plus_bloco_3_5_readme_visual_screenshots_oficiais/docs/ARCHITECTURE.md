# ARCHITECTURE.md — Açaí Lunar S+ Super

## Visão arquitetural

O Açaí Lunar S+ Super segue uma arquitetura fullstack simples, clara e adequada para portfólio/produto:

```txt
Cliente/Navegador
      ↓
Frontend estático em public/
      ↓ fetch
API Express em src/server.js
      ↓
Rotas modulares em src/routes/
      ↓
Prisma Client
      ↓
PostgreSQL
```

## Camadas

### 1. Frontend

Arquivos principais:

```txt
public/index.html
public/styles.css
public/app.js
```

Responsabilidades:

- renderizar interface pública
- controlar carrinho
- controlar sessão visual
- consumir API
- renderizar área cliente
- renderizar admin
- exibir toasts e confirmações
- aplicar responsividade e experiência visual premium

### 2. API

Arquivo central:

```txt
src/server.js
```

Responsabilidades:

- configurar Express
- aplicar middlewares
- servir frontend estático
- registrar rotas
- tratar erros
- expor health check

### 3. Rotas

```txt
src/routes/auth.js
src/routes/products.js
src/routes/coupons.js
src/routes/orders.js
src/routes/customers.js
src/routes/settings.js
src/routes/reports.js
```

Cada arquivo concentra um domínio do sistema.

### 4. Autenticação e autorização

```txt
src/middleware/auth.js
```

Responsabilidades:

- validar JWT
- carregar usuário
- bloquear usuário inativo
- proteger rotas privadas
- restringir rotas administrativas a OWNER/ADMIN

### 5. Banco de dados

```txt
prisma/schema.prisma
prisma/seed.js
```

Responsabilidades:

- definir modelos
- relacionamentos
- enums
- seed inicial
- credenciais demo
- produtos/categorias/cupons/configurações

## Fluxo de pedido

```txt
Cliente logado
  → adiciona itens ao carrinho
  → aplica cupom
  → finaliza checkout
  → API valida dados
  → API busca produtos reais no banco
  → API valida estoque, cupom, loja e pedido mínimo
  → Prisma cria pedido em transação
  → estoque é reduzido
  → auditoria é registrada
  → cliente e admin passam a enxergar o pedido
```

## Fluxo de status

```txt
Owner/Admin
  → acessa pedido
  → escolhe novo status
  → confirmação customizada
  → PATCH /api/orders/:id/status
  → API valida permissão
  → API atualiza pedido
  → auditoria é registrada
  → cliente vê status atualizado em /api/orders/mine
```

## Estratégia de segurança

- senhas com bcrypt
- JWT para sessão
- rotas administrativas protegidas
- validações no backend
- preço calculado pelo backend
- estoque validado no backend
- cupom validado no backend
- erro Prisma tratado
- `.env` fora do Git
- `.env.example` versionado

## Decisões de projeto

### JavaScript Vanilla no frontend

Escolhido para demonstrar domínio direto de DOM, estado, eventos e integração com API sem depender de framework.

### Express + Prisma

Stack objetiva, muito usada em projetos Node.js, fácil de entender, testar e publicar.

### PostgreSQL

Banco relacional adequado para pedidos, usuários, produtos, cupons, auditoria e relatórios.

### Render

Deploy simples para portfólio, com suporte a Web Service e PostgreSQL.
