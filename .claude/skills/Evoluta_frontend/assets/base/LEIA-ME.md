# assets/base — infraestrutura mínima para a Mesa de Trabalho Evoluta

Com esta pasta + `assets/components/**` + `assets/styles/index.css` +
`assets/tailwind.config.ts` + `assets/public/*` o projeto compila e abre, sem
nenhum import faltando. Tudo que depende de servidor é **stub** (dados de exemplo
inventados), para você trocar pelo sistema real.

**Este arquivo é só instrução para quem monta o projeto: NÃO o copie para dentro
dele.**

## 1. Mapa: de onde → para onde

| Origem (dentro da skill) | Destino no projeto novo |
|--------------------------|-------------------------|
| `assets/base/package.json`, `vite.config.ts`, `tsconfig.json`, `postcss.config.js`, `components.json`, `index.html` | raiz do projeto |
| `assets/base/gitignore.txt` | `.gitignore` (**renomear**: um arquivo chamado `.gitignore` dentro da skill seria tratado pelo git) |
| `assets/base/LEIA-ME.md` | **não copiar** |
| `assets/base/src/**` | `src/**` |
| `assets/styles/index.css` | `src/index.css` |
| `assets/tailwind.config.ts` | raiz (`tailwind.config.ts`) |
| `assets/public/*` | `public/` |
| `assets/components/layout/*` | `src/components/layout/` |
| `assets/components/mesa/*` | `src/components/mesa/` |
| `assets/components/auth/*` (`MolduraDeEntrada.tsx`) | `src/components/auth/` (junto de Login, ProtectedRoute e ResetPassword, que já vêm de `base/src/components/auth`) |

**Monte em pasta nova e vazia.** Copiar por cima de uma pasta que já tem trabalho
sobrescreve arquivos sem aviso (já aconteceu num teste).

Alias `@/` → `src/` já está em `tsconfig.json` e `vite.config.ts`.
`assets/exemplos/**` **não** entra no projeto: é referência de telas prontas
(ver `assets/exemplos/LEIA-ME.md`). Se for copiar algo de lá, instale antes
`@tanstack/react-query@^5.24.1` e `recharts@^2.15.4` (o `base` não traz nenhum dos
dois; `date-fns` não é usado em lugar nenhum).

## 2. Comandos e ambiente

```
npm install
npm run build      # = tsc --noEmit + vite build (não precisa rodar os dois à parte)
npm run dev        # http://localhost:8080
npx vite --port 8301 --strictPort   # outra porta, sem o Vite trocar sozinho
```

- Use `tsc --noEmit` (sem emitir arquivos); `tsc -b` também compila, mas deixa um
  `tsconfig.tsbuildinfo` na pasta, que não deve ir para o repositório.
- Node 18.18 ou mais novo (testado em 20 e 24). Porta **8080**; se estiver
  ocupada, o Vite sobe na seguinte (8081…) e avisa no terminal.
- O `vite build` sai **sem aviso de tamanho de chunk** (JS ≈ 465 kB, ≈ 469 kB com a lei ligada, abaixo do limite de
  500 kB; CSS ≈ 121 kB). Se você acrescentar telas e o aviso "Some chunks are larger than 500 kB"
  aparecer, é só aviso de tamanho: inofensivo, não é erro nem falha do build. Um custo
  conhecido: `components/mesa/TextoDoDocumento.tsx` (mostra o documento na tela) importa
  `utils/markdown.ts`, que traz `marked` e `dompurify`; nenhuma tela da base o usa, então a base
  pura não os carrega, mas um sistema que o use passa de 500 kB (530 a 540 kB em sistemas de
  teste) e mostra esse aviso.
- O aviso do npm "1 package has install scripts not yet covered by allowScripts:
  esbuild (postinstall)" é inofensivo: `dev` e `build` funcionam assim mesmo.
- Na primeira abertura a tela fica **em branco por 1 a 3 segundos** (só o fundo
  marfim/azul-noite) até carregarem as fontes e o `index.css`. Não é erro.
- Login de exemplo: qualquer usuário e senha com 3+ caracteres. O **nome** do
  usuário escolhe o perfil: `admin`, `master`, `operador` ou `gestor` entram com esse perfil;
  qualquer outro nome entra como `gestor`. Serve só para ver o menu de cada perfil.
  O `master` (equipe Evoluta) **não tem menu lateral, barra do celular nem botão de menu (hambúrguer)** — só a faixa do alto, com o selo "PAINEL MASTER";
  para ver menus entre como `admin`, `gestor` (qualquer outro nome) ou `operador`. A lista
  `PERFIS_DE_DEMONSTRACAO` (ordem: admin, master, operador, gestor) e o mapa
  `DESCRICAO_DO_PERFIL` ficam em `src/contexts/AuthContext.tsx` e **montam a dica da tela de
  login** (só em desenvolvimento; `Login.tsx` a monta com `.map`, sem texto fixo por perfil):
  para um perfil novo, acrescente o nome à lista e uma linha ao mapa. Apague a dica junto
  com o login de demonstração.
  O tipo `Perfil` fica no mesmo `AuthContext.tsx` (único lugar); `navegacao.ts` o importa e
  reexporta, e `ProtectedRoute` e `Unauthorized` também o importam. O nome legível de cada
  perfil vem de `NOME_DO_PERFIL` (também em `AuthContext.tsx`), lido pela faixa do alto, pela
  gaveta do celular e por `Unauthorized`: um perfil novo ganha uma linha ali também.

## 3. O que trocar para o sistema real

### 3.1 `src/config/marca.ts` (única fonte de nome, logo e textos do sistema)

| Campo | O que é |
|-------|---------|
| `nome` | nome curto do produto (faixa, login, rodapé do menu da gaveta) |
| `logo` | arquivo em `public/` (ver 3.2); começa em `/logo-produto-modelo.svg` |
| `inicio`, `inicioCurto`, `rotaInicial` | nome, nome curto (barra do celular e menu recolhido, cabe em ~90px) e rota da tela inicial ("Minha Mesa", "Mesa", `/dashboard`); `inicio` **não precisa ter gênero**: os textos dizem "Voltar para {inicio}" / "Ir para {inicio}", sem artigo; também **não precisa coincidir com o endereço** (a rota `/painel-geral` pode ter `inicio` "Visão geral" e `inicioCurto` "Geral"). `App.tsx` registra a rota com `rotaInicial` (o `index` redireciona para ela) e o menu, a barra do celular e os atalhos a leem de lá |
| `rotaDaLista` (constante `ROTA_DA_LISTA`), `atalhoDaLista` | endereço da lista do objeto principal (padrão `/processes`; o item é `${rotaDaLista}/:id/*`) e a letra do atalho Alt+letra que a abre (padrão `P`). `App.tsx`, o menu, a busca, as pastas e as telas leem daqui: troque **só** `ROTA_DA_LISTA` no topo de `marca.ts` (o padrão de `acaoPrincipal.caminho` e de `destinosDoCelular` acompanha) e confira com Grep por `"/processes"` em `src`: só `marca.ts` deve achá-lo |
| `frase`, `apoio`, `marcadores[3]`, `rodape`, `quemConvida` | textos do painel azul e do pé da tela de entrada |
| `links.{termos, privacidade}` | endereços dos documentos citados no pé da entrada; vazios (padrão) = a frase "Ao entrar, você concorda…" não aparece |
| `entrada.{rotulo, subtitulo, carimbo, carimboRodape}` | cartão marfim e carimbo "Uso restrito" |
| `equipeDeSuporte` | "avise {…}" nas mensagens de erro |
| `objeto.{singular, plural}` | como o sistema chama a pasta ("processo/processos") — usado em títulos, trilhas, buscas, `aria-label` das divisórias e acessibilidade |
| `objeto.genero` | `"m"` ou `"f"`: os textos concordam por ele pelo helper `GEN` do mesmo arquivo (`GEN.o`, `GEN.do`, `GEN.no`, `GEN.nenhum`, `GEN.fim`…); use `"f"` para "matrícula", "vistoria" |
| `objeto.{rotuloDaCapa, semDescricao, semNumero, semAgrupamento}` | textos da capa da pasta: linha acima do número ("Processo"), título sem descrição, item sem número e sem agrupamento ("Sem modalidade") |
| `campos.{objeto, agrupamento, data, semData, faltaData, valor, responsavel, fase, faseRotulo, faseEstimada, contratacaoDireta, contratacaoDiretaNota, documentos, criadoEm, ordemPorData, ordemPorValor, prazo, evento, tipoDoEvento, agenda, feriadoNota, paineisTrilha, paineisMontando, paineisSituacao, paineisPorSituacao, paineisTitulo, paineisApoio, resumoDoDia, arquivo, fases, prefixoDoCodigo, responsavelPadrao, rubrica}` | **rótulos dos campos do objeto** (valores de exemplo de licitação, todos a trocar): nome do texto do objeto, modalidade, data principal, valor, fase e "Fase N de M" (`fases` é o `aria-label` da lista de fases), nota do caso especial, quadro de documentos, "Autuado", ordenações da lista, legendas da agenda (`prazo` "Prazo", `evento` "Evento") e a nota do dia de folga (`feriadoNota`), nome da tela de agenda, as telas de painéis (`Paineis`: trilha, "Montando…", títulos das duas páginas, título e apoio), o bloco azul da Minha Mesa (`resumoDoDia`), a tela dos itens encerrados (`arquivo`), o prefixo do código e o responsável dos dados de exemplo (`prefixoDoCodigo` "PROC-2026-", `responsavelPadrao`) e a linha de assinatura dos documentos (`Rubrica`, "Nome e matrícula") |
| `campos.eventos.{publicacao, impugnacao, resposta, sessao, recurso, contrarrazoes}` | cada um `{ titulo, fundamento }`: os seis marcos que `montarAgenda.ts` cria, com o texto que o usuário lê e a regra que o justifica (o `fundamento` vai também para o `.ics`). **Os padrões da base são neutros** ("Abertura do prazo", "Evento principal", fundamento "regra do exemplo"); os de licitação (edital, impugnação, "art. 164") estão em `assets/exemplos/features/agenda/eventosDeLicitacao.ts` (`EVENTOS_DE_LICITACAO`, `LEGENDAS_DE_LICITACAO`). As chaves são os `tipo` dos compromissos: podem ser renomeadas se se renomearem juntos a chave, o `tipo` e o `...ev.<chave>` em `montarAgenda`, `TIPOS_DA_LICITACAO` e `campos.tipoDoEvento` |
| `leiAoLado` | `false` (padrão): sem gaveta "Lei ao lado" nem grupo "Na lei" na busca; `true` só com conteúdo em `features/lei/artigos.ts` |
| `acaoPrincipal.{rotulo, curto, caminho, atalho, sinonimos}` | botão azul do menu, 4º atalho do celular, item da busca e atalho Alt+letra. `caminho` é a rota do formulário de criação (padrão `${ROTA_DA_LISTA}/new`): `App.tsx` registra o `Formulario` nele (troque aqui e a rota acompanha). Evite uma letra de `atalho` igual a M, P ou A (início, lista, agenda): a ação principal vence o atalho fixo e um aviso sai no console em desenvolvimento |
| `destinosDoCelular` | os 3 primeiros destinos da barra do celular, **na ordem declarada** (cada caminho precisa existir em `navegacao.ts`) |
| `prefixoDeArmazenamento` | prefixo das chaves do navegador; use `chaveDoSistema("nome")` ao criar uma nova |
| `agenda.{dominio, produto}` | UID e PRODID do arquivo `.ics` |

A assinatura "Uma solução Evoluta" **não** entra aqui: é fixa.
Fora o `MARCA`, o que ainda tem nome de exemplo e precisa ser trocado:
`index.html` (`<title>` e a chave do tema no script anti-flash, marcados com "TROCAR") e
`package.json` (`name`).
A chave do tema é `chaveDoSistema("tema")` = `<prefixo>.tema` (em `ThemeContext.tsx`).
O script do `index.html` repete o valor à mão (`meu-sistema.tema`): ao trocar
`MARCA.prefixoDeArmazenamento`, troque também lá, senão a tela pisca no tema errado
ao abrir. O texto aparece **duas vezes** no `index.html` (no comentário e no script):
troque as duas (`replace_all`; um `Edit` pontual falha por "2 correspondências").

### 3.2 Logo

- PNG (ou SVG com o texto convertido em formas) com **fundo transparente**, texto claro
  (ele aparece sobre a faixa azul-noite; **não** pinte o fundo), proporção entre **2:1 e 4:1** (o `logo-produto-modelo.svg` é 4:1; o da Evoluta tem 480x120, também 4:1;
  o PNG de exemplo do produto original, 857x435, é ≈2:1).
- Aparece com altura `h-9` (celular), `sm:h-12` e `md:h-14`; a largura segue a
  proporção. Coloque em `public/` e aponte em `MARCA.logo`.
- `public/logo-produto-modelo.svg` é um modelo genérico (480x120) para o projeto
  abrir com algo no lugar; `public/licitars-logo.png` é só o exemplo (opcional) do produto
  de origem: **nenhum código o usa** e pode ser apagado (se o hook do repositório impedir
  o `rm`, ignore o arquivo ou esvazie-o por Write; não o referencie).
- `public/evoluta-logo.png` é o logo da assinatura Evoluta: não troque.

### 3.3 Stubs

| Arquivo | O que é hoje | Troque por |
|---------|--------------|-----------|
| `src/contexts/AuthContext.tsx` | login de exemplo guardado no navegador (chave `chaveDoSistema("sessao-demo")`) | autenticação real; mantenha `useAuth` → `{user, isAuthenticated, isLoading, login, logout}` |
| `src/services/api/client.ts` | `apiClient.post` falso (usado em ResetPassword) e `CLIENTE_DE_DEMONSTRACAO = true`. **A tela de recuperar senha não faz nada de verdade** (nenhum e-mail sai, nenhuma senha muda): enquanto a constante for `true`, `ResetPassword` mostra o aviso "Demonstração: nenhum e-mail é enviado e a senha não é alterada." para não enganar o usuário | cliente HTTP real; com o serviço de senha real ligado, ponha `CLIENTE_DE_DEMONSTRACAO = false` (o aviso some) |
| `src/constants/process-status.ts` | a **tabela única de situações** (`SITUACOES`: `label`, `color`, `tinta`, `encerrada`, `concluida`) + helpers (`ehSituacaoAtiva/Encerrada/Concluida`, `tintaDaSituacao`, `SITUACOES_ATIVAS/ENCERRADAS`, `getProcessStatusConfig`). Carimbo, lista, agenda, fases, ferramentas e painéis leem daqui | as situações do seu objeto: uma linha por situação (outros nomes que o servidor mande vão em `apelidos` na própria linha; `padrao: true` marca a situação para valor vazio; renomear ou trocar linhas não quebra o build); **nenhum componente precisa mudar** |
| `src/utils/blocosDoItem.ts` | `blocosDoItem(p)` monta o relatório do item (subtítulo = rótulo de `MARCA.campos`, texto = valor) e `nomeDoDocumentoDoItem(p)` ("Ficha {código}"): é o que a ficha baixada na pasta e a tela `/documents/:id` mostram | a leitura do documento real do servidor |
| `src/utils/baixarDocx.ts` | gera, no navegador, um **.docx real** (zip sem compressão + XML mínimo, sem dependência; o Word abre) com o título e o conteúdo de `blocos` (`BlocoDocx[]`: texto = parágrafo, `{ titulo }` = subtítulo; sem `blocos`, um parágrafo neutro "Documento sem conteúdo informado."). Exporta também `gerarDocx` e `blocosParaMarkdown` (mostra na tela o mesmo conteúdo) | download real do arquivo do servidor (`salvar(blob, nome)`); mantenha a assinatura `baixarDocx(id, nome, blocos?, titulo?)` (`titulo` = título impresso no arquivo; sem ele vale `nome`; `BaixarDocumento` repassa as duas props) |
| `src/pages/Formulario.tsx` | o "Salvar" chama `adicionarProcesso` (`useMesaDados.ts`), mostra o aviso "…Os dados ficam só nesta demonstração." e volta à lista: o item novo **aparece na lista, na busca e na agenda e abre no `Item`, mas só na memória** (some ao recarregar a página) | chamada à API real (receita 09 §6) |
| `src/hooks/useMesaDados.ts` | 5 processos inventados, com aberturas calculadas a partir de **hoje** (a agenda sempre mostra prazos no mês corrente), num **armazém em memória** (`useSyncExternalStore`) que `adicionarProcesso(dados)` alimenta; o item novo leva `created_at` e `updated_at` **de hoje** (o carimbo da capa mostra a data de hoje) | consulta real do objeto principal |
| `src/constants/index.ts` | `APP_VERSION = "0.1.0"` | versão real |
| `src/features/lei/*` | gaveta lateral "Lei ao lado" (domínio de licitação). **`artigos.ts` é NEUTRO na base**: `ARTIGOS` e `HIPOTESES_PRAZO` vazios, `LEI_NOME` "Norma de apoio", `LEI_LINK_OFICIAL` e `LEI_ROTA_DA_LISTA` `""`. O **resumo** (em linguagem comum, não o texto integral) dos artigos da Lei 14.133 está em `assets/exemplos/features/lei/artigos.ts` | nada, se o sistema não for de licitação: **`MARCA.leiAoLado` vem `false`**, então a gaveta não é montada (o `LeiAoLadoProvider` só repassa os filhos) e a `BuscaRapida` não mostra o grupo "Na lei" nem "…ou artigo da lei". Para um sistema de licitação, ponha `true` e copie o `artigos.ts` dos exemplos por cima (nele o link oficial se chama `LEI_14133_OFICIAL`, e a base só usa a função `linkOficial`, que ele também exporta, então a troca compila). Para outro domínio com conteúdo de apoio próprio, ponha `true` e preencha `ARTIGOS`, `LEI_NOME`, `LEI_LINK_OFICIAL` e `LEI_ROTA_DA_LISTA` (`""` esconde o link "Ver todos os artigos") em `artigos.ts`; com `true` e `ARTIGOS` vazio nada abre e o grupo "Na lei" some. `artigos.ts` **não se apaga** (a `BuscaRapida`, o `LeiAoLado` e `prazosLicitacao.ts` o importam); `HIPOTESES_PRAZO` só o `prazosLicitacao.ts` e `exemplos/pages/SimuladorPrazos.tsx` usam |
| `src/utils/prazosLicitacao.ts` | conta de prazos legais (domínio de licitação; reexporta `datas.ts`; lança erro explícito se `HIPOTESES_PRAZO` estiver vazia) | apague se não houver prazo legal; **mantenha** `src/utils/datas.ts` (feriados, dias úteis, formatação), que `ferramentasMesa`, `calendarioDoMes` e `montarAgenda` usam |
| `src/features/agenda/montarAgenda.ts` | prazos de licitação (`TIPOS_DA_LICITACAO`, `TipoDeCompromisso = string`) | **reescreva** com os compromissos do sistema (o tipo é livre); não apague: `Agenda`, `Paineis` e `CalendarioDeMesa` dependem dele |
| `components/mesa/fasesDaLicitacao.ts`, `FasesEmBolinhas.tsx` | exemplo de domínio (fases da licitação) | as fases do seu fluxo (o cabeçalho de `fasesDaLicitacao.ts` traz o bloco "MOLDE NEUTRO": pode haver qualquer número de fases, porque `ate()` limita os índices à última e a situação `concluida` da tabela (hoje `CONCLUIDO`) cai sempre nela; reescreva também os `if` e as `explicacao` de `situacaoDasFases`), ou passe `progresso={null}`, `aviso={null}` e `espessura={1}` à `PastaNaGaveta`. **`fasesDaLicitacao.ts` não se apaga**: `montarAgenda.ts`, `listaDeProcessos.ts`, `PastaDoProcesso.tsx`, `PastaNaGaveta.tsx` e `FasesEmBolinhas.tsx` o importam e o `tsc` quebra; reescreva ou neutralize (`ehContratacaoDireta` devolvendo `false`) antes de tirar os imports. **`FasesEmBolinhas.tsx` só é importado por `PastaNaGaveta.tsx`**: para apagá-lo, tire antes o import e o padrão do `progresso` dentro de `PastaNaGaveta.tsx` |
| `components/layout/navegacao.ts` | grupos e itens de exemplo ("Processos do período", "Modelos do órgão", "Quem está com o quê"…) | grupos e itens do sistema (ver `references/03`); única fonte dos menus |
| `src/pages/*` | telas de exemplo: Inicio (Minha Mesa), Lista (gaveta com divisórias, em `MARCA.rotaDaLista`, padrão `/processes`), Agenda (`/agenda`), Formulario, Item (pasta com divisórias, rota `${rotaDaLista}/:id/*`: a aba vem de `useParams()["*"]`; as que não têm tela caem em "Em construção" dentro da pasta), Documento (`/documents/:id`: se o id é o de um item, o relatório desse item montado por `blocosDoItem`; senão, conteúdo de demonstração neutro; o botão de baixar leva o mesmo conteúdo e o título da tela é o título do arquivo; mostra "Abrindo o documento…" enquanto carrega, tudo em `.area-impressao`; id que não é número mostra "Este documento não existe" e esconde o botão; a pasta tem o botão "Abrir como documento"), Paineis (`/metrics`, barras em CSS), Acessibilidade, EmConstrucao, NotFound, Unauthorized | as telas reais, mantendo a estrutura (ver receitas); rotas em `src/App.tsx`. Rotas sem tela própria (`/library`, `/planta`, `/livro-gestao`, `/templates`, `/arquivo`, `/help`) abrem `EmConstrucao`. **O menu esconde, a rota recusa**: `components/auth/RequerPerfil.tsx` é uma rota de layout em `App.tsx` que lê o campo `perfis` de `navegacao.ts` e manda para `/unauthorized` quem digita a URL de algo que o menu esconde dele (`/metrics`, `/templates`…). Item novo com `perfis` já fica protegido; rota que não está no menu pode usar `<ProtectedRoute allowedRoles={[…]}>`. Endereço que não existe cai em `NotFound` (tela cheia, sem moldura), não em `/unauthorized` |

Dados de exemplo são **inventados**; nunca coloque dado real no código.

Também vêm prontos, genéricos (sem licitação): `src/utils/ferramentasMesa.ts`
(`LACUNA`, `formatarMoeda`, `valorEmReais`, `dataDoRegistro`, `separarPecas`, `resumirLivro`,
`agruparPorResponsavel`…, os que os exemplos de livro, planta e autos importam) e
`components/mesa/PecasDosAutos.tsx` (`Rubrica`, `Linha`).

### 3.4 Pegadinhas conhecidas

- **Purga do Tailwind.** `.bilhete`, `.ficha`, `.folhinha`, `.bloco-espiral`, `.gaveta`… vivem em `@layer components`
  e o Tailwind remove a que nenhum `.tsx` cita. O `tailwind.config.ts` da skill traz um `safelist` com todas as de
  mesa, em **nomes explícitos** (não regex; o build não imprime aviso), então elas existem no build mesmo se você
  só as copiar de um HTML; se criar classe nova em `@layer components` no `index.css`, acrescente o nome ao `safelist`.
- **O 404 fica fora da moldura de propósito**: `path="*"` está fora da rota de layout em `App.tsx`. `/unauthorized`,
  `/login` e `/reset-password` também.
- **`ui/` não é o shadcn puro**: `table.tsx` (`min-w-[36rem]`, moldura fina com rolagem própria, sem zebra), `dialog.tsx`
  e `sheet.tsx` (o leitor de tela anuncia o botão de fechar como "Fechar", não "Close"), `breadcrumb.tsx` (reticências
  `Mais`) e `alert.tsx` (só a tela de entrada usa; em estado de tela use `AvisoDeEstado`/`MesaErroBusca`). Ao rodar
  `shadcn add` por cima, esses arquivos voltam ao padrão: recuse a sobrescrita.
- `Alert` aparece só em `Login.tsx` (erro) e `ResetPassword.tsx` (erro e sucesso): é a exceção da moldura de entrada.

## 4. Prova de funcionamento

Montado num projeto limpo pelo passo 0 do SKILL.md (Node 24, Windows): `npm install`
ok, `npm run build` (= `tsc --noEmit` + `vite build`) rc=0 (CSS ≈ 121 kB, JS ≈ 465 kB, sem aviso de chunk;
os 56 nomes do `safelist` aparecem no CSS gerado).

No navegador (Chrome), sem erros no console:

- `/metrics` (Paineis) com cartões e barras em CSS; `/processes/1` e as 7 divisórias
  (`documentos`, `autos`, `prazos`, `historico`, `edit`, `diario`, `repetir`) abrem
  dentro da pasta, nenhuma cai no 404.
- `/processes` a 1024 px (menu aberto) e a 400 px, e `/agenda`, `/metrics`,
  `/dashboard`, `/processes/1` a 400 px: sem rolagem horizontal; a capa da pasta
  tem 36 px de respiro no alto a 400 px (o clipe não cobre o título).
- `/agenda` abre no mês corrente (datas calculadas a partir de hoje).
- Formulário → Salvar → lista, com o aviso de demonstração exibido (nas rodadas seguintes
  o item criado passou a aparecer na lista e a abrir no `Item`, em memória).
- Tema escuro: cores computadas corretas em `/metrics`.
- `/agenda` a 1024 px com "Bem maior": sem rolagem horizontal (conferido no navegador).

Registro anterior (rodada 1):

- `/login`: painel azul com logo do modelo + assinatura Evoluta, folha marfim,
  carimbo "USO RESTRITO"; fundo marfim já aparece antes do React.
- Login → `/dashboard` (Minha Mesa) com data por extenso, `/processes` (lista com
  abas), `/agenda` (calendário de argolas + compromissos por semana + botão .ics),
  `/processes/new` (formulário), `/processes/1` (pasta aberta com divisórias e
  botão "Baixar a ficha (.docx)").
- Formulário → Salvar → volta à lista **com o aviso de resultado visível**
  (`avisar()` antes do `navigate()`).
- Tema escuro ok em todas as telas conferidas.
- Celular (400px, iframe): sem rolagem horizontal; gaveta azul abre com todos os
  grupos, tema, ajuda e Sair; tocar num item navega e a gaveta fecha.

Contraste das abas da pasta no tema escuro: já medido (6,51:1, passa AA). `/agenda` a 768 px
com "Bem maior": o botão ".ics" quebra a linha e a tela não rola para o lado (medido no
navegador). Contraste de campos e interruptor (`--input`: 3,79:1 claro e 3,07:1 escuro) e do
item selecionado da busca (4,83:1 claro e 6,75:1 escuro): **medidos no navegador** na rodada 11.
A sombra da `.folha` é sutil por desenho (`0 18px 40px -24px`, quase invisível sobre o azul-noite;
é o valor do original, não um defeito). A impressão a partir do tema escuro (fundo branco,
texto ≥ 4,5:1) foi conferida por emulação.
Não conferido: telas além das listadas, impressão real (só emulada), Tab real (o foco foi
verificado por `.focus()`) e o carimbo grande a 400 px em aparelho real.
