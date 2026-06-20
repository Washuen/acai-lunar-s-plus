# BUSINESS_RULES.md — Regras de Negócio

## Usuários

- Todo usuário tem nome, e-mail, senha, role e status ativo.
- E-mail precisa ser único.
- Senha precisa ter pelo menos 6 caracteres.
- Usuário inativo não consegue entrar.
- Roles disponíveis:
  - `OWNER`
  - `ADMIN`
  - `CUSTOMER`

## Autorização

- Cliente acessa apenas recursos próprios.
- Admin/Owner acessa painel administrativo.
- Apenas Admin/Owner pode:
  - listar todos os pedidos
  - alterar status de pedidos
  - criar/editar produtos
  - alterar estoque
  - criar/editar cupons
  - ver clientes
  - ver relatórios
  - alterar configurações

## Produtos

- Produto precisa ter nome, slug, descrição, imagem, categoria, preço e estoque.
- Preço deve ser maior que zero.
- Estoque não pode ser negativo.
- Produto inativo não aparece no cardápio público.
- Produto inativo não pode ser comprado.
- Produto sem estoque suficiente bloqueia checkout.

## Cupons

- Código do cupom é normalizado para maiúsculas.
- Cupom deve ter entre 3 e 24 caracteres.
- Desconto precisa estar entre 1% e 90%.
- Cupom inativo não funciona.
- Cupom expirado não funciona.
- Cupom fora do período de início não funciona.
- Cupom válido retorna percentual ao frontend.
- Desconto final é calculado no backend.

## Pedidos

- Cliente precisa estar autenticado.
- Carrinho precisa ter pelo menos um item.
- Pedido pode ter no máximo 30 itens.
- Cada item precisa ter quantidade válida.
- Pedido mínimo vem das configurações da loja.
- Loja fechada bloqueia novos pedidos.
- Produto real tem preço buscado no banco.
- Item customizado precisa ter nome e preço válido.
- Estoque é reduzido em transação.
- Pedido registra:
  - cliente
  - endereço
  - itens
  - subtotal
  - taxa de entrega
  - desconto
  - total
  - status
  - cupom, quando houver

## Status dos pedidos

Status disponíveis:

```txt
RECEIVED
PREPARING
OUT_FOR_DELIVERY
DELIVERED
CANCELED
```

Regras:

- Pedido novo começa como `RECEIVED`.
- Admin/Owner pode atualizar status.
- Cliente não pode atualizar status.
- Pedido `DELIVERED` ou `CANCELED` não pode mudar para outro status.
- Alteração de status gera auditoria.

## Relatórios

Relatórios são baseados nos pedidos, produtos, cupons, clientes e auditoria.

Indicadores principais:

- receita total
- receita entregue
- ticket médio
- pedidos abertos
- pedidos por status
- receita diária
- produtos mais vendidos
- cupons usados
- estoque crítico
- auditoria recente
