# Açaí Lunar S+ Super — Bloco 3.2 Preparação para GitHub

## Objetivo

Deixar o projeto pronto para ser enviado ao GitHub com segurança, organização e apresentação profissional.

## Entregas

- `package.json` atualizado para versão `1.0.0`
- metadados de repositório adicionados ao `package.json`
- script `npm run github:preflight`
- guia completo de GitHub
- checklist de GitHub
- release notes v1.0.0
- templates simples de issue e pull request
- README atualizado com seção de preparação para GitHub

## Arquivos adicionados

```txt
docs/GITHUB_GUIDE.md
docs/RELEASE_NOTES_v1.0.0.md
CHECKLIST_GITHUB_BLOCO_3_2.md
scripts/github-preflight.js
.github/PULL_REQUEST_TEMPLATE.md
.github/ISSUE_TEMPLATE.md
README_BLOCO_3_2_PREPARACAO_GITHUB.md
```

## Comando novo

```bash
npm run github:preflight
```

## Observação importante

O `package.json` usa placeholders como `SEU_USUARIO` nas URLs do GitHub.  
Depois de criar o repositório, troque pelo seu usuário real.

Exemplo:

```txt
https://github.com/Washuen/acai-lunar-s-plus.git
```

## Próximo bloco recomendado

```txt
Bloco 3.3 — Deploy no Render
```
