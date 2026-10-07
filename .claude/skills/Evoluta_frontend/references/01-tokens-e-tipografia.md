# 01 — Tokens de cor, tipografia, raios e sombras

A fonte da verdade é `assets/styles/index.css` (blocos `:root` e `.dark`, e o
bloco "MESA DE TRABALHO"). Esta página é o guia de leitura; **na dúvida, vale o CSS**.

Todos os tokens são **canais HSL crus** (`42 42% 95%`), usados como
`hsl(var(--x))` ou, via Tailwind, `bg-background`, `bg-[hsl(var(--cta))]`.
Cada token tem par claro (`:root`) e escuro (`.dark`).

## Tokens principais

| Token | Claro | Escuro | Papel |
|-------|-------|--------|-------|
| `--background` | 42 42% 95% (marfim `#F8F5EE`) | 224 35% 12% (`#141A2A`) | Folha / fundo da área de conteúdo |
| `--foreground` | 226 38% 16% (noite `#192038`) | 40 10% 96% | Texto |
| `--card` | 0 0% 100% | 224 33% 16% (`#1B2236`) | Cartão/papel branco |
| `--primary` | 220 50% 28% (`#243C6B`) | 211 47% 45% | Ação institucional, link no claro |
| `--secondary` | 217 49% 35% (`#2E4F85`) | 225 28% 28% | Ação secundária |
| `--muted` | 40 28% 89% | 226 30% 21% | Fundo suave |
| `--muted-foreground` | 224 17% 43% | 222 20% 70% | Texto de apoio |
| `--accent` | 210 42% 46% (`#4475A7`; texto branco sobre ele = 4,8:1, AA) | 210 55% 62% (`#6A9DD0`) | Realce, foco, link no escuro |
| `--destructive` | 0 59% 27% (`#6E1C1C`) | 0 62.8% 30.6% | Excluir/erro |
| `--card-foreground`, `--popover(-foreground)` | = `--foreground` / `--card` | idem | shadcn |
| `--primary-foreground`, `--secondary-foreground`, `--destructive-foreground` | branco (claro) | `--primary-foreground` branco; os outros 40 10% 96% | Texto sobre o par |
| `--accent-foreground` | branco | **227 44% 8% (escuro)** | No tema escuro o realce `--accent` leva texto **escuro** |
| `--border` | 41 22% 81% (`#D9D2C3`) | 227 30% 24% (`#2B3350`) | Fio de papel: bordas de folha, cartão e divisória (suaves de propósito) |
| `--input` | 224 13% 54% (`#7A8399`: 3,46:1 sobre o marfim, 3,79:1 sobre o branco) | 222 16% 46% (`#636E88`: 3,40:1 sobre o fundo, 3,07:1 sobre o card) | **Borda de campo, botão secundário e trilha do interruptor desligado**: componente de interface precisa de ≥ 3:1 (WCAG 1.4.11), por isso é mais escuro que `--border` (divergência registrada em 11); no alto contraste `224 25% 45%` / `222 20% 70%` |
| `--ring` | = accent (46%) | = accent | Anel de foco (o `--sidebar-ring` também) |
| `--moldura` | 227 42% 19% (`#1C2545`) | 227 44% 8% (`#0B0F1C`) | **Faixa do alto, menu lateral, borda da mesa** |
| `--moldura-2` | 225 43% 24% (`#233057`) | 225 36% 15% (`#181F34`) | Item aceso do menu |
| `--moldura-foreground` | branco | branco | Texto sobre a moldura |
| `--gold` | 39 44% 51% (`#B8924A`) | igual | Ouro (ver regras) |
| `--cta` | 211 45% 45% (`#3F72A8`) | igual | **Botão de ação**, texto branco |
| `--sidebar-*` (`background, foreground, primary, accent, border, ring`) | branco/noite | 225 34% 14% | shadcn sidebar. **O menu lateral da mesa NÃO os usa** (é `bg-moldura`); ficam só por compatibilidade |
| `--radius` | 0.5rem | igual | Base dos raios `lg/md/sm` |

Tailwind: `bg-moldura`, `bg-moldura-2`, `text-moldura-foreground` (aceitam
`/opacidade`: `bg-moldura-foreground/10`), `text-gold`, `bg-gold`.

> **`Button` padrão ≠ `--cta`.** O `Button` shadcn (`variant="default"`) usa
> `bg-primary text-primary-foreground`. O azul de ação `--cta` só aparece quando se
> escreve a classe (`bg-[hsl(var(--cta))] text-white hover:brightness-90`; **nunca** `hover:bg-[hsl(var(--cta)/0.9)]`, que clareia o fundo e derruba o contraste do texto branco abaixo de 4,5:1)
> ou usa `<Button variant="cta">` (variante equivalente de `ui/button.tsx` da base)
> — convenção da mesa para o botão que **gera/faz o trabalho** (ex.: "Gerar"),
> um por região, e o botão de ação do alto do **menu lateral** e da barra do celular
> ("Nova …"). Os demais botões principais dentro da folha ("Salvar", "Entrar",
> "Criar") são `Button` padrão (`primary`). Tamanhos do `Button`: `default h-10 px-4`,
> `sm h-9 px-3`, `lg h-11 px-8`, `icon h-10 w-10`.

## Tokens da mesa

| Token | Papel |
|-------|-------|
| `--mesa-tampo` | tampo da mesa (= background) |
| `--mesa-papel` / `--mesa-papel2` | folha (= card) / folha mais clara (43 57% 98% → 225 31% 19%); fundo de régua de busca e de cartões laterais |
| `--mesa-linha` / `--mesa-linha2` | linhas e bordas de papel / fio mais suave |
| `--mesa-texto2` | texto secundário de papel (`.mesa-apoio`, `.tinta-grafite`, dia da semana da folhinha) — 223 20% 36% → 221 22% 72% |
| `--mesa-noite` / `--mesa-noite-texto` / `--mesa-noite-apoio` | **cabeçalho da ferramenta** (`.mesa-faixa`): fundo, texto e texto de apoio. **Atenção:** no Workspace essa faixa é **marfim** no claro (42 42% 95% / texto noite 226 38% 16% / apoio 224 17% 43%) e **ardósia escura** no escuro (224 35% 12% / 40 10% 96% / 222 20% 70%) — **não é** a faixa azul-noite do alto (essa é `--moldura`). O nome é herdado da versão antiga |
| `--tinta-azul` 232 51% 42% · `--tinta-verde` 150 55% 27% · `--tinta-carmim` 354 66% 38% · `--tinta-ocre` 36 77% 31% · `--tinta-violeta` 268 43% 44% | Tintas de carimbo. **No escuro:** azul 234 83% 83%, verde 145 47% 68%, carmim 354 76% 78%, ocre 40 72% 67%, violeta 266 69% 81% |
| `--mesa-gaveta` | fundo da gaveta de arquivo e do tampo (41 28% 88% → 224 38% 9%) |
| `--mesa-contorno` | contorno de pasta e de folha solta (40 20% 72% → 227 28% 32%) |
| `--mesa-pauta` | linha de caderno (221 50% 87% → 225 22% 27%) |
| `--mesa-metal` | espiral e clipe (224 15% 55% → 222 15% 62%) |
| `--mesa-sombra` | sombra das folhas (226 38% 16% → preto) |
| `--mesa-bilhete` / `--mesa-bilhete-texto` | post-it (50 85% 82% `#F7E9A8`, texto 44 80% 15% → escuro: 48 40% 28%, texto 48 60% 90%) |

### Variáveis auxiliares de status e legado

| Variável | Claro | Escuro | Uso |
|----------|-------|--------|-----|
| `--color-status-success` | `#1a5c38` | `#10b981` | **Usada**: `text-[color:var(--color-status-success)]` |
| `--color-status-warning` | `#7a4a10` | `#f59e0b` | **Usada**: **borda de aviso no claro** (`border-[color:var(--color-status-warning)]`); no escuro troque por `dark:border-gold` |
| `--color-status-error` | `#6e1c1c` | `#ef4444` | **Usada**: número em alerta (`text-[color:var(--color-status-error)]`) |
| `--color-status-info` | `#1a3870` | `#3b82f6` | informativo (raro) |
| `--color-bg-*`, `--color-border-*`, `--color-accent-*`, `--color-text-*` | marfim/branco/fio/noite… | ardósia | **Legado**: espelham os tokens principais; não use em tela nova |
| `--main-bg`, `--sidebar-bg`, `--card-bg`, `--border-color`, `--accent-blue(-dark/-light)`, `--text-*` | alias dos `--color-*` | idem | **Legado** (nomes antigos) |
| `--navy-500…900`, `--platinum-50…500`, `--steel-300…500` | superfícies/texto (platinum é **invertido** por tema) | | **Legado** (`bg-navy-800`, `text-platinum-100`…). Telas novas nunca. Se copiar um exemplo que as usa (legenda do `StatusDonut`: `text-platinum-*`), troque por `text-foreground` / `text-muted-foreground` |
| `--glass-bg`, `--glass-border` | tint escuro 4%/8% | branco 5%/10% | **Legado** (`.glass-*`); não levar |
| `--scrollbar-track` / `--scrollbar-thumb` | 40 28% 89% / 224 17% 43% | 226 30% 21% / 227 25% 34% | barras de rolagem |
| `--font-body/-display/-ui/-mono` | | | famílias; **usadas pelo CSS da mesa** (`font-family: var(--font-display)`), então **precisam existir** |

### Variáveis inline (NÃO estão no CSS; quem usa o componente define no `style`)

| Variável | Quem define | Efeito |
|----------|-------------|--------|
| `--giro` | `Carimbo`, `.ficha`, `.cal-marca` (`style={{ "--giro": "-3deg" } as React.CSSProperties}`) | inclinação (padrão `-2deg` carimbo, `0deg` ficha, `-4deg` marca de calendário). Carimbo: derivado do texto (`giroDoTexto`), estável por palavra |
| `--pos` | `PastaNaGaveta` (`posicao % 3`) | escalona a orelha: `left = pos × (--larg-orelha + .6rem) + 1.75rem` (limitado a `100% − 7rem`) |
| `--larg-orelha` | `.pasta-gaveta` (padrão `11rem`) | largura base da orelha no escalonamento |
| `--espessura` | `PastaNaGaveta` (cresce com o conteúdo) | folhas visíveis por baixo da pasta (`× 3px`) |
| `--recuo` | `.bloco-notas` (`2.4rem`; `4.6rem` ≥ 640px) | recuo da margem vermelha do caderno |
| `--filtro-tinta` | `Carimbo grande` (`url(#id)`) | filtro SVG de tinta falhada, um por carimbo grande |

### Tintas utilitárias (`.tinta-*` fora do `@layer`)

`.tinta-azul/verde/carmim/ocre/violeta/grafite` (cor de texto da tinta) ficam **fora do
`@layer`** no CSS de propósito (`index.css` ≈1372–1377): o Tailwind descartaria classes
montadas em runtime (`` `tinta-${tinta}` ``). **Não as mova para dentro de um `@layer`.**
As `.borda-tinta-ocre` e `.borda-tinta-carmim` (cor de borda) são diferentes: ficam
**dentro** de `@layer components` (`index.css` ≈1035–1036) e por isso o `safelist` do
`tailwind.config.ts` as lista pelo nome, junto das `tinta-*`, para não sumirem no build.

Escalas legadas `navy-*`, `platinum-*`, `steel-*` e `--color-*` (variáveis no
`index.css`; `navy-*`, `platinum-*` e `steel-*` também no `tailwind.config.ts`) existem só por
compatibilidade com telas antigas. O grupo `licitars-*` (`bg-licitars-dark`…) **foi
removido** do `tailwind.config.ts` desta skill. **Telas novas não usam nenhuma dessas
escalas.**

## O que cada classe da mesa faz (`assets/styles/index.css`)

| Classe | O que faz | Observações |
|--------|-----------|-------------|
| `.mesa` | fundo `--mesa-tampo` + texto `--foreground` | raiz de `MesaPagina` |
| `.mesa-faixa` / `.mesa-faixa-apoio` | cabeçalho da ferramenta: fundo/texto `--mesa-noite*` (marfim no claro, ardósia no escuro) | dentro dela `.carimbo` ganha fundo de papel |
| `.mesa-apoio` | texto secundário `--mesa-texto2` | |
| `.mesa-linha` | `border-color: --mesa-linha2` (fio suave) | use junto de `border-t` |
| `.mesa-rotulo` | Barlow 600, 13px, `letter-spacing .01em`, **sem** caixa-alta | rótulo de campo/coluna |
| `.mesa-secao` | Barlow 500, 20px, linha 1.2, cor `--foreground` | título de seção "letra de ficha"; sub-seção: some `text-base` |
| `.documento-oficial` | Cormorant 500, 18px/1.6, `lining-nums` | texto que vai para o processo |
| `.texto-do-documento` | Markdown renderizado como no papel (h1–h6, ul/ol, strong, blockquote, hr, pre, table, td, th) | usado por `TextoDoDocumento` |
| `.mesa-titulo` | título de ferramenta: `--font-display`, 600, linha 1.08 | |
| `.folha` | papel com 2 folhas aparecendo por baixo (sombras sobrepostas), borda `--mesa-linha`, raios `4 10 10 10` | |
| `.folha-simples` | papel liso, borda, raio 10px | cartões, caixas de formulário |
| `.folha.folha-furada` + `::before` | `padding-left 2.75rem` e furos de pasta na margem | precisa de **duas classes** no seletor para vencer `p-*` |
| `.carimbo` | `inline-flex`, borda dupla 3px, Barlow 700, 12px, caixa-alta, `.14em`, gira por `--giro`, máscara de ruído | pequeno (`:not(.carimbo-grande)`): 11px, `.12em`, **sem** máscara, opacidade 1 |
| `.carimbo-grande` | 15px, borda 4px, `.18em`, `filter: var(--filtro-tinta)`, `mix-blend-mode: multiply` (`screen` no escuro) | |
| `.carimbo-datado` (+ `-miolo`, `-data`, `-rodape`) | protocolo: contorno externo 3px sólido + miolo com contorno 1px; data em mono | |
| `.carimbo-bate` | animação `carimbo-bate` 520ms (desce girando, amassa, assenta) | desligada por `prefers-reduced-motion` e `pref-sem-movimento` |
| `.borda-tinta-ocre/-carmim` | `border-color` da tinta | com `border-dashed` para avisos |
| `.folhinha` (`> b`, `> span`, `> small`) | calendário de parede 52px: mês em faixa carmim, dia 22px/300, dia da semana 11px | |
| `.etiqueta-pasta` | etiqueta mono 13px com borda de cima azul 3px | número do processo |
| `.margem-registro` | margem vermelha à esquerda (livro de registro) | |
| `.gaveta` | gaveta de arquivo: fundo `--mesa-gaveta`, sombra interna, `gap 2.1rem` | |
| `.pasta-gaveta` / `.pasta-orelha` / `.pasta-corpo` / `.pasta-lombada` | pasta com orelha escalonada, corpo, lombada listrada | ver `--pos`, `--espessura`, `--larg-orelha` |
| `.bloco-espiral` / `.espiral` (`> i`) | bloco preso por argolas (`i` = argola) | `BlocoEspiral` gera as `<i>` |
| `.bloco-notas` / `.bloco-notas-titulo` | caderno com margem vermelha; título cobre a margem no alto | |
| `.linha-de-caderno` | `border-bottom: 1px solid --mesa-pauta` | |
| `.cal-marca` / `.cal-marca-quadro` | círculo (prazo) / moldura dupla (sessão) em tinta, em volta do dia | `currentColor`: pinte com `tinta-*` |
| `.ficha` | ficha de fichário: cabeçalho carmim, furo, linhas, gira por `--giro` | `min-height: 13rem` |
| `.bilhete` | post-it amarelo com fita, gira −1° | **um por tela** |
| `.tampo-vista` | tampo visto de cima (fundo `--mesa-gaveta`, sombra interna) | área da linha do tempo |
| `.mesa-un` | papel solto, raio 8px, sombra curta | cartão sobre o tampo |
| `.pilha-folha` | folha absoluta atrás de outra | |
| `.livro-aberto` (`.livro-pagina`, `.livro-pagina-esq`) | duas páginas; dobra no meio ≥ 1024px | |
| `.pasta-capa` *(fora do layer)* | folhas por baixo da capa do processo (usa `--card`/`--border`) | `overflow-x: clip`: o carimbo girado da capa não cria rolagem lateral; abaixo de `md`, `padding-top: 2.25rem` |
| `.clipe-de-papel` *(fora do layer)* | clipe de metal; dentro de `.pasta-corpo` vai para a direita | |
| `.area-impressao`, `.nao-imprimir`, `.quebra-pagina`, `.sem-quebra` | impressão (ver 05 e 09) | no `@media print` o escuro vira claro |
| `html.pref-*` | preferências de leitura | `texto-menor` 93,75% · `texto-maior` 112,5% · `texto-grande` 125% (mudam o `font-size` da raiz; tudo é `rem`) · `links` (sublinha) · `entrelinha` (1,8) · `sem-movimento` · `alto-contraste` (escurece/clareia `--muted-foreground`, `--border`, `--input`; carimbo sem máscara) |
| `.logo-adaptive` | inverte logo claro→escuro no tema claro | só para logo fora da faixa azul |
| `.eyebrow` e `h1…h6.uppercase` | trocam para `--font-ui` com `letter-spacing .06em` | regra global (`@layer base`) |
| `h1…h4`, `.font-display`, `.font-serif` | `font-variant-numeric: lining-nums` (números alinhados; a Cormorant desenharia "antigos") | `h1–h4` já saem em `font-display` por padrão |
| `.dark { color-scheme: dark }` | campos nativos (data, rolagem) acompanham o escuro | |
| `::selection` | fundo `accent/25%` | |
| `@media print` global | em **qualquer** tela, `html.dark`, `html.dark body` e `html.dark .dark` (o div que o App repete em volta das telas) voltam para os tokens claros (`--background`, `--card`, `--muted`, `--accent`, `--border`, `--mesa-*`, `--tinta-*`…, para `dark:text-accent` não sair a ~2,8:1 e as folhas não saírem escuras com texto navy); `html` sempre `background: #fff` (com "gráficos de segundo plano" ligado a margem da página não sai escura); nas telas com `.area-impressao`, `body` também | |
| `::-webkit-scrollbar*` (Chrome/Edge/Safari) e, só no Firefox (`@supports not selector(::-webkit-scrollbar)`), `* { scrollbar-width: thin }` + `html { scrollbar-color }` (`@layer base`) | barras de rolagem finas, nas cores `--scrollbar-track`/`--scrollbar-thumb` do tema, **sem as setas ▲▼** (`::-webkit-scrollbar-button { display: none }`) | no Chrome 121+ `scrollbar-color` desliga os `::-webkit-scrollbar` (e com eles o esconder das setas), por isso as propriedades padrão ficam só para quem não conhece o pseudo-elemento |
| `.rolagem-moldura` *(fora do layer)* | polegar `--moldura-foreground` a 35% e trilha transparente (`::-webkit-scrollbar*`; `scrollbar-color` só no Firefox) | menu lateral e gaveta do celular (fundo azul-noite) |
| `a:focus-visible` (`@layer base`) | anel de 2px em `--ring`, `outline-offset: 2px` | links sem classe própria ("Ver todos", códigos); quem define `focus-visible:outline-none` + `ring` continua mandando |

Animações (`tailwind.config.ts`): `animate-fade-in` (0,3 s, sobe 10 px), `fade-out`,
`scale-in`, `pulse-glow`, `slide-in`, `accordion-*`; `animate-spin` vem do Tailwind.

**Mapa de linhas de `index.css` (conferido na versão atual, 1565 linhas; envelhece —
localize pelos comentários de cabeçalho):** tokens `:root`/`.dark` 10–230 · barras de
rolagem finas (`::-webkit-scrollbar*` sem setas; `scrollbar-color`/`scrollbar-width` só no Firefox)
≈232–267 · base global (cor, headings, `a:focus-visible`, `.eyebrow`) ≈308–361 · legado
`glass/gradient/card-navy/chat8` ≈363–711 · `.logo-adaptive`/`::selection`/impressão global
≈719–768 · **mesa:** tokens (`@layer base`) ≈771–820, classes (`@layer components`)
≈822–1375, tintas/pasta-capa/clipe (inclui o `@media (max-width: 767px)` da capa) ≈1377–1435,
impressão da mesa ≈1437–1511, `color-scheme`/preferências de leitura ≈1513–1552,
`.rolagem-moldura` (barra do menu e da gaveta) ≈1554–1565.

## Dependências além do CSS

- Radix via shadcn: `Button, Sheet, Tooltip, DropdownMenu, Dialog, AlertDialog, Command, Input, Textarea, Select, Switch, Tabs, Badge, Label, Alert`.
- `react-router-dom`, `lucide-react` sempre; **opcionais, só se a tela usar**: `recharts` (gráficos), `@tanstack/react-query` (versões em 08 §1).
- `@/theme/tokens` (`useThemeTokens`, lê `useTheme`; modelo em `assets/exemplos/theme/tokens.ts`) devolve **cores em JS** para
  gráficos recharts (que não leem CSS vars): paleta categórica Okabe–Ito
  `#0072B2 #E69F00 #009E73 #D55E00 #56B4E9 #CC79A7 #F0E442`; claro: fundo `#F8F5EE`,
  cartão `#FFFFFF`, texto `#192038`, texto-suave `#5A6480`; escuro: os equivalentes do
  tema escuro (`#141A2A`, `#1B2236`, `#F5F5F0`, `#A5AEC4`). Campos que o gráfico usa:
  `bgCard`, `border`, `text`, `textMuted`, `chart[]` (a paleta categórica). Se o sistema alvo não tem
  esse módulo, crie-o com esses valores.
- Fontes @fontsource (ver abaixo).

## Tipografia — cada família tem um papel

| Classe | Família | Onde |
|--------|---------|------|
| `font-sans` | Plus Jakarta Sans 300/400/500/600/700 | corpo, interface (o 300 é importado pelo `index.css`) |
| `font-display` (= `font-serif`) | Cormorant Garamond 500/600/700 | títulos de tela, saudação, **texto de documento** |
| `font-ui` | Barlow Semi Condensed 500/600/700 | rótulos em caixa-alta, carimbos (700, importado pelo `index.css`), títulos de grupo do menu |
| `font-mono` | IBM Plex Mono 400/500 | número de processo/código/protocolo/hora |

Instalação (npm): `@fontsource/plus-jakarta-sans`, `@fontsource/cormorant-garamond`,
`@fontsource/barlow-semi-condensed`, `@fontsource/ibm-plex-mono`. Importar na
entrada do app **antes** de `index.css`:

```ts
import "@fontsource/plus-jakarta-sans/400.css"; // 500, 600, 700
import "@fontsource/cormorant-garamond/500.css"; // 600, 700
import "@fontsource/barlow-semi-condensed/500.css"; // 600 (o carimbo usa 700)
import "@fontsource/ibm-plex-mono/400.css"; // 500
```

No `assets/styles/index.css` as duas primeiras linhas já fazem `@import` de
`plus-jakarta-sans/300.css` e `barlow-semi-condensed/700.css`; os demais pesos entram
pelo `main.tsx` da base. Copiando o `index.css` e o `main.tsx`, todos os pesos
(300 e 700 incluídos) carregam sem mais nada; num `main.tsx` próprio, importe-os todos.

Fontes servidas pelo próprio sistema (não por CDN): órgão público costuma ter
rede restrita.

Padrões de texto usados nas telas:
- Título de tela (saudação/hero): `font-display text-4xl md:text-5xl font-semibold leading-none` (Minha Mesa) · `text-4xl md:text-[2.75rem] font-semibold leading-[1.08]` (`FolhaDaTela`)
- Título de seção: `font-display text-2xl font-semibold` · de painel/livro: `font-display text-3xl font-medium`
- Rótulo de grupo / legenda: `font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground`
  (no menu lateral: `text-[11px] tracking-[0.14em] text-moldura-foreground/50`)
- Cabeçalho de tabela (`TableHead`): `font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground`; o `ui/table.tsx` de `assets/base` **já traz essa classe** (em outro projeto, copie-a para o `ui/table.tsx` dele ou repita em cada uso)
- Número grande: `font-display font-semibold leading-none lining-nums tabular-nums` (**`lining-nums` é obrigatório** em Cormorant: sem ele o "1" parece "I" e o "6" desce da linha)
- Número de processo, código, hora, data em tabela: `font-mono`
- Texto de documento oficial: classes `.documento-oficial` / `.texto-do-documento` (serifada)

## Raios, sombras, espaçamento

- Raios: `rounded-lg` = `--radius` (8px), `md` = 6px, `sm` = 4px. Folha da moldura:
  `rounded-t-xl` do tablet para cima (cantos de baixo retos: ela "desce" por trás da borda).
- Folhas empilhadas: sombras sobrepostas (`.folha`), raios 4/10/10/10.
- Sombra da folha principal sobre o azul: `shadow-[0_24px_48px_-24px_rgb(0_0_0/0.55)]`.
- Cartão de entrada: `shadow-[0_24px_48px_-32px_rgb(0_0_0/0.45)]`.
- Espaçamento em múltiplos de 4 (`p-2`, `p-4`, `gap-6`). Meios passos de 2px (`0.5`, `1.5`, `2.5`) existem só no ajuste fino de rótulos, etiquetas e itens pequenos, em 11 arquivos de código da skill fora de `ui/` (mais os de `ui/` do shadcn e o `index.css`): na moldura, só `py-2.5` e `space-y-0.5` (`AppHeaderV3`, `AppSidebarV3`) e `px-1.5` (`BuscaRapida`); nas peças, `CalendarioDeMesa` (`gap-1.5`, `gap-2.5`), `PastaDoProcesso`, `PastaNaGaveta`, `Mesa`, `DivisoriasDeFiltro`, `ConfirmarAto`, `ResumoDaPasta`; e na tela `Acessibilidade` da base; no CSS, `px-2.5` em `index.css` (legado). Em tela nova, **layout em múltiplos de 4**; meio passo só para alinhar com uma peça vizinha que já o usa. Para achar todos: Grep por `\b(py|px|gap|p|m|mt|mb|mx|my|space-y)-(0\.5|1\.5|2\.5|3\.5)\b`.
- Largura máxima de conteúdo: `max-w-7xl` em `FolhaDaTela`; `max-w-[1400px]` em `MesaPagina`.

## Contraste (AA)

- Texto branco sobre `--cta`: 5,09:1 em repouso (passa). O hover **tem que escurecer**
  (`hover:brightness-90`), nunca clarear: com `bg-[hsl(var(--cta)/0.9)]` o fundo sobre a folha
  marfim clareia e o contraste cai para ~4,24:1 (reprova AA). Texto branco sobre `--primary`
  do tema escuro: 5,08:1 (passa); sobre `--accent` do claro (`210 42% 46%`): 4,83:1 (passa).

### Como medir contraste (não confie no olho)

Fórmula WCAG: `L = 0,2126·R + 0,7152·G + 0,0722·B` com cada canal linearizado
(`c/255 ≤ 0,03928 ? c/255/12,92 : ((c/255+0,055)/1,055)^2,4`); razão = `(L1+0,05)/(L2+0,05)`
(claro/escuro). Mínimo AA: 4,5:1 texto normal, 3:1 texto grande (≥ 24 px, ou ≥ 18,66 px em negrito)
e ícones/bordas de interface. Meça contra os **fundos reais**: marfim da folha
(`--background` claro), azul-noite (`--moldura`), papel (`--card`/folha do documento) e,
no escuro, a folha escura. Para o texto no navegador, rode no console:

```js
const lum = ([r,g,b]) => { const f = c => (c/=255) <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4;
  return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b); };
const cor = el => getComputedStyle(el).color.match(/\d+/g).slice(0,3).map(Number);
const fundo = el => { while (el) { const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
  if (m && (m[3] === undefined || +m[3] > 0.99)) return m.slice(0,3).map(Number); el = el.parentElement; } };
const razao = el => { const [a,b] = [lum(cor(el)), lum(fundo(el))].sort((x,y) => y-x);
  return ((a+0.05)/(b+0.05)).toFixed(2); };
// razao(document.querySelector("button.cta"))
```

(O script só acerta onde o fundo é cor sólida; sobre gradiente ou imagem, meça à mão.)
- Ouro sobre azul-noite (`--moldura`): passa; **ouro sobre marfim: não**. Ouro
  só como preenchimento (ponto, ícone, divisão) no claro; no escuro serve até
  como borda/texto sobre a folha escura.
- Link/ação em texto sobre folha: `text-primary dark:text-accent`.
