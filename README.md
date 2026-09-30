# Evoluta + AlphaMec — Evoluta Gestão (Odoo 19)

Documento de maturação — v0.2 (30/09/2026)

> **Fonte oficial:** `Conversa_Estrategia_GovTech_Evoluta_Odoo_Community_19.md` e `docs/ESTRATEGIA-EVOLUTA-RESUMO.md`.
> As seções 2-3 abaixo eram suposições iniciais da AlphaMec (Central do Munícipe) e foram **substituídas pela estratégia oficial da Evoluta**. Mantidas apenas como histórico.

## 1. Contexto
- **AlphaMec (EJ - IFSP Araraquara):** gerente de projetos de tecnologias, responsável pelo desenvolvimento.
- **Evoluta (Araraquara):** consultoria para órgãos públicos, já possui carteira de clientes. Responsável por trazer dores e validar.
- **Parceria:** Evoluta identifica dores em clientes públicos, AlphaMec desenvolve sistemas.
- **Ideia inicial do parceiro:** CRM de prateleira, modelo freemium, usando Odoo (open source).

## 2. Problema (atualizado pela Evoluta)
Foco oficial: **gestão interna da prefeitura** (projetos estratégicos, demandas entre secretarias, aprovações, indicadores), não portal do cidadão.

[Histórico AlphaMec — suposição inicial desconsiderada: atendimento ao cidadão, tapa-buraco, ouvidoria, cadastro de munícipe. Ver doc oficial se precisar retomar no futuro.]

## 3. Solução oficial — Evoluta Gestão (MVP feira)
Ver `docs/ESTRATEGIA-EVOLUTA-RESUMO.md` para detalhe.

Fluxo demo: `Desafio > Diagnóstico (5 Porquês) > Plano (5W2H) > Projeto/Kanban > Indicadores`
Módulos: `evoluta_core, evoluta_strategy, evoluta_management` + Odoo Project + OCA Helpdesk/Tier Validation/Auditlog/KPI.

[Histórico AlphaMec — 4 blocos Central do Munícipe abaixo desconsiderados:
1. Portal do Cidadão
2. Kanban Prefeitura CRM
3. Cadastro Munícipe
4. Dashboard Prefeito]

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
- [29/09] Suposição inicial AlphaMec: Central do Munícipe — DESCONSIDERADA em 30/09.
- [30/09] Vale o documento oficial da Evoluta. MVP = Evoluta Gestão em Odoo 19 Community, mira feira em ~20 dias.
- [29/09] Versão travada em 19.0 (não usar 20.0).
- Pendente: travar lista OCA realmente compatível com 19.0 e recortar MVP da feira (só fluxo Desafio>5 Porquês>5W2H>Kanban).

---
Responsáveis: AlphaMec (dev) + Evoluta (negócio/validação). Próxima revisão: após retorno da Evoluta sobre seção 8.
