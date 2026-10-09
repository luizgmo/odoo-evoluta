# Plano de testes e aceite final — Evoluta Gestão

**Projeto:** Evoluta Gestão sobre Odoo Community 19
**Interface testada:** aplicação React
**Engine testada:** Odoo Community 19 + módulos OCA + módulos próprios Evoluta
**Comando Docker obrigatório:** `docker-compose`
**Fonte funcional:** `Conversa_Estrategia_GovTech_Evoluta_Odoo_Community_19.md`
**Fonte visual e de interação:** `.claude/skills/Evoluta_frontend/SKILL.md`
**Plano relacionado:** `docs/PLANO-FRONTEND-USUARIOS-MUNICIPAIS.md`
**Matriz de campos:** `docs/MATRIZ-CAMPOS-FRONTEND.md`

---

## 1. Objetivo e regra de encerramento

Este plano cobre exclusivamente os testes que ainda faltam para transformar a fase implementada em aceite técnico do frontend.

O aceite só poderá ser declarado quando:

1. os quatro perfis entrarem pelo React;
2. o isolamento entre dois municípios for comprovado por interface, rota direta e API;
3. secretaria e departamento forem respeitados;
4. os fluxos reais de projeto, task, Kanban, atividade, 5W2H, ferramentas, Helpdesk, templates, indicadores e auditoria forem persistidos no Odoo;
5. sessão expirada e indisponibilidade do Odoo não produzirem sucesso falso;
6. acessibilidade, responsividade, impressão, temas e PWA forem conferidos;
7. os comandos automatizados listados neste documento passarem;
8. toda falha tiver sido corrigida, aceita formalmente como não bloqueadora ou classificada fora do produto.

Uma execução parcialmente concluída deve ser registrada como **não aprovada**, mesmo que o fluxo principal funcione.

---

## 2. Estado conhecido antes desta etapa

Já validado na fase anterior:

- `npm run typecheck` passa;
- `npm run test` passa com 9 testes;
- `npm run build` passa;
- E2E sem credenciais passa em login inválido, rota protegida e viewport de 400px;
- E2E autenticado está implementado, mas fica `skipped` quando `E2E_LOGIN` e `E2E_PASSWORD` não existem;
- controllers Python passam em `py_compile`;
- atualização dos módulos no Odoo passa dentro do `docker-compose`;
- containers `web` e `db` ficam `Up`;
- requisição sem sessão para `/api/projetos` redireciona para `/web/login`;
- a recuperação de senha fictícia foi removida;
- o backend mantém o escopo por município, secretaria e departamento;
- o logo Evoluta, o domínio municipal e a Mesa Evoluta estão versionados.

O que ainda não está comprovado:

- login autenticado com contas de teste reais;
- matriz completa de quatro perfis e dois municípios;
- cross-tenant por URL, API e payload adulterado;
- workflow completo de todos os módulos;
- indisponibilidade durante GET e POST com dados preenchidos;
- validação visual manual e instalação PWA;
- testes automatizados Odoo com massa controlada;
- decisão sobre as vulnerabilidades herdadas do Tailwind 3.

---

## 3. Regras de segurança da execução

1. Nunca colocar senha, cookie, token ou e-mail pessoal em arquivo versionado.
2. Usar variáveis de ambiente na mesma linha do comando ou arquivo local ignorado pelo Git.
3. Nunca usar banco de produção; usar o banco `demo` somente se a massa puder ser descartada e identificada.
4. Não acessar PostgreSQL diretamente pelo browser; todas as operações do produto devem passar pelo React e pelas APIs Odoo.
5. Não usar mock como caminho de sucesso.
6. Não aceitar esconder um menu como prova de autorização; testar também URL direta e resposta HTTP.
7. Não executar `npm audit fix --force` sem decidir e revisar a migração Tailwind 3 → 4.
8. Não fazer commit ou push de correções adicionais sem aprovação explícita.
9. Após cada teste destrutivo, remover ou arquivar a massa criada.
10. Registrar horário, perfil, município, URL, payload sem segredo, status HTTP, resultado esperado, resultado observado e evidência.

---

## 4. Pré-requisitos obrigatórios

### 4.1 Ambiente

Executar na raiz do repositório:

```bash
docker-compose ps
```

Critério:

- `evoluta_db_1` deve estar `Up`;
- `evoluta_web_1` deve estar `Up`;
- a porta `8069` deve responder.

Se os containers não estiverem ativos:

```bash
docker-compose up -d
docker-compose ps
```

Atualizar os módulos antes da massa de testes:

```bash
docker-compose exec -T web odoo \
  -c /etc/odoo/odoo.conf \
  -d demo \
  -u evoluta_core,evoluta_management,evoluta_strategy,evoluta_templates,evoluta_api \
  --stop-after-init
```

Depois confirmar que o serviço voltou:

```bash
docker-compose ps
```

### 4.2 Frontend

```bash
cd frontend
npm install
npm run typecheck
npm run test
VITE_ODOO_DB=evoluta_staging npm run build
```

O build pode emitir aviso de bundle acima de 500 kB. Esse aviso deve ser registrado, não ignorado silenciosamente.

### 4.3 Contas de teste

Criar, sem versionar senhas, as seguintes contas:

| Código | Perfil | Município | Secretaria | Departamento | Uso |
|---|---|---|---|---|---|
| `SA` | `super_admin` | global | — | — | cria e consulta municípios; auditoria global |
| `AM_A` | `admin_municipal` | Município A | — | — | administração completa de A |
| `AM_B` | `admin_municipal` | Município B | — | — | administração completa de B |
| `SEC_A` | `secretario` | Município A | Secretaria A | — | operação da secretaria A |
| `SEC_B` | `secretario` | Município B | Secretaria B | — | operação da secretaria B |
| `ATE_A` | `atendente` | Município A | Secretaria A | Departamento A1 | operação de tasks/demandas autorizadas |
| `ATE_B` | `atendente` | Município B | Secretaria B | Departamento B1 | operação de tasks/demandas autorizadas |

Regras da massa:

- Município A e Município B precisam ter nomes claramente diferentes;
- Secretaria A e Secretaria B precisam ter nomes claramente diferentes;
- Departamento A1 e Departamento B1 precisam ter nomes claramente diferentes;
- todas as contas devem ser internas, ativas e possuir grupos Odoo corretos;
- o papel deve vir dos grupos Odoo, nunca do login ou do e-mail;
- `ATE_A` deve ter pelo menos uma task atribuída e uma task não atribuída;
- `SEC_A` deve ter pelo menos um projeto geral, um projeto da Secretaria A e um projeto de outra secretaria;
- Município B deve possuir registros equivalentes para impedir falsos positivos de listas vazias.

Variáveis permitidas somente no ambiente local:

```bash
export E2E_BASE_URL=http://127.0.0.1:8080
export E2E_LOGIN=login-de-teste
export E2E_PASSWORD='senha-fornecida-fora-do-repositorio'
```

Para o Playwright, usar uma conta por execução. Nunca gravar essas variáveis em `.env` versionado.

---

## 5. Evidência e planilha de execução

Para cada cenário, registrar:

```text
ID:
Data/hora:
Perfil:
Município:
Pré-condição:
URL inicial:
Ação executada:
Payload enviado sem segredo:
Status HTTP esperado/observado:
Texto esperado/observado:
Registro criado ou alterado:
Auditoria gerada:
Recarga conferida:
Teste de sessão/escopo:
Evidência:
Resultado: PASS / FAIL / BLOCKED / OUT OF SCOPE
Defeito relacionado:
```

Não usar somente screenshot como evidência. O mínimo é URL + texto + rede ou persistência posterior.

---

## 6. Matriz de autenticação e sessão

### AUTH-01 — Login válido de cada perfil

Para `SA`, `AM_A`, `SEC_A` e `ATE_A`:

1. abrir `/login` em contexto de navegador limpo;
2. preencher usuário e senha;
3. clicar uma única vez em `Entrar`;
4. confirmar redirecionamento para `/dashboard`;
5. confirmar nome e papel exibidos;
6. consultar `GET /api/me` pelo contexto autenticado;
7. confirmar `record.role`, `record.permissions`, município e vínculos;
8. recarregar a página;
9. confirmar que a sessão é restaurada pelo cookie Odoo;
10. confirmar que nenhum perfil, município ou permissão foi salvo em `localStorage`.

Aceite:

- login válido chega à Mesa;
- `GET /api/me` retorna dados coerentes com os grupos;
- recarga não perde a sessão;
- a URL não expõe senha, token ou perfil editável.

### AUTH-02 — Login inválido

1. usar usuário inexistente e senha inválida;
2. clicar em `Entrar`;
3. confirmar retorno ou permanência em `/login`;
4. confirmar mensagem acionável;
5. confirmar que o botão deixa o estado de carregamento;
6. consultar uma rota protegida em novo contexto.

Aceite:

- nenhuma sessão é criada;
- nenhuma tela municipal é exibida;
- não há spinner permanente;
- a rota protegida volta para `/login`.

### AUTH-03 — Logout e troca de conta

1. entrar como `AM_A`;
2. confirmar dados de A;
3. fazer logout;
4. confirmar cookie de sessão invalidado;
5. entrar como `AM_B` no mesmo navegador;
6. confirmar que nenhuma lista, indicador ou cache de A aparece.

Aceite:

- nenhum dado de A sobrevive visualmente ou em cache persistente;
- `GET /api/me` retorna B;
- menus e permissões são recalculados.

### AUTH-04 — Sessão expirada no meio de formulário

1. entrar com `AM_A`;
2. abrir `/projetos/new`;
3. preencher nome, orçamento e prazo, sem salvar;
4. invalidar o cookie pelo contexto de teste ou encerrar a sessão no Odoo;
5. enviar o formulário;
6. confirmar erro de sessão ou redirecionamento;
7. confirmar que o projeto não foi criado;
8. repetir com uma alteração de task, comentário e aprovação.

Aceite:

- nenhuma operação é confirmada localmente;
- os valores digitados não desaparecem sem aviso enquanto a tela permanecer;
- retry após novo login usa a sessão nova;
- não há duplicação.

---

## 7. Matriz obrigatória de escopo e autorização

Executar cada cenário com rota direta e, quando aplicável, chamada HTTP direta pelo contexto autenticado.

### SCOPE-01 — Município A contra Município B

Com `AM_A`:

1. abrir lista de projetos;
2. abrir um projeto de A;
3. tentar `/projetos/{id-do-projeto-B}`;
4. tentar `/documents/{id-do-projeto-B}`;
5. tentar `/projetos/{id-B}/kanban`;
6. tentar `GET /api/projetos/{id-B}`;
7. tentar alterar B por `PATCH`;
8. tentar arquivar B;
9. tentar listar secretaria, task, 5W2H, chamado, anexo e auditoria de B.

Aceite:

- B nunca aparece na lista de A;
- detalhe e documento retornam não encontrado ou proibido, sem dados de B;
- alteração e arquivamento não ocorrem;
- a UI não cria sucesso falso.

Repetir espelhado com `AM_B` contra A.

### SCOPE-02 — Secretaria alheia

Com `SEC_A`:

1. abrir projeto geral de A, quando permitido;
2. abrir projeto da Secretaria A;
3. tentar projeto de outra secretaria de A;
4. tentar criar projeto apontando `secretaria_id` alheia;
5. tentar trocar secretaria de projeto por `PATCH`;
6. tentar consultar suas tasks e ferramentas.

Aceite:

- a regra definida pelo backend é aplicada de forma consistente;
- secretaria alheia não pode ser escrita;
- projeto fora do escopo não é exibido como sucesso.

### SCOPE-03 — Departamento alheio

Com `ATE_A`:

1. listar projetos;
2. confirmar que projetos do Departamento A1 aparecem conforme regra;
3. tentar abrir projeto exclusivo de A2;
4. tentar abrir task de A2;
5. tentar `GET`, `PATCH`, mover e concluir task alheia;
6. tentar adulterar `departamento_id` no payload.

Aceite:

- A2 não aparece;
- task não atribuída não pode ser operada pelo atendente;
- payload adulterado não amplia escopo.

### SCOPE-04 — Menu versus rota direta

Para cada perfil:

1. salvar a lista de itens do menu;
2. acessar diretamente todas as rotas existentes;
3. comparar menu, guarda React e resposta do backend;
4. testar `/templates`, `/configuracoes/organizacao`, `/configuracoes/usuarios`, `/auditoria` e `/metrics`.

Aceite:

- item oculto também é recusado pela URL;
- `403` nunca é transformado em tela vazia de sucesso;
- perfil sem auditoria não acessa auditoria.

---

## 8. Projeto e organização municipal

### PROJ-01 — Criação completa

Com `SA`:

1. abrir `Novo projeto`;
2. selecionar Município A;
3. confirmar carregamento das secretarias de A;
4. selecionar Secretaria A;
5. confirmar carregamento dos departamentos de A;
6. selecionar Departamento A1;
7. selecionar responsável de A;
8. selecionar etapa real;
9. preencher nome com acentos e Unicode controlado;
10. preencher orçamento com `1.234,56`;
11. preencher prazo válido;
12. salvar uma única vez;
13. confirmar `201` e redirecionamento para o projeto/5W2H;
14. recarregar e consultar a lista.

Aceite:

- todas as relações persistem no Odoo;
- secretaria/departamento/responsável pertencem ao município correto;
- o frontend não envia IDs de relações antigas após trocar município;
- valor e data retornam iguais após recarga;
- há auditoria de criação.

### PROJ-02 — Validações

Tentar, individualmente:

- nome vazio;
- nome somente com espaços;
- orçamento vazio;
- orçamento negativo;
- orçamento `abc`;
- orçamento infinito ou payload numérico inválido;
- data inválida por payload;
- secretaria de B com Município A;
- departamento de B com Secretaria A;
- responsável de B com projeto de A;
- município vazio para `SA`.

Aceite:

- erro próximo ao formulário ou mensagem acionável;
- status `400` ou `403` conforme contrato;
- valores digitados permanecem;
- nenhum registro parcial é criado.

### PROJ-03 — Edição e arquivamento

1. editar cada campo autorizado;
2. recarregar;
3. conferir `created_at` e `updated_at` vindos do Odoo;
4. arquivar com `SA` e `AM_A`;
5. confirmar que sai das listas ativas;
6. abrir Arquivo;
7. confirmar que histórico continua disponível;
8. confirmar que `SEC_A` e `ATE_A` não recebem ação de arquivar.

---

## 9. Tasks e Kanban

### TASK-01 — Criação e edição

Com `AM_A` ou `SEC_A`:

1. abrir tasks do projeto A;
2. criar task com nome, etapa, prazo e responsável;
3. salvar;
4. recarregar;
5. editar nome, prazo, etapa e responsável;
6. confirmar persistência;
7. tentar duplo clique no botão.

Aceite:

- uma única task é criada;
- botão fica desabilitado durante escrita;
- erro preserva o formulário;
- task pertence ao projeto correto.

### KANBAN-01 — Movimento e rollback

1. abrir Kanban;
2. mover por select acessível;
3. recarregar e conferir etapa;
4. mover por arrastar e soltar;
5. derrubar o Odoo antes do POST;
6. confirmar rollback visual e mensagem de erro;
7. repetir com task atribuída ao `ATE_A`.

Aceite:

- select é alternativa completa ao drag-and-drop;
- o movimento persistido bate com Odoo;
- falha não confirma movimento;
- atendente só move task que o backend autorizou.

### TASK-02 — Conclusão e arquivamento

1. concluir uma task aberta;
2. confirmar etapa final real;
3. recarregar;
4. arquivar com admin;
5. confirmar ausência em listas ativas;
6. tentar arquivar com secretário e atendente.

---

## 10. Atividades e agenda

### ACT-01 — Atividade

1. criar atividade com resumo, nota, data e responsável;
2. confirmar `201`;
3. recarregar projeto;
4. abrir `/agenda` no intervalo correto;
5. editar nota, data e responsável;
6. concluir;
7. confirmar que sai da lista pendente e não desaparece silenciosamente do histórico aplicável.

Aceite:

- atividade está vinculada ao projeto real;
- responsável é do município;
- agenda mostra o registro persistido;
- data não sofre deslocamento UTC;
- erro de rede preserva o formulário.

### ACT-02 — Agenda sem dados e indisponível

- intervalo sem eventos deve mostrar vazio legítimo;
- erro de GET deve mostrar erro e retry;
- Odoo desligado não pode virar agenda vazia falsa;
- eventos de Município B não podem aparecer para A.

---

## 11. 5W2H, aprovação e idempotência

### W2H-01 — Os sete campos

Criar e editar plano com:

- What;
- Why;
- Where;
- When;
- Who;
- How;
- How much.

Testar What vazio, espaços, acentos, data inválida, valor negativo, decimal com vírgula e responsável de outro município.

Aceite:

- `What` é obrigatório;
- valor não negativo é persistido sem perda;
- `who_id` é validado pelo município;
- não existe plano sem projeto.

### W2H-02 — Workflow

1. criar rascunho;
2. solicitar validação;
3. conferir estado e revisões;
4. aprovar com revisor válido;
5. tentar aprovar com perfil inválido;
6. reiniciar quando permitido;
7. recarregar em cada etapa;
8. confirmar auditoria de cada ação.

### W2H-03 — Geração idempotente de task

1. aprovar o plano;
2. clicar `Gerar task`;
3. recarregar;
4. clicar novamente ou enviar a mesma ação duas vezes;
5. contar tasks no Odoo;
6. confirmar um único vínculo `task_id`.

Aceite: uma ação 5W2H nunca gera task duplicada.

### W2H-04 — Plano legado

Confirmar no banco/Odoo:

- `what_nulo = 0`;
- coluna `what` continua `NOT NULL`;
- registros arquivados/quarentenados não aparecem na lista ativa;
- nenhum texto legado é apresentado como dado operacional.

---

## 12. Ferramentas metodológicas

Executar para cada ferramenta e registrar o identificador criado:

| Ferramenta | Criar | Editar | Arquivar | Gerar ação/task | Idempotência |
|---|---:|---:|---:|---:|---:|
| 5 Porquês | sim | sim | sim | sim | sim |
| Risco | sim | sim | sim | sim | sim |
| Ishikawa | sim | sim | sim | sim | sim |
| RACI | sim | sim | sim | não aplicável | sim |
| Matriz de decisão | sim | nome | sim | gerar 5W2H | sim |
| Triângulo estratégico | sim | sim | sim | conforme contrato | sim |
| Árvore de problemas | sim | sim | sim | converter objetivos | sim |
| Teoria da mudança | sim | sim | sim | conforme contrato | sim |
| Stakeholders | sim | sim | sim | conforme contrato | sim |

Para cada ferramenta:

1. abrir o projeto correto;
2. enviar valores mínimos válidos;
3. testar espaços e campos obrigatórios;
4. usar acentos e Unicode;
5. salvar e recarregar;
6. editar somente campos autorizados;
7. arquivar quando aplicável;
8. confirmar que registro arquivado sai da lista ativa;
9. tentar ID de outro município;
10. confirmar auditoria;
11. repetir ações derivadas e contar registros.

### ARV-01 — Árvore de problemas → objetivos

1. criar árvore com problema central, causas e efeitos;
2. converter uma vez;
3. confirmar árvore de objetivos real;
4. recarregar;
5. converter novamente;
6. confirmar que não duplica objetivos;
7. gerar 5W2H derivado uma vez;
8. repetir e confirmar idempotência;
9. confirmar vínculo de origem e destino.

---

## 13. Helpdesk, SLA, Chatter e anexos

### TICKET-01 — Demanda

Com cada perfil autorizado:

1. criar chamado com título, descrição e prioridade;
2. confirmar município/secretaria/departamento derivados da sessão;
3. abrir detalhe;
4. editar como perfil permitido;
5. tentar editar como atendente;
6. mover estágio;
7. concluir;
8. recarregar.

Aceite:

- organização não é escolhida livremente por usuário municipal;
- permissões são aplicadas pelo backend;
- descrição HTML é exibida como texto seguro;
- SLA é leitura real, não input inventado.

### TICKET-02 — Equipe e responsável

1. atribuir equipe;
2. atribuir responsável válido da equipe;
3. tentar responsável fora da equipe;
4. tentar responsável de outro município;
5. confirmar erro sem perder dados;
6. recarregar e confirmar responsável válido preservado.

### TICKET-03 — Comentário e anexo

1. adicionar comentário vazio e somente espaços;
2. adicionar comentário com acentos e caracteres `<script>`;
3. confirmar que HTML não executa;
4. anexar arquivo válido abaixo de 10 MiB;
5. baixar pelo link real;
6. tentar arquivo acima de 10 MiB;
7. tentar MIME inadequado;
8. tentar baixar anexo de B com A;
9. confirmar auditoria e escopo.

---

## 14. Templates e jobs

Com `SA`, `AM_A` e `SEC_A` conforme permissão:

1. abrir `/templates`;
2. confirmar que modelos são reais do Odoo;
3. iniciar um job para Município A;
4. confirmar sequência `pending → started → done`;
5. abrir o projeto criado;
6. conferir município, secretaria e dados derivados;
7. recarregar e confirmar persistência;
8. executar novamente e confirmar regra de duplicação;
9. simular ou aguardar `failed`;
10. confirmar mensagem de erro e retry controlado;
11. tentar usar template por perfil sem permissão;
12. tentar abrir projeto criado em A com B.

Aceite:

- job não é tratado como concluído antes do estado real;
- timeout não inventa projeto;
- tenant do job é mantido;
- falha não cria projeto parcial apresentado como sucesso.

---

## 15. Indicadores e auditoria

### IND-01 — Indicadores municipais

Para A e B:

1. abrir `/metrics` com perfil autorizado;
2. conferir projetos, tasks, concluídas, abertas, atrasadas, taxa e chamados;
3. comparar com registros reais no Odoo;
4. criar uma task e recarregar;
5. concluir a task e recarregar;
6. confirmar mudança dos números;
7. comparar agrupamento por secretaria;
8. confirmar que zero significa zero real e não falha de carregamento.

### AUD-01 — Auditoria

1. criar, editar, arquivar e executar workflow;
2. abrir `/auditoria` com `SA`;
3. confirmar usuário, município, entidade, operação, registro e data;
4. abrir com `AM_A`;
5. confirmar somente município A;
6. tentar filtros de período inválidos;
7. tentar auditoria com secretário e atendente;
8. confirmar leitura somente, sem ações de edição/exclusão.

---

## 16. Indisponibilidade e recuperação

Executar cada grupo com dados preenchidos, não somente em tela vazia.

### DOWN-01 — GET

1. abrir tela autenticada;
2. executar `docker-compose stop web`;
3. iniciar uma busca de projetos, Kanban, agenda, indicador e Helpdesk;
4. confirmar erro acionável;
5. confirmar ausência de registros inventados;
6. confirmar que não há spinner infinito;
7. executar retry;
8. executar `docker-compose start web`;
9. confirmar recuperação real.

### DOWN-02 — POST/PATCH

1. preencher projeto, task, 5W2H, comentário e anexo;
2. desligar o `web` imediatamente antes de salvar;
3. confirmar que o botão não confirma operação;
4. conferir valores digitados;
5. iniciar o serviço;
6. retry manual;
7. consultar o Odoo e contar registros.

Aceite: nenhum POST é repetido automaticamente sem idempotência comprovada.

### DOWN-03 — Registro de falha

Para cada falha, registrar:

- status visual;
- status de rede, quando disponível;
- se o botão foi desabilitado;
- se houve duplicação;
- se houve perda de dados;
- resultado após retry.

---

## 17. Acessibilidade e responsividade

Executar manualmente em navegador Chromium ou equivalente, com teclado e leitor visual.

Viewports mínimos:

- 400 × 800;
- 768 × 1024;
- 1280 × 800;
- 1440 × 900.

### A11Y-01 — Teclado

- login;
- menu lateral;
- menu mobile;
- busca rápida;
- formulários;
- selects dependentes;
- confirmação de ações;
- tabs da pasta;
- Kanban por select, sem depender de drag;
- Helpdesk;
- auditoria.

Confirmar:

- foco sempre visível;
- ordem lógica;
- Escape fecha diálogos;
- Enter aciona o controle correto;
- nenhum controle só de ícone fica sem nome acessível;
- `role=alert` anuncia erro;
- `role=status` anuncia sucesso.

### A11Y-02 — Responsividade

Em cada viewport:

- não existe corte horizontal;
- texto não é sobreposto;
- carimbos não cobrem títulos;
- campos continuam utilizáveis;
- menu mobile abre e fecha;
- tabelas/listas não perdem identificação;
- Kanban permanece operável sem arrastar.

### A11Y-03 — Tema

Repetir telas principais em claro e escuro:

- login;
- Mesa;
- lista e pasta;
- formulário;
- Kanban;
- 5W2H;
- Helpdesk;
- indicadores;
- auditoria.

Confirmar contraste, foco, carimbos, mensagens de erro e campos desabilitados.

---

## 18. Impressão e PWA

### PRINT-01 — Impressão

Para ficha de projeto, documento, 5W2H e auditoria:

1. abrir visualização de impressão;
2. confirmar remoção de menu, botões e ações;
3. manter identificação, campos e situação;
4. confirmar ausência de credenciais, tokens e dados de B;
5. confirmar que documento não é vazio;
6. confirmar que texto essencial não é cortado.

### PWA-01 — Instalação e cache

1. servir build de produção;
2. confirmar manifest válido;
3. confirmar nome e logo Evoluta;
4. instalar em navegador compatível;
5. abrir shell sem Odoo;
6. confirmar que `/api` e `/web` não ficam em cache persistente;
7. fazer logout;
8. entrar como B no mesmo navegador;
9. confirmar que nenhum dado de A aparece offline;
10. publicar nova versão;
11. confirmar atualização do service worker.

O shell offline pode abrir a estrutura visual, mas nunca pode afirmar dados municipais sem API.

---

## 19. Auditoria de strings e segurança do frontend

Executar buscas no frontend:

```bash
grep -RniE 'licitars|licitac|edital|preg[aã]o|proposta|14\.133|reset-password|demonstração|mock|fake|Em construção' frontend/src frontend/public frontend/index.html
```

Classificar cada ocorrência:

- nome de código inevitável;
- documentação técnica não exibida;
- defeito de texto de tela;
- defeito de fluxo demonstrativo.

Aceite:

- zero ocorrência operacional de LicitarsAI/licitação;
- zero formulário que aceite informação sem endpoint real;
- zero credencial ou token em fonte, bundle ou documentação versionada;
- nenhum dado de outro município no HTML inicial ou cache.

Auditar dependências:

```bash
cd frontend
npm audit --audit-level=moderate
```

O resultado conhecido do Tailwind 3 deve ser registrado. Não corrigir com `--force` sem plano de migração e novo ciclo de build/teste visual.

---

## 20. Execução automatizada final

Executar na ordem:

```bash
cd frontend
npm run typecheck
npm run test
VITE_ODOO_DB=evoluta_staging npm run build
npm run test:e2e
```

E no backend:

```bash
cd ..
python3 -m py_compile \
  addons/evoluta/evoluta_api/controllers/*.py \
  addons/evoluta/evoluta_core/models/*.py \
  addons/evoluta/evoluta_management/models/*.py \
  addons/evoluta/evoluta_management/migrations/19.0.1.0.1/*.py \
  addons/evoluta/evoluta_strategy/models/*.py \
  addons/evoluta/evoluta_templates/models/*.py

git diff --check
docker-compose ps
```

Se forem implementados testes Odoo automatizados, executá-los no banco descartável com `--test-enable`, registrar o comando exato e anexar quantidade de testes, aprovados, falhas e skips.

---

## 21. Critérios de bloqueio

O aceite final fica **BLOQUEADO** se qualquer item ocorrer:

- E2E autenticado continua `skipped`;
- um usuário A enxerga ou altera registro B;
- perfil sem permissão acessa rota direta;
- POST/PATCH confirma sucesso sem resposta real;
- retry duplica projeto, task, plano, objetivo ou job;
- sessão expirada mantém tela municipal como se autenticada;
- Odoo indisponível mostra zero como dado válido;
- campo editável não possui endpoint real;
- anexo ou comentário vaza escopo;
- impressão ou PWA expõe dados de outro município;
- erro de acessibilidade impede operação por teclado;
- build, typecheck ou testes automatizados falham;
- existe traceback novo no log do Odoo causado pela entrega.

---

## 22. Definition of Done desta etapa

A etapa será concluída quando existir um relatório preenchido contendo:

- contas e massa usadas, sem senhas;
- matriz de autorização por perfil;
- matriz Município A × Município B;
- evidência dos endpoints e status HTTP;
- resultado de cada fluxo operacional;
- resultado de idempotência;
- resultado de indisponibilidade e retry;
- resultado de sessão expirada;
- resultado visual em 400px, tablet e desktop;
- resultado claro/escuro;
- resultado de teclado e acessibilidade;
- resultado de impressão;
- resultado de PWA;
- saída dos comandos automatizados;
- lista de defeitos corrigidos;
- lista de pendências aceitas ou bloqueadoras;
- decisão explícita: `GO`, `GO COM RESSALVAS` ou `NO-GO`.

A decisão padrão, na ausência de evidência, é `NO-GO`.

---

## 23. Entregável do próximo ciclo

O próximo ciclo deve produzir:

1. atualização do Playwright para aceitar a matriz de contas sem credenciais versionadas;
2. massa controlada documentada ou script descartável aprovado;
3. execução de todos os IDs deste plano;
4. correção dos defeitos encontrados;
5. nova rodada completa de typecheck, unitários, build, E2E e Odoo;
6. atualização de `docs/RELATORIO-VALIDACAO-FRONTEND.md`;
7. decisão de aceite;
8. somente depois da aprovação explícita, commits e push das correções.
