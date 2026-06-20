# RELEASE_GUIDE.md

## Açaí Lunar S+ Super — Guia para criar a Release v1.0.0

## 1. Conferir estado do Git

```powershell
git status
```

O ideal é aparecer:

```txt
nothing to commit, working tree clean
```

## 2. Criar a tag

```powershell
git tag -a v1.0.0 -m "Açaí Lunar S+ Super official stable release"
```

## 3. Enviar a tag

```powershell
git push origin v1.0.0
```

## 4. Criar a release pelo GitHub

Abra:

```txt
https://github.com/Washuen/acai-lunar-s-plus
```

Depois:

```txt
Releases > Draft a new release
```

Preencha:

### Tag

```txt
v1.0.0
```

### Release title

```txt
Açaí Lunar S+ Super v1.0.0 — Official Stable Release
```

### Description

Copie o conteúdo do arquivo:

```txt
RELEASE_NOTES_v1.0.0.md
```

## 5. Publicar

Clique em:

```txt
Publish release
```

## 6. Conferir

```txt
A release aparece no GitHub
A tag v1.0.0 aparece no repositório
O deploy abre corretamente
O README continua com imagens funcionando
```

Depois dela, o próximo passo é a auditoria final 100/100.
