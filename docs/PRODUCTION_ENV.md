# PRODUCTION_ENV.md — Variáveis de Produção

## Web Service Render

Configure estas variáveis:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
```

## DATABASE_URL

No Web Service, prefira a **Internal Database URL** do PostgreSQL Render.

Exemplo visual:

```txt
postgresql://user:password@host:5432/database
```

Não publique a URL real no GitHub.

## JWT_SECRET

Use um valor longo, único e impossível de adivinhar.

Exemplo:

```txt
acai_lunar_s_plus_prod_chave_super_longa_unica_2026
```

## Variáveis que não precisam ir para produção

```env
SMOKE_BASE_URL
SMOKE_OWNER_EMAIL
SMOKE_OWNER_PASSWORD
SMOKE_CUSTOMER_EMAIL
SMOKE_CUSTOMER_PASSWORD
```

Essas são úteis apenas para testes locais.
