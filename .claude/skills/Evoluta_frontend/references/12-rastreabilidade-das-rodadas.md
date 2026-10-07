# 12 — Rastreabilidade das rodadas de revisão (rodada → achado → regra → status)

A skill passou por **12 rodadas** de revisão com agentes "frescos" (que só tinham a skill): em cada
rodada, (a) um **construtor** montava um sistema fictício só pela skill, (b) um **auditor** conferia
texto × código e compilava a base e (c) um **revisor visual** conferia no navegador. Os defeitos
foram corrigidos no código (`assets/`) e/ou na documentação; o que não valia a pena corrigir ficou
como limite conhecido. Este arquivo liga cada achado à **regra numerada** do `SKILL.md` que o previne.

Legenda de **status**: **código** = corrigido em `assets/`; **doc** = corrigido/explicado na documentação;
**limite** = ficou registrado como limite conhecido (SKILL.md, seção F, ou R-DOM-08); **não recuperado** =
o relatório original não pôde ser lido (agentes encerrados antes de entregar); **abandonado** = decisão do
usuário de encerrar a revisão.

## 1. Achados por rodada

### Rodada 0 — construção da skill (antes das rodadas numeradas)

| Achado | Regra | Status |
|---|---|---|
| Kit-base não era autossuficiente: faltavam `ferramentas.ts`, projeto Vite, `ui/` do shadcn; `AppHeaderV3` e `MolduraDeEntrada` com "LicitarsAI" fixo | R-MARCA-01, R-MOL-02, R-ENT-01 | código (`assets/base`, `MARCA`) |
| Receitas de telas e microcopy não existiam; `exemplos/` com 40 telas legado | R-TEL-01, R-TXT-05 | doc (`09`, `10`, `exemplos`) |
| Peças só em `exemplos/` (`tokens.ts`, `DeleteConfirmDialog`, `historico.ts`) e `utils/ferramentasMesa` ausente | R-TEL-09, R-EST-04 | código (`ferramentasMesa.ts`, `PecasDosAutos.tsx`) |
| Telas lidas só em parte (`Reports`, `Compliance`, `Calendar`, `Notifications`) | — | limite |

### Rodada 1 (auditor, construtor "Evoluta Contratos", visual)

| Achado | Regra | Status |
|---|---|---|
| "40 telas" nos exemplos era contagem errada (43 arquivos, 22 páginas) | R-VER-06 (contagens conferidas) | doc |
| "Livro da gestão" ainda aparecia na tabela de vazios do `10` (nome rejeitado) | R-USR-05 | doc |
| Dependências extras (`recharts`, `date-fns`, `react-query`) não listadas no `08` | R-TEL-09, R-VER-01 | doc |
| Cores cruas em `AvisosDeResultado` (`emerald-300`, `red-200`), `process-status.ts` (`green-*`, `slate-*`), `ResetPassword` (`emerald-*`) | R-TOK-01 | código |
| `DeleteConfirmDialog` do exemplo com `bg-red-600` | R-TEL-11 | código/doc |
| `AvisosDeResultado` apagava o aviso ao `avisar()` + `navigate()` | R-TEL-10 | código (janela 1,5 s) |
| SKILL.md não mandava renomear `gitignore.txt` nem tirar o `LEIA-ME.md` da cópia | B1, R-MARCA-02 | doc |
| Contradição sobre `MesaPagina` × `PastaDoProcesso` (uso para "item aberto") | R-TEL-01 | doc (tabela única de cascas) |
| Acoplamento da base a licitação sem guia de adaptação | R-DOM-01…08 | doc (seção "Trocar de domínio") |
| Gaveta do celular sem `SheetTitle`/`SheetDescription` (erro do Radix) | R-MOL-09 | código |
| `nav` das divisórias com barra vertical espúria | R-TEL-05 | código |
| Cabeçalho de tabela fora da spec (Jakarta 14px) | R-TOK-07, R-TEL-07 | código (`ui/table.tsx`) |
| "Nova" da barra do celular sempre dourada | R-MOL-10 | código |

### Rodada 2

| Achado | Regra | Status |
|---|---|---|
| Duas semânticas de tinta incompatíveis (situação × ato) | R-TEL-04 | doc (tabela única no `05`) |
| `AvisosDeResultado` mudou sem registro; `06` ainda listava as exceções antigas | R-TEL-10 | doc (`06`, `09`, `11`) |
| Sheet "w-64" no `02` (real `w-72`); `.mesa-faixa` chamada "azul-noite"; "Mesa" fixo nas trilhas | R-MOL-09, R-TOK-12, R-MARCA-01 | doc |
| Receita da Minha Mesa divergia do código (saudação, data, `first-letter`) | R-TEL-16 | doc |
| Lógica de licitação misturada ao "núcleo genérico" sem lista do que trocar | R-DOM-01…07 | doc |
| Divisórias da pasta apontavam para rotas inexistentes (404) | R-ROT-01, R-SIT-04 | código (`/:id/*`, `Item.tsx`) |
| `ProcessoNaMesa.acoes` só aceitava nó fixo | R-TEL-05 | código (elemento ou função) |
| `Lista.tsx` da base era `Table`, não gaveta; `Inicio.tsx` usava `FolhaDaTela` contra a receita | R-TEL-06, R-TEL-16 | código |
| `Paineis`, `Minha Mesa` dos exemplos não compilam (módulos inexistentes) | R-TEL-09 | código (versão enxuta na base) |
| Tabela `min-w-[40rem]` estourava 7px a 1024px | R-TEL-07 | código (`36rem`) |
| Clipe de papel cobria o título da capa a 400px | R-TEL-05 | código (`padding-top 2.25rem`) |
| `master` sem menu/barra: faltava dizer no LEIA-ME; Agenda do mês padrão vazia | R-MOL-11 | doc / código (dados a partir de hoje) |
| Gotcha: classes de `@layer components` purgadas em produção | R-TOK-14 | código (`safelist`) |
| Reticências "..." em vez de "…" | R-TXT-01 | código |

### Rodada 3

| Achado | Regra | Status |
|---|---|---|
| Divergências do original não listadas no `11` (janela do aviso, gaveta, `BarraDoCelular`, props de `PastaNaGaveta`…) | R-VER-06 (cobertura do `11`) | doc |
| `08` mandava editar `AppSidebarV3`/`BarraDoCelular` (já leem `MARCA`) | R-MARCA-01 | doc |
| **Minha Mesa estourava a 400px** (grade sem coluna base) | R-TEL-14, R-RES-02 | código (`grid-cols-1`) |
| Critério "sem rolagem horizontal" não dizia onde medir (`main`, não `documentElement`) | R-RES-02 | doc |
| Números grandes sem `lining-nums` | R-TOK-06 | código/doc |
| Falta de passo "trocar de domínio" (textos "Histórico do processo", "proposta 7", nomes herdados) | R-DOM-01…07 | doc + código (comentários neutralizados) |
| Impressão só limpa onde há `.area-impressao` | R-IMP-01 | doc (opt-in) |
| `title` ausente em títulos com `truncate` | R-ACE-09 | código |
| Separador da trilha com contraste baixo | R-TEL-01/05 (Trilha) | código (`text-muted-foreground`) |
| Safelist por regex gerava avisos | R-TOK-14 | código (nomes explícitos) |
| `variant="cta"` inexistente (compilava e não fazia nada) | R-TOK-09 | código (`ui/button.tsx`) |
| Contraste: accent a 50% (texto branco < 4,5:1) | R-TOK-03 | código (`210 42% 46%`) |
| Foco da `Trilha` e do "Pular para o conteúdo" | R-ACE-02/03 | código |
| `utils/datas.ts` misturado em `prazosLicitacao`; `HIPOTESES_PRAZO` | R-DOM-04 | código |
| `MARCA.objeto.rotuloDaCapa/semDescricao/semNumero/semAgrupamento` | R-MARCA-01, R-EST-03 | código |
| Página `Documento.tsx` e rota `/documents/:id` ausentes | R-DOC-03 | código |

### Rodada 4

| Achado | Regra | Status |
|---|---|---|
| Separador da `Trilha` (`text-border` → `muted-foreground`) fora do `11` | R-VER-06 | doc |
| Hover do `--cta` com `/0.9` (4,24:1) | R-TOK-09 | código (`brightness-90`) |
| Divergências de classe sem registro (`grid-cols-1`, `title`, `aria-hidden`) | R-VER-06 | doc |
| `--color-accent-light` e `tokens.ts` no acento antigo (50%) | R-TOK-03 | código |
| Resíduos de rascunho ("proposta 7") em CSS e `FolhaDaTela` | R-DOM-06 | código |
| `useMesaDados`/`Mesa.tsx`: texto de domínio sem "EXEMPLO DE DOMÍNIO" | R-DOM-07 | código |
| Faltava método de medir contraste | R-TOK-18 | doc (`01`) |
| **Vazamento de domínio sobrevivia à busca**: `LeiAoLado` ("Lei nº 14.133 · aberta ao lado", "Todos na Biblioteca"), `index.css`, `datas.ts`, `markdown.ts` (Bedrock) | R-DOM-04/05, R-MARCA-05 | código (`leiAoLado`) + doc (busca ampla) |
| "Esvaziar `ARTIGOS`" deixava "Na lei" na busca | R-MOL-13, R-MARCA-05 | código |
| `HIPOTESES_PRAZO` com importadores errados; falso positivo "solicitação" | R-DOM-05 | doc |
| Rotas órfãs (`/library`, `/planta`, `/livro-gestao`) sem guia de remoção | R-ROT-04 | doc |
| Chave de tema `"theme"` colidia entre sistemas | R-PREF-04, R-MARCA-04 | código (`chaveDoSistema`) |
| **Menu escondia o item, mas `/metrics` e `/templates` abriam por URL** | R-ROT-02 | código (`RequerPerfil`) |
| Agenda a 1024px com A++ (rolagem de 3px) | R-TEL-13 | código/doc |
| Link do `ResumoDoDia` sem anel de foco | R-ACE-02 | código |
| 404 alinhado ao topo, `/unauthorized` centralizado | R-TEL-19 | doc |
| Impressão da pasta sem título/número (capa `.nao-imprimir`) | R-IMP-02, R-TEL-05 | código |
| Agente do construtor sobrescreveu pasta existente | R-MARCA-03 | doc (pasta nova e vazia) |

### Rodada 5

| Achado | Regra | Status |
|---|---|---|
| `.mesa-faixa` descrita como "azul-noite" em 02, 05, 07, 09 | R-TOK-12 | doc |
| LEIA-ME da base dizia aviso de chunk/540 kB; real ≈ 463 kB sem aviso | R-VER-01 | doc |
| Bolinha "feita" 2,54:1 no escuro | R-TEL-05 | código (`dark:text-background`) |
| Contrastes/linhas/caminhos imprecisos (5,08:1; 1483 linhas; `exemplos/pages/SimuladorPrazos.tsx`) | R-VER-06 | doc |
| Textos de domínio sem marca (`CalendarioDeMesa`, `Agenda`, `useMesaDados`, `marca.ts`) | R-DOM-07 | código |
| Divergências não listadas no `11` (Trilha, capa na impressão, chaves `menu-lateral`/`carimbos-batidos`, `ConfirmarAto`) | R-VER-06 | doc |
| Selo Master simplificado no `02` | R-MOL-11 | doc |
| Relatórios do construtor "ClínicaOn" e do revisor visual | — | **não recuperado** (agentes encerrados por reinício do PC) |

### Rodada 6

| Achado | Regra | Status |
|---|---|---|
| Hambúrguer abria gaveta para o `master` no celular | R-MOL-11 | código (R7) |
| Seletor de impressão escondia o `<header>` da capa | R-IMP-02 | código (`[data-moldura-faixa]`) |
| `Documento` sem `.area-impressao`; `.docx` gravava texto puro com extensão .docx (Word recusava) | R-IMP-01, R-DOC-01 | código (gerador real) |
| Gênero fixo (`MARCA.objeto` sem `genero`) | R-GEN-01 | código (`GEN`) |
| `BaixarDocumento` sem `blocos`; `CalendarioDeMesa` sem props; `ProcessoNaMesa` compacta sempre | R-DOC-02, R-TEL-13, R-TEL-05 | código |
| Microcopy ("Não informado") contra o `10 §3` | R-EST-03 | código |
| `SKILL.md` mandava apagar `fasesDaLicitacao`/`FasesEmBolinhas` (quebra `tsc`) | R-SIT-02 | doc |
| `BuscaRapida` sem `title`; comentários obsoletos | R-MOL-13 | código |
| Hook do projeto barrou `rm`; tamanho do build dito 465 kB × 532–540 kB com `TextoDoDocumento` | R-HOOK-02, R-VER-01 | doc |

### Rodada 7

| Achado | Regra | Status |
|---|---|---|
| Master com hambúrguer no celular | R-MOL-11 | código |
| Textos de domínio visíveis (Lista, Inicio, Item, Formulário, `preferencias.ts`) sem marca | R-DOM-07 | código (`MARCA.campos`) + doc |
| Rota inicial/criação fixas em `App.tsx`/`navegacao.ts` | R-ROT-01 | código |
| `fasesDaLicitacao` presa a 7 etapas | R-SIT-02 | doc (R7) / código (R10) |
| Receita 09 dizia Documento "Em construção" (código mostrava demonstração) | R-DOC-03 | doc |
| Tela de senha "mente" ao usuário | R-AUTH-04 | doc (R7) / código (R11) |
| `aria-label="Maior"` com texto visível "A+" | R-ACE-01 | doc/código (R10) |
| Contagem de arquivos de exemplos, linhas do `index.css`, caminhos | R-VER-06 | doc |

### Rodada 8

| Achado | Regra | Status |
|---|---|---|
| `/agenda` a 1024px com "Bem maior" esmagava "Esta semana" | R-TEL-13 | código |
| Selo "PAINEL MASTER" quebrava em duas linhas a 1024px | R-MOL-11 | código (`whitespace-nowrap`) |
| "no matrícula"; "cadastrados" fixo (gênero) | R-GEN-01/02 | código (`GEN.no`, `GEN.fim`) |
| `preferencias.ts` mostrava "lei ao lado" com a lei desligada | R-MARCA-05, R-TXT-05 | código |
| Texto da Lei 14.133 no bundle da base | R-DOM-04 | código (`artigos.ts` neutro; resumo em `exemplos/`) |
| Rótulos fixos de domínio (fase, "Objeto", "Documentos principais", marcos da agenda) | R-DOM-03 | código (`MARCA.campos`) |
| `licitars-logo.png` × `logo-produto-modelo.svg`: instruções contraditórias | R-MOL-16 | doc |
| LEIA-ME da base sem `genero`, `campos`, `leiAoLado` | R-MARCA-01 | doc |
| Texto de desenvolvedor visível ("Troque este bloco…") | R-TEL-18 | código |
| "Voltar à/Ir para a {inicio}" exigia nome feminino | R-GEN-03 | código |

### Rodada 9

| Achado | Regra | Status |
|---|---|---|
| Rotas inicial/criação não se trocavam só por `MARCA` | R-ROT-01 | código |
| Agenda a 768–810px com "Bem maior": botão `.ics` estourava a folha | R-TEL-13 | código |
| "Baixar a ficha" saía sem conteúdo | R-DOC-02 | código (`blocosDoItem`) |
| Dica do login com `gestor` exigia editar componente; "Termos de Uso" sem link | R-AUTH-02, R-ENT-04 | código |
| `ThemeContext` sem `try/catch` no `localStorage` | R-ACE-08 | código |
| `AvisoDeEstado` sempre `<h1>` (dois `h1` dentro de `FolhaDaTela`) | R-ACE-04 | código (`nivel`) |
| `BuscaRapida`/`listaDeProcessos`/`LeiAoLado` com texto fixo | R-GEN-03, R-DOM-07 | código |
| Atalho M/P/A colidia com os fixos; `BarraDoCelular` ignorava a ordem | R-MOL-10/12 | código |
| `tokens.ts` com ouro escuro diferente do CSS | R-TOK-08 | código |
| Formulário não gravava nada (demo "morta") | R-TEL-12 | código (armazém em memória) |
| Regra do hook contraditória (script `.sh`) | R-HOOK-02 | doc |
| "Zerar todas as buscas" impossível | R-DOM-06 | doc (critério = texto de tela) |
| Nomes de arquivos de divisórias errados no SKILL; `simularPrazo` inexistente | R-SIT-04 | doc |

### Rodada 10

| Achado | Regra | Status |
|---|---|---|
| Fases presas a 7 etapas (3 fases dava "Fase 7 de 3") | R-SIT-02 | código (`ate()`) |
| Sombra da `.folha` usava `--mesa-noite` (sumia) | R-TOK-11 | código |
| `dompurify` com aviso de segurança | R-VER-02 | código (3.4.16) |
| Item selecionado da busca ~1,2:1 | R-MOL-13, R-ACE-05 | código |
| Borda de campo/interruptor ~1,3–1,5:1 (WCAG 1.4.11) | R-TOK-04 | código (`--input`) |
| Abas da Lista cortadas a 400px | R-TEL-06 | código |
| Eventos da agenda com "art. 164", "Prazo legal" na base | R-SIT-03 | código (padrões neutros; exemplo em `exemplos/`) |
| Login a 400px com texto grande rolava 4px | R-ENT-03 | código |
| Impressão a partir do tema escuro (accent a ~2,8:1) | R-IMP-04 | código |
| `Documento` com botão ativo e conteúdo vazio; item novo "Pregão Eletrônico" | R-DOC-03, R-TEL-12 | código |
| Textos de domínio em `Paineis`, `Inicio`, `useMesaDados`, `listaDeProcessos` | R-DOM-07 | código |
| Links da Minha Mesa sem anel de foco | R-ACE-02 | código |
| `/processes`, "Alt P" e "Fases" fixos | R-ROT-01, R-MARCA-01 | código (`ROTA_DA_LISTA`, `atalhoDaLista`) |
| `BaixarDocumento`: `nome` = título = arquivo | R-DOC-02 | código (`titulo`) |
| Ícones decorativos sem `aria-hidden`; `id` fixo; `h3` sob `h1` | R-ACE-01/04 | código |
| `exemplos/` com `localStorage` sem `try/catch` | R-ACE-08 | limite (cabeçalho LEGADO) |

### Rodada 11

| Achado | Regra | Status |
|---|---|---|
| Item novo com carimbo "AUTUADO 01 AGO 2026" fixo | R-TEL-12 | código |
| Tinta de situação nova exigia editar componente; listas ativa/encerrada duplicadas em 4 arquivos | R-SIT-01 | código (tabela única) |
| `Documento`: "Troque este bloco…" no `.docx`; título do arquivo ≠ tela; sem documento por item | R-DOC-03, R-TEL-18 | código |
| Tela de senha fingia enviar e-mail | R-AUTH-04 | código (`CLIENTE_DE_DEMONSTRACAO`) |
| Texto masculino fixo nas fases; perfil cru ("admin") na faixa | R-GEN-02, R-MOL-03 | código (`NOME_DO_PERFIL`) |
| Impressão: margem escura a partir do tema escuro | R-IMP-04 | código |
| Barras de rolagem nativas (setas ▲▼) destoando | R-PREF-05 | código |
| Placeholder da lista cortado a 400px; `Acessibilidade` desalinhada | R-RES-05 | código |
| "Zerar buscas" definido como texto de tela; `\blicita`; arquivos de config fora da busca | R-DOM-05/06 | doc |
| Sombra "quase invisível" | R-TOK-11 | doc (sutil por desenho) |
| Regra de 12px × 10–11px existentes | R-ACE-06 | doc |
| `npm audit`: risco do `react-router` | R-VER-02 | doc |

### Rodada 12

| Achado | Regra | Status |
|---|---|---|
| Trocar uma linha da tabela de situações quebrava o build (`PROCESS_STATUS.ABERTO`) | R-SIT-01 | código (`padrao`, `apelidos`) |
| Cabeçalho de `fasesDaLicitacao.ts` contraditório (importar/apagar) | R-SIT-02 | código |
| Capa da pasta a 768–1024px: número em 3 linhas; título vira "uma letra por linha" | R-TEL-05 | código |
| Faixa do alto com "Bem maior" expulsava avatar/nome do perfil; anel de foco inconsistente | R-MOL-03/04 | código |
| Impressão das listas a partir do tema escuro saía escura (texto navy 1,03:1) | R-IMP-04 | código |
| "Modalidade" vazia na capa de item novo (`??` com string vazia) | R-TEL-05 | código (`||`) |
| Botões "A+"/"A++" com borda 1,5:1 | R-TOK-04, R-ACE-05 | código (`border-input`) |
| Plural automático "em liquidaçãos" | R-GEN-02 | código |
| Setas das barras de rolagem no Chrome/Windows | R-PREF-05 | código |
| Valor monetário "R$" fixo em 11 arquivos; rótulos da ficha fora do `MARCA`; regras dos marcos da agenda; `Formulario` só objeto e valor; datas só-dia em UTC | R-DOM-08, R-SIT-03 | **limite** |
| 17 detalhes de redação (blocos de código com texto masculino, código órfão, receita da Agenda × base, `blocosParaMarkdown` sem escape, imports sem arquivo nos exemplos…) | F (limites) | **limite** (decisão do usuário: simplificar e encerrar) |
| Regra "3 rodadas consecutivas sem nenhum achado" | — | **abandonado** (usuário: "simplifique a tarefa para concluir") |

### Revisões anteriores do próprio LicitarsAI (antes da skill) que viraram regra

Rodadas de revisão do diff do repositório (outubro) apontaram: nome acessível do botão de baixar sem o texto visível (R-ACE-01); contraste de cartão no escuro (R-ACE-05); login pré-preenchido por variável de ambiente (R-AUTH-01: só em desenvolvimento); selo "Falta a data de abertura" para contratação direta (R-DOM-02/R-SIT-02, `ehContratacaoDireta`); código morto de telas removidas. Status: corrigidos no repositório; a skill herdou a regra.

## 2. Cobertura de `references/11` (112 divergências) por regras

Cada linha da seção 1 do `11` (numeradas na ordem em que aparecem) é coberta por pelo menos uma regra. **112 / 112.**

| `11` nº | Regra | `11` nº | Regra | `11` nº | Regra |
|---|---|---|---|---|---|
| 1 | R-MOL-16, R-MARCA-01 | 39 | R-DOM-04 | 77 | R-TOK-01 |
| 2 | R-TEL-10 | 40 | R-TEL-19 | 78 | R-IMP-02, R-TEL-05 |
| 3 | R-TOK-01 | 41 | R-TEL-14 | 79 | R-TEL-05, R-ACE-05 |
| 4 | R-TEL-11 | 42 | R-MOL-13, R-ACE-01 | 80 | R-MARCA-04 |
| 5 | R-TOK-15 | 43 | R-MOL-12 | 81 | R-TEL-11 |
| 6 | R-TEL-07 | 44 | R-TEL-03 | 82 | R-EST-04 |
| 7 | R-TXT-01 | 45 | R-TOK-13 | 83 | R-ACE-04, R-TEL-18 |
| 8 | R-SIT-01 | 46 | R-PREF-02 | 84 | R-ACE-08 |
| 9 | R-USR-04, R-TEL-12 | 47 | R-RES-05 | 85 | R-MOL-12 |
| 10 | R-AUTH-01/02 | 48 | R-TOK-15 | 86 | R-TEL-12, R-DOC-02 |
| 11 | R-MOL-11 | 49 | R-DOC-01 | 87 | R-GEN-03, R-DOM-07 |
| 12 | R-EST-01 | 50 | R-IMP-02 | 88 | R-TOK-08 |
| 13 | R-TEL-05 | 51 | R-IMP-01, R-TEL-01 | 89 | R-ACE-07 |
| 14 | R-ROT-01, R-SIT-04 | 52 | R-DOC-01/02 | 90 | R-MOL-03 |
| 15 | R-TEL-06, R-TEL-09 | 53 | R-GEN-01 | 91 | R-TEL-06 |
| 16 | R-TEL-05 | 54 | R-TEL-05 | 92 | R-TOK-04 |
| 17 | R-TOK-14 | 55 | R-TEL-13 | 93 | R-TOK-11 |
| 18 | R-TEL-10 | 56 | R-TOK-03 | 94 | R-ACE-02 |
| 19 | R-TEL-05 | 57 | R-TEL-14 | 95 | R-IMP-04 |
| 20 | R-MOL-09 | 58 | R-TOK-06 | 96 | R-MOL-13 |
| 21 | R-MOL-10 | 59 | R-DOM-06/07 | 97 | R-ROT-01 |
| 22 | R-ROT-01 | 60 | R-TOK-03 | 98 | R-ACE-01 |
| 23 | R-ROT-03 | 61 | R-ACE-02 | 99 | R-ACE-01 |
| 24 | R-TEL-05 | 62 | R-MOL-01, R-ACE-03 | 100 | R-ACE-04 |
| 25 | R-TEL-18 | 63 | R-TEL-13 | 101 | R-ACE-04, R-TEL-06 |
| 26 | R-DOC-02 | 64 | R-DOM-04 | 102 | R-ENT-03 |
| 27 | R-SIT-02 | 65 | R-MARCA-01 | 103 | R-DOC-02 |
| 28 | R-EST-02 | 66 | R-MARCA-01, R-ENT-04 | 104 | R-VER-02 |
| 29 | R-MOL-13 | 67 | R-DOM-03 | 105 | R-PREF-05 |
| 30 | R-TEL-06 | 68 | R-GEN-01 | 106 | R-IMP-04 |
| 31 | R-TOK-15 | 69 | R-TEL-13 | 107 | R-SIT-01 |
| 32 | R-TEL-20, seção G | 70 | R-MOL-11 | 108 | R-DOC-03 |
| 33 | R-TOK-09 | 71 | R-GEN-03, R-TEL-19 | 109 | R-AUTH-04 |
| 34 | R-TOK-09 | 72 | R-TXT-05 | 110 | R-MOL-03, R-ROT-03 |
| 35 | R-ROT-02 | 73 | R-DOC-01 | 111 | R-RES-05 |
| 36 | R-PREF-04, R-MARCA-04 | 74 | R-DOC-03 | 112 | R-SIT-03 |
| 37 | R-MARCA-05, R-MOL-13 | 75 | R-TEL-16 | | |
| 38 | R-DOM-04 | 76 | R-DOM-06 | | |

As seções 2 a 4 do `11` (o que os exemplos ainda trazem do original, nomes históricos, limites) são cobertas por R-TOK-15, R-TEL-11, R-TEL-20, R-USR-05 e a seção F do `SKILL.md`.

## 3. Cobertura de `references/07` (56 itens do checklist) por regras

**56 / 56.** (Os números são as linhas do arquivo `07`.)

| Linha `07` | Regra | Linha `07` | Regra |
|---|---|---|---|
| 7 fontes | R-TOK-05 | 40 impressão opt-in | R-IMP-01 |
| 8 tokens, tintas fora do layer | R-TOK-02, R-TOK-13 | 41 preferências | R-PREF-03 |
| 9 tailwind | R-TOK-14 | 42 contraste AA | R-ACE-05 |
| 10 sem hex/gray | R-TOK-01 | 43 foco da Trilha/pular | R-ACE-02 |
| 13 faixa do alto | R-MOL-02 | 44 400px clipe/tabelas | R-TEL-05, R-RES-01 |
| 14 assinatura | R-MOL-15 | 45 1024px, onde medir | R-RES-02 |
| 15 avatar | R-MOL-03 | 46 `lining-nums` | R-TOK-06 |
| 16 recolher/menu | R-MOL-05 | 47 grades `grid-cols-1` | R-TEL-14 |
| 17 ação principal/ativo | R-MOL-05 | 48 marca do sistema novo | R-MARCA-02, R-MOL-16 |
| 18 grupos/pé | R-MOL-06 | 49 classes no build | R-TOK-14, R-VER-01 |
| 19 folha | R-MOL-07 | 50 perfis | R-ROT-03, R-MOL-11 |
| 20 sem rodapé | R-MOL-08 | 51 menu × rota | R-ROT-02 |
| 21 celular | R-MOL-09, R-MOL-10 | 52 rotas órfãs | R-ROT-04 |
| 22 pular/topo | R-MOL-01, R-ACE-03 | 53 texto herdado | R-DOM-05/06 |
| 25 entrada | R-ENT-01, R-ENT-02 | 54 chave de tema | R-PREF-04 |
| 26 < lg | R-ENT-02 | 55 `/agenda` | R-TEL-13 |
| 29 `FolhaDaTela` | R-TEL-01 | 56 impressão `.area-impressao` | R-IMP-01/02 |
| 30 cascas | R-TEL-01 | 57 gaveta e master | R-MOL-09, R-MOL-11 |
| 31 quatro estados | R-EST-01 | 58 login texto grande | R-ENT-03 |
| 32 carimbos | R-TEL-03, R-TEL-04 | 59 abas da Lista | R-TEL-06 |
| 33 botão `--cta` | R-TOK-09 | 60 contraste de UI | R-ACE-05, R-TOK-04 |
| 34 folhinha/espiral/pastas | R-TEL-02, R-TEL-13 | 61 impressão do escuro | R-IMP-04 |
| 35 documento | R-TEL-15 | 62 barras de rolagem | R-PREF-05 |
| 38 dois temas e 400px | R-VER-04 | 63 documento por item | R-DOC-03 |
| 39 teclado | R-ACE-02 | 64 item criado | R-TEL-12 |
| 65 aviso de demonstração | R-AUTH-04 | 67 foco de links, `aria-hidden`, `h1` | R-ACE-02, R-ACE-01, R-ACE-04 |
| 66 situação nova | R-SIT-01 | 68 carimbo grande em aparelho real | R-RES-04, seção F |
| 69 divisórias com rota | R-TEL-05, R-SIT-04 | 70 typecheck/lint/testes | R-VER-03 |

Itens do `07` que **não** puderam ser conferidos em aparelho real (impressão real, Tab real, carimbo grande em celular, `.docx` no Word) estão na seção F do `SKILL.md`.

## 3b. Regras que vêm da base original e das instruções do usuário (não de um achado de rodada)

Das 141 regras do `SKILL.md`, 115 aparecem nas tabelas acima. As outras 26 não nasceram de um defeito
achado nas rodadas; vêm de `references/01–10` (a definição original da Mesa) ou das instruções do
usuário, e foram numeradas só para ficarem citáveis: R-USR-01/02/03/06 (como falar com o usuário, não
pedir print, próximo passo único), R-TOK-10/16/17 (link, espaçamento, larguras), R-MOL-04/14/17 (foco da
faixa, marca nas duas peças, larguras), R-TEL-08/17 (selos e abas, proibições), R-TXT-02/03/04 (botões,
IA, atos de situação), R-ACE-10, R-RES-03 (larguras a testar; a lista foi ampliada pelas rodadas 8–12),
R-IMP-03/05, R-PREF-01, R-ROT-05 (menu de referência), R-AUTH-03, R-DOC-04, R-HOOK-01/03, R-VER-05.

## 4. O que não foi recuperado

- Relatórios do construtor e do revisor visual da **Rodada 5** (agentes encerrados pelo reinício do computador); apenas os achados do auditor da R5 foram recuperados.
- Parte dos relatórios das Rodadas 1–4 foi lida a partir dos resumos entregues ao agente principal (alguns truncados nos itens finais); por isso as linhas dessas rodadas listam os achados **principais**, não necessariamente todos os detalhes de redação.
- Os 17 detalhes de redação da Rodada 12 não foram corrigidos de propósito (ver seção F do `SKILL.md`).
