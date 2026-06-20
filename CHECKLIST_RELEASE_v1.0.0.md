# CHECKLIST_RELEASE_v1.0.0.md

## Açaí Lunar S+ Super — Checklist da Release Oficial

## 1. Antes da release

- [ ] GitHub atualizado
- [ ] Render com deploy live
- [ ] Neon conectado
- [ ] README visual aparecendo corretamente
- [ ] Imagens do README funcionando
- [ ] Pasta duplicada de bloco removida, se existir
- [ ] `.env` não está no GitHub
- [ ] `node_modules` não está no GitHub
- [ ] About do GitHub configurado
- [ ] Website do GitHub configurado
- [ ] Topics do GitHub configurados

## 2. Validar produção

```powershell
npm run production:check -- https://acai-lunar-s-plus.onrender.com
npm run production:fullcheck -- https://acai-lunar-s-plus.onrender.com
```

- [ ] Production check aprovado
- [ ] Production fullcheck aprovado

## 3. Criar tag local

```powershell
git tag -a v1.0.0 -m "Açaí Lunar S+ Super official stable release"
```

## 4. Enviar tag para o GitHub

```powershell
git push origin v1.0.0
```

## 5. Criar release no GitHub

No repositório:

```txt
https://github.com/Washuen/acai-lunar-s-plus
```

Ir em:

```txt
Releases > Draft a new release
```

Preencher:

### Tag

```txt
v1.0.0
```

### Title

```txt
Açaí Lunar S+ Super v1.0.0 — Official Stable Release
```

### Description

Usar o conteúdo de:

```txt
RELEASE_NOTES_v1.0.0.md
```

## 6. Conferência final

- [ ] Release aparece na página do GitHub
- [ ] Tag `v1.0.0` aparece no repositório
- [ ] Link do deploy funciona dentro da release
- [ ] README continua funcionando
- [ ] Projeto pronto para auditoria final
