# Exemplos de telas (modelo visual, não código para colar)

Estes arquivos são as telas **reais** do LicitarsAI, copiadas como referência. Cada
um começa com a linha `// LEGADO — exemplo de referência do sistema de licitações de
origem: não é peça pronta, depende dos dados dele; use só como modelo visual`. Eles **não compilam sozinhos**: importam serviços, tipos e hooks
do LicitarsAI que a skill não traz. Use-os para ver **a estrutura do JSX, as classes
e a ordem dos blocos**; troque os dados pelos do seu sistema.

A receita em texto de cada tela está em `references/09-receitas-de-telas.md`; os
textos exatos, em `references/10-estados-e-microcopy.md`. Os componentes da mesa
(`FolhaDaTela`, `Carimbo`, `ConfirmarAto`…) estão prontos em `assets/components/mesa/`
e `assets/base/`; estes exemplos só os **usam**.

## Mapa: receita → exemplo

| Receita (09) | Exemplo para olhar |
|---|---|
| §1 Minha Mesa | `pages/DashboardV4.tsx` + `features/dashboard/*` (DashboardHeader, ResumoDoDia, ProcessoEmDestaque, LinhaDoTempo, RitmoDoOrgao, QuickActionsRow, StatusDonut, ModalityBar); a base traz só uma versão enxuta em `assets/base/src/pages/Inicio.tsx` |
| §2 Lista em gaveta | `pages/ProcessListV3.tsx`, `pages/ArquivoProcessos.tsx`, `features/processos/listaDeProcessos.ts` |
| §3 Agenda | `pages/PrazosEAgenda.tsx`; os seis marcos de licitação (`EVENTOS_DE_LICITACAO`, `LEGENDAS_DE_LICITACAO`, com "art. 164"…) em `features/agenda/eventosDeLicitacao.ts`, para colar em `MARCA.campos` só em sistema de licitação (a base traz marcos neutros) |
| §4 Biblioteca / fichas | `pages/Library.tsx`, `pages/Templates.tsx` |
| §5 Quadro / painéis | `pages/Paineis.tsx`, `pages/LivroGestao.tsx` (tela "Processos do período"; o arquivo mantém o nome histórico), `pages/PlantaReparticao.tsx` (tela "Quem está com o quê"; idem) |
| §6 Formulário | `pages/NovaContratacao.tsx` (curto, "três perguntas"), `pages/ProcessEditV3.tsx` (ficha longa; só a parte da ficha) |
| §7 Item aberto | `pages/ProcessTimelineV3.tsx` (capa/linha do tempo), `pages/DocumentosDoProcesso.tsx`, `pages/HistoricoProcesso.tsx`, `pages/AutosImpressao.tsx`, `pages/SimuladorPrazos.tsx`, `pages/PreviaDiario.tsx`; atos: `features/processos/atosDaSituacao.tsx`, `SituacaoDaFicha.tsx`; histórico: `components/mesa/historico.ts` |
| §8 Documento + .docx | `pages/DocumentoPronto.tsx`, `features/documento/VersoesDoDocumento.tsx`; versão mínima que compila: `assets/base/src/pages/Documento.tsx` (rota `/documents/:id`) |
| §14.1 Conversa com a IA | `pages/Chat8V3.tsx`, `pages/Chat8/layout/Chat8LayoutV3.tsx`, `components/chat/Chat8HeaderV3.tsx`, `components/chat/Chat8EmptyState.tsx` |
| §14.2 Comparar e repetir | `pages/RepetirContratacao.tsx` |
| §14.3 Editor / detalhe de documento (**não** é modelo de aparência) | `pages/DocumentDetail.tsx` |
| §14.4 Peças soltas | `components/documents/VisualTimeline.tsx`, `features/dashboard/ActiveProcessesList.tsx`, `components/chat/DocumentReadyCard.tsx` |
| §9 Do seu jeito | `pages/Acessibilidade.tsx`, `features/preferencias/preferencias.ts` |
| §10 Como fazer | `pages/Help.tsx` |
| §11 404 / sem permissão | `pages/NotFound.tsx`, `pages/UnauthorizedV3.tsx` |
| §12 Login / recuperar senha | `components/auth/LoginV3.tsx`, `components/auth/ResetPassword.tsx` (a moldura é `assets/components/auth/MolduraDeEntrada.tsx`) |
| §13.2 Confirmar | `components/common/DeleteConfirmDialog.tsx` (já usa `bg-destructive`) |
| §13.6 Gráficos | `features/dashboard/StatusDonut.tsx`, `ModalityBar.tsx`, `theme/tokens.ts` (paleta `chart`) |
| §13.8 Lei ao lado | `features/lei/LeiAoLado.tsx`, `features/lei/CitacaoDaLei.tsx` (modelo ilustrado, com o texto fixo da Lei 14.133 e o link "Todos na Biblioteca"), e `features/lei/artigos.ts`, que traz o **resumo em linguagem comum** dos artigos da Lei 14.133 que o LicitarsAI usa (`ARTIGOS`, `HIPOTESES_PRAZO`, `LEI_14133_OFICIAL`; **não é o texto integral da lei**, e a receita 09 proíbe colá-lo): é daqui que se copia o conteúdo para um sistema de licitação, por cima do `artigos.ts` **neutro** da base; a **base** tem a versão parametrizada por `LEI_NOME`/`LEI_ROTA_DA_LISTA`/`LEI_LINK_OFICIAL` e desligada por `MARCA.leiAoLado = false` |

## Qual casca cada exemplo usa

(Regra geral: tabela "Qual casca para qual tela" em `references/05`.)

| Casca | Exemplos |
|-------|----------|
| `FolhaDaTela` | `ArquivoProcessos`, `Library`, `PlantaReparticao`, `Paineis`, `PrazosEAgenda`, `ProcessListV3`, `Templates` |
| `ProcessoNaMesa` (entrega a `PastaDoProcesso` compacta) | `DocumentosDoProcesso`, `AutosImpressao`, `HistoricoProcesso`, `PreviaDiario`, `SimuladorPrazos` |
| `PastaDoProcesso` direta | `ProcessEditV3`, `ProcessTimelineV3` |
| `ProcessoNaMesa` (pasta compacta + corpo próprio) | também `RepetirContratacao` |
| `div` de página de texto, sem `FolhaDaTela` (§14.1) | `Chat8V3` (+ `Chat8LayoutV3`, `Chat8HeaderV3`, `Chat8EmptyState`) |
| `Trilha` + `h1` (aparência parcial; não copie) | `DocumentDetail` |
| `MesaPagina` | `LivroGestao` |
| `div.folha` com cabeçalho próprio (sem trilha) | `DashboardV4` (Minha Mesa) |
| `div.mx-auto.max-w-*` + `Trilha` + `h1` + folhas | `Help`, `Acessibilidade`, `NovaContratacao`, `DocumentoPronto`, `NotFound`, `UnauthorizedV3` |
| `MolduraDeEntrada` | `components/auth/LoginV3`, `ResetPassword` |

## O que NÃO copiar (visual legado, anterior à mesa)

- `ProcessFormV3` (não incluído): aproveite só os campos e as regras de validação.
- Em `ProcessEditV3` e `ProcessTimelineV3`: os estados de erro, carregando, `Alert` e
  `Card` antigos. Use `MesaErroBusca`, `MesaCarregando`, `AvisoDeEstado` e `folha`.
- `DocumentsV3`, `Notifications`, `Calendar`, `Reports`, `Compliance`: telas antigas,
  não representam a mesa (não foram incluídas; não as recrie por analogia).
- Legenda do `StatusDonut` com `text-platinum-*`: troque por `text-muted-foreground`.
- Toast do shadcn (`useToast`): em sistema novo use `avisar` (faixa de resultado).
- Qualquer bloco com `glass-*`, `gradient-*` ou cor hex/`bg-red-*` crua.
- `Button` sem `variant`: é `bg-primary`; o azul de ação `--cta` (texto branco) entra por classe explícita (`bg-[hsl(var(--cta))] text-white`) ou por `<Button variant="cta">` (equivalente; existe no `ui/button.tsx` de `assets/base`, e os exemplos copiados usam a classe). O ouro nunca é cor de botão sobre folha clara.

## O que os exemplos esperam e a skill NÃO traz

Ao adaptar, substitua por equivalentes do seu sistema (ou apague a parte):

- Serviços e tipos: `@/services/api/endpoints/*` (dashboard, document-revisions…) e o
  barrel `@/services/api` (`processApi`, `documentApi`, `chatApi`, `apiClient`: usado por
  `ProcessListV3`, `ProcessTimelineV3`, `NovaContratacao`, `RepetirContratacao` e
  `ActiveProcessesList`; a base só traz `services/api/client.ts`, com um `apiClient` falso),
  `@/store/hooks` (Redux), `@/hooks/useDashboardStats`, `@/utils/getFullName`,
  `@/components/ui/use-toast`.
- Módulos de domínio: `@/features/processos/{novaContratacao,ficha}`,
  `@/features/modelos/modelos`, `@/features/documento/versoes`,
  `@/components/documents/etapasDoProcesso` (usado por `VisualTimeline`),
  `@/components/chat/GeneratedDocumentLink`, `@/store/slices/*`.
- **Referências que o exemplo cita e a skill não traz nenhum arquivo para** (ignore a
  parte que as usa ou substitua por equivalente do seu sistema): `DocumentInfoModal`,
  `MarkdownEditor`, `Chat8ErrorBoundary`, `Chat8PerguntasPanel`, `ui/feature-in-development`,
  `config/origin`, `contexts/WebSocketContext`, `features/biblioteca/exemplares`,
  `features/dashboard/montarLinhaDoTempo`, `hooks/useChatRedux`, `hooks/useFeature`,
  `types/index`, `utils/ferramentasPropostas` e `utils/logger`; e três imports **relativos**
  (do mesmo diretório): `./NewProcessV3` (`pages/NovaContratacao.tsx:24`),
  `./contasDoRitmo` (`features/dashboard/RitmoDoOrgao.tsx:11`) e `./diffDeLinhas`
  (`features/documento/VersoesDoDocumento.tsx:13`). Também faltam `./ProcessFormV3`
  (`pages/ProcessEditV3.tsx:4`), `./versoes` (`VersoesDoDocumento.tsx:14`) e
  `./etapasDoProcesso` (`VisualTimeline.tsx:12`), já citados acima como módulos de domínio.
  (Conferido por Grep: os demais imports relativos dos exemplos apontam para arquivos que
  existem em `exemplos/`, `assets/components/` ou `assets/base/`.)
- Já existem em `assets/base` e funcionam: `utils/ferramentasMesa.ts` (`LACUNA`,
  `formatarMoeda`, `valorEmReais`, `dataDoRegistro`, `contarTexto`, `filtrarPorPeriodo`,
  `resumirPor`, `resumirLivro`, `ordenarPecas`, `separarPecas`, `agruparPorResponsavel`…),
  `components/mesa/PecasDosAutos.tsx` (`Rubrica`, `Linha`; ficam em `assets/components/mesa/`),
  `hooks/useMesaDados.ts`,
  `utils/{baixarDocx,datas,markdown,prazosLicitacao}.ts`, `features/{agenda,dashboard/formatos,
  lei/artigos,lei/contextoDaLei,preferencias,processos/listaDeProcessos}`,
  `components/documents/BaixarDocumento.tsx`, `constants/process-status.ts`.

## Como usar

1. Leia a receita no 09. 2. Abra o exemplo correspondente e copie a **estrutura**
(ordem dos blocos, classes). 3. Troque dados/serviços pelos do seu sistema e os textos
pelos do 10 (ajustando o substantivo). 4. Confira com a lista de verificação do
`SKILL.md`. Dados de exemplo sempre inventados.
