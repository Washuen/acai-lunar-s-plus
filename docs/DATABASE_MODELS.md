# Açaí Lunar S+ — Database Models

## User
Clientes, administradores e owner. Suporta roles `OWNER`, `ADMIN` e `CUSTOMER`.

## Category
Categorias comerciais do cardápio: Bowls, Copos, Bebidas, Combos, Especiais e Mini.

## Product
Produtos do cardápio com preço, imagem, estoque, tag, status ativo e destaque.

## Coupon
Cupons com código, percentual, validade e status.

## Order
Pedido do cliente com totais, taxa de entrega, desconto, status e pagamento.

## OrderItem
Itens do pedido, incluindo produtos do cardápio e bowls personalizados.

## StoreSetting
Configurações operacionais da loja: horário, taxa, pedido mínimo, WhatsApp e status aberto/fechado.

## AuditLog
Histórico simples de ações importantes: criação de pedidos, atualização de status e alteração de configurações.
