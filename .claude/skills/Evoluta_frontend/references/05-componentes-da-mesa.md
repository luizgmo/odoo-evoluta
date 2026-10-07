# 05 — Componentes da mesa

Código em `assets/components/mesa/`; estilos em `assets/styles/index.css`
(bloco "MESA DE TRABALHO", a partir da linha ~757). Use o componente; só escreva
HTML direto com as classes quando o componente não cobrir.

## Estrutura de página

| Peça | Arquivo / classe | Quando usar |
|------|------------------|-------------|
| `FolhaDaTela` | `mesa/FolhaDaTela.tsx` · `.folha` | **Toda tela de lista/painel.** Trilha + título serifado + ação à direita + conteúdo |
| `MesaPagina` | `mesa/Mesa.tsx` · `.mesa`, `.mesa-faixa`, `.mesa-titulo` | Tela de **um item simples ou relatório** (o documento para ler e baixar usa `FolhaDaTela`): cabeçalho da ferramenta no alto (`.mesa-faixa`: marfim no claro, ardósia no escuro; rótulo + carimbo + título + ações) e folhas subindo sobre ele (`-mt-10`). `compacto` = título de uma linha; `imprimivel` mostra "Imprimir". Também é a casca dos estados carregando/erro de uma tela de item |
| `PastaDoProcesso` | `mesa/PastaDoProcesso.tsx` | Item aberto **com divisórias** (abas no alto) e ferramentas na borda direita: traz a própria trilha, capa, divisórias e `children`. **Não** vai dentro de `MesaPagina` |
| `ProcessoNaMesa` | `mesa/ProcessoNaMesa.tsx` | Casca das telas de trabalho de um item (Documentos, Autos, Prazos, Histórico…): busca o item, mostra carregando/erro (com `MesaPagina`) e então a `PastaDoProcesso`: capa **cheia** na primeira divisória (`/processes/:id`) e **compacta** (uma linha) nas demais; a prop `compacta` força um dos dois; recebe uma função `children(item)` |
| `Trilha` | `mesa/Trilha.tsx` | "Você está em": Mesa / Lista / Item. Último passo é a tela atual (`aria-current`); números de processo `numero: true` (mono). O separador "/" entre passos é decorativo (`aria-hidden`, `text-muted-foreground`, é só pontuação visual e não é lido): não o troque por seta nem por outra cor |
| `.folha` / `.folha-simples` / `.folha-furada` | CSS | Folha empilhada (sombras sobrepostas, raio 4/10/10/10) / folha lisa / folha com furos de pasta |

### Qual casca para qual tela (tabela única — as demais referências repetem esta)

| Tela | Casca | Observação |
|------|-------|------------|
| Lista, painel, agenda, biblioteca, quadro | `FolhaDaTela` | Trilha + título serifado + ação à direita |
| Minha Mesa (início) | `div.folha` com cabeçalho próprio | Sem trilha; não use `FolhaDaTela` |
| Item aberto **com divisórias/fases** (a pasta) | `PastaDoProcesso` (capa da pasta) | Telas de trabalho do item: `ProcessoNaMesa` |
| Item aberto **simples** ou relatório avulso | `MesaPagina` | Pode ser `imprimivel`; sem divisórias |
| Documento (ler o texto e **baixar**) | `FolhaDaTela` com `BaixarDocumento` na `acao` do alto | É o que o `pages/Documento.tsx` da base usa. Com painel lateral ("o que fazer com o documento"), a variante da receita 8 usa `div.mx-auto.max-w-6xl` + `Trilha` + folha + `aside` |
| Páginas de texto (Ajuda, Preferências, formulário curto) | `div.mx-auto.max-w-5xl\|6xl` + `Trilha` + `h1` + folhas `folha p-5` | Receitas 6, 9, 10 |
| Conversa com a IA (perguntas e respostas num documento) | `div` de altura fixa no tablet+ com `Trilha` + cabeçalho + painel | Receita 14.1; sem balões de bate-papo |
| Comparar/repetir um item | `ProcessoNaMesa` + `grid` (`aside.folha-simples` + `section.folha`) | Receita 14.2 |
| Login / recuperar senha | `MolduraDeEntrada` | Fora da moldura |

`MesaPagina` e `PastaDoProcesso` **nunca** aparecem juntas na mesma tela.

## Estado

| Peça | Uso |
|------|-----|
| `MesaCarregando` | "Buscando as pastas…" (`role="status"`, spinner) |
| `MesaAviso` | Mensagem com título na tinta do caso; tinta `carmim` vira `role="alert"` |
| `MesaErroBusca` | Falha de rede/servidor, com botão **"Tentar de novo"** |
| `AvisoAtualizacaoFalhou` | A atualização falhou mas há dados na tela: borda tracejada carmim |
| `AvisoListaParcial` | Aviso honesto de que a lista mostra só parte dos itens (borda tracejada ocre) |
| `AvisoDeEstado.tsx` | Vazio/estado de tela |
| `ConfirmarAto.tsx` | Confirmação de ato importante (diálogo) |

Regra: **toda tela tem os quatro estados** — carregando, erro (com "Tentar de
novo"), vazio (com o próximo passo) e conteúdo.

## Carimbos

- `Carimbo` (`.carimbo`, `.tinta-*`): texto em caixa-alta no `font-ui`, borda
  dupla, leve inclinação (`--giro`, derivada do texto — estável por palavra),
  tinta que "come" o papel (`grande` usa filtro SVG de ruído; `.carimbo-grande`).
- `CarimboDatado`: ato + data + rodapé (setor/número) em contorno duplo — protocolo.
- `CarimboSituacao`: situação do item → tinta (ABERTO verde, EM_ANDAMENTO azul,
  CONCLUIDO violeta, ARQUIVADO grafite). A tinta vem da **tabela única de situações**
  em `constants/process-status.ts` (campo `tinta` de cada situação; veja 08 e SKILL.md):
  situação nova com tinta própria = uma linha nova nessa tabela, sem editar componente.
  A prop `tintas` (opcional) só **sobrepõe** a tinta de uma situação numa chamada
  isolada.
- **Quando bate** (`.carimbo-bate`, animação curta + som opcional): `bate` (surge
  por ação), `bateQuando={valor}` (muda por ação), `bateAoAbrir="chave"` (uma vez
  por visita). **Nunca bater a cada render.** `prefers-reduced-motion` e a
  preferência "sem movimento" desligam a animação.
- **Tintas** — são seis (`.tinta-carmim|ocre|verde|violeta|azul|grafite`) e **não se
  cria tinta nova**. Há **dois significados**, conforme o carimbo diga uma
  *situação* ou um *ato*; cada carimbo usa só um deles:

  | Tinta | Situação do item (`CarimboSituacao`, selo de lista) | Ato / etiqueta (`CarimboDatado`, `Carimbo` solto) |
  |-------|------------------------------------------------------|---------------------------------------------------|
  | carmim | exige ação agora (prazo estourando, erro) | prazo legal / urgente |
  | ocre | atenção (perto do prazo, incompleto) | pendente |
  | verde | aberto / em dia (exemplo: `ABERTO`) | aprovado / concluído |
  | violeta | concluído (fim do ciclo) | gerado pela IA |
  | azul | em andamento, neutro, sem pendência (exemplo: `EM_ANDAMENTO`) | registro / protocolo |
  | grafite | arquivado / inativo | — |

  Regra curta: **carmim sempre pede atenção, grafite sempre é "parado"**; o resto
  segue a coluna do que o carimbo representa. Os demais arquivos remetem a esta tabela.
- `tinta.ts`: `giroDoTexto`, `dataDeCarimbo`, controle "já bateu nesta visita".

## Objetos de escritório

| Objeto | Classes / componente | Uso |
|--------|---------------------|-----|
| **Gaveta + pastas** | `.gaveta`, `PastaNaGaveta` (`.pasta-gaveta`, `.pasta-orelha`, `.pasta-corpo`, `.pasta-lombada`, `.clipe-de-papel`) | Lista de itens como pastas de arquivo. A **orelha** leva o número (`.etiqueta-pasta`, mono) e se escalona por `--pos` (`posicao % 3`); a espessura (`--espessura`) cresce com o conteúdo. O título é o link e cobre a pasta inteira (`after:absolute after:inset-0`); botões secundários ficam acima (`relative z-10`) |
| **Capa da pasta** | `.pasta-capa`, `PastaDoProcesso` | Cabeçalho do item aberto com divisórias |
| **Calendário de parede** | `.folhinha` / `Folhinha`, `CalendarioDeMesa` | Data destacada: mês na faixa **carmim**, dia grande, dia da semana |
| **Bloco de espiral** | `BlocoEspiral`, `.bloco-espiral`, `.espiral`, `.bloco-notas`, `.bloco-notas-titulo`, `.linha-de-caderno`, `.cal-marca(-quadro)` | Agenda/calendário e notas: argolas metálicas, margem vermelha, linhas de caderno |
| **Ficha de fichário** | `.ficha` | Exemplares/itens de consulta: cabeçalho vermelho, furo, linhas de caderno; leve inclinação por `--giro` |
| **Bilhete** | `.bilhete` | Aviso/dica (post-it amarelo com fita). Um por tela, no máximo |
| **Mesa de apoio** | `.tampo-vista`, `.mesa-un` | Área da "linha do tempo", cartões soltos sobre a mesa |
| **Pilha de folhas** | `.pilha-folha` | Itens empilhados |
| **Livro aberto** | `.livro-aberto`, `.livro-pagina` | Duas páginas e dobra ≥ 1024px (leitura de documento) |
| **Fases em bolinhas** | `FasesEmBolinhas` | Progresso por etapas |
| **Divisórias de filtro** | `DivisoriasDeFiltro` | Filtros como orelhas/divisórias de arquivo |
| **Documento** | `.documento-oficial`, `.texto-do-documento`, `TextoDoDocumento` | Texto de documento oficial em serifada |
| **Margem de registro** | `.margem-registro` | Anotação à margem |

## Cartão de etapa (padrão de status)

Cada estado por token, nunca cor solta: pendente (papel + linha), dispensada
(ocre), concluída (verde), atual (azul: `border-primary dark:border-gold`).
Botões: "Gerar" `--cta` com texto branco; "Criar/Editar" outline; "Dispensar"
outline carmim; título em `font-display`.

## Padrões de botão

- Ação que **faz o trabalho** (gerar, uma por região) e a ação "Nova …" do menu lateral/celular:
  `bg-[hsl(var(--cta))] text-white hover:brightness-90` (classe explícita,
  vale em qualquer base) **ou** `<Button variant="cta">`, que existe no `ui/button.tsx` de
  `assets/base` e é equivalente — em outro projeto, confira que `ui/button.tsx` tem a
  variante antes de usar: variante inexistente compila e não faz nada. Botão principal
  comum dentro da folha (Salvar, Criar, Entrar): `Button` padrão (`bg-primary`).
- Secundária: `variant="outline"`; terciária: link `text-primary dark:text-accent`
  (`font-semibold hover:underline`), com "›" no fim quando leva a outra tela.
- Destrutiva: `variant="ghost"` com `hover:text-destructive` ou outline carmim.
- Baixar documento: sempre um botão visível e rotulado (`BaixarDocumento`, que recebe
  o rótulo por `rotulo`: "Baixar o documento (.docx)", "Baixar a ficha (.docx)"…),
  nunca escondido em menu — foi considerado o ponto mais importante do fluxo.

## Impressão e leitura

`.area-impressao` (envolve o que sai no papel), `.nao-imprimir` (moldura, botões,
trilha), `.quebra-pagina`, `.sem-quebra`. Impressão sempre em tema claro.
`html.pref-texto-menor|maior|grande`, `pref-links`, `pref-entrelinha`,
`pref-sem-movimento`, `pref-alto-contraste` já estão no CSS: ligue-os a uma tela
"Acessibilidade".
