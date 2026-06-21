# Açaí Lunar S Plus v1.0.1 — Patch de Cadastro

## Objetivo

Esta atualização corrige e finaliza o fluxo de cadastro de novas contas de cliente no Açaí Lunar S Plus.

## Correções e melhorias

- Tela de autenticação ajustada para deixar claro que usuários demo já existem.
- Campos de cadastro iniciam vazios para evitar tentativa acidental com `cliente@acailunar.dev`.
- Validação de nome, e-mail e senha antes de enviar o cadastro para a API.
- Bloqueio visual para tentativa de cadastro com e-mails demo já existentes.
- Rota `POST /api/auth/register` mantém criação segura com role padrão `CUSTOMER`.
- Nova conta criada já recebe token e sessão ativa automaticamente.
- Mensagens de sucesso e erro ficaram mais claras para o usuário.

## Critérios de aceite

- Criar conta usando e-mail novo.
- Impedir cadastro com e-mail demo ou e-mail duplicado.
- Fazer login automaticamente após cadastro bem-sucedido.
- Permitir que o novo cliente acesse área do cliente e finalize pedidos.
- Validar o fluxo no Render antes da release final.

## Status

Patch preparado para validação local e deploy no Render.
