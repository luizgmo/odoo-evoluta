# Relatório de validação do frontend Evoluta

Data: 2026-10-09

## Alterações de fechamento executadas

- Criada a matriz campo a campo em `docs/MATRIZ-CAMPOS-FRONTEND.md`.
- Removido o documento demonstrativo de `/documents/:id`; projeto inexistente/fora de escopo agora resulta em não encontrado.
- `created_at` e `updated_at` da pasta agora vêm de `project.project.create_date/write_date`; o React não fabrica mais essas datas.
- Removida a persistência local de perfil/tenant; sessão continua somente no cookie HttpOnly do Odoo.
- Admin Municipal não recebe ações de editar/desativar município.
- Criada edição real de tasks e atividades.
- Permissões `manage_tickets` e `assign_tickets` passaram a controlar a UI de edição/atribuição do Helpdesk.
- Cliente HTTP passou a expor `fieldErrors` e invalidar CSRF em sessão/permissão inválida.
- Criado E2E Playwright sem credenciais versionadas.
- Corrigido o logo: o asset visível agora é a imagem Evoluta; assets genéricos/LicitarsAI foram removidos do `public`.
- Plano de migração legado criado em `docs/DECISAO-DADOS-LEGADOS.md`.
- O plano 5W2H legado sem `What`, sem município e sem origem confiável foi colocado em quarentena; `what_nulo = 0` e a coluna está `NOT NULL`.
- O formulário de projeto agora permite ao `super_admin` selecionar o município; contas municipais exibem o município vinculado em modo somente leitura; secretaria, departamento e responsáveis são recarregados conforme o município escolhido.
- Orçamento negativo, infinito ou inválido é recusado no formulário e também no controller Odoo; zero continua permitido.
- Removido o fluxo demonstrativo de recuperação de senha, porque não havia endpoint Odoo real; a aplicação não apresenta mais campos que aceitam informação sem persistência.
- Os testes do cliente HTTP passaram de 6 para 9, cobrindo erro JSON em status 200, sessão expirada, timeout e preservação de fragmento/query.
- A guarda de sessão não fica mais presa indefinidamente na tela de verificação: a restauração inicial tem limite visual de 5 segundos e depende somente do cookie Odoo.
- O carimbo da entrada passa para uma linha própria em viewport estreita; o E2E confirmou ausência de overflow horizontal em 400px.
- O asset `frontend/public/evoluta-logo.png` foi substituído pelo logo Evoluta oficial da skill; o arquivo antigo do Licitars não é mais usado.
- Corrigidas as ACLs do `base.group_system` para permitir ao `super_admin` consultar e administrar os modelos necessários sem `403` indevido.
- Templates e indicadores passaram a bloquear explicitamente o perfil `atendente` com `403`, mantendo a defesa no backend mesmo em acesso direto por URL/API.
- A geração de 5W2H pela matriz tornou-se idempotente: novas tentativas reutilizam o plano associado e não criam duplicatas.
- A agenda passou a declarar os parâmetros de período no controller (`from`/`to`), eliminando o warning de argumentos ignorados pelo Odoo.

## Comandos executados com sucesso

```text
cd frontend && npm run typecheck && npm run test && npm run build
cd frontend && E2E_LOGIN='<segredo-local>' E2E_PASSWORD='<segredo-local>' npm run test:e2e
# O teste visual/PWA foi executado localmente com configuração Playwright temporária não versionada.
python3 -m py_compile addons/evoluta/evoluta_api/controllers/*.py addons/evoluta/evoluta_core/models/*.py addons/evoluta/evoluta_management/models/*.py addons/evoluta/evoluta_management/migrations/19.0.1.0.1/*.py addons/evoluta/evoluta_strategy/models/*.py addons/evoluta/evoluta_templates/models/*.py
git diff --check
docker-compose exec -T web odoo -c /etc/odoo/odoo.conf -d demo -u evoluta_core,evoluta_management,evoluta_strategy,evoluta_templates,evoluta_api --stop-after-init
docker-compose restart web
docker-compose ps
```

Resultados finais:

- TypeScript/typecheck: passou.
- Vitest: 9 testes passando.
- Build Vite: passou.
- E2E Playwright autenticado: 4 testes passando.
- E2E visual/PWA temporário: 4 testes passando — perfis/rotas, 400px/tablet/desktop sem overflow, teclado/foco/tema/impressão e manifest/service worker.
- Matriz autenticada: `SUMMARY checks=118 failures=0`.
- Workflows autenticados: `SUMMARY checks=47 failures=0`.
- Compilação Python e `git diff --check`: passaram.
- Verificação pós-limpeza: `E2E_VERIFY PASS 0`.

## Auditoria de dependências

Os upgrades aplicados foram:

- `vitest` 5.0.3;
- `@types/node` 22.15.21;
- `react-router-dom` 7.18.4;
- `@playwright/test` 1.64.0.

`npm audit --audit-level=moderate` permanece não-zero com 5 vulnerabilidades altas na cadeia de build do `tailwindcss@3.4.19` (`chokidar`/`braces`). A correção automática proposta pelo npm exige `tailwindcss@4.3.3`, uma migração major que não deve ser aplicada sem revisar a configuração CSS e o layout. `npm audit fix --force` não foi executado.

## Evidências de runtime

- `evoluta_db_1` e `evoluta_web_1` permanecem `Up` após atualização/restart.
- Atualização dos módulos concluiu sem traceback; a compilação Python também passou.
- A matriz confirmou autenticação das sete contas E2E, isolamento Município A × Município B, escopo de secretarias/departamentos, projetos/tasks, indicadores, auditoria, templates, Helpdesk, atividades, 5W2H, ferramentas, comentários, anexos e sessão expirada.
- Os workflows confirmaram Kanban, rollback, movimentação permitida de task atribuída ao atendente, conclusão/arquivamento, agenda, árvore de problemas → objetivos, ações idempotentes, Helpdesk, Chatter, anexos e job assíncrono de templates.
- O teste visual confirmou redirecionamento de atendente para `/unauthorized`, ausência de overflow em 400px/768px/1440px, foco visível, tema escuro, impressão via `emulateMedia("print")`, manifest e service worker sem interceptar `/api/` ou `/web/`.
- Sem cookie, `/api/projetos` retorna `303` para `/web/login`; login inválido não cria sessão; rota protegida redireciona para `/login`.
- A limpeza pós-teste removeu somente a massa `E2E-20261009`; a verificação encontrou zero resíduos nos modelos de negócio, auditoria e aliases.
- A equipe Helpdesk existente `1` não foi apagada; os seis usuários E2E foram removidos e o time ficou sem membros E2E. Os times `2` e `3` não foram alterados.
- Após a correção da assinatura da agenda, não surgiram novos warnings de parâmetros `from/to`; os warnings antigos no log são anteriores ao restart.

## Decisão de aceite

**GO COM RESSALVAS para a fase atual de integração do frontend**, condicionado às ressalvas abaixo. Os critérios funcionais e de isolamento cobertos por esta fase passaram; não há bloqueador conhecido nos testes automatizados executados.

Ressalvas não bloqueantes:

1. `npm audit --audit-level=moderate` continua apontando 5 vulnerabilidades altas na cadeia de build do Tailwind 3 (`chokidar`/`braces`). Não foi executado `npm audit fix --force`; a migração para Tailwind 4 deve ser tratada separadamente.
2. O build produz um bundle JavaScript de aproximadamente 612 kB minificado, acima do limite de aviso de 500 kB. Code splitting pode ser planejado como otimização posterior.
3. A impressão foi validada automaticamente com `emulateMedia("print")`; a homologação visual em impressora física continua sendo uma conferência operacional futura.
4. O Helpdesk usa o estágio fechado configurado no Odoo, exibido nos testes como `Rejeitado`; isso foi registrado como comportamento da configuração atual, não como falha técnica.
5. O job de templates depende do cron do Odoo e pode levar aproximadamente 80 segundos em ambiente local; o workflow confirmou estado final `done` e projeto no escopo correto.

A massa E2E, credenciais temporárias e scripts temporários devem permanecer fora do versionamento. Este relatório não autoriza commit ou push por si só; qualquer commit/push depende de autorização explícita.
