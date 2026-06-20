# Açaí Lunar S+ Super — Bloco 2.5

## Área do Cliente Real

Este bloco adiciona uma área do cliente conectada à API, preservando todos os blocos anteriores:

- Bloco 1.2 UX premium e responsivo
- Bloco 2.1.1 Auth real com sessão sincronizada e anti-flicker
- Bloco 2.2 Checkout real com pedidos no PostgreSQL
- Bloco 2.3 Admin real conectado
- Bloco 2.4 CRUD real de produtos, cupons e estoque
- Bloco 2.4.1 Cupons reais aplicados no carrinho

## Novidades

- Nova seção `Cliente` na navegação.
- Área do cliente com abas: Resumo, Pedidos, Perfil e Cupons.
- Resumo com total de pedidos, valor consumido, pedidos em andamento e entregues.
- Histórico real de pedidos vindo de `/api/orders/mine`.
- Botão para repetir pedido e enviar itens ao carrinho.
- Botão para acompanhar pedido selecionado na timeline.
- Perfil editável com nome, telefone e endereço salvo.
- `PATCH /api/auth/me` para atualizar dados do usuário autenticado.
- Campo `address` adicionado ao modelo `User`.
- Checkout preenche endereço salvo automaticamente quando o usuário está logado.
- Auditoria simples quando o cliente atualiza o perfil.

## Como rodar

Crie o `.env`:

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

Depois rode:

```powershell
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Acesse:

```txt
http://localhost:3333
```

## Credenciais demo

```txt
Cliente: cliente@acailunar.dev
Owner: owner@acailunar.dev
Senha: 123456
```

## Teste recomendado

1. Entrar como `cliente@acailunar.dev`.
2. Abrir seção `Cliente`.
3. Ver resumo e pedidos.
4. Finalizar um pedido novo pelo carrinho.
5. Voltar para `Cliente > Pedidos` e confirmar que aparece.
6. Clicar em `Acompanhar` e verificar timeline.
7. Clicar em `Repetir pedido` e conferir se itens voltam ao carrinho.
8. Editar perfil e endereço em `Cliente > Perfil`.
9. Abrir carrinho e verificar se o endereço salvo preenche o checkout.

## Status

Bloco 2.5 deixa o lado cliente muito mais completo e aproxima o projeto de um produto fullstack comercial real.
