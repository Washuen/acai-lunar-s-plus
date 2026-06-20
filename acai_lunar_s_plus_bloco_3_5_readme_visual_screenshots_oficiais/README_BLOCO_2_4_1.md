# Açaí Lunar S+ Super — Bloco 2.4.1 Coupon Apply Fix

Correção pontual do fluxo de cupons personalizados criados no admin.

## Corrigido

- O carrinho deixou de aceitar apenas o cupom fixo `LUNAR15`.
- O botão **Aplicar** agora valida qualquer cupom ativo pela API `/api/coupons/validate`.
- Cupons criados no admin, como `LUNAR50`, passam a funcionar no checkout.
- O resumo do carrinho mostra o código real aplicado.
- O desconto usa o percentual real do cupom criado no banco.
- Ao finalizar pedido, o `couponCode` enviado para a API é o código real aplicado.
- O backend também ignora cupons inativos, não iniciados ou expirados no momento de criar o pedido.

## Teste recomendado

1. Entrar como `owner@acailunar.dev / 123456`.
2. Criar ou ativar um cupom, por exemplo `LUNAR50` com 50%.
3. Adicionar itens ao carrinho.
4. Digitar `LUNAR50` no carrinho.
5. Clicar em **Aplicar**.
6. Confirmar que aparece `Cupom LUNAR50 aplicado.`.
7. Confirmar que o desconto aparece no resumo.
8. Finalizar pedido real.
9. Conferir no Admin > Pedidos se o desconto foi aplicado.

