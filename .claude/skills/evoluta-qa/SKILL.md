---
name: Evoluta QA
description: Revisão P4 de código Evoluta antes de commit/PR (regras do doc oficial: sem core/OCA, herança, segurança, sem SQL cru). Use antes de finalizar qualquer entrega.
---

# Revisão P4

Checar no diff/arquivos (`git log`, `git diff`, `grep`):

- [ ] Nenhum arquivo fora de `addons/evoluta/*`, `docs/*` (exceto `config/`, `docker-compose.yml`), `.claude/skills/*`. OCA e core intocados.
- [ ] Extensão via `_inherit`, nunca cópia de código Odoo/OCA. Sync com trava anti-loop.
- [ ] Todo modelo tem linha em `ir.model.access.csv` (grupos Evoluta quando houver restrinção).
- [ ] Views com IDs `view_<modelo>_<tipo>`, actions `action_<nome>`, menus sob `evoluta_core.menu_evoluta_root`.
- [ ] Sem `cr.execute`/SQL cru, sem senha/token/segredo (cuidado com falsos positivos tipo "Secretaria").
- [ ] `__pycache__`, `pgdata/`, `docs/PROMPTS.md` fora do commit.
- [ ] Funcional: Upgrade verde, botão gerador não duplica task, required bloqueia, dados demo preservados.

Apontar violação como `arquivo:linha` + fix sugerido. Só aprovar com tudo marcado.
