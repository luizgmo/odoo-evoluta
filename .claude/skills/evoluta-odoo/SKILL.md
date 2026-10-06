---
name: Evoluta Odoo
description: Convenções do projeto Evoluta Gestão sobre Odoo 19 (ambiente Docker, gotchas do Odoo 19, OCA, padrões de módulo). Carregue antes de qualquer tarefa de código neste repo.
---

# Evoluta Gestão — convenções Odoo 19

Stack: Odoo 19 Community (`odoo:19`) + Postgres 15 via `docker-compose` v1.
Comandos sempre com sudo: `sudo docker-compose up -d|restart web|logs --tail=N web|exec web ...`.
Shell do assistente NÃO tem sudo/TTY: peça ao usuário para rodar comandos docker.

## Ambiente (não reinventar)
- `docker-compose.yml`, `config/odoo.conf` já existem. `addons_path` precisa de UMA entrada por repo OCA (`/mnt/oca/helpdesk`, `/mnt/oca/tier-validation`, ...). Odoo não escaneia subpastas.
- `POSTGRES_DB: postgres` obrigatório. Sem isso o Postgres cria um banco vazio `odoo` e tudo dá 500 `KeyError: 'ir.http'` até no `/web/database/manager`.
- Primeiro banco via `http://localhost:8069/web/database/manager`. `pgdata/` persiste dados (gitignored).
- `addons/oca/*` é gitignored (só `.gitkeep` commitado). `docs/PROMPTS.md` NUNCA commitar (está no `.gitignore` por pedido explícito).

## Ciclo de desenvolvimento
- Mudou `.py` → `restart web` + Upgrade do módulo. Mudou só XML/CSV → só Upgrade. Módulo novo → Update Apps List antes.
- Upgrade que recarrega a página sem popup = sucesso. Popup RPC_ERROR = ler `Ver detalhes técnicos`.
- Menus do usuário só atualizam com login novo (cache de sessão): testar sempre em janela anônima.

## Gotchas Odoo 19 (aprendidos na marra)
- `res.groups` NÃO tem `category_id` (removido). Grupos sem categoria não aparecem na aba Direitos de acesso do usuário: atribuir via **Grupos > abrir grupo > aba Usuários**. Sistema novo de `res.groups.privilege` fica para Fase 2.
- Ícone **Aplicativos** aparece para todo interno por padrão; o que vale é instalação barrada sem admin. Não tentar esconder no MVP.
- Menu Apps exige `base.group_system`. Glob em `docker-compose exec` precisa de `sh -c`.
- `auto_backup` exige no container: `pip install --break-system-packages packaging "paramiko<4.0.0" pysftp` + restart. Repetir em máquina nova/VPS.
- OCA `tier-validation` é repo separado (NÃO está em `server-ux`). Repos F1: helpdesk→`helpdesk_mgmt`(+`_sla`), tier-validation→`base_tier_validation`, server-tools→`auditlog`+`auto_backup`, project→`project_timeline`, web→`web_responsive`. Sempre branch `19.0` + `--depth 1`.

## Padrões de módulo
- NUNCA editar core do Odoo nem OCA. Estender com `_inherit` + `_description`.
- Sincronização ida-volta entre modelos: trava anti-loop via contexto (`skip_task_sync`, `skip_5w2h_sync`).
- Todo modelo novo: entrada em `models/__init__.py`, views list+form+action, `security/ir.model.access.csv`, manifest `data` (views ANTES de `menus.xml`, que referencia as actions).
- Botão que gera `project.task`: se `task_id` existe, ATUALIZA; nunca duplica. `what`/causa vazio = `UserError` com mensagem.
- Dados demo: `data/*.xml` com `noupdate="1"`.
- Commits: `feat(core|management|demo|fN): ...`, `fix(...)`, `docs:...`, `chore:...`. Sempre `git push origin main` após commit.
