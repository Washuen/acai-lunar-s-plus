# Açaí Lunar S+ Super — Bloco 2.6

## Segurança, permissões e validações

Este bloco aprofunda a estabilidade do sistema antes dos próximos módulos avançados e antes do deploy.

## Principais melhorias

- Autenticação mais rígida com leitura segura do token Bearer.
- Novo middleware `requireOwner`, preparado para ações futuras restritas ao proprietário.
- Validações de cadastro e login:
  - e-mail normalizado em lowercase;
  - e-mail em formato válido;
  - senha mínima de 6 caracteres;
  - nome obrigatório e válido.
- Validação de perfil do cliente:
  - nome válido;
  - telefone válido quando informado;
  - endereço válido quando informado.
- Proteção de checkout:
  - pedido real agora exige usuário autenticado;
  - pedido vazio bloqueado;
  - endereço obrigatório;
  - e-mail válido;
  - quantidade mínima e máxima por item;
  - pedido com muitos itens bloqueado;
  - produto inexistente, inativo ou sem estoque é recusado;
  - pedido mínimo respeitado;
  - loja fechada bloqueia novo pedido.
- Segurança de preço:
  - produtos do cardápio usam preço do banco, não do frontend;
  - itens personalizados são validados antes de entrar no pedido.
- Controle de estoque:
  - estoque é validado no checkout;
  - estoque de produtos reais é reduzido dentro de transação;
  - evita venda acima da quantidade disponível.
- Cupons mais seguros:
  - código normalizado em uppercase;
  - validação de formato;
  - percentual permitido de 1% a 90%;
  - validação de período de início/expiração;
  - cupom inativo, expirado ou fora do período é recusado.
- Produtos mais seguros:
  - apenas admin/owner pode ver produtos inativos usando `includeInactive=true`;
  - criação/edição validam nome, slug, descrição, preço, imagem, categoria e estoque;
  - categoria precisa existir.
- Configurações da loja validadas:
  - nome da loja;
  - taxa de entrega;
  - pedido mínimo;
  - status de abertura.
- Clientes no admin protegidos:
  - só altera usuários com role `CUSTOMER`;
  - valida campos antes de salvar;
  - gera auditoria.
- Tratamento de erros Prisma:
  - duplicidade retorna mensagem amigável;
  - registros inexistentes retornam 404 amigável.

## Arquivos alterados

- `src/middleware/auth.js`
- `src/routes/auth.js`
- `src/routes/orders.js`
- `src/routes/products.js`
- `src/routes/coupons.js`
- `src/routes/settings.js`
- `src/routes/customers.js`
- `src/server.js`
- `src/utils/validators.js`

## Como testar

Use o mesmo `.env` local:

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

Comandos:

```powershell
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Checklist recomendado

1. Entrar como `cliente@acailunar.dev / 123456`.
2. Fazer pedido normal pelo checkout.
3. Confirmar que aparece em Cliente > Pedidos.
4. Entrar como `owner@acailunar.dev / 123456`.
5. Criar produto com preço/estoque válidos.
6. Tentar criar produto com preço negativo e confirmar bloqueio.
7. Criar cupom válido.
8. Tentar criar cupom com 100% e confirmar bloqueio.
9. Aplicar cupom no carrinho.
10. Criar pedido com produto real e verificar redução de estoque no admin.
11. Tentar acessar admin como cliente e confirmar bloqueio.
12. Alterar status de pedido pelo admin.

## Resultado esperado

O Açaí Lunar fica mais seguro, confiável e preparado para a próxima etapa:

**Bloco 2.7 — Admin avançado e relatórios profissionais.**
