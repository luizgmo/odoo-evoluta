# Plano Fase 1 Completa — fonte oficial Conversa_Estrategia (raiz)

Ordem cronológica obrigatória: F1 → F12. Nenhuma fase começa com a anterior reprovada no aceite.

## F1 — OCA lote [CONCLUÍDO 05/10]
Objetivo: instalar os 7 OCA da Fase 1 oficial (§29) sem quebrar o ambiente.
Nota ambiente: `auto_backup` exigiu no container `pip install --break-system-packages packaging "paramiko<4.0.0" pysftp` + restart. Repetir em toda máquina nova e na VPS (ou virar Dockerfile).
Objetivo: instalar os 7 OCA da Fase 1 oficial (§29) sem quebrar o ambiente.
Escopo exato: Helpdesk (+SLA se existir branch), Tier Validation, Auditlog, Auto Backup, Project Timeline, Web Responsive. Somente branch 19.0. Nada de DMS/Sign/queue (Fase 2).
Fora: configurar fluxos; só instalar e abrir telas.
Passos: 1) clonar cada repo branch 19.0 em addons/oca (não commitar código OCA). 2) restart web. 3) Apps > Update List > instalar um por vez.
Aceite rígido:
- [ ] Cada módulo aparece em Apps e instala com status Installed, zero erro no log web.
- [ ] Helpdesk abre kanban; Tier Validation aparece em Config; Auditlog lista logs; Backup agenda criada; Timeline visível em Projeto; Responsive sem quebrar layout desktop.
- [ ] Upgrade de evoluta_core e evoluta_management continua verde após F1.
- [ ] Módulo sem branch 19.0 estável é cortado e registrado aqui como exceção, não trava a fase.
Teste: instalar, abrir cada tela, Upgrade Core+Management, checar `docker-compose logs web` sem Traceback.

## F2 — Core Município/Secretaria/Departamento [CONCLUÍDO 05/10]
Objetivo: hierarquia oficial do §21.
Modelos exatos: `evoluta.municipio` (name required, codigo_ibge char, active), `evoluta.secretaria` (estender atual: add municipio_id required Many2one, department refs), `evoluta.departamento` (name required, secretaria_id required Many2one). Menus: Evoluta > Cadastros > Municípios/Secretarias/Departamentos.
Fora: permissões finas (F3), onboarding (F3).
Aceite:
- [ ] CRUD dos 3 com required funcionando (salvar sem name/município bloqueia).
- [ ] Secretaria sem município não salva. Departamento sem secretaria não salva.
- [ ] Upgrade evoluta_core verde, dados existentes preservados.
Teste: criar município X > secretaria Y ligada a X > departamento Z ligado a Y; tentar salvar secretaria sem município (deve bloquear).

## F3 — Core Permissões/Plano/Onboarding [CONCLUÍDO 05/10]
Notas: Odoo 19 sem category_id em res.groups (grupos sem categoria, atribuir via tela do Grupo). Ícone Aplicativos visível a todos no 19 por padrão, instalação barrada sem admin — aceite ajustado.
Objetivo: quem vê o quê + plano informativo.
Exato: grupos `Evoluta Admin Municipal` (tudo), `Evoluta Secretário` (projetos+ferramentas, sem Apps/Config técnica), `Evoluta Atendente` (só tasks próprias + 5W2H). Modelo `evoluta.plano` (name, max_users int, max_projects int, apenas informativo na Fase 1). Checklist onboarding como página estática em Evoluta > Onboarding (5 passos texto).
Aceite:
- [ ] Usuário Atendente logado não vê menu Apps nem Configurações.
- [ ] Secretário vê Evoluta+Projetos, não vê Apps.
- [ ] Upgrade verde; access.csv cobre todos os modelos novos.
Teste: criar 1 usuário por grupo, logar em janela anônima cada um, conferir menus.

## F4 — 5 Porquês [CONCLUÍDO 06/10]
Objetivo: §18 fiel (Problema > P1..P5 > Causa raiz + botão Criar ação).
Modelo `evoluta.cinco_porques`: name required, project_id required, problema required text, pq1..pq5 text, causa_raiz text required para o botão, task_id readonly, five_w2h_id opcional. Botão `Criar ação`: sem task → cria project.task (name=causa_raiz[:80], project, descrição com cadeia); com task → atualiza, nunca duplica (mesmo padrão P1).
Aceite:
- [ ] Salvar sem problema bloqueia. Botão sem causa_raiz bloqueia com aviso.
- [ ] 1º clique cria 1 task; 2º clique atualiza a mesma (contar tasks do projeto não aumenta).
- [ ] Task criada aparece no Kanban do projeto.
Teste: seguir docs/TESTE-5PORQUES (criar após implementar) nos moldes do TESTE-5W2H.

## F5 — Stakeholders [CONCLUÍDO 06/10]
Objetivo: §18 (poder, interesse, posição, influência, estratégia).
Modelo `evoluta.stakeholder`: name required, project_id required, organizacao char, poder selection (Baixo/Médio/Alto), interesse selection, posicao selection (Apoiador/Neutro/Opositor), influencia selection, estrategia text. Herdar nada de Contacts na Fase 1 (só campo texto organizacao).
Aceite:
- [ ] CRUD com todos os selections obrigatórios funcionando; lista agrupável por projeto.
- [ ] Upgrade verde.
Teste: 3 stakeholders no Demo LGPD com posições distintas.

## F6 — Riscos [CONCLUÍDO 06/10]
Objetivo: risco ligado a projeto + ação.
Modelo `evoluta.risco`: name required, project_id required, probabilidade selection (Baixa/Média/Alta), impacto selection, mitigacao text, responsavel res.users, task_id readonly + botão Gerar ação (mesmo padrão anti-duplicação).
Aceite:
- [ ] Botão sem mitigação bloqueia. Sem duplicar task.
- [ ] Kanban de riscos por projeto abre.
Teste: 2 riscos no demo, 1 com ação gerada.

## F7 — RACI [CONCLUÍDO 07/10]
Nota: M2M duplo p/ res.users exige `relation` explícita. Trava R!=A valida no Salvar (aba da task) e na hora (tela RACI).
Objetivo: matriz por task.
Modelo `evoluta.raci`: task_id required, responsible res.users required, accountable res.users required, consulted_ids Many2many res.users, informed_ids Many2many. Constraint: responsible != accountable (aviso/erro).
Aceite:
- [ ] Salvar com responsible=accountable bloqueia.
- [ ] Visível dentro da task (aba RACI via _inherit view) + menu próprio.
Teste: 1 RACI na task 01 do demo.

## F8 — Ishikawa [CONCLUÍDO 07/10]
Objetivo: §18 com 6 categorias fixas, versão feira sem grafos.
Modelo `evoluta.ishikawa` (name, project_id, problema required) + linhas `evoluta.ishikawa.causa` (ishikawa_id, categoria selection fixa das 6, descricao required). Botão Definir causa raiz (copia 1 causa marcada como principal para campo causa_raiz) + botão Gerar ação.
Aceite:
- [ ] Categoria fora das 6 impossível (selection fechado).
- [ ] Sem causa marcada, botão causa raiz avisa. Ação não duplica.
Teste: 1 Ishikawa com 6 causas (uma por categoria) no demo.

## F9 — Matriz de Decisão
Objetivo: §18 (critérios do gestor).
Modelos: `evoluta.matriz` (name, project_id) + `evoluta.matriz.criterio` (peso float) + `evoluta.matriz.alternativa` (name) + notas `evoluta.matriz.nota` (alternativa, criterio, nota float). Total = soma(nota*peso) calculado; vencedor = maior total (campo compute). Botão Gerar 5W2H (cria evoluta.5w2h com what=vencedor).
Aceite:
- [ ] Total recalcula ao mudar nota/peso (testar 2+1=3).
- [ ] Botão cria exatamente 1 plano 5W2H ligado ao projeto.
Teste: matriz 2 alternativas x 2 critérios no demo.

## F10 — Triângulo + Árvores
Objetivo: §18 fiel em formato texto (sem grafos na Fase 1).
Modelos: `evoluta.triangulo` (project_id, valor_publico text required, legitimidade text required, capacidade text required); `evoluta.arvore.problemas` (project_id, causas text, problema_central required text, efeitos text) + botão Converter em objetivos (cria `evoluta.arvore.objetivos` com espelho editável); objetivos com botão Gerar ação (task).
Aceite:
- [ ] Converter cria exatamente 1 objetivos ligado ao mesmo projeto.
- [ ] Campos required bloqueiam sem texto.
Teste: 1 triângulo + 1 árvore convertida no demo.

## F11 — Indicadores mínimos
Objetivo: fluxo §29 até Indicadores (KPI/MIS só pilotar).
Exato: dashboard em Evoluta > Indicadores com 4 contadores por projeto (total tasks, por etapa via search_count, atrasadas date_deadline<hoje, concluídas fold). Sem MIS na Fase 1 a menos que F1 tenha instalado.
Aceite:
- [ ] Números batem com Kanban (conferir Demo LGPD: total=10+geradas).
- [ ] Trocar filtro de projeto atualiza todos os contadores.
Teste: comparar tela com contagem manual do Kanban.

## F12 — Feira
Objetivo: demo de 5 min travada.
Exato: tasks distribuídas nas 6 colunas; 2 usuários fake criados (F3); staging VPS+SSL no ar com banco demo clonado; roteiro impresso Desafio>5 Porquês>5W2H>task>Kanban>Indicadores; skill tema aplicada se chegar, senão só logo manual.
Aceite:
- [ ] Roteiro executado 2x sem erro e sem wifi (notebook local).
- [ ] Staging abre no domínio com SSL válido.
- [ ] F1–F11 todos com aceite marcado.
