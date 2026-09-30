# Evoluta + AlphaMec — CRM para Prefeituras (Central do Munícipe)

Documento de maturação da ideia — v0.1 (29/09/2026)

## 1. Contexto
- **AlphaMec (EJ - IFSP Araraquara):** gerente de projetos de tecnologias, responsável pelo desenvolvimento.
- **Evoluta (Araraquara):** consultoria para órgãos públicos, já possui carteira de clientes. Responsável por trazer dores e validar.
- **Parceria:** Evoluta identifica dores em clientes públicos, AlphaMec desenvolve sistemas.
- **Ideia inicial do parceiro:** CRM de prateleira, modelo freemium, usando Odoo (open source).

## 2. Problema que queremos resolver
Prefeituras diversas têm dores gerais em comum, não nichadas. Foco em **pessoas = munícipes/cidadãos**.

Dores candidatas (a validar com Evoluta):
- Atendimento ao cidadão disperso (telefone, WhatsApp, balcão, sem histórico)
- Solicitações sem rastreio (tapa-buraco, iluminação, poda, saúde)
- Falta de visão do prefeito: quantas demandas, onde, tempo médio, qual secretaria gargala
- Cadastro de munícipe duplicado e desatualizado
- Ouvidoria e protocolo lentos, sem SLA

Não vender como "CRM". Prefeitura compra "Central do Munícipe / Gestão de Demandas".

## 3. Solução proposta — MVP para feira (20 dias)
**Nome de trabalho:** Central do Munícipe Evoluta

4 blocos, todos reaproveitando Odoo 19 Community:
1. **Portal do Cidadão (Website Odoo):** abrir chamado por categoria + acompanhar status por protocolo
2. **Kanban da Prefeitura (CRM/Helpdesk adaptado):** pipeline `Novo > Em análise > Em execução > Aguardando munícipe > Concluído`, com SLA por secretaria
3. **Cadastro Único do Munícipe (Contacts customizado):** renomear Cliente→Munícipe, Lead→Solicitação. Campos extras: CPF, bairro, secretaria responsável, histórico
4. **Dashboard do Prefeito:** pedidos por bairro/categoria, tempo médio de atendimento, taxa de resolução

Customização prevista: 1 módulo `evoluta_citizen` apenas para tradução de termos, campos extras e identidade visual Evoluta/AlphaMec.

## 4. Por que Odoo 19?
- Community é LGPL (open source), stack Python + Postgres — acessível para time Jr
- Versão travada: **19.0** (estável, não usar 20.0 master para o MVP)
- Módulos prontos: Contacts, CRM, Helpdesk/Project, Website, Discuss, Calendar, Dashboards
- Velocidade: customizar > criar do zero, viável para demo em 20 dias
- Atenção: Odoo Enterprise NÃO é open source (licença por usuário). MVP deve usar só Community para não travar no custo.

## 5. Modelo freemium — análise crítica
Ideia original: CRM de prateleira freemium.

Problemas para B2G (prefeituras):
- Prefeitura não assina SaaS com cartão. Contratação exige licitação, pregão, contrato, dotação orçamentária.
- Freemium exige multi-tenant, hospedagem, backup, suporte e LGPD — custo recorrente que EJ precisa bancar.
- Concorrência no CRM genérico (Pipedrive, RD, HubSpot) é brutal.

Hipótese mais viável:
- **Freemium / trial para validação com empresas privadas ou para a própria Evoluta usar como vitrine**, não para prefeitura contratar direto.
- Para prefeituras: modelo de **licenciamento por implantação + mensalidade de suporte/hospedagem + customização por secretaria**, vendido via parceria/licitação com apoio da Evoluta.
- Validar na feira: objetivo é captar contatos e dores, não fechar venda.

## 6. Plano 20 dias até a feira
- **Dias 1-3:** Subir Odoo 19 Community em Docker, time aprende o básico (criar usuário, pipeline, permissões)
- **Dias 4-12:** Módulo custom mínimo + troca de labels + logo + dados de exemplo
- **Dias 13-17:** Carga fake inspirada em Araraquara (500 munícipes, 100 chamados por bairro) + deploy na VPS da Evoluta + teste offline
- **Dias 18-20:** Roteiro de demo de 5 min para estande (notebook com Docker local, sem depender do wifi da feira)

Infra: Evoluta já possui VPS + host + domínio. AlphaMec precisa dos acessos e specs para planejar deploy.

O que levar na feira:
- Notebook com demo offline + QR para lista de interesse
- Folha de validação: 5 perguntas sobre dores (ver seção 8)
- Pitch: "Em 2 min abrimos um chamado e mostramos no painel do prefeito"

## 7. Riscos e premissas
- [ ] LGPD: CPF e dados de saúde exigem consentimento, trilha de auditoria e controle de acesso por secretaria
- [ ] Odoo é pesado: exige VPS com 4GB+ RAM, updates e backup — definir quem paga e quem opera
- [ ] Time Jr rotativo: documentar setup e customização desde o dia 1
- [ ] Dependência da Evoluta para acesso a secretarias reais para validação
- [ ] Escopo pode estourar: travar MVP nos 4 blocos acima, nada de app mobile ou IA nesta fase

## 8. Próximos passos / perguntas para Evoluta
1. "Foco em pessoas" confirmado como munícipe? Algum caso de gestão de servidor interno entra?
2. Top 3 categorias de chamados mais comuns nos clientes atuais?
3. Quem seria o usuário na prefeitura? Atendente, secretário, prefeito?
4. Existe ouvidoria formal hoje? Qual SLA praticado?
5. Na feira, qual público-alvo: prefeitos, secretários, servidores ou empresas?
6. Quem banca VPS e domínio do MVP? **Resolvido: Evoluta já tem VPS + domínio.** Falta levantar: acesso SSH, SO, RAM/CPU, painel, e qual subdomínio usar (ex: `municipio.evoluta...`).
7. Após feira, quem sustenta suporte nível 1?

## 9. Decisões tomadas
- [29/09] Foco = munícipe/cidadão, não servidor. Código pausado até maturar ideia.
- [29/09] MVP = Central do Munícipe em Odoo 19 Community, mira feira em ~20 dias.
- [29/09] Versão travada em 19.0 (não usar 20.0).
- Pendente: validar categorias, usuários e modelo comercial pós-feira.

---
Responsáveis: AlphaMec (dev) + Evoluta (negócio/validação). Próxima revisão: após retorno da Evoluta sobre seção 8.
