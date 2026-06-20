# Açaí Lunar S+ Super — Bloco 2.6.2

## Correção: status atualizado pelo admin aparece para o cliente

Este patch corrige a sincronização do acompanhamento do cliente após o admin/owner alterar o status real do pedido.

### Ajustes realizados

- Ao trocar de usuário, o pedido rastreado antigo é limpo para evitar estado preso no `localStorage`.
- Ao sair da conta, `lastOrder` e `myOrders` são limpos corretamente.
- Ao carregar `/api/orders/mine`, o frontend procura o pedido rastreado atual na resposta da API e substitui pela versão mais nova do banco.
- Se o pedido rastreado não existir mais na conta logada, o sistema usa o pedido mais recente da conta atual.
- Timeline, Área do Cliente e histórico passam a refletir o status atualizado pelo admin após login/F5/atualização.

### Teste recomendado

1. Entrar como `cliente@acailunar.dev / 123456`.
2. Criar um pedido real.
3. Sair.
4. Entrar como `owner@acailunar.dev / 123456`.
5. Alterar o status do pedido em Admin/Acompanhamento.
6. Sair.
7. Entrar novamente como cliente.
8. Conferir em Cliente > Pedidos e em Acompanhamento se o status aparece atualizado.
