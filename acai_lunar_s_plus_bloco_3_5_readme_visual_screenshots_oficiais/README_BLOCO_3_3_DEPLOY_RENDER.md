# Açaí Lunar S+ Super — Bloco 3.3 Deploy no Render

## Objetivo

Preparar o projeto para publicação no Render com Web Service, PostgreSQL, Prisma e checklist de pós-deploy.

## Entregas

- `render.yaml` refinado
- script `npm run deploy:preflight`
- script `npm run deploy:postcheck`
- guia passo a passo de deploy no Render
- documentação de variáveis de produção
- checklist completo de deploy

## Arquivos adicionados/revisados

```txt
render.yaml
package.json
scripts/render-preflight.js
scripts/render-postdeploy-check.js
docs/RENDER_DEPLOY_STEP_BY_STEP.md
docs/PRODUCTION_ENV.md
CHECKLIST_DEPLOY_BLOCO_3_3.md
README_BLOCO_3_3_DEPLOY_RENDER.md
README.md
```

## Comandos novos

```bash
npm run deploy:preflight
npm run deploy:postcheck -- https://seu-projeto.onrender.com
```

## Próximo passo prático

1. Subir o projeto para GitHub.
2. Criar PostgreSQL no Render.
3. Criar Web Service no Render.
4. Configurar variáveis.
5. Rodar Prisma/seed em produção.
6. Testar o link público.

## Próximo bloco recomendado

```txt
Bloco 3.4 — Banco de Produção + Seed + Ajustes Pós-Deploy
```
