# Relatório de validação do frontend Evoluta

Data: 2026-10-08

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

## Comandos executados com sucesso

```text
cd frontend && npm run typecheck
cd frontend && npm run test
cd frontend && npm run build
python3 -m py_compile addons/evoluta/evoluta_api/controllers/*.py addons/evoluta/evoluta_core/models/*.py addons/evoluta/evoluta_management/models/*.py addons/evoluta/evoluta_management/migrations/19.0.1.0.1/*.py addons/evoluta/evoluta_strategy/models/*.py addons/evoluta/evoluta_templates/models/*.py
git diff --check
docker-compose exec -T web odoo -c /etc/odoo/odoo.conf -d demo -u evoluta_management,evoluta_api --stop-after-init
docker-compose exec -T web odoo -c /etc/odoo/odoo.conf -d demo -u evoluta_api,evoluta_core --stop-after-init
curl -sS -i http://127.0.0.1:8069/api/projetos
docker-compose stop web && docker-compose start web && docker-compose ps
```

Resultado Vitest: 9 testes passando.

Resultado E2E sem credenciais: 3 testes passaram — login inválido, rota protegida sem sessão e entrada em 400px — e o login autenticado foi corretamente marcado como `skipped` por ausência de `E2E_LOGIN`/`E2E_PASSWORD` no ambiente.

## Auditoria de dependências

Os upgrades aplicados foram:

- `vitest` 5.0.3;
- `@types/node` 22.15.21;
- `react-router-dom` 7.18.4;
- `@playwright/test` 1.64.0.

`npm audit --audit-level=moderate` permanece não-zero com 5 vulnerabilidades altas na cadeia de build do `tailwindcss@3.4.19` (`chokidar`/`braces`). A correção automática proposta pelo npm exige `tailwindcss@4.3.3`, uma migração major que não deve ser aplicada sem revisar a configuração CSS e o layout. `npm audit fix --force` não foi executado.

## Evidências de runtime

- `evoluta_db_1` e `evoluta_web_1` ficaram `Up` após stop/start.
- Atualização dos módulos concluiu sem traceback.
- O warning antigo de `evoluta.5w2h.what` não reapareceu após a migração; a ocorrência anterior no log é histórica, anterior à quarentena.
- Sem cookie, `/api/csrf` redireciona a sessão expirada e `/web/session/get_session_info` responde sem sessão; não há sucesso falso autenticado.
- Smoke test sem sessão em `/api/projetos` retornou `303` para `/web/login`, sem dados municipais.
- Login inválido real contra o Odoo não criou sessão e retornou ao formulário sem sucesso falso.
- Rota direta `/projetos` sem sessão foi recusada pelo frontend e redirecionou para `/login`.
- A tela de login em viewport de 400px não apresentou overflow horizontal; o excedente anterior do carimbo foi eliminado.
- `docker-compose ps` confirmou `evoluta_db_1` e `evoluta_web_1` em estado `Up` após a atualização dos módulos.

## Pendências que exigem ambiente/decisão externa

1. Executar `npm run test:e2e` com `E2E_LOGIN` e `E2E_PASSWORD` fornecidos por segredo do ambiente; não colocar credenciais no repositório.
2. Repetir a matriz de autorização completa com quatro contas reais e dois municípios.
3. Conferir manualmente acessibilidade, impressão, temas, 400px/tablet/desktop e instalação PWA em navegador visual.
4. Decidir a migração futura do Tailwind 3 para eliminar as 5 vulnerabilidades altas sem aceitar um upgrade major cego.

Até as quatro pendências acima serem executadas, este relatório não autoriza declarar aceite de produção nem fazer commit/push.
