# Plano — Evoluta Gestão MVP Feira (~20 dias)

Fonte oficial: `Conversa_Estrategia_GovTech_Evoluta_Odoo_Community_19.md` + `docs/ESTRATEGIA-EVOLUTA-RESUMO.md`
Status: ambiente local OK (Odoo 19 + evoluta_core + evoluta_management/5W2H + Project). Tema/identidade aguardando skill da Evoluta.

## Objetivo da feira
Demonstrar em 5 min: `Desafio > 5 Porquês (opcional) > 5W2H > Gerar Task > Kanban > Indicador`. Captar contatos, não vender.

## Escopo travado (não aumenta)
- [x] Odoo 19 Community em Docker + Postgres
- [x] evoluta_core (secretaria base)
- [x] evoluta_management (5W2H → project.task)
- [ ] Project configurado com etapas Evoluta (NÃO INICIADO...CONCLUÍDO)
- [ ] 1 projeto demo + 10 tasks fake realistas (LGPD / tapa-buraco)
- [ ] Deploy staging na VPS Evoluta + domínio + SSL
- [ ] Roteiro demo + QR lista interesse
- [ ] Tema Evoluta (AGUARDANDO SKILL — não fazer na mão agora)
- Fora: 5 Porquês completo, Ishikawa, RACI, árvores, BI avançado, mobile nativo, IA. Fase 2.

## Backlog por responsável (sugestão 4 pessoas)
1. **Funcional/Odoo (1 pessoa):** etapas Kanban, permissões, testar fluxo 5W2H→task, criar projeto demo
2. **Backend (1-2 pessoas):** estabilizar management, botão Gerar Task, validação, testes básicos
3. **Dados/Demo (1 pessoa):** massa fake, roteiro 5 min, folha validação 5 perguntas, pitch
4. **Infra (1 pessoa):** VPS, Nginx, SSL, backup, deploy staging, notebook offline backup

## Como trabalhar junto (Git + Odoo)
- Branches: `main` (feira, protegida), `develop` (integração), `feature/nome` (cada tarefa)
- Fluxo: `git checkout develop → git checkout -b feature/xxx → commit → push → PR para develop → review → merge. Só merge em main com demo funcionando.`
- Cada dev roda local: `git clone → docker-compose up -d → cria próprio banco demo (demo_seunome)`. Nunca compartilham pgdata (está no .gitignore).
- Nunca editar core Odoo nem OCA. Só `_inherit` nos módulos evoluta_*.
- Após `git pull`, sempre: `Apps > Update Apps List > Upgrade` do módulo alterado.
- Commits: `feat(5w2h): ...`, `fix(core): ...`, `docs(plano): ...`
- PR checklist: não alterou core/OCA, tem access.csv, views com IDs, testou Upgrade sem erro, testou Gerar Task.

## Comandos padrão
```bash
git pull origin develop
sudo docker-compose up -d
# http://localhost:8069/web/database/manager → cria demo_seunome
# Apps > Update Apps List > Upgrade evoluta_management
```

## Deploy VPS (quando Infra liberar)
```bash
git pull origin main
sudo docker-compose up -d --build
# Nginx: gestao.evoluta... → 8069 + certbot --nginx
# Backup: auto_backup OCA + snapshot VPS
```

## Cronograma
- Dias 1-5: estabilizar 5W2H + etapas Kanban + projeto demo
- Dias 6-12: dados fake + testes fluxo + ajustes PR
- Dias 13-16: deploy staging + teste domínio + SSL
- Dias 17-18: aplicar skill tema (quando chegar)
- Dias 19-20: ensaio demo offline (notebook com docker local, sem depender wifi feira)

## Riscos
- Skill tema atrasar → vai com Odoo + logo trocada manual, sem CSS custom
- OCA instável no 19 → não adicionar OCA novo agora, só o já validado
- Escopo crescer → qualquer ideia nova vai para Fase 2
