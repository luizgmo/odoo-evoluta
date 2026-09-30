# Conversa — Estratégia GovTech Evoluta + Odoo Community

**Data:** 30 de setembro de 2026

---

## 1. Solicitação inicial

**Usuário:**

> Preciso pensar em soluções para iniciar a tração da parte de Govtech da Evoluta queria sugestões de software livre em projetos no git hub que podem ser facilmente implementados na vps da hostinger sem grandes custos a evoluta para uma estaregia freemium de gestão para que entrem em nosso ecossistema

---

## 2. Odoo como alternativa

**Usuário:**

> O odoo seria tambem uma boa alternativa? Ou seria melhor estes após de forma independente

A conversa evoluiu para a análise do Odoo Community como base de uma plataforma freemium da Evoluta, em vez de desenvolver diversos sistemas independentes.

---

## 3. Conceito da plataforma freemium

**Usuário:**

> Pense em como seria uma plataforma freemium baseada no odoo que efetivamente seja simples e gere valor incopore ferramentas básicas de gestão como kanban 5w2h, causa raiz, árvore de decisão, pense nas principais ferramentas da Harvard Kennedy scholl como triângulo de políticas públicas públicas e outras que podem ser desenvolvidas junto com o odoo ou disponíveis como após gratis ou pagos da comunidade mas que possa ser instalado na minha hospedagem, a versão enterprise do odoo posso instalar e alterar o código?

### Direção definida

A ideia passou a ser utilizar o Odoo como **motor tecnológico**, evitando reconstruir funcionalidades que já existem, e adicionar sobre ele uma camada própria da Evoluta com metodologias de gestão pública.

Princípio:

```text
Existe no Odoo?
        ↓
Usar

Existe na OCA?
        ↓
Instalar

Existe parcialmente?
        ↓
Adaptar por herança

Não existe e é diferencial Evoluta?
        ↓
Desenvolver
```

---

## 4. Decisão pelo Odoo Community

**Usuário:**

> Então vamos ficar com o odoo comunity como tirar o máximo das ferramentas já existentes?

### Decisão

A plataforma será baseada em:

- Odoo Community 19
- OCA
- módulos próprios Evoluta
- infraestrutura própria na VPS

O Odoo deve funcionar como **engine**, enquanto a interface apresentada ao usuário será a **Evoluta Gestão**.

A ideia é não apresentar ao gestor público uma experiência de ERP genérico, mas uma plataforma simples de gestão pública.

---

# 5. Arquitetura conceitual definida

```text
EVOLUTA GESTÃO
│
├── ODOO COMMUNITY
│   ├── Projetos
│   ├── Kanban
│   ├── Tarefas
│   ├── Atividades
│   ├── Agenda
│   ├── Usuários
│   ├── Contatos
│   ├── Formulários
│   ├── Portal
│   └── Chatter
│
├── OCA
│   ├── Project
│   ├── Helpdesk
│   ├── Aprovações
│   ├── KPI
│   ├── BI
│   ├── Auditoria
│   ├── Backup
│   ├── Timeline
│   └── Interface
│
├── EVOLUTA
│   ├── Estratégia
│   ├── Gestão
│   ├── Templates
│   └── Core
│
└── INFRAESTRUTURA
    ├── PostgreSQL
    ├── Docker
    ├── Nginx
    ├── SSL
    ├── Backup
    └── Monitoramento
```

---

# 6. Como aproveitar o Odoo

Foi definido que não devemos criar funcionalidades que o Odoo já oferece.

## Project

O módulo Project deve ser o coração operacional.

Usos:

- projetos estratégicos;
- planos de ação;
- projetos de melhoria;
- auditorias;
- implantação;
- planos de governo;
- programas.

O Kanban existente deve ser utilizado, em vez de criar um Kanban próprio.

Etapas sugeridas:

```text
NÃO INICIADO
↓
PLANEJADO
↓
EM EXECUÇÃO
↓
AGUARDANDO TERCEIRO
↓
VALIDAÇÃO
↓
CONCLUÍDO
```

---

# 7. Atividades

As atividades nativas do Odoo podem representar:

- próximos passos;
- ligações;
- reuniões;
- e-mails;
- tarefas;
- acompanhamentos.

Exemplo:

```text
Projeto: Implantação LGPD

Hoje:
- Solicitar inventário à Saúde

Amanhã:
- Reunião com TI

03/10:
- Validar minuta

07/10:
- Apresentar plano ao Secretário
```

A Evoluta não precisa construir inicialmente um sistema próprio de agenda de ações.

---

# 8. Chatter

O Chatter pode funcionar como histórico de:

- comentários;
- anexos;
- atividades;
- notificações;
- alterações;
- acompanhamento.

A ideia é não criar uma ferramenta de comunicação interna separada no MVP.

---

# 9. Formulários

Os formulários do Website podem ser usados como portas de entrada.

Exemplo:

## Solicitação de melhoria

```text
Qual problema você identificou?

Onde ocorre?

Qual impacto?

Possível solução?
```

Ao enviar:

```text
Banco de melhorias
        ↓
Nova demanda
        ↓
Kanban
        ↓
Responsável
```

---

# 10. Helpdesk

A OCA Helpdesk foi identificada como uma boa base para:

# Evoluta Demandas

Fluxo:

```text
NOVA DEMANDA
↓
TRIAGEM
↓
RESPONSÁVEL
↓
EM ATENDIMENTO
↓
AGUARDANDO
↓
CONCLUÍDA
```

Pode ser utilizada por:

- TI;
- RH;
- Jurídico;
- Compras;
- Gabinete;
- Secretarias;
- outros departamentos.

Uma demanda pode virar uma tarefa ou projeto.

---

# 11. Aprovações

A OCA Tier Validation foi identificada como uma das ferramentas mais importantes para gestão pública.

Exemplo:

```text
Plano de ação
↓
Coordenador
↓
Secretário
↓
Controle interno
↓
Gabinete
↓
APROVADO
```

Também pode haver regras por:

- valor;
- secretaria;
- criticidade;
- tipo de projeto;
- risco.

---

# 12. Indicadores e BI

Foi decidido avaliar inicialmente:

- OCA KPI;
- OCA BI SQL Editor;
- MIS Builder.

A ideia é evitar adicionar Metabase no MVP sem necessidade.

Exemplos de indicadores:

```text
Tempo médio de processo
Projetos atrasados
Ações concluídas
Demandas abertas
Demandas vencidas
Taxa de conclusão
```

---

# 13. Auditoria

Para o setor público, auditoria é considerada uma funcionalidade importante.

A OCA Server Tools possui:

- `auditlog`
- `auto_backup`
- `tracking_manager`

Exemplos do que deve ser rastreado:

```text
Usuário alterou prazo
Usuário alterou responsável
Usuário alterou valor
Registro foi excluído
Status foi alterado
```

---

# 14. Interface mobile/PWA

A OCA Web possui ferramentas como:

- `web_responsive`
- `web_pwa_customize`
- `web_notify`
- `web_form_banner`

A intenção é permitir que a plataforma funcione muito bem em celular antes de desenvolver um aplicativo nativo Android/iOS.

---

# 15. Stakeholders

A estrutura de contatos do Odoo pode ser aproveitada.

Um stakeholder poderá possuir:

```text
Nome
Organização
Poder
Interesse
Posição
Influência
Estratégia de relacionamento
```

A Evoluta deve adicionar somente o que faltar.

---

# 16. Funcionários

O módulo de Employees pode ser utilizado para:

- servidores;
- departamentos;
- responsáveis;
- estrutura organizacional.

O objetivo não é construir um RH completo.

---

# 17. E-mail → demanda

Uma possibilidade identificada foi usar aliases de e-mail para transformar mensagens em tarefas/demandas.

Exemplo:

```text
demandas@municipio.evoluta.org.br
```

Um e-mail recebido pode gerar:

```text
DEMANDA #184

Secretaria: Educação
Assunto: Adequação de formulário
Origem: E-mail
```

---

# 18. Ferramentas metodológicas próprias da Evoluta

Foi decidido que o diferencial proprietário deve se concentrar nas ferramentas que representam a metodologia da plataforma.

## 5W2H

```text
What
Why
Where
When
Who
How
How much
```

Ao concluir um 5W2H, deve ser possível gerar uma `project.task`.

---

## 5 Porquês

```text
Problema
↓
Por quê 1?
↓
Por quê 2?
↓
Por quê 3?
↓
Por quê 4?
↓
Por quê 5?
↓
Causa raiz
```

Botão:

**Criar ação**

---

## Ishikawa

Categorias sugeridas:

```text
Pessoas
Processos
Tecnologia
Recursos
Ambiente
Gestão
```

---

## RACI

```text
Responsible
Accountable
Consulted
Informed
```

---

## Árvore de Problemas

```text
EFEITOS
   ↑
PROBLEMA CENTRAL
   ↑
CAUSAS
```

---

## Árvore de Objetivos

Transformar causas e problemas em objetivos e ações.

---

## Triângulo Estratégico

Três dimensões:

```text
Valor Público
Legitimidade/Apoio
Capacidade Operacional
```

---

## Stakeholders

Análise de:

- poder;
- interesse;
- posição;
- influência;
- estratégia de relacionamento.

---

## Matriz de decisão

Ferramenta para comparar alternativas com critérios definidos pelo próprio gestor.

---

## Teoria da Mudança

Planejada para uma fase posterior.

---

# 19. Templates Evoluta

Foi definida a ideia de uma biblioteca de modelos prontos.

Exemplos:

```text
Implantação LGPD
Plano Estratégico Municipal
Redução de despesas
Gestão de contratos
Fiscalização contratual
Melhoria de processos
Plano de carreira
Reestruturação administrativa
Gestão de convênios
```

Um template deve poder gerar:

```text
Projeto
↓
Tarefas
↓
Checklist
↓
Indicadores
↓
Cronograma
↓
Responsáveis
```

Isso transforma conhecimento metodológico em produto.

---

# 20. Matriz tecnológica

| Necessidade | Tecnologia | Decisão |
|---|---|---|
| Usuários | Odoo Base | USAR |
| Organização/Secretaria | HR + Evoluta Core | ADAPTAR |
| Projetos | Odoo Project | USAR |
| Kanban | Odoo Project | USAR |
| Tarefas | Odoo Project | USAR |
| Subtarefas | Odoo Project | USAR |
| Dependências | Odoo Project | USAR |
| Marcos | Odoo Project | USAR |
| Gantt/Timeline | OCA Project Timeline | USAR |
| Agenda | Odoo Calendar | USAR |
| Próximas ações | Activities | USAR |
| Comentários | Chatter | USAR |
| Evidências/anexos | Attachments | USAR |
| Formulários | Website Forms | USAR |
| Diagnósticos | Survey | ADAPTAR |
| Demandas | OCA Helpdesk | USAR |
| SLA | OCA Helpdesk SLA | USAR |
| Aprovações | Tier Validation | USAR |
| Auditoria | Auditlog | USAR |
| Backup | Auto Backup + externo | USAR |
| KPI | OCA KPI | USAR |
| BI | BI SQL Editor/MIS | PILOTAR |
| Excel | report_xlsx | USAR |
| PWA | web_pwa_customize | USAR |
| Responsivo | web_responsive | USAR |
| Assinatura | sign_oca | FASE 2 |
| GED | OCA DMS | AGUARDAR MATURIDADE 19 |
| Jobs assíncronos | queue_job | FASE 2 |
| API | REST/Web API | FASE 2/3 |
| Stakeholders | Contacts + Evoluta | ADAPTAR |
| 5W2H | Evoluta | DESENVOLVER |
| 5 Porquês | Evoluta | DESENVOLVER |
| Ishikawa | Evoluta | DESENVOLVER |
| Triângulo Estratégico | Evoluta | DESENVOLVER |
| Árvore de Problemas | Evoluta | DESENVOLVER |
| Árvore de Objetivos | Evoluta | DESENVOLVER |
| RACI | Evoluta | DESENVOLVER |
| Matriz de Decisão | Evoluta | DESENVOLVER |
| Teoria da Mudança | Evoluta | FASE 2 |
| Biblioteca | Evoluta Templates | DESENVOLVER |
| IA | Evoluta AI | FASE 3 |

---

# 21. Módulos proprietários

## evoluta_core

Responsabilidades:

```text
Município
Secretaria
Departamento
Usuário
Plano contratado
Permissões
Configurações
Onboarding
```

---

## evoluta_strategy

Responsabilidades:

```text
Triângulo Estratégico
Stakeholders
Árvore de Problemas
Árvore de Objetivos
```

---

## evoluta_management

Responsabilidades:

```text
5W2H
5 Porquês
Ishikawa
RACI
Matriz de Decisão
Riscos
```

---

## evoluta_templates

Responsabilidades:

```text
Biblioteca de metodologias
Templates de projetos
Templates de diagnósticos
Templates de planos de ação
```

---

# 22. Princípio arquitetural

Nunca modificar diretamente o core.

Nunca modificar diretamente módulos OCA.

Estrutura:

```text
/odoo
    Odoo Community

/addons/oca
    módulos OCA

/addons/evoluta
    evoluta_core
    evoluta_strategy
    evoluta_management
    evoluta_templates
```

Usar:

```python
_inherit
```

e views herdadas.

---

# 23. Estrutura padrão de módulo

```text
evoluta_5w2h/

├── __init__.py
├── __manifest__.py
│
├── models/
│   ├── __init__.py
│   └── evoluta_5w2h.py
│
├── views/
│   ├── evoluta_5w2h_views.xml
│   └── menus.xml
│
├── security/
│   ├── ir.model.access.csv
│   └── security.xml
│
├── data/
│
├── demo/
│
└── tests/
    ├── __init__.py
    └── test_5w2h.py
```

---

# 24. Git

Branches:

```text
main
develop

feature/evoluta-5w2h
feature/evoluta-risk
feature/evoluta-dashboard
feature/evoluta-stakeholders
```

Exemplo de commit:

```text
feat(5w2h): add action creation from 5W2H
```

Outros:

```text
fix(project): correct action deadline propagation

feat(strategy): add stakeholder matrix

refactor(core): simplify organization permissions

test(5w2h): add validation tests
```

---

# 25. Claude Code / Vibe Coding

O uso de IA deve ser tratado como desenvolvimento assistido, não como substituição da engenharia.

## Prompt ruim

```text
Crie um sistema 5W2H no Odoo.
```

## Prompt adequado

```text
Estamos desenvolvendo Evoluta Gestão sobre Odoo Community 19.

Crie um módulo chamado evoluta_management.

Não altere o core do Odoo.

Não modifique arquivos de módulos OCA.

Use herança do Odoo quando precisar estender project.task.

O módulo deve:

1. criar um modelo 5W2H;
2. relacioná-lo a project.project;
3. permitir relacionamento opcional com project.task;
4. possuir What, Why, Where, When, Who, How e How Much;
5. permitir gerar uma project.task;
6. criar views form, list e kanban;
7. criar segurança por grupos;
8. adicionar ir.model.access.csv;
9. incluir testes automatizados;
10. respeitar padrões do Odoo 19.

Antes de escrever código:
- analise os módulos existentes;
- identifique modelos reutilizáveis;
- explique os arquivos que serão criados;
- somente depois implemente.

Não invente APIs do Odoo.
```

---

# 26. Processo correto com Claude Code

```text
1. Definir requisito
        ↓
2. Claude analisa código existente
        ↓
3. Claude apresenta plano
        ↓
4. Desenvolvedor revisa plano
        ↓
5. Claude implementa
        ↓
6. Testes
        ↓
7. Code review
        ↓
8. Commit
        ↓
9. Deploy em staging
        ↓
10. Teste funcional
        ↓
11. Produção
```

Nunca pedir para a IA alterar dezenas de módulos sem controle.

---

# 27. Checklist de revisão de código gerado por IA

Antes de aceitar:

```text
[ ] Não alterou core
[ ] Não alterou OCA
[ ] Usa _inherit quando apropriado
[ ] Possui segurança
[ ] Possui access rights
[ ] Views possuem IDs claros
[ ] Não há código duplicado
[ ] Não há SQL desnecessário
[ ] Não há dados secretos
[ ] Testes foram criados
[ ] Testes passam
[ ] Logs estão adequados
[ ] Performance foi considerada
[ ] Permissões foram testadas
[ ] Multiempresa/multiorganização foi considerada
```

---

# 28. Infraestrutura

Estrutura sugerida:

```text
/opt/evoluta

├── docker-compose.yml
│
├── addons/
│   ├── oca/
│   └── evoluta/
│
├── config/
│   └── odoo.conf
│
├── backups/
│
└── logs/
```

Serviços:

```text
nginx
   ↓
odoo
   ↓
postgresql
```

Backup:

```text
Odoo/PostgreSQL
        +
Snapshot VPS
        +
Backup externo
```

Aplicar estratégia 3-2-1.

---

# 29. MVP

## Fase 1

Base:

```text
Odoo Community 19
```

OCA:

```text
Project
Helpdesk
Tier Validation
Web Responsive
Auditlog
Auto Backup
Project Timeline
```

Evoluta:

```text
evoluta_core
evoluta_strategy
evoluta_management
```

Entrega:

```text
Desafio
↓
Diagnóstico
↓
Plano
↓
Projeto
↓
Kanban
↓
Indicadores
↓
Resultado
```

---

# 30. Fase 2

Adicionar:

```text
Templates
Portal
BI
Dashboards
Workflows avançados
Assinatura
Processos assíncronos
```

---

# 31. Fase 3

Adicionar:

```text
IA Evoluta
Integrações
API pública
Automação
Análise preditiva
```

A IA poderá auxiliar, por exemplo:

```text
Problema informado
        ↓
Diagnóstico inicial
        ↓
5 Porquês sugeridos
        ↓
Stakeholders sugeridos
        ↓
5W2H sugerido
        ↓
Plano de ação
```

Sempre com validação humana.

---

# 32. Freemium

A plataforma pode ter uma arquitetura comercial como:

## Plano gratuito

```text
1 organização
X usuários
Projetos
Kanban
Tarefas
5W2H
Diagnósticos básicos
Indicadores básicos
Templates básicos
```

## Plano Pro

```text
mais usuários
mais projetos
dashboards
aprovações
indicadores avançados
templates premium
automação
```

## Plano Município/Enterprise

```text
multi-secretaria
SSO
integrações
API
suporte
implantação
customizações
IA
consultoria
```

O objetivo é que o usuário gratuito entre no ecossistema e tenha um caminho natural para funcionalidades adicionais.

---

# 33. Estratégia de diferenciação

O código do Odoo não será o principal ativo.

O diferencial será:

```text
Método
+
Templates
+
Dados
+
Experiência
+
Conhecimento
+
Integrações
+
IA
```

A Evoluta transforma ferramentas genéricas em um método estruturado de gestão pública.

---

# 34. Regras definitivas do projeto

## Fazer

- reutilizar Odoo;
- reutilizar OCA;
- criar módulos pequenos;
- usar herança;
- escrever testes;
- documentar;
- utilizar Git;
- utilizar Claude Code como assistente;
- manter staging;
- manter backups;
- manter auditabilidade.

## Não fazer

- modificar core;
- copiar funcionalidades existentes;
- criar ERP do zero;
- criar aplicativo mobile no primeiro momento;
- adicionar dezenas de dependências sem necessidade;
- usar módulos OCA experimentais como base de recursos críticos;
- aceitar código de IA sem revisão.

---

# 35. Links de referência

## Odoo

https://github.com/odoo/odoo

https://www.odoo.com/documentation/19.0/

## OCA

https://github.com/OCA

### Project
https://github.com/OCA/project

### Server Tools
https://github.com/OCA/server-tools

### Reporting Engine
https://github.com/OCA/reporting-engine

### Web
https://github.com/OCA/web

### Helpdesk
https://github.com/OCA/helpdesk

### Tier Validation
https://github.com/OCA/tier-validation

### MIS Builder
https://github.com/OCA/mis-builder

### Queue
https://github.com/OCA/queue

### DMS
https://github.com/OCA/dms

### Sign
https://github.com/OCA/sign

### l10n-brazil
https://github.com/OCA/l10n-brazil

---

# 36. Conclusão

A estratégia definida é:

```text
                 EVOLUTA

                    ↓

        Odoo Community 19
              como engine

                    +

               OCA

                    +

        Metodologia Evoluta

                    ↓

           EVOLUTA GESTÃO
```

O objetivo não é competir com o Odoo.

O objetivo é **usar o Odoo como infraestrutura e construir sobre ele uma experiência especializada em gestão pública**.

A maior parte da infraestrutura pesada já existe.

A Evoluta deve concentrar desenvolvimento em:

- método;
- experiência;
- templates;
- governança;
- indicadores;
- integrações;
- conhecimento;
- IA.

Assim, o time pode gastar muito mais tempo construindo valor de produto e muito menos tempo reconstruindo autenticação, Kanban, workflow, agenda, comentários, permissões, auditoria, relatórios e infraestrutura.

---

## Documento relacionado

Também foi produzido anteriormente:

`Relatorio_Estrategia_GovTech_Evoluta_Odoo_Community_19.docx`

