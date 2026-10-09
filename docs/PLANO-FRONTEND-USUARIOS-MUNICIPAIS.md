# Plano Mestre de Conclusão do Frontend da Evoluta Gestão

**Projeto:** Evoluta Gestão sobre Odoo Community 19
**Tipo:** plano executável de saneamento, integração, remoção de legado e validação final
**Status:** pronto para execução; nenhuma fase deste documento está declarada como concluída automaticamente
**Data da revisão:** 2026-10-08
**Interface oficial dos usuários municipais:** React
**Engine:** Odoo Community 19 + módulos OCA + módulos próprios Evoluta
**Docker obrigatório:** `docker-compose`
**Fonte de negócio:** `Conversa_Estrategia_GovTech_Evoluta_Odoo_Community_19.md`
**Fonte visual/interação:** `.claude/skills/Evoluta_frontend/SKILL.md`
**Guia consolidado:** `README.md`

> Este é o plano que deve orientar a execução completa. O trabalho só será declarado pronto quando todos os critérios obrigatórios, testes automatizados, testes manuais, testes de escopo e verificações visuais deste documento estiverem aprovados ou quando uma pendência tiver sido explicitamente aceita pela Evoluta como fora do produto.

---

## 1. Decisão central do produto

A Evoluta Gestão é uma aplicação de gestão interna municipal. Ela não é uma cópia funcional do LicitarsAI, não é um portal do cidadão e não é um ERP genérico apresentado diretamente ao servidor.

```text
Usuário municipal
      ↓
Frontend React — interface oficial de operação
      ↓
API autenticada da Evoluta
      ↓
Odoo — dados, regras, permissões, workflow, auditoria e persistência
```

O usuário municipal não deve precisar abrir `/web` para:

- consultar seus projetos;
- criar ou editar registros autorizados;
- cadastrar ações;
- acompanhar tasks no Kanban;
- usar as ferramentas metodológicas;
- solicitar ou executar aprovações;
- abrir e acompanhar demandas;
- consultar indicadores e histórico que já tenham sido expostos ao React.

A interface `/web` permanece reservada a:

- manutenção técnica;
- instalação e upgrade de módulos;
- configuração excepcional ainda não exposta;
- backup e infraestrutura;
- configuração técnica de ACL, record rules, Tier, SLA, jobs e auditlog.

---

## 2. Fontes e precedência

### 2.1 Conversa oficial na raiz

Arquivo:

```text
Conversa_Estrategia_GovTech_Evoluta_Odoo_Community_19.md
```

É a fonte de verdade para:

- problema e público do produto;
- uso do Odoo e OCA;
- separação entre recursos nativos e diferenciais Evoluta;
- módulos próprios;
- fases do produto;
- funcionalidades fora do escopo.

Decisões obrigatórias da conversa:

- Odoo Community 19 é a engine.
- Odoo Project é o coração operacional.
- O Kanban existente do Odoo deve ser utilizado.
- Tarefas, atividades, agenda, comentários, anexos, Helpdesk, SLA, aprovações, KPI e auditoria devem ser reutilizados quando já existirem.
- As ferramentas metodológicas são diferenciais Evoluta.
- Não modificar diretamente o core do Odoo nem módulos OCA.
- Não construir um portal público de cidadão como parte deste produto.
- IA, automação preditiva e API pública ficam fora do escopo atual.

### 2.2 Skill oficial do frontend

Arquivo:

```text
.claude/skills/Evoluta_frontend/SKILL.md
```

É a fonte de verdade para:

- Mesa de Trabalho Evoluta;
- moldura azul-noite;
- folhas marfim;
- logo do produto e assinatura Evoluta;
- menu, busca, login e barra móvel;
- tokens, tipografia e temas;
- pastas, divisórias e carimbos;
- acessibilidade;
- responsividade em aproximadamente 400 px;
- impressão;
- estados de carregamento, erro, vazio e conteúdo;
- microcopy em português do Brasil;
- critérios de verificação visual.

A skill exige copiar a estrutura visual da Mesa, mas manda trocar o domínio. Portanto:

```text
Visual do LicitarsAI/Mesa → reutilizar
Vocabulário e fluxo de licitação → remover
Domínio de gestão municipal → implementar
```

### 2.3 Verdade técnica

Durante a implementação, consultar também:

```text
addons/evoluta/*
addons/oca/*
README.md
docs/PLANO-FRONTEND-RETOMADA.md
docs/PLANO-FASE1.md
```

Quando houver conflito:

1. segurança e comportamento real do Odoo prevalecem;
2. a conversa oficial prevalece para negócio e escopo;
3. a skill prevalece para visual e interação;
4. este plano organiza a execução, mas não pode inventar regra contrária às fontes anteriores.

---

## 3. Vocabulário oficial para o frontend

### 3.1 Município e tenant

Cada prefeitura contratante é um município/tenant isolado.

```text
Super Admin Evoluta
  └── municípios vendidos
        └── município
              ├── secretarias
              │     └── departamentos
              └── usuários municipais
```

### 3.2 Projeto

Projeto é a iniciativa municipal maior, por exemplo:

- Implantação da LGPD;
- Plano de redução de despesas;
- Melhoria do atendimento da Saúde;
- Programa de modernização administrativa.

A ficha do projeto deve ter, quando aplicável:

- nome;
- município;
- secretaria;
- departamento;
- prazo final;
- orçamento;
- responsável;
- etapa/situação do projeto.

### 3.3 Ação 5W2H

Uma ação 5W2H é uma ação concreta dentro do projeto.

```text
Projeto: Implantação da LGPD
  ├── Levantar inventário da Saúde
  ├── Reunir com a TI
  └── Validar minuta com o Jurídico
```

Cada ação pode possuir seu próprio 5W2H:

```text
What
Why
Where
When
Who
How
How much
```

Um projeto pode conter várias ações 5W2H quando elas são ações diferentes. A interface deve usar “Ações 5W2H” ou “Nova ação 5W2H” para não dar a impressão de que cada registro é um projeto inteiro.

### 3.4 Task

A task é o registro operacional `project.task` do Odoo. Um 5W2H aprovado pode gerar uma task. A task aparece no Kanban e é executada por responsáveis.

Regra obrigatória:

- gerar novamente a task do mesmo 5W2H atualiza a task existente;
- não criar duplicata;
- as tarefas de várias ações podem coexistir no mesmo projeto.

### 3.5 Demanda

Uma demanda pode ser aberta por formulário, Helpdesk ou e-mail e depois virar tarefa ou projeto.

```text
Demanda → triagem → responsável → atendimento → aguardando → concluída
```

Demanda não é automaticamente projeto estratégico.

---

## 4. Perfis e isolamento obrigatório

### 4.1 Super Admin da Evoluta

Pode:

- criar, editar, ativar e arquivar municípios/clientes;
- criar o primeiro Admin Municipal de cada município;
- administrar a carteira de tenants;
- consultar dados globais conforme política interna.

Não deve ser confundido com o administrador municipal de uma prefeitura.

### 4.2 Admin Municipal

Pode operar somente o próprio município:

- secretarias;
- departamentos;
- usuários municipais;
- projetos;
- tarefas;
- ações 5W2H;
- ferramentas metodológicas;
- templates permitidos;
- indicadores e auditoria de negócio conforme política.

Não pode:

- criar outro município;
- acessar outro município;
- criar outro Admin Municipal;
- alterar módulos, ACLs, banco, backup ou infraestrutura.

### 4.3 Secretário

Pode operar:

- o município vinculado;
- a própria secretaria;
- projetos gerais autorizados do município;
- projetos da própria secretaria;
- tarefas, ferramentas, chamados e aprovações permitidos.

Não pode administrar usuários fora do escopo nem configuração técnica.

### 4.4 Atendente

Pode operar apenas registros atribuídos, compartilhados ou autorizados:

- tarefas próprias;
- ações 5W2H permitidas;
- comentários, atividades e anexos autorizados;
- chamados autorizados.

Não administra organização, usuários, municípios ou aprovação do próprio plano por padrão.

### 4.5 Regras de escopo

As regras precisam ser aplicadas no backend e refletidas no React:

| Situação | Comportamento obrigatório |
|---|---|
| Município diferente | nunca listar, abrir ou alterar |
| Projeto sem secretaria | projeto municipal geral, visível somente dentro do município |
| Projeto com secretaria | restringir à secretaria |
| Projeto sem departamento | vale para toda a secretaria |
| Projeto com departamento | restringir ao departamento para Atendente |
| Secretário | pode ver projeto geral do município e projeto da própria secretaria |
| Atendente | somente tasks/registros permitidos |
| URL digitada manualmente | rota deve recusar se o backend recusar |
| `403` | não pode ser transformado em sucesso visual |

---

## 5. Auditoria do estado atual

### 5.1 Trabalho já existente que deve ser preservado

Já existem integrações reais ou parcialmente reais para:

- sessão Odoo e login;
- `/api/me`;
- perfis reais `super_admin`, `admin_municipal`, `secretario`, `atendente`;
- isolamento inicial por município/secretaria/departamento;
- cadastro de municípios, secretarias, departamentos e usuários;
- projetos e tarefas;
- Kanban e movimentação de task;
- Stakeholders;
- 5 Porquês;
- Ishikawa;
- Riscos;
- RACI;
- Matriz de Decisão;
- Estratégia e árvores;
- Teoria da Mudança;
- Templates e jobs;
- Chamados e SLA;
- Indicadores;
- aprovação de 5W2H;
- tela visual Mesa Evoluta;
- tema claro/escuro;
- responsividade estrutural;
- geração de documento `.docx` em algumas telas.

Essas integrações não devem ser reescritas por estética. Devem ser auditadas e completadas.

### 5.2 Pendências conhecidas

Ainda não declarar como concluídos sem evidência:

- edição e arquivamento de projetos e registros já criáveis;
- todas as atividades reais;
- agenda oficial do Odoo;
- comentários/Chatter;
- histórico de alterações;
- anexos/evidências;
- detalhe completo do Helpdesk;
- auditoria de negócio no React;
- dashboards avançados/MIS;
- exportações;
- recuperação real de senha;
- PWA instalável/offline;
- testes automatizados do frontend;
- testes automatizados de backend para todos os fluxos;
- remoção completa dos textos e comportamentos herdados do LicitarsAI.

### 5.3 Resíduos conhecidos do LicitarsAI/sistema de exemplo

A auditoria deve revisar, no mínimo, estes arquivos:

```text
frontend/src/config/marca.ts
frontend/src/components/layout/navegacao.ts
frontend/src/App.tsx
frontend/src/pages/Formulario.tsx
frontend/src/pages/Lista.tsx
frontend/src/pages/Inicio.tsx
frontend/src/pages/Agenda.tsx
frontend/src/pages/Paineis.tsx
frontend/src/pages/Item.tsx
frontend/src/components/mesa/PastaDoProcesso.tsx
frontend/src/components/mesa/fasesDaLicitacao.tsx
frontend/src/components/mesa/ferramentas.ts
frontend/src/features/agenda/montarAgenda.ts
frontend/src/features/processos/listaDeProcessos.ts
frontend/src/constants/process-status.ts
frontend/src/hooks/useMesaDados.ts
frontend/src/utils/blocosDoItem.ts
frontend/src/utils/ferramentasMesa.ts
frontend/src/features/lei/artigos.ts
frontend/public/*
frontend/index.html
frontend/package.json
frontend/tailwind.config.*
```

Também executar as quatro buscas previstas na skill em `frontend/src`, `public`, `index.html`, `package.json`, `tailwind.config.ts`, `vite.config.ts` e `components.json`.

---

## 6. Inventário obrigatório de remoção do legado

### 6.1 Textos de licitação que não podem aparecer na tela

Remover ou substituir textos visíveis relacionados a:

```text
licitação
LicitarsAI
edital
modalidade
pregão
proposta
sessão pública
impugnação
contrarrazões
Lei 14.133
autos
órgão licitante
processo licitatório
contratação direta
abertura de proposta
prazo legal
```

Exceção: nomes técnicos internos podem permanecer temporariamente, mas nunca devem aparecer ao usuário.

### 6.2 Elementos de navegação de exemplo

Cada item abaixo deve ter uma decisão explícita:

| Item legado | Ação obrigatória |
|---|---|
| `Arquivo` | remover do menu ou implementar arquivo real de projetos/demandas |
| `Biblioteca` | conectar a templates/documentos reais ou remover do menu |
| `Quem está com o quê` | implementar visão real de responsáveis ou remover |
| `Projetos do período` | implementar filtro real ou remover |
| `Modelos do município` | manter somente se templates forem operacionais e autorizados |
| `Prazos e agenda` | conectar a atividades/calendário reais; não usar agenda fictícia |
| `Planta da repartição` | não usar esse nome; substituir por visão real ou remover |
| `Livro da gestão` | não usar esse nome; substituir por relatório real ou remover |
| `/help` | implementar ajuda Evoluta ou remover o item |
| `/arquivo` | não deixar rota acessível se for somente placeholder |
| `/library` | não deixar rota acessível se for somente placeholder |
| `/planta` | não deixar rota acessível se for somente placeholder |
| `/livro-gestao` | não deixar rota acessível se for somente placeholder |

Critério: não pode existir item no menu que leve o usuário a `EmConstrucao` no produto final, salvo se a Evoluta aprovar explicitamente a tela como fase posterior e o menu não a apresentar como disponível.

### 6.3 Comportamentos herdados que devem ser removidos

- fases de licitação calculadas por datas;
- agenda com marcos de edital, sessão, impugnação ou recurso;
- situações inventadas a partir de `opening_date` de licitação;
- modalidade de projeto exibida como se fosse licitação;
- dados inventados no `useMesaDados.ts`;
- armazém em memória como caminho de sucesso;
- perfil determinado por nome ou login;
- `admin`, `gestor`, `operador` e `master` como perfis do produto municipal;
- textos “Minha contratação”, “Novo processo” ou equivalentes de licitação;
- campos de objeto/preço apresentados sem correspondência com o modelo real;
- qualquer fallback que transforme falha da API em dados fictícios.

### 6.4 Lei e conteúdo jurídico

A Evoluta atual não deve exibir um módulo “Na lei” ou artigos da Lei 14.133.

Manter `leiAoLado = false` e garantir:

- grupo de lei ausente na busca;
- nenhuma tela de acessibilidade citando lei de licitações;
- nenhuma agenda jurídica;
- nenhuma rota órfã de lei;
- arquivos de exemplo sem uso no fluxo compilado.

### 6.5 Identidade visual a preservar

Não remover os elementos que são da skill e pertencem à identidade Evoluta:

- moldura azul-noite;
- folhas e pastas;
- carimbos;
- logo do produto;
- assinatura “UMA SOLUÇÃO Evoluta”;
- tokens de cor;
- tipografia;
- menu lateral;
- barra do celular;
- tema claro/escuro;
- acessibilidade e impressão.

O que deve ser removido é o **domínio de licitação**, não a Mesa de Trabalho.

---

## 7. Arquitetura e contratos obrigatórios

### 7.1 Fluxo de dados

```text
React
  ↓ fetch com credentials: include
Controller HTTP Evoluta
  ↓ auth="user"
Odoo env do usuário
  ↓ ACL + record rule + validação de escopo
Modelo Odoo/OCA/Evoluta
  ↓
JSON consistente
  ↓
Estado React atualizado pela resposta oficial
```

Proibido:

- consultar PostgreSQL no browser;
- usar JSON-RPC administrativo para contornar API;
- confiar só em esconder botão;
- filtrar dados de outro município apenas no React;
- usar fixture como caminho de sucesso;
- usar nome/e-mail/login para definir permissão;
- marcar sucesso antes da resposta do Odoo.

### 7.2 Contrato de lista

```json
{
  "records": [],
  "meta": {
    "total": 0,
    "page": 1,
    "page_size": 50
  }
}
```

`meta` pode ser omitido somente quando o endpoint for pequeno e isso estiver documentado.

### 7.3 Contrato de registro

```json
{
  "record": {
    "id": 1
  }
}
```

### 7.4 Contrato de erro

```json
{
  "error": "Mensagem orientada ao usuário.",
  "code": "VALIDATION_ERROR",
  "field_errors": {}
}
```

Códigos obrigatórios:

```text
AUTHENTICATION_REQUIRED → 401
PERMISSION_DENIED       → 403
NOT_FOUND               → 404
VALIDATION_ERROR        → 400
CONFLICT                → 409
SERVER_ERROR            → 500
TIMEOUT                 → erro de conexão no React
```

### 7.5 Regras de escrita

- `GET` não altera dados.
- `POST` cria registro ou executa ação explicitamente identificada.
- `PATCH` altera somente campos permitidos.
- Não apagar registro de negócio sem decisão explícita; preferir arquivamento.
- Toda escrita retorna registro atualizado ou job.
- Duplo clique não duplica registro.
- Ações repetidas devem ser idempotentes ou retornar `409` explicado.
- Nenhuma resposta expõe senha, token, cookie ou hash.
- O backend valida tudo novamente, mesmo que o frontend valide antes.

---

## 8. Plano de execução por fases

A execução deve seguir a ordem abaixo. Uma fase só passa quando seus critérios de aceite forem aprovados.

```text
P0 — Baseline, inventário e segurança de execução
P1 — Saneamento completo do domínio LicitarsAI
P2 — Fundação visual, navegação e estados da Mesa Evoluta
P3 — Sessão, perfis, tenants e organização municipal
P4 — Projetos: ficha completa, edição, escopo e arquivos
P5 — Tasks, Kanban, atividades e agenda
P6 — Ferramentas metodológicas e workflow 5W2H
P7 — Estratégia, diagnósticos, riscos, RACI e templates
P8 — Demandas, Helpdesk, SLA, Chatter, comentários e anexos
P9 — Indicadores, auditoria de negócio e relatórios
P10 — Acessibilidade, responsividade, impressão, PWA e produção
P11 — Testes integrados, regressão, aceite por perfil e encerramento
```

---

# P0 — Baseline, inventário e segurança de execução

## P0.1 Objetivo

Estabelecer uma fotografia verificável antes de alterar o restante do produto.

## P0.2 Tarefas

1. Conferir branch, status e alterações não commitadas.
2. Não apagar alterações do usuário.
3. Registrar os comandos disponíveis no projeto.
4. Registrar versões de Node, npm, Python, Odoo e PostgreSQL.
5. Confirmar containers `db` e `web` com `docker-compose ps`.
6. Executar:

```bash
cd frontend
npm run typecheck
npm run build
```

7. Executar compilação Python dos módulos Evoluta.
8. Registrar warnings já existentes separadamente de regressões novas.
9. Catalogar todas as rotas atuais em `App.tsx`.
10. Catalogar todos os itens de `navegacao.ts`.
11. Catalogar todos os endpoints usados em `frontend/src/services/api`.
12. Catalogar todos os endpoints registrados nos controllers.
13. Comparar esse inventário com a conversa, a skill e o `README.md`.
14. Criar uma massa de teste sem credenciais versionadas.

## P0.3 Aceite

- [ ] O estado inicial foi documentado.
- [ ] Nenhuma alteração pré-existente foi apagada.
- [ ] O build inicial foi executado.
- [ ] Falhas preexistentes foram separadas das falhas novas.
- [ ] Todas as rotas e endpoints atuais estão listados.
- [ ] A massa de teste não contém senha real no Git.
- [ ] O ambiente usa `docker-compose`, nunca `docker compose`.

---

# P1 — Saneamento completo do domínio LicitarsAI

## P1.1 Objetivo

Eliminar do produto todos os textos, rotas, cálculos, dados inventados e comportamentos de licitação que não pertencem à Evoluta, preservando a identidade visual da Mesa.

## P1.2 Tarefas de marca e vocabulário

1. Revisar `frontend/src/config/marca.ts`.
2. Confirmar:
   - nome Evoluta Gestão;
   - logo correto;
   - frase de gestão municipal;
   - campos de projeto municipal;
   - ação “Novo projeto”;
   - termos “Ações 5W2H” e “Nova ação 5W2H”;
   - agenda municipal;
   - indicadores municipais;
   - ausência de Lei 14.133.
3. Revisar `MARCA.campos` para que nenhum rótulo seja de licitação.
4. Substituir `Objeto` por “Nome do projeto” onde necessário.
5. Substituir “Modalidade” por “Secretaria” ou remover quando não houver campo correspondente.
6. Substituir “Abertura” por “Prazo final” somente quando o valor vier de `project.project.date`.
7. Usar “Responsável” somente quando houver `project.user_id` ou relação real.
8. Usar “Etapa” somente quando vier de etapa real do projeto/tarefa.
9. Nunca inventar valor para uma lacuna.

## P1.3 Tarefas de navegação

1. Revisar `components/layout/navegacao.ts`.
2. Cada item do menu deve apontar para uma tela real.
3. Implementar uma das duas alternativas para cada item legado:
   - entregar a tela operacional real; ou
   - remover item, rota e referências.
4. Não deixar links para `EmConstrucao` no caminho principal do produto.
5. Confirmar que a busca rápida usa a mesma lista do menu.
6. Confirmar que a barra móvel usa somente destinos existentes.
7. Confirmar que `RequerPerfil` recusa URL direta.

## P1.4 Tarefas de código legado

1. Reescrever `fasesDaLicitacao.ts` para domínio neutro ou remover toda chamada à lógica de licitação.
2. Reescrever `features/agenda/montarAgenda.ts` para atividades/prazos de projeto ou substituir pela agenda do Odoo.
3. Revisar `constants/process-status.ts` e manter somente estados reais.
4. Remover dados fictícios de `useMesaDados.ts`.
5. Garantir que ausência da API resulte em erro/vazio, nunca em projeto inventado.
6. Revisar `blocosDoItem.ts` e documentos gerados para usar campos Evoluta.
7. Revisar `Lista`, `Inicio`, `Paineis`, `Agenda`, `Item` e `PastaDoProcesso`.
8. Remover qualquer texto visível de licitação.
9. Manter identificadores internos antigos somente quando necessário para não quebrar dependências, sem exibi-los.
10. Confirmar `MARCA.leiAoLado = false` e busca sem grupo jurídico.

## P1.5 Busca obrigatória de legado

Executar buscas amplas e de texto de tela para:

```text
licita
licitars
edital
modalidade
proposta
pregão
sessão
impugnação
autos
14.133
órgão
contratação direta
prazo legal
planta
livro da gestão
```

Cada ocorrência deve ser classificada como:

```text
remover
substituir
identificador técnico aceitável
comentário/documentação aceitável
```

## P1.6 Aceite

- [ ] Nenhuma tela operacional usa vocabulário de licitação.
- [ ] Nenhum projeto mostra fases jurídicas fictícias.
- [ ] Nenhuma agenda mostra marcos de edital/sessão/impugnação.
- [ ] Nenhum menu leva a placeholder apresentado como recurso pronto.
- [ ] Nenhum dado de sucesso vem de memória local ou fixture.
- [ ] A busca não mostra “Na lei” ou artigos da Lei 14.133.
- [ ] Todas as rotas mantidas possuem tela real ou estão formalmente fora do menu.
- [ ] O visual da Mesa continua preservado.

---

# P2 — Fundação visual, navegação e estados da Mesa Evoluta

## P2.1 Objetivo

Aplicar integralmente a skill de frontend sem misturar domínio de exemplo.

## P2.2 Tarefas

1. Conferir `AppLayoutV3`, `AppHeaderV3`, `AppSidebarV3` e `BarraDoCelular`.
2. Conferir logo do produto e assinatura Evoluta.
3. Conferir tokens HSL claro/escuro.
4. Remover cores hex/classes proibidas em telas novas.
5. Conferir as quatro fontes oficiais.
6. Conferir `safelist` do Tailwind.
7. Conferir `FolhaDaTela`, `MesaPagina`, `PastaDoProcesso` e `ProcessoNaMesa`.
8. Garantir um único `h1` por rota.
9. Garantir foco visível em links, botões, inputs e divisórias.
10. Garantir `aria-label` em botão de ícone.
11. Garantir `aria-hidden` em ícones decorativos.
12. Garantir `MesaCarregando`, `MesaErroBusca`, vazio e conteúdo em toda tela real.
13. Garantir que erro não use toast genérico como única explicação.
14. Garantir que `AvisosDeResultado` sobreviva à navegação quando aplicável.
15. Garantir `ConfirmarAto` para atos com consequência.
16. Remover `alert()` e `confirm()` do navegador.
17. Conferir impressão opt-in e tema claro na impressão.
18. Conferir preferência de acessibilidade com `try/catch` no storage.

## P2.3 Aceite

- [ ] A faixa superior mantém logo, assinatura, busca, tema, ajuda e conta.
- [ ] O menu é azul-noite e o CTA usa o token correto.
- [ ] A barra de celular existe somente no celular.
- [ ] A folha é o elemento que rola no desktop.
- [ ] Toda tela real possui carregamento, vazio, erro/retry e conteúdo.
- [ ] Erros usam microcopy da skill.
- [ ] Não há texto técnico de componente na tela.
- [ ] Não há botão de ouro onde deveria haver botão de ação padrão.
- [ ] Tema claro e escuro não quebram contraste.
- [ ] A aplicação não estoura horizontalmente em 400 px.

---

# P3 — Sessão, perfis, tenants e organização municipal

## P3.1 Objetivo

Concluir o isolamento multi-tenant e o cadastro da estrutura municipal pelo React.

## P3.2 Backend/API

Garantir e testar:

```http
GET   /api/me
GET   /api/municipios
POST  /api/municipios
PATCH /api/municipios/:id
GET   /api/secretarias?municipio_id=:id
POST  /api/secretarias
PATCH /api/secretarias/:id
GET   /api/departamentos?secretaria_id=:id
POST  /api/departamentos
PATCH /api/departamentos/:id
GET   /api/usuarios
POST  /api/usuarios
PATCH /api/usuarios/:id
POST  /api/usuarios/:id/desativar
GET   /api/onboarding
PATCH /api/onboarding/:id
```

Regras:

- Super Admin pode criar município.
- Admin Municipal nunca pode criar município.
- Admin Municipal só cria usuários no próprio município.
- Somente Super Admin cria/vincula Admin Municipal.
- Secretário e Atendente não administram usuários.
- Secretário exige secretaria.
- Atendente exige secretaria e departamento.
- Usuário desativado não pode iniciar nova sessão.
- Desativar não apaga histórico.
- Nenhuma senha volta na resposta.
- Nenhum vínculo é aceito somente como texto.

## P3.3 Frontend

Concluir:

```text
/configuracoes/organizacao
/configuracoes/usuarios
/onboarding
```

Cada formulário deve validar:

- obrigatório;
- vínculo entre município/secretaria/departamento;
- perfil permitido;
- erro por campo;
- preservação após falha;
- recarga após sucesso.

## P3.4 Aceite

- [ ] Super Admin cria Município A e Município B.
- [ ] Super Admin cria Admin A e Admin B nos municípios corretos.
- [ ] Admin A não vê nem cria dados do Município B.
- [ ] Admin A cria Secretaria A e Departamento A.
- [ ] Admin A cria Secretário e Atendente corretamente vinculados.
- [ ] Secretário não acessa usuários/configuração global.
- [ ] Atendente não acessa configuração.
- [ ] Usuário sem vínculo recebe mensagem de configuração pendente.
- [ ] Rota direta proibida retorna `/unauthorized`.
- [ ] API direta proibida retorna `403` JSON.
- [ ] Logout limpa sessão sem expor dados no storage.

---

# P4 — Projetos: ficha completa, edição, escopo e arquivos

## P4.1 Objetivo

Entregar o objeto central do trabalho municipal sem campos fictícios.

## P4.2 Dados obrigatórios do projeto

A ficha deve buscar dados reais:

```text
nome
município
secretaria
departamento
prazo final
orçamento
responsável
etapa/situação
criado em
```

“Sem secretaria” deve ser substituído por uma lacuna explicativa como “Projeto municipal geral” quando esse for o significado real.

## P4.3 APIs

Concluir e padronizar:

```http
GET   /api/projetos
POST  /api/projetos
GET   /api/projetos/:id
PATCH /api/projetos/:id
POST  /api/projetos/:id/arquivar
GET   /api/projeto-etapas
```

O `PATCH` deve permitir somente campos autorizados e validar:

- escopo municipal;
- secretaria do município;
- departamento da secretaria;
- responsável do município;
- etapa válida;
- orçamento válido;
- prazo válido;
- estado arquivado.

## P4.4 Frontend

Concluir:

```text
/projetos
/projetos/new
/projetos/:id
/projetos/:id/editar
```

A criação e edição devem conter:

- nome;
- secretaria;
- departamento dependente da secretaria;
- prazo final;
- orçamento em reais;
- responsável municipal;
- etapa inicial/atual;
- explicação de projeto municipal geral.

A ficha deve permitir editar o que a permissão autorizar. Não pode deixar projetos antigos impossíveis de completar pelo React.

## P4.5 Aceite

- [ ] Projeto novo persiste todos os campos preenchidos.
- [ ] Projeto aparece com os valores na lista e na capa.
- [ ] Recarregar não perde dados.
- [ ] Editar projeto atualiza a ficha e a API.
- [ ] Secretaria filtra departamentos corretamente.
- [ ] Trocar secretaria limpa departamento inválido.
- [ ] Responsável de outro município é rejeitado.
- [ ] Secretaria de outro município é rejeitada.
- [ ] Projeto geral aparece para usuários autorizados do próprio município.
- [ ] Projeto restrito não aparece fora da secretaria.
- [ ] Prazo é exibido em `dd/mm/aaaa`.
- [ ] Orçamento é exibido em `R$ 1.234,56`.
- [ ] Campo vazio não vira zero enganoso quando o dado estiver ausente.
- [ ] Arquivar exige confirmação e não apaga histórico.

---

# P5 — Tasks, Kanban, atividades e agenda

## P5.1 Objetivo

Usar o Odoo Project como Kanban real e expor o trabalho operacional municipal pelo React.

## P5.2 APIs

Completar:

```http
GET   /api/projetos/:id/tasks
POST  /api/tasks
GET   /api/tasks/:id
PATCH /api/tasks/:id
POST  /api/tasks/:id/mover
POST  /api/tasks/:id/concluir
POST  /api/tasks/:id/arquivar
GET   /api/atividades?project_id=:id
POST  /api/atividades
PATCH /api/atividades/:id
POST  /api/atividades/:id/concluir
GET   /api/agenda?from=:date&to=:date
```

Regras:

- task sempre pertence a projeto;
- task herda o escopo do projeto;
- etapa deve pertencer ao projeto;
- responsável deve ser válido;
- data deve respeitar timezone documentado;
- concluir/mover/arquivar pode exigir confirmação;
- falha não pode apagar estado visual anterior.

## P5.3 Frontend

Concluir:

```text
/projetos/:id/kanban
/projetos/:id/tarefas
/projetos/:id/atividades
/agenda
```

O Kanban não pode ter colunas hardcoded como fonte de verdade. As colunas vêm do Odoo.

## P5.4 Aceite

- [ ] Zero task mostra estado vazio com próximo passo.
- [ ] Task aparece na coluna retornada pela API.
- [ ] Mover task persiste após reload.
- [ ] Mover para etapa de outro projeto retorna erro.
- [ ] Atendente não move task não autorizada.
- [ ] Responsável vê task própria.
- [ ] Secretário vê tasks do escopo permitido.
- [ ] Concluir exige confirmação e atualiza indicadores.
- [ ] Atividade criada aparece na agenda real.
- [ ] Agenda usa prazo/evento real, não marco de licitação.
- [ ] Falha de rede oferece retry.
- [ ] Duplo clique não cria duas tasks/atividades.

---

# P6 — Ferramentas metodológicas e workflow 5W2H

## P6.1 Objetivo

Fechar o diferencial Evoluta com persistência, edição, aprovação, escopo e geração de tasks.

## P6.2 Operações por ferramenta

| Ferramenta | Ler | Criar | Editar | Arquivar | Ações especiais |
|---|---:|---:|---:|---:|---|
| Ações 5W2H | Sim | Sim | Sim | Conforme modelo | solicitar/aprovar/reiniciar/gerar task |
| 5 Porquês | Sim | Sim | Sim | Conforme modelo | criar ação sem duplicar task |
| Ishikawa | Sim | Sim | Sim | Conforme modelo | causa raiz e criar ação |
| Riscos | Sim | Sim | Sim | Conforme modelo | gerar mitigação sem duplicar |
| RACI | Sim | Sim | Sim | Conforme modelo | validar Responsible diferente de Accountable |
| Matriz | Sim | Sim | Sim | Conforme modelo | calcular e gerar ação 5W2H |
| Stakeholders | Sim | Sim | Sim | Conforme modelo | análise de relacionamento |
| Triângulo | Sim | Sim | Sim | Conforme modelo | valores reais do projeto |
| Árvore de Problemas | Sim | Sim | Sim | Conforme modelo | converter em objetivos |
| Árvore de Objetivos | Sim | Sim | Sim | Conforme modelo | gerar ação |
| Teoria da Mudança | Sim | Sim | Sim | Conforme modelo | resultados do projeto |
| Templates | Sim | Conforme grupo | Conforme grupo | Sim | job e abrir projeto |

Se o backend não tiver uma operação, não simular no React. Primeiro criar API/modelo ou marcar como somente leitura.

## P6.3 5W2H

Endpoints:

```http
GET  /api/5w2h?project_id=:id
POST /api/5w2h
PATCH /api/5w2h/:id
POST /api/5w2h/:id/solicitar-validacao
POST /api/5w2h/:id/aprovar
POST /api/5w2h/:id/reiniciar-validacao
POST /api/5w2h/:id/gerar-task
```

Critérios:

- What obrigatório;
- prazo opcional ou obrigatório conforme regra confirmada;
- Who deve ser usuário municipal válido;
- How much deve ser moeda válida;
- project_id deve estar no escopo;
- cada ação tem um registro próprio;
- gerar task repetido atualiza a task existente;
- aprovação é decidida pelo Tier Odoo;
- frontend mostra estado real e revisor real;
- nenhuma ação mostra “aprovado” por inferência local.

## P6.4 Aceite

- [ ] Criar uma ação com todos os sete campos.
- [ ] Campo obrigatório vazio bloqueia antes do envio.
- [ ] API bloqueia payload incompleto.
- [ ] Responsável de outro município é rejeitado.
- [ ] Data e custo persistem após reload.
- [ ] Ação aparece dentro do projeto correto.
- [ ] Projeto pode ter várias ações diferentes sem conflito.
- [ ] Repetir criação da mesma operação não duplica por duplo clique.
- [ ] Solicitar validação muda estado real.
- [ ] Usuário sem etapa não consegue aprovar via UI nem API.
- [ ] Aprovação atualiza revisões e status.
- [ ] Gerar task cria uma task.
- [ ] Gerar task novamente não cria uma segunda task.
- [ ] Task recebe prazo e responsável do 5W2H.
- [ ] Task aparece no Kanban.
- [ ] Secretário e Admin veem o fluxo correto.
- [ ] Atendente não aprova o próprio plano por padrão.

## P6.5 Ferramentas derivadas

Para cada ferramenta:

1. carregar registro do projeto;
2. mostrar vazio orientado;
3. criar com validação;
4. editar persistido;
5. executar ação especial;
6. confirmar consequência;
7. recarregar resposta oficial;
8. impedir duplicação;
9. testar escopo entre Município A e B;
10. testar perfil sem permissão;
11. testar erro de rede preservando formulário.

---

# P7 — Estratégia, diagnósticos, riscos, RACI e templates

## P7.1 Objetivo

Transformar as ferramentas já integradas em um conjunto coerente de decisão e execução, sem deixar telas somente de criação.

## P7.2 Fluxo de estratégia

```text
Problema
  ↓
Diagnóstico: 5 Porquês / Ishikawa / Árvore de Problemas
  ↓
Objetivos / Triângulo / Stakeholders
  ↓
Matriz de decisão / Riscos / RACI
  ↓
Ação 5W2H
  ↓
Aprovação
  ↓
Task no Kanban
```

O frontend deve manter o vínculo entre todos os registros e o mesmo projeto.

## P7.3 Templates

Fluxo:

```text
Escolher template
  ↓
Confirmar geração
  ↓
Job pending
  ↓
Job started
  ↓
Job done ou failed
  ↓
Abrir projeto gerado
```

Critérios:

- template restrito por perfil/município;
- duplo clique não gera dois projetos por acidente;
- job pendente não é tratado como falho;
- job falho mostra motivo e retry;
- projeto gerado tem tasks e responsáveis reais;
- abrir projeto não expõe ID como única instrução ao usuário.

## P7.4 Aceite

- [ ] Um problema percorre diagnóstico até ação.
- [ ] Conversão de árvore cria um único objetivo por operação válida.
- [ ] Gerar ação não duplica task.
- [ ] RACI rejeita Responsible igual a Accountable.
- [ ] Matriz mostra totais do backend.
- [ ] Riscos têm mitigação persistida.
- [ ] Template gera o projeto e tasks esperados.
- [ ] Segundo clique no mesmo template tem comportamento idempotente documentado.
- [ ] Usuário fora do escopo não lê nenhum registro derivado.

---

# P8 — Demandas, Helpdesk, SLA, Chatter, comentários e anexos

## P8.1 Objetivo

Permitir operação diária de demandas e colaboração sem enviar servidor ao Helpdesk/Chatter do Odoo.

## P8.2 Demandas/Helpdesk

Completar:

```http
GET   /api/chamados
POST  /api/chamados
GET   /api/chamados/:id
PATCH /api/chamados/:id
POST  /api/chamados/:id/atribuir
POST  /api/chamados/:id/mover
POST  /api/chamados/:id/concluir
GET   /api/chamados/equipes
```

Regras:

- título e descrição obrigatórios;
- equipe válida;
- prioridade válida;
- estágio oficial do Helpdesk;
- SLA oficial do Odoo/OCA;
- chamado de outro município não revela existência;
- concluir exige confirmação;
- lista paginada quando necessário.

## P8.3 Comentários e anexos

Só criar API com lista branca de modelos e ações:

```http
GET  /api/registros/:tipo/:id/mensagens
POST /api/registros/:tipo/:id/mensagens
GET  /api/registros/:tipo/:id/anexos
POST /api/registros/:tipo/:id/anexos
GET  /api/anexos/:id/download
```

Regras:

- autor vem da sessão;
- texto não vazio;
- HTML/script sanitizado;
- tamanho e MIME validados;
- download exige sessão e escopo;
- URL pública permanente proibida;
- anexo precisa de registro pai;
- histórico não pode ser adulterado pelo React.

## P8.4 Aceite

- [ ] Usuário cria chamado pelo React.
- [ ] Chamado aparece no Helpdesk com os dados corretos.
- [ ] SLA exibido coincide com Odoo.
- [ ] Comentário permanece após reload.
- [ ] Anexo autorizado pode ser baixado.
- [ ] Usuário de outro município não lê comentário/anexo.
- [ ] HTML malicioso aparece como texto seguro.
- [ ] Chatter não é destino obrigatório da operação.
- [ ] Odoo parado produz erro e retry.

---

# P9 — Indicadores, auditoria de negócio e relatórios

## P9.1 Objetivo

Exibir números oficiais e rastreabilidade sem inventar cálculo no browser.

## P9.2 Indicadores mínimos

- total de tasks;
- tasks concluídas;
- tasks abertas;
- tasks atrasadas;
- demandas abertas;
- demandas vencidas;
- taxa de conclusão;
- tempo médio, somente se houver definição oficial;
- agrupamento por projeto, secretaria e etapa;
- filtros por período e escopo.

## P9.3 Auditoria

Admin Municipal deve consultar, conforme política:

- usuário que alterou prazo;
- usuário que alterou responsável;
- usuário que alterou orçamento;
- mudança de status;
- exclusão/arquivamento;
- data e valor anterior/novo quando disponíveis.

A auditoria é somente leitura no React.

## P9.4 Exportações

Se aprovadas para o produto:

- CSV/XLSX produzido pelo servidor;
- mesma permissão da tela;
- caracteres acentuados preservados;
- exportação grande como job;
- nenhum dado de outro município.

## P9.5 Aceite

- [ ] Números do React batem com Odoo.
- [ ] Período e timezone estão documentados.
- [ ] Filtro não altera apenas o cartão; altera todos os dados relacionados.
- [ ] Ausência de dado não vira zero enganoso.
- [ ] Usuário sem permissão não vê auditoria.
- [ ] Auditoria não pode ser editada.
- [ ] Exportação respeita escopo.
- [ ] Relatório vazio é diferente de erro.

---

# P10 — Acessibilidade, responsividade, impressão, PWA e produção

## P10.1 Matriz visual obrigatória

Toda rota real deve ser conferida em:

```text
Tema claro: 400, 768, 800, 820, 900, 1024, 1280 px
Tema escuro: 400, 768, 800, 820, 900, 1024, 1280 px
Preferência padrão
Texto maior
Texto bem maior + entrelinha
```

Conferir:

- nenhuma rolagem horizontal;
- avatar não sai da faixa;
- menu não cobre conteúdo indevidamente;
- botões não cortam texto;
- tabelas rolam dentro da própria caixa;
- formulário empilha;
- divisórias podem rolar horizontalmente sem criar rolagem da página;
- conteúdo longo quebra;
- foco é visível;
- texto mínimo é legível;
- contraste AA;
- `h1` único;
- labels associados;
- teclado funciona;
- mensagem de erro é anunciada;
- movimento respeita `prefers-reduced-motion`.

## P10.2 Impressão

Para cada tela imprimível:

- tema escuro imprime claro;
- cabeçalho da ficha permanece quando deveria;
- menu, ações e navegação não imprimem;
- não há `aside/footer` indevido;
- conteúdo não corta entre páginas;
- botão de imprimir é visível e acessível;
- documento `.docx` abre em ferramenta compatível quando testado.

## P10.3 PWA

Só implementar instalação/offline se confirmado como requisito. Se implementado:

- manifest Evoluta;
- ícones corretos;
- cache não expõe dado municipal;
- logout limpa dados sensíveis;
- escrita offline nunca é apresentada como confirmada;
- falha offline explica que o Odoo não confirmou a operação.

Sincronização offline complexa não entra sem especificação própria.

## P10.4 Produção

Antes do aceite:

- `VITE_ODOO_DB` configurável;
- nenhuma URL/banco hardcoded em produção;
- cookies seguros;
- SameSite definido;
- HTTPS;
- proxy Nginx documentado;
- CORS restrito;
- logs sem senha/cookie/token;
- backup 3-2-1;
- healthcheck;
- rollback documentado;
- sessão expirada tratada.

## P10.5 Aceite

- [ ] Todas as rotas passam na matriz visual.
- [ ] Não existe overflow horizontal não justificado.
- [ ] Navegação por teclado é possível.
- [ ] Contraste passa nos tokens e componentes novos.
- [ ] Impressão não perde conteúdo essencial.
- [ ] PWA, se implementado, não expõe cache sensível.
- [ ] Build de produção não contém credenciais.

---

# P11 — Testes automatizados, integração, regressão e aceite final

## P11.1 Pré-requisito de testes

Adicionar ao frontend, se ainda ausente:

```json
"test": "vitest run"
```

Avaliar também teste de navegador com Playwright ou ferramenta equivalente para os fluxos críticos. Se a instalação de dependências exigir rede, registrar a necessidade antes de prosseguir; não substituir teste de navegador por afirmação visual não conferida.

## P11.2 Testes unitários frontend

Cobrir:

- cliente HTTP com `200`, `400`, `401`, `403`, `404`, `409`, `500`, JSON inválido e timeout;
- logout após `401`;
- mensagem de `403`;
- transformação de `/api/me`;
- menus por perfil;
- guarda de rota;
- formatação de data e moeda;
- filtros e escopo;
- estados loading/error/empty/content;
- preservação de formulário após falha;
- retry;
- ações idempotentes;
- polling `pending → started → done`;
- polling `failed`;
- impedir dupla submissão;
- aprovação 5W2H;
- geração de task sem duplicação;
- atualização de Kanban;
- seleção secretaria → departamento;
- campos de projeto;
- renderização sem texto de LicitarsAI.

## P11.3 Testes backend/Odoo

Criar ou completar testes Odoo para:

- autenticação;
- perfis;
- ACL;
- record rules;
- município/secretaria/departamento;
- projeto fora do escopo;
- task fora do escopo;
- fields de projeto;
- 5W2H;
- responsável municipal;
- geração de task;
- anti-duplicação;
- aprovação por tier;
- chamados e SLA;
- jobs;
- templates;
- comentários;
- anexos;
- auditoria;
- desativação de usuário;
- arquivamento.

## P11.4 Massa de testes

Criar somente em banco de teste:

### Município A

- Secretaria de Administração;
- Departamento de Planejamento;
- Departamento de Compras;
- Admin Municipal A;
- Secretário A;
- Atendente de Planejamento A;
- Atendente de Compras A;
- projeto geral;
- projeto restrito à Administração;
- projeto restrito ao Planejamento;
- tasks próprias e de outro usuário;
- ações 5W2H em rascunho, aguardando aprovação, rejeitadas e aprovadas;
- chamado dentro do SLA;
- chamado vencido;
- template com várias tasks.

### Município B

- estrutura equivalente;
- usuários equivalentes;
- projetos e tasks que jamais podem aparecer para Município A.

Senhas devem ser fornecidas por variável de ambiente ou criadas manualmente. Nunca salvar senha neste plano.

## P11.5 Matriz de testes por perfil

### Super Admin

- criar Município A e B;
- criar Admin A e B;
- não misturar operação sem selecionar tenant;
- consultar apenas dados do tenant selecionado;
- confirmar que não cria grupo técnico pelo React.

### Admin Municipal

- ver somente município próprio;
- criar secretaria/departamento;
- criar usuários;
- criar/editar/arquivar projeto;
- definir prazo, orçamento, responsável e escopo;
- criar tarefas;
- usar ferramentas;
- aprovar quando Tier permitir;
- consultar indicadores e auditoria;
- gerar template/job;
- tentar acessar município B por URL e API.

### Secretário

- ver projeto geral próprio;
- ver projeto da própria secretaria;
- não ver projeto de outra secretaria;
- criar/editar o que a regra permitir;
- usar ferramentas;
- aprovar quando for revisor;
- não administrar usuários;
- tentar URL administrativa;
- tentar payload com secretaria alheia.

### Atendente

- ver somente tarefas/projetos permitidos;
- criar/editar 5W2H permitido;
- criar comentário/atividade autorizado;
- não criar município;
- não administrar organização;
- não aprovar próprio plano por padrão;
- não mover task de outro escopo;
- tentar API manualmente e confirmar `403`.

## P11.6 Teste de cada campo e interação

Para cada formulário:

1. abrir rota sem dados;
2. verificar estado de carregamento;
3. verificar labels e foco;
4. enviar vazio;
5. preencher somente um campo;
6. usar limite mínimo;
7. usar limite máximo permitido;
8. usar acentos e Unicode;
9. usar valor monetário brasileiro;
10. usar data no limite do dia;
11. selecionar e limpar dependências;
12. trocar secretaria e verificar departamento;
13. selecionar responsável;
14. clicar duas vezes rapidamente;
15. desligar Odoo durante o envio;
16. confirmar preservação do formulário;
17. corrigir e enviar novamente;
18. recarregar a página;
19. abrir o mesmo registro em outra sessão autorizada;
20. tentar abrir com sessão não autorizada;
21. conferir auditoria quando aplicável.

## P11.7 Indisponibilidade

Para cada grupo de telas críticas:

```bash
docker-compose stop web
```

Verificar:

- mensagem “Não deu para…”;
- nenhum dado inventado;
- botão “Tentar de novo”;
- formulário preservado;
- nenhum spinner infinito.

Restaurar:

```bash
docker-compose start web
docker-compose ps
```

Clicar em retry e confirmar dados reais.

## P11.8 Regressão final

Executar:

```bash
cd frontend
npm run typecheck
npm run test
npm run build
```

Executar:

```bash
python3 -m py_compile addons/evoluta/evoluta_api/controllers/*.py addons/evoluta/evoluta_core/models/*.py
```

Atualizar módulos:

```bash
docker-compose exec -T web odoo server -c /etc/odoo/odoo.conf -d demo -u evoluta_core,evoluta_api,evoluta_management,evoluta_strategy,evoluta_templates --stop-after-init
docker-compose restart web
docker-compose ps
docker-compose logs --no-color --tail=300 web
```

Reprovar se houver:

- traceback novo;
- upgrade falho;
- teste ignorado sem justificativa;
- endpoint retornando HTML para erro esperado;
- vazamento entre municípios;
- texto de licitação em tela;
- rota disponível sem permissão;
- build quebrado;
- teste automatizado ausente sem bloqueio documentado.

---

# P12 — Fechamento rigoroso: verdade dos campos, testes completos e aceite de produção

Esta fase existe para eliminar os últimos riscos antes de declarar o frontend pronto. Ela é obrigatória mesmo que as telas já existam e mesmo que os smoke tests básicos passem.

## P12.1 Objetivo e regra de bloqueio

O frontend somente poderá ser declarado concluído quando cada informação apresentada ao usuário atender simultaneamente a todos os critérios abaixo:

1. possui origem identificada no Odoo ou é um valor calculado/documentado;
2. possui contrato de API documentado no serviço correspondente;
3. está claro se é editável, somente leitura ou derivado;
4. somente aparece para perfis autorizados;
5. possui valor real, estado vazio explícito ou mensagem de indisponibilidade;
6. não sugere que o usuário possa preencher algo que o backend não aceita;
7. possui validação de entrada no frontend e no backend;
8. possui teste de sucesso, erro, escopo e persistência;
9. após salvar, recarregar ou abrir em outra sessão, o valor continua vindo do Odoo;
10. não depende de mock, dado fixo, texto de demonstração ou estado local como fonte oficial.

Qualquer campo sem essa comprovação bloqueia o aceite da tela. Não será permitido resolver o bloqueio escondendo o campo apenas para um perfil se o campo continuar aparecendo em outro fluxo sem contrato real.

## P12.2 Inventário obrigatório de campos do frontend

Criar `docs/MATRIZ-CAMPOS-FRONTEND.md` contendo uma linha para cada campo exibido ou editável. Cada linha deve possuir:

| Coluna obrigatória | Conteúdo |
|---|---|
| Tela e rota | rota React exata |
| Entidade | projeto, task, 5W2H, chamado, etc. |
| Rótulo exibido | texto exato visível ao usuário |
| Nome da API | chave JSON recebida/enviada |
| Origem | modelo/campo Odoo ou cálculo documentado |
| Tipo | texto, inteiro, decimal, moeda, data, seleção, relação, arquivo |
| Leitura | endpoint GET e condição de escopo |
| Escrita | endpoint POST/PATCH/ação ou `somente leitura` |
| Obrigatoriedade | obrigatória, opcional, condicional ou derivada |
| Perfis que editam | perfis explícitos |
| Perfis que visualizam | perfis explícitos |
| Validação | limites, formato, dependências e mensagem |
| Estado vazio | texto permitido quando não há valor |
| Auditoria | evento esperado ou `não aplicável` |
| Teste | identificador do teste automatizado/manual |

Auditar obrigatoriamente, no mínimo, estes grupos:

### Projeto

- nome;
- município;
- secretaria;
- departamento;
- prazo final;
- orçamento;
- responsável;
- etapa;
- ativo/arquivado;
- tasks do projeto;
- indicadores do projeto.

### Task/Kanban

- nome;
- projeto;
- etapa;
- prazo;
- responsáveis;
- situação concluída;
- atividade vinculada;
- comentários/anexos quando aplicável.

### 5W2H

- nome;
- What;
- Why;
- Where;
- When/data final;
- Who/responsável;
- How;
- How much/orçamento;
- estado do plano;
- validação/tier;
- task gerada;
- avaliações/revisões.

### Ferramentas metodológicas

- nome da análise;
- problema/objetivo;
- causas e efeitos;
- categorias;
- causa raiz;
- mitigação;
- probabilidade/impacto;
- Responsible, Accountable, Consulted e Informed;
- critérios, pesos, alternativas e notas;
- valor público, legitimidade e capacidade;
- contexto, insumos, atividades, produtos e resultados;
- origem e destino das conversões entre árvores, 5W2H e tasks.

### Helpdesk

- título;
- descrição;
- município;
- secretaria;
- departamento;
- prioridade;
- equipe;
- responsável;
- estágio;
- prazo/SLA;
- situação;
- comentários;
- anexos;
- tamanho, tipo e download do arquivo.

### Administração

- município e código IBGE;
- secretaria;
- departamento;
- nome, login e e-mail do usuário;
- senha temporária sem exibição posterior;
- perfil;
- município/secretaria/departamento do usuário;
- ativo/desativado;
- passos de onboarding.

### Indicadores e auditoria

- origem de cada contador;
- período utilizado;
- município/secretaria de agrupamento;
- diferença entre valor zero, vazio e indisponível;
- ação, entidade, usuário, data, município e detalhes da auditoria.

## P12.3 Regra para remover ou implementar campos

Para cada campo encontrado no inventário, executar exatamente uma das decisões:

### Decisão A — implementar

Usar quando o campo pertence ao produto e pode ser preenchido no frontend. Exigir:

1. endpoint de leitura;
2. endpoint de escrita;
3. validação backend;
4. controle de permissão;
5. persistência no Odoo;
6. recarga real após salvar;
7. auditoria quando for alteração de negócio;
8. teste automatizado e teste manual.

### Decisão B — tornar somente leitura

Usar quando o campo é derivado, calculado pelo Odoo ou controlado por workflow. Exibir o valor real e um rótulo explícito, por exemplo `Calculado pelo Odoo`, `Somente leitura` ou `Definido pelo workflow`. Não exibir input editável.

### Decisão C — remover da tela

Usar quando não há origem oficial, endpoint de escrita, regra de negócio aprovada ou necessidade no fluxo atual. Remover também labels, placeholders, cards vazios, filtros e mensagens que prometam a funcionalidade.

### Decisão D — bloquear como fora do escopo

Usar somente quando o item estiver formalmente classificado como Fase 2/Fase 3 ou administração técnica. Registrar a decisão no plano e não deixá-lo aparecer como funcionalidade operacional disponível.

É proibido manter campos com rótulos como `Sem secretaria`, `Sem prazo`, `R$ 0,00` ou `Sem dono` em um formulário se o usuário não tiver uma forma real de definir esse valor ou se o valor for obrigatório no domínio. Nesse caso, implementar a entrada ou remover o campo da tela de criação.

## P12.4 Contrato mínimo de cada tela

Antes de testar uma tela, documentar:

```text
Rota:
Perfis autorizados:
Entidade principal:
Endpoint de leitura:
Endpoints de escrita:
Campos exibidos:
Campos editáveis:
Campos derivados:
Permissões por ação:
Estados possíveis:
Estado vazio:
Erro de sessão:
Erro de permissão:
Erro de validação:
Retry:
Evento de auditoria:
Teste automatizado:
Teste manual:
```

Uma tela é reprovada se:

- mostra dados de outro município;
- mostra um input que o backend ignora;
- salva e não recarrega o valor real;
- usa valor local para simular sucesso;
- aceita botão para ação não autorizada;
- transforma `403`, `404` ou `500` em sucesso;
- apresenta `0`, vazio ou `Sem ...` como se fosse uma decisão válida sem informar a origem;
- possui uma rota acessível manualmente que não aparece na matriz de permissões.

## P12.5 Preparação da massa de testes descartável

Não executar a massa final no banco de demonstração usado para validação manual. Criar uma base de teste descartável através do `docker-compose` ou uma fixture controlada do Odoo.

A massa precisa conter:

### Município A — `municipio_a`

- Secretaria de Administração;
- Secretaria de Saúde;
- Departamento de Planejamento;
- Departamento de Atendimento;
- Admin Municipal A;
- Secretário de Administração A;
- Secretário de Saúde A;
- Atendente de Planejamento A;
- Atendente de Atendimento A;
- projeto geral do Município A;
- projeto da Administração;
- projeto da Saúde;
- projeto do Planejamento;
- projeto do Atendimento;
- task atribuída a cada atendente;
- task do mesmo município atribuída a outro usuário;
- task sem responsável;
- task concluída;
- task atrasada;
- atividade aberta e concluída;
- 5W2H em rascunho;
- 5W2H aguardando validação;
- 5W2H aprovado;
- 5W2H rejeitado;
- chamado no prazo;
- chamado vencido;
- chamado em outro departamento;
- ferramenta de cada tipo;
- template com múltiplas tasks;
- registros arquivados.

### Município B — `municipio_b`

Criar estrutura equivalente, com nomes inequivocamente diferentes e registros equivalentes. Nenhum registro de B poderá ser necessário para o fluxo de A, permitindo detectar vazamento de dados.

Regras da massa:

- nenhuma senha será gravada em arquivo versionado;
- senhas serão fornecidas por variáveis de ambiente ou criadas manualmente;
- IDs serão descobertos pela API, nunca fixados no frontend;
- os registros de teste terão prefixo identificável;
- o script de limpeza deverá arquivar ou remover somente os registros criados pela massa;
- a execução repetida deve ser idempotente ou falhar com mensagem clara antes de duplicar dados.

## P12.6 Matriz de autorização por perfil

Executar cada linha com sessão real do perfil e repetir a mesma ação por URL direta e requisição HTTP manual.

| Área/ação | Super Admin | Admin Municipal | Secretário | Atendente |
|---|---:|---:|---:|---:|
| listar municípios | global/selecionado | próprio | próprio | próprio |
| criar município | sim | não | não | não |
| editar/arquivar município | sim | não | não | não |
| criar secretaria/departamento | sim | próprio | não | não |
| criar usuário | sim | próprio, sem Admin Municipal | não | não |
| criar Admin Municipal | sim | não | não | não |
| criar projeto | sim | próprio | permitido no escopo | não |
| editar projeto | sim | próprio | permitido no escopo | não |
| arquivar projeto | sim | próprio | não | não |
| criar task | sim | próprio | permitido no escopo | não |
| editar task | sim | próprio | permitido no escopo | não |
| mover task | sim | próprio | permitido no escopo | somente própria/autorizada |
| concluir task | sim | próprio | permitido no escopo | somente própria/autorizada |
| arquivar task | sim | próprio | não por padrão | não |
| criar/editar ferramentas | sim | próprio | permitido no escopo | somente se regra específica autorizar |
| criar 5W2H | sim | próprio | permitido no escopo | não por padrão |
| solicitar aprovação | sim | próprio | permitido | não por padrão |
| aprovar próprio plano | conforme tier | conforme tier | conforme tier | não por padrão |
| Helpdesk | global/selecionado | próprio | secretaria própria | autorizado/departamento próprio |
| comentários/anexos | conforme escopo | conforme escopo | conforme escopo | registros autorizados |
| indicadores | global/selecionado | próprio | próprio/secretaria | somente se explicitamente autorizado |
| auditoria | global | próprio | não por padrão | não |
| templates | global/selecionado | próprio | permitido | não por padrão |

Os termos `permitido`, `conforme tier` e `autorizado` devem ser substituídos no inventário por regras verificáveis, nunca deixados como interpretação.

## P12.7 Testes automatizados frontend

Adicionar as dependências somente se justificadas e registrar versões no `package-lock.json`. Cobrir:

### Cliente HTTP

- GET autenticado;
- POST, PATCH e ações com CSRF;
- preservação de query string;
- `200`, `201`, `202`, `400`, `401`, `403`, `404`, `409`, `422`, `500`, `502`;
- HTML ou JSON inválido;
- timeout;
- sessão expirada;
- retry sem duplicar escrita;
- não enviar CSRF a login/logout JSON-RPC;
- não persistir CSRF em `localStorage`.

### Sessão e perfis

- `/api/me` normalizado;
- menu por perfil;
- rota protegida sem sessão;
- rota proibida com sessão válida;
- `403` não virar sucesso;
- logout limpar o estado;
- recarga restaurar sessão somente pelo cookie Odoo.

### Formulários

Para projeto, task, 5W2H, ferramentas, Helpdesk, organização e usuário:

- campo obrigatório vazio;
- espaços apenas;
- caracteres Unicode e acentos;
- número inválido;
- decimal com vírgula;
- valor negativo quando proibido;
- data inválida;
- data limite;
- seleção dependente;
- upload acima do limite;
- tipo de arquivo inadequado;
- dupla submissão;
- erro preservando valores digitados;
- sucesso limpando somente o formulário correto;
- reload conferindo persistência.

### Estados visuais

Cada tela deve ter teste de:

- loading;
- vazio legítimo;
- erro de rede;
- erro de permissão;
- sessão expirada;
- retry;
- conteúdo real;
- registro arquivado não aparecendo;
- conteúdo sem HTML inseguro;
- ausência de strings de LicitarsAI/licitação.

### Fluxos de negócio

- projeto cria e lista;
- projeto edita todos os campos autorizados;
- projeto arquiva e some das listas ativas;
- task cria, edita, move, conclui e arquiva;
- Kanban atualiza coluna após movimento;
- atividade cria, edita, conclui e aparece na agenda;
- 5W2H cria, edita, solicita aprovação, aprova/rejeita conforme regra e gera uma única task;
- árvore de problemas converte uma única vez em objetivos;
- objetivo gera uma única ação 5W2H e uma única task;
- ferramentas criam, editam, arquivam e escondem registros inativos;
- Helpdesk edita, atribui, move, conclui, comenta e anexa;
- template inicia job, consulta `pending → started → done`, abre o projeto real e trata `failed`/timeout;
- auditoria aparece após a operação correspondente.

## P12.8 Testes automatizados de navegador

Implementar Playwright ou equivalente com base URL do frontend servido pelo ambiente de teste. O teste deve usar sessão Odoo real ou fixture de autenticação controlada, nunca mock como caminho de sucesso.

Fluxos E2E obrigatórios:

1. login válido;
2. login inválido;
3. sessão expirada;
4. recuperação de conexão;
5. Admin Municipal abre Mesa;
6. cria projeto geral;
7. preenche prazo, orçamento, secretaria, departamento e responsável;
8. abre pasta do projeto;
9. abre Kanban;
10. cria, move e conclui task;
11. cria atividade e confirma na agenda;
12. cria e edita 5W2H;
13. solicita e conclui aprovação;
14. gera task sem duplicação;
15. usa cada ferramenta metodológica;
16. cria, edita e arquiva chamado;
17. adiciona comentário;
18. envia, baixa e valida anexo;
19. gera projeto por template;
20. abre indicadores;
21. abre auditoria;
22. Admin tenta abrir Município B;
23. Secretário tenta abrir outra secretaria;
24. Atendente tenta abrir task não atribuída;
25. Atendente tenta acessar área administrativa;
26. sessão expira durante formulário;
27. Odoo fica indisponível durante GET;
28. Odoo fica indisponível durante POST;
29. retry recupera o estado;
30. recarregar a página mantém os dados reais.

Cada teste E2E deve verificar URL, texto, rede, resposta HTTP, persistência posterior e ausência de console error novo. Não aceitar apenas screenshot como evidência.

## P12.9 Testes Odoo/backend

Criar testes Odoo executáveis dentro do container para:

- perfil derivado de grupos, nunca de login/e-mail;
- usuário sem município;
- usuário de município A acessando registro B;
- secretaria alheia;
- departamento alheio;
- projeto geral, de secretaria e de departamento;
- task atribuída e não atribuída;
- criação, edição e arquivamento com `active`;
- regras de responsáveis municipais;
- validação de campos obrigatórios;
- formato e limites monetários;
- datas inválidas e atrasadas;
- CSRF nas rotas mutáveis;
- Helpdesk preservando responsável válido;
- Helpdesk rejeitando responsável fora da equipe;
- comentários e anexos com escopo;
- download de anexo de outro município;
- SLA no prazo e vencido;
- 5W2H com estado e workflow;
- aprovação somente por revisor válido;
- geração idempotente de task;
- conversão idempotente de árvore;
- jobs de template com tenant correto;
- auditoria com usuário, município, entidade e operação;
- auditoria sem vazamento entre municípios;
- registros arquivados fora das listas ativas;
- usuários desativados sem login;
- tentativa de alteração de payload para outro município;
- respostas de erro sem traceback e sem HTML inesperado.

Executar os testes com `--test-enable` no banco descartável e registrar o comando exato, quantidade de testes e falhas.

## P12.10 Testes manuais de todos os campos

Para cada campo do `MATRIZ-CAMPOS-FRONTEND.md`:

1. abrir a tela com registro vazio;
2. confirmar label, ajuda, unidade e valor inicial;
3. enviar sem preencher;
4. preencher valor mínimo;
5. preencher valor máximo;
6. inserir acentos, emoji controlado e Unicode;
7. inserir espaços antes/depois;
8. inserir valor inválido;
9. verificar mensagem junto ao campo;
10. confirmar que nenhum campo sem endpoint aparece como input;
11. salvar;
12. verificar resposta de rede;
13. verificar auditoria;
14. recarregar;
15. abrir em outra sessão autorizada;
16. tentar abrir em sessão não autorizada;
17. verificar que o valor não foi substituído por mock;
18. editar;
19. arquivar quando aplicável;
20. confirmar que o registro arquivado desapareceu das listas ativas.

Para relações município → secretaria → departamento:

- trocar município e limpar seleções descendentes;
- impedir secretaria de outro município;
- impedir departamento de outra secretaria;
- alterar perfil e confirmar campos obrigatórios;
- testar limpeza da seleção;
- testar URL direta com IDs de outro tenant.

## P12.11 Indisponibilidade, sessão e integridade

Executar cada grupo crítico com:

```bash
docker-compose stop web
```

Verificar que o frontend:

- mostra erro acionável;
- não inventa registros;
- não confirma operação;
- não perde dados digitados sem aviso;
- não fica em spinner infinito;
- permite retry;
- não repete POST automaticamente sem idempotência.

Depois executar:

```bash
docker-compose start web
docker-compose ps
```

Repetir o fluxo e confirmar recuperação real.

Invalidar o cookie de sessão durante:

- listagem;
- abertura de detalhe;
- envio de formulário;
- polling de job;
- download de anexo.

Aceitar somente se cada situação direcionar ao login ou mostrar erro de sessão, sem sucesso falso.

## P12.12 Acessibilidade, responsividade, impressão e PWA

Validar em viewport de aproximadamente `400px`, tablet e desktop:

- nenhum corte horizontal indevido;
- menu abre/fecha por teclado;
- foco visível;
- ordem de tabulação lógica;
- labels associados aos campos;
- erro anunciado com `role=alert`;
- status anunciado com `role=status`;
- contraste em tema claro e escuro;
- botões com nome acessível;
- selects dependentes anunciados;
- modais fecháveis por Escape;
- tabelas/listas compreensíveis sem mouse;
- Kanban com alternativa acessível à interação por arrastar.

Impressão:

- remover botões e elementos de navegação;
- manter identificação, campos e estado do registro;
- não perder conteúdo essencial;
- não imprimir credenciais, tokens ou dados de outro município.

PWA:

- manifest válido;
- ícones e nome corretos;
- instalação disponível quando aplicável;
- shell abre sem API;
- `/api` nunca fica em cache persistente;
- logout não deixa dados municipais offline;
- service worker atualizado após nova versão;
- dados de Município A não aparecem após login de B no mesmo navegador.

## P12.13 Dados legados e migração

Antes do aceite final, produzir uma decisão documentada para:

- projetos sem município;
- chamados sem município;
- usuários municipais sem município;
- ferramentas arquivadas;
- 5W2H com `what` nulo;
- registros duplicados de teste;
- templates e jobs antigos.

Nenhum registro sem tenant poderá ser automaticamente atribuído a Município A ou B. Cada registro deve ser migrado com origem comprovada, arquivado ou mantido visível somente para `super_admin`, conforme decisão aprovada.

Para `evoluta.5w2h.what`:

1. listar todos os nulos;
2. identificar origem;
3. preencher somente quando o valor puder ser inferido com segurança;
4. arquivar ou corrigir registros sem origem confiável;
5. validar novamente;
6. aplicar a restrição `NOT NULL`;
7. atualizar módulos;
8. executar testes de criação e edição;
9. confirmar ausência do warning no log.

## P12.14 Segurança, dependências e produção

Executar:

```bash
cd frontend
npm audit --audit-level=moderate
```

Para cada vulnerabilidade, registrar pacote, severidade, caminho, correção proposta e impacto. Não executar `npm audit fix --force` sem revisar o diff e repetir typecheck, testes e build.

Verificar no build e no bundle:

- nenhuma senha;
- nenhum token CSRF;
- nenhuma credencial Odoo;
- nenhum login de teste;
- nenhum dado municipal de fixture;
- nenhum endpoint de banco;
- nenhum HTML de Odoo usado como caminho operacional.

Verificar no backend:

- todas as rotas mutáveis com CSRF;
- `auth="user"` onde necessário;
- nenhuma rota confia no frontend para escopo;
- IDs de outro município não retornam dados;
- anexos respeitam escopo;
- auditoria não pode ser alterada pelo usuário municipal;
- mensagens de erro não expõem traceback, senha ou dados internos.

## P12.15 Sequência obrigatória de execução

Executar nesta ordem e não pular etapas:

1. criar/atualizar `MATRIZ-CAMPOS-FRONTEND.md`;
2. auditar todos os inputs, cards, filtros e valores derivados;
3. remover ou implementar cada campo sem contrato;
4. criar massa descartável A/B;
5. criar testes Odoo;
6. adicionar testes Vitest faltantes;
7. configurar e executar Playwright;
8. executar matriz de autorização;
9. executar testes manuais campo-a-campo;
10. executar indisponibilidade e sessão expirada;
11. executar acessibilidade, responsividade, impressão e PWA;
12. tratar dados legados;
13. revisar `npm audit`;
14. executar typecheck, testes, build e `git diff --check`;
15. atualizar módulos pelo `docker-compose`;
16. repetir smoke HTTP real;
17. revisar logs sem traceback novo;
18. gerar relatório final com evidências;
19. verificar `git status`;
20. parar antes de commit/push e solicitar aprovação explícita.

## P12.16 Critérios finais de aceite

A fase P12 somente poderá ser marcada como concluída se todos forem verdadeiros:

- [ ] todo campo do frontend está no inventário;
- [ ] nenhum campo editável carece de endpoint real;
- [ ] nenhum dado derivado aparece como input;
- [ ] nenhum campo impossível de preencher permanece na tela;
- [ ] todos os perfis foram testados;
- [ ] Município A não acessa Município B;
- [ ] secretaria e departamento respeitam escopo;
- [ ] rota direta e API têm o mesmo bloqueio;
- [ ] todos os CRUDs apresentados são reais;
- [ ] todos os estados loading/empty/error/retry/content foram testados;
- [ ] erros preservam o formulário;
- [ ] dupla submissão não duplica registros;
- [ ] workflows são idempotentes;
- [ ] auditoria registra as operações exigidas;
- [ ] comentários e anexos foram testados com escopo;
- [ ] jobs foram testados até sucesso, falha e timeout;
- [ ] dados legados foram classificados;
- [ ] restrição `what NOT NULL` foi tratada ou bloqueio foi aprovado;
- [ ] testes Vitest passam;
- [ ] testes Playwright passam;
- [ ] testes Odoo passam;
- [ ] typecheck passa;
- [ ] build passa;
- [ ] `py_compile` passa;
- [ ] `git diff --check` passa;
- [ ] `docker-compose` está saudável;
- [ ] não há credenciais ou dados de teste no bundle;
- [ ] acessibilidade foi conferida;
- [ ] claro, escuro, 400px, tablet e desktop foram conferidos;
- [ ] impressão foi conferida;
- [ ] PWA foi testado ou formalmente classificado fora da entrega;
- [ ] `npm audit` foi analisado;
- [ ] não há texto/comportamento de LicitarsAI ou licitação;
- [ ] relatório final foi produzido;
- [ ] nenhum commit ou push foi feito sem aprovação explícita.

Nenhum item pode ser marcado como concluído por inferência. Cada `[x]` deve apontar para teste, comando, arquivo ou evidência verificável.

---

## 9. Critério de aceite por fase

Uma fase só pode receber `[x]` quando todos os itens aplicáveis abaixo estiverem comprovados:

- [ ] requisito de negócio identificado na fonte correta;
- [ ] API documentada;
- [ ] controller autenticado;
- [ ] ACL/record rule/escopo testados;
- [ ] rota React implementada;
- [ ] menu e guarda de rota implementados;
- [ ] GET real implementado;
- [ ] POST/PATCH/ação real implementado quando necessário;
- [ ] nenhum mock no caminho de sucesso;
- [ ] carregamento;
- [ ] vazio;
- [ ] erro;
- [ ] retry;
- [ ] sucesso e recarga;
- [ ] formulário preservado em falha;
- [ ] duplo clique controlado;
- [ ] teste autorizado;
- [ ] teste não autorizado;
- [ ] teste cross-municipality;
- [ ] teste claro;
- [ ] teste escuro;
- [ ] teste em 400 px;
- [ ] typecheck;
- [ ] testes frontend;
- [ ] build;
- [ ] testes backend/Odoo;
- [ ] documentação atualizada;
- [ ] nenhuma credencial/dado pessoal versionado.

Uma tela que apenas lista dados ou mostra `Em construção` não é uma tela concluída.

---

## 10. Definition of Done do produto completo

O produto só pode ser declarado pronto quando:

1. Super Admin, Admin Municipal, Secretário e Atendente entram pelo React.
2. Cada perfil vê somente o menu e os dados permitidos.
3. Município A nunca recebe dados do Município B.
4. Nenhum fluxo operacional obrigatório depende de `/web`.
5. Projetos possuem ficha real, edição e escopo.
6. Tasks aparecem e são movimentadas no Kanban oficial.
7. Atividades e agenda usadas pelo fluxo estão integradas ou foram formalmente excluídas.
8. Ações 5W2H têm os sete campos, aprovação e geração de task sem duplicação.
9. Diagnósticos e ferramentas mantêm vínculo com o projeto e geram ações reais.
10. Demandas/Helpdesk têm detalhe, escrita, SLA e permissões, ou estão formalmente fora da fase aceita.
11. Comentários e anexos, se apresentados no menu, são reais e seguros.
12. Indicadores batem com a fonte oficial.
13. Auditoria de negócio respeita escopo e é somente leitura.
14. Não há texto ou comportamento de LicitarsAI/licitação em telas municipais.
15. Não há placeholder operacional disponível no menu.
16. Não há fallback de sucesso local ou dado inventado.
17. `npm run typecheck` passa.
18. `npm run test` passa.
19. `npm run build` passa.
20. Testes Odoo passam dentro do `docker-compose`.
21. Testes manuais dos quatro perfis passam.
22. Testes de sessão expirada, Odoo desligado e retry passam.
23. Claro, escuro, 400 px e desktop passam.
24. Acessibilidade e teclado foram conferidos.
25. Impressão aplicável foi conferida.
26. PWA só é declarado se tiver sido implementado e testado.
27. Pendências restantes foram classificadas como fora do produto, Fase 2/3 ou bloqueio explícito aprovado.
28. O relatório final diferencia o que está no React, o que continua como engine Odoo e o que está fora do escopo.

---

## 11. Evidências obrigatórias no encerramento

O encerramento deve reunir:

- matriz de rotas;
- matriz de perfis;
- matriz de escopo municipal;
- lista de endpoints;
- lista de telas concluídas;
- lista de telas removidas por serem legado;
- saída de `npm run typecheck`;
- saída de `npm run test`;
- saída de `npm run build`;
- saída de `docker-compose ps`;
- confirmação de upgrade dos módulos;
- logs sem traceback novo;
- resultado dos testes Odoo;
- resultado de Odoo ligado/desligado;
- resultado de sessão expirada;
- resultado de duplo clique/idempotência;
- resultado de claro/escuro/400 px;
- pendências restantes;
- riscos conhecidos;
- confirmação de que nenhum commit ou push foi feito sem autorização.

Formato do relatório final:

```text
EVOLUTA GESTÃO — ACEITE DO FRONTEND

Produto e domínio:
O que o React cobre:
O que permanece como engine Odoo:
O que permanece somente como administração técnica:
Legado removido:
Rotas concluídas:
Rotas removidas:
Perfis testados:
Isolamento entre municípios:
Permissões:
Ações 5W2H e tasks:
Kanban:
Demandas/Helpdesk:
Indicadores/auditoria:
Tema claro:
Tema escuro:
Largura ~400px:
Teclado/acessibilidade:
Impressão:
Testes automatizados:
Odoo ligado/desligado:
Pendências aceitas:
Pendências bloqueadoras:
```

---

## 12. Pré-requisitos, permissões e bloqueios

A execução pode exigir:

- instalação de dependências de teste frontend;
- acesso de rede ao registry npm;
- permissões para atualizar módulos no container Odoo;
- banco de teste descartável ou dados de teste controlados;
- usuários municipais de teste sem senha versionada;
- eventual confirmação da Evoluta sobre funcionalidades opcionais;
- definição de quais rotas devem ser entregues agora e quais devem ser removidas do menu;
- eventual aprovação para adicionar Playwright ou ferramenta equivalente.

Se uma permissão ou dependência for necessária, a execução deve parar antes de contornar o bloqueio e informar:

1. qual acesso é necessário;
2. por que é necessário;
3. qual comando/arquivo será afetado;
4. qual validação ficará impossível sem ele.

Não criar script para burlar hook, não copiar segredo, não usar credencial real em teste e não fazer commit/push sem autorização explícita.

---

## 13. Regra final de execução

A partir deste documento, o desenvolvimento deve seguir esta ordem:

```text
ler fonte correta
  ↓
identificar domínio e permissão
  ↓
verificar se Odoo/OCA já oferece
  ↓
definir API segura
  ↓
implementar React na Mesa Evoluta
  ↓
remover legado visível
  ↓
testar cada campo e interação
  ↓
testar cada perfil e município
  ↓
testar claro/escuro/responsivo
  ↓
rodar testes automatizados e Odoo
  ↓
repetir até não haver falha bloqueadora
  ↓
relatar o que ficou fora ou bloqueado
```

O trabalho não deve ser encerrado porque a tela “parece pronta”. Ele só termina quando a persistência, a permissão, o isolamento, a interação, a responsividade, os estados e a regressão estiverem comprovados.
