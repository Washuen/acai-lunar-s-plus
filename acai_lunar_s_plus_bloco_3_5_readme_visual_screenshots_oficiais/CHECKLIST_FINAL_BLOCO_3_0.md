# Açaí Lunar S+ Super — Bloco 3.0
## Checklist de Estabilidade

Este checklist deve ser executado antes de documentação final, GitHub e deploy.

## 1. Inicialização

- [ ] `npm install` executa sem erro
- [ ] `npx prisma generate` executa sem erro
- [ ] `npx prisma db push` executa sem erro
- [ ] `npm run db:seed` executa sem erro
- [ ] `npm run dev` inicia na porta configurada
- [ ] `http://localhost:3333` abre o site
- [ ] `http://localhost:3333/api/health` retorna banco conectado
- [ ] Console do navegador sem erros vermelhos

## 2. Auth e sessão

- [ ] Cliente entra com `cliente@acailunar.dev / 123456`
- [ ] Header muda para Cliente • Sair
- [ ] F5 mantém sessão sem flicker de “Entrar”
- [ ] Sair limpa sessão corretamente
- [ ] Owner entra com `owner@acailunar.dev / 123456`
- [ ] Header muda para Owner • Sair
- [ ] Admin libera para owner
- [ ] Cliente comum não acessa Admin

## 3. Cardápio, carrinho e cupom

- [ ] Produto do cardápio adiciona ao carrinho
- [ ] Quantidade aumenta/diminui corretamente
- [ ] Remover item funciona
- [ ] Limpar carrinho abre confirmação personalizada
- [ ] Cupom `LUNAR15` funciona
- [ ] Cupom criado no admin funciona
- [ ] Cupom desativado não funciona
- [ ] Total, subtotal, desconto e entrega ficam corretos

## 4. Monte seu açaí

- [ ] Escolha de tamanho funciona
- [ ] Escolha de base funciona
- [ ] Adicionais funcionam
- [ ] Preço do personalizado atualiza
- [ ] Bowl personalizado entra no carrinho
- [ ] Bowl personalizado passa pelo checkout

## 5. Checkout real

- [ ] Cliente logado finaliza pedido
- [ ] Pedido vazio é bloqueado
- [ ] Checkout sem login é bloqueado
- [ ] Endereço obrigatório é validado
- [ ] Pedido real é salvo no PostgreSQL
- [ ] Carrinho limpa após pedido
- [ ] Pedido aparece no acompanhamento
- [ ] Pedido aparece em Cliente > Pedidos

## 6. Área do Cliente

- [ ] Aba Resumo carrega dados reais
- [ ] Aba Pedidos mostra histórico
- [ ] Acompanhar pedido funciona
- [ ] Repetir pedido manda itens para carrinho
- [ ] Perfil atualiza nome/telefone/endereço
- [ ] Endereço salvo aparece no checkout
- [ ] Cliente vê status atualizado pelo admin

## 7. Admin real

- [ ] Admin > Resumo carrega indicadores
- [ ] Admin > Pedidos carrega pedidos reais
- [ ] Filtro por status funciona
- [ ] Busca de pedidos funciona
- [ ] Alterar status abre confirmação personalizada
- [ ] Status atualizado aparece para cliente
- [ ] Admin > Produtos cria produto
- [ ] Admin > Produtos edita produto
- [ ] Desativar produto abre confirmação personalizada
- [ ] Produto inativo sai do cardápio público
- [ ] Admin > Estoque altera estoque
- [ ] Admin > Cupons cria cupom
- [ ] Admin > Cupons edita cupom
- [ ] Desativar cupom abre confirmação personalizada
- [ ] Admin > Clientes lista clientes
- [ ] Admin > Relatórios carrega dados profissionais

## 8. Segurança e validações

- [ ] Cliente comum não altera status
- [ ] Cliente comum não cria produto
- [ ] Cliente comum não cria cupom
- [ ] Produto com preço negativo é bloqueado
- [ ] Cupom acima de 90% é bloqueado
- [ ] Pedido com produto sem estoque é bloqueado
- [ ] Produto inativo é bloqueado no checkout
- [ ] Token inválido limpa sessão
- [ ] Rotas admin exigem token owner/admin

## 9. UX, visual e responsividade

- [ ] Favicon aparece na aba do navegador
- [ ] Confirmações usam modal lunar, não `window.confirm`
- [ ] Toasts aparecem com visual coerente
- [ ] Botões mostram carregamento em ações críticas
- [ ] Home mantém impacto visual
- [ ] Cardápio fica bonito em desktop
- [ ] Carrinho fica usável no mobile
- [ ] Admin fica usável no mobile/tablet
- [ ] Imagens carregam corretamente
- [ ] Layout não quebra em larguras pequenas

## 10. Teste automatizado local

Com servidor rodando:

```powershell
npm run check:all
npm run test:smoke
```

Resultado esperado:

- [ ] `check:all` aprovado
- [ ] `test:smoke` aprovado

## Status do Bloco 3.0

- [ ] Aprovado localmente
- [ ] Pronto para documentação profissional
- [ ] Pronto para preparação de GitHub
- [ ] Pronto para deploy
