# 06 — Regras de uso

## Cor e tema

- Só token. Hex ou `gray-*` funciona em um tema e some no outro. Confira **claro
  e escuro** sempre.
- Tema por classe: `html.dark` (Tailwind `darkMode: ["class"]`). Um `ThemeToggle`
  na faixa (e na gaveta do celular) alterna e guarda a escolha.
- **Ouro**: ponto, ícone, divisão, foco/selo sobre azul-noite. Nunca texto/borda
  de ouro sobre marfim. Usuário rejeitou "dourado/bege" em barras de menu — o
  menu é azul, o ouro é detalhe.
- **Azul de ação** (`--cta`, `bg-[hsl(var(--cta))] text-white`) é o botão que "faz o
  trabalho". Um por região. Use a classe explícita **ou** `<Button variant="cta">` (existe
  no `ui/button.tsx` de `assets/base`; em outro projeto, confira que a variante existe): `<Button>` sem `variant` usa `bg-primary` (outro azul, o de links e foco),
  então não sirva de "padrão" para a ação principal.
- **Texto sobre o azul-noite** (faixa de resultado `AvisosDeResultado`, painel de
  entrada) usa `text-moldura-foreground`; o ícone de sucesso (`Check`) é `text-gold` e
  a falha ao desfazer vai sublinhada com `decoration-gold` — ouro sobre azul-noite é
  o uso permitido do ouro. O azul-noite é escuro **nos dois temas**, e os tokens de
  tinta mudam por tema (escuros no claro), então ali não servem. **Não há cor crua
  nesse componente.** Cores cruas só restam em componentes shadcn genéricos
  (`assets/base/src/components/ui/`): `toast.tsx` (variante destrutiva, `red-*`), o
  véu `bg-black/80` de `dialog`, `sheet` e `alert-dialog` (escurecer o fundo é
  neutro nos dois temas) e a sombra `rgba` do `select.tsx`. São exceções
  conhecidas — não as copie para telas novas.
  Em qualquer outro lugar, token.
- Texto de link sobre a folha: `text-primary dark:text-accent`.
- Borda de aviso no claro usa a cor de aviso (ocre), pois ouro não tem contraste de borda no claro.

## Moldura

- Sem rodapé. Sem barra azul inferior no desktop. A versão fica no menu da conta.
- Sem borda dourada no avatar.
- A folha rola; o resto fica. Volta ao topo ao trocar de rota (exceto com `#âncora`).
- Menu lateral abre/recolhe pelo botão da faixa; escolha persiste no navegador.

## Texto

- Português do Brasil, com acentuação, sem jargão. Mensagem de erro diz o que
  aconteceu e o que fazer ("Tente de novo em instantes. Se continuar, avise a
  equipe…"). IA e automação **orientam**; decisão e assinatura são sempre da pessoa
  — diga isso na tela quando houver IA.
- Títulos curtos. Subtítulo explica para que serve a tela em uma frase (`max-w-[56ch]`).
- Datas `dd/mm/aaaa` (`toLocaleDateString("pt-BR")`), números de processo em mono.
- Não comunique estado só por cor: acompanhe de texto/ícone.

## Acessibilidade (mínimo)

- `aria-label` em todo botão só de ícone; ícones decorativos `aria-hidden`.
- Foco visível em tudo (`focus-visible:ring-2 ring-ring`; sobre a moldura
  `ring-gold`). Nunca `outline-none` sem substituto. Vale também para os links da
  `Trilha` (`focus-visible:ring-2 ring-ring`).
- `Pular para o conteúdo` no topo (aparece ao receber foco, com `focus:ring-gold`);
  `main#conteudo` com `tabIndex={-1}`.
- Contraste: o acento do tema claro (`--accent` 210 42% 46%, `#4475A7`) foi escurecido
  para que o texto branco sobre ele chegue a 4,8:1 (AA); não volte ao 50% do original.
  Ouro só sobre azul-noite. Se criar token ou cor de realce novo, meça o contraste
  (fórmula, fundos de referência e script em `01`, seção "Como medir contraste").
  Texto branco sobre `--cta` mede 5,09:1 em repouso; o hover deve **escurecer**
  (`hover:brightness-90`), pois clarear o fundo (`/0.9`) o derruba para ~4,24:1.
- `aria-current="page"` no item de menu e na trilha.
- Texto corrido e de apoio ≥ 12px (`text-xs` é o mínimo); contraste AA. **Exceção**, só para
  rótulos curtos em caixa-alta ou datas de objetos de mesa, que a skill já traz assim: título
  de grupo do menu (`text-[11px]`), `.carimbo` pequeno (11px), `.folhinha` (mês 10px, dia da
  semana 11px) e a tecla `kbd` da `BuscaRapida` (11px). Em tela nova, nada abaixo de 12px
  fora desses.
- Tooltips no menu recolhido; `sr-only` com o nome.
- Respeitar `prefers-reduced-motion` e a preferência do sistema "sem movimento".
- Safe-area do iPhone: `env(safe-area-inset-*)` na casca e na barra do celular.

## Responsivo

- Funciona em ~400px. Linha longa quebra ou empilha; tabela rola dentro da própria
  caixa (`overflow-x-auto`). Largura fixa > 380px é proibida; use `max-w-*`. Filho de grade ou
  de `flex` com texto longo (linha da Agenda, cartões) leva `min-w-0` e quebra linha;
  grade de duas colunas começa com `grid-cols-1`. Confira medindo `main`
  (`scrollWidth <= clientWidth`): é ele que rola, não o documento.
- Múltiplos de 4 no espaçamento. Exceção: meios passos de 2px (`0.5`, `1.5`, `2.5`) só no ajuste fino de rótulos e itens pequenos: na moldura `py-2.5` e `space-y-0.5` (`AppHeaderV3`, `AppSidebarV3`) e `px-1.5` (`BuscaRapida`), e em algumas peças de `mesa/` (`CalendarioDeMesa`, `PastaDoProcesso`, `Mesa`…; lista completa em 01); no layout de tela nova, só múltiplos de 4.

## Movimento

- Sem animação decorativa contínua. Entrada de cartão `animate-fade-in` (0.3s).
- Carimbo bate só com ação, ou no máximo uma vez por visita (`bateAoAbrir`); nunca a cada render (ver 05). Menu lateral anima largura 200ms.

## Privacidade e dados

- Dado de exemplo é inventado; documento formatado usa placeholder inválido
  (`000.000.000-00`, `11.111.111/1111-11`). Nunca cole dado real de órgão
  público em código, fixture, doc ou PR.
- Nunca peça print de tela do sistema (traz dado real). Leia o código.

## Reaproveite antes de criar

Componentes `ui/` (shadcn: Button, Sheet, Tooltip, DropdownMenu, Dialog,
AlertDialog, Command, Input, Textarea, Select, Tabs, Badge) vêm antes de
qualquer botão escrito à mão — herdam foco, teclado e tema. Não crie a "quarta
cópia" de um componente que já existe.
