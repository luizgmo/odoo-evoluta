# 07 — Checklist: "está idêntico à mesa Evoluta?"

Marque só o que **você olhou** (rodando o sistema, nos dois temas). Relate o que
não foi possível conferir.

## Base
- [ ] As 4 fontes carregam (corpo Jakarta, títulos Cormorant, rótulos Barlow, números Plex Mono); nenhuma outra
- [ ] `index.css` com tokens `:root` e `.dark` idênticos aos da skill; tintas fora do `@layer`
- [ ] `tailwind.config.ts` expõe `moldura`, `gold`, `font-display/ui/mono`, `darkMode: ["class"]`
- [ ] Nenhum hex / `gray-*` / `slate-*` nas telas novas (`grep` por `#[0-9a-fA-F]{3,6}`, `bg-gray` e `\bslate-`; o `\b` evita o falso positivo de `translate-`)

## Moldura
- [ ] Faixa do alto azul-noite com: logo do produto · divisor · assinatura "UMA SOLUÇÃO Evoluta" · busca · tema · ajuda · avatar+nome/perfil
- [ ] Assinatura com o texto esticado até a largura do logo Evoluta
- [ ] Avatar **sem** borda dourada
- [ ] Botão recolher/expandir menu na faixa (≥ md); menu lateral azul, `w-64`/`4.25rem`, com tooltips recolhido
- [ ] Ação principal no alto do menu em azul de ação; item ativo com barrinha azul e `bg-moldura-2`
- [ ] Grupos com título em caixa-alta; pé com Acessibilidade
- [ ] Folha de conteúdo marfim sobre o azul: `mr-4/5`, cantos de cima arredondados, sombra; **só ela rola**
- [ ] **Sem rodapé; sem barra azul inferior no desktop**
- [ ] Celular: hambúrguer abre a gaveta com menu + conta + tema + ajuda + sair + versão; barra de 4 atalhos embaixo
- [ ] "Pular para o conteúdo" funciona; troca de rota volta ao topo da folha

## Entrada
- [ ] Painel azul à esquerda (logos, frase, 3 marcadores com ponto ouro, direitos) e cartão marfim à direita com carimbo "Uso restrito"
- [ ] < lg: só cabeçalho com logos + cartão; direitos embaixo

## Telas
- [ ] Toda lista/painel em `FolhaDaTela` (trilha + título serifado + ação à direita)
- [ ] Item aberto com divisórias em `PastaDoProcesso`; item simples/relatório em `MesaPagina` (cabeçalho da ferramenta marfim/ardósia + folhas subindo); documento (ler e baixar) em `FolhaDaTela`; nunca `MesaPagina` e pasta juntas (tabela em 05)
- [ ] Carregando / erro com "Tentar de novo" / vazio / conteúdo em todas as telas
- [ ] Carimbos com a tinta certa; só batem com ação ou, no máximo, uma vez por visita (`bateAoAbrir`: capa da pasta, login); nada anima de novo ao reabrir ou rolar a tela
- [ ] Botão que "faz o trabalho" (um por região) em `--cta` com texto branco; botões comuns (Salvar, Entrar) em `Button` padrão; nenhum botão de ouro sobre a folha clara
- [ ] Datas com folhinha de calendário (mês em carmim); notas/agenda em bloco de espiral; itens em pastas/gaveta/fichas quando for lista de "coisas de arquivo"
- [ ] Documento exibido em serifada, com botão **visível** "Baixar .docx"/equivalente

## Qualidade
- [ ] Tema claro conferido · Tema escuro conferido · ~400px conferido
- [ ] Teclado: tab percorre tudo com foco visível; botões só-ícone com `aria-label`
- [ ] Impressão: sem moldura, tema claro. A limpeza é **opt-in por tela**: só vale onde a tela envolve o conteúdo em `.area-impressao` (prop `imprimivel` da pasta/ficha; a tela `Documento` da base já vem envolvida); lista, painel e outras telas imprimem com a moldura. Quem quiser que uma tela imprima limpa envolve-a em `.area-impressao` (e marca o que não sai com `.nao-imprimir`)
- [ ] Preferências de leitura (texto maior, alto contraste, sem movimento) não quebram o layout
- [ ] Contraste AA: texto sobre o azul-noite é branco-marfim ou ouro (nunca cinza médio); texto sobre a folha é `foreground`/`muted-foreground`; selos e carimbos usam as `.tinta-*`; texto branco sobre `--accent`/`--cta` do tema claro mede ≥ 4,5:1 (o `--accent` da skill é `210 42% 46%`, não o 50% do original); bordas de campo e controles ≥ 3:1 (item "Contraste de componentes de interface", mais abaixo)
- [ ] Foco visível também nos links da `Trilha` e no "Pular para o conteúdo" (anel `ring-gold` ao receber foco)
- [ ] 400px: o clipe de papel da `.pasta-capa` não cobre o título; tabelas rolam por dentro de `overflow-x-auto` e a tela não ganha rolagem lateral
- [ ] 1024px (limite do menu fixo): menu e folha cabem sem rolagem horizontal. **Onde medir**: quem rola é o `main#conteudo` (`overflow:auto`), não a página; meça `document.querySelector("main#conteudo").scrollWidth <= clientWidth` **e** `document.documentElement.scrollWidth <= innerWidth`. Medir só a página deixa passar uma grade que estoura a folha (já aconteceu na Minha Mesa a 400px). No 1024px com o menu aberto, o título longo de um item aparece truncado com reticências por desenho; o `title` do elemento traz o texto completo
- [ ] Números grandes em Cormorant (cartões, resumo, painéis) levam a classe `lining-nums` do Tailwind na própria linha; sem isso o "1" parece "I" e o "6" desce da linha
- [ ] Grades de duas colunas têm coluna base `grid-cols-1` e só viram `lg:grid-cols-[…]` em tela larga (nunca `grid` puro com `lg:grid-cols-[17rem_minmax(0,1fr)]`)
- [ ] Marca do sistema novo: logo do produto em `public/logo-<sistema>.svg` (parta de `assets/public/logo-produto-modelo.svg`, proporção entre 2:1 e 4:1, pensado para fundo azul-noite), `MARCA.logo` apontando para ele, `name` do `package.json`, `<title>` do `index.html` e todos os campos de `MARCA` trocados (nada de "Meu Sistema Evoluta" nem "Licitars" na tela)
- [ ] Classes `.bilhete`, `.ficha`, `.folhinha`, `.bloco-espiral` aparecem no build de produção (rode `vite build` e abra o resultado, não só o `dev`): elas ficam em `@layer components` e o Tailwind as remove se nada no `content` as citar; o `safelist` de `assets/tailwind.config.ts` evita isso, por **nomes explícitos** (conferir que foi copiado e que o build sai sem aviso de classe; classe nova de `@layer components` entra na lista; ver 08). A base pura gera ≈ 465 kB de JS (≈ 469 kB com `leiAoLado = true`) e ≈ 121 kB de CSS sem aviso de tamanho; um sistema real com mais telas pode passar de 500 kB e mostrar o aviso "chunks maiores que 500 kB" do Vite: é aceitável, não é defeito da skill (usar `TextoDoDocumento`, que traz `marked` e `dompurify`, já leva o JS a 530–540 kB)
- [ ] O perfil de teste que administra (ex.: `admin`) vê todos os itens do menu; os demais perfis não veem o que não é seu; o `master` (se existir) mostra só a faixa do alto, sem menu lateral, sem barra do celular e **sem o botão de menu (hambúrguer) no celular**: a 400px o master não deve conseguir abrir a gaveta com o menu; o selo "PAINEL MASTER" fica **numa linha só** a 1024px (`whitespace-nowrap`) e some abaixo de `sm`
- [ ] **O filtro do menu não protege a rota.** Entre como `operador` e digite na barra de endereço uma rota que o menu esconde dele (ex.: `/metrics`, `/templates`): deve ir para `/unauthorized`, não abrir a tela. Quem recusa é `RequerPerfil` (rota de layout em `App.tsx`, lendo o campo `perfis` de `navegacao.ts`); item novo com `perfis` herda a proteção, e rota fora do menu usa `ProtectedRoute allowedRoles`. Endereço inexistente abre `NotFound` (não `/unauthorized`)
- [ ] Rotas órfãs: todo item de `navegacao.ts` tem rota em `App.tsx` (as sem tela abrem `EmConstrucao`), e nenhuma rota de exemplo que o seu menu não usa ficou esquecida (`/library`, `/planta`, `/livro-gestao`, `/templates`, `/arquivo` são **rotas de exemplo opcionais**: se o seu menu não tem o item, remova a rota junto; nenhuma é obrigatória)
- [ ] Texto herdado do domínio: rode as buscas da seção "Verificação final de textos herdados" do SKILL.md (as três de palavras e a **quarta, só de texto entre aspas ou JSX**, que ignora comentários e identificadores); nada de "Lei nº 14.133", "artigo da lei", "Na lei", "Licitars" ou "Meu Sistema Evoluta" na tela, a menos que o sistema seja de licitação
- [ ] Chave de tema: `ThemeContext.tsx` usa `chaveDoSistema("tema")` (= `<prefixo>.tema`) e o script anti-flash do `index.html` tem exatamente o mesmo texto; `MARCA.prefixoDeArmazenamento` foi trocado; as demais chaves do navegador também usam `chaveDoSistema(...)`
- [ ] `/agenda` com texto grande (preferência "texto maior" **e também "Bem maior"**, A++) a 400px, **a 768–810px** (menu fixo + A++: o botão ".ics" deve quebrar de linha em vez de passar da folha) **e** a 1024px: sem rolagem horizontal (`main#conteudo` e `documentElement`), sem a barra de rolagem de ~3px no bloco de espiral e com a coluna "Esta semana" legível (a grade usa `lg:grid-cols-[minmax(0,min(26rem,48%))_minmax(0,1fr)]`; com `minmax(0,26rem)` fixo o calendário esmagava a semana)
- [ ] Impressão (Ctrl+P ou emulação de mídia `print`) numa tela com `.area-impressao`: **sai** a folha (capa com título e número, conteúdo), em tema claro; **não sai** faixa do alto (`[data-moldura-faixa]`), menu, trilha, abas, botões, avisos (`.nao-imprimir`). O `<header>` interno da capa da pasta (com número e título) tem de sair: confira que ele aparece no papel. Numa tela sem `.area-impressao` (lista, painel) a moldura sai junto, por desenho
- [ ] Gaveta do celular **aberta de verdade** (a ~400px, toque no hambúrguer): menu, conta, tema, ajuda, sair e versão; fecha com Esc e ao escolher um item. Perfil `master` (login `master`): só a faixa do alto, com o selo "PAINEL MASTER", sem menu, sem barra do celular e **sem hambúrguer** (confira a 400px que não há botão "Abrir menu de navegação")
- [ ] Login com "texto maior" **e** "mais espaço entre as linhas" ligados: sem rolagem lateral; o cartão pode ganhar rolagem vertical (por desenho, a tela é mais alta que a janela)
- [ ] Abas da `Lista` (`DivisoriasDeFiltro`) a 400px com "texto maior": as abas **quebram para a linha de baixo** (`flex-wrap`) e o rótulo pode ter duas linhas (`whitespace-normal`): nenhuma aba fica cortada nem fora da tela ("Sem data de abertura", "Todos · 5" visíveis), e o contador ("· 4") não fica colado na borda de baixo da aba (`min-h`, `py-1.5`, `leading-snug`); sem rolagem lateral
- [ ] **Contraste de componentes de interface (WCAG 1.4.11, ≥ 3:1)**: borda de campo (`input`, `textarea`, `select`), botão secundário e trilha do interruptor desligado, nos dois temas, contra a folha (a skill usa `--input` claro `224 13% 54%` e escuro `222 16% 46%`; o fio de papel `--border` é suave de propósito e **não** serve de borda de campo). Item **selecionado** da busca (Ctrl+K): o texto de apoio tem de ficar legível sobre o fundo de realce (≥ 4,5:1)
- [ ] Impressão **a partir do tema escuro**: o papel sai com as cores do claro (nenhum texto `dark:text-accent` fica azul-claro sobre o branco; "Fase atual" e a bolinha "feita" legíveis) e o **fundo da página sai branco** (`html`/`body` com `background: #fff` no `@media print`: com "gráficos de segundo plano" ligado a margem não pode sair escura)
- [ ] Barras de rolagem **finas e nas cores do tema** (`scrollbar-width: thin` em todo elemento que rola) no menu lateral, na folha e na gaveta do celular, sem as setas largas do Windows; no menu e na gaveta (fundo azul-noite) vale `.rolagem-moldura` (trilha transparente, polegar claro)
- [ ] Documento: `/documents/<id de um item>` mostra o **relatório desse item** (rótulos de `MARCA.campos`) e o botão Baixar leva **o mesmo conteúdo**, com o título da tela igual ao do arquivo; id só de dígitos que não é de item mostra o conteúdo de demonstração neutro (sem "Troque este bloco…"); id que não é número, "Este documento não existe". O botão "Abrir como documento" da pasta leva a ele
- [ ] Item criado pelo Formulário: aparece na lista, na busca (Ctrl+K), na agenda (se tiver data) e abre no `Item`; o carimbo da capa mostra a **data de hoje** (não uma data fixa de exemplo); some ao recarregar (armazém em memória)
- [ ] Tela de recuperar senha mostra o aviso "Demonstração: nenhum e-mail é enviado e a senha não é alterada." enquanto `CLIENTE_DE_DEMONSTRACAO` for `true` (ela não faz nada de verdade); no sistema real, o serviço de senha é ligado e o aviso some
- [ ] Situação nova: com **uma linha nova** em `constants/process-status.ts` (e só ela), o carimbo, o selo, a lista, a agenda e as fases a reconhecem, com a tinta que a tabela declara (nenhum componente editado)
- [ ] Links sem classe própria ("Ver todos", códigos na Minha Mesa) recebem o anel de foco da moldura (`a:focus-visible`), não o `outline: auto` do navegador; ícones decorativos têm `aria-hidden="true"`; **um único `<h1>` por tela** (conte os `h1` em cada rota, incluindo 404 e `/unauthorized`; `AvisoDeEstado` dentro de `FolhaDaTela` usa `nivel={2}`)
- [ ] Carimbo grande (`.carimbo-grande`) a ~400px com "texto maior" ligado, **em aparelho real**: o carimbo AUTUADO girado passava uns 6px da folha e dava rolagem lateral de ~6px no `main#conteudo` (visto num iframe de 400px); a `.pasta-capa` agora tem `overflow-x: clip` e as rodadas de revisão com "Maior" e "Bem maior" não mediram rolagem, mas só em iframe. Na emulação por iframe, a captura de tela chegou a travar com o filtro SVG do carimbo; isso **não é defeito confirmado**, só um ponto a olhar num celular de verdade. Relate como "não conferido em aparelho" se não houver um à mão
- [ ] As divisórias da pasta (`DIVISORIAS_DO_PROCESSO`) abrem rota própria e a divisória acesa é a da rota atual
- [ ] Typecheck, lint, testes e build do sistema alvo passam (relate falha como falha). `assets/base/` traz só `typecheck` e `build`; **lint e testes não vêm na base**: são do projeto alvo (se o alvo não os tem, diga "não existe", não "passou")

## Formato de relato ao usuário
```
MESA EVOLUTA — <o que foi aplicado>
Onde:          <telas/arquivos>
Tema claro:    conferido | não conferido
Tema escuro:   conferido | não conferido
Largura ~400px: conferido | não conferido
Diferenças em relação ao LicitarsAI: <lista, ou "nenhuma">
Ficou pela metade / simulado: <lista, ou "nada">
```
