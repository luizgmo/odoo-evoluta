# Arquitetura — Mesa (React) + Odoo 19

## 1. Componentes e portas
- **Mesa** (SPA `frontend/dist`): úsá por gestor/secretário/atendente. Rotas `/`, `/dashboard`, `/projects`, `/agenda`, `/metrics`, `/acessibilidade`. Nunca acessa o banco direto.
- **Odoo** (backend + UI nativa): fonte da verdade (Postgres). UI nativa em `/odoo/` para admin (Tier, grupos, templates seed, BI, Upgrades).
- **API REST** (`base_rest`, a instalar): `/api/projetos`, `/api/tasks[/:id]/mover`, `/api/5w2h` (GET+POST/PATCH). Só modelos de trabalho; nada técnico.
- **Nginx** (mesma VPS): `/` → estáticos da Mesa; `/odoo/`, `/web/`, `/jsonrpc` → Odoo; `/api/` → REST Odoo. Um domínio, um SSL.

## 2. Acesso do cliente
1. Abre o domínio → tela de login da Mesa (R-ENT).
2. Login chama autenticação do Odoo e guarda **sessão em cookie HttpOnly** (mesmo domínio: vale pra Mesa e pro Odoo, sem CORS/token no JS).
3. Cada chamada API carrega o usuário; **grupos e record rules do Odoo valem igual** (a Mesa não consegue vazar dado).
4. Sessão expirada → volta ao login com volta pós-login (R-AUTH-03). Sem conta → `/unauthorized` (rota) / 404 (endereço).
5. Portal externo (se houver): só endpoints de leitura do que foi compartilhado.

## 3. Acesso admin (nós + Evoluta)
- Mesa com perfil `admin`: tudo do gestor + telas de administração da Mesa.
- Odoo em `/odoo/`: Tier Definitions, grupos, onboarding seed, BI SQL/MIS, Upgrades de módulo, Jobs, Backup, Auditlog.
- Regra: config metodológica (templates, etapas, aprovações) nasce no Odoo; a Mesa só consome.

## 4. Mapa perfis ↔ grupos
| Mesa | Odoo |
|---|---|
| master | interno Evoluta (painel master, R-MOL-11) |
| admin | Evoluta Admin Municipal (+ `base.group_system` se for nosso dev) |
| gestor | Evoluta Secretário |
| operador | Evoluta Atendente |
| (portal) | base.group_portal (só leitura compartilhada) |

Menu esconde + rota recusa + API barra (três camadas, R-ROT-02/R-ACE-10).

## 5. Fluxos de dados
- Leitura (G4): Mesa → GET API → JSON → telas (carregando/erro-com-retry/vazio, R-EST-01).
- Escrita (G5): Mesa → POST/PATCH → Odoo valida (required, travas R!=A, gate de aprovação) → erro volta como alerta junto ao botão (R-TEL-10), nunca toast genérico.
- Jobs (template→projeto): Mesa dispara, Odoo enfileira, cron executa; Mesa mostra aviso com consulta posterior.
- Aprovações Tier: ficam no Odoo nesta fase (botão da Mesa só lê `validation_status`).

## 6. Ambientes
- Local: `npm run dev` (Vite :8080, proxy → `localhost:8069`) + `docker-compose up`.
- Staging: containers e volumes separados + build da Mesa, banco `evoluta_staging` com massa de demonstração, subdomínio staging.
- Prod: banco multi-município `evoluta_prod` sem dados demo, volumes próprios, backup 3-2-1, SSL, sem `VITE_LOGIN_TESTE_*`, sem demo flags.
- A mesma VPS pode hospedar staging e produção inicialmente, desde que bancos, volumes, portas e secrets sejam separados.

## 7. Segurança
- Sem segredo no git (`.env` local fora do versionamento); cookies HttpOnly + SameSite; CSRF via sessão Odoo.
- SQL só no servidor (BI views são do admin; Mesa nunca monta SQL).
- LGPD: CPF/dados sensíveis só via API autenticada + auditlog ligado; logs sem dado real em fixtures (R-USR-04).

## 8. Decisões pendentes
- Subdomínios (`app.`/`api.`) vs path único (recomendado: path único).
- Assinatura de documentos pela Mesa (Fase 2+: embutir link do Sign).
- IA/Chat (Fase 3): endpoint dedicado com validação humana (R-TXT-03).
