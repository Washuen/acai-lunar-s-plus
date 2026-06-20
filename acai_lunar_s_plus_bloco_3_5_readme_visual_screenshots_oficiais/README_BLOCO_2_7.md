# Açaí Lunar S+ Super — Bloco 2.7

## Admin avançado e relatórios profissionais

Esta versão aprofunda a central administrativa do Açaí Lunar, mantendo todos os blocos anteriores:

- Frontend premium e biblioteca visual com 28 imagens
- Auth real com sessão sincronizada e anti-flicker
- Checkout real com PostgreSQL
- Área do cliente real
- CRUD real de produtos, cupons e estoque
- Sincronização real de status entre admin e cliente
- Segurança, permissões e validações do Bloco 2.6

## Novidades do Bloco 2.7

### Admin > Resumo
- Cards ampliados de receita, pedidos, ticket médio, pedidos em andamento, receita entregue e produtos ativos.
- Distribuição de pedidos por status.
- Mini gráfico de receita diária.
- Pedidos recentes e estoque crítico.

### Admin > Pedidos
- Filtro por status.
- Busca por pedido, cliente, e-mail, endereço ou item.
- Receita filtrada.
- Quantidade de pedidos filtrados.
- Status de pedido com ações reais preservadas.

### Admin > Produtos
- Filtro por status: todos, ativos, inativos, estoque baixo e destaques.
- Busca por nome, categoria, tag ou descrição.
- Cards com alerta visual para estoque crítico.
- CRUD real preservado.

### Admin > Clientes
- Busca por nome, e-mail, telefone ou endereço.
- Resumo de clientes exibidos e pedidos vinculados.
- Endereço do cliente visível na tabela.

### Admin > Relatórios
- Receita total.
- Receita entregue.
- Pedidos analisados.
- Ticket médio.
- Clientes.
- Pedidos abertos.
- Estoque crítico.
- Cupons ativos.
- Produtos mais vendidos.
- Uso de cupons.
- Receita diária.
- Pedidos por status.
- Auditoria recente.

## Testes recomendados

1. Entrar como `owner@acailunar.dev` / `123456`.
2. Abrir Admin > Resumo e conferir indicadores.
3. Criar pedidos como cliente e atualizar o admin.
4. Usar filtros de Admin > Pedidos.
5. Buscar produto em Admin > Produtos.
6. Filtrar produtos por estoque baixo.
7. Buscar cliente em Admin > Clientes.
8. Conferir gráficos textuais em Admin > Relatórios.
9. Alterar status de pedido como admin.
10. Entrar como cliente e confirmar status sincronizado.

## Comandos

```powershell
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## .env local recomendado

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
