# Plano de Retomada do Frontend — Evoluta Gestão

**Versão:** 1.0  
**Data:** 07/10/2026  
**Documento complementar a:** `docs/PLANO-FRONTEND.md`  
**Objetivo:** concluir a conexão entre as funcionalidades já desenvolvidas no Odoo e a Mesa de Trabalho React, substituindo os mocks restantes por leitura e escrita reais.

> Este documento não substitui `docs/PLANO-FRONTEND.md`. Ele transforma a Fase H daquele documento em um roteiro executável, com contratos, arquivos, estados, testes e critérios de aceite sem depender de decisões implícitas.

---

## 1. Resultado esperado

Ao final deste plano:

1. O usuário autenticado acessará a Mesa usando a sessão real do Odoo.
2. O frontend não exibirá dados inventados nas telas que já possuem funcionalidade correspondente no backend.
3. Cada ferramenta metodológica terá:
   - consulta de registros do projeto ou da task atual;
   - criação de registro;
   - ação específica, quando existir no modelo Odoo;
   - tratamento de carregamento, erro, vazio e conteúdo;
   - mensagens de erro próximas ao ato que falhou;
   - confirmação visual honesta após sucesso.
4. O Odoo continuará sendo a fonte da verdade.
5. A Mesa nunca acessará o PostgreSQL diretamente.
6. As permissões serão aplicadas em três camadas:
   - item escondido no menu;
   - rota protegida no React;
   - modelo/API protegido pelo Odoo.
7. A aplicação continuará funcional nos temas claro e escuro, em aproximadamente 400 px e em desktop.
8. O que permanecer fora da Mesa ficará explicitamente identificado como decisão de escopo, não como falsa funcionalidade.

---

## 2. Fontes oficiais e ordem de precedência

Quando houver conflito entre documentos, usar esta ordem:

1. Código do backend e regras efetivamente instaladas no Odoo.
2. `docs/PLANO-FRONTEND.md`, especialmente as regras da Fase H.
3. `docs/ARQUITETURA.md`.
4. `docs/PLANO-FASE1.md`.
5. `docs/ESTRATEGIA-EVOLUTA-RESUMO.md`.
6. `.claude/skills/Evoluta_frontend/SKILL.md` e suas referências.
7. Este documento, que detalha a execução do plano anterior.

Se uma decisão nova alterar um contrato ou o escopo, atualizar este arquivo antes de implementar a mudança.

---

## 3. Estado conhecido no início da execução

### 3.1 Stack

- Frontend: React 18, TypeScript, Vite, React Router 6.
- Estilo: Tailwind CSS e tokens da Mesa Evoluta.
- API: controllers HTTP do Odoo retornando JSON puro.
- Autenticação: sessão Odoo em cookie HttpOnly.
- Banco: PostgreSQL executado pelo `docker-compose`.
- Odoo: container publicado em `localhost:8069`.
- Dev server frontend: Vite em `localhost:8080`.

### 3.2 Comandos do ambiente

Usar os comandos abaixo. O ambiente deste projeto utiliza `docker-compose`, e não `docker compose`.

```bash
# subir backend e banco
docker-compose up -d

# verificar containers
docker-compose ps

# acompanhar log do Odoo
docker-compose logs -f web

# reiniciar somente o Odoo após alteração de módulo
docker-compose restart web

# frontend
cd frontend
npm install
npm run typecheck
npm run build
npm run dev
```

O proxy do Vite já encaminha:

```text
/api          -> http://localhost:8069
/web/session  -> http://localhost:8069
```

### 3.3 Arquivos com alterações locais já existentes

Não sobrescrever, reverter ou descartar sem revisão explícita:

```text
addons/evoluta/evoluta_api/controllers/main.py
addons/evoluta/evoluta_core/models/project_project.py
frontend/src/hooks/useMesaDados.ts
frontend/src/pages/Formulario.tsx
```

Essas alterações adicionam, entre outras coisas, orçamento do projeto, dados de detalhe e envio do orçamento no formulário.

### 3.4 O que já funciona de forma real

A API existente possui:

| Método | Rota | Situação |
|---|---|---|
| `GET` | `/api/projetos` | existente |
| `GET` | `/api/projetos/<id>` | existente |
| `GET` | `/api/planos` | existente |
| `POST` | `/api/projetos` | existente |
| `POST` | `/api/5w2h` | existente |
| `POST` | `/api/tasks/<id>/mover` | existente |

No frontend já há integração real para:

- login e restauração de sessão Odoo;
- listagem de projetos;
- detalhe de projeto;
- criação de projeto;
- criação de plano 5W2H;
- orçamento do projeto;
- leitura de tasks, etapas e prazos;
- movimentação de task, quando o fluxo de Kanban estiver ligado à tela.

### 3.5 O que ainda está mockado ou incompleto

| Área | Arquivo principal | Situação atual | Resultado desejado |
|---|---|---|---|
| 5W2H | `pages/ferramentas/Ferramentas.tsx` | criação parcialmente real | leitura, criação, aprovação e geração de task reais |
| 5 Porquês | `pages/ferramentas/Ferramentas.tsx` | formulário local | GET/POST + Criar ação |
| Ishikawa | `pages/ferramentas/Ferramentas.tsx` | formulário local | GET/POST + causas + definir causa raiz + ação |
| Matriz | `pages/ferramentas/Ferramentas.tsx` | formulário local | critérios, alternativas, notas, totais e 5W2H reais |
| RACI | `pages/ferramentas/Ferramentas.tsx` | formulário local | leitura/criação por task, com usuários Odoo reais |
| Riscos | `pages/ferramentas/Ferramentas.tsx` | formulário local | GET/POST + Gerar ação |
| Estratégia | `pages/ferramentas/Ferramentas.tsx` | formulário local incompleto | Triângulo, árvores e Teoria da Mudança reais |
| Stakeholders | ainda não há tela | inexistente no frontend | nova divisória, lista e criação |
| Templates | `pages/Templates.tsx` | dados locais e botão simulado | GET real + job de geração |
| Chamados | `pages/Chamados.tsx` | três registros fixos | GET real + criação de ticket |
| Kanban do projeto | ainda não há tela própria | API existente, interface ausente | quadro visual com cards reais e movimentação persistida |
| Indicadores | `pages/Paineis.tsx` | calculados sobre projetos | números reais por projeto |
| Aprovações | dentro de 5W2H | não conectadas à Mesa | status e ação de aprovação conforme permissão |
| Reset de senha | `services/api/client.ts` | demonstração assumida | permanece explicitamente demonstrativo até existir endpoint real |

---

## 4. Regras que não podem ser quebradas

### 4.1 Fonte da verdade

- O Odoo é a fonte da verdade.
- Não manter fallback silencioso para dados mockados quando uma chamada real falhar.
- Dados de demonstração só podem existir em tela explicitamente marcada como demonstração ou em fixtures/testes.
- Falha da API deve resultar em `MesaErroBusca`, nunca em tela vazia ou em substituição silenciosa por dados inventados.

### 4.2 Autenticação

- Toda chamada API autenticada usa `credentials: "include"`.
- Não adicionar token em `localStorage`, `sessionStorage` ou código JavaScript.
- Não criar CORS desnecessário: frontend e Odoo serão servidos pelo mesmo domínio em produção.
- Sessão expirada deve levar o usuário ao login.
- O frontend não deve considerar que o nome de usuário define a permissão real; isso ainda é uma limitação da demonstração atual e deverá ser substituído por grupos/perfil retornados pelo servidor antes do deploy de produção.

### 4.3 Contrato JSON

Toda rota nova deve seguir um destes envelopes:

```json
{
  "records": []
}
```

para listas, ou:

```json
{
  "record": {}
}
```

para criação/leitura individual.

Erros de validação devem retornar:

```json
{
  "error": "Mensagem compreensível em português."
}
```

Preferencialmente com status HTTP `400` para entrada inválida, `401` para sessão ausente/expirada, `403` para falta de permissão, `404` para registro inexistente e `500` para erro inesperado.

O frontend deve tratar tanto o status HTTP quanto o campo `error`.

### 4.4 Escritas

- Toda escrita deve mostrar estado de envio no botão.
- O botão deve ser desabilitado durante o envio.
- O conteúdo digitado não pode desaparecer por falha de rede.
- Erro deve aparecer junto ao formulário ou ao botão que executou o ato, com `role="alert"`.
- Sucesso deve usar `AvisosDeResultado` ou mensagem de estado apropriada, não toast genérico.
- Ações irreversíveis ou conclusivas devem usar `ConfirmarAto`.

### 4.5 Estados obrigatórios

Toda tela ou bloco que consulta o servidor deve ter quatro estados verificáveis:

1. `carregando`: `MesaCarregando`.
2. `erro`: `MesaErroBusca` com botão `Tentar de novo`.
3. `vazio`: explicação contextual e ação para criar, quando aplicável.
4. `conteúdo`: lista/formulário real.

### 4.6 Design e acessibilidade

- Manter a moldura da Mesa e os componentes existentes.
- Não usar `Card` como contêiner principal quando a receita da Mesa pedir folha, pasta ou livro.
- Um único `h1` por tela.
- Foco visível.
- Labels associados aos campos.
- Ícones decorativos com `aria-hidden="true"`.
- Tabelas com `caption` e cabeçalhos semânticos quando realmente forem necessárias.
- Sem rolagem horizontal em aproximadamente 400 px.
- Conferir tema claro e escuro.
- Não introduzir texto herdado de licitação na interface.

---

## 5. Contrato técnico do cliente HTTP

### 5.1 Arquivo de referência

```text
frontend/src/services/api/client.ts
```

### 5.2 Ajustes obrigatórios antes da Fase H

1. Manter `apiGet` e `apiPost` autenticados por cookie.
2. Adicionar `apiPatch` somente se alguma rota realmente utilizar `PATCH`; não criar por antecipação.
3. Criar um erro tipado ou equivalente contendo:
   - status HTTP;
   - mensagem do servidor;
   - rota chamada.
4. Tratar resposta HTML do Odoo quando a sessão expirar, sem tentar renderizar HTML como JSON.
5. Adicionar `AbortController` ou timeout para chamadas que possam ficar pendentes.
6. Não usar `apiClient` falso para funcionalidades declaradas como reais. O objeto legado no final do arquivo deve ser removido ou usado somente por uma tela explicitamente demonstrativa.
7. Manter `CLIENTE_DE_DEMONSTRACAO` apenas para o fluxo de recuperação de senha enquanto ele não tiver backend real. O nome da constante não deve ser usado para decidir se consultas reais usam mock.

### 5.3 Funções esperadas

```ts
apiGet<T>(path: string, options?): Promise<T>
apiPost<T>(path: string, body: unknown): Promise<T>
apiPatch<T>(path: string, body: unknown): Promise<T>
```

Cada função deve:

- enviar cookies;
- serializar JSON;
- interpretar resposta JSON;
- lançar erro em status não-2xx;
- preservar a mensagem `error` do servidor;
- produzir mensagem segura para resposta inválida.

---

## 6. Convenção de integração de uma tela

Cada tela nova deve seguir esta ordem:

1. Definir o contrato TypeScript da resposta.
2. Criar a função de serviço ou hook de consulta.
3. Criar o hook de mutação, se houver escrita.
4. Montar o formulário controlado.
5. Validar campos obrigatórios no cliente apenas para feedback rápido.
6. Enviar ao servidor e deixar o Odoo validar novamente.
7. Renderizar erro sem perder valores digitados.
8. Após sucesso, invalidar/refazer a consulta da tela.
9. Exibir confirmação.
10. Testar carregamento, erro, vazio e conteúdo.
11. Testar manualmente em projeto sem registros e em projeto com registros.
12. Testar com usuário sem permissão, se a tela for restrita.

Não criar uma nova biblioteca de estado global para esta fase. Usar hooks locais e `apiGet`/`apiPost`, mantendo a complexidade proporcional ao MVP.

---

## 7. Fase P0 — Fechar a fundação da ponte API

Esta fase vem antes de H1. Ela não adiciona funcionalidade de negócio; elimina comportamentos que poderiam mascarar erros nas fases seguintes.

### P0.1 — Revisar cliente HTTP

**Arquivo:** `frontend/src/services/api/client.ts`

Implementar:

- erro com status e mensagem;
- tratamento de resposta não JSON;
- detecção de sessão expirada;
- timeout cancelável;
- mensagens em português;
- ausência de fallback simulado para chamadas reais.

**Aceite:**

- mock de `fetch` com resposta 200 retorna dados;
- resposta 400 preserva a mensagem do servidor;
- resposta 500 mostra erro de conexão;
- resposta HTML não causa erro de `JSON.parse` visível ao usuário;
- timeout resulta em mensagem com retry;
- cookies continuam sendo enviados.

### P0.2 — Criar convenção de invalidação

Enquanto não houver React Query/SWR, cada hook que grava deve expor `refetch` ou chamar a consulta novamente após o sucesso.

Não fazer:

- atualizar somente o estado visual sem confirmar com o servidor;
- deixar a lista antiga após criar um item;
- duplicar registros localmente sem resposta do Odoo.

### P0.3 — Remover fallback silencioso do detalhe de projeto

**Arquivo:** `frontend/src/hooks/useMesaDados.ts`

O detalhe de projeto deve:

- mostrar `MesaErroBusca` se `GET /api/projetos/<id>` falhar;
- mostrar não encontrado se o Odoo responder 404/registro inexistente;
- não substituir uma falha de API por `PROCESSOS_DE_EXEMPLO`.

Os dados de exemplo podem permanecer somente em testes ou em uma fixture explicitamente importada por ambiente de demonstração.

### P0.4 — Ajustar perfil real

**Arquivos:**

```text
frontend/src/contexts/AuthContext.tsx
frontend/src/components/auth/RequerPerfil.tsx
frontend/src/components/layout/navegacao.ts
```

Registrar como pendência técnica, e não esconder:

- atualmente o frontend deriva `role` do nome do login;
- grupos e record rules do Odoo continuam sendo a proteção real da API;
- antes de produção, o endpoint de sessão deve devolver grupos/perfil ou uma rota `/api/me` deve fornecer o perfil efetivo.

A implementação de H pode continuar usando o mapa atual para a demonstração, desde que nenhuma permissão seja confiada apenas ao React.

### P0.5 — Testes mínimos da fundação

Adicionar Vitest ao frontend se ainda não existir:

```bash
cd frontend
npm install -D vitest
```

Adicionar script:

```json
"test": "vitest run"
```

Criar testes para:

```text
frontend/src/services/api/client.test.ts
```

Cobertura mínima:

- GET 200;
- GET 400 com mensagem;
- GET 500;
- POST 200;
- POST com erro de validação;
- JSON inválido;
- timeout;
- cookie incluído.

---

# 8. Fase G5 — Kanban da Mesa

Esta fase é obrigatória e não deve ser confundida com a conferência do Kanban nativo do Odoo. O Odoo já possui o quadro, mas a Mesa também deverá oferecer o acompanhamento visual das tasks do projeto.

## 8.1 Objetivo

Criar uma tela Kanban dentro da pasta do projeto para que o usuário veja e mova as ações sem sair do frontend.

Rota canônica:

```text
/projetos/:id/kanban
```

A rota deve ser acessível por uma divisória própria da pasta do projeto, com rótulo `Kanban` ou `Ações`, conforme a linguagem final aprovada para a Mesa.

## 8.2 Dados usados

A implementação deve reutilizar:

```text
GET  /api/projetos/<id>
POST /api/tasks/<task_id>/mover
```

A resposta de `GET /api/projetos/<id>` já fornece:

```text
project
stages: [{ id, name, fold }]
tasks: [{ id, name, stage_id, date_deadline }]
```

Não criar uma segunda fonte local de tasks.

## 8.3 Frontend

Criar:

```text
frontend/src/pages/KanbanProjeto.tsx
frontend/src/services/api/kanban.ts
```

Alterar:

```text
frontend/src/components/mesa/ferramentas.ts
frontend/src/pages/Item.tsx
```

A tela deve:

- buscar as etapas e tasks reais;
- renderizar uma coluna para cada etapa recebida pelo backend;
- renderizar um card para cada task;
- mostrar nome da task;
- mostrar prazo quando existir;
- destacar task atrasada sem usar um badge genérico de situação;
- permitir arrastar o card entre colunas;
- oferecer alternativa acessível sem arrastar, como menu `Mover para`;
- enviar `POST /api/tasks/<task_id>/mover` com `{ "stage_id": <id> }`;
- mostrar estado de movimento no card;
- não confirmar visualmente a mudança antes da resposta do servidor, ou reverter imediatamente se a escrita falhar;
- manter o card na coluna original quando o backend rejeitar a movimentação;
- exibir erro próximo ao card ou ao controle de movimentação;
- refazer a consulta após sucesso para confirmar o estado oficial;
- evitar movimentar task de outro projeto por manipulação manual do request.

## 8.4 Estados obrigatórios

- carregando: quadro vazio com `MesaCarregando`;
- erro: `MesaErroBusca` com `Tentar de novo`;
- vazio: projeto sem tasks, explicando que as ações aparecerão após serem criadas;
- conteúdo: colunas e cards reais;
- erro de escrita: mensagem junto do card e posição original preservada.

## 8.5 Aceite G5

- Abrir `/projetos/:id/kanban` mostra as seis etapas reais do projeto.
- Uma ação criada por 5 Porquês, Risco, Ishikawa ou 5W2H aparece no Kanban da Mesa depois de atualizar/refazer a consulta.
- Arrastar uma task de uma etapa para outra altera a etapa no Odoo.
- Recarregar o frontend mantém a task na nova etapa.
- Tentar mover para uma etapa inválida não altera o card.
- Parar o Odoo durante a movimentação mostra erro e não perde a posição conhecida.
- A movimentação funciona também por teclado ou controle alternativo.
- O Kanban não cria tasks; ele apenas lê e move tasks existentes.
- A lista de etapas não fica hardcoded no frontend: deve vir de `stages`.

## 8.6 Teste manual G5

1. Criar uma ação pela tela de 5 Porquês, Risco ou Ishikawa.
2. Abrir a divisória Kanban do mesmo projeto.
3. Confirmar que o card aparece.
4. Mover o card para `EM EXECUÇÃO`.
5. Conferir no Odoo que a task mudou de etapa.
6. Recarregar a Mesa.
7. Confirmar que o card continua em `EM EXECUÇÃO`.
8. Parar o Odoo e tentar outra movimentação.
9. Confirmar a mensagem de erro e a preservação da posição anterior.

---

# 9. Fase H1 — Stakeholders

**Primeira entrega de negócio.**

## 8.1 Objetivo

Dentro de um projeto, o usuário deve conseguir consultar stakeholders cadastrados e criar um novo stakeholder com poder, interesse, posição, influência e estratégia de relacionamento.

## 8.2 Backend

**Modelo:** `evoluta.stakeholder`  
**Arquivo do modelo:** `addons/evoluta/evoluta_strategy/models/evoluta_stakeholder.py`  
**Controller:** `addons/evoluta/evoluta_api/controllers/main.py`

Adicionar as rotas:

```text
GET  /api/stakeholders?project_id=<id>
POST /api/stakeholders
```

Body do `POST`:

```json
{
  "project_id": 1,
  "name": "Secretaria de Saúde",
  "organizacao": "Prefeitura",
  "poder": "alto",
  "interesse": "alto",
  "posicao": "apoiador",
  "influencia": "alta",
  "estrategia": "Manter informada semanalmente."
}
```

Resposta de lista:

```json
{
  "records": [
    {
      "id": 1,
      "project_id": 1,
      "name": "Secretaria de Saúde",
      "organizacao": "Prefeitura",
      "poder": "alto",
      "poder_label": "Alto",
      "interesse": "alto",
      "interesse_label": "Alto",
      "posicao": "apoiador",
      "posicao_label": "Apoiador",
      "influencia": "alta",
      "influencia_label": "Alta",
      "estrategia": "Manter informada semanalmente."
    }
  ]
}
```

Regras:

- `project_id` obrigatório;
- `name`, `poder`, `interesse`, `posicao` e `influencia` obrigatórios;
- validar acesso ao projeto pela sessão Odoo;
- não aceitar valores de seleção fora das opções do modelo;
- não aceitar stakeholder de outro projeto por manipulação manual da URL/body.

## 8.3 Frontend

Criar ou alterar:

```text
frontend/src/components/mesa/ferramentas.ts
frontend/src/pages/Item.tsx
frontend/src/pages/ferramentas/Ferramentas.tsx
frontend/src/services/api/stakeholders.ts       # se a separação for útil
frontend/src/hooks/useStakeholders.ts            # se a separação for útil
```

Adicionar a divisória:

```text
stakeholders — Stakeholders
```

A tela deve conter:

- lista em linhas de pasta/folha, não em cartão genérico;
- nome e organização;
- poder, interesse, posição e influência com texto legível;
- estratégia de relacionamento;
- formulário de criação;
- botão `Adicionar stakeholder`;
- botão `Salvar stakeholder`;
- estado vazio com orientação;
- erro com retry.

## 8.4 Aceite H1

- Projeto sem stakeholders mostra estado vazio.
- Projeto com stakeholders mostra todos os registros reais do Odoo.
- Criar stakeholder salva e aparece após refetch.
- Campos obrigatórios vazios não fazem POST.
- Erro do servidor fica junto ao formulário.
- Usuário sem acesso recebe erro/403 tratado, não tela em branco.
- Recarregar a página mantém o registro, comprovando que não é mock.

---

# 9. Fase H2 — 5 Porquês

## 9.1 Objetivo

Substituir o formulário local por uma análise persistida no projeto, permitindo gerar ou atualizar uma task sem duplicá-la.

## 9.2 Backend

**Modelo:** `evoluta.cinco_porques`  
**Arquivo:** `addons/evoluta/evoluta_management/models/evoluta_cinco_porques.py`

Rotas canônicas:

```text
GET  /api/porques?project_id=<id>
POST /api/porques
POST /api/porques/<id>/criar-acao
```

Body de criação:

```json
{
  "project_id": 1,
  "name": "Causa do atraso na implantação",
  "problema": "A implantação está atrasada.",
  "pq1": "Por quê 1",
  "pq2": "Por quê 2",
  "pq3": "Por quê 3",
  "pq4": "Por quê 4",
  "pq5": "Por quê 5",
  "causa_raiz": "Falta de responsável definido."
}
```

O endpoint da ação deve chamar `action_create_task()` do modelo, respeitando a regra anti-duplicação.

Resposta esperada da ação:

```json
{
  "record": {
    "id": 1,
    "task_id": 42,
    "task_name": "Falta de responsável definido."
  }
}
```

## 9.3 Frontend

Na aba `/:projectId/porques`:

- carregar análises existentes;
- permitir criar uma análise;
- mostrar `task_id` quando já houver ação;
- botão `Criar ação` quando não houver task;
- botão `Atualizar ação` quando houver task;
- não gerar duas tasks ao clicar duas vezes.

## 9.4 Aceite H2

- Sem problema, o formulário não envia.
- Sem causa raiz, o backend bloqueia e a mensagem aparece junto do botão.
- Primeiro clique cria uma task.
- Segundo clique atualiza a mesma task.
- O número de tasks do projeto não aumenta no segundo clique.
- A análise permanece após recarregar.

---

# 10. Fase H3 — Ishikawa

## 10.1 Objetivo

Persistir o problema, as seis categorias de causas, a causa principal e a ação derivada.

## 10.2 Backend

**Modelos:**

- `evoluta.ishikawa`;
- `evoluta.ishikawa.causa`.

Rotas:

```text
GET  /api/ishikawa?project_id=<id>
POST /api/ishikawa
POST /api/ishikawa/<id>/causas
POST /api/ishikawa/<id>/definir-causa-raiz
POST /api/ishikawa/<id>/criar-acao
```

A causa deve usar somente estas categorias:

```text
pessoas
processos
tecnologia
recursos
ambiente
gestao
```

O `POST /api/ishikawa` pode receber as causas aninhadas para facilitar a criação atômica, ou a tela pode criar o cabeçalho e depois as causas. A decisão deve ser registrada no controller e coberta por teste; não deixar duas formas parcialmente implementadas.

## 10.3 Frontend

- Renderizar as seis categorias com `select` ou campos identificados.
- Permitir mais de uma causa por categoria se o backend aceitar.
- Permitir marcar uma causa como principal.
- Desabilitar `Definir causa raiz` até existir causa marcada.
- Após definir a causa, mostrar o texto persistido.
- `Gerar ação` deve usar a ação do backend, não criar task diretamente no React.

## 10.4 Aceite H3

- Categoria inválida nunca é enviada pelo frontend e é rejeitada pelo backend.
- Sem causa principal, `Definir causa raiz` mostra erro.
- Sem causa raiz, `Gerar ação` mostra erro.
- A causa raiz permanece depois do reload.
- A ação não duplica task.

---

# 11. Fase H4 — Matriz de Decisão

## 11.1 Objetivo

Permitir criar matriz, critérios, pesos, alternativas e notas; exibir totais reais e gerar um plano 5W2H usando a alternativa vencedora.

## 11.2 Backend

**Modelos:**

- `evoluta.matriz`;
- `evoluta.matriz.criterio`;
- `evoluta.matriz.alternativa`;
- `evoluta.matriz.nota`.

Rotas:

```text
GET  /api/matriz?project_id=<id>
POST /api/matriz
POST /api/matriz/<id>/gerar-5w2h
```

Body mínimo:

```json
{
  "project_id": 1,
  "name": "Alternativa para reduzir atrasos",
  "criterios": [
    { "name": "Custo", "peso": 2 },
    { "name": "Prazo", "peso": 1 }
  ],
  "alternativas": [
    {
      "name": "Contratar equipe",
      "notas": [8, 6]
    },
    {
      "name": "Reorganizar equipe atual",
      "notas": [5, 9]
    }
  ]
}
```

A resposta deve retornar os totais já calculados pelo servidor:

```json
{
  "record": {
    "id": 1,
    "name": "Alternativa para reduzir atrasos",
    "criterios": [],
    "alternativas": [],
    "vencedor_id": 10,
    "vencedor_name": "Contratar equipe"
  }
}
```

Não calcular o resultado somente no frontend. O cálculo visual pode existir para feedback imediato, mas o total oficial é o do Odoo.

## 11.3 Frontend

- Formulário de critérios com peso.
- Formulário de alternativas.
- Grade de notas.
- Totais por alternativa.
- Destaque textual da vencedora.
- Botão `Gerar 5W2H`.
- Confirmação antes de gerar se a ação criar um novo plano.

## 11.4 Aceite H4

- Nota e peso são enviados com números válidos.
- Matriz sem alternativa não gera 5W2H.
- Matriz sem vencedor mostra erro do servidor.
- Total exibido confere com o Odoo.
- Gerar 5W2H cria exatamente um plano por ação válida.
- Recarregar a tela mantém matriz, notas e vencedor.

---

# 12. Fase H5 — RACI por task

## 12.1 Objetivo

Permitir visualizar e criar uma matriz RACI ligada a uma task específica do projeto, usando usuários reais do Odoo.

## 12.2 Backend

**Modelo:** `evoluta.raci`  
**Arquivo:** `addons/evoluta/evoluta_management/models/evoluta_raci.py`

Rotas:

```text
GET  /api/raci?task=<task_id>
POST /api/raci
GET  /api/usuarios
```

O endpoint `/api/usuarios` é necessário porque `responsible_id` e `accountable_id` são `res.users`; o frontend não pode inventar nomes nem enviar texto onde o modelo exige ID.

Body:

```json
{
  "task_id": 42,
  "responsible_id": 7,
  "accountable_id": 8,
  "consulted_ids": [9],
  "informed_ids": [10]
}
```

Regras:

- `responsible_id` e `accountable_id` obrigatórios;
- os dois não podem ser iguais;
- usuários retornados devem respeitar o acesso do usuário atual;
- o endpoint deve validar a existência e a permissão sobre a task.

## 12.3 Frontend

- A aba RACI deve exigir uma task selecionada.
- Selecionar a task por `?task=<id>` ou seletor visível.
- Exibir o nome da task selecionada.
- Carregar usuários reais para os campos.
- Usar multiselect para `consulted` e `informed`, se o componente existente permitir.
- Se não houver tasks, mostrar estado vazio orientando a criar uma task primeiro.

## 12.4 Aceite H5

- Abrir RACI sem `task` mostra seleção de task ou orientação.
- Task inexistente resulta em erro tratável.
- Responsible igual a Accountable é rejeitado no servidor.
- RACI criado aparece após refetch.
- Os nomes exibidos vêm dos usuários Odoo.

---

# 13. Fase H6 — Riscos

## 13.1 Objetivo

Persistir riscos ligados ao projeto e gerar uma task de mitigação sem duplicação.

## 13.2 Backend

**Modelo:** `evoluta.risco`  
**Arquivo:** `addons/evoluta/evoluta_management/models/evoluta_risco.py`

Rotas:

```text
GET  /api/riscos?project_id=<id>
POST /api/riscos
POST /api/riscos/<id>/criar-acao
```

Body:

```json
{
  "project_id": 1,
  "name": "Atraso na entrega de dados",
  "probabilidade": "alta",
  "impacto": "alto",
  "mitigacao": "Definir responsável e prazo semanal.",
  "responsavel_id": 7
}
```

## 13.3 Frontend

- Lista de riscos com probabilidade, impacto, responsável e mitigação.
- Formulário com `select` para probabilidade e impacto.
- Usuário responsável selecionado pelo ID Odoo.
- Botão `Gerar ação`.
- Mostrar task gerada quando existir.

## 13.4 Aceite H6

- Sem mitigação, o backend bloqueia a ação.
- Probabilidade e impacto usam somente valores válidos.
- Criar risco persiste no Odoo.
- Gerar ação não duplica task.
- Falha de rede não apaga o formulário.

---

# 14. Fase H7 — Estratégia e Teoria da Mudança

## 14.1 Objetivo

Transformar a aba Estratégia em uma área real, com três subseções:

1. Triângulo Estratégico.
2. Árvore de Problemas/Objetivos.
3. Teoria da Mudança.

Não implementar grafos visuais nesta fase. Usar formulários textuais coerentes com o backend atual.

## 14.2 Backend

### Triângulo

**Modelo:** `evoluta.triangulo`

```text
GET  /api/estrategia/triangulo?project_id=<id>
POST /api/estrategia/triangulo
```

Campos:

```text
name
project_id
valor_publico
legitimidade
capacidade
```

### Árvore de Problemas

**Modelo:** `evoluta.arvore.problemas`

```text
GET  /api/estrategia/arvores-problemas?project_id=<id>
POST /api/estrategia/arvores-problemas
POST /api/estrategia/arvores-problemas/<id>/converter
```

A conversão deve respeitar a regra existente: uma árvore de objetivos por árvore de problemas de origem.

### Teoria da Mudança

**Modelo:** `evoluta.teoria`

```text
GET  /api/teoria?project_id=<id>
POST /api/teoria
```

Campos:

```text
name
project_id
contexto
insumos
atividades
produtos
resultados
```

## 14.3 Frontend

Dentro de `/projetos/:id/estrategia`, usar divisórias ou subtabs internas:

```text
Triângulo | Árvore de problemas | Teoria da mudança
```

Cada subseção deve ter seus próprios quatro estados e seu próprio formulário.

## 14.4 Aceite H7

- Triângulo salva os três campos obrigatórios.
- Árvore de problemas salva problema central.
- Converter objetivos cria um registro ligado à árvore original.
- Segunda conversão não cria duplicata.
- Teoria da Mudança salva e reaparece depois do reload.
- Nenhuma tela promete gráfico que não existe.

---

# 15. Fase H8 — Templates e geração assíncrona

## 15.1 Objetivo

Substituir `frontend/src/pages/Templates.tsx` por uma biblioteca real e iniciar a geração de projeto pelo job do Odoo.

## 15.2 Backend

**Modelo:** `evoluta.template`  
**Job:** `queue_job`, executado pelo runner próprio do projeto.

Rotas:

```text
GET  /api/templates
POST /api/templates/<id>/gerar
GET  /api/jobs/<id>
```

Lista:

```json
{
  "records": [
    {
      "id": 1,
      "name": "Implantação LGPD",
      "descricao": "...",
      "task_count": 5
    }
  ]
}
```

Geração:

```json
{
  "job": {
    "id": "abc123",
    "state": "pending"
  }
}
```

Estados de job aceitos:

```text
pending
started
done
failed
```

Quando concluído:

```json
{
  "job": {
    "id": "abc123",
    "state": "done",
    "project_id": 12
  }
}
```

Quando falhar:

```json
{
  "job": {
    "id": "abc123",
    "state": "failed",
    "error": "Mensagem em português."
  }
}
```

O controller não deve fingir que o projeto foi criado antes de o job concluir.

## 15.3 Frontend

`Templates.tsx` deve:

- consultar templates reais;
- exibir carregamento, erro, vazio e lista;
- apresentar quantidade de tasks modelo;
- disparar job;
- mostrar que a geração está em andamento;
- consultar o status periodicamente, com intervalo controlado;
- parar o polling em `done` ou `failed`;
- navegar para o projeto criado em `done`;
- permitir retry em `failed`.

Polling recomendado:

```text
1 segundo inicialmente;
no máximo 30 segundos no total;
parar ao desmontar a tela;
não criar múltiplos timers para o mesmo job.
```

## 15.4 Aceite H8

- Templates exibidos são os cadastrados no Odoo.
- Clicar duas vezes não dispara dois jobs enquanto o primeiro estiver pendente.
- Projeto só aparece como concluído quando o job estiver `done`.
- Projeto gerado contém as tasks do template.
- Falha do job não deixa a tela presa em carregamento.

---

# 16. Fase H9 — Chamados e SLA

## 16.1 Objetivo

Substituir os três chamados fixos de `frontend/src/pages/Chamados.tsx` por dados reais do Helpdesk OCA instalado no Odoo e permitir criar um chamado básico.

## 16.2 Pré-condição obrigatória

Antes de codificar o controller, confirmar no Odoo o modelo Helpdesk realmente instalado e seus campos. O repositório não contém o código OCA; `addons/oca` tem apenas o ponto de montagem versionado.

Verificar:

- nome técnico do modelo de ticket;
- campo de título;
- campo de descrição;
- equipe;
- estágio;
- prioridade;
- prazo/SLA;
- campos obrigatórios;
- permissões do usuário da Mesa.

Não assumir que todos os módulos OCA possuem exatamente os mesmos campos entre versões.

## 16.3 Contrato de API da Mesa

Independentemente do nome técnico interno do modelo, expor para o frontend:

```text
GET  /api/chamados
POST /api/chamados
```

Resposta:

```json
{
  "records": [
    {
      "id": 1,
      "codigo": "HT0001",
      "titulo": "Trocar lâmpadas do bairro Centro",
      "descricao": "...",
      "situacao": "Aberto",
      "situacao_key": "open",
      "prioridade": "normal",
      "prazo": "2026-10-15",
      "sla_status": "no_prazo"
    }
  ]
}
```

Criação mínima:

```json
{
  "titulo": "Novo chamado",
  "descricao": "Descrição do pedido",
  "team_id": 1
}
```

Se equipe for obrigatória no Helpdesk, fornecer `GET /api/chamados/equipes` para preencher o campo, em vez de exigir ID digitado manualmente.

## 16.4 Frontend

- Tabela responsiva ou lista de pastas sem rolagem lateral em 400 px.
- Busca e estado vazio.
- Formulário de novo chamado.
- Prazo e SLA com linguagem clara.
- Não transformar situação em `Badge` genérico se a regra da Mesa pedir carimbo/tinta.
- Erro de criação junto ao botão.

## 16.5 Aceite H9

- A lista não contém os três dados fixos antigos.
- Criar chamado cria ticket no Helpdesk.
- Atualizar a página mantém o ticket.
- SLA/prazo exibido confere com o Odoo.
- Falta de equipe ou campo obrigatório gera mensagem explicativa.

---

# 17. Fase H10 — Indicadores reais

## 17.1 Objetivo

Fazer a tela de Painéis mostrar os contadores calculados pelo backend, em vez de inferir todos os dados somente do modelo simplificado de projetos.

## 17.2 Backend

O modelo `project.project` já possui campos calculados:

```text
evoluta_total_tasks
evoluta_done_tasks
evoluta_overdue_tasks
```

O endpoint de projetos deve retornar esses números, ou deve ser criada a rota explícita:

```text
GET /api/indicadores?project_id=<id>
```

Contrato recomendado:

```json
{
  "record": {
    "project_id": 1,
    "total_tasks": 10,
    "done_tasks": 3,
    "overdue_tasks": 2,
    "open_tasks": 7,
    "by_stage": [
      { "stage_id": 1, "stage_name": "NÃO INICIADO", "total": 2 }
    ]
  }
}
```

## 17.3 Frontend

`frontend/src/pages/Paineis.tsx` deve:

- carregar indicadores do projeto selecionado;
- não contar registros mockados;
- mostrar projeto sem tasks como estado válido, com zeros;
- mostrar erro e retry;
- manter o estilo de livro/painel da Mesa;
- preservar números com `lining-nums` e `tabular-nums`.

## 17.4 Aceite H10

- Total de tasks confere com o Kanban Odoo.
- Concluídas conferem com etapas `fold`.
- Atrasadas conferem com `date_deadline < hoje` e etapa não concluída.
- Trocar o projeto atualiza todos os contadores.
- Sem projeto selecionado, a tela orienta o usuário.

---

# 18. Fase H11 — Aprovações de 5W2H

## 18.1 Objetivo

Permitir que a Mesa mostre o status de aprovação do plano e, para perfis autorizados, execute as ações permitidas pelo Tier Validation.

A regra de negócio continua no Odoo. O frontend não pode aprovar diretamente alterando um campo.

## 18.2 Backend

**Modelo:** `evoluta.5w2h` com `tier.validation`.

A resposta de `/api/planos` e `/api/5w2h` deve incluir:

```text
state
validation_status
can_request_validation
can_validate
can_restart_validation
task_id
```

Rotas:

```text
POST /api/5w2h/<id>/solicitar-validacao
POST /api/5w2h/<id>/aprovar
POST /api/5w2h/<id>/reiniciar-validacao
POST /api/5w2h/<id>/gerar-task
```

Cada ação deve chamar o método do modelo Odoo correspondente e respeitar as permissões reais.

## 18.3 Frontend

Na aba 5W2H:

- mostrar status como texto e carimbo apropriado;
- mostrar solicitação de validação somente se `can_request_validation`;
- mostrar aprovação somente se `can_validate`;
- pedir confirmação antes de aprovar ou gerar task;
- mostrar a mensagem devolvida pelo Odoo;
- não mostrar botão de aprovação apenas porque o usuário é `admin` no React.

## 18.4 Aceite H11

- Plano em rascunho pode solicitar validação quando permitido.
- Usuário sem permissão não vê ou não consegue executar aprovação.
- Aprovação parcial mostra status correto.
- Geração de task antes da aprovação exigida é bloqueada pelo Odoo e explicada na Mesa.
- Após duas aprovações, gerar task funciona.
- O plano não gera task duplicada.

---

# 19. Fase H12 — Itens que continuam no Odoo

Não criar telas duplicadas na Mesa nesta etapa para:

- cadastros de municípios, secretarias e departamentos;
- configuração fina de usuários e grupos;
- Tier Definitions;
- configuração técnica de SLA;
- BI avançado/MIS;
- administração de jobs;
- configuração de assinatura;
- backup, auditlog e upgrades de módulos.

A Mesa pode mostrar links ou mensagens orientando o administrador para `/odoo/`, desde que isso esteja claro e protegido por perfil.

---

## 20. Testes automatizados

### 20.1 Frontend

Comandos:

```bash
cd frontend
npm run typecheck
npm run test
npm run build
```

Testes mínimos:

```text
src/services/api/client.test.ts
src/services/api/stakeholders.test.ts
src/services/api/tools.test.ts
src/features/.../process-status.test.ts
```

Cobrir:

- cliente HTTP 200/400/401/403/404/500;
- JSON inválido;
- timeout;
- lista vazia;
- transformação da resposta Odoo para o tipo usado pela tela;
- criação bem-sucedida;
- erro de criação sem perda de formulário;
- ação anti-duplicação;
- polling de job pending → started → done;
- polling de job failed;
- cálculo visual da matriz apenas como apoio, sem substituir o total do servidor.

### 20.2 Backend/Odoo

Para cada controller novo, testar:

- usuário autenticado;
- usuário sem permissão;
- `project_id` inexistente;
- registro de outro projeto;
- campo obrigatório ausente;
- seleção inválida;
- ação sem pré-condição;
- ação repetida;
- resposta JSON esperada.

Os testes de modelo continuam seguindo o padrão do backend em `tests/` e devem usar `TransactionCase` quando forem adicionados.

### 20.3 Testes manuais de integração

Para cada H:

1. Criar registro pelo frontend.
2. Conferir o registro no Odoo.
3. Alterar ou executar a ação pelo Odoo quando aplicável.
4. Recarregar o frontend.
5. Confirmar que a Mesa refletiu o estado real.
6. Interromper o Odoo e conferir a tela de erro.
7. Restaurar o Odoo e usar `Tentar de novo`.

---

## 21. Matriz de verificação visual

Executar para cada tela modificada:

| Verificação | Claro | Escuro | 400 px | 1024 px | Desktop |
|---|---:|---:|---:|---:|---:|
| Um `h1` | [ ] | [ ] | [ ] | [ ] | [ ] |
| Sem rolagem lateral | [ ] | [ ] | [ ] | [ ] | [ ] |
| Foco visível | [ ] | [ ] | [ ] | [ ] | [ ] |
| Contraste suficiente | [ ] | [ ] | [ ] | [ ] | [ ] |
| Campos com label | [ ] | [ ] | [ ] | [ ] | [ ] |
| Estado carregando | [ ] | [ ] | [ ] | [ ] | [ ] |
| Estado de erro | [ ] | [ ] | [ ] | [ ] | [ ] |
| Estado vazio | [ ] | [ ] | [ ] | [ ] | [ ] |
| Conteúdo real | [ ] | [ ] | [ ] | [ ] | [ ] |
| Mensagem de sucesso | [ ] | [ ] | [ ] | [ ] | [ ] |

Também conferir:

- navegação por teclado;
- anúncio de `role="alert"`;
- botões desabilitados durante envio;
- nenhum texto de demonstração em tela real;
- nenhum texto de licitação herdado;
- nenhum `Badge` usado para representar situação contra a regra da Mesa.

---

## 22. Validação de ambiente por fase

Antes de cada fase:

```bash
docker-compose up -d
docker-compose ps
```

Após alteração em módulo Odoo:

```bash
docker-compose restart web
docker-compose logs --tail=200 web
```

Conferir que não há `Traceback` no log.

Após alteração no frontend:

```bash
cd frontend
npm run typecheck
npm run build
```

Teste de falha de backend:

```bash
docker-compose stop web
# abrir a tela e confirmar MesaErroBusca/retry
docker-compose start web
# clicar em Tentar de novo
```

Não usar `docker compose` neste projeto; o comando operacional documentado é `docker-compose`.

---

## 23. Critério de conclusão de cada fase H

Uma fase só pode ser marcada como concluída quando todos os itens abaixo forem verdadeiros:

- [ ] Controller/API implementado.
- [ ] Contrato JSON documentado neste arquivo e testado.
- [ ] Hook/serviço frontend implementado.
- [ ] Tela conectada à API real.
- [ ] Nenhum mock permanece no caminho principal da tela.
- [ ] Carregando, erro, vazio e conteúdo implementados.
- [ ] Falha de escrita preserva os dados digitados.
- [ ] Mensagem de erro está próxima do botão/ato.
- [ ] Recarregar a página confirma persistência.
- [ ] Ação de backend não duplica registros.
- [ ] `npm run typecheck` passa.
- [ ] `npm run build` passa.
- [ ] Testes automatizados da fase passam, quando o teste aplicável existir.
- [ ] Teste manual com Odoo ligado foi executado.
- [ ] Teste manual com Odoo desligado foi executado.
- [ ] Teste de permissão foi executado quando aplicável.
- [ ] Tema claro conferido.
- [ ] Tema escuro conferido.
- [ ] Largura aproximada de 400 px conferida.
- [ ] Alterações não commitadas anteriores foram preservadas.
- [ ] Documento e checklist desta fase foram atualizados.

---

## 24. Ordem operacional recomendada

Executar sem pular a validação da fase anterior:

```text
P0 — Fundação da ponte API
H1 — Stakeholders
H2 — 5 Porquês
H6 — Riscos
H3 — Ishikawa
H4 — Matriz de Decisão
H5 — RACI
H7 — Estratégia + Teoria da Mudança
H8 — Templates + jobs
H9 — Chamados + SLA
H10 — Indicadores
H11 — Aprovações
H12 — Conferência do que continua no Odoo
G6 — Deploy e smoke test
G7 — Relato final
```

A ordem de H2, H6 e H3 segue o plano oficial, mesmo que H3 esteja numericamente antes de H6.

---

## 25. Critério final de pronto

O frontend só pode ser declarado pronto para a integração da Fase H quando:

1. Todas as fases H1–H11 aplicáveis estiverem marcadas como concluídas.
2. Nenhuma tela principal usar dados locais como caminho de sucesso.
3. A busca de textos mostrar que não há domínio de licitação na interface.
4. `npm run typecheck`, `npm run test` e `npm run build` passarem.
5. O Odoo subir com:

   ```bash
   docker-compose up -d
   docker-compose ps
   ```

6. O login real funcionar.
7. O fluxo projeto → ferramenta → ação → task puder ser conferido nas duas pontas.
8. O desligamento do Odoo mostrar erro com retry em vez de tela vazia.
9. Os perfis e as regras do servidor impedirem acesso indevido.
10. O teste visual em claro, escuro e aproximadamente 400 px estiver registrado.
11. O relatório final seguir o formato da seção E do skill Evoluta:

```text
MESA EVOLUTA — <o que foi aplicado>
Onde:                 <telas/arquivos>
Tema claro:           conferido | não conferido
Tema escuro:          conferido | não conferido
Largura ~400px:       conferido | não conferido
Diferenças em relação ao LicitarsAI: <lista, ou "nenhuma">
Ficou pela metade / simulado: <lista, ou "nada">
Não consegui conferir: <itens>
```

---

## 26. Pendências externas que não devem ser escondidas

Estas pendências não impedem a implementação local, mas impedem declarar produção concluída até serem resolvidas:

- perfil real retornado pelo servidor em vez do nome do login;
- banco definido por variável de ambiente, não hardcoded como `demo`;
- confirmação do modelo/campos exatos do Helpdesk OCA instalado;
- configuração de Nginx e proxy em produção;
- SSL e domínio público;
- teste em aparelho real;
- teste real de impressão;
- abertura do `.docx` no Word;
- política de multi-tenant;
- remoção de credenciais e flags de demonstração do build de produção.
