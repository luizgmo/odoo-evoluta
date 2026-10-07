# 02 — Moldura e posições (onde fica cada coisa)

Código de referência: `assets/components/layout/AppLayoutV3.tsx`,
`AppHeaderV3.tsx`, `AppSidebarV3.tsx`, `BarraDoCelular.tsx`.

## Desktop / tablet (≥ md, 768px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ FAIXA DO ALTO (bg-moldura, px-6 py-2)                                    │
│ [▮◀]  [LOGO DO PRODUTO]│[UMA SOLUÇÃO Evoluta]  ·········  [Busca][☾][?]│[A] nome │
├────────────┬─────────────────────────────────────────────────────┬──────┤
│ MENU AZUL  │ ╭───────────────── FOLHA (bg-background) ─────────╮ │ azul │
│ (bg-moldura│ │ Trilha: Mesa / Processos / …                      │ │ mr-4 │
│  w-64 ou   │ │ Título serifado                    [Ação]         │ │ /5   │
│  w-[4.25rem]│ │ conteúdo (rola)                                  │ │      │
│  recolhido)│ │                                                   │ │      │
│ [+ Nova…]  │ │                                                   │ │      │
│ TRABALHO   │ │                                                   │ │      │
│  Minha Mesa│ ╰───────────────────────────────────────────────────╯ │      │
│ … grupos   │   (cantos de cima arredondados, de baixo retos)        │      │
│ ─────────  │                                                        │      │
│ Acessibil. │                                                        │      │
└────────────┴────────────────────────────────────────────────────────┴──────┘
   SEM rodapé. SEM barra azul inferior. A moldura azul cerca a folha por cima, esquerda e direita.
```

Casca (`AppLayoutV3`):
- Contêiner: `flex h-screen (h-dvh) w-full flex-col overflow-hidden bg-moldura`
  + `env(safe-area-inset-*)` nas bordas.
- Primeiro filho: link "Pular para o conteúdo" (`sr-only`, aparece no foco).
- Depois: `AppHeaderV3`; então `div.flex.min-h-0.flex-1` com `AppSidebarV3` +
  `main#conteudo`; por último `BarraDoCelular` (só celular).
- **`main#conteudo` é a folha**: `min-h-0 flex-1 overflow-auto bg-background p-4
  md:mr-4 lg:mr-5 md:rounded-t-xl md:rounded-b-none md:p-6` + sombra grande.
  É ela que rola. `tabIndex={-1}` e `ref` para voltar ao topo em troca de rota
  (a menos que haja `#âncora` na URL). A barra de rolagem é **fina e nas cores do tema**
  (`::-webkit-scrollbar*` no Chrome/Edge/Safari, sem as setas; `scrollbar-width`/`scrollbar-color` só no
  Firefox; `index.css`, 01): vale em todo elemento que rola (folha, menu, gaveta).
- Atalhos de teclado `Alt+letra` (início `M`, lista `P`, agenda `A` e a letra da
  ação principal, `MARCA.acaoPrincipal.atalho`); a lista vem de `ATALHOS` em
  `features/preferencias/preferencias.ts`, que lê `MARCA`. Não disparam em
  `input/textarea/select/contentEditable`.

## Faixa do alto (`AppHeaderV3`)

Classe: `flex items-center gap-3 bg-moldura px-4 py-2 text-moldura-foreground md:gap-5 md:px-6`.
Da esquerda para a direita:
1. **Hambúrguer** (só celular, `md:hidden`): abre `Sheet` à esquerda (`w-72`) com
   toda a navegação + nome/perfil + Ajuda + Tema + Sair + versão do sistema.
2. **Botão recolher/expandir menu** (≥ md, `PanelLeftClose/Open`, `aria-expanded`,
   `aria-controls="menu-lateral"`). Escondido para perfil `master` (assim como o hambúrguer do celular).
3. **Logo do produto** (`h-9 sm:h-12 md:h-14`, `w-auto`, `-my-1`) — link para a
   página inicial; `alt` = "Produto — ir para <início>".
4. **Divisor vertical** `h-8 w-px bg-moldura-foreground/20` (≥ sm).
5. **`AssinaturaEvoluta`** `w-[5.5rem] text-moldura-foreground/70` (≥ sm).
6. Selo opcional de perfil especial (ex.: "Painel Master"): `rounded-full border
   border-gold/60 px-3 py-1 font-ui text-xs font-semibold uppercase tracking-wide text-gold`
   (`hidden sm:inline-block`).
7. Direita (`ml-auto flex gap-1 md:gap-2`): `BuscaRapida` (ícone no celular,
   caixa `lg:w-52 xl:w-72` no desktop) · `ThemeToggle` · Ajuda (`HelpCircle`) (ambos ≥ sm) ·
   divisor · **avatar**: círculo `h-9 w-9 bg-moldura-foreground/15` com a inicial
   em `font-bold`, **sem borda dourada**; ao lado (só ≥ lg; `max-w-[9rem] xl:max-w-[14rem]` e `truncate`,
   para o texto "Bem maior" não empurrar o avatar para fora da faixa) nome (`font-semibold`) e
   perfil (`text-xs text-moldura-foreground/65`). Abre menu da conta: nome, e-mail,
   Sair e a versão ("Produto vX.Y.Z-sha").
- Botões de ícone da faixa (`BOTAO_NA_FAIXA`): `text-moldura-foreground/80 hover:bg-moldura-foreground/10 hover:text-moldura-foreground focus-visible:ring-gold focus-visible:ring-offset-0`. O logo encolhe (`object-contain object-left`, sem `shrink-0`) quando a faixa aperta.
- Foco sobre a faixa: `focus-visible:ring-2 focus-visible:ring-gold`.
- **A versão do sistema fica no menu da conta, não em rodapé.**

## Menu lateral (`AppSidebarV3`)

- `nav#menu-lateral`, `hidden md:flex`, `bg-moldura px-3 pb-4 pt-2`, `gap-5`,
  `overflow-y-auto` e a classe `.rolagem-moldura` (barra fina, trilha transparente e polegar
  claro sobre o azul-noite; a gaveta do celular usa a mesma); largura `w-64` aberto / `w-[4.25rem]` recolhido, com
  `transition-[width] duration-200` (sem animação em `motion-reduce`).
- **Primeiro item: ação principal** ("Nova …"): `bg-[hsl(var(--cta))] text-white
  font-semibold rounded-lg`; recolhido vira quadrado 40×40 com `Plus` e tooltip.
- **Grupos**: título `font-ui text-[11px] uppercase tracking-[0.14em]
  text-moldura-foreground/50` (recolhido: traço `h-px w-6 bg-moldura-foreground/20`),
  lista `space-y-0.5`.
- **Item**: `rounded-lg text-sm px-3 py-2.5 gap-3`, ícone `h-[1.125rem] w-[1.125rem]`.
  Inativo `text-moldura-foreground/75 hover:bg-moldura-foreground/10`.
  **Ativo**: `bg-moldura-2 font-semibold text-moldura-foreground` + barrinha azul
  de 4px à esquerda (`before:… before:w-1 before:bg-accent`) e `aria-current="page"`.
- **Pé do menu** (`mt-auto border-t border-moldura-foreground/10 pt-3`):
  itens da pessoa (Acessibilidade), não do trabalho.
- Recolhido: nome vira `sr-only` + `Tooltip` à direita.
- Estado aberto/recolhido guardado em `localStorage` (`useMenuLateral`) e pode
  vir de uma preferência "começar recolhido".

## Barra do celular (`BarraDoCelular`) — só `< md`

`grid grid-cols-4 border-t border-moldura-foreground/10 bg-moldura
pb-[env(safe-area-inset-bottom)] md:hidden`: 3 destinos do dia a dia + "Nova"
(círculo `bg-[hsl(var(--cta))]` com `+`). Ativo em `text-gold`, inativo
`text-moldura-foreground/70`. Ícone 20px, rótulo `text-xs font-semibold`.
**No desktop essa barra NÃO existe** (o usuário já pediu para retirar).

## Largura e comportamento

| Largura | Muda |
|---------|------|
| < 640 (sm) | logo menor (`h-9`), assinatura/Ajuda/Tema/nome somem (vão para a gaveta), busca vira ícone |
| < 768 (md) | menu lateral some; hambúrguer + barra inferior; folha ocupa a largura toda, sem cantos (perfil `master`: sem hambúrguer, sem gaveta e sem barra, só a faixa do alto) |
| ≥ 768 | menu lateral + folha com `mr-4` e cantos de cima |
| ≥ 1024 (lg) | folha `mr-5`; busca com caixa de 18rem; `.livro-aberto` mostra duas páginas |
| 400px | **tudo deve funcionar**; tabela ganha `overflow-x-auto` própria, nunca a página |

## Telas de entrada (`MolduraDeEntrada`)

- Layout `flex min-h-screen flex-col lg:flex-row bg-background`.
- **Painel esquerdo** (`aside`, `bg-moldura text-moldura-foreground`, `lg:w-[46%]`):
  linha com logo do produto (`h-12 lg:h-16`) + divisor `h-10 w-px` + assinatura
  Evoluta (`w-24 lg:w-28`); em ≥ lg, no meio: frase-título `font-display text-5xl
  leading-[1.05]` ("A mesa de trabalho de quem conduz a licitação." — troque pela
  frase do produto), parágrafo de apoio, **3 marcadores com ponto ouro**
  (`h-2 w-2 rounded-full bg-gold`); rodapé pequeno com direitos reservados.
- **Direita**: cartão `max-w-md rounded-xl border bg-card p-6 sm:p-8` com sombra,
  `animate-fade-in`; rótulo `font-ui uppercase`, título `text-4xl`, subtítulo
  `text-muted-foreground`; **carimbo no canto** ("Uso restrito"); campos `h-11 pl-11`
  com ícone à esquerda (`CAMPO_DE_ENTRADA`).
- Em < lg: painel vira cabeçalho só com logos; direitos reservados embaixo, centralizados.

## Conteúdo dentro da folha

- Tela comum: `FolhaDaTela` → `section.folha mx-auto max-w-7xl p-4 sm:p-6 md:p-8`:
  Trilha → cabeçalho (título serifado + subtítulo `max-w-[56ch]` + ação à direita)
  → conteúdo `mt-6 space-y-6`.
- Item aberto **com divisórias** (a pasta): `PastaDoProcesso` — trilha, divisórias
  no alto, capa com clipe e carimbos, ferramentas na borda direita (ver 05, "Qual
  casca para qual tela").
- Item **simples ou relatório**: `MesaPagina` — cabeçalho da ferramenta
  (`.mesa-faixa`, cor `--mesa-noite`: **marfim** no tema claro, **ardósia escura** no
  escuro) com rótulo + carimbo + título + ações, e as
  folhas sobem sobre ele com `-mt-10`. **Atenção:** essa faixa fica **dentro** da folha
  e é só o cabeçalho da ferramenta; **não é** a faixa azul-noite do alto da moldura
  (`AppHeaderV3`, `bg-moldura`) — não troque uma pela outra. Usa margens negativas (`-m-4 md:-m-6`) para encostar nas bordas da
  folha-mãe. `compacto` = título de uma linha. Nunca junto de `PastaDoProcesso`.
