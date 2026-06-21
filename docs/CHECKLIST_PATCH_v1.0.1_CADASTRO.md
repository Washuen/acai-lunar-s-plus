# Checklist — Patch v1.0.1 Cadastro de Cliente

## Fluxo de cadastro

- [ ] Abrir modal em `Entrar`.
- [ ] Preencher nome com pelo menos 2 caracteres.
- [ ] Preencher e-mail novo, diferente de `cliente@acailunar.dev` e `owner@acailunar.dev`.
- [ ] Preencher senha com pelo menos 6 caracteres.
- [ ] Clicar em `Criar conta`.
- [ ] Confirmar mensagem de sucesso.
- [ ] Confirmar sessão ativa no cabeçalho.
- [ ] Acessar área do cliente com a nova conta.

## Validações negativas

- [ ] Tentar cadastrar sem nome.
- [ ] Tentar cadastrar e-mail inválido.
- [ ] Tentar cadastrar senha curta.
- [ ] Tentar cadastrar `cliente@acailunar.dev`.
- [ ] Tentar cadastrar um e-mail já existente.

## Pós-cadastro

- [ ] Adicionar produto ao carrinho.
- [ ] Aplicar cupom `LUNAR15`.
- [ ] Finalizar pedido com a nova conta.
- [ ] Ver pedido na área do cliente.
- [ ] Entrar como owner e confirmar pedido no admin.

## Deploy

- [ ] Subir commit no GitHub.
- [ ] Aguardar redeploy no Render.
- [ ] Repetir teste de cadastro em produção.
- [ ] Criar release `v1.0.1`.
