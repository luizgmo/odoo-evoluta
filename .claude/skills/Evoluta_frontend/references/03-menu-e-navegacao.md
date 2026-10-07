# 03 — Menu e navegação

Código: `assets/components/layout/navegacao.ts` — **uma lista só** alimenta o menu
lateral, a gaveta do celular e a busca rápida. Nunca duplique a lista.

## Estrutura (vale para qualquer sistema Evoluta)

1. **Ação principal** no alto do menu, em azul de ação (`--cta`), com `+`.
2. **Grupos** com título em caixa-alta pequena, nesta ordem de ideia:
   *Trabalho* (o dia a dia) → *Consulta* (ler/pesquisar) → *<unidade/repartição>* →
   *Administração* (só quem administra).
3. **Pé** separado por filete: Acessibilidade (preferências da pessoa).
4. Itens por **perfil** (`perfis?: [...]`): sem lista, todos veem; grupo vazio some.
5. Item aceso por **prefixo de rota** (`abaAtiva`): `pathname === caminho` ou começa
   com `caminho/`; a página inicial também acende a "Minha Mesa"; criar item
   novo acende a ação principal, não o item da lista.

## Menu do LicitarsAI (referência)

| Grupo | Item | Rota | Ícone (lucide) | Perfis |
|-------|------|------|----------------|--------|
| Trabalho | Minha Mesa | `/dashboard` | Home | todos |
| Trabalho | Processos | `/processes` | FolderOpen | todos |
| Trabalho | Prazos e agenda | `/agenda` | CalendarClock | todos |
| Trabalho | Arquivo | `/arquivo` | Archive | todos |
| Consulta | Biblioteca | `/library` | BookOpen | todos |
| Consulta | Painéis | `/metrics` | BarChart3 | gestor, admin, master |
| Repartição | Quem está com o quê | `/planta` | LayoutGrid | todos |
| Repartição | Processos do período | `/livro-gestao` | BookMarked | todos |
| Administração | Modelos do órgão | `/templates` | Settings | admin |
| (pé) | Acessibilidade | `/acessibilidade` | Accessibility | todos |
| (ação) | Nova contratação | `/processes/new` | Plus | todos |

Perfis: `master` (Evoluta — não navega pelas telas do cliente, sem menu lateral),
`admin`, `gestor`, `operador`. O tipo `Perfil` mora em `contexts/AuthContext.tsx`
(`navegacao.ts` o importa). No login de demonstração o **nome** digitado escolhe o
perfil: `admin`, `master`, `operador` ou `gestor`; qualquer outro nome também vira `gestor`.
Para ver o menu inteiro em teste entre como `admin` (o `master` só tem a faixa do alto). A
lista de demonstração (`PERFIS_DE_DEMONSTRACAO`, ordem admin, master, operador, gestor) e o
mapa `DESCRICAO_DO_PERFIL` montam a dica da tela de login, só em desenvolvimento ("admin (vê
o menu completo); master (vê só a faixa do alto); …"): perfil novo = um nome na lista e uma
linha no mapa, sem editar o `Login.tsx`. A rota inicial e a de criação vêm de
`MARCA.rotaInicial` e `MARCA.acaoPrincipal.caminho` (08).

Barra do celular (menu de **referência do LicitarsAI**): Mesa · Processos · Prazos · Nova. Os três
primeiros destinos vêm de `MARCA.destinosDoCelular` (na ordem em que forem declarados; o rótulo
do início é `MARCA.inicioCurto`) e o 4º é a ação principal, cujo rótulo curto
("Nova") vem de `MARCA.acaoPrincipal.curto`: troque ali, não no componente.

## Nomes: regras de linguagem

- Português simples, que a pessoa entenda sem treinamento.
- **Rejeitados pelo usuário** (não repita o padrão): "Planta da repartição",
  "Entregar minha mesa", "Livro da gestão". Aprovados no lugar: "Quem está com o
  quê", "Processos do período".
- Evite metáfora que não existe em português de repartição.

## Adaptar para outro sistema

Troque `GRUPOS_DO_MENU`, `ITENS_DO_PE` e a ação principal. Mantenha:
`menuDoPerfil`, `itensDoPerfil`, `abaAtiva`, o tipo `Perfil` (em
`contexts/AuthContext.tsx`) ajustado aos perfis do sistema, e a regra "ícone `aria-hidden`, nome no texto". Ícones sempre de
`lucide-react`, traço padrão, `h-[1.125rem] w-[1.125rem]` no menu.

## Busca rápida (`BuscaRapida`)

Botão na faixa que abre `CommandDialog` (Ctrl/⌘+K): itens do menu do perfil, ação
principal, registros recentes e, se existir, atalhos de consulta. No celular só
o ícone (`w-10`); ≥ lg uma caixa `w-72` com a dica do atalho. As dependências de
dados (`useProcessosDaMesa`, `ARTIGOS`) são do LicitarsAI: troque pelas do sistema
alvo ou remova os grupos que não existirem. O grupo "Na lei" e o texto "…ou artigo da lei"
da caixa de busca só aparecem com `MARCA.leiAoLado = true` (a base vem `false`); ver SKILL.md,
tabela "Arquivos que carregam o domínio de licitação".

O filtro por perfil de `menuDoPerfil`/`itensDoPerfil` esconde o item do menu; quem recusa a
URL digitada é `RequerPerfil` (rota de layout em `App.tsx`), que lê o mesmo campo `perfis` de
`navegacao.ts`: ao criar um item com `perfis`, a rota já fica protegida (ver SKILL.md).
