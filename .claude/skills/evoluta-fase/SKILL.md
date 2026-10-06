---
name: Evoluta Fase
description: Executar uma fase do docs/PLANO-FASE1.md de ponta a ponta (plano, código, validação, commit). Use quando o usuário pedir para executar a próxima fase (F1, F2, ...).
---

# Executar fase Evoluta

Ordem é cronológica e rígida: fase N+1 só começa com a N marcada `[CONCLUÍDO]` no `docs/PLANO-FASE1.md`.

## Passo a passo
1. Ler a seção da fase no `docs/PLANO-FASE1.md` (escopo exato, fora do escopo, aceite).
2. Ler os arquivos atuais que serão mexidos. Mostrar antes de codar: lista de arquivos + resumo do diff.
3. Implementar. Novos `.py` exigem `restart web` do usuário antes do Upgrade.
4. Validar sintaxe local: `python3 -m py_compile` nos `.py` e parse XML das views.
5. Passar validação clicável detalhada ao usuário (clique a clique, o que deve bloquear, o que deve acontecer). Se pedir "mais detalhado", mandar aqui no chat.
6. Com o "deu certo" do usuário: `git add` só do escopo da fase, `commit` no padrão do repo, `push origin main`.
7. Marcar `[CONCLUÍDO DD/MM]` na fase do plano e commitar o plano.
8. Se erro RPC no Upgrade: pedir `Ver detalhes técnicos` ou `docker-compose logs`; causa comum é campo inexistente no 19 ou dependência pip faltando (ver skill `evoluta-odoo`).

Nunca aumentar escopo da fase no meio. Ideia nova vai para Fase 2/ backlog.
