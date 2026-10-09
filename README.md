# Evoluta Gestão — guia oficial do frontend

**Projeto:** Evoluta Gestão sobre Odoo Community 19
**Objetivo deste arquivo:** eliminar a ambiguidade entre o produto Evoluta, o padrão visual da skill `Evoluta_frontend` e os exemplos herdados do LicitarsAI/AlphaMec.

> Este README é um guia de decisão para o desenvolvimento do frontend. Ele não substitui os documentos-fonte; organiza como eles devem ser aplicados no código.

---

## 1. Resposta curta: o que o frontend precisa ser

O frontend da Evoluta é a **interface operacional da gestão interna de uma prefeitura**.

O servidor municipal não deve precisar abrir a interface `/web` do Odoo para trabalhar no dia a dia. Ele deve conseguir, pela aplicação React:

1. entrar com sua conta municipal;
2. visualizar somente os dados do seu município e do seu escopo organizacional;
3. organizar projetos, ações, tarefas e demandas;
4. usar as ferramentas metodológicas da Evoluta;
5. acompanhar as tarefas no Kanban;
6. solicitar e realizar aprovações conforme seu perfil;
7. consultar indicadores, prazos, histórico, comentários e evidências quando essas integrações estiverem disponíveis;
8. receber mensagens claras para erro, falta de permissão, sessão expirada, vazio e carregamento;
9. usar a aplicação em desktop, tablet, celular, tema claro, tema escuro e com acessibilidade.

O Odoo continua sendo a **engine**. O React é a experiência oficial.

---

## 2. Fontes oficiais e responsabilidade de cada uma

### 2.1 Fonte de negócio: conversa na raiz

Arquivo:

```text
Conversa_Estrategia_GovTech_Evoluta_Odoo_Community_19.md
```

Define:

- o problema que a Evoluta resolve;
- o público-alvo;
- o que é produto Evoluta;
- quais recursos devem ser reutilizados do Odoo/OCA;
- quais ferramentas são diferenciais próprios;
- quais itens ficam para Fase 2 ou Fase 3;
- o que não deve ser confundido com o produto.

Decisões principais da conversa:

- Odoo Community 19 é a base tecnológica.
- Odoo Project é o coração operacional.
- O Kanban, as tarefas, atividades, agenda, usuários, contatos, formulários, Helpdesk, aprovações, indicadores, auditoria e anexos devem ser reutilizados quando já existirem.
- A Evoluta deve desenvolver a camada metodológica e a experiência de gestão pública.
- Não devemos reconstruir no React um Kanban, workflow ou cálculo que já pertence ao Odoo.
- O produto é voltado à **gestão interna da prefeitura**, não a um portal público do cidadão.
- A interface do usuário municipal é o React; `/web` fica para administração técnica e configurações ainda não expostas.

### 2.2 Fonte visual e de interação: skill do frontend

Arquivo:

```text
.claude/skills/Evoluta_frontend/SKILL.md
```

Define:

- a identidade visual “Mesa de Trabalho Evoluta”;
- cores, fontes, tokens e temas;
- moldura azul-noite;
- folhas marfim;
- menu lateral e barra do celular;
- login;
- pastas, divisórias, carimbos e blocos;
- estados de carregamento, erro, vazio e conteúdo;
- acessibilidade;
- responsividade em aproximadamente 400 px;
- impressão;
- regras de navegação e proteção de rotas;
- microcopy em português do Brasil;
- critérios de build e verificação.

A skill é a fonte do **como a aplicação deve se apresentar**, não da regra de negócio municipal.

### 2.3 Verdade técnica de execução

Durante a implementação, também devem ser consultados:

```text
addons/evoluta/*
addons/oca/*
docs/PLANO-FRONTEND-USUARIOS-MUNICIPAIS.md
```

Esses arquivos confirmam:

- modelos existentes;
- campos reais;
- permissões;
- rotas da API;
- workflows;
- escopos de município, secretaria e departamento;
- o que já foi integrado e o que ainda falta.

Quando houver conflito:

1. segurança, permissões e comportamento real do Odoo prevalecem;
2. a conversa prevalece para o produto e o escopo;
3. a skill prevalece para visual e interação;
4. o plano detalha a execução, mas não deve inventar uma regra de negócio contrária às fontes acima.

---

## 3. O que é Evoluta e o que é apenas referência

### 3.1 O que pertence ao produto Evoluta

```text
Município
Secretaria
Departamento
Usuários e perfis
Projetos
Tarefas
Kanban
Atividades
Demandas/Helpdesk
Aprovações
Indicadores
Auditoria de negócio
Templates
```

Ferramentas metodológicas próprias:

```text
5W2H
5 Porquês
Ishikawa
RACI
Matriz de Decisão
Riscos
Triângulo Estratégico
Stakeholders
Árvore de Problemas
Árvore de Objetivos
Teoria da Mudança
```

### 3.2 O que vem do Odoo/OCA e deve ser reutilizado

| Necessidade | Fonte esperada | Regra para o React |
|---|---|---|
| Usuários e autenticação | Odoo Base | Consumir sessão e `/api/me`; não criar autenticação paralela |
| Projetos | Odoo Project + campos Evoluta | Usar API real |
| Tarefas e Kanban | Odoo Project | Exibir e mover tasks do Odoo; não criar Kanban local |
| Atividades | Odoo Activities | Integrar quando a API estiver disponível |
| Agenda | Odoo Calendar | Não criar agenda paralela sem necessidade |
| Comentários e histórico | Chatter | Integrar, sem criar chat separado no MVP |
| Anexos/evidências | Attachments | Integrar quando exposto pela API |
| Demandas e SLA | OCA Helpdesk | Usar os registros e estados do Odoo |
| Aprovações | OCA Tier Validation | Odoo decide quem pode aprovar |
| Auditoria | OCA Auditlog | React mostra auditoria de negócio; configuração continua técnica |
| KPI/BI | OCA KPI, BI SQL Editor ou MIS | Exibir dados reais; não inventar contadores |
| Timeline/Gantt | OCA Project Timeline | Usar se instalado e exposto |
| Assinatura | `sign_oca` | Fase 2, se o fluxo exigir |
| Jobs | `queue_job`/runner Evoluta | React acompanha status; não executa job diretamente |

### 3.3 O que é referência visual, não domínio do produto

O **LicitarsAI** e os exemplos dentro de `.claude/skills/Evoluta_frontend/assets/exemplos/` servem para:

- composição visual;
- proporção das telas;
- moldura;
- menu;
- pastas;
- folhas;
- carimbos;
- navegação por divisórias;
- responsividade;
- acessibilidade;
- microcopy e estados.

Eles **não autorizam copiar** para a Evoluta:

- licitação;
- edital;
- modalidade;
- pregão;
- sessão pública;
- impugnação;
- proposta;
- autos;
- Lei 14.133;
- processos licitatórios;
- cronogramas jurídicos de licitação.

O visual pode ser o mesmo. O vocabulário e o fluxo devem ser municipais e de gestão pública.

### 3.4 O que era hipótese antiga da AlphaMec e não é o produto atual

O README anterior registrava uma hipótese inicial de “Central do Munícipe”. Ela foi substituída pela estratégia oficial.

Não fazem parte do produto atual, salvo decisão futura explícita:

- portal do cidadão;
- cadastro de munícipes;
- tapa-buraco por bairro;
- ouvidoria pública como núcleo do produto;
- CRM genérico;
- dashboard genérico do prefeito;
- atendimento público anônimo.

O produto atual é para **servidores e gestores municipais na gestão interna da prefeitura**.

---

## 4. Modelo mental do produto

### 4.1 Hierarquia organizacional

```text
Super Admin da Evoluta
  └── Municípios/clientes
        └── Município
              ├── Secretarias
              │     └── Departamentos
              └── Usuários municipais
```

### 4.2 Perfis

#### Super Admin da Evoluta

Administração global da plataforma:

- cadastra municípios/clientes;
- cria ou vincula Admin Municipal;
- administra tenants;
- não deve ser confundido com um administrador de uma prefeitura específica.

#### Admin Municipal

Administra somente o próprio município:

- secretarias;
- departamentos;
- Secretários;
- Atendentes;
- projetos;
- ações, tarefas e ferramentas autorizadas.

Não pode:

- criar outro município;
- acessar outro município;
- criar outro Admin Municipal;
- alterar configuração técnica global.

#### Secretário

Acessa:

- o próprio município;
- sua secretaria;
- projetos municipais gerais autorizados;
- projetos da própria secretaria;
- tarefas e ferramentas permitidas;
- fluxos de aprovação de sua responsabilidade.

#### Atendente

Acessa somente o trabalho autorizado:

- tarefas compartilhadas/atribuídas;
- projetos dentro do escopo permitido;
- 5W2H e ações permitidas;
- demandas autorizadas.

Não administra município, usuários ou configuração global e não aprova o próprio plano por padrão.

### 4.3 Escopo de dados

A regra precisa existir no backend e ser refletida no frontend:

```text
Município diferente       → nunca aparece
Secretaria diferente      → não aparece quando o projeto é restrito
Projeto sem secretaria    → projeto municipal geral
Departamento diferente    → não aparece para Atendente fora do departamento
```

O menu pode esconder uma tela, mas somente o backend pode garantir segurança. A rota também deve recusar acesso direto por URL.

---

## 5. Modelo de projeto, ação, 5W2H e tarefa

Esta é a separação que evita a maior parte da confusão atual:

```text
Projeto / iniciativa
  ├── diagnóstico metodológico
  ├── várias ações possíveis
  ├── cada ação pode ter um 5W2H
  └── cada 5W2H aprovado pode gerar uma project.task
                                   └── aparece no Kanban
```

### Projeto

É o contêiner da iniciativa municipal, por exemplo:

```text
Implantação da LGPD
Plano de redução de despesas
Melhoria do atendimento da Saúde
```

A ficha do projeto deve ter, quando aplicável:

- nome;
- município;
- secretaria;
- departamento;
- prazo final;
- orçamento;
- responsável;
- etapa/situação real do projeto.

### Ação/5W2H

É uma ação concreta dentro do projeto:

```text
Levantar inventário de dados da Saúde
Realizar reunião com a TI
Validar minuta com o Jurídico
```

O 5W2H contém:

```text
What       — o quê
Why        — por quê
Where      — onde
When       — quando
Who        — quem
How        — como
How much   — quanto
```

Um projeto pode ter várias ações 5W2H quando elas forem ações diferentes. O problema não é existir mais de um registro; o problema seria duplicar a mesma ação ou gerar duas tasks para o mesmo 5W2H.

A interface deve preferir os rótulos:

```text
Ações 5W2H
Adicionar ação 5W2H
Nova ação 5W2H
```

em vez de dar a impressão de que cada registro é um novo projeto.

### Tarefa

É o registro operacional do Odoo (`project.task`).

Quando o 5W2H é aprovado e a task é gerada:

- a task aparece no Kanban;
- o responsável e o prazo devem ser sincronizados;
- clicar novamente em gerar não deve duplicar a task do mesmo 5W2H;
- a execução acontece na task, não no formulário do 5W2H.

### Demanda

Uma demanda recebida por formulário, e-mail ou Helpdesk pode virar:

```text
Demanda → tarefa
Demanda → projeto
```

Ela não deve ser confundida automaticamente com um projeto estratégico.

---

## 6. O frontend obrigatório por área

### 6.1 Fundação visual e navegação

Obrigatório seguir a `Evoluta_frontend/SKILL.md`:

- moldura azul-noite;
- logo do produto + assinatura Evoluta;
- folha de trabalho;
- menu lateral no desktop;
- gaveta e barra inferior no celular;
- tema claro e escuro;
- quatro estados em cada tela: carregando, erro, vazio e conteúdo;
- `h1` único por tela;
- foco visível;
- `aria-label` em botões de ícone;
- sem rolagem horizontal a aproximadamente 400 px;
- impressão somente quando a tela for declarada imprimível;
- tokens de cor e fontes da skill, sem hex/cores improvisados em telas novas.

### 6.2 Login e sessão

- login real por sessão/cookie do Odoo;
- `/api/me` como fonte do perfil, município, secretaria, departamento e permissões;
- sessão expirada com mensagem clara;
- logout real;
- recuperação de senha somente deve prometer o que realmente está implementado;
- nenhuma senha ou usuário real em código/documentação.

### 6.3 Administração global e organização municipal

Rotas previstas:

```text
/configuracoes/organizacao
/configuracoes/usuarios
```

Funcionalidades:

- Super Admin cria município;
- Super Admin cria/vincula Admin Municipal;
- Admin Municipal cria secretarias e departamentos do próprio município;
- Admin Municipal cria Secretários e Atendentes;
- vínculo de cada usuário a município, secretaria e departamento;
- validação de escopo no backend;
- frontend não pode permitir seleção de outro município para usuário municipal.

### 6.4 Minha Mesa / dashboard operacional

A tela inicial deve responder:

- o que está atrasado;
- o que vence em breve;
- quais tarefas estão abertas;
- quais demandas aguardam ação;
- quais aprovações estão pendentes;
- quais indicadores resumem o trabalho do usuário.

Não colocar números fictícios. Se uma fonte ainda não estiver integrada, mostrar estado vazio ou “recurso ainda não disponível”, não zero enganoso.

### 6.5 Projetos

Rotas principais:

```text
/projetos
/projetos/new
/projetos/:id
```

A lista deve:

- vir da API real;
- respeitar escopo do usuário;
- mostrar projeto, secretaria, responsável, prazo, orçamento e situação reais;
- permitir abrir a pasta do projeto;
- informar vazio, erro e retry.

A criação deve permitir, quando autorizado:

- nome;
- município implícito pelo escopo;
- secretaria;
- departamento;
- prazo;
- orçamento;
- responsável;
- etapa inicial.

A ficha não pode exibir campos de licitação como se fossem reais.

### 6.6 Pasta do projeto

A pasta é a principal área de trabalho do projeto. Pode conter divisórias para:

```text
Capa
Kanban
Ações 5W2H
5 Porquês
Ishikawa
Matriz de Decisão
RACI
Riscos
Estratégia
Stakeholders
Árvore de Problemas
Árvore de Objetivos
Teoria da Mudança
Indicadores
```

Cada divisória precisa:

- ter rota real;
- indicar claramente quando está em construção;
- não expor nome de componente ou arquivo ao usuário;
- buscar dados reais quando declarada implementada;
- ter permissão e escopo aplicados.

Não é obrigatório que todas as divisórias existam no MVP. É obrigatório que as que aparecem como disponíveis sejam reais ou sejam marcadas honestamente como pendentes.

### 6.7 Kanban e tarefas

O Kanban deve usar as tasks e etapas do Odoo Project.

Fluxo conceitual da conversa:

```text
NÃO INICIADO
→ PLANEJADO
→ EM EXECUÇÃO
→ AGUARDANDO TERCEIRO
→ VALIDAÇÃO
→ CONCLUÍDO
```

O React deve:

- carregar etapas e tasks reais;
- mostrar responsável e prazo;
- mover task pela API;
- respeitar permissões;
- impedir que o usuário mova task fora do escopo;
- refletir a mudança após recarregar;
- mostrar estados de erro sem apagar os dados já carregados.

Não construir um Kanban paralelo no estado local.

### 6.8 Ferramentas metodológicas

#### 5W2H

- criar/consultar ações ligadas ao projeto;
- todos os sete campos;
- responsável municipal real;
- prazo e custo;
- validação em níveis do Odoo;
- gerar ou atualizar a task sem duplicação;
- mostrar status de aprovação e task relacionada.

#### 5 Porquês

```text
Problema → Por quê 1 → Por quê 2 → Por quê 3 → Por quê 4 → Por quê 5 → Causa raiz
```

- persistir no projeto;
- exigir dados necessários;
- botão “Criar ação”;
- criar/atualizar task sem duplicar.

#### Ishikawa

Categorias previstas:

```text
Pessoas, Processos, Tecnologia, Recursos, Ambiente e Gestão
```

- registrar causas;
- definir causa raiz;
- criar ação/task quando aplicável.

#### Matriz de decisão

- critérios definidos pelo gestor;
- pesos e notas;
- alternativas;
- cálculo oficial no backend;
- vencedor;
- geração de uma ação 5W2H por operação válida, sem duplicação acidental.

#### Riscos

- risco ligado ao projeto;
- probabilidade;
- impacto;
- mitigação;
- responsável;
- ação de mitigação sem duplicar task.

#### RACI

Por tarefa:

```text
Responsible
Accountable
Consulted
Informed
```

O backend deve impedir Responsible igual a Accountable quando essa for a regra do modelo.

#### Estratégia

- Triângulo Estratégico;
- Stakeholders;
- Árvore de Problemas;
- Árvore de Objetivos;
- Teoria da Mudança, quando o módulo estiver no escopo da fase.

### 6.9 Demandas e Helpdesk

O fluxo oficial de demanda é:

```text
NOVA DEMANDA
→ TRIAGEM
→ RESPONSÁVEL
→ EM ATENDIMENTO
→ AGUARDANDO
→ CONCLUÍDA
```

O frontend futuro deve cobrir:

- lista;
- detalhe;
- criação;
- atualização;
- responsável;
- SLA;
- comentários;
- anexos;
- conversão para tarefa/projeto quando houver regra real.

### 6.10 Aprovações

Fluxo conceitual:

```text
Plano de ação
→ Coordenador
→ Secretário
→ Controle interno
→ Gabinete
→ Aprovado
```

O React não decide quem pode aprovar. Ele exibe e chama a API; o Odoo valida tier, perfil, escopo e estado.

### 6.11 Indicadores, auditoria e relatórios

Indicadores iniciais:

- tempo médio;
- projetos atrasados;
- ações concluídas;
- demandas abertas;
- demandas vencidas;
- taxa de conclusão;
- contagem de tasks por etapa.

Auditoria de negócio deve permitir consultar, quando autorizado:

- quem alterou prazo;
- quem alterou responsável;
- quem alterou valor;
- quem mudou status;
- quem excluiu registro.

Configuração técnica de auditoria continua no Odoo.

---

## 7. O que está fora do MVP ou não deve ser construído agora

### Fora do produto atual

- portal público do cidadão;
- cadastro de munícipe;
- CRM genérico;
- Kanban independente do Odoo;
- agenda paralela ao Odoo Calendar;
- RH completo;
- chat interno separado do Chatter;
- manutenção técnica do Odoo pelo frontend;
- edição de ACL, banco, Docker, Nginx, SSL e backup pelo usuário municipal.

### Fase 2

Conforme a conversa oficial:

- templates avançados;
- Portal, se necessário para acompanhamento externo;
- BI/MIS avançado;
- workflows avançados;
- assinatura;
- jobs assíncronos;
- Teoria da Mudança, se ainda não estiver coberta pela implementação atual.

### Fase 3

- IA;
- automação preditiva;
- API pública;
- integrações externas não definidas.

Não colocar botões dessas áreas no menu operacional sem implementação real.

---

## 8. Itens herdados que devem ser removidos ou neutralizados

Ao revisar uma tela, procurar principalmente:

```text
licita, licitars, edital, modalidade, proposta, pregão,
sessão, impugnação, autos, Lei 14.133, contratação,
órgão, processo licitatório, abertura de proposta
```

Também revisar nomes e telas do exemplo:

```text
Arquivo
Biblioteca
Planta da repartição
Livro da gestão
Prazos de licitação
```

Alguns identificadores internos antigos podem permanecer para não quebrar código, mas não podem aparecer ao usuário. A skill permite manter nomes técnicos como `Process`, `PastaDoProcesso` e `fasesDaLicitacao` temporariamente; o texto exibido deve ser do domínio Evoluta.

Nunca copiar dados reais de prefeitura, servidores, CPF, CNPJ, valores ou processos para fixtures, documentação ou código.

---

## 9. Definition of Done de uma tela

Uma tela só deve ser considerada pronta quando todos os itens aplicáveis forem verdadeiros:

- [ ] rota acessível;
- [ ] menu e guarda de rota configurados;
- [ ] API real, sem fixture local;
- [ ] município/secretaria/departamento respeitados;
- [ ] permissão validada no backend e refletida no frontend;
- [ ] carregamento com texto;
- [ ] vazio com explicação e próximo passo;
- [ ] erro com retry;
- [ ] conteúdo real;
- [ ] criação/edição/ação necessária;
- [ ] feedback de sucesso e erro;
- [ ] persistência conferida após recarregar;
- [ ] estado proibido testado;
- [ ] tema claro conferido;
- [ ] tema escuro conferido;
- [ ] largura aproximada de 400 px conferida;
- [ ] teclado e foco visível conferidos;
- [ ] `h1` único e rótulos acessíveis;
- [ ] impressão conferida quando aplicável;
- [ ] `npm run typecheck` executado;
- [ ] `npm run build` executado;
- [ ] testes automatizados existentes executados;
- [ ] limitações registradas sem fingir que estão prontas.

O padrão de relato da skill deve ser usado:

```text
MESA EVOLUTA — <o que foi aplicado>
Onde: <telas/arquivos>
Tema claro: conferido | não conferido
Tema escuro: conferido | não conferido
Largura ~400px: conferido | não conferido
Ficou pela metade/simulado: <lista>
Não consegui conferir: <lista>
```

---

## 10. Ordem recomendada de desenvolvimento

### P0 — segurança e base operacional

1. sessão real e `/api/me`;
2. perfis reais;
3. isolamento por município/secretaria/departamento;
4. proteção de menu e rota;
5. erros JSON consistentes;
6. projetos e tarefas reais;
7. Kanban real.

### P1 — fluxo diário do servidor

1. criação e edição de projetos;
2. ficha completa do projeto;
3. tarefas, responsáveis e prazos;
4. ações 5W2H;
5. aprovação e geração de task;
6. 5 Porquês, Ishikawa, riscos, RACI e matriz;
7. indicadores básicos;
8. demandas e SLA.

### P2 — governança e produtividade

1. atividades e agenda;
2. Chatter, comentários e anexos;
3. histórico e auditoria de negócio;
4. templates;
5. exportações e relatórios;
6. BI/MIS;
7. onboarding completo.

### P3 — itens posteriores

1. assinatura;
2. Portal externo, se necessário;
3. jobs avançados;
4. IA;
5. automação preditiva;
6. API pública;
7. integrações externas.

---

## 11. Estado atual conhecido do repositório

Já existem integrações reais no React para parte de:

- login e sessão Odoo;
- perfil administrativo;
- projetos e tarefas;
- Kanban e movimentação de tasks;
- Stakeholders;
- 5 Porquês;
- Ishikawa;
- Riscos;
- RACI;
- Matriz de decisão;
- Estratégia e árvores;
- Teoria da Mudança;
- Templates e jobs;
- Chamados e SLA;
- Indicadores;
- aprovação de 5W2H;
- organização municipal e usuários.

O fechamento de qualidade está documentado em `docs/MATRIZ-CAMPOS-FRONTEND.md`. A matriz registra, campo a campo, a origem Odoo, endpoint, permissão, validação, estado vazio e teste exigido. O documento é obrigatório para qualquer nova tela.

O frontend já possui edição/arquivamento, agenda/atividades, Helpdesk com Chatter e anexos, auditoria, indicadores, jobs de templates, PWA e ferramentas metodológicas reais. Ainda não se deve declarar a entrega de produção sem executar os cenários autenticados E2E com credenciais fornecidas pelo ambiente (`E2E_LOGIN`/`E2E_PASSWORD`) e sem concluir a conferência visual manual em 400px, tablet, desktop, temas e impressão.

A existência de uma rota ou componente não significa que a funcionalidade esteja completa. Uma tela `Em construção`, uma lista somente de leitura ou um fallback local não atende à Definition of Done. Conteúdo demonstrativo foi removido do documento de projeto: registros ausentes agora resultam em estado de não encontrado.

---

## 12. Regras de desenvolvimento

- Não modificar diretamente o core do Odoo.
- Não modificar diretamente módulos OCA.
- Usar herança e módulos Evoluta.
- Manter regras de segurança no Odoo/backend.
- Não confiar apenas em esconder item de menu.
- Não criar estado local como fonte oficial de dados.
- Não inventar dados para preencher lacunas.
- Não expor IDs internos ao usuário como parte necessária do fluxo.
- Não usar nomes de licitação em telas municipais.
- Não criar uma tela apenas porque existe uma tela equivalente no exemplo.
- Não fazer commit ou push sem aprovação explícita do usuário.

---

## 13. Comandos de validação

Frontend:

```bash
cd frontend
npm run typecheck
npm run test
VITE_ODOO_DB=demo npm run build
npm run test:e2e
npm audit --audit-level=moderate
```

O E2E autenticado exige `E2E_LOGIN` e `E2E_PASSWORD` somente no ambiente de execução; nenhuma credencial deve ser colocada em arquivo versionado. Sem essas variáveis, o teste autenticado é marcado como `skipped` e o relatório não pode ser tratado como aceite completo.

Python:

```bash
python3 -m py_compile addons/evoluta/evoluta_api/controllers/*.py addons/evoluta/evoluta_core/models/*.py addons/evoluta/evoluta_management/models/*.py addons/evoluta/evoluta_management/migrations/19.0.1.0.1/*.py
```

Docker:

```bash
docker-compose ps
docker-compose logs --no-color --tail=200 web
```

Atualização de módulos:

```bash
docker-compose exec -T web odoo server -c /etc/odoo/odoo.conf -d demo -u evoluta_core,evoluta_api,evoluta_management --stop-after-init
docker-compose restart web
```

Não usar `docker compose` neste projeto; o comando padronizado é `docker-compose`.

---

## 14. Documentos relacionados

| Documento | Função |
|---|---|
| `Conversa_Estrategia_GovTech_Evoluta_Odoo_Community_19.md` | Fonte de negócio e estratégia |
| `.claude/skills/Evoluta_frontend/SKILL.md` | Fonte visual, interação, acessibilidade e padrão de entrega |
| `docs/PLANO-FRONTEND-USUARIOS-MUNICIPAIS.md` | Plano detalhado de cobertura do React para usuários municipais |
| `docs/MATRIZ-CAMPOS-FRONTEND.md` | Contrato de cada campo, origem, permissão e evidência de teste |
| `docs/DECISAO-DADOS-LEGADOS.md` | Classificação e quarentena dos dados sem origem/tenant confiável |
| `docs/PLANO-FRONTEND-RETOMADA.md` | Histórico da retomada das integrações |
| `docs/PLANO-FASE1.md` | Escopo técnico da Fase 1 do backend/Odoo |
| `addons/evoluta/` | Implementação dos módulos próprios Evoluta |
| `frontend/src/` | Aplicação React oficial para usuários municipais |
| `docs/DEPLOYMENT-VPS.md` | Preparação e operação de local, staging e produção |
| `deploy/` | Scripts, templates Nginx e operações de deploy/backup |

---

## 15. Decisão final para não se perder

Quando surgir uma nova ideia, classifique-a nesta ordem:

1. **É regra de negócio ou escopo do produto?** Consulte a conversa oficial.
2. **É visual, navegação, acessibilidade ou responsividade?** Consulte a skill.
3. **O Odoo/OCA já oferece?** Reutilize e exponha por API.
4. **É diferencial metodológico da Evoluta?** Desenvolva em módulo Evoluta e conecte ao React.
5. **É do LicitarsAI, Central do Munícipe ou outro exemplo?** Não copie automaticamente.
6. **A tela está real, segura, persistida e testada?** Só então marque como concluída.

A Evoluta não é um ERP genérico, não é um portal do cidadão e não é uma cópia do LicitarsAI. É uma camada de experiência simples, metodológica e segura para gestão interna municipal, usando Odoo como engine e a Mesa de Trabalho Evoluta como interface.

---

## 16. Ambientes e preparação para VPS

O projeto trabalha com três ambientes: local, staging/homologação e produção. O staging pode conter dados de demonstração; a produção deve usar o banco multi-município `evoluta_prod` sem registros demo.

A preparação de VPS, Nginx, secrets, Docker, OCA, backup, restore, healthcheck e rollback está em `docs/DEPLOYMENT-VPS.md`. Os secrets reais ficam fora do Git; os arquivos `.env.*.example` são somente modelos.
