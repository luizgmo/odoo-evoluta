# 08 — Instalar a mesa em outro sistema Evoluta

## 0. Antes de começar
- Descubra a stack: `package.json` (React? Vite? Tailwind v3? shadcn?), rotas,
  autenticação, tema. Descubra se há regras do repositório (CLAUDE.md,
  fronteira de arquivos protegidos, hooks) e **obedeça-as**: nada de editar
  arquivos bloqueados nem de contornar guardas.
- Não commite/publique nada sem o usuário pedir.

## 0b. Atalho para projeto novo: `assets/base/`
Para um sistema que ainda não existe, não monte a infraestrutura à mão: copie
`assets/base/` (projeto Vite completo, versões exatas, `ui/` do shadcn, tema,
login, rotas de exemplo, stubs de dados) e depois `assets/styles/index.css`,
`assets/tailwind.config.ts`, `assets/public/*` e `assets/components/{layout,mesa,auth}`.
O mapa arquivo→destino, os comandos e a lista de stubs a substituir estão em
`assets/base/LEIA-ME.md`. Esse conjunto foi **compilado e aberto no navegador**
(tsc limpo, `vite build` ok, login + moldura + pasta aberta nos temas claro e escuro).
Depois, monte as telas pelas receitas (`09-receitas-de-telas.md`), com os textos de
`10-estados-e-microcopy.md` e os modelos de leitura de `assets/exemplos/`.
Paleta de gráficos: `assets/exemplos/theme/tokens.ts` (`chart`) — leve só as cores de
gráfico, não os tokens antigos do LicitarsAI.
Em projeto que já existe, siga os passos abaixo.

Tudo o que muda de um sistema Evoluta para outro vem de **um só arquivo**:
`src/config/marca.ts` (`MARCA`). Campos: `nome`, `logo`, `inicio` (nome da tela
inicial; **não precisa ter gênero**: os textos dizem "Voltar para {inicio}" e "Ir para
{inicio}", sem artigo; **também não precisa coincidir com o endereço**: a rota `/painel-geral`
pode ter `inicio: "Visão geral"` e `inicioCurto: "Geral"`), `inicioCurto` (o mesmo nome para a barra do celular e o menu
recolhido, cabe em ~90px), `rotaInicial` (`App.tsx` registra a tela inicial nela e o
`index` redireciona para ela; o menu, a barra do celular e os atalhos a leem daqui), `rotaDaLista` (constante `ROTA_DA_LISTA`
no topo do arquivo: o endereço da lista e do item, `${rotaDaLista}/:id/*`; troque só ela) e `atalhoDaLista`
(a letra do Alt+letra que abre a lista), `frase`, `apoio`, `marcadores` (3), `rodape`, `quemConvida`,
`links {termos, privacidade}` (endereços citados no pé da entrada; vazios = a frase "Ao
entrar, você concorda…" não aparece),
`entrada {rotulo, subtitulo, carimbo, carimboRodape}` (cartão do login), `equipeDeSuporte`, `objeto {singular, plural, genero, rotuloDaCapa, semDescricao, semNumero,
semAgrupamento}` (`genero` é `"m"` ou `"f"`: "o processo" / "a ordem de serviço"; rótulo
acima do número na capa da pasta e os textos de "sem objeto descrito", "sem número" e
"sem modalidade"), `campos {objeto, agrupamento, data, semData, faltaData, valor, responsavel,
fase, faseRotulo, faseEstimada, contratacaoDireta, contratacaoDiretaNota, documentos, criadoEm,
ordemPorData, ordemPorValor, prazo, evento, tipoDoEvento, agenda, feriadoNota, paineisTrilha,
paineisMontando, paineisSituacao, paineisPorSituacao, paineisTitulo, paineisApoio, resumoDoDia,
arquivo, fases, prefixoDoCodigo, responsavelPadrao, rubrica, eventos}` (rótulos dos
campos do objeto, as telas de painéis, o bloco da Minha Mesa, a tela dos encerrados, o código e o
responsável dos dados de exemplo, a linha de assinatura dos documentos e os seis marcos da agenda; ver abaixo), `leiAoLado` (liga ou desliga a "Lei ao lado"; padrão `false`),
`acaoPrincipal {rotulo, curto, caminho, atalho, sinonimos}` (`caminho` é a rota do formulário
de criação: `App.tsx` registra o `Formulario` nele; troque aqui e a rota acompanha; evite um
`atalho` M, P ou A, que são fixos: a ação principal vence e um aviso sai no console em
desenvolvimento), `destinosDoCelular` (3 rotas, na ordem em que aparecem na barra),
`prefixoDeArmazenamento` e `agenda {dominio, produto}`. Faixa do alto, menu, barra do
celular, busca, atalhos, entrada e agenda leem dele: **edite o arquivo, não os
componentes**. Só `AssinaturaEvoluta` é fixa e não entra em `MARCA`.

**Gênero do objeto.** Os textos que citam o objeto ("Nenhum processo encontrado", "Este
processo", "não encontrado", "Excluir o…", "Buscando o…") concordam pelo gênero: o arquivo
`config/marca.ts` exporta `GEN` (`GEN.o`/`GEN.os`, `GEN.um`, `GEN.do`, `GEN.este`/`GEN.Este`,
`GEN.deste`, `GEN.nenhum`/`GEN.Nenhum`, `GEN.todos`/`GEN.Todos`, `GEN.O`, `GEN.algum`,
`GEN.deles`, `GEN.fim` = vogal final de adjetivo/particípio, e as contrações `GEN.do`/`GEN.dos`
(de + o), `GEN.no`/`GEN.nos` (em + o), `GEN.pelo`/`GEN.pelos`, `GEN.ao`; todos os membros: `o os um
do dos no nos pelo pelos ao deles algum este deste nenhum todos O Este Nenhum Todos fim`). Para objeto feminino
("ordem de serviço", "matrícula"), ponha `genero: "f"` e escreva frases novas com `GEN`, nunca
com "o"/"este" fixos: `` `${GEN.Nenhum} ${MARCA.objeto.singular} encontrad${GEN.fim}` ``. Atenção
à contração: "datas de a matrícula" sai de `de ${GEN.o}`; use `${GEN.do}`.
Frases da base que citam o objeto já passam por `GEN`, mas **texto masculino fixo escapa**
(já saiu "todos" para matrículas): depois de trocar `genero`, rode
`grep -rnE "Nenhum|Este |todos|encontrad|ados\b|deles|Encerrad|Arquivad|Conclu[ií]d|Abert[oa]s?\b" src`
e confira cada acerto que fale do objeto. Os rótulos de situação ("Aberto", "Concluído",
"Arquivado", "Encerrado sem concluir") vêm de `constants/process-status.ts`,
`PastaDoProcesso` e `FasesEmBolinhas`: troque-os pelos do seu objeto no mesmo gênero.

**Rótulos dos campos (`MARCA.campos`).** Os rótulos que a base usa para os campos do objeto
(valores de exemplo de licitação, **todos a trocar**): `objeto` ("Objeto": o rótulo do texto do
objeto no formulário, na ficha e no placeholder da busca da lista), `faseRotulo` ("Fase": "Fase 3 de 7"),
`faseEstimada` ("Fase estimada pelas datas"), `contratacaoDireta` ("Contratação direta") e
`contratacaoDiretaNota` (a frase que explica o caso), `documentos` ("Documentos principais": quadro
na capa) e `eventos` (`publicacao`, `impugnacao`, `resposta`, `sessao`, `recurso`, `contrarrazoes`, cada
um `{ titulo, fundamento }`: os seis marcos que `montarAgenda.ts` cria; **os padrões da base são
neutros** ("Abertura do prazo", "Evento principal", fundamento "regra do exemplo"; o `fundamento` vai
também para o .ics, "Fundamento: …"), e os de licitação ficam em
`assets/exemplos/features/agenda/eventosDeLicitacao.ts`); além de `agrupamento` ("Modalidade"), `data`
("Abertura"), `semData` ("Sem data de abertura"), `faltaData` ("Falta a data de abertura"),
`valor` ("Valor estimado"), `responsavel`, `fase` ("Fase atual"), `criadoEm` ("Autuado"),
`ordemPorData` ("Próxima abertura"), `ordemPorValor` ("Maior valor"), `prazo` ("Prazo"),
`evento` ("Evento"), `tipoDoEvento` (`"sessao"`: o valor de `tipo` do compromisso
que `evento` rotula e que ganha a moldura dupla azul no calendário), `agenda` ("Prazos e
agenda": nome do item de menu, da tela, do atalho e parte do `PRODID` do .ics), `feriadoNota`
("feriado: não conta como dia útil", legenda do calendário), `paineisTrilha` ("Painéis"),
`paineisMontando`, `paineisSituacao` e `paineisPorSituacao` (títulos e estado de carregando de
`Paineis`), `resumoDoDia` (bloco azul da Minha Mesa), `arquivo` ("Arquivo": a tela dos encerrados, no
menu e nos links), `fases` (o `aria-label` da lista de fases da pasta, "Fases"), `prefixoDoCodigo`
("PROC-2026-") e `responsavelPadrao` (os dados de exemplo de `useMesaDados.ts`). Quem os lê:
`PastaDoProcesso`, `PastaNaGaveta`, `FasesEmBolinhas`, `ResumoDaPasta`, `Lista`, `listaDeProcessos.ts`,
`Inicio`, `Item`, `Formulario`, `Agenda`, `Paineis` (`paineisTrilha`, `paineisMontando`,
`paineisSituacao`, `paineisPorSituacao`, `paineisTitulo` e `paineisApoio`), `PecasDosAutos`
(`rubrica`), `CalendarioDeMesa` (`feriadoNota`, `prazo`, `evento`), `navegacao.ts` (`arquivo`,
`paineisTrilha`, `agenda`), `AuthContext` (`paineisTrilha`), `useMesaDados.ts` (`prefixoDoCodigo`,
`responsavelPadrao`), `preferencias.ts` e `montarAgenda.ts` (o `PRODID` do .ics e os seis marcos de
`eventos`). As **chaves** de
`eventos` são os `tipo` dos compromissos e podem ser renomeadas se se renomearem juntos a
chave, o `tipo` e o `...ev.<chave>` em `montarAgenda`, `TIPOS_DA_LICITACAO` e
`campos.tipoDoEvento`; para outro domínio, reescreva `montarAgenda` (o tipo é texto livre).

## 1. Dependências (stack de referência)
Node **18.18 ou mais novo** (20 e 24 testados com a base; Vite 6) e npm.
```
react react-dom react-router-dom typescript vite
tailwindcss tailwindcss-animate class-variance-authority clsx tailwind-merge
lucide-react @radix-ui/* (via shadcn: button, sheet, tooltip, dropdown-menu, dialog, alert-dialog, command, input, textarea)
@fontsource/plus-jakarta-sans @fontsource/cormorant-garamond @fontsource/barlow-semi-condensed @fontsource/ibm-plex-mono
```
Tailwind **v3** (o `tailwind.config.ts` da skill é v3). Em v4, traduza as cores e
fontes para `@theme`, mantendo os mesmos nomes de classe.

**Extras, só se a tela usar** (versões do projeto de referência; `assets/base/package.json`
traz as versões exatas do que já vem pronto):
- `recharts ^2.15.4` — gráficos (rosca, barras; ver 09 §13.6);
- `date-fns ^3.3.1` — **opcional e não usado por nada em `assets/`** (a base formata datas
  com `utils/datas.ts` e `toLocaleDateString`); só instale se as suas telas o usarem;
- `@tanstack/react-query ^5.24.1` — só se o sistema real buscar dados por ele; os
  modelos de `assets/base` usam `hooks/useMesaDados.ts` e não precisam dele.
- Em projeto novo, `npm install` pode listar avisos de `npm audit` e do `postinstall`
  de `esbuild`: o `vite build` funciona assim mesmo. Não rode `npm audit fix --force`.
  Os 9 avisos de `npm audit` da base (braces/micromatch/chokidar e `postcss-selector-parser`,
  que vêm do Tailwind 3, mais o `react-router` 6) **não são defeito da skill, mas o risco é
  real para o `react-router`**: ele roda no navegador do usuário final (aviso de redirecionamento
  aberto) e a correção exige subir de versão maior. Diga isso ao usuário; o projeto alvo
  decide o upgrade (a skill não o faz sozinha). Veja 11, seção "Dependências da base".

## 2. Passos

1. **Fontes**: instale os 4 pacotes e importe os pesos listados em
   `01-tokens-e-tipografia.md` antes de `index.css`.
2. **CSS**: copie `assets/styles/index.css` inteiro para `src/index.css` (importe-o
   uma vez em `main.tsx`; é o que
   `assets/base` faz e o que foi provado). Se precisar fundir com CSS existente, os
   blocos que importam são: tokens `:root`/`.dark` + `@layer base` (linhas 1–353:
   cores, fontes, `body`, títulos, `a:focus-visible`, barras de rolagem finas),
   `::selection` e impressão geral (≈ 719–768) e
   **toda a mesa (≈ 771–1565, até o fim do arquivo)**: tokens `--mesa-*`/`--tinta-*`
   (`@layer base`, ≈ 771–820), `@layer components` da mesa (≈ 822–1375), tintas dos carimbos,
   pasta-capa e clipe **fora** do layer (≈ 1377–1435), impressão das ferramentas
   (≈ 1437–1511), campos nativos e preferências de leitura (≈ 1513–1552) e a
   `.rolagem-moldura` (≈ 1554–1565). O trecho
   ≈ 363–711 (`card-dashboard`, `glass-*`, `gradient-*`, `card-navy*`, `chat8-*`,
   `nav-link`, `status-badge`) é legado do LicitarsAI: **não o leve** para um
   sistema novo, a menos que alguma tela copiada o use. Números de linha são
   do arquivo desta versão da skill (1565 linhas) e envelhecem; localize pelos
   comentários de cabeçalho (`Workspace Evoluta`, `Tintas dos carimbos FORA do @layer`,
   `Impressão das ferramentas`, `Preferências de leitura`).
3. **Tailwind**: copie/mescle `assets/tailwind.config.ts` (cores `moldura`, `gold`,
   fontes, raios, keyframes, `darkMode: ["class"]` e o **`safelist`** das classes de
   mesa, em nomes explícitos — sem ele o build de produção pode remover `.bilhete`, `.ficha`,
   `.folhinha`…; classe nova em `@layer components` entra na lista).
   Mantenha `content` do projeto.
4. **Logos**: copie `assets/public/*` para `public/`. O logo do produto alvo vai num arquivo
   novo, `public/logo-<sistema>.svg` (ou PNG), partindo de `logo-produto-modelo.svg` (fundo
   transparente, letras claras, proporção entre 2:1 e 4:1, pensado para o azul-noite), e
   `MARCA.logo` aponta para ele. **`logo-produto-modelo.svg` traz o texto "Meu Sistema"**: se
   ficar na pasta `public/`, não é usado depois que `MARCA.logo` aponta para o seu logo, mas
   apague-o (ou esvazie-o, se o hook barrar o `rm`) para não vazar o nome de exemplo.
   `licitars-logo.png` é só um **exemplo opcional** (o logo do
   produto de origem): nada o usa, pode ser apagado ou ignorado. Mantenha `evoluta-logo.png`
   como está.
5. **Moldura**: copie `assets/components/layout/*` para `src/components/layout/`.
6. **Mesa**: copie `assets/components/mesa/*` para `src/components/mesa/`.
7. **Entrada**: copie `assets/components/auth/MolduraDeEntrada.tsx`.
8. **Tema**: garanta um `ThemeProvider`/`ThemeToggle` que ponha/retire a classe
   `dark` em `<html>` e guarde a escolha.
9. **Rotas**: a casca (`AppLayoutV3`) é um *layout route* com `<Outlet />`; as
   telas entram dentro dela; login/recuperação ficam fora, em `MolduraDeEntrada`.

## 3. O que trocar em cada arquivo copiado

| Arquivo | Dependência do LicitarsAI | O que fazer |
|---------|---------------------------|-------------|
| `AppLayoutV3.tsx` | `destinoDoAtalho` (`features/preferencias`), `AvisosDeResultado`, `LeiAoLadoProvider`, `useAuth` | Remover `LeiAoLadoProvider` e `AvisosDeResultado` se não houver; reescrever `destinoDoAtalho` (Alt+letra → rota) ou remover os atalhos; manter `useAuth` do sistema |
| `AppHeaderV3.tsx` | `useAuth`, `ThemeToggle`, `APP_VERSION`/`APP_GIT_SHA`, `MARCA` (nome, logo, rota inicial), `/help` | Edite `config/marca.ts` e `constants`; não mexa no arquivo; manter estrutura, classes e ordem |
| `AppSidebarV3.tsx` | `navegacao.ts`, `MARCA` | Não mexa no arquivo: rótulo, atalho e rota da ação principal vêm de `MARCA.acaoPrincipal`; os itens vêm de `navegacao.ts` |
| `navegacao.ts` | itens do LicitarsAI | Trocar grupos/itens/perfis (ver 03); o tipo `Perfil` vem de `contexts/AuthContext.tsx` |
| `BarraDoCelular.tsx` | `MARCA` | Não mexa no arquivo: os 3 destinos vêm de `MARCA.destinosDoCelular` (use rotas que existam no menu) e a ação "Nova …" de `MARCA.acaoPrincipal` |
| `BuscaRapida.tsx` | `useProcessosDaMesa`, `ARTIGOS`, `useLeiAoLado` | Trocar a fonte de dados ou remover esses grupos |
| `useMenuLateral.ts` | `lerPreferencias` | Se não houver preferências, remova a leitura e comece aberto |
| `Mesa.tsx` | `getProcessStatusConfig` (`constants/process-status.ts`), `tocarBatida` (som) | Trocar a **tabela de situações** em `process-status.ts` (3b.3), não o componente; remover o som se não houver preferência de som |
| `PastaNaGaveta.tsx` / `PastaDoProcesso.tsx` / `ProcessoNaMesa.tsx` / `ResumoDaPasta.tsx` | tipo `Process`, `fasesDaLicitacao`, `listaDeProcessos` | São específicos de licitação: use como **modelo** de pasta para o objeto principal do sistema alvo (ex.: contrato, ocorrência, cliente), preservando classes e estrutura. Os `aria-label` de `PastaDoProcesso` ("Divisórias {do|da} {objeto}", "Ferramentas {deste|desta} {objeto}") já usam `MARCA.objeto.singular`; o `aria-label` da lista de fases vem de `MARCA.campos.fases` ("Fases"; troque lá, sem editar o componente). Os rótulos dos campos da capa e da gaveta vêm de `MARCA.campos` (lista acima), inclusive "Contratação direta" (e a nota), "Fase N de M", "Fase estimada pelas datas" e "Documentos principais"; continua fixo no código só "Encerrad{GEN.fim} sem concluir" (já com concordância de gênero). Lista completa do que carrega domínio: seção "Trocar de domínio" do `SKILL.md` |
| `ferramentas.ts` (`components/mesa/`) | divisórias e ferramentas da pasta (`DIVISORIAS_DO_PROCESSO`, `FERRAMENTAS_DO_PROCESSO`, `caminhoDaAba`) | Troque as listas pelas divisórias/ferramentas do objeto do sistema alvo, mantendo a forma `{ caminho, curto, rotulo }` (ver 09 §7 e 10 §6) |
| `CalendarioDeMesa.tsx` | `features/agenda/*` | Reutilizar o visual (`BlocoEspiral`, `Folhinha`); trocar a origem dos eventos. Props para não editar o componente: `tipoEmDestaque` (o `tipo` de compromisso que ganha a moldura dupla azul; padrão `MARCA.campos.tipoDoEvento` = `"sessao"`), `rotuloPrazo` (padrão `MARCA.campos.prazo` = "Prazo") e `rotuloDestaque` (padrão `MARCA.campos.evento` = "Evento"); a nota do dia de folga vem de `MARCA.campos.feriadoNota`: troque tudo **em `MARCA.campos`** (ou por prop numa tela). Os valores "Prazo legal" e "Sessão" são do exemplo de licitação (`LEGENDAS_DE_LICITACAO` em `assets/exemplos/features/agenda/eventosDeLicitacao.ts`) |
| `MolduraDeEntrada.tsx` | `MARCA` (logo, frase, apoio, marcadores, rodapé) | Edite `config/marca.ts`; o arquivo não precisa mudar |
| `AssinaturaEvoluta.tsx` | nenhuma | **Não mexer** |

`@/lib/utils` (`cn`) e os componentes `ui/` são os de shadcn padrão.

## 3b. Do domínio de licitação ao seu domínio

A mesa não depende de "licitação": depende de **um objeto principal que vira pasta**.

1. Em `config/marca.ts`, preencha `objeto` e `acaoPrincipal` ("Novo contrato",
   "Nova ocorrência"…). Textos de tela usam o substantivo: ver 10, "ajuste o substantivo".
2. **Menu**: edite `components/layout/navegacao.ts` — grupos (título em caixa-alta),
   itens (rótulo, rota, ícone lucide, perfis que veem). Mantenha de 2 a 4 grupos e
   1–3 itens de pé (Acessibilidade). Rota nova → rota correspondente em `App.tsx`.
   `BarraDoCelular` lê `MARCA.destinosDoCelular`: use rotas que existam no menu.
3. **Situações**: `constants/process-status.ts` tem **uma tabela só** (`SITUACOES`), com
   uma linha por situação: `label`, `color` (selo), `tinta` (do carimbo; pela coluna
   "situação do item" da tabela de tintas em 05), `encerrada` (sai de "ativos" e da agenda)
   e `concluida` (encerrada concluindo o fluxo: as fases ficam todas "feitas"). Carimbo
   (`CarimboSituacao`), lista (`listaDeProcessos`), agenda (`montarAgenda`), fases
   (`fasesDaLicitacao`), ferramentas e painéis leem **daí** (via `ehSituacaoAtiva`,
   `ehSituacaoEncerrada`, `ehSituacaoConcluida`, `tintaDaSituacao`, `SITUACOES_ATIVAS`,
   `SITUACOES_ENCERRADAS`): situação nova com tinta própria = **uma linha nova na tabela**,
   e, se o servidor mandar outro nome para ela, esse nome entra no campo `apelidos` da própria
   linha; `padrao: true` marca a situação usada para valor vazio/desconhecido. Renomear,
   remover ou acrescentar linhas **não exige editar mais nada** em `process-status.ts` (o
   fallback e os apelidos são derivados da tabela); não edite `Mesa.tsx`, `PastaDoProcesso` nem `PastaNaGaveta`
   (`TINTA_POR_SITUACAO` não existe mais; a prop `tintas` de `CarimboSituacao` só sobrepõe
   a tinta numa chamada isolada). Troque também os rótulos pelos do seu objeto no mesmo
   gênero.
4. **Fases/divisórias da pasta**: troque `fasesDaLicitacao` pelas etapas do seu
   objeto (3 a 7; cada uma com rótulo curto) — ver 09 §7.
5. Sem lei ao lado, sem prazos legais, sem `.docx`? Remova `LeiAoLado*` (e o
   `LeiAoLadoProvider` do `AppLayoutV3`), `utils/prazosLicitacao.ts` e `BaixarDocumento`
   das telas. (Se o hook do projeto barrar o `rm`, por exemplo por o caminho citar `src`, **esvazie o
   arquivo** trocando o conteúdo por `export {};` com Write/Edit e relate o bloqueio ao usuário; não
   crie script `.sh` para contornar.) Na base, **`MARCA.leiAoLado` já vem `false`**: o provider só repassa os filhos e a
   `BuscaRapida` não mostra o grupo "Na lei" nem "…ou artigo da lei"; deixe assim se o seu
   sistema não tem lei ao lado. O `features/lei/artigos.ts` da base é **neutro** (`ARTIGOS` e
   `HIPOTESES_PRAZO` vazios; o resumo da Lei 14.133, não o texto integral, está em `assets/exemplos/features/lei/artigos.ts`).
   Para ligar com outro corpus: `leiAoLado: true`, preencha
   `ARTIGOS`, `LEI_NOME` (rótulo "… · ao lado" e texto copiado: "art. N — {LEI_NOME}"), `LEI_LINK_OFICIAL` e, se
   houver página com a lista, `LEI_ROTA_DA_LISTA` (`""` = sem o link "Ver todos os artigos"), tudo em
   `features/lei/artigos.ts` (com `true` e `ARTIGOS` vazio nada abre e o grupo "Na lei" some). Mexa em `useLeiAoLado` só se remover o recurso. O arquivo `features/lei/artigos.ts`
   **fica** enquanto algo importar `ARTIGOS` ou `HIPOTESES_PRAZO` (este só é importado por
   `prazosLicitacao.ts` e `exemplos/pages/SimuladorPrazos.tsx`). `utils/datas.ts` (feriados,
   dias úteis, formatação) é genérico: **mantenha** — `ferramentasMesa`, `calendarioDoMes`
   e `montarAgenda` importam dele. `montarAgenda.ts` se **reescreve** para os compromissos
   do seu objeto (não se apaga: `Agenda`, `Paineis` e `CalendarioDeMesa` dependem dele).
6. **Dados**: `hooks/useMesaDados.ts` e `services/api/client.ts` são stubs com dados
   inventados; troque pela API real mantendo o formato `{count,next,previous,results}`
   se o backend usar paginação.

### Rodando pela primeira vez
- O Vite sobe em `http://localhost:8080` (`vite.config.ts`); se a porta estiver
  ocupada, ele **usa a seguinte** (8081…) e avisa no terminal — olhe o endereço impresso.
  O `vite.config.ts` fixa só `port: 8080` (sem `strictPort`). Para escolher a porta e falhar
  se ela estiver ocupada: `npx vite --port 8301 --strictPort`.
- Primeira carga em branco quase sempre é import faltando: abra o console do
  navegador e rode `npx tsc --noEmit`.
- Login do modelo: qualquer usuário e senha com 3+ caracteres (ver `contexts/AuthContext.tsx`;
  só em desenvolvimento, `VITE_LOGIN_TESTE_USUARIO` / `VITE_LOGIN_TESTE_SENHA` no `.env` local,
  fora do git, pré-preenchem os campos);
  o usuário `admin`, `master`, `operador` ou `gestor` entra com esse perfil e qualquer outro
  como `gestor` (útil para ver o menu de cada perfil). Para ver **todos** os itens do menu,
  entre como `admin`; o `master` mostra só a faixa do alto. A tela de login traz uma dica
  **só em desenvolvimento**, montada de `PERFIS_DE_DEMONSTRACAO` e `DESCRICAO_DO_PERFIL`
  (ambos em `AuthContext.tsx`: perfil novo = um nome na lista e uma linha no mapa; o
  `Login.tsx` não precisa mudar); apague a dica junto com o login de demonstração. Troque pela
  autenticação real.
- Produção: o Tailwind remove classes de `@layer components` que o `content` não cite
  (`.bilhete`, `.ficha`, `.folhinha`, `.bloco-espiral`). O `tailwind.config.ts` da skill
  já traz um `safelist` com as classes de mesa, em **nomes explícitos** (não regex), e o
  build não imprime aviso; se você criar classe nova em `@layer components` no
  `index.css`, acrescente o nome à lista do `safelist` e rode `vite build` para conferir.
- A base já traz `${MARCA.rotaDaLista}/:id/*` (padrão `/processes/:id/*`; `pages/Item.tsx`, pasta com divisórias; a aba vem de
  `useParams()["*"]` e as que não têm tela caem em "Em construção" dentro da pasta),
  `/documents/:id` (`pages/Documento.tsx`: se o id é o de um item, a folha mostra o **relatório
  desse item**, montado por `blocosDoItem` em `utils/blocosDoItem.ts` com os rótulos de
  `MARCA.campos`; senão, um conteúdo de demonstração neutro; em qualquer caso o botão "Baixar o
  documento (.docx)" leva o mesmo conteúdo e o título da tela é o do arquivo; id que não é
  número = "Este documento não existe"; a pasta (`Item.tsx`) tem o botão "Abrir como documento"),
  `/agenda` (`pages/Agenda.tsx`), `/acessibilidade`, `/metrics` (`pages/Paineis.tsx`,
  barras em CSS) e `/dashboard` (`pages/Inicio.tsx`, versão **enxuta**: sem linha do
  tempo, sem atalhos e sem os estados de carregando/erro — para esses, veja 09 §1 e
  10); as demais rotas do menu abrem `EmConstrucao`. Rotas em `src/App.tsx`.

## 4. Quando o sistema alvo não é React/Tailwind

Preserve: tokens (valores HSL), famílias de fonte, medidas da moldura (ver 02),
estrutura HTML (faixa → [menu + folha] → barra do celular), classes de mesa,
logos e assinatura. Reescreva só a cola do framework (rotas, estado, tema).

## 5. Ao terminar

1. Rode o sistema, abra o login e uma tela de cada tipo (lista, item aberto, formulário, vazio, erro).
2. Percorra `07-checklist-de-conferencia.md` nos dois temas e em ~400px.
3. Rode typecheck/lint/testes/build do sistema alvo. A base da skill só traz os scripts
   `typecheck` e `build`; lint e testes existem apenas se o projeto alvo os tiver — se
   não existirem, diga "não existe", não "passou".
4. Relate ao usuário no formato do checklist, em português simples.
