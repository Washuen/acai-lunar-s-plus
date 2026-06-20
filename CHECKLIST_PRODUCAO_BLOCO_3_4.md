# CHECKLIST_PRODUCAO_BLOCO_3_4.md

## Açaí Lunar S+ Super — Validação de Produção

URL principal:

```txt
https://acai-lunar-s-plus.onrender.com
```

## 1. Infraestrutura

- [ ] Render Web Service está online
- [ ] `/api/health` retorna `ok: true`
- [ ] `/api/health` retorna `database: connected`
- [ ] Neon está ativo
- [ ] Variável `DATABASE_URL` no Render usa a URL do Neon
- [ ] `JWT_SECRET` está configurado no Render
- [ ] Último commit foi publicado no Render
- [ ] Render mostra `Deploy live`

## 2. Vitrine pública

- [ ] Home abre no link público
- [ ] Imagens carregam
- [ ] Favicon aparece
- [ ] Aparece `Momentos Lunares`
- [ ] Aparece `Por que escolher o Açaí Lunar?`
- [ ] Aparece `Gestão Açaí Lunar`
- [ ] Não aparece `Critérios de UX antes do backend`
- [ ] Não aparece `Admin preview`
- [ ] Não aparece `Backend ready`

## 3. Cliente

- [ ] Login cliente funciona
- [ ] Cardápio carrega produtos reais
- [ ] Produto adiciona ao carrinho
- [ ] Cupom `LUNAR15` aplica
- [ ] Checkout cria pedido real
- [ ] Pedido aparece em Cliente > Pedidos
- [ ] Botão acompanhar funciona
- [ ] Botão repetir pedido funciona

Credenciais:

```txt
cliente@acailunar.dev
123456
```

## 4. Owner/Admin

- [ ] Login owner funciona
- [ ] Admin libera painel
- [ ] Pedidos aparecem no admin
- [ ] Alterar status funciona
- [ ] Cliente vê status atualizado
- [ ] Produtos aparecem
- [ ] Cupons aparecem
- [ ] Clientes aparecem
- [ ] Relatórios carregam

Credenciais:

```txt
owner@acailunar.dev
123456
```

## 5. Testes por terminal

```powershell
npm run production:check -- https://acai-lunar-s-plus.onrender.com
npm run production:fullcheck -- https://acai-lunar-s-plus.onrender.com
```

## Status final

- [ ] Produção validada
- [ ] Banco validado
- [ ] Checkout real validado
- [ ] Admin validado
- [ ] Cliente validado
- [ ] Projeto pronto para README visual e screenshots
