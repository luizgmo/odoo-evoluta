# 04 — Logos e marca

## Arquivos (`assets/public/`)

| Arquivo | Uso |
|---------|-----|
| `logo-produto-modelo.svg` | Logo **genérico** de produto (cabe na faixa azul): é o valor inicial de `MARCA.logo`. Use-o enquanto o sistema novo não tem arte própria |
| `licitars-logo.png` | Logo do produto LicitarsAI, 857×435 px (≈ 2:1), só como **exemplo de referência**; não use em outro sistema |
| `evoluta-logo.png` | Logo Evoluta, 480×120 px (4:1), usado dentro de `AssinaturaEvoluta`. **Não trocar** |
| `favicon.ico` | Ícone da aba, 64×64 (trocar pelo do produto quando houver) |

### Como trocar o logo do produto
1. Coloque o arquivo em `public/` (PNG com fundo transparente ou SVG, **texto claro**
   pensado para o azul-noite). Qualquer proporção funciona: a altura é fixa e a
   largura acompanha (`w-auto`); o ideal é de 2:1 a 4:1 de largura por altura.
2. Aponte `MARCA.logo` em `src/config/marca.ts` para ele (ex.: `"/meu-logo.png"`).
3. A altura na faixa é `h-9` (celular), `h-12` (≥ sm) e `h-14` (≥ md) e na entrada
   `h-12`/`lg:h-16`; confira nos dois tamanhos que nada fica cortado nem minúsculo.
   O `logo-produto-modelo.svg` é desenhado em 480×120 (4:1) com o nome em texto;
   como SVG carregado por `<img>` **não usa fontes da página**, o nome aparece em
   Segoe UI/Arial (a Plus Jakarta Sans só vale se estiver instalada no aparelho).
   Isso é aceitável para o modelo; o logo definitivo deve ter o nome **convertido em
   curvas** (ou ser PNG) para ficar igual em todo aparelho.
4. Sem logo claro? Fornecer versão para fundo escuro é do cliente; não recolora nem
   aplique filtro (a regra "não recolora" vale).

Copie para `public/` do sistema alvo e referencie por caminho absoluto
(`/evoluta-logo.png`). O `index.css` tem `.logo-adaptive` (ajuste do logo no
tema escuro) — use-o em logos que precisem inverter fora da faixa azul.

## Regra da marca (sempre as duas peças)

```
[ LOGO DO PRODUTO ]  │  UMA SOLUÇÃO
                        [ logo Evoluta ]
```

- À esquerda o **logo do produto** (link para a página inicial); ao lado, um
  **divisor vertical** (`w-px bg-moldura-foreground/20`); depois a **assinatura Evoluta**.
- Presente na **faixa do alto** (logo `h-9 sm:h-12 md:h-14`, assinatura
  `w-[5.5rem]`) e no **painel azul das telas de entrada** (logo `h-12 lg:h-16`,
  assinatura `w-24 lg:w-28`).
- No celular a assinatura some da faixa (falta espaço); aparece na tela de entrada.
- Fundo: sempre sobre `--moldura` (azul-noite). Os logos foram feitos para esse
  fundo; não os coloque sobre o marfim sem um teste de contraste.
- Não deforme, não recolora, não adicione sombra ou contorno.
- Texto alternativo do logo na faixa: "<Produto> — ir para <início>".

## `AssinaturaEvoluta`

`assets/components/layout/AssinaturaEvoluta.tsx`: um SVG `viewBox="0 0 100 9"`
com o texto "UMA SOLUÇÃO" em `var(--font-ui)` 9.5/600 e `textLength="100"
lengthAdjust="spacing"` — o texto é esticado para **ter exatamente a largura do
logo Evoluta** embaixo; por isso o componente é um SVG e não um `<span>`. Cor
herdada (`text-moldura-foreground/70`); largura definida por quem usa
(`w-[5.5rem]` na faixa).

## Linhas de direitos / versão

- Direitos reservados só nas telas de entrada ("<Produto> © <ano> - Todos os
  direitos reservados"), `text-xs text-moldura-foreground/60`.
- Versão do sistema ("<Produto> vX.Y.Z-sha"): no menu da conta e na gaveta do
  celular. No menu da conta é `text-xs text-muted-foreground`; na gaveta do celular
  (fundo azul-noite) é `px-3 pt-3 text-xs text-moldura-foreground/55`. Não existe rodapé.

## Cores da marca

Azul-noite da moldura `#1C2545` (= fundo do logo Evoluta) e ouro `#B8924A`. O ouro
aparece nos pontos de marcador do painel de entrada, no selo de perfil especial,
no foco sobre a moldura e no item ativo da barra do celular.
