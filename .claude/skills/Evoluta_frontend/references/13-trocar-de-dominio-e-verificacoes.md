# 13 — Trocar de domínio, buscas de verificação, perfis, rotas e build (detalhe)

Este arquivo guarda, sem corte, o miolo detalhado que antes ficava no SKILL.md antigo:
tabela dos arquivos que carregam o domínio de licitação, mapa de campos, rota inicial/da lista,
divisórias, fases, situações, agenda, as quatro buscas de textos herdados, o hook de fronteira,
perfis, guarda de rota, compilação e limites. As regras curtas e numeradas estão no `SKILL.md`
(áreas R-DOM, R-ROT, R-AUTH, R-HOOK, R-VER); aqui está o texto completo de cada caso.

## Arquivos que carregam o domínio de licitação (troque ou remova)

A moldura e as peças são genéricas; estes arquivos (de `assets/base/src/`, exceto os
de `components/mesa/`, que vêm de `assets/components/mesa/`) falam de processos
licitatórios e são **modelo** para o objeto principal do seu sistema:

| Arquivo | O que tem de licitação | Ação |
|---------|------------------------|------|
| `config/marca.ts` | nome, frases, `objeto`, ação principal | **edite** (é o único lugar de textos de marca) |
| `components/layout/navegacao.ts` | itens do menu, perfis | **edite** (03) |
| `constants/process-status.ts` | **tabela única de situações** (`SITUACOES`: `label`, `color`, `tinta`, `encerrada`, `concluida`) | troque as linhas pelas do seu objeto; carimbo, lista, agenda, fases e painéis leem daqui (ver "Situações" abaixo) |
| `features/processos/*`, `components/mesa/{fasesDaLicitacao,PastaDoProcesso,ProcessoNaMesa,ResumoDaPasta,ferramentas}.*` | fases, divisórias, pasta | adapte (09 §7) |
| `utils/prazosLicitacao.ts`, `features/lei/artigos.ts`, `features/lei/LeiAoLado.tsx`, grupo "Na lei" da `BuscaRapida` | prazos legais, "Lei ao lado" | **remova** `prazosLicitacao.ts` se não for licitação (a base não o importa; só os `exemplos/` o citam). Se o ambiente recusar a remoção (o hook do projeto, quando existe, é uma regra do projeto e não da skill; ele pode recusar `rm`/`sed` conforme o texto do comando, por exemplo um `rm` cujo caminho cita `src`), não tente contornar (nada de script `.sh`): esvazie o arquivo, trocando o conteúdo por uma linha `export {};` com Write/Edit, e conte o bloqueio ao usuário. Se mantiver o arquivo e `HIPOTESES_PRAZO` estiver vazia, `calcularCronograma` (`prazosLicitacao.ts`) lança um erro explícito ("HIPOTESES_PRAZO está vazia…"). **O `artigos.ts` da base é NEUTRO**: `ARTIGOS` e `HIPOTESES_PRAZO` vêm vazios, `LEI_NOME` é "Norma de apoio" e `LEI_LINK_OFICIAL`/`LEI_ROTA_DA_LISTA` são `""`; **o resumo da Lei 14.133 não vem na base**, está em `assets/exemplos/features/lei/artigos.ts` (copie-o por cima só se o sistema for de licitação; é um **resumo** dos artigos, não o texto integral da lei; nele o link oficial se chama `LEI_14133_OFICIAL`, e a base só usa a função `linkOficial`, que ele também exporta). A gaveta e o grupo "Na lei" vêm **desligados**: `MARCA.leiAoLado = false` faz o `LeiAoLadoProvider` só repassar os filhos e a `BuscaRapida` omitir o grupo e o trecho "…ou artigo da lei"; nada de lei aparece na tela (nem na tela de Acessibilidade: o atalho Esc diz só "Fechar janela ou busca"; nem na agenda, cujos marcos da base são neutros). A lei só reaparece se você ligar `leiAoLado`, preencher `artigos.ts` ou colar em `MARCA.campos.eventos` os marcos de `exemplos/features/agenda/eventosDeLicitacao.ts` (que citam o "art. 164" etc.). Para ligar, ponha `true` e preencha em `artigos.ts` o `ARTIGOS`, o `LEI_NOME`, o `LEI_LINK_OFICIAL` e o `LEI_ROTA_DA_LISTA` (`""` = sem o link "Ver todos os artigos"); com `leiAoLado = true` e `ARTIGOS` vazio, nada abre e o grupo "Na lei" some da busca. Mantenha o arquivo `artigos.ts` (a `BuscaRapida`, o `LeiAoLado` e `prazosLicitacao.ts` importam dele); só se apagar `prazosLicitacao.ts` e não usar o simulador o `HIPOTESES_PRAZO` fica sem uso |
| `utils/datas.ts` | calendário de dias úteis e feriados (genérico) | **mantenha**: `ferramentasMesa.ts`, `calendarioDoMes.ts` e `montarAgenda.ts` importam dele (`prazosLicitacao.ts` apenas o reexporta) |
| `utils/baixarDocx.ts`, `components/documents/BaixarDocumento.tsx` | baixar .docx | mantenha se houver documento gerado. `baixarDocx` gera um **.docx de verdade** no navegador (zip sem compressão + XML mínimo, sem dependência; o Word abre) com o título e o conteúdo da prop `blocos` de `BaixarDocumento` (`BlocoDocx[]`: texto = parágrafo, `{ titulo }` = subtítulo; sem `blocos`, sai um único parágrafo neutro, "Documento sem conteúdo informado."; `baixarDocx.ts` exporta também `gerarDocx(titulo, blocos)` e `blocosParaMarkdown(blocos)`, para mostrar na tela o mesmo conteúdo do arquivo; exemplo no 09 §8); com servidor, troque o corpo por "buscar o arquivo e `salvar(blob, nome)`". `BaixarDocumento` recebe `nome` (nome do arquivo baixado, sem extensão, e rótulo acessível do botão) e, separado dele, `titulo` (título impresso na primeira linha do .docx; sem ele vale o `nome`: passe `titulo` quando o nome do arquivo tem código ou data e o título deve ser limpo; o 4º argumento de `baixarDocx(id, nome, blocos, titulo)`). O rótulo padrão de `BaixarDocumento` é "Baixar .docx" (neutro; cada tela pode passar `rotulo`) e o `title` do botão é "Baixar o arquivo .docx deste documento." (neutro). O botão só aparece com `idDoArquivo`. **Toda tela que usa o botão precisa passar `blocos`**: `Documento` passa o conteúdo da folha e `Item` passa `blocosDoItem(p)` (a ficha do item, com os rótulos de `MARCA.campos`; `utils/blocosDoItem.ts` exporta também `nomeDoDocumentoDoItem`, "Ficha {código}") com `rotulo="Baixar a ficha (.docx)"`; sem `blocos` o arquivo sai com a linha neutra "Documento sem conteúdo informado." **Documento por item**: `/documents/:id` usa `useProcessoDaMesa(id)`; se o id é o de um item, a folha mostra o relatório montado por `blocosDoItem` (e é o mesmo que vai ao .docx; o título da tela é o título do arquivo); se o id é só dígitos mas não é de item, mostra o conteúdo de demonstração neutro (`BLOCOS`); se não é número, "Este documento não existe". A pasta (`Item.tsx`) tem o botão "Abrir como documento". Em sistema real, troque `blocosDoItem` pela leitura do documento no servidor (a receita está no 09 §8) |
| `hooks/useMesaDados.ts`, `services/api/client.ts` | dados inventados, num **armazém em memória** (`useSyncExternalStore`; `adicionarProcesso(dados)` é o que o `Formulario` chama ao salvar: o item novo, com `created_at`/`updated_at` **de hoje**, aparece na lista, na busca e na agenda e abre no `Item`, e some ao recarregar a página). `client.ts` exporta `CLIENTE_DE_DEMONSTRACAO = true`: enquanto for `true`, a tela de recuperar senha (`ResetPassword`) mostra o aviso "Demonstração: nenhum e-mail é enviado e a senha não é alterada." (a tela **não faz nada de verdade**; sem o aviso ela mentiria ao usuário) | troque pela API real (o `Formulario` passa a enviar ao servidor) e, ao ligar o serviço real de senha, ponha `CLIENTE_DE_DEMONSTRACAO = false` (some o aviso) |

### Trocar de domínio (o objeto do seu sistema não é "processo de licitação")

Mesmo com `MARCA` trocada, a base ainda **fala** de licitação em nomes de arquivo,
identificadores e alguns textos. Eles funcionam como estão (são só nomes); a decisão é
se você os renomeia. **Recomendado**: mantenha os nomes de código e faça um **mapa de
campos** (ex.: "processo" = "convênio"; `numero` = nº do convênio; `modalidade` = tipo)
anotado no relatório ao usuário, trocando só o que **aparece na tela** (textos,
rótulos, aria-labels, situações, divisórias). Só faça a busca-e-troca de nomes se o
código do sistema novo será mantido por outras pessoas e o termo "processo" confundir.

**Exemplo de mapa de campos** (escola, objeto = "matrícula", feminino):

| Campo do tipo `Process` (`types/process.ts`) | Passa a significar | Onde a semântica de licitação está embutida |
|---|---|---|
| `code` | nº da matrícula | `MARCA.objeto.semNumero` |
| `modality.name` | série/turma | agrupamento da lista; `MARCA.objeto.semAgrupamento`; `ehContratacaoDireta(p.modality?.name)` tira itens da agenda e da aba "sem data" |
| `opening_date` / `opening_time` | prazo da rematrícula | aba "sem data" da lista (`daAba("sem-data")` = ativo, sem `opening_date` e que não é contratação direta); ordenação "Próxima abertura" (`ordenar`); toda a agenda (`montarAgenda.ts` lê `lerData(p.opening_date)`) |
| `estimated_value` | mensalidade | cartão de valor do painel (`valorEmAberto` soma `estimated_value` dos ativos) e a ordenação "Maior valor" |
| `publication_date` | data do cadastro | prazos derivados na agenda |
| `status` | situação | `constants/process-status.ts` |

Os **rótulos** desses campos ("Modalidade", "Abertura", "Valor estimado", "Próxima
abertura", "Maior valor", "Prazo legal", "Sessão", "Autuado", "Objeto", "Fase atual",
"Documentos principais", os seis marcos da agenda…) vêm de `MARCA.campos` (08 lista
todos): troque-os lá, sem editar componente. Já a **lógica** (abas, ordenações, agenda, cartão de valor)
continua a de abertura/valor: se o seu objeto **não tem data nem valor**, reescreva a aba
"sem data", as ordenações, a agenda e o cartão de valor (ou remova-os). Trocar só
`MARCA.campos` muda o texto, não o comportamento.

**A rota inicial e a rota de criação saem de `MARCA`** (não se editam em `App.tsx`):
`MARCA.rotaInicial` (padrão `/dashboard`) é o endereço da tela inicial e `MARCA.acaoPrincipal.caminho`
(padrão `/processes/new`) é o endereço do formulário de criação. `App.tsx` registra as duas rotas
com esses valores (o `index` redireciona para `rotaInicial`), e `navegacao.ts` (item de início e
item aceso), `destinosDoCelular` (a barra do celular segue **a ordem declarada**), `preferencias.ts`
(atalhos) e a busca leem de lá; o texto do item de início vem de `MARCA.inicio` (menu e gaveta) e
`MARCA.inicioCurto` (barra do celular e menu recolhido). Troque os dois campos e a ação principal
leva a uma tela que abre. Se mudar o caminho de criação, mantenha-o **fora** de `/processes/:id/*`
ou antes dessa rota (a rota fixa vence a `:id`).

**A rota da lista e do item sai de `MARCA.rotaDaLista`** (padrão `/processes`; é a constante
`ROTA_DA_LISTA` de `config/marca.ts`, também exportada). Para trocar o endereço (ex.:
`/reservas`) **edite só `ROTA_DA_LISTA`** no `marca.ts`: `App.tsx` registra `rotaDaLista` e
`${rotaDaLista}/:id/*`; `ProcessoNaMesa` e `PastaDoProcesso` (o `useMatch`, a trilha e o
"Voltar"), `ferramentas.ts` (`caminhoDaAba`), `PastaNaGaveta` (`rotaBase`), `navegacao.ts` (o
item e a regra do item aceso), `BuscaRapida`, `preferencias.ts` (o atalho da lista) e as
páginas `Inicio`, `Formulario`, `Agenda`, `Item`, `Paineis` e `NotFound` leem de lá, e o padrão
de `acaoPrincipal.caminho` (`${ROTA_DA_LISTA}/new`) e de `destinosDoCelular` acompanha. Se você
os escreveu como texto fixo, troque também. A letra do atalho da lista é
`MARCA.atalhoDaLista` (padrão `P`; troque junto se ela não fizer sentido no seu nome, e evite
colidir com `acaoPrincipal.atalho`: o `preferencias.ts` avisa no console em
desenvolvimento). Confira com Grep por `"/processes"` em `src`: só `marca.ts` deve achá-lo.
As demais rotas fixas do menu de exemplo (`/agenda`, `/metrics`, `/templates`, `/arquivo`,
`/help`…) continuam escritas em `App.tsx` e `navegacao.ts`.

Herdados do domínio (procure por eles):

| Onde | Identificadores / arquivos | O que fazer |
|------|----------------------------|-------------|
| Divisórias da pasta | `DIVISORIAS_DO_PROCESSO`, `FERRAMENTAS_DO_PROCESSO` e `caminhoDaAba` (só em `components/mesa/ferramentas.ts`; `utils/ferramentasMesa.ts` tem outras funções, funções de contagem/agrupamento, e só comentários de domínio) | reescreva a lista (rótulo, rota, ícone) |
| Pasta | `PastaDoProcesso`, `ProcessoNaMesa`, `ResumoDaPasta`, `PastaNaGaveta` (props `nomeDoObjeto`, `rotaBase`) | mantenha o nome; troque os textos. Os `aria-label` das divisórias e das ferramentas já usam `MARCA.objeto.singular`; os textos de pasta vazia (`rotuloDaCapa`, `semDescricao`, `semNumero`, `semAgrupamento`) vêm de `MARCA.objeto`, e os rótulos dos campos da capa e da gaveta ("Modalidade", "Abertura", "Valor estimado", "Fase atual", "Autuado", "Falta a data de abertura", "Contratação direta" e a nota que a explica, "Fase estimada pelas datas", "Documentos principais"…) vêm de `MARCA.campos`. O `aria-label` da lista de fases vem de `MARCA.campos.fases` ("Fases"). Continua no código, só com a concordância de gênero (por `GEN` e `MARCA.objeto.singular`, sem artigo fixo): "Encerrad{GEN.fim} sem concluir" (`PastaDoProcesso.tsx`, `FasesEmBolinhas.tsx`) e as explicações "… concluíd{GEN.fim}" / "… encerrad{GEN.fim} sem concluir" de `fasesDaLicitacao.ts` |
| Fases | `fasesDaLicitacao`, `FasesEmBolinhas` | o arquivo `fasesDaLicitacao.ts` traz no cabeçalho o bloco **"MOLDE NEUTRO"**: não o apague, troque o **conteúdo** (nomes das fases, explicações, critério de `ehContratacaoDireta`) mantendo os nomes exportados (`FASES_DA_LICITACAO`, `situacaoDasFases`, `espessuraDaPasta`, `ehContratacaoDireta`) e o campo `contratacaoDireta` (`false` fixo se não houver). Fases sugeridas para um fluxo simples: "Início", "Andamento", "Conclusão". **Pode haver qualquer número de fases (1 ou mais):** os índices de `situacaoDasFases` passam por `ate()`, que os limita à última fase, e a situação marcada `concluida` na tabela de situações (hoje `CONCLUIDO`) cai sempre na última; trocar a lista para 3 ou 4 nomes não quebra "Fase atual" nem o "Fase N de M". Reescreva também os blocos `if` de `situacaoDasFases` (qual dado leva a qual fase) e a `explicacao` de cada um: eles ainda falam de edital e sessão. **Quais situações encerram ou concluem o fluxo não se escreve aqui**: `situacaoDasFases` pergunta à tabela de `constants/process-status.ts` (`ehSituacaoConcluida`, `ehSituacaoEncerrada`), então uma situação nova só entra pela tabela. As fases da base **não** vêm trocadas: são as da licitação. Os textos "Contratação direta" (e a nota), "Fase" em "Fase N de M" e "Fase estimada pelas datas" **não** são mais fixos: vêm de `MARCA.campos.contratacaoDireta`, `contratacaoDiretaNota`, `faseRotulo` e `faseEstimada` |
| Situações | `constants/process-status.ts`: a **tabela única** `SITUACOES` (uma linha por situação: `label`, `color` do selo, `tinta` do carimbo, `encerrada`, `concluida`) e os helpers que dela saem (`ehSituacaoAtiva`, `ehSituacaoEncerrada`, `ehSituacaoConcluida`, `tintaDaSituacao`, `SITUACOES_ATIVAS`, `SITUACOES_ENCERRADAS`, `getProcessStatusConfig`) | troque as **linhas da tabela** pelas situações do seu objeto (rótulos no mesmo gênero, via `GEN.fim`). `Mesa.tsx` (carimbo), `listaDeProcessos`, `montarAgenda`, `fasesDaLicitacao`, `ferramentasMesa` e `Paineis` leem daqui: **uma situação nova com tinta própria exige editar só esta tabela** (outros nomes que o servidor mande entram no campo `apelidos` da própria linha; `padrao: true` marca a situação para valor vazio; renomear ou trocar linhas não quebra o build). `TINTA_POR_SITUACAO` não existe mais; a prop `tintas` de `CarimboSituacao` só sobrepõe a tinta numa chamada isolada. A tinta segue a coluna "situação do item" da tabela do 05 (seis tintas, nenhuma nova) |
| Tipos | `types/process.ts`, `types/document.ts` | adapte os campos ao seu objeto |
| Dados e telas | `features/processos/listaDeProcessos.ts`, `hooks/useMesaDados.ts` (`useProcessosDaMesa`, `useProcessoDaMesa`), `services/api/client.ts`, `pages/{Lista,Item,Paineis,Agenda}.tsx` | troque os dados inventados pela API real; revise os textos |
| Específicos de licitação | `utils/prazosLicitacao.ts`, `fasesDaLicitacao.ts`, `FasesEmBolinhas.tsx`, `features/lei/artigos.ts` (neutro na base), exemplos de licitação | `prazosLicitacao.ts` pode ser apagado (nada da base o importa). **`fasesDaLicitacao.ts` NÃO pode ser apagado** — é importado por `montarAgenda.ts`, `listaDeProcessos.ts`, `PastaDoProcesso.tsx`, `PastaNaGaveta.tsx` e `FasesEmBolinhas.tsx`, e o `tsc` quebraria: siga o "MOLDE NEUTRO" do cabeçalho dele (troque o conteúdo, mantenha nomes e assinaturas; `ehContratacaoDireta` pode devolver `false`) e só depois, se quiser, tire os imports. **`FasesEmBolinhas.tsx` só é importado por `PastaNaGaveta.tsx`**: para o marcador não aparecer, passe `progresso={null}` (e `aviso={null}`, `espessura={1}`) em toda chamada de `PastaNaGaveta` (`Lista.tsx`); para **apagar** o arquivo, tire antes o import e o padrão `<FasesEmBolinhas …/>` do `progresso` dentro de `PastaNaGaveta.tsx`; apagá-lo sem isso quebra o `tsc`. `utils/datas.ts` fica. Para `artigos.ts`, `LeiAoLado*` e o grupo "Na lei" da busca, siga a linha de `artigos.ts` na tabela acima (a base já vem neutra e desligada) |
| Agenda | `features/agenda/montarAgenda.ts` (monta prazos legais) | **reescreva** para os compromissos do seu objeto (não apague: a tela de agenda e a busca dependem dele); os textos de ausência vêm de `MARCA.objeto`. Os títulos e as bases legais dos seis marcos que ele cria ("Publicação do edital", "Sessão pública", "art. 164"…) vêm de `MARCA.campos.eventos` (um `{ titulo, fundamento }` por marco): troque lá os textos e, se mudar os marcos, reescreva a função. As **chaves** de `eventos` são os `tipo` dos compromissos e podem ser renomeadas, desde que se renomeiem juntos a chave em `marca.ts`, o `tipo` e o `...ev.<chave>` de cada marco em `montarAgenda`, a lista `TIPOS_DA_LICITACAO` e `MARCA.campos.tipoDoEvento`; para um domínio sem esses marcos (ex.: vencimentos de alvará), reescreva `montarAgenda` com tipos seus ("vencimento"), pois `TipoDeCompromisso` é texto livre. Os **padrões da base são neutros** ("Abertura do prazo", "Evento principal", fundamento "regra do exemplo", legendas "Prazo" e "Evento"); os marcos de licitação (edital, impugnação, "art. 164", legendas "Prazo legal" e "Sessão") estão em `assets/exemplos/features/agenda/eventosDeLicitacao.ts` (`EVENTOS_DE_LICITACAO` e `LEGENDAS_DE_LICITACAO`), para colar em `MARCA.campos` só se o sistema for de licitação. O `fundamento` de cada marco vai também para a descrição do evento no .ics ("Fundamento: …"). Cada compromisso tem ainda o campo booleano `legal` (nome herdado do exemplo de licitação; **não aparece na tela**): `true` marca o prazo crítico, que ganha o carimbo carmim com o rótulo `MARCA.campos.prazo` na `Agenda`, a marca de prazo no `CalendarioDeMesa` e conta no cartão "{prazo} nos próximos 7 dias" de `Paineis`; em outro domínio ele quer dizer "crítico/vencimento", e o nome só muda se você renomear também em `montarAgenda`, `calendarioDoMes`, `Agenda` e `Paineis`. O texto do .ics ("Calculado por {MARCA.agenda.produto}; confira a data antes de usar.") é fixo e neutro de gênero. Os nomes da agenda e das legendas vêm de `MARCA.campos` (`agenda`, `prazo`, `evento`, `tipoDoEvento`; este último é o `tipo` de compromisso que ganha a moldura dupla azul no `CalendarioDeMesa`, e `MARCA.campos.agenda` também entra no `PRODID` do .ics) |
| Histórico | `assets/exemplos/components/mesa/historico.ts` (não existe na base) | use como modelo de leitura |
| Logo | `public/logo-produto-modelo.svg` (traz o texto "Meu Sistema") | **copie como modelo** para `public/logo-<sistema>.svg` (proporção entre 2:1 e 4:1, **fundo transparente**, letras claras: ele aparece sobre a faixa azul-noite), aponte `MARCA.logo` e **apague ou esvazie o modelo** (se o hook barrar o `rm`, esvazie com Write; `licitars-logo.png` também pode sair) |
| Documento | `utils/blocosDoItem.ts`, `pages/Documento.tsx`, `components/documents/BaixarDocumento.tsx` | troque `blocosDoItem` (campos do relatório do item, com os rótulos de `MARCA.campos`) pela leitura do documento real; o título do arquivo é `nomeDoDocumentoDoItem` ("Ficha {código}") |

Verificação final de textos herdados:

```bash
grep -rniE "\blicita|licitars|edital|modalidade|proposta|processo|14\.133|órgão|orgao|sessão|sessao|diário|diario|autos|planta|livro|Bedrock|prazo legal|pregão|pregao|dispensa" src public index.html package.json tailwind.config.ts vite.config.ts components.json
```

(`\blicita` evita o falso positivo "solicitação". Os três últimos arquivos, que ficam fora de `src`, também podem citar o domínio: confira-os.) No que sobrar, cada ocorrência é (a)
nome de código que você decidiu manter, ou (b) texto de tela que deve ser trocado.
Acertos **aceitáveis** (legado, não aparecem na tela): o `src/index.css` (comentários e as
classes legadas `card-dashboard`, `chat8-*` etc.) e tudo de `assets/exemplos/` (que você não
copia). `features/lei/` da base agora é **neutro** (sem texto de lei); só traz acertos
se você o preencher.
Falsos positivos esperados: "sessão" (sessão de login), "livro"/"autos" em nomes de
exemplo que você não copiou. **Esta busca tem ruído por desenho** (centenas de acertos,
quase todos nomes de código mantidos: `processo`, `/processes`, `listaDeProcessos`).
Por isso rode também uma **segunda busca só de texto de tela**, que acha o que a primeira
afoga:

```bash
grep -rniE "contrata|autuad|\bIA\b|servidor|Fase " src index.html
```

e uma **terceira**, para os termos de licitação que as duas primeiras não pegam (muitos
acertos são nomes de código; olhe os que aparecem na tela):

```bash
grep -rniE "objeto|valor estimado|prazo legal|abertura|\blei\b|arquivo|painel|repartição|biblioteca|minha mesa" src index.html
```

(Falsos positivos persistentes dessa busca: o selo fixo "Painel Master" do `AppHeaderV3`,
`dispensado`/`dispensada` em `andamento.ts` e `ferramentasMesa.ts`, `idDoArquivo`,
`BaixarDocumento` ("arquivo .docx") e tudo de `features/lei/`, que fica desligado.)

As três buscas acham também identificadores e comentários. A **mais útil** é uma quarta, que
só olha **texto entre aspas, crases ou JSX** (o que a pessoa lê) e, descartando as linhas de
comentário, corta a maior parte do ruído. Com a ferramenta Grep, use o padrão abaixo (ignorando maiúsculas) em `src`,
com `glob` `*.{ts,tsx}`; no terminal, o mesmo padrão em `grep -rniE … src --include=*.ts
--include=*.tsx`, e descarte à mão as linhas que começam por `//`, `*` ou `/*`. Na base
inalterada ela devolve cerca de 126 linhas contadas pela ferramenta Grep, que **não descarta
os comentários** (89 nos 19 arquivos de `base/src`, um terço delas — 31 — em `config/marca.ts`,
e 37 nos 10 arquivos de `components/`), todas conhecidas (os
arquivos com texto de tela estão na lista abaixo); depois que você trocar os textos, o que sobrar deve ser nome de código (ela ainda
casa com caminhos de `import` entre aspas, como `@/features/processos/…`, e com valores de
código, como `id="objeto"` ou `"proxima-abertura"`: ignore esses; o `\blicita` evita o falso
positivo "solicitação" de `ResetPassword.tsx`):

```text
["'>`][^"'<>`{}]*(\blicita|edital|modalidade|proposta|processo|14\.133|órgão|sessão|diário|autos|planta|livro|prazo legal|pregão|dispensa|contrata|autuad|servidor|valor estimado|abertura|objeto|\blei\b|arquivo|painel|repartição|biblioteca|minha mesa)[^"'<>`{}]*["'<`]
```

**"Zerar as buscas" quer dizer zerar o TEXTO DE TELA, não os acertos.** O critério é a quarta
busca (strings que a pessoa lê): ela tem de sobrar só com o que está na lista de aceitos
abaixo. As três primeiras sempre devolvem acertos, porque acham nomes de código; leia-os
um a um e decida se aparecem na tela. **Acertos aceitos** (nome de código, endereço ou selo
que você manteve de propósito; não são texto de domínio visível): o selo fixo "Painel
Master" (`AppHeaderV3`); as rotas fixas `/arquivo`, `/planta`, `/livro-gestao`, `/templates`
e a rota inicial que você escolheu (por exemplo `/painel-geral`, que casa com "painel"); os
nomes `fasesDaLicitacao`, `FASES_DA_LICITACAO`, `TIPOS_DA_LICITACAO`, `ehContratacaoDireta`,
`contratacaoDireta`, `proxima-abertura`, `dataDeAbertura`, `anoDoArquivo`, `idDoArquivo`,
`processo`/`Process`/`/processes`, as classes `livro-*` e `.pasta-*`, `dispensado` em
`andamento.ts`, e tudo de `features/lei/` com `leiAoLado = false`. Se o acerto é uma frase
que aparece na tela, troque-a (pelo `MARCA` ou pelo componente) ou marque-a como exemplo.

Texto de tela fixo fora de `MARCA` (confira cada um; o que já vem de `MARCA.campos`,
`MARCA.objeto` e `MARCA.entrada` você troca no `marca.ts`, ver 08):
- `config/marca.ts`: todos os valores de `campos` (`objeto`, `agrupamento`, `data`, `semData`,
  `faltaData`, `valor`, `fase`, `faseRotulo`, `faseEstimada`, `contratacaoDireta`,
  `contratacaoDiretaNota`, `documentos`, `criadoEm`, `ordemPorData`, `ordemPorValor`, `prazo`,
  `evento`, `tipoDoEvento`, `agenda`, `feriadoNota`, `paineisTrilha`, `paineisMontando`,
  `paineisSituacao`, `paineisPorSituacao`, `paineisTitulo`, `paineisApoio`, `resumoDoDia`,
  `arquivo`, `fases`, `prefixoDoCodigo`, `responsavelPadrao`, `rubrica`, `eventos`),
  `entrada.rotulo` ("Acesso do servidor"), `entrada.subtitulo` ("o seu órgão"),
  `entrada.carimboRodape` ("servidores autorizados") e `objeto.semAgrupamento` são
  **exemplos de licitação para trocar**; as telas e peças **leem** esses campos (o placeholder
  da lista, os rótulos "Objeto" de `Formulario` e `Item`, "Fase N de M", o `aria-label` "Fases",
  "Contratação direta", "Documentos principais", os cartões do painel, o prefixo `PROC-2026-` do
  código e o responsável padrão dos dados de exemplo), então não se edita componente;
- `components/layout/navegacao.ts` (rótulos dos itens e grupos: "Biblioteca", "Quem está com o
  quê", "Processos do período", "Modelos do órgão", grupo "Repartição"), `App.tsx` (títulos das
  telas `EmConstrucao`) e `constants/process-status.ts` (rótulos das situações, já com
  concordância de gênero). Os endereços `/arquivo` de `Lista.tsx` e `Paineis.tsx` são texto
  fixo no código (o rótulo vem de `MARCA.campos.arquivo`);
- `components/mesa/ferramentas.ts` (rótulos das divisórias e das ferramentas: "Documentos do
  processo", "Autos para imprimir", "Histórico do processo", "Ficha do processo", "Prévia no
  Diário", "Repetir contratação"…); `utils/ferramentasMesa.ts` só tem funções e comentários de
  domínio (`SEM_RESPONSAVEL`, `LACUNA`…), sem rótulos de divisória;
- as fases e as `explicacao` de `fasesDaLicitacao.ts` (edital, sessão pública…) e o texto
  "Encerrad{GEN.fim} sem concluir" (`PastaDoProcesso.tsx`, `FasesEmBolinhas.tsx`, só com a
  concordância de gênero);
- frases com "prazos" e "encerrados": `pages/Agenda.tsx` (subtítulo "Os prazos são calculados a
  partir das datas…" e "informe a data para calcular os prazos"), `pages/Paineis.tsx`
  ("falta a data principal para calcular os prazos" e "concluído ou arquivado": os rótulos da tabela de situações no singular, sem plural automático);
  `features/processos/listaDeProcessos.ts` já só usa `MARCA` e `GEN` nos estados vazios;
  `components/layout/BuscaRapida.tsx` e `components/mesa/ConfirmarAto.tsx` têm textos de busca
  e de ato que citam o `objeto` (concordam por `GEN`) e a lei só com `leiAoLado` e `ARTIGOS`
  preenchido. `utils/prazosLicitacao.ts` traz títulos e fundamentos da lei, mas a base **não o
  importa** (só se você o mantiver e o usar);
- os dados inventados de `hooks/useMesaDados.ts` ("Contratação de serviço de limpeza predial",
  "Manutenção de veículos da frota", modalidades "Pregão Eletrônico" e "Dispensa de Licitação");
- **textos para quem desenvolve** que ficam visíveis ao usuário final: as telas
  `EmConstrucao`, `Item` (abas sem tela) e `Documento` agora dizem só "Esta tela/parte ainda
  não está disponível" (sem nome de componente); se escrever outro marcador de posição, não
  cite arquivos nem componentes na tela;
- `components/auth/MolduraDeEntrada.tsx` e `utils/markdown.ts` **não** têm texto de domínio
  fixo (a entrada lê `MARCA.entrada`; `markdown.ts` só cita o chat com IA em comentário).
**Hook de fronteira (regra do projeto onde a skill é usada, não da skill).** Alguns
repositórios têm um hook que recusa comandos de Bash por **texto**, sem olhar a pasta.
Já foram recusados: `cp`/`mkdir` cuja linha citava "src" ou "src/config"; `sed -i` e
`python` cujo texto citava `src/config/marca.ts`; um `grep` só de leitura que citava
`package.json`; e um `rm` de arquivo de projeto (noutras sessões `cp`, `mkdir`, `sed` e
até um `rm` passaram: o comportamento varia). Faça a leitura e a busca com Read/Grep/Glob
e as trocas e cópias com Edit/Write (copiar um arquivo = Read + Write), que não passam por
esse filtro. **Relate o bloqueio ao usuário e não tente burlá-lo**: não reescreva o comando
só para enganar o filtro e **não use um script `.sh` ou `.py` criado com Write para fazer
o que o hook recusou** (isso é contorno). Se uma cópia em massa for inviável sem Bash,
diga ao usuário e peça que ele rode o comando.

Perfis do modelo: `master` (equipe Evoluta — **não tem menu lateral, barra do celular nem
botão de menu/hambúrguer no celular**; só a faixa do alto, com o selo "PAINEL MASTER"),
`admin`, `gestor` e `operador`. No login de demonstração, o usuário digitado `admin`,
`master`, `operador` ou `gestor` entra com esse perfil e qualquer outro nome entra como
`gestor`. A lista `PERFIS_DE_DEMONSTRACAO` (em `contexts/AuthContext.tsx`, na ordem admin,
master, operador, gestor) e o mapa `DESCRICAO_DO_PERFIL` alimentam a **dica da tela de
login** (só em desenvolvimento; `components/auth/Login.tsx` a monta com `.map`, sem texto
fixo por perfil): para um perfil novo, acrescente o nome a `PERFIS_DE_DEMONSTRACAO` e uma
linha a `DESCRICAO_DO_PERFIL`, e a dica o cita sem tocar no `Login.tsx`. O tipo `Perfil`
mora no mesmo `AuthContext.tsx` (fonte única; `navegacao.ts` o importa e reexporta,
`ProtectedRoute` e `Unauthorized` também): troque a lista lá e os itens em `navegacao.ts`.
O nome legível de cada perfil ("administrador", "gestor"…) vem de `NOME_DO_PERFIL`, também em
`AuthContext.tsx`: a faixa do alto, a gaveta do celular e a tela `Unauthorized` o leem (na faixa e
na gaveta a primeira letra aparece maiúscula), então um perfil novo ganha também uma linha ali.
Para ver todos os itens do menu em teste, entre como `admin` — o `master` mostra só a faixa
do alto. Apague a dica junto com o login de demonstração. A frase "Ao entrar, você concorda
com os Termos de Uso e a Política de Privacidade" só aparece se `MARCA.links.termos` ou
`MARCA.links.privacidade` tiverem endereço (vêm vazios). Sem perfil master no sistema alvo, remova também o selo
e as condições do master: em `AppHeaderV3` são **renderizações condicionais** (`user?.role !==
"master" && (…)` em volta da gaveta do celular e do botão recolher/expandir, e
`user?.role === "master" && (…)` no selo "Painel Master"; não há `return null`), e em
`AppSidebarV3` e `BarraDoCelular` é um `if (userRole === "master") return null;` no começo.

**O menu esconde, a rota recusa**: o filtro do menu sozinho não impede quem digita a URL
(`/metrics`, `/templates`…). Por isso `App.tsx` envolve as rotas numa rota de layout
`<Route element={<RequerPerfil />}>` (`components/auth/RequerPerfil.tsx`), que lê o campo
`perfis` de `navegacao.ts` e manda para `/unauthorized` quem não tem o perfil: uma regra
só, no menu. Item novo com `perfis` já fica protegido; rota que não está no menu pode
usar `<ProtectedRoute allowedRoles={[…]}>` (`components/auth/ProtectedRoute.tsx`).
Endereço que não existe cai em `NotFound` (tela cheia, sem moldura), não em `/unauthorized`.

**Rotas do menu sem tela própria**: `/library`, `/planta`, `/livro-gestao`, `/templates`,
`/arquivo` e `/help` abrem `EmConstrucao` em `App.tsx`. Ao trocar o menu, troque ou
remova essas rotas junto; rota órfã é rota que ninguém linka, e link sem rota cai no 404.
**Checklist para remover um item de exemplo do menu** (ex.: `/library`, `/planta`,
`/livro-gestao`, `/templates`, `/arquivo`): (1) tire o item de `GRUPOS_DO_MENU` em
`navegacao.ts` (e o grupo, se ficar vazio); (2) tire a `<Route>` do mesmo caminho em
`App.tsx`; (3) procure o caminho por Grep em `src` e troque os links que apontam para ele
(`/arquivo` aparece em `Lista.tsx` e `Paineis.tsx`; `/help` na gaveta do celular e no botão de ajuda do `AppHeaderV3`);
(4) tire o `import` do ícone que sobrar em `navegacao.ts`; (5) confira `MARCA.destinosDoCelular`
e `acaoPrincipal.caminho`; (6) rode `npm run build`.

**Compilação de produção**: `.bilhete`, `.ficha`, `.folhinha` e `.bloco-espiral` vivem em
`@layer components`, e o Tailwind remove a classe que nenhum arquivo cita. O
`assets/tailwind.config.ts` traz um `safelist` com todas as classes de mesa, então elas
saem no build (a lista é de **nomes explícitos**, não regex; ela não gera aviso no
build). A base pura compila em ≈ 465 kB de JS (≈ 469 kB com `leiAoLado = true`) e ≈ 121 kB de CSS, sem aviso de tamanho; um sistema real, com
mais telas, pode passar de 500 kB e mostrar o aviso "chunks maiores que 500 kB" do Vite —
é aceitável (quebre em `import()` dinâmico por rota só se o cliente pedir). Um custo conhecido:
`TextoDoDocumento` (a peça que mostra o documento na tela) importa `utils/markdown.ts`, que
traz `marked` e `dompurify`; nenhuma tela da base o usa, então a base pura não os carrega, mas
um sistema que mostre documento com ele passa de 500 kB e vê o aviso de chunk (medido em
sistemas de teste: 530 a 540 kB). Toda classe nova que você criar em `@layer components` no `index.css` deve ser
**acrescentada a essa lista**. Rode `vite build` e confira que aparecem (checklist 07).
Divergências do original e o que não copiar dos `exemplos/`: `references/11`.

### Limites conhecidos da base — o que ainda exige edição de arquivo

A `MARCA` troca quase tudo, mas estes pontos só mudam editando o arquivo (conferidos no código):

- **Valor em reais.** `MARCA.campos.valor` só troca o **rótulo**; o campo `estimated_value` e a
  formatação em R$ continuam. Sistema sem valor edita: `components/mesa/PastaDoProcesso.tsx`,
  `pages/{Lista,Inicio,Item,Paineis,Formulario}.tsx`, `utils/{blocosDoItem,ferramentasMesa}.ts`,
  `features/processos/listaDeProcessos.ts`, `features/dashboard/formatos.ts`, `hooks/useMesaDados.ts`.
- **Rótulos da ficha.** "Ficha {código}", "Baixar a ficha (.docx)", "Abrir como documento" e
  "Ficha d{o/a} …" estão em `utils/blocosDoItem.ts` (`nomeDoDocumentoDoItem`) e `pages/Item.tsx`,
  fora da `MARCA`.
- **Agenda.** As regras dos 6 marcos (dias úteis, flag `legal`) ficam em `features/agenda/montarAgenda.ts`.
  O fundamento neutro "regra do exemplo" aparece na tela até você trocá-lo em `MARCA.campos.eventos`;
  `tipoDoEvento: "sessao"` é o marco que ganha a moldura azul; `ehContratacaoDireta`/`contratacaoDireta`
  mantêm um texto que nunca aparece.
- **Formulário e datas.** O `Formulario` da base só pergunta objeto e valor; `adicionarProcesso` aceita
  também `modality` e `opening_date` (vem em `dados`), e o item novo nasce sem agrupamento nem datas.
  Datas só-dia devem ser **locais**, não `toISOString().slice(0,10)` (UTC: à noite no Brasil vira "amanhã").
- **Documento.** `/documents/:id` com número de item que não existe mostra o documento de demonstração
  (só id inválido mostra "não existe"); trocar isso é decisão do sistema novo.
- **Divisórias novas.** Uma divisória/ferramenta nova abre "Esta parte ainda não está disponível" até
  você criar a tela; a base não traz modelo de aba.
- **`package-lock.json`** guarda o nome antigo do pacote até você rodar `npm install` no projeto novo.
- **Buscas de texto herdado.** A 1ª busca tem ruído por design (nomes de código); confie na 4ª.
- **Detalhes de redação** apontados na última auditoria (cerca de 17 itens menores) ficaram sem
  correção de propósito: não afetam o uso.
