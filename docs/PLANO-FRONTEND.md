# Plano Frontend — Mesa de Trabalho Evoluta + Odoo 19

Skill realocada em: `.claude/skills/Evoluta_frontend/` (SKILL.md + assets/ + references/).
Status: analisada, NÃO implantada. Este doc é a análise detalhada + plano.

## 1. Inventário do pacote (2,2 MB)
- `SKILL.md` (381 linhas): 20 famílias de regras R-* (tokens, moldura, telas, texto, acessibilidade, responsivo, impressão, rotas, auth demo, marca, gênero, situações, documentos, domínio, hooks, verificação) + checklist + relato + limites.
- `assets/base/`: projeto Vite completo e compilável (React+TS+Tailwind v3+shadcn/Radix+lucide+react-router): casca AppLayoutV3/Header/Sidebar, login demo, 11 telas exemplo, `config/marca.ts`, store em memória.
- `assets/components/{layout,mesa,auth}` + `assets/styles/index.css` (tokens HSL) + `tailwind.config.ts` (safelist) + `assets/public/` (logos, favicon).
- `assets/exemplos/`: 54 arquivos do LicitarsAI só-leitura (NÃO compilam, NÃO copiar).
- `references/01-13`: tokens, moldura, menu, logos, componentes, regras, checklist, adaptação, receitas, microcopy, divergências, rastreabilidade, troca de domínio.

## 2. Achado arquitetural (o ponto mais importante)
Isto NÃO é um tema do Odoo. É um SPA React standalone com dados em memória. Nosso backend é Odoo 19. Logo o frontend será um segundo deploy que fala com o Odoo via API. Consequências:
- **API vira pré-requisito antecipado** (matriz dizia Fase 2/3): OCA `base_rest` (recomendado) ou JSON-RPC nativo `/jsonrpc` + CORS.
- **Auth real**: trocar login demo (R-AUTH-01) por sessão Odoo (cookie) ou token por usuário portal; R-AUTH-04 (avisar o que é simulação).
- **Hospedagem**: Nginx serve `frontend/dist` no `/` e proxy Odoo no `/odoo/` (ou subdomínios app/api). Mesmo VPS da Evoluta.
- Telas Odoo continuam existindo para admin; gestor usa a Mesa.

## 3. Adaptação de domínio licitação → gestão municipal
- Objeto: processo → **projeto** (masc., GEN "o"); ação principal "Novo plano".
- Menu (R-MOL-06): Trabalho (Minha Mesa, Projetos, Prazos e agenda) → Consulta (Biblioteca/Templates, Painéis) → Prefeitura (Quem está com o quê) → Administração (só admin).
- Fases (R-SIT-02, MOLDE NEUTRO): as 6 etapas Evoluta (Não iniciado…Concluído).
- Situações (R-SIT-01): tabela própria (Em dia/Atrasado/Concluído…) com tintas.
- Perfis (R-ROT-03): master/admin/gestor/operador ↔ Admin Municipal/Secretário/Atendente (+portal).
- `leiAoLado=false`, `GEN` masculino, agenda = prazos das tasks (R-SIT-03 reescrita).
- Marca (`marca.ts`): nome Evoluta Gestão, logo próprio, prefixo de storage próprio.

## 4. Plano de implantação
- **G1 — Base pura [config]**: copiar `assets/base` p/ `frontend/` (pasta nova), `npm install && npm run build` verde (JS≈465kB). Aceite: build rc=0.
- **G2 — Marca e menu**: `marca.ts` + logo + `navegacao.ts` + rotas (R-MARCA, R-ROT-04). Aceite: build + checklist visual claro/escuro.
- **G3 — Telas mock**: Minha Mesa, Lista Projetos (gaveta), Projeto (pasta), 5W2H (MesaPagina), Indicadores (livro), resto EmConstrucao. Aceite: R-TEL/R-VER por tela.
- **G4 — Ponte API**: `base_rest` no Odoo (endpoints projeto/task/5w2h/leitura) + `services/api/client.ts` real (`CLIENTE_DE_DEMONSTRACAO=false`) + CORS + login por sessão. Aceite: lista Projetos carrega do banco demo.
- **G5 — Escrita**: criar 5W2H e mover Kanban pela Mesa (POST/PATCH). Aceite: ida-volta sem recarregar.
- **G6 — Deploy**: `frontend/dist` no Nginx + proxy Odoo + SSL (mesma VPS). Aceite: URL pública, login real, 400px ok.
- **G7 — Relato**: formato seção E da skill (o que ficou simulado, o que não foi conferido).

## 5. Riscos
- API/auth antecipam trabalho de Fase 2/3; sem isso a Mesa é só mock bonito.
- Base sem lint/testes; `npm audit` com avisos (R-VER-02/03).
- Tema Odoo nativo continua feio para admin — skill do tema cobre só a Mesa.
- Decisão pendente: subdomínios (app/api) vs path único.
