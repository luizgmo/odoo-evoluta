# Matriz de campos do frontend — Evoluta Gestão

> Documento de aceite técnico. Todo valor exibido pela aplicação deve estar nesta matriz. A fonte oficial é o Odoo; o React apenas apresenta, valida superficialmente e envia comandos pelos endpoints documentados. `Sem ...`, `Não informado` e `—` são estados de leitura para valores ausentes no Odoo, não valores que o usuário possa escolher para satisfazer uma obrigatoriedade.

## Convenções

- **Perfis:** `SA` = super_admin da Evoluta; `AM` = admin_municipal; `SEC` = secretario; `ATE` = atendente.
- **Escopo:** todas as consultas de entidade municipal passam pelas regras do backend. IDs recebidos pelo navegador não são considerados autorização.
- **Auditoria:** `criação`, `update`, `archive` e `workflow` significam registro em `evoluta.auditoria`, quando a operação correspondente já é auditada pelo backend.
- **Derivado:** calculado pelo Odoo ou pelo React a partir de campos reais; nunca editável.

## 1. Sessão e navegação

| Tela/rota | Entidade | Rótulo/valor | API/origem | Tipo/leitura/escrita | Obrigatoriedade e validação | Perfis | Estado/auditoria/teste |
|---|---|---|---|---|---|---|---|
| `/login` | sessão | Usuário | `/web/session/authenticate` → `login` | texto; escrita JSON-RPC; não persistir | obrigatório; trim; mensagem de credencial inválida | todos sem sessão | erro sem sessão; `AUTH-01`, `AUTH-02`; não auditado |
| `/login` | sessão | Senha | `/web/session/authenticate` → `password` | senha; escrita JSON-RPC; nunca armazenada | obrigatório; `autocomplete=current-password` | todos sem sessão | erro de autenticação; `AUTH-01`, `SEC-01` |
| layout autenticado | perfil | nome, papel, município, secretaria, departamento | `GET /api/me` | somente leitura; `record.name`, `role`, relações | valor real ou sessão inválida | todos | erro direciona ao login; `AUTH-03`, `SCOPE-01` |

## 2. Projeto — `/projetos`, `/projetos/new`, `/projetos/:id`, `/projetos/:id/editar`

| Campo exibido | Chave/API | Origem Odoo ou cálculo | Leitura | Escrita | Obrigatoriedade/perfis | Estado/teste |
|---|---|---|---|---|---|---|
| Código `EVG-00000` | `id` + cálculo de apresentação | `project.project.id`; prefixo é somente identificação visual | `GET /api/projetos`, `GET /api/projetos/:id` | somente leitura | derivado; todos no escopo | vazio/erro/escopo; `PROJ-01` |
| Nome do projeto | `name` | `project.project.name` | mesmas rotas | `POST /api/projetos`, `PATCH /api/projetos/:id` | obrigatório; trim; não vazio; SA/AM/SEC criam/editam conforme escopo; ATE não | `PROJ-01..04` |
| Município | `municipio_id`, `municipio` | `evoluta.municipio` relacionado | mesmas rotas; seleção em criação apenas quando permitido | POST/PATCH `municipio_id`; AM/SEC não podem trocar tenant | SA pode selecionar; AM/SEC ficam fixos no próprio; ATE somente leitura | escopo A/B; `SCOPE-01..04` |
| Secretaria | `secretaria_id`, `secretaria` | `evoluta.secretaria` | GET; opções `GET /api/secretarias?municipio_id=` | POST/PATCH `secretaria_id` | opcional para projeto geral; SEC/ATE ficam no próprio escopo | seleção limpa departamento; `PROJ-05` |
| Departamento | `departamento_id`, `departamento` | `evoluta.departamento` | GET; opções `GET /api/departamentos?secretaria_id=` | POST/PATCH `departamento_id` | opcional quando há secretaria; nunca aceitar departamento de outra secretaria | `PROJ-05`, `SCOPE-03` |
| Prazo final | `date_deadline`, `date_deadline` | `project.project.date` | GET | POST/PATCH | opcional; ISO `YYYY-MM-DD`; exibido como ausência somente em leitura | `PROJ-06`, agenda |
| Orçamento inicial (R$) | `orcamento` | `project.project.evoluta_orcamento` | GET | POST/PATCH | decimal não negativo; vírgula brasileira convertida antes do envio; 0 é valor real permitido | `PROJ-07` |
| Responsável | `responsavel_id`, `responsavel` | `project.project.user_id` | GET; `GET /api/usuarios` | POST/PATCH `responsavel_id` | opcional; usuário deve ser do município do projeto | `PROJ-08`, `SCOPE-04` |
| Etapa atual | `etapa_id`, `etapa` | `project.project.stage_id` | GET; `GET /api/projeto-etapas` | POST/PATCH `etapa_id` | opcional; etapa deve existir no Odoo; workflow/readonly visual | `PROJ-09` |
| Ativo/arquivado | `active` | `project.project.active` | GET com `?arquivados=1` | `POST /api/projetos/:id/arquivar` | somente SA/AM; não é input livre | `ARCH-01`, auditoria archive |
| Data de abertura/atualização | `created_at`, `updated_at` | `project.project.create_date`, `write_date` | GET | somente leitura | pode estar ausente apenas em legado; nunca usar relógio do navegador como fonte | `PROJ-10` |
| Total/concluídas/atrasadas | `total_tasks`, `done_tasks`, `overdue_tasks` | campos computados de `project.project` | lista/indicadores | somente leitura | números calculados pelo Odoo | `IND-01` |

## 3. Task/Kanban — `/projetos/:id/tarefas`, `/projetos/:id/kanban`

| Campo | Chave/API/origem | Leitura | Escrita | Regra | Teste |
|---|---|---|---|---|---|
| Nome da task | `name`, `project.task.name` | `GET /api/projetos/:id` ou `/tasks` | `POST /api/tasks`, `PATCH /api/tasks/:id` | obrigatório; trim; SA/AM/SEC; ATE somente conforme regra de atribuição | `TASK-01`, `TASK-02` |
| Projeto | `project_id`, `project_name` | Odoo relation; rota atual | somente definido pela rota/POST | não editável na tela; backend valida escopo | `SCOPE-02` |
| Etapa | `stage_id`, `stage_name`, `fold` | Odoo `project.task.type` | POST/PATCH ou `POST /mover` | etapa deve pertencer ao projeto | `KANBAN-01..03` |
| Prazo | `date_deadline` | Odoo | POST/PATCH | ISO ou nulo; atraso é cálculo local comparando data, sem alterar Odoo | `TASK-03` |
| Responsáveis | `responsaveis` | Odoo `user_ids` | POST/PATCH `responsavel_id` | usuário do mesmo município; ATE só task autorizada | `TASK-04`, `SCOPE-04` |
| Concluída | `stage.fold`/ação concluir | Odoo | `POST /concluir` | workflow escolhe etapa fechada; botão não simula sucesso | `TASK-05` |
| Arquivada | `active` | Odoo | `POST /arquivar` | SA/AM; desaparece de listas ativas | `ARCH-02` |
| Arrastar/mover | `stage_id` | estado Kanban carregado do Odoo | `POST /tasks/:id/mover` | alternativa obrigatória por select; rollback visual em erro | `KANBAN-01`, `A11Y-04` |

## 4. Atividades e agenda — `/projetos/:id/atividades`, `/agenda`

| Campo | Chave/origem | Leitura | Escrita | Regra | Teste |
|---|---|---|---|---|---|
| Resumo | `summary`, `mail.activity.summary` | `/api/atividades` | POST/PATCH | obrigatório; trim | `ACT-01` |
| Nota | `note` | `/api/atividades` | POST/PATCH | opcional; texto preservado | `ACT-02` |
| Data | `date_deadline` | `/api/atividades`, `/api/agenda` | POST/PATCH | obrigatório na criação; ISO | `ACT-03` |
| Responsável | `responsavel_id`, `responsavel` | relação Odoo; usuários municipais | POST/PATCH | padrão é sessão atual; município igual ao projeto | `ACT-04` |
| Concluída | `done` | retorno/lista Odoo; concluídas deixam a lista pendente | `POST /concluir` | somente ação; não input | `ACT-05` |
| Evento de agenda | `kind`, `date`, `title`, `project_id`, `project_name` | cálculo de apresentação sobre projeto/atividade Odoo | somente leitura | agenda não cria dados por si | `AGENDA-01` |

## 5. 5W2H — `/projetos/:id/w2h`

| Campo | Chave/origem | Leitura | Escrita | Regra | Teste |
|---|---|---|---|---|---|
| Nome do plano | `name` | `GET /api/5w2h?project_id=` | POST/PATCH | opcional; fallback do Odoo é o What | `W2H-01` |
| What — o quê | `what` | mesma | POST/PATCH | obrigatório, trim; NOT NULL no modelo | `W2H-01`, `LEGACY-01` |
| Why — por quê | `why` | mesma | POST/PATCH | opcional | `W2H-02` |
| Where — onde | `where` | mesma | POST/PATCH | opcional | `W2H-03` |
| When — quando | `date_deadline` | mesma | POST/PATCH | opcional; data ISO | `W2H-04` |
| Who — responsável | `who_id`, `who_name` | relação `res.users` | POST/PATCH | opcional; mesmo município | `W2H-05` |
| How — como | `how` | mesma | POST/PATCH | opcional | `W2H-06` |
| How much — quanto | `how_much` | `evoluta.5w2h.how_much` | POST/PATCH | decimal não negativo; vírgula convertida | `W2H-07` |
| Estado do plano | `state` | workflow Odoo | somente leitura | rascunho/em validação/aprovado/cancelado | `W2H-08` |
| Validação/revisões | `validation_status`, `reviews` | revisão Odoo | ações `/solicitar-validacao`, `/aprovar`, `/reiniciar-validacao` | botões aparecem somente pelas flags `can_*`; aprovação segue tier Odoo | `W2H-09..11` |
| Task gerada | `task_id` | relação Odoo | `/gerar-task` | idempotente; uma ação não duplica task | `W2H-12` |

## 6. Ferramentas metodológicas

As rotas são divisórias dentro de `/projetos/:id`: `porques`, `riscos`, `ishikawa`, `raci`, `matriz`, `estrategia`, `stakeholders`.

| Ferramenta/campo | API/origem | Escrita | Validação e regra | Teste |
|---|---|---|---|---|
| 5 Porquês: nome, problema, `pq1..pq5`, causa raiz | `/api/porques`; modelos `evoluta.cinco_porques` | POST/PATCH; arquivar; criar ação | problema obrigatório; ação só com causa raiz; task é derivada/idempotente | `TOOL-PQ-01..04` |
| Risco: nome, probabilidade, impacto, mitigação, responsável | `/api/riscos`; `evoluta.risco` | POST/PATCH; arquivar; criar ação | nome obrigatório; seleções fechadas; responsável municipal; ação requer mitigação | `TOOL-RISCO-01..04` |
| Ishikawa: nome, problema, categoria, descrição, principal, causa raiz | `/api/ishikawa`; causas filhas Odoo | POST/PATCH; definir raiz; arquivar; criar ação | problema obrigatório; categorias fechadas; causa raiz vem do workflow | `TOOL-ISH-01..04` |
| RACI: task, Responsible, Accountable, Consulted, Informed | `/api/raci`; `evoluta.raci` | POST/PATCH; arquivar | task do projeto; R/A obrigatórios e diferentes; usuários do município | `TOOL-RACI-01..04` |
| Matriz: nome, critérios, pesos, alternativas, notas, vencedor | `/api/matriz`; modelos de matriz | POST; PATCH apenas nome; arquivar; gerar 5W2H | pelo menos critério/alternativa; nomes obrigatórios; vencedor e totais derivados pelo Odoo | `TOOL-MAT-01..04` |
| Triângulo: nome, valor público, legitimidade, capacidade | `/api/estrategia/triangulo` | POST/PATCH; arquivar | três campos metodológicos obrigatórios | `TOOL-EST-01..03` |
| Árvore de problemas: nome, causas, problema central, efeitos | `/api/estrategia/arvores-problemas` | POST/PATCH; arquivar; converter | problema central obrigatório; conversão idempotente | `TOOL-ARV-01..04` |
| Árvore de objetivos/5W2H derivado | `/api/estrategia/arvores-objetivos/:id/gerar-5w2h` | ação Odoo | somente leitura no frontend atual; origem/destino exibidos | `TOOL-ARV-05` |
| Teoria da mudança: nome, contexto, insumos, atividades, produtos, resultados | `/api/teoria` | POST/PATCH; arquivar | textos persistidos; campos vazios são aceitos pelo modelo e exibidos como ausência | `TOOL-TEO-01..03` |
| Stakeholder: nome, organização, poder, interesse, posição, influência, estratégia | `/api/stakeholders` | POST/PATCH; arquivar | nome obrigatório; seleções fechadas | `TOOL-STK-01..03` |

## 7. Helpdesk — `/chamados`, `/chamados/:id`

| Campo | Chave/origem | Leitura | Escrita | Regra | Teste |
|---|---|---|---|---|---|
| Título | `titulo` ← `helpdesk.ticket.name` | `/api/chamados` e detalhe | POST/PATCH | obrigatório; atendente cria, mas não edita | `TICKET-01..03` |
| Descrição | `descricao` ← HTML sanitizado/escapado pelo backend | mesmas | POST/PATCH | obrigatório; frontend remove tags na leitura | `TICKET-01`, `SEC-02` |
| Município/secretaria/departamento | relações `municipio`, `secretaria`, `departamento` | detalhe | organização é definida pelo escopo da sessão; não há inputs operacionais no React atual | SA/AM/SEC/ATE conforme regras backend | `TICKET-SCOPE-01..03` |
| Prioridade | `prioridade`, `prioridade_label` | lista/detalhe | PATCH | seleção Odoo `0..3`; editar somente perfis permitidos | `TICKET-04` |
| Equipe | `equipe_id`, `equipe_nome` | equipes GET | POST/PATCH/atribuir | equipe real; responsável deve pertencer à equipe | `TICKET-05` |
| Responsável | `responsavel` | detalhe | atribuir | relação Odoo; preservada quando equipe não muda; valida município/equipe | `TICKET-06` |
| Estágio/situação | `estagio_id`, `estagio_nome`, `situacao_key` | detalhe | `POST /mover`, concluir | workflow Helpdesk; somente opções do Odoo | `TICKET-07` |
| SLA/prazo | `prazo`, `sla_status` | Odoo/OCA calculado | somente leitura | dentro do prazo, vencido ou sem prazo; não input nesta versão | `TICKET-08` |
| Comentário | `comentarios[].body` | detalhe com chatter | POST `/comentarios` | texto não vazio; HTML exibido como texto seguro | `TICKET-09` |
| Anexo | `anexos[]`: nome, MIME, tamanho, URL | detalhe | POST `/anexos` base64; download GET | máximo 10 MiB no frontend e backend; download respeita escopo | `TICKET-10..12` |

## 8. Administração

| Tela/campo | API/origem | Escrita/perfil | Regra | Teste |
|---|---|---|---|---|
| Município: nome, código IBGE, ativo | `/api/municipios`; `evoluta.municipio` | SA apenas: POST/PATCH | AM não vê ações de editar/desativar município | `ORG-01..03` |
| Secretaria: nome, município, ativo | `/api/secretarias`; `evoluta.secretaria` | POST/PATCH SA/AM dentro do escopo | município é relação fixa; não aceitar cross-tenant | `ORG-04` |
| Departamento: nome, secretaria, município, ativo | `/api/departamentos`; `evoluta.departamento` | POST/PATCH SA/AM dentro do escopo | secretaria selecionada deve ser a proprietária | `ORG-05` |
| Usuário: nome, login, e-mail | `/api/usuarios`; `res.users` | POST/PATCH SA/AM | login único; e-mail formato válido quando informado | `USER-01..03` |
| Senha temporária | `password` apenas POST/PATCH | escrita, nunca GET/lista | não exibir depois de salvar; não persistir no browser | `SEC-03` |
| Perfil | `role` derivado de grupos Odoo | criação SA; AM não cria AM; não é login/e-mail | grupos são a fonte de autoridade | `AUTH-04`, `USER-04` |
| Vínculos do usuário | `municipio_id`, `secretaria_id`, `departamento_id` | POST/PATCH com dependências | AM não troca município; SEC/ATE exigem secretaria; ATE exige departamento | `USER-05`, `SCOPE-03` |
| Ativo | `active` | PATCH; SA/AM dentro do escopo | desativado não aparece em listas e não autentica | `USER-06` |
| Onboarding | `done` | `/api/onboarding/:id` PATCH | somente se a tela for exposta; valor real do Odoo | `ORG-06` |

## 9. Indicadores e auditoria

| Valor | Origem | Leitura/escrita | Regra/teste |
|---|---|---|---|
| Projetos, tasks, concluídas, abertas, atrasadas, taxa | `/api/indicadores`; consultas Odoo | GET, somente leitura | não confundir zero com indisponível; `IND-01..03` |
| Totais por secretaria | `record.por_secretaria` | GET, somente leitura | agrupamento municipal real; `SCOPE-05` |
| Tasks por etapa | `record.by_stage` | GET, somente leitura | etapa e contagem Odoo; `IND-04` |
| Auditoria: quando, ação, registro, usuário, detalhes | `/api/auditoria`; `evoluta.auditoria` | GET, somente leitura | SA global; AM próprio município; demais sem rota; sem edição | `AUD-01..03` |
| Filtros de período | `from`, `to` query string | GET | datas ISO; período inválido deve retornar erro claro | `AUD-04` |

## 10. Itens deliberadamente ausentes

Os seguintes campos não aparecem como inputs porque não existe contrato operacional aprovado para o frontend nesta entrega: `description` genérica do projeto, arquivo do projeto, SLA manual, tipo manual de atividade, seleção manual do tenant por usuário municipal, edição dos critérios/notas de uma matriz já criada e edição do vínculo de projeto de uma task. Quando o Odoo fornece esses valores como leitura, eles são exibidos somente como derivados; não são simulados com estado local.

Conteúdo de licitação, LicitarsAI, legislação contextual, fornecedor, edital, pregão, proposta e contratação não fazem parte desta matriz nem do produto Evoluta Gestão.

## 11. Evidência mínima de aceite

Cada identificador desta matriz deve apontar, no relatório final, para:

1. arquivo/rota testado;
2. comando ou cenário executado;
3. resposta HTTP observada quando houver;
4. confirmação de recarga/persistência;
5. teste de escopo e perfil;
6. comportamento de erro e retry.

Sem essa evidência o campo permanece pendente, ainda que a tela pareça funcionar.
