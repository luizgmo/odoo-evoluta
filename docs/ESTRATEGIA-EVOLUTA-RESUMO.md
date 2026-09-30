# Resumo — Estratégia GovTech Evoluta (doc original 30/09/2026)

Fonte: `Conversa_Estrategia_GovTech_Evoluta_Odoo_Community_19.md` (documento enviado pela Evoluta)

## Ideia central
Não criar ERP do zero. Usar **Odoo 19 Community como engine** invisível + módulos OCA + camada própria **Evoluta Gestão** focada em método de gestão pública.

Princípio: Usar Odoo > Usar OCA > Herdar > Só desenvolver se for diferencial.

## Arquitetura
- **Odoo nativo:** Projects, Kanban, Tasks, Activities, Agenda, Contatos, Portal, Chatter
- **OCA Fase 1:** Helpdesk, Tier Validation (aprovações), KPI, BI SQL/MIS, Auditlog, Auto Backup, Timeline, Web Responsive/PWA
- **Evoluta (4 módulos):** `evoluta_core` (município/secretaria/permissões), `evoluta_strategy` (triângulo, stakeholders, árvores), `evoluta_management` (5W2H, 5 Porquês, Ishikawa, RACI, matriz decisão, riscos), `evoluta_templates` (biblioteca)
- **Infra:** VPS Hostinger, Docker, Postgres, Nginx, SSL, backup 3-2-1

## Diferencial (o que desenvolver)
Ferramentas metodológicas ligadas ao Project:
- 5W2H → gera `project.task`
- 5 Porquês → causa raiz → botão Criar ação
- Ishikawa, RACI, Árvore Problemas/Objetivos, Triângulo Harvard (valor/legitimidade/capacidade), Matriz Decisão
- Templates: LGPD, plano estratégico, redução despesas, convênios, fiscalização contratual, etc. Template gera projeto + tarefas + checklist + indicadores.

Teoria da Mudança e IA ficam para Fase 2/3.

## Freemium proposto
- Grátis: 1 org, projetos/kanban/5W2H/diagnóstico básico
- Pro: + usuários, dashboards, aprovações, templates premium
- Município: multi-secretaria, SSO, API, suporte, implantação, IA + consultoria

## Fases
- Fase 1 (MVP): Odoo 19 + OCA base + core/strategy/management. Fluxo: Desafio > Diagnóstico > Plano > Projeto > Kanban > Indicadores
- Fase 2: Templates, Portal, BI avançado, assinatura, jobs
- Fase 3: IA (sugere diagnóstico/5W2H/plano com validação humana), API pública

## Regras
Fazer: herança (`_inherit`), módulos pequenos, testes, Git, staging, backup, auditoria.
Não fazer: mexer no core/OCA, recriar ERP, mobile nativo agora, OCA experimental em recurso crítico, aceitar código IA sem review.

## Implicação para feira (20 dias)
Escopo Fase 1 completo é grande demais. Para demo focar só em: 1 projeto exemplo → 1 diagnóstico 5 Porquês → 1 plano 5W2H → Kanban com 6 etapas → 1 indicador.
