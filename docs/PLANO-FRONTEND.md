# Plano Frontend — Mesa de Trabalho Evoluta + Odoo 19

Skill em `.claude/skills/Evoluta_frontend/` (SKILL.md + assets/ + references/01-13). Cobertura desta doc: regras R-* aplicáveis, aceite rígido por fase, erros front+back, testes automatizados.

## G1 — Base pura
Objetivo: projeto React da skill compilando em `frontend/` (pasta nova, cf. R-MARCA-03).
Exato: copiar `assets/base` (renomear `gitignore.txt`→`.gitignore`, sem LEIA-ME), `assets/styles/index.css`→`src/index.css`, `tailwind.config.ts`, `public/*`, `components/{layout,mesa,auth}`. `npm install && npm run build`.
Fora: qualquer troca de marca/texto.
Aceite:
- [ ] `npm run build` rc=0, JS≈465kB, CSS≈121kB, sem aviso de chunk (R-VER-01).
- [ ] `npm run dev` abre a base em licitação, login demo entra (qualquer 3+ chars).
Teste: build + abrir `/dashboard` nos 2 temas.

## G2 — Marca e menu Evoluta Gestão
Objetivo: parecer nosso sistema (R-MARCA, R-ROT-04, R-MOL-06/14).
Exato: `marca.ts` (nome Evoluta Gestão, objeto **projeto** masc., rotas, ação "Novo plano", 3 destinos celular, prefixo storage próprio); logo `public/logo-gestao.svg` + `MARCA.logo`; `package.json` name, `<title>`, chave de tema do `index.html` (2 ocorrências); `navegacao.ts` (Trabalho: Minha Mesa/Projetos/Prazos; Consulta: Templates/Painéis; Prefeitura: Quem está com o quê; Administração: admin; pé Acessibilidade); remover itens órfãos de licitação.
Fora: trocar textos de domínio fora do menu (G3).
Aceite:
- [ ] Build verde; `grep -rn "/processes" src` só acha `marca.ts` (R-ROT-01).
- [ ] Checklist `references/07` parcial: faixa (logo+divisor+assinatura+busca+tema+avatar), menu w-64/4.25rem, folha única com rolagem, sem rodapé desktop (R-MOL).
- [ ] Rota digitada sem perfil cai em `/unauthorized`, inexistente em 404 (R-ROT-02, R-TEL-19).
Teste: build + navegar menu admin/operador + URLs inválidas.

## G3 — Telas mock (dados em memória)
Objetivo: fluxo clicável sem backend (R-TEL-01/02, R-EST-01, R-TXT).
Exato: Minha Mesa (saudação+resumo), Lista Projetos (gaveta+divisórias), Projeto (pasta com 6 divisórias Evoluta), 5W2H (MesaPagina formulário), Indicadores (livro + barras CSS), resto EmConstrucao. Cada tela com os 4 estados (carregando/erro/vazio/conteúdo), microcopy de `references/10`, carimbos com tintas certas, sem `Badge` p/ situação, sem `Card` como contêiner.
Fora: dados reais, escrita no servidor (vale `CLIENTE_DE_DEMONSTRACAO=true` + aviso, R-AUTH-04).
Aceite:
- [ ] R-VER-05: 2 temas × 400/1024px, `h1` único, foco visível, contraste medido (R-TOK-18), sem rolagem lateral (R-RES-02).
- [ ] Buscas R-DOM-05 zeradas em texto de tela (código pode manter `processo`).
Teste: manual por tela (relato seção E) + `tsc --noEmit`.

## G4 — Ponte API leitura
Objetivo: telas lendo o banco demo (fim do mock de leitura).
Exato: `base_rest` no Odoo (endpoints GET projeto/task/5w2h) ou JSON-RPC + CORS; `services/api/client.ts` real com `CLIENTE_DE_DEMONSTRACAO=false` para leitura; login por sessão Odoo (trocar AuthContext demo, R-AUTH-01); erro de API vira `MesaErroBusca` com "Tentar de novo", nunca tela em branco (R-EST-01/02); token/cookie fora do git.
Fora: escrita (G5).
Aceite:
- [ ] Lista Projetos e Kanban carregam do banco demo; derrubar o Odoo mostra erro com retry (teste: parar container).
- [ ] Nenhum texto de licitação visível; nenhuma credencial no repo.
Teste: vitest no client (mock fetch: 200/500/timeout) + manual com Odoo on/off.

## G5 — Escrita
Objetivo: criar 5W2H e mover Kanban pela Mesa gravando no Odoo.
Exato: POST 5W2H, PATCH stage da task; aviso `AvisosDeResultado` com Desfazer quando reversível (R-TEL-10); erro de escrita = `role=alert` junto ao botão (R-TEL-10); confirmação `ConfirmarAto` para concluir/arquivar (R-TEL-11).
Fora: aprovação Tier pela Mesa (fica no Odoo nesta fase).
Aceite:
- [ ] Criar plano e arrastar card refletem no Odoo (conferir nas duas pontas); falha de rede não perde o digitado.
Teste: vitest fluxos + manual ida-volta.

## G6 — Deploy VPS
Objetivo: URL pública com SSL.
Exato: `frontend/dist` no Nginx `/` + proxy Odoo `/odoo/` (ou subdomínios; registrar decisão); SSL; mesma VPS; sem `VITE_LOGIN_TESTE_*` no build; `package-lock` sem nome antigo.
Fora: multi-tenant.
Aceite:
- [ ] Login real no domínio, 400px sem rolagem lateral, temas ok, sem aviso demo.
Teste: smoke manual + build de prod servido local antes.

## G7 — Relato final
Objetivo: formato seção E da skill (onde, temas, 400px, diferenças vs LicitarsAI, o que ficou simulado, o que não foi conferido). Sem G7 nada se declara pronto (R-VER-04/06).

## Testes automatizados (o que é auto e o que é manual)
- Front auto: `tsc --noEmit` + `vite build` (toda fase) + **vitest novo** p/ `client.ts`, `GEN`, totais da matriz de decisão e `process-status` (a base não traz; criar em G3).
- Back auto (novo): `tests/` TransactionCase por módulo Evoluta (CRUD, required, anti-duplicação de task, trava R!=A, gate de aprovação) rodando via `odoo -u ... --test-tags`.
- Manual (R-VER-05): 2 temas × larguras × perfis; impressão; aparelho real e `.docx` no Word ficam como "não conferido" se sem acesso.
- Erros cobertos: front (R-EST-01/02: busca falha, escrita falha, vazio), back (RPC validation/UserError com mensagem PT-BR, 500 vira retry), auth (demo flag, sessão expirada → login).
