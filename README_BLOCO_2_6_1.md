# Açaí Lunar S+ Super — Bloco 2.6.1 Status Real do Pedido

Correção pontual após o Bloco 2.6.

## Correção principal

O botão de acompanhamento que antes avançava apenas o status visual/local agora, quando o usuário logado é `OWNER` ou `ADMIN`, altera o status real do pedido via API:

- `RECEIVED` → `PREPARING`
- `PREPARING` → `OUT_FOR_DELIVERY`
- `OUT_FOR_DELIVERY` → `DELIVERED`

A atualização usa a rota real:

```http
PATCH /api/orders/:id/status
```

## Comportamento

- Owner/Admin pode avançar o status real do pedido acompanhado.
- Cliente comum não altera status real.
- Pedido entregue ou cancelado não avança mais.
- Timeline, Área do Cliente e Admin são sincronizados após a alteração.
- O status continua salvo no PostgreSQL.

## Teste recomendado

1. Entrar como `cliente@acailunar.dev / 123456`.
2. Criar um pedido real.
3. Sair.
4. Entrar como `owner@acailunar.dev / 123456`.
5. Ir até a área Cliente/Pedidos ou Acompanhamento.
6. Clicar em acompanhar um pedido.
7. Usar o botão de avanço de status.
8. Confirmar que o status muda para Preparando, Saiu para entrega e Entregue.
9. Conferir também em Admin > Pedidos.

