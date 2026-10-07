# 09 — Receitas de telas

Uma receita por tipo de tela do LicitarsAI. Cada uma traz o esqueleto JSX
completo (copie, troque os dados), as regras de uso e o que **nunca** fazer.
Páginas reais de referência (modelo visual, dependem de dados do LicitarsAI) em
`assets/exemplos/` — mapa em `assets/exemplos/LEIA-ME.md`. Textos prontos em
`10-estados-e-microcopy.md`. Classes de `index.css` em `01-tokens-e-tipografia.md`.

Índice: 0 · Regras que valem em toda receita · 1 Minha Mesa · 2 Lista em gaveta ·
3 Agenda/calendário · 4 Biblioteca/fichas · 5 Painéis com números ·
6 Formulário (etapas ou longo) · 7 Item aberto (pasta com abas) ·
8 Documento + baixar .docx · 9 Configurações/preferências · 10 Ajuda ·
11 404 / sem permissão · 12 Login e recuperar senha · 13 Peças transversais
(avisos de resultado, confirmação, tabelas, badges, abas, gráficos, impressão, lei ao lado) ·
14 Chat com a IA, comparar/repetir um item, editor de documento, linha do tempo visual,
lista de ativos e cartão de documento pronto

Os imports abaixo seguem os caminhos do LicitarsAI (`@/components/mesa/...`,
`@/components/ui/...`). Ao instalar em outro sistema, ajuste só o prefixo.

**Pseudo-código × código que compila.** Os esqueletos abaixo mostram a **estrutura
e as classes**, não um arquivo pronto: nomes como `useDadosDaMesa`, `useItens`,
`useAgenda`, `useExemplares`, `usePaineis`, `useItem`, `filtrar`, `ordenar`,
`agruparPorTipo`, `porSemana`, `dadosDaPasta`, `usuario`, `resumoDaSemana`,
`ResumoDoDia`, `LinhaDoTempo`, `ItemEmDestaque` e `QuickActionsRow` são
**ilustrativos** (a sua fonte de dados e as suas peças de domínio). Para código que
compila e roda, parta dos modelos em `assets/base/src/pages/`
(`Inicio`, `Lista`, `Item`, `Formulario`, `Documento`, `Agenda`, `Paineis`,
`Acessibilidade`, `EmConstrucao`, `NotFound`, `Unauthorized`) e de `assets/base/src/features/agenda/`
(`calendarioDoMes.ts`, `montarAgenda.ts`) com o `CalendarioDeMesa`; troque só os
dados.

**`MARCA` em toda receita.** Nome, rota e rótulo que mudam de sistema vêm de
`import { MARCA } from "@/config/marca"` (`MARCA.inicio` / `MARCA.rotaInicial` no
primeiro passo de toda `Trilha`; `MARCA.acaoPrincipal` na ação "Nova …"; `MARCA.objeto`
no substantivo; `MARCA.equipeDeSuporte` em "avise …"). Onde um esqueleto abaixo ainda
mostra um texto fixo de licitação ("Nova contratação", "processos"), troque pelo
substantivo do seu sistema (10, "ajuste o substantivo"). Do mesmo modo, o `"/processes"`
(e `"/processes/new"`, `` `/processes/${id}` ``) dos esqueletos é o **padrão** de
`MARCA.rotaDaLista` (e de `MARCA.acaoPrincipal.caminho`): no código da base ele sai de
`MARCA`, não se escreve à mão (SKILL.md, "A rota da lista e do item sai de `MARCA.rotaDaLista`").

---

## 0. Regras que valem em toda receita

1. **Escolha a casca pela tabela única de `05-componentes-da-mesa.md` ("Qual casca
   para qual tela")**: `FolhaDaTela` (lista, painel, agenda, biblioteca);
   `PastaDoProcesso` (item aberto com divisórias — e `ProcessoNaMesa` nas telas de
   trabalho dele); `MesaPagina` (item simples ou relatório avulso); `FolhaDaTela`
   também para o documento (ler e baixar; receita 8);
   `div.folha` próprio (Minha Mesa); `div.mx-auto.max-w-5xl|6xl` + `Trilha` + `h1` +
   folhas `folha p-5` (Ajuda, Preferências, formulários curtos).
   `MesaPagina` e `PastaDoProcesso` nunca na mesma tela.
2. **Quatro estados em toda tela**: carregando (`MesaCarregando`), erro
   (`MesaErroBusca` com "Tentar de novo"), vazio (frase + próximo passo,
   `border-dashed`), conteúdo. Se a atualização falha mas há dados:
   `AvisoAtualizacaoFalhou` acima do conteúdo.
3. **Cor só por token**. Botão comum da região (Salvar, Criar, Entrar, "Nova …"
   dentro da folha): `Button` padrão (azul `bg-primary`). Botão que "gera/faz o
   trabalho" (um por região) e a ação "Nova …" do menu lateral e da barra do celular:
   `className="bg-[hsl(var(--cta))] text-white hover:brightness-90"` ou
   `<Button variant="cta">` (equivalente; existe na base).
   Secundário `variant="outline"`. Terciário = link
   `text-primary dark:text-accent font-semibold hover:underline` + " ›".
4. **Um objeto de escritório por papel** (não misture na mesma área):
   | Conteúdo | Objeto |
   |---|---|
   | Lista de "coisas de arquivo" (processos) | Gaveta + pastas (`PastaNaGaveta`) |
   | Item aberto com divisórias | Pasta com capa (`PastaDoProcesso`) |
   | Item simples / relatório | Cabeçalho da ferramenta (marfim/ardósia) + folhas (`MesaPagina`) |
   | Documento (ler e baixar) | Folha com trilha e botão de baixar (`FolhaDaTela`) |
   | Datas / agenda / notas | Folhinha + bloco de espiral (`BlocoEspiral`) |
   | Itens de consulta (exemplares, modelos) | Ficha de fichário (`.ficha`) |
   | Aviso/dica da tela | Bilhete (`.bilhete`) — **um por tela, no máximo** |
   | Números e gráficos | Livro aberto (`.livro-aberto` + `.livro-pagina`) |
   | Resumo no azul | Bloco `rounded-xl bg-moldura text-moldura-foreground` |
   | Cartões soltos sobre a mesa | `.mesa-un` dentro de `.tampo-vista` |
   | Situação / ato / prazo | Carimbo (`Carimbo`, `CarimboSituacao`, `CarimboDatado`) |
   | Filtros de lista | Divisórias (`DivisoriasDeFiltro`) |
   | Texto de documento oficial | `.documento-oficial` / `TextoDoDocumento` (serifada) |
5. **Larguras**: `FolhaDaTela` já traz `max-w-7xl mx-auto`; telas de texto
   `max-w-5xl` (preferências, documento) ou `max-w-6xl` (ajuda, formulário).
6. **Títulos**: `h1` serifado (`font-display text-4xl font-semibold`, `md:text-[2.75rem]`
   na `FolhaDaTela`); `h2` de seção `font-display text-2xl|3xl font-semibold`;
   rótulo pequeno `font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground`.
7. **Subtítulo** = uma frase dizendo para que serve a tela (`max-w-[56ch]`).
8. **Largura ~400px**: grids viram uma coluna (`grid-cols-1` + `sm:/md:/lg:`);
   tabelas rolam dentro da caixa (`overflow-x-auto` + `min-w-[...]`); barras de
   filtro empilham; botões da direita do título vão para baixo (`flex-wrap`).
9. **NUNCA**: hex/`gray-*`; `Card` do shadcn como contêiner de tela (use `folha`,
   `folha-simples`); `Badge` para situação (use `Carimbo`); `Alert` do shadcn
   para erro de tela (use `MesaAviso`/`MesaErroBusca`); spinner solto sem texto;
   rodapé; borda dourada no avatar; mais de um botão `--cta` por região;
   carimbo batendo a cada render; texto de ouro sobre marfim; `alert()`/`confirm()`
   do navegador (use `ConfirmarAto`/aviso de resultado).

---

## 1. Minha Mesa (início / dashboard)

**Quando usar**: primeira tela depois do login. Saudação, o que vem pela frente,
resumo em números, o item em destaque e atalhos. Raiz é `div.folha` (não
`FolhaDaTela`: a Minha Mesa tem cabeçalho próprio, sem trilha).
O `Inicio.tsx` de `assets/base/src/pages/` é uma **versão enxuta** desta receita (sem
`LinhaDoTempo`, sem `QuickActionsRow` e sem os estados carregando/erro): o esqueleto
abaixo é a versão completa — monte os estados faltantes por ele e por 10.

```tsx
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvisoAtualizacaoFalhou, MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { MARCA } from "@/config/marca";

import { diaPorExtenso, saudacao } from "@/features/dashboard/formatos"; // assets/base/src/features/dashboard/formatos.ts

export default function MinhaMesa() {
  const hoje = new Date();
  const primeiroNome = usuario?.nome?.trim().split(/\s+/)[0]; // pode não existir: só "Bom dia."
  const { dados, carregando, erro, atualizar } = useDadosDaMesa(); // sua fonte de dados

  if (carregando && !dados) return <MesaCarregando texto="Abrindo a sua mesa…" />;
  if (erro && !dados)
    return (
      <MesaErroBusca
        titulo="Não deu para carregar a tela inicial" // sem artigo de MARCA.inicio: o nome da tela não tem gênero garantido
        texto={`Tente novamente em alguns instantes. Se continuar, avise ${MARCA.equipeDeSuporte}.`}
        onTentarDeNovo={atualizar}
      />
    );

  return (
    <div className="folha mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 md:p-8">
      {erro && <AvisoAtualizacaoFalhou onTentarDeNovo={atualizar} />}

      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold leading-none md:text-5xl">
            {saudacao(hoje.getHours())}
            {primeiroNome ? `, ${primeiroNome}.` : "."}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {diaPorExtenso(hoje)}.
            {/* opcional: {" · "}{resumoDaSemana} (ex.: "2 prazos e 1 sessão esta semana") */}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/processes">Ver {MARCA.objeto.plural}</Link>
          </Button>
          <Button asChild>
            <Link to={MARCA.acaoPrincipal.caminho}>
              <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
              {MARCA.acaoPrincipal.rotulo}
            </Link>
          </Button>
        </div>
      </header>

      {/* Linha do tempo: cinco colunas (feito · hoje · aguarda · semana · adiante) */}
      <LinhaDoTempo colunas={colunas} hoje={hoje} />

      {/* Resumo azul + item em destaque */}
      {/* grid-cols-1 é obrigatório: sem coluna base, a coluna `auto` estoura a folha a 400px */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <ResumoDoDia kpis={kpis} />
        <ItemEmDestaque item={destaque} />
      </div>

      {/* Atalhos */}
      <QuickActionsRow />
    </div>
  );
}
```

**Peças** (use os exemplos de `assets/exemplos/features/dashboard/`):

- `LinhaDoTempo` — `section.tampo-vista`; título `h2.text-2xl.font-semibold`
  "Linha do tempo" + à direita `Hoje, {dia mês}` em rótulo pequeno; trilho
  `absolute left-[10%] right-[10%] top-[49px] hidden h-0.5 bg-border xl:block`;
  `ol.relative.grid.gap-3.sm:grid-cols-2.lg:grid-cols-3.xl:grid-cols-5`; cada
  coluna tem rótulo + contagem ("nada", "1 item", "N itens") + marco no trilho
  (≥ lg) e abaixo o cartão `flex h-full flex-col rounded-lg p-4 mesa-un`. A
  coluna **"Aguarda"** com item vira **post-it**: `border-2
  border-[color:var(--color-status-warning)] bg-[hsl(var(--mesa-bilhete))]
  text-[hsl(var(--mesa-bilhete-texto))] shadow-md dark:border-gold`, com
  `Carimbo tinta="ocre" giro={-3}` "Pendente" e o link "Resolver ›". Demais
  colunas: link "Abrir pasta ›". Mais de um item: "e mais N" (abre a lista
  inline com `aria-expanded`, e vira "mostrar menos") ou link para a lista.
  Coluna vazia: frase curta em `text-muted-foreground`.
  Marcos (`MARCO`): feito/adiante = anel cinza; hoje = disco `bg-moldura` com
  `ring-4 ring-card`; aguarda = disco ouro maior (`h-5 w-5 bg-gold`); semana = disco `bg-primary`.
- `ResumoDoDia` — `section.flex.flex-col.rounded-xl.bg-moldura.p-5.text-moldura-foreground`;
  `h2.font-sans.text-base.font-semibold` "Resumo do dia"; `dl` com o número maior
  (`font-display text-[2.5rem] font-semibold leading-none text-gold lining-nums tabular-nums`,
  rótulo abaixo em `text-xs text-moldura-foreground/75`, usando `flex-col-reverse` para
  `dt` depois do `dd`); três contagens em `grid grid-cols-3 gap-x-3` (`text-[2rem]`);
  link final "Ver todos os processos ›" (`mt-auto pt-6`).
- Item em destaque — `section.mesa-un.relative.p-5`: rótulo, número/título em
  `font-display`, `CarimboSituacao grande`, e a caixa "Próxima ação"
  `rounded-md border border-[color:var(--color-status-warning)] bg-gold/10 p-3 dark:border-gold/60`.
  Vazio: "Nenhuma abertura marcada" + frase de apoio.
- `QuickActionsRow` — `nav aria-label="Acesso rápido"` com rótulo + 4 cartões
  `mesa-un flex items-center gap-3 px-3 py-2 hover:-translate-y-0.5`, ícone em
  círculo `h-8 w-8 rounded-full bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent`.
  Atalhos do LicitarsAI: Nova contratação · Gerar documento · Biblioteca · Conversar com a IA.
  No sistema alvo: 3–4 ações mais frequentes, com dica de uma linha.

**Regras**: saudação por hora (5–11h "Bom dia", 12–17h "Boa tarde", 18–4h "Boa noite")
com **primeiro nome** e ponto final. Número grande em `font-display`, sempre
`lining-nums tabular-nums`. Só um post-it (coluna "Aguarda") por tela. Dinheiro em
`R$ 125,3 mi` quando não couber (`title` com o valor inteiro).
**Nunca**: gráfico na Minha Mesa; mais de 4 atalhos; carimbo batendo ao abrir
sem ação; "dashboard" em inglês no texto.

**Estados**: carregando = `MesaCarregando` (spinner + frase, nunca spinner solto);
erro total = `MesaErroBusca` "Não deu para carregar a tela inicial" (sem artigo de
`MARCA.inicio`); erro
parcial = `AvisoAtualizacaoFalhou`; vazio por coluna = frase curta.
**Largura**: coluna única em < sm; 2 colunas em sm; 3 em lg; 5 em xl (trilho só em xl);
bloco azul + destaque empilham em < lg.

---

## 2. Lista em gaveta (lista principal de itens)

**Quando usar**: a lista do objeto principal do sistema (processos, contratos,
ocorrências…) que tem estado, número e responsável. Cada item é uma pasta.

```tsx
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowDownUp, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { DivisoriasDeFiltro } from "@/components/mesa/DivisoriasDeFiltro";
import { MesaCarregando, MesaErroBusca, AvisoAtualizacaoFalhou } from "@/components/mesa/Mesa";
import { PastaNaGaveta } from "@/components/mesa/PastaNaGaveta";

export default function Lista() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [params, setParams] = useSearchParams();            // a divisória vive no endereço
  const aba = (params.get("aba") as "ativos" | "sem-data" | "todos") ?? "ativos";
  const setAba = (a: typeof aba) => setParams(a === "ativos" ? {} : { aba: a }, { replace: true });
  const { itens, carregando, erro, jaTem, atualizar } = useItens();

  const filtrados = ordenar(filtrar(itens, aba, busca));

  return (
    <FolhaDaTela
      trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: "Processos" }]}
      titulo="Processos"
      subtitulo="Tudo o que está em andamento, com a fase de cada pasta. O que terminou fica no Arquivo."
      acao={
        <Button onClick={() => navigate("/processes/new")}>
          <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
          Nova contratação
        </Button>
      }
    >
      {erro && jaTem && <AvisoAtualizacaoFalhou onTentarDeNovo={atualizar} />}

      <div>
        {/* Divisórias + atalho para o arquivo */}
        <div className="flex flex-wrap items-end justify-between gap-2">
          <DivisoriasDeFiltro<typeof aba>
            rotulo="Mostrar processos"
            className="min-w-0 flex-1 basis-full sm:basis-auto"
            opcoes={[
              { id: "ativos", rotulo: "Ativos", total: totalAtivos },
              { id: "sem-data", rotulo: "Sem data de abertura", total: totalSemData },
              { id: "todos", rotulo: "Todos", total: itens.length },
            ]}
            valor={aba}
            onChange={setAba}
          />
          <Link to="/arquivo" className="pb-2 text-sm font-semibold text-primary hover:underline dark:text-accent">
            Encerrados ficam no Arquivo ›
          </Link>
        </div>

        {/* Régua de busca colada embaixo das divisórias */}
        <div className="rounded-b-lg border border-t-0 border-border bg-[hsl(var(--mesa-papel2))] p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                aria-label="Buscar processos"
                placeholder={`Número ou ${MARCA.campos.objeto.toLowerCase()}…`} /* curto de propósito (a 400px com "texto maior" um placeholder longo é cortado); o campo leva text-ellipsis */
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="bg-card border-border pl-10 text-foreground text-ellipsis placeholder:text-muted-foreground"
              />
            </div>
            <Select value={ordem} onValueChange={setOrdem}>
              <SelectTrigger className="bg-card border-border text-foreground" aria-label="Ordenar por">
                <ArrowDownUp className="mr-2 h-4 w-4" aria-hidden="true" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proxima-abertura">Próxima abertura</SelectItem>
                <SelectItem value="recentes">Mais recentes</SelectItem>
                <SelectItem value="maior-valor">Maior valor</SelectItem>
                <SelectItem value="numero">Número</SelectItem>
              </SelectContent>
            </Select>
            {/* Mais dois Select no mesmo molde: Situação e Modalidade (aria-label próprio) */}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>{filtrados.length} processo(s) encontrado(s)</span>
            {filtrosAtivos && (
              <button type="button" onClick={limparFiltros} className="font-semibold text-primary hover:underline dark:text-accent">
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {carregando && !jaTem ? (
        <MesaCarregando texto="Buscando as pastas…" />
      ) : erro && !jaTem ? (
        <MesaErroBusca titulo="Não deu para buscar os processos" onTentarDeNovo={atualizar} />
      ) : filtrados.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-[hsl(var(--mesa-papel))] px-4 py-12 text-center">
          <p className="font-display text-2xl font-semibold">Nenhum processo encontrado</p>
          <p className="mt-1 text-muted-foreground">Tente outra busca ou outro filtro.</p>
        </div>
      ) : (
        <ul className="gaveta">
          {filtrados.map((p, i) => (
            <li key={p.id}>
              <PastaNaGaveta processo={p} posicao={i} dados={dadosDaPasta(p)} onExcluir={() => setParaExcluir(p)} />
            </li>
          ))}
        </ul>
      )}
    </FolhaDaTela>
  );
}
```

**Regras**
- A divisória escolhida vive no endereço (`?aba=`), para links de fora abrirem
  nela e o botão Voltar do navegador a manter.
- Busca em um `Input type="search"` com ícone à esquerda (`pl-10`). Filtros em
  `Select` (shadcn) com `bg-card border-border`. Contagem "N processo(s) encontrado(s)"
  + "Limpar filtros" (só a primeira letra maiúscula) só quando há filtro ativo.
- `PastaNaGaveta`: orelha com o número (mono), espessura cresce com o conteúdo,
  escalona por `posicao % 3`; título é o link e cobre a pasta (`after:absolute after:inset-0`);
  botões secundários da pasta ficam acima (`relative z-10`). Troque a **tabela de
  situações** (`constants/process-status.ts`) e os campos da pasta pelos do sistema alvo.
- Ordem padrão pelo que vence primeiro. Texto da ordem é rótulo humano, nunca o id.
- **Vazios (um por causa)** (texto de `listaVazia` em `listaDeProcessos.ts`, com `GEN` e
  `MARCA`; aqui no masculino): busca/filtro → "Nenhum processo encontrado / Tente outra
  busca ou outro filtro."; sem nada ainda → "Nenhum processo ainda / Comece por "{ação
  principal}": poucas perguntas abrem a pasta."; aba vazia → "Nenhum processo em
  andamento / Os encerrados ficam em "{MARCA.campos.arquivo}"."; pendência → "Nenhum
  processo: sem data de abertura / Nenhuma pendência de data nesta lista." (o título usa
  `MARCA.campos.semData`).
- Exclusão: diálogo `DeleteConfirmDialog` ("Excluir processo?" com motivo) e depois
  `toast`/aviso "Processo excluído". Destrutivo = nunca o botão principal da pasta.
- **Nunca**: tabela para a lista principal; paginação visível quando a base
  entrega tudo (traga todas as páginas e conte no cliente); cartões `Card` no
  lugar de pastas; filtro que mude a lista sem mudar a contagem das divisórias.
- **Largura**: régua de busca 1 coluna → 2 (md) → 5 (lg); divisórias rolam na horizontal.

**Variação "Arquivo" (encerrados)**: mesma moldura, `h1` "Processos encerrados",
`DivisoriasDeFiltro` "Ano" e uma tabela (ver 13.3) com colunas número · objeto ·
situação (`CarimboSituacao`) · encerrado em · ações "Abrir a pasta ›" / "Repetir ›".
Vazio: "Nenhum processo encerrado ainda / Quando um processo for concluído ou
arquivado, ele vem para cá." e, com busca, "Nada encontrado com esse texto".
Carregando "Abrindo o arquivo…"; erro "Não deu para abrir o arquivo".

---

## 3. Agenda / calendário (datas e prazos)

**Quando usar**: tudo que tem data e prazo. Calendário do mês à esquerda, "o que
vem pela frente" em bloco de notas à direita.

> **A `pages/Agenda.tsx` da base é uma versão ENXUTA desta receita** (compila e serve de
> ponto de partida): **sem** o filtro de período ("Próximos 7 dias / 30 dias / Tudo à
> frente"), **sem** o `BlocoEspiral` de notas (os compromissos vêm em seções por semana, cada
> uma uma lista com borda, com `Carimbo` carmim `{MARCA.campos.prazo}` quando `c.legal`), com
> o botão **"Levar para o meu calendário (.ics)"** (que quebra linha com "Bem maior" a
> 768–810px) em vez de "Exportar para o calendário do e-mail", e com a coluna do calendário
> `lg:grid-cols-[minmax(0,min(26rem,48%))_minmax(0,1fr)]`. A receita abaixo é a versão
> **completa** (a que o LicitarsAI usa): quem precisar de filtro e notas parte dela, com os
> textos de domínio ("Prazo legal", "Sessão pública", "Lei 14.133") marcados como exemplo.

```tsx
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { DivisoriasDeFiltro } from "@/components/mesa/DivisoriasDeFiltro";
import { BlocoEspiral } from "@/components/mesa/BlocoEspiral";
import { CalendarioDeMesa } from "@/components/mesa/CalendarioDeMesa";
import { Carimbo, Folhinha, MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Periodo = "7" | "30" | "tudo";

const SeparadorDeSemana = ({ children }: { children: React.ReactNode }) => (
  <h3 className="linha-de-caderno pb-1.5 pt-4 font-ui text-sm font-semibold text-muted-foreground">{children}</h3>
);

export default function Agenda() {
  const [periodo, setPeriodo] = useState<Periodo>("7");
  const hoje = new Date();
  const { compromissos, semData, carregando, erro, atualizar } = useAgenda();

  return (
    <FolhaDaTela
      trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: "Prazos e agenda" }]}
      titulo="Prazos e agenda"
      subtitulo="Os prazos da lei e as sessões, contados a partir da data de abertura de cada processo."
      acao={<Button variant="outline" onClick={exportarIcs}>Exportar para o calendário do e-mail</Button>}
    >
      <DivisoriasDeFiltro<Periodo>
        rotulo="Período"
        opcoes={[
          { id: "7", rotulo: "Próximos 7 dias", total: n7 },
          { id: "30", rotulo: "Próximos 30 dias", total: n30 },
          { id: "tudo", rotulo: "Tudo à frente", total: nTudo },
        ]}
        valor={periodo}
        onChange={setPeriodo}
      />

      {carregando ? (
        <MesaCarregando texto="Contando os prazos…" />
      ) : erro ? (
        <MesaErroBusca
          titulo="Não deu para buscar os processos"
          texto="A conexão ou o servidor falhou. Nada foi perdido; tente de novo em instantes."
          onTentarDeNovo={atualizar}
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,min(26rem,48%))_minmax(0,1fr)]">
          <CalendarioDeMesa compromissos={compromissos} hoje={hoje} />

          <BlocoEspiral argolas={7} className="bloco-notas">
            <h2 className="bloco-notas-titulo">O que vem pela frente</h2>
            {visiveis.length === 0 ? (
              <p className="py-4 text-muted-foreground">
                {periodo === "7" ? "Nenhum prazo nos próximos 7 dias." : "Nenhum prazo neste período."}{" "}
                {periodo !== "tudo" && (
                  <button type="button" onClick={() => setPeriodo("tudo")} className="font-semibold text-primary hover:underline dark:text-accent">
                    Ver tudo à frente
                  </button>
                )}
              </p>
            ) : (
              porSemana(visiveis).map((semana) => (
                <div key={semana.chave}>
                  <SeparadorDeSemana>{semana.titulo /* "Esta semana", "Semana de 20/10" */}</SeparadorDeSemana>
                  <ul>
                    {semana.itens.map((c) => (
                      <li key={c.id} className="linha-de-caderno grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3.5 gap-y-2 py-3">
                        <Folhinha data={c.data} />
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2">
                            <Link to={c.para} className="font-mono text-sm font-semibold text-primary hover:underline dark:text-accent">{c.codigo}</Link>
                            {c.tipo === "sessao" ? (
                              <Carimbo tinta="azul">Sessão pública</Carimbo>
                            ) : c.tipo === "publicacao" ? (
                              <Carimbo tinta="verde">Publicação</Carimbo>
                            ) : (
                              <Carimbo tinta={c.diasAte <= 3 ? "carmim" : "ocre"}>
                                Prazo legal · {c.diasAte === 0 ? "vence hoje" : c.diasAte === 1 ? "vence amanhã" : `vence em ${c.diasAte} dias`}
                              </Carimbo>
                            )}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm">{c.descricao}</p>
                          {/* EXEMPLO DE DOMÍNIO (licitações): a citação legal e "Prazo legal" acima são do exemplo; troque pela sua regra */}
                          <p className="text-xs text-muted-foreground">{c.fundamento /* "art. 164 da Lei 14.133/2021" */}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </BlocoEspiral>
        </div>
      )}

      {semData > 0 && (
        <div role="status" className="rounded-md border border-dashed border-[color:var(--color-status-warning)] bg-[hsl(var(--mesa-papel))] p-4 text-sm">
          <p className="font-semibold">{semData} processo(s) sem data de abertura</p>
          <p className="text-muted-foreground">Sem a data da sessão, os prazos deles não podem ser contados.</p>
          <Link to="/processes?aba=sem-data" className="mt-1 inline-block font-semibold text-primary hover:underline dark:text-accent">Preencher a data ›</Link>
        </div>
      )}

      {/* EXEMPLO DE DOMÍNIO (licitações): rodapé jurídico do exemplo; remova em outro domínio */}
      <p className="text-xs text-muted-foreground">
        Leitura conservadora da Lei 14.133/2021: dias úteis sem feriados locais. Confira com o jurídico do órgão.
      </p>
    </FolhaDaTela>
  );
}
```

**Regras**
- `CalendarioDeMesa`: `BlocoEspiral` com `p-5 pt-11`; mês no cabeçalho (serifada) e
  setas "‹ ›" com `aria-label="Mês anterior/próximo"`; células `h-11 sm:h-[46px] border-t`;
  **hoje** = círculo `bg-foreground text-background` de 30px; marca `cal-marca`
  (carmim) = prazo legal, `cal-marca-quadro` (azul) = sessão; legenda com dois
  `Carimbo` ("Prazo legal", "Sessão"; vêm de `MARCA.campos.prazo` e `.evento`, ou das props
  `rotuloPrazo`/`rotuloDestaque`). **O dia não é clicável**: os compromissos do dia
  vão num `<span class="sr-only">` (leitor de tela, `descricaoDoDia`) e o feriado no
  `title` da célula; o botão "Hoje" só aparece fora do mês atual. A lista ao lado, em
  semanas, é quem mostra os compromissos.
- Prazo ≤ 3 dias = carimbo carmim; acima disso, ocre. Sessão = azul; publicação = verde.
- Datas sempre com `Folhinha` (mês em carmim, dia grande, dia da semana).
- A lista é agrupada por semana ("Esta semana", "Semana de dd/mm"), cada título
  numa `linha-de-caderno`.
- Aviso honesto de método ("leitura conservadora…") **sempre** no pé quando o
  sistema calcula prazos.
- **Nunca**: calendário de biblioteca externa com estilo próprio; marcar prazo só
  por cor (o carimbo diz "vence hoje"); esconder o que não pôde ser calculado
  (mostre a caixa "N sem data").
- **Largura**: abaixo de lg o calendário vem em cima e as notas embaixo. Em lg+ a primeira
  coluna é `minmax(0,min(26rem,48%))`: o `min(…, 48%)` impede que o calendário (26rem, que
  cresce com "texto maior") esmague as notas até uma tira de uma letra por linha e estoure
  a folha (defeito medido a 1024px com "Bem maior" quando a coluna era fixa em 26rem).
  O botão de exportar o calendário usa `h-auto max-w-full whitespace-normal text-left`
  para quebrar linha: com "Bem maior" e o menu fixo (768–810px) o rótulo longo passava da
  folha.

---

## 4. Biblioteca / fichas de consulta

**Quando usar**: acervo para consulta (exemplares, modelos, normas) com busca e
um painel lateral de apoio. Itens são fichas de fichário.

```tsx
import { Download, Loader2, Search } from "lucide-react";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { AvisoAtualizacaoFalhou, MesaErroBusca } from "@/components/mesa/Mesa";
import { Input } from "@/components/ui/input";

const GIROS = ["-0.4deg", "0.3deg", "-0.2deg", "0.4deg"];
const giroDe = (id: string) => GIROS[[...id].reduce((s, ch) => s + ch.charCodeAt(0), 0) % GIROS.length];

const Ficha = ({ doc }: { doc: Exemplar }) => (
  <li className="ficha flex flex-col" style={{ ["--giro" as string]: giroDe(doc.id) }}>
    <h4 className="font-display text-xl font-semibold leading-[26px]">{doc.nome}</h4>
    <p className="mt-1 text-sm leading-[26px] text-muted-foreground">
      <span className="font-medium text-foreground">{doc.orgao}</span>
      <br />
      atualizado em <span className="font-mono text-xs">{new Date(doc.atualizadoEm).toLocaleDateString("pt-BR")}</span>
    </p>
    {doc.descricao && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{doc.descricao}</p>}
    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3">
      <Link to={`/documents/${doc.id}`} aria-label={`Abrir ${doc.nome}`} className="whitespace-nowrap text-sm font-semibold text-primary hover:underline dark:text-accent">
        Abrir ›
      </Link>
      {doc.urlDocx ? (
        <a href={doc.urlDocx} target="_blank" rel="noopener noreferrer" aria-label={`Baixar ${doc.nome} em .docx`}
           className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-primary hover:underline dark:text-accent">
          <Download className="h-4 w-4" aria-hidden="true" />
          .docx
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">sem .docx gerado</span>
      )}
    </div>
  </li>
);

export default function Biblioteca() {
  const [busca, setBusca] = useState("");
  const { dados, carregando, erro, atualizar } = useExemplares();
  const grupos = agruparPorTipo(filtrar(dados ?? [], busca));
  const total = dados?.length ?? 0;

  return (
    <FolhaDaTela
      trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: "Biblioteca" }]}
      titulo="Biblioteca"
      subtitulo="O fichário da repartição: documentos de outros órgãos para servir de exemplo, a lei que o sistema usa nos cálculos e os modelos do seu órgão."
    >
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section aria-labelledby="exemplares">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 id="exemplares" className="font-display text-2xl font-semibold">Exemplares de outros órgãos</h2>
              <p className="text-sm text-muted-foreground">Escolhidos para servir de referência. Baixe, leia e adapte ao seu caso.</p>
            </div>
            {total > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input type="search" value={busca} onChange={(e) => setBusca(e.target.value)}
                       placeholder="Nome, órgão ou tipo" aria-label="Buscar nos exemplares" className="pl-9" />
              </div>
            )}
          </div>

          <div className="mt-6">
            {erro && !!dados && <AvisoAtualizacaoFalhou onTentarDeNovo={atualizar} />}
            {carregando ? (
              <p role="status" className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Buscando os exemplares…
              </p>
            ) : erro && !dados ? (
              <MesaErroBusca titulo="Não deu para buscar os exemplares" onTentarDeNovo={atualizar} />
            ) : total === 0 ? (
              <p className="text-muted-foreground">Ainda não há exemplares. Quando um administrador marcar um documento como exemplar, ele aparece aqui para todos os órgãos.</p>
            ) : grupos.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhum exemplar com “{busca.trim()}”.{" "}
                <button type="button" onClick={() => setBusca("")} className="font-semibold text-primary hover:underline dark:text-accent">Limpar a busca</button>
              </p>
            ) : (
              <div className="space-y-8">
                {grupos.map((g) => (
                  <div key={g.tipo}>
                    <h3 className="mesa-secao mb-4 text-base">{g.tipo} · {g.itens.length}</h3>
                    <ul className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                      {g.itens.map((d) => <Ficha key={d.id} doc={d} />)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Lateral: bilhete + cartão de apoio; lg:pt-14 alinha com a primeira ficha */}
        <div className="space-y-7 lg:pt-14">
          <section aria-labelledby="pergunte" className="bilhete">
            <h2 id="pergunte" className="font-display text-xl font-semibold">Pergunte à IA</h2>
            <p className="mt-2 text-sm">A IA responde olhando o processo. Abra o documento em que você está trabalhando e use <b>Conversar com a IA</b>.</p>
            <p className="mt-2 text-sm opacity-80">A IA orienta; a decisão e a assinatura são sempre do servidor.</p>
            <Link to="/processes" className="mt-3 inline-block text-sm font-semibold underline">Ir para os processos ›</Link>
          </section>
          <section aria-labelledby="modelos" className="rounded-md border border-border bg-[hsl(var(--mesa-papel2))] p-4">
            <h2 id="modelos" className="font-display text-xl font-semibold">Modelos do órgão</h2>
            <p className="mt-2 text-sm text-muted-foreground">O texto que vem antes e depois do conteúdo da IA em cada .docx: cabeçalho, preâmbulo e fecho.</p>
            <Link to="/templates" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline dark:text-accent">Ver os modelos ›</Link>
          </section>
        </div>
      </div>

      {/* Seção da lei, com âncora #lei: ver 13.8 */}
      <section id="lei" aria-labelledby="lei-titulo" className="scroll-mt-4 border-t border-border pt-6">
        <h2 id="lei-titulo" className="font-display text-2xl font-semibold">A lei que o sistema usa</h2>
        <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {artigos.map((a) => (
            <li key={a.numero} className="border-t border-border/70 py-2.5">
              <button type="button" onClick={() => lei.abrir(a.numero)}
                      className="group flex w-full items-baseline gap-3 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="w-20 shrink-0 whitespace-nowrap font-mono text-sm text-muted-foreground">Art. {a.numero}</span>
                <span className="font-semibold group-hover:underline">{a.titulo}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </FolhaDaTela>
  );
}
```

**Regras**: ficha com **giro estável por id** (soma dos códigos de caracteres % 4),
nunca aleatório a cada render. Agrupe por tipo com `h3.mesa-secao`. Busca só
aparece com ≥ 1 item. Rótulo "sem .docx gerado" quando não há arquivo (nunca botão
morto). Um bilhete por tela. **Nunca**: ficha como `Card`; imagens de capa; busca
com botão "Buscar" (filtra ao digitar).

**Como `.ficha` e `.bilhete` são feitos** (já estão no `index.css`; só use a classe):
- `.ficha` = papel `--mesa-papel` com **pauta de 26px** (linhas `--mesa-pauta`), um
  fio carmim a 1,875rem do topo (o cabeçalho), um furo de 12px centrado no alto,
  `min-height: 13rem`, raio 3px e inclinação por `--giro` (`style={{ ["--giro" as string]: "-0.4deg" }}`,
  valores entre −0,4° e 0,4°). **Todo texto dentro da ficha usa `leading-[26px]`**
  (ou múltiplo) para assentar sobre a pauta; o título `h4` em `font-display text-xl`.
- `.bilhete` = post-it (`--mesa-bilhete` / `--mesa-bilhete-texto`, amarelo nos dois
  temas, **o texto escuro é do token, não de `text-foreground`**), fita translúcida
  de 44×12px no alto e giro fixo de −1°. Conteúdo: `h2 font-display text-xl` + 1–2
  frases `text-sm` + link `font-semibold underline` (sublinhado, pois o azul de link
  não tem contraste sobre o amarelo). Largura: a da coluna lateral; nunca tela cheia.

**Variação "modelos" (lista + editor)**: `grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6`;
à esquerda linhas-botão `aria-pressed` (`rounded-lg border p-3 text-left`,
selecionada `border-primary bg-card shadow-sm dark:border-accent`); à direita folha
com o texto num `Textarea` e botões "Editar o modelo" / "Criar versão do órgão" /
**"Salvar modelo"** (`--cta`). Erro ao salvar: "Não deu para salvar. Confira se você
ainda tem permissão e tente de novo; o texto continua aqui." Sucesso (aviso de
resultado): "Modelo salvo. Os próximos .docx de {tipo} já saem com ele."

---

## 5. Quadro / painéis com números

**Quando usar**: visão gerencial. Duas páginas de um livro aberto (≥ lg): números
à esquerda, gráficos à direita; abaixo, uma faixa de ritmo e a lista filtrável.

```tsx
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca, AvisoAtualizacaoFalhou } from "@/components/mesa/Mesa";

/** Uma linha do livro: nome, número grande à direita, caminho para ver. */
const Cartao = ({ rotulo, valor, detalhe, para, alerta }: { rotulo: string; valor: number | string; detalhe: string; para?: string; alerta?: boolean }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-b border-dotted border-[hsl(var(--mesa-linha))] py-3 first:pt-0">
    <p className="col-start-1 font-semibold">{rotulo}</p>
    <p className={`col-start-2 row-span-3 row-start-1 self-center text-right font-display text-4xl font-semibold leading-none lining-nums tabular-nums ${alerta ? "text-[color:var(--color-status-error)]" : ""}`}>
      {valor}
    </p>
    <p className="col-start-1 text-sm text-muted-foreground">{detalhe}</p>
    {para && (
      <Link to={para} className="col-start-1 mt-1 text-sm font-semibold text-primary hover:underline dark:text-accent">
        Ver<span className="sr-only"> {rotulo.toLowerCase()}</span> ›
      </Link>
    )}
  </div>
);

export default function Paineis() {
  const { dados, carregando, erro, atualizar } = usePaineis();
  if (carregando) return <MesaCarregando texto="Montando os painéis…" />;
  if (erro && !dados) return <MesaErroBusca titulo="Não deu para montar os painéis" onTentarDeNovo={atualizar} />;

  return (
    <FolhaDaTela
      trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: "Painéis" }]}
      titulo="Painéis"
      subtitulo="Como está a carteira do órgão hoje, com o caminho para cada pasta."
    >
      {erro && <AvisoAtualizacaoFalhou onTentarDeNovo={atualizar} />}

      <div className="livro-aberto grid grid-cols-1 lg:grid-cols-2">
        <div className="livro-pagina livro-pagina-esq space-y-6">
          <div>
            <h2 className="mb-4 font-display text-3xl font-medium">Situação da carteira</h2>
            <Cartao rotulo="Ativos" valor={42} detalhe="abertos ou em andamento" para="/processes" />
            {/* EXEMPLO DE DOMÍNIO (licitações): "Prazo legal" e "impugnação, resposta, recurso" são do exemplo; troque pelos do seu sistema (na base: MARCA.campos) */}
            <Cartao rotulo="Prazo legal nos próximos 7 dias" valor={3} detalhe="impugnação, resposta, recurso" para="/agenda" alerta />
            <Cartao rotulo="Encerrados" valor={118} detalhe="concluídos ou arquivados" para="/arquivo" />
          </div>
          <ResumoDoDia kpis={kpis} />   {/* bloco azul, ver receita 1 */}
        </div>
        <div className="livro-pagina space-y-8">
          <StatusDonut byStatus={porStatus} selected={statusFiltro} onSelect={setStatusFiltro} semMoldura />
          <ModalityBar data={porModalidade} selected={modalidadeFiltro} onSelect={setModalidadeFiltro} semMoldura />
        </div>
      </div>

      <RitmoDoOrgao />   {/* barras em CSS puro, ver 13.6 */}
    </FolhaDaTela>
  );
}
```

**Regras**
- Número em `font-display text-4xl font-semibold leading-none lining-nums tabular-nums`
  (**`lining-nums` sempre** em número grande de Cormorant: sem ele o "1" parece "I" e o
  "6" desce da linha);
  **alerta** (algo a resolver) em `text-[color:var(--color-status-error)]`.
- Quando um número não pôde ser calculado, mostre `…` (calculando) ou `?` (falhou)
  e diga por quê no detalhe — nunca `0` que tranquiliza à toa.
- Todo número que leva a uma lista tem o link "Ver ›" (com `sr-only` do nome).
- Gráficos: ver 13.6. Vazio do painel: "Nenhum processo cadastrado".
- **Nunca**: ícone grande colorido ao lado do número; cartões `Card` em grade de
  KPI; legenda de gráfico em `text-platinum-*` (use `text-foreground` /
  `text-muted-foreground`); mais de 2 gráficos por página do livro.
- **Largura**: < lg o livro vira uma folha só, páginas empilhadas, sem a dobra.

---

## 6. Formulário (curto em perguntas, ou longo em seções)

**Quando usar**: criar ou editar. Formulário **curto** = "N perguntas" numeradas
com a folha ao lado mostrando a capa em preparo. Formulário **longo** = seções
em folhas, dentro da pasta (edição) ou da `FolhaDaTela` (criação).

> **O "Salvar" da base é simulado, mas guarda na memória.** `assets/base/src/pages/Formulario.tsx`
> chama `adicionarProcesso` (`hooks/useMesaDados.ts`: um armazém em memória com
> `useSyncExternalStore`), avisa "…Os dados ficam só nesta demonstração." e volta para a
> lista: o item novo **aparece na lista, na busca e na agenda e abre no `Item`**, mas **some
> ao recarregar a página** (nada vai a servidor). Para o sistema alvo, troque o corpo de
> `salvar` por uma chamada à API real (e só então avise "salvo"); enquanto não há
> servidor, deixe o armazém e **diga ao usuário que é simulado** no relatório final.
> Nunca avise "salvo" sem que algo tenha sido guardado.

### 6a. Curto — "três perguntas" (modelo: `NovaContratacao.tsx`)

```tsx
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trilha } from "@/components/mesa/Trilha";
import { cn } from "@/lib/utils";

/** Esfera de andamento: feita (cinza cheia) · atual (escura com anel) · por responder (vazada) */
const Esfera = ({ feita, atual, rotulo }: { feita: boolean; atual: boolean; rotulo: string }) => (
  <li className="flex items-center gap-2 text-sm">
    <span aria-hidden="true" className={cn("inline-block rounded-full",
      feita ? "h-2.5 w-2.5 bg-muted-foreground/50"
      : atual ? "h-3 w-3 bg-foreground ring-2 ring-muted-foreground/40"
      : "h-2.5 w-2.5 border border-muted-foreground/60")} />
    <span className={cn(atual && "font-semibold")}>
      {rotulo}
      <span className="sr-only">{feita ? ", respondida" : ", por responder"}</span>
    </span>
  </li>
);

export default function NovoItem() {
  const respondidas = [objeto.trim().length > 0, setor.trim().length > 0, prazo.length > 0];
  const atual = respondidas.findIndex((r) => !r);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Trilha passos={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: "Nova contratação" }]} />
      <header>
        <h1 className="text-4xl font-semibold">Três perguntas, e a pasta está pronta para abrir</h1>
        <ol className="mt-3 flex flex-wrap gap-5" aria-label="Andamento das perguntas">
          {["O quê", "Quem pediu", "Para quando"].map((r, i) => <Esfera key={r} rotulo={r} feita={respondidas[i]} atual={i === atual} />)}
        </ol>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form className="folha space-y-6 p-6" onSubmit={(e) => { e.preventDefault(); if (objeto.trim()) continuar(); }}>
          <div className="space-y-2">
            <Label htmlFor="nova-objeto" className="text-base font-semibold">1. O que você precisa contratar?</Label>
            <Textarea id="nova-objeto" value={objeto} onChange={(e) => setObjeto(e.target.value)} rows={3}
                      placeholder="Ex.: conjuntos de mesa e cadeira para as salas de aula" />
            <p className="text-xs text-muted-foreground">Quanto mais detalhado, melhores os documentos que a IA escreve.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova-setor" className="text-base font-semibold">2. Qual setor pediu?</Label>
            <Input id="nova-setor" value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Ex.: Secretaria de Educação" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova-prazo" className="text-base font-semibold">3. Para quando precisa estar disponível?</Label>
            <Input id="nova-prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className="w-56" />
            {/* ajuda neutra — EXEMPLO DE DOMÍNIO (licitações): troque pela regra de prazo do seu sistema */}
            <p className="text-sm text-muted-foreground">Para a sessão acontecer até 20/11/2026, o edital precisa sair até <b className="text-foreground">05/11/2026</b>.</p>
            {/* ou erro de regra: */}
            {/* <p role="alert" className="text-sm font-semibold text-destructive">Não dá tempo: … Escolha uma data mais adiante.</p> */}
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
            <Button type="submit" disabled={!objeto.trim()}>Continuar para a ficha ›</Button>
            <Link to={MARCA.rotaInicial} className="text-sm font-semibold text-primary hover:underline dark:text-accent">Voltar ao início</Link>
          </div>
        </form>

        {/* Folha ao lado: o que a pessoa já respondeu, em tempo real */}
        <aside aria-labelledby="capa-em-preparo" className="space-y-4">
          <div className="rounded-xl border border-dashed border-border bg-card/70 p-4">
            <p id="capa-em-preparo" className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Capa em preparo · pasta nova, ainda sem número
            </p>
            <p className="mt-2 font-display text-xl leading-snug">{objeto.trim() || "O objeto aparece aqui"}</p>
            {setor.trim() && <p className="mt-1 text-sm text-muted-foreground">Pedido por {setor.trim()}</p>}
          </div>

          {/* Aviso de parecido (ouro): só quando existe */}
          <div role="status" className="rounded-xl border border-[color:var(--color-status-warning)] bg-gold/10 p-4 text-sm">
            <p className="font-semibold">Já existe um processo parecido</p>
            {/* lista de links + "Se for a mesma compra, abra a pasta existente; se for outra, siga." */}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <Label htmlFor="nova-modalidade" className="font-semibold">Modalidade</Label>
            {/* Prefira o <Select> de "@/components/ui/select" (herda foco, teclado e tema).
                O <select> nativo abaixo também está certo, desde que leve estas classes: */}
            <select id="nova-modalidade" value={modalidadeId} onChange={(e) => setModalidadeId(e.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Escolha a modalidade…</option>
              {/* options */}
            </select>
          </div>
        </aside>
      </div>
    </div>
  );
}
```

### 6b. Longo — seções em folhas (criação em `FolhaDaTela`, edição dentro da pasta)

```tsx
<FolhaDaTela
  trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: "Processos", para: "/processes" }, { rotulo: "Nova contratação" }]}
  titulo="Ficha do processo"
  subtitulo="O que está aqui sai na capa dos autos e em todo documento gerado."
>
  <form onSubmit={salvar} className="space-y-8">
    {erroGeral && (
      <p role="alert" className="rounded-md border border-dashed border-[color:var(--color-status-error)] bg-[hsl(var(--mesa-papel))] p-3 text-sm font-semibold text-destructive">
        {erroGeral}
      </p>
    )}

    <section aria-labelledby="sec-identificacao" className="folha-simples space-y-4 p-5">
      <h2 id="sec-identificacao" className="font-display text-2xl font-semibold">Identificação</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="f-numero" className="text-base font-semibold">Número do processo</Label>
          <Input id="f-numero" className="h-10 font-mono" aria-invalid={!!erros.numero} aria-describedby="f-numero-ajuda" />
          <p id="f-numero-ajuda" className="text-xs text-muted-foreground">Como aparece no SEI ou no protocolo do órgão.</p>
          {erros.numero && <p role="alert" className="text-sm font-semibold text-destructive">{erros.numero}</p>}
        </div>
        {/* mais campos no mesmo molde */}
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-objeto" className="text-base font-semibold">Objeto</Label>
        <Textarea id="f-objeto" rows={4} />
      </div>
    </section>

    {/* mais seções: Datas, Valores, Responsável… — cada uma uma <section class="folha-simples"> */}

    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
      <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
      <Button type="submit" disabled={salvando}>
        {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {salvando ? "Salvando…" : "Salvar alterações"}
      </Button>
    </div>
  </form>
</FolhaDaTela>
```

**Regras**
- Rótulos `text-base font-semibold`; ajuda `text-xs text-muted-foreground`; campos
  `h-10` (login `h-11`); `Textarea rows={3|4}`; datas `type="date"` com `w-56`;
  números/códigos `font-mono`; moeda em `R$` com máscara no campo.
- **Campo de data**: `Input type="date"` com `w-56` e `font-mono`; mostre a data já
  escolhida por extenso na ajuda ("Sessão em 20/11/2026"), pois o seletor do
  navegador varia. **Campo de valor (BRL)**: `Input inputMode="decimal"` com
  `font-mono text-right`, prefixo visual "R$" (`span` `text-muted-foreground` à
  esquerda, `pl-10`), formatando ao sair do campo
  (`n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })`) e
  guardando o **número**, nunca o texto; valor negativo ou vazio vira erro de
  campo ("Informe um valor maior que zero.").
- **Depois de salvar**: `avisar({ texto: "Ficha salva." })` (13.1). A faixa de
  resultado é limpa quando a rota muda, **exceto** que um aviso dado logo antes de
  `navigate` sobrevive à navegação (janela de 1,5 s em `AvisosDeResultado`; essa é a
  única divergência do componente do LicitarsAI, onde o aviso se perdia). Portanto o
  fluxo normal é `avisar({...}); navigate("/lista")` e o aviso aparece na tela de
  destino. Na edição, em vez de navegar, **fique na tela** e dê o aviso. Em caso de
  erro, **não navegue**: mostre o erro de campo/geral e mantenha os dados digitados.
- Erro de campo: `role="alert" text-sm font-semibold text-destructive` logo abaixo e
  `aria-invalid` + `aria-describedby`. Erro geral: caixa tracejada carmim no alto.
- **Regra de negócio dita em linguagem comum, com o artigo da lei como
  `CitacaoDaLei`** (abre a lei ao lado — 13.8). Aviso de "parecido": ouro com
  `bg-gold/10` e borda de aviso (`--color-status-warning`).
- Botões: submit à **esquerda** no formulário curto ("Continuar para a ficha ›") e à
  **direita** no longo ("Cancelar" outline + "Salvar alterações" padrão). Um só
  botão principal; nunca dois azuis.
- Salvando: botão desabilitado com `Loader2`, texto "Salvando…". Depois:
  aviso de resultado ("Ficha salva.") — 13.1.
- Sair com alterações não salvas: `ConfirmarAto` com `motivo="nenhum"`,
  `rotuloConfirmar="Sair sem salvar"`, `rotuloVoltar="Continuar editando"`.
- **Nunca**: `Card`+`CardHeader` para seção (use `folha-simples` + `h2` serifado);
  asterisco vermelho sozinho (diga "obrigatório" no rótulo ou na ajuda);
  `placeholder` no lugar de rótulo; validação só ao enviar quando dá para avisar
  ao sair do campo; `ProcessFormV3` como modelo visual (só campos e regras).
- **Largura**: grids de campos viram 1 coluna; botões finais empilham com
  `flex-wrap`; coluna lateral (aside) desce para baixo do formulário em < lg.

---

## 7. Item aberto (a pasta com abas de ferramentas)

**Quando usar**: a tela de UM item do objeto principal e as telas de trabalho
sobre ele (linha do tempo, documentos, autos, prazos, histórico, ficha). A pasta
é uma **capa** com divisórias no alto e ferramentas na borda direita; o trabalho
da aba vai dentro da capa.

```tsx
import { PastaDoProcesso } from "@/components/mesa/PastaDoProcesso";
import { MesaCarregando, MesaErroBusca, AvisoAtualizacaoFalhou } from "@/components/mesa/Mesa";

export default function TelaDoItem() {
  const { item, carregando, erro, atualizar } = useItem(id);

  if (carregando) return <MesaCarregando texto="Abrindo a pasta…" />;
  if (!item)
    return erro ? (
      <MesaErroBusca titulo="Não deu para abrir a pasta" onTentarDeNovo={atualizar} />
    ) : (
      <AvisoDeEstado rotulo="Não encontrado" titulo="Esta pasta não existe mais"
        acoes={<Button asChild><Link to="/processes">Voltar à lista ›</Link></Button>}>
        O processo pode ter sido excluído, ou o link estar incompleto.
      </AvisoDeEstado>
    );

  return (
    <div className="mx-auto max-w-7xl">
      <PastaDoProcesso
        processo={item}
        acoes={<Button onClick={() => navigate(`/processes/${id}/edit`)}><Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />Editar a ficha</Button>}
      >
        <div className="space-y-8">
          {erro && <AvisoAtualizacaoFalhou onTentarDeNovo={atualizar} />}
          {/* conteúdo da aba */}
        </div>
      </PastaDoProcesso>
    </div>
  );
}
```

**Capa**: `compacta` nas telas de ferramenta (Documentos, Autos, Prazos, Histórico,
Ficha) — a capa vira uma linha (número + modalidade + `CarimboSituacao` + objeto) e
sobra espaço para o trabalho; a capa cheia (número `text-5xl`, objeto serifado,
carimbo grande + `CarimboDatado ato="Autuado"`, `dl` de 5 dados, `FasesDaLicitacao`)
só na primeira aba (**Linha do tempo**).

**Divisórias** (`DIVISORIAS_DO_PROCESSO` em `ferramentas.ts`): Linha do tempo ·
Documentos · Autos · Prazos · Histórico · Ficha. **Ferramentas** (borda direita,
texto vertical em xl; fileira de pílulas acima da pasta no celular):
Diário · Repetir. A aba acesa vem da **rota** (`useMatch("/processes/:id/:aba/*")`),
nunca de estado. Para outro sistema: troque as listas em `ferramentas.ts`, mantendo
o máximo de 6 divisórias + 2–3 ferramentas.

**Conteúdo de cada aba** (sempre com `h2` serifado + 1 frase de apoio no alto):
- *Linha do tempo*: `ResumoDaPasta` + cartões de etapa (pendente / atual /
  dispensada / concluída — ver 05) com "Gerar" `--cta`, "Criar/Editar" outline,
  "Dispensar" outline carmim (abre `ConfirmarAto`, 13.2).
- *Documentos*: tabela (13.3) com "Etapas da modalidade · N de M feitas" e
  "Outros documentos"; ação "+ Adicionar documento". Cada linha com
  **`BaixarDocumento`** (8) e "Abrir ›".
- *Autos*: página para o papel (13.7).
- *Prazos*: simulador — formulário curto (6a) + resultado em `BlocoEspiral`.
- *Histórico*: livro de registro (abaixo).
- *Ficha*: formulário longo (6b) com `SituacaoDaFicha` na lateral `xl:grid-cols-[minmax(0,1fr)_17rem]`.

**Histórico (livro de registro)**:
```tsx
<div className="space-y-5">
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="text-2xl font-semibold">Livro de registro</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">A abertura do processo, as versões dos documentos e as dispensas de etapa, do mais recente ao mais antigo.</p>
    </div>
    <dl className="grid grid-cols-1 divide-y divide-border rounded border border-border text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {/* três pares: dt = font-ui text-xs font-semibold uppercase tracking-[0.12em] (12px; o exemplo `HistoricoProcesso.tsx` usa 10px, abaixo da regra de 06); dd = font-mono */}
    </dl>
  </div>
  <DivisoriasDeFiltro rotulo="Filtrar o histórico" opcoes={[/* Tudo · Versões · IA · Atos do processo */]} valor={filtro} onChange={setFiltro} />
  <div className="folha folha-furada margem-registro p-5">
    {/* por dia: Folhinha + registros: hora em font-mono, Carimbo da natureza, texto, link "Ver ›" */}
  </div>
</div>
```
Vazios: "Nada registrado ainda neste processo." / "Nenhum registro deste tipo."

**Regras**: o número do processo é sempre `font-mono` e quebra com
`[overflow-wrap:anywhere]`; o carimbo grande da capa bate **uma vez por visita**
(`bateAoAbrir="capa-{id}-{status}"`); toda ação destrutiva da pasta pede
`ConfirmarAto`. `MesaPagina` (cabeçalho da ferramenta marfim no claro/ardósia no escuro + folhas subindo) é para
**item simples ou relatório avulso** que não tem divisórias (ex.:
"Processos do período" com `imprimivel` — o arquivo de exemplo `LivroGestao.tsx`
mantém o nome histórico); **não** use `MesaPagina` e `PastaDoProcesso` juntas (a
`PastaDoProcesso` já traz trilha, capa e divisórias). Nas telas de trabalho do item,
`ProcessoNaMesa` cuida de buscar, carregando e erro e entrega a `PastaDoProcesso`.
Modelo compilável de item simples: `assets/base/src/pages/Item.tsx`.
**Nunca**: abas do shadcn (`Tabs`) no lugar das divisórias; `Card` como capa;
refazer o erro/carregando legado de `ProcessEditV3`/`ProcessTimelineV3` (spinner
com `border-accent-primary`, `gradient-primary`, diálogos `bg-navy-800`) — use
`MesaCarregando`, `MesaErroBusca`, `AvisoDeEstado` e `ConfirmarAto`.
**Largura**: divisórias rolam na horizontal; ferramentas viram pílulas acima da
capa em < xl; `dl` da capa em 1 → 2 → 5 colunas.

---

## 8. Documento + baixar .docx

**Quando usar**: ver o texto de um documento gerado e **baixá-lo**. O botão de
baixar é o ponto mais importante do fluxo: **sempre visível e rotulado**, nunca
dentro de menu. Modelo mínimo que compila: `assets/base/src/pages/Documento.tsx`
(rota `/documents/:id`: `FolhaDaTela` + `BaixarDocumento` na ação do alto + a folha com o
texto. **Documento por item**: `useProcessoDaMesa(id)` acha o item; se o id é o de um item, o
texto é o relatório montado por `blocosDoItem(item)` (`utils/blocosDoItem.ts`; os subtítulos
vêm de `MARCA.campos`) e o título da tela, igual ao do arquivo, é `nomeDoDocumentoDoItem(item)`
("Ficha {código}"); se o id é só dígitos mas não é de item, vale um conteúdo de demonstração
neutro (`BLOCOS`, título "Documento"); enquanto o item carrega, `MesaCarregando` ("Abrindo o
documento…"); id que não é número mostra o `AvisoDeEstado` "Este documento não existe" (com
`nivel={2}`, porque dentro da `FolhaDaTela` já há o `h1`) e esconde o botão. O botão e a folha
mostram **o mesmo conteúdo**: a tela e o arquivo não divergem. Em sistema real, troque
`blocosDoItem` pela leitura do documento no servidor. A tela vem envolvida
em `.area-impressao`, então o Ctrl+P imprime só a folha, sem faixa, menu, trilha nem botões;
na pasta, o botão "Abrir como documento" de `Item.tsx` leva a esta rota).
**A casca é uma só** (tabela de `references/05`): documento = `FolhaDaTela`. O esqueleto
abaixo é a **variante completa com painel lateral** ("o que fazer com o documento"): sem a
lateral, fique com a `FolhaDaTela` da base; com ela, use este `div` + `Trilha` e envolva
a folha em `.area-impressao` (e a lateral em `nao-imprimir`) para que também imprima limpo.

```tsx
<div className="mx-auto max-w-6xl space-y-6">
  {atualizacaoFalhou && <AvisoAtualizacaoFalhou onTentarDeNovo={recarregar} />}
  <Trilha passos={[
    { rotulo: MARCA.inicio, para: MARCA.rotaInicial },
    { rotulo: "Processos", para: "/processes" },
    { rotulo: processo.code, para: `/processes/${processo.id}`, numero: true },
    { rotulo: d.nome, para: `/documents/${d.id}` },
    { rotulo: "Documento pronto" },
  ]} />
  <header>
    <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Documento pronto</p>
    <h1 className="text-4xl font-semibold [overflow-wrap:anywhere]">{d.nome}</h1>
  </header>

  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
    {/* Folha com o texto em serifada */}
    <article aria-label={`Texto de ${d.nome}`} className="folha p-6 sm:p-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-border pb-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Processo nº <span className="font-mono text-foreground">{processo.code}</span></p>
          <Carimbo tinta="violeta">Versão 3 · IA</Carimbo>
        </div>
      </div>
      <TextoDoDocumento markdown={versao.conteudo} />
    </article>

    {/* Lateral: o que fazer com o documento */}
    <aside aria-label="O que fazer com o documento" className="space-y-4 lg:sticky lg:top-0">
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-semibold">Leia antes de usar</h2>
        <p className="mt-1 text-sm text-muted-foreground">A IA escreve; quem decide e assina é você.</p>
        <div className="mt-4 flex flex-col gap-2">
          <Button asChild><Link to={`/documents/${d.id}`}>Abrir no editor ›</Link></Button>
          {d.arquivoId && (
            <Button variant="outline" onClick={baixar} disabled={baixando}>
              {baixando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="mr-2 h-4 w-4" aria-hidden="true" />}
              Baixar o .docx gerado pela IA
            </Button>
          )}
          {d.arquivoId && versao && versao.origem !== "IA" && (
            <p className="text-xs text-muted-foreground">O .docx é o da geração pela IA: não traz as edições da versão nº {versao.numero} mostrada aqui.</p>
          )}
          {erroAoBaixar && <p role="alert" className="text-sm text-destructive">Não deu para baixar agora. Tente de novo em instantes.</p>}
        </div>
      </section>

      <section className="rounded-xl border border-[hsl(var(--tinta-violeta)/0.45)] bg-card p-5">
        <h2 className="text-xl font-semibold tinta-violeta">Pedir um ajuste à IA</h2>
        <p className="mt-1 text-sm text-muted-foreground">Diga na conversa o que mudar. Cada ajuste vira uma versão nova, e esta continua guardada.</p>
        <Link to={`/chat8/${d.id}`} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline dark:text-accent">Conversar com a IA ›</Link>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-semibold">Próximo passo</h2>
        <p className="mt-1 text-sm text-muted-foreground">Na linha do tempo do processo, siga para a etapa seguinte.</p>
        <Link to={`/processes/${processo.id}`} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline dark:text-accent">Voltar à linha do tempo ›</Link>
      </section>
    </aside>
  </div>
</div>
```

**`BaixarDocumento`** (dentro de tabelas e cartões — `assets/base/src/components/documents/BaixarDocumento.tsx`):
`Button size="sm"` com ícone `Download` + o `rotulo` recebido (padrão **"Baixar .docx"**;
as telas da base passam "Baixar o documento (.docx)" e "Baixar a ficha (.docx)"; →
"Baixando…" com `Loader2`), `variant="outline"` em listas, `title="Baixar o arquivo .docx deste documento."` (neutro: a
versão antiga dizia que o arquivo era "o gerado originalmente", o que só vale com IA e edição;
só ponha esse aviso se o seu sistema tiver as duas coisas), erro ao lado
`role="alert" text-xs text-destructive` "Não baixou. Tente de novo."; **só aparece quando
o arquivo existe** (sem arquivo: texto "sem .docx gerado", nunca botão morto).
`stopPropagation` para não abrir o cartão em que estiver; a classe `nao-imprimir` tira o
botão do papel. O arquivo é gerado por `utils/baixarDocx.ts`: na base, um **.docx real**
(zip sem compressão + XML mínimo, sem dependência; o Word abre). O **conteúdo** vem da prop
opcional `blocos?: BlocoDocx[]` de `BaixarDocumento` (repassada a `baixarDocx(id, nome, blocos, titulo)`;
`nome` é o nome do arquivo baixado e o rótulo acessível do botão, e `titulo?` é o título impresso na
primeira linha do .docx: sem ele vale o `nome`, então passe `titulo` quando o nome do arquivo tem
código ou data e o título deve ser limpo);
`BlocoDocx` (exportado por `utils/baixarDocx.ts`) é `string | { titulo: string }`: texto = parágrafo,
`{ titulo }` = subtítulo em negrito. Exemplo:
`<BaixarDocumento nome="Declaração" idDoArquivo="1" blocos={["Declaramos que…", { titulo: "Observações" }, "Sem pendências."]} />`.
**Toda tela que usa o botão precisa passar `blocos`**: na base, `Documento.tsx` passa o
conteúdo da folha (o relatório do item, `blocosDoItem(item)`, ou o conteúdo de demonstração) e
`Item.tsx` passa `blocosDoItem(p)` (a ficha do item, com os rótulos de `MARCA.campos`) e
`nome={nomeDoDocumentoDoItem(p)}`, com `rotulo="Baixar a ficha (.docx)"`.
Sem `blocos` sai só o título e um parágrafo neutro, "Documento sem conteúdo informado." (o botão
funciona, o conteúdo não é o do seu documento). Para mostrar **na tela o mesmo conteúdo** que vai no
arquivo, use `blocosParaMarkdown(blocos)` (exportado por `utils/baixarDocx.ts`) e passe o resultado a
`markdownDocumentoToSafeHtml` (`utils/markdown.ts`); assim tela e arquivo não divergem. Com servidor,
troque o corpo de `baixarDocx` por "buscar o arquivo e `salvar(blob, nome)`".
`gerarDocx(titulo, blocos)` também é exportado, se precisar dos bytes.

**Regras**
- Texto do documento em **serifada** (`.documento-oficial`/`TextoDoDocumento`),
  dentro de `.folha p-6 sm:p-10`, largura de leitura limitada.
- Versão mostrada leva `Carimbo` com a origem: violeta = IA, azul = editada por
  pessoa, verde = aprovada.
- Mensagens de ausência (usar exatamente a que couber): "A versão nº N está sem
  texto." · "O texto desta geração não está guardado como versão. Para lê-lo, use o
  botão Baixar o .docx gerado pela IA." · "A IA ainda não escreveu este documento.
  Gerar com a IA ›".
- Toda tela com IA diz que **a IA orienta e a decisão é da pessoa**.
- Carregando "Abrindo o documento…"; erro "Não deu para abrir o documento / Pode ser
  a conexão, ou o documento não existe mais. Nada foi alterado."
- **Nunca**: botão de baixar escondido em menu "⋯"; baixar sem avisar qual versão
  o arquivo traz; `DocumentsV3` como modelo (Card/Badge verde/ícone Zap são legado).
- **Largura**: o aside vai para baixo da folha em < lg (sem `sticky`).

---

## 9. Configurações / preferências ("Do seu jeito")

**Quando usar**: opções que só mudam a experiência **desta pessoa, neste
computador** (texto, contraste, movimento, som, menu). Não há servidor: tudo vale
na hora e fica em `localStorage`. (Configurações de órgão/usuários/perfis são
outra tela e seguem a receita de lista em gaveta ou formulário longo.)

Modelo completo: `assets/exemplos/pages/Acessibilidade.tsx` +
`assets/exemplos/features/preferencias/preferencias.ts`.

```tsx
<div className="mx-auto max-w-5xl space-y-6">
  <Trilha passos={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: "Acessibilidade e preferências" }]} />
  <header className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-4xl font-semibold">Do seu jeito</h1>
      <p className="mt-1 max-w-2xl text-muted-foreground">
        Texto maior, mais contraste, menos movimento e atalhos de teclado. Vale na hora e fica guardado neste computador.
      </p>
    </div>
    <Button variant="outline" onClick={voltarAoPadrao}>Voltar ao padrão</Button>
  </header>

  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <section aria-labelledby="ler-melhor" className="folha space-y-4 p-5">
      <h2 id="ler-melhor" className="text-2xl font-semibold">Para ler melhor</h2>

      {/* Tamanho do texto: grupo de 4 botões de alternância */}
      <p className="mb-2 text-sm font-semibold" id="rotulo-tamanho">Tamanho do texto</p>
      <div role="group" aria-labelledby="rotulo-tamanho" className="flex flex-wrap gap-2">
        {/* A− Menor · A Padrão · A+ Maior · A++ Bem maior */}
        <button type="button" aria-pressed={ativo} aria-label="A+, texto maior"
          className={cn("h-11 min-w-[3.5rem] rounded-lg border px-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            ativo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>A+</button>
      </div>

      {/* Chaves: cada uma = rótulo semibold + frase de explicação + Switch à direita */}
      <div className="flex items-start justify-between gap-4 border-t border-border py-3 first:border-t-0">
        <div>
          <Label htmlFor="pref-contraste" className="font-semibold">Alto contraste</Label>
          <p className="text-sm text-muted-foreground">Texto de apoio e fios mais fortes; carimbos sem falhas de tinta.</p>
        </div>
        <Switch id="pref-contraste" checked={v} onCheckedChange={set} />
      </div>
    </section>

    <section aria-labelledby="usar-melhor" className="folha space-y-4 p-5">
      <h2 id="usar-melhor" className="text-2xl font-semibold">Para usar melhor</h2>
      {/* chaves: menu recolhido, som ao carimbar */}
      <h3 className="mb-2 font-sans text-sm font-semibold">Atalhos de teclado</h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt><kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">Ctrl K</kbd></dt>
        <dd>Buscar processo ou tela</dd>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">Tudo também funciona só com o teclado: Tab avança, Shift+Tab volta, Enter abre.</p>
    </section>
  </div>

  {/* Prévia viva: mostra o efeito das escolhas */}
  <section aria-labelledby="previa" className="folha p-5">
    <h2 id="previa" className="font-sans text-sm font-semibold">Como fica</h2>
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <Carimbo tinta="azul" grande bateQuando={prefs}>Prévia</Carimbo>
      {/* texto de exemplo neutro (a base usa este): troque pelo evento do seu sistema; "ver {GEN.no} {MARCA.objeto.singular}" concorda com o gênero */}
      <p className="max-w-md text-muted-foreground">Atualização registrada em 21/09, <a href="#previa">ver {GEN.no} {MARCA.objeto.singular}</a>. Retorno até quinta-feira.</p>
    </div>
  </section>
</div>
```

**Contrato dos dados** (`preferencias.ts`): `Preferencias = { tamanho: -1|0|1|2;
altoContraste; sublinharLinks; maisEntrelinha; semMovimento; menuRecolhido;
somAoCarimbar }`, `PADRAO`, chave `localStorage` **`chaveDoSistema("preferencias")`**
(= `<prefixo>.preferencias`; o prefixo vem de `MARCA.prefixoDeArmazenamento`, então basta
trocá-lo em `config/marca.ts`), `lerPreferencias()` (tolerante a JSON ruim e a
armazenamento bloqueado), `gravarPreferencias()`, `aplicarPreferencias()` que põe/retira
no `<html>` as classes `pref-texto-menor | pref-texto-maior | pref-texto-grande`,
`pref-alto-contraste`, `pref-links`, `pref-entrelinha`, `pref-sem-movimento`
(definidas no `index.css`, ver 01). **`aplicarPreferencias(lerPreferencias())` roda
uma vez na inicialização**, num `useEffect` de `App.tsx` (linha ~34), antes de qualquer tela
interativa.
Atalhos: `ATALHOS` (`Ctrl K` busca · `Alt M` mesa · `Alt P` lista · `Alt A` agenda ·
`Alt N` nova · `Esc` fecha) e `destinoDoAtalho(evento)` — usado por `AppLayoutV3`.

**Regras**
- Cada alteração **vale na hora** (sem botão Salvar) e `useEffect` grava.
- "Voltar ao padrão" sempre presente, `variant="outline"`, no alto à direita.
- Toda chave explica o efeito numa frase; nada de siglas.
- Alvos de toque ≥ 44px (`h-11`) nos botões de tamanho.
- Sem estados vazio/erro (não há busca). Falha ao gravar: vale só nesta visita,
  sem avisar — o texto "fica guardado neste computador" já é a promessa.
- **Largura**: 2 colunas só em lg; no celular uma folha sob a outra.
- **Nunca**: `Card`, `Tabs`, mensagem "Salvo com sucesso" a cada clique, nova
  opção que exija servidor.

---

## 10. Ajuda ("Como fazer")

**Quando usar**: o que o usuário precisa para se virar sozinho — caminhos do dia a
dia, legenda das tintas e atalhos. É conteúdo **estático** em folhas.

Modelo: `assets/exemplos/pages/Help.tsx`.

```tsx
<div className="mx-auto max-w-6xl space-y-8">
  <Trilha passos={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: "Ajuda" }]} />
  <header>
    <h1 className="text-4xl font-semibold">Como fazer</h1>
    <p className="mt-1 max-w-3xl text-muted-foreground">Os caminhos do dia a dia, o que cada cor de carimbo quer dizer e os atalhos de teclado.</p>
  </header>

  {/* Caminhos: cada um uma folha, com lista numerada de passos */}
  <section aria-labelledby="caminhos" className="space-y-4">
    <h2 id="caminhos" className="sr-only">Os caminhos do dia a dia</h2>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <article className="folha p-5">
        <h3 className="text-2xl font-semibold">Responder no prazo</h3>
        <p className="mt-1 text-sm text-muted-foreground">Chegou um pedido de esclarecimento ou impugnação.</p>
        <ol className="mt-4 space-y-3">
          <li className="flex gap-3 text-sm">
            <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs">1</span>
            <span>Em Prazos e agenda, veja o último dia. <Link to="/agenda" className="font-semibold text-primary hover:underline dark:text-accent">Ir ›</Link></span>
          </li>
        </ol>
      </article>
    </div>
  </section>

  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <section aria-labelledby="tintas" className="folha p-5">
      <h2 id="tintas" className="text-2xl font-semibold">O que cada tinta quer dizer</h2>
      <p className="mt-1 text-sm text-muted-foreground">Cada cor de carimbo tem um significado só, em todas as telas.</p>
      <dl className="mt-4 space-y-3">
        <div className="grid grid-cols-[8rem_1fr] items-center gap-3">
          <dt><Carimbo tinta="azul">Registro</Carimbo></dt>
          <dd className="text-sm">Algo aconteceu e ficou registrado: autuação, versão, dispensa de etapa.</dd>
        </div>
        {/* verde Aprovado · carmim Prazo legal · ocre Pendente · violeta IA */}
      </dl>
    </section>
    <section aria-labelledby="atalhos" className="folha p-5">{/* mesma <dl> de atalhos do 9, + link para Acessibilidade */}</section>
  </div>

  <section aria-labelledby="duvida" className="rounded-xl border border-border bg-card p-5">
    <h2 id="duvida" className="text-xl font-semibold">Ficou alguma dúvida?</h2>
    <p className="mt-1 text-sm text-muted-foreground">Sobre a lei, consulte a <Link to="/library#lei" className="font-semibold text-primary hover:underline dark:text-accent">Biblioteca</Link>. Sobre o sistema, fale com {MARCA.equipeDeSuporte} pelo canal combinado com o seu órgão.</p>
  </section>
</div>
```

**Regras**
- Passo = círculo numerado `h-6 w-6 rounded-full border font-mono text-xs` + frase
  curta que começa com verbo; no máximo 5 passos por caminho; link `Ir ›` quando
  existe a tela.
- **A legenda de tintas é obrigatória** em todo sistema que usa carimbos (e as 5
  tintas têm sempre estes significados: azul = registro, verde = aprovado, carmim =
  prazo legal/urgência, ocre = pendente, violeta = IA). Ver 10 para o texto.
- Ajuda só descreve o que o sistema **faz hoje**; o que depende da equipe é dito
  como tal ("fale com a equipe…"). Nunca prometa função inexistente.
- Contato de suporte nunca é e-mail/telefone inventado: use o canal combinado.
- **Largura**: grids de 2 → 1 coluna em < lg; `grid-cols-[8rem_1fr]` da legenda
  se mantém (cabe em 360px).

---

## 11. 404 e "sem permissão"

**Quando usar**: rota que não existe (404) e rota que existe mas é de outro perfil.
Ambas usam `AvisoDeEstado` centralizado em **tela cheia, fora da casca** (sem menu nem
faixa) e **sem moldura de erro técnica**: dizem em
português o que aconteceu, o que **não** se perdeu e o caminho de volta.

```tsx
// 404 — tela cheia, FORA da casca (sem menu nem faixa; é o `pages/NotFound.tsx` da base)
<div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
  <AvisoDeEstado
    rotulo="Página não encontrada"
    titulo="Este endereço não leva a nenhuma tela"
    acoes={<>
      <Button asChild><Link to={MARCA.rotaInicial}>Ir para {MARCA.inicio} ›</Link></Button>
      <Link to="/processes" className="font-semibold text-primary hover:underline dark:text-accent">Procurar na lista</Link>{/* rota da lista do seu sistema */}
    </>}
  >
    O link pode ter sido copiado pela metade ou a página pode ter mudado de lugar.
  </AvisoDeEstado>
</div>

// Sem permissão — tela cheia (fica fora da casca) e diz o perfil da pessoa
<div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
  <AvisoDeEstado
    rotulo="Sem permissão"
    titulo="Esta parte é de outro perfil"
    acoes={<>
      <Button asChild><Link to={MARCA.rotaInicial}>Voltar para {MARCA.inicio} ›</Link></Button>
      <button type="button" onClick={() => navigate(-1)} className="font-semibold text-primary hover:underline dark:text-accent">Voltar à tela anterior</button>
    </>}
  >
    {user ? `Seu perfil é ${perfil}. ` : ""}Para ter acesso, fale com {MARCA.quemConvida}.
  </AvisoDeEstado>
</div>
```

`AvisoDeEstado` renderiza uma folha com o rótulo em caixa-alta pequena, o título
serifado e as ações lado a lado; `alerta` (opcional) põe o rótulo em carmim (use em erro); sem ele o rótulo é cinza. O título é um `h1` por padrão (`nivel={1}`: 404, sem permissão, em que o aviso é a única cabeça da tela); **dentro de uma `FolhaDaTela`** (que já tem o seu `h1`) use `nivel={2}`, para a tela ter um único `h1`; o `id` do título vem de `useId`, então dois avisos na mesma tela não duplicam.
Nomes de perfil legíveis: o mapa `NOME_DO_PERFIL` de `contexts/AuthContext.tsx` (master · administrador · gestor · operador; adapte lá), lido pela faixa do alto, pela gaveta do celular e por `Unauthorized`.

**Regras**: sempre **uma** ação principal (botão padrão com `›`) + **um** link de
saída; nunca "Erro 404" nem "Acesso negado" (diga "Página não encontrada", "Sem
permissão"); nunca mostre a URL quebrada nem pilha de erro; não use ilustração.
O mesmo `AvisoDeEstado` é usado para qualquer "vazio com orientação" (lista sem
itens, pasta inexistente).

---

## 12. Login e recuperar senha

**Quando usar**: telas **fora da casca**, dentro de `MolduraDeEntrada`
(`assets/components/auth/MolduraDeEntrada.tsx`): à esquerda o painel azul-noite
com logos + `MARCA.frase/apoio/marcadores` (some em < lg, ficam só os logos), à
direita a folha com o formulário. Textos do painel vêm de `config/marca.ts`.

Modelos: `assets/exemplos/components/auth/LoginV3.tsx` e `ResetPassword.tsx`.

```tsx
<MolduraDeEntrada
  rotulo={MARCA.entrada.rotulo}
  titulo="Entrar"
  subtitulo={MARCA.entrada.subtitulo}
  carimbo={
    <Carimbo tinta="azul" grande bateAoAbrir="entrada" className="carimbo-datado">
      <span className="carimbo-datado-miolo">
        <span>{MARCA.entrada.carimbo}</span>
        <span className="carimbo-datado-rodape">{MARCA.entrada.carimboRodape}</span>
      </span>
    </Carimbo>
  }
>
  {error && (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 animate-fade-in">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-destructive">{error}</AlertDescription>
    </Alert>
  )}
  {/* Exceção à regra "sem Alert do shadcn": o erro de login fica na moldura de entrada (não na folha) e o
      Alert com variant="destructive" já usa só tokens. Em qualquer outro lugar, siga 13.1. */}
  <form onSubmit={entrar} className="space-y-5">
    <div className="space-y-2">
      <Label htmlFor="username" className="text-sm font-medium text-foreground">Usuário</Label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input id="username" className={CAMPO_DE_ENTRADA} placeholder="Digite seu usuário" autoComplete="username" autoFocus required disabled={loading} />
      </div>
    </div>
    {/* Senha: mesmo molde com <Lock/>, type="password", autoComplete="current-password" */}
    <Button type="submit" disabled={loading} className="h-11 w-full text-base font-semibold">
      {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Entrando…</> : "Entrar"}
    </Button>
    <div className="text-center">
      <Link to="/reset-password" className="text-sm font-medium text-primary hover:underline dark:text-accent">Esqueceu sua senha?</Link>
    </div>
  </form>
  <div className="space-y-2 border-t border-border pt-4">
    <p className="text-center text-sm text-muted-foreground">Primeiro acesso? Fale com {MARCA.quemConvida} para receber o convite.</p>
    <p className="text-center text-xs text-muted-foreground">Ao entrar, você concorda com nossos <span className="font-medium text-foreground">Termos de Uso</span> e <span className="font-medium text-foreground">Política de Privacidade</span></p>
  </div>
</MolduraDeEntrada>
```

**Recuperar senha** (mesma moldura; uma única rota que alterna por `?token=`):
- Sem token: `titulo="Recuperar senha"`, subtítulo "Informe seu email para receber
  um link de redefinição", campo "Email cadastrado" (`<Mail/>`, `type="email"`,
  `placeholder="seu@email.com"`), botão **"Enviar link de recuperação"**
  ("Enviando…"). Resposta sempre neutra (não revela se o e-mail existe), em aviso
  verde: "Se o email estiver cadastrado, enviaremos um link para redefinir a senha.
  Verifique a caixa de entrada e o spam."
- Com token: `titulo="Definir nova senha"`, subtítulo "Escolha uma nova senha forte
  para sua conta", campos "Nova senha" (placeholder "Mínimo 8 caracteres") e
  confirmação (placeholder "Repita a nova senha"), botão **"Redefinir senha"**
  ("Redefinindo…"). Sucesso: "Senha redefinida com sucesso! Redirecionando para o
  login…".
- Aviso verde (versão da base, só tokens): `Alert className="border-[hsl(var(--tinta-verde)/0.5)] bg-[hsl(var(--tinta-verde)/0.1)] animate-fade-in"`,
  texto e ícone com a classe `tinta-verde`. O modelo de leitura de `assets/exemplos`
  usa `emerald-*` cru: **não copie essa parte**, use a da base.
- Rodapé: `div.border-t.pt-4.text-center` com link "← Voltar ao login".
- Regras de senha e suas mensagens: ver `10-estados-e-microcopy.md`.

**Regras**
- Campos `h-11` com ícone à esquerda e classe `CAMPO_DE_ENTRADA`; botão único
  `h-11 w-full text-base font-semibold` (default, azul — **não** use `--cta` aqui).
- O carimbo da folha bate **uma vez** ao abrir (`bateAoAbrir="entrada"`).
- Já autenticado e abriu `/login`: redirecione para a mesa (não mostre tela em
  branco). Destino pós-login = `location.state.from` ou a rota inicial (`MARCA`).
- Erro limpa ao digitar. Mensagem sem culpar: mostra `err.message` do login (na base,
  "Usuário ou senha incorretos."); sem mensagem, o texto de reserva "Credenciais
  inválidas. Certifique-se de que seu usuário e senha estão corretos." (10 §10).
- Pré-preencher usuário/senha só em desenvolvimento (`import.meta.env.DEV`) e
  vindo de `.env` local fora do git; **nunca** escrever credencial no código.
- **Nunca**: fundo com gradiente/vidro (`glass-*`, `gradient-*` — herança legada),
  logo do cliente pequeno demais (`h-12`, `lg:h-16`), cadastro aberto, "Lembrar de
  mim" sem o servidor suportar.
- **Largura**: abaixo de lg o painel azul vira uma faixa só com logos; direitos
  autorais passam para baixo da folha.

---

## 13. Peças transversais (valem em qualquer tela)

### 13.1 Avisos de resultado (o "toast" da mesa)

Depois de **uma ação que mudou algo**, a mesa mostra uma **faixa azul-noite no alto
da folha** (`AvisosDeResultado`), não um toast no canto. Quem a monta é a casca
(`AppLayoutV3` envolve o `<Outlet/>` em `<AvisosDeResultado tela={pathname}>`); a
faixa some sozinha ao mudar de tela.

```tsx
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
const { avisar } = useAvisoDeResultado();

await processApi.dismissStage(processo.id, etapa.id, motivo);
avisar({
  texto: `Etapa "${etapa.name}" dispensada no ${processo.code}.`,
  desfazer: async () => { await processApi.undismissStage(processo.id, etapa.id); },  // opcional
});
```

Aparência (já implementada; só para você reconhecer): `role="status"`, `sticky top-0
z-30 rounded-lg bg-moldura px-4 py-3 text-sm text-moldura-foreground shadow-lg`, ícone
`Check` `text-gold`, botão **"Desfazer"** (só se `desfazer` existe), fechar
`aria-label="Fechar o aviso"`. Se o desfazer falhar: "Não deu para desfazer. Tente de
novo."

**Regras**
- Texto = frase completa no passado, com o **nome do que mudou**: "Modelo salvo e
  desligado…", "Ficha salva.", "Versão do órgão criada a partir do padrão. Ajuste o
  texto e salve." Nunca "Sucesso!" nem "Operação realizada".
- Ofereça `desfazer` sempre que a ação **for reversível sem custo** (dispensar etapa,
  arquivar). Ação irreversível não tem Desfazer — ela passou por `ConfirmarAto`.
- **Erro NÃO usa a faixa**: erro de busca = `MesaErroBusca`/`AvisoAtualizacaoFalhou`;
  erro de ação dentro de formulário = `role="alert" text-destructive` junto ao
  botão; erro de ação em diálogo = mensagem dentro do próprio diálogo (13.2).
- `useToast().toast({title, description, variant})` (shadcn) ainda existe em telas
  antigas ("Processo excluído", "Etapa reativada", "Falha ao reativar", "Criando sessão
  de chat…", "Falha ao criar sessão"). **Em sistema novo não use**: prefira `avisar`
  para sucesso e o erro no lugar (acima). Se precisar manter `Toaster`, mantenha o
  texto no mesmo registro (título curto + frase), `variant="destructive"` só em erro.

### 13.2 Diálogos de confirmação

**Ato com consequência** (dispensar etapa, arquivar, reabrir, excluir com registro,
sair sem salvar) = `ConfirmarAto` — um diálogo que mostra **de onde veio o pedido, a
pergunta, o carimbo que vai ficar no histórico, o que acontece e, se quiser, o
motivo**.

```tsx
<ConfirmarAto
  aberto={!!etapaParaDispensar}
  onAbertoChange={(a) => { if (!a) setEtapaParaDispensar(null); }}
  origem={`Linha do tempo · ${etapa.name}`}                  // de onde a pessoa veio
  pergunta={`Dispensar a etapa ${etapa.name}?`}              // pergunta curta, com "?"
  carimbo="Dispensa"                                         // o carimbo que fica no Histórico
  tinta="ocre"                                               // azul | verde | carmim | ocre | violeta
  consequencia={<>A etapa passa a contar como feita no progresso, e o motivo fica registrado. Só gestor ou administrador pode reativá-la depois.</>}
  motivo="obrigatorio"                                       // "obrigatorio" | "opcional" | "nenhum"
  dicaDoMotivo="Ex.: o objeto não exige este documento."
  rotuloConfirmar="Dispensar etapa"                          // verbo + objeto, nunca "OK"/"Sim"
  rotuloVoltar="Voltar"                                      // padrão
  irreversivel={false}                                       // true = botão de confirmar vermelho (publicar, excluir)
  onConfirmar={async (motivo) => { await dispensar(etapa, motivo); avisar({ texto: `Etapa "${etapa.name}" dispensada.` }); }}
/>
```

Textos fixos do componente: "Fica no Histórico com o carimbo [carimbo]" (aparece quando há `carimbo`) · "O motivo fica registrado no Histórico {do|da} {MARCA.objeto.singular}." (quando `motivo="obrigatorio"`; com "opcional" o rótulo ganha "· opcional") · erro
interno (a ação lançou): **"Não deu certo, e nada foi alterado. Confira a conexão e
tente de novo."** (o diálogo continua aberto). Botão confirmar desabilita com
`Loader2` enquanto roda.

**Exclusão simples** (lista de processos/documentos, sem carimbo): `DeleteConfirmDialog`
(`assets/exemplos/components/common/DeleteConfirmDialog.tsx`, baseado em `AlertDialog`):
título "Excluir processo?", descrição "O processo "X" será marcado como excluído.
Você pode restaurá-lo pelo painel administrativo.", campo "Motivo (opcional)" com
placeholder "Ex.: criado por engano, duplicidade, etc.", botões "Cancelar" e
"Excluir" → "Excluindo…". O botão de confirmar já usa o token `bg-destructive`
(nada de cor crua).

**Regras**: o foco inicial vai ao botão **Voltar** (padrão do `AlertDialog` do Radix; nunca ao destrutivo); `Esc`
fecha; frase da `consequencia` diz **o que muda e o que não muda**; o rótulo do
botão repete o verbo da pergunta; atos de situação do item usam esta família:
"Marcar em andamento", "Voltar para aberto", "Concluir", "Arquivar", "Reabrir".

### 13.3 Tabelas

Duas variantes, ambas dentro de `div.overflow-x-auto` (rolagem horizontal no
celular, **nunca** quebra a página) e com `<caption className="sr-only">` e
`<th scope="col">`.

**(a) Tabela de trabalho** — documentos do processo, listas operacionais:
```tsx
<div className="overflow-x-auto rounded-lg border border-border">
  <table className="w-full min-w-[36rem] text-sm">
    <caption className="sr-only">Documentos da modalidade</caption>
    <thead className="bg-muted/50 text-left">
      <tr>
        <th scope="col" className="px-3 py-2 font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Documento</th>
        <th scope="col" className="px-3 py-2 text-right font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"><span className="sr-only">Ações</span></th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-border align-middle">
        <td className="px-3 py-3">
          <span className="font-semibold"><span className="mr-2 font-mono text-muted-foreground">01</span>Estudo Técnico Preliminar</span>
          <span className="block text-xs text-muted-foreground">obrigatório</span>
        </td>
        <td className="px-3 py-3"><Carimbo tinta="verde">Concluído</Carimbo></td>
        <td className="px-3 py-3 font-mono">3</td>
        <td className="px-3 py-3"><div className="flex flex-wrap items-center justify-end gap-2">{/* BaixarDocumento outline + Button ghost sm "Abrir ›" */}</div></td>
      </tr>
    </tbody>
  </table>
</div>
```
Situações do documento (carimbo): **Concluído** verde · **Em andamento** azul · **A
fazer** grafite · **Dispensado** ocre (com o motivo em `block text-xs italic
text-muted-foreground`, entre aspas curvas). Datas `dd/mm/aaaa` em `font-mono`; vazio
é "—".

**(b) Tabela de livro** (arquivo, relatórios): moldura **dupla** de livro-caixa.
```tsx
<div className="overflow-x-auto border-y-4 border-double border-[hsl(var(--mesa-contorno))]">
  <table className="w-full min-w-[44rem] text-sm">
    <caption className="sr-only">…</caption>
    <thead>
      <tr className="text-left">
        <th scope="col" className="px-3 py-2 font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Processo</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-dotted border-[hsl(var(--mesa-linha))] align-middle">…</tr>
    </tbody>
  </table>
</div>
```
**Regras**: números, códigos e datas em `font-mono`/`tabular-nums`; carimbo para
situação (nunca texto colorido solto); ação da linha à direita, `Button size="sm"`;
ordenação/filtro por `DivisoriasDeFiltro` acima, **não** por ícones no cabeçalho;
linha clicável inteira só se houver também um link/botão rotulado dentro dela;
vazio = linha única com a frase de vazio (ver 10) ou `AvisoDeEstado`. Para impressão
dos autos ver 13.7. **Nunca**: `Table` do shadcn com zebra, cabeçalho azul sólido,
paginação numerada em lista do dia a dia.

### 13.4 Selos de situação (badges = carimbos)

O sistema **não usa `Badge`** para situação. Situação = `Carimbo` (`tinta` por
significado: azul registro/em andamento, verde aprovado/concluído, carmim prazo
legal/urgente, ocre pendente/dispensado/atenção, violeta IA, grafite neutro/a fazer):
```tsx
<Carimbo tinta="verde">Concluído</Carimbo>
<CarimboSituacao status={processo.status} />        // mapeia ABERTO/EM_ANDAMENTO/CONCLUIDO/ARQUIVADO
<Carimbo tinta="carmim" grande giro={-3} bateAoAbrir="capa-12-aberto">Prazo legal</Carimbo>
```
Para **contagem** ao lado de rótulo escreva `rótulo · N` em texto simples, como a
`DivisoriasDeFiltro` (sem `span` nem borda); fora das divisórias, `font-mono` num `span`
com borda (`rounded border border-border px-1.5 text-xs`) também serve.
Para **tag** de classificação sem significado de estado (ex.: modalidade) use texto
`font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground`,
sem fundo. **Nunca** bolinha verde/vermelha sozinha (acessibilidade): sempre texto.

### 13.5 Abas = divisórias

Em qualquer tela, "abas" são **divisórias de pasta**:
- Filtro/visão da lista → `DivisoriasDeFiltro` (rotulo, opções com total).
- Seções de um item aberto → divisórias da `PastaDoProcesso` (rota-driven, ver 7).
- Seções dentro de uma folha (raro) → `h2` serifados em folhas separadas; **nunca**
  `Tabs` do shadcn.
Acessibilidade já embutida (`role="group"`/`aria-pressed` nos filtros; `aria-current="page"`
nas divisórias de rota).

---

### 13.6 Gráficos e painéis com números

Três peças, todas **dentro de folha ou de `rounded-xl border border-border bg-card p-5`**
(ou sem moldura — `semMoldura` — quando já estão numa página do "livro").
Dependência: (a) e (b) usam **`recharts ^2.15.4`** (`npm i recharts@^2.15.4`;
não está no `assets/base`); (c) e (d) não precisam de biblioteca. Se o sistema não
precisa de gráfico de rosca/barras, use só (c) e (d) e não instale nada.

**(a) Rosca por situação** — `assets/exemplos/features/dashboard/StatusDonut.tsx`
(recharts). Medidas exatas: contêiner `h-48`, `Pie innerRadius={50} outerRadius={75}
paddingAngle={2} stroke={t.bgCard} strokeWidth={2} isAnimationActive={false}`; fatias
fora da seleção a `opacity 0.35`; **legenda clicável** abaixo (`ul.mt-3.space-y-1.text-xs`
→ `button` por linha, `rounded-md px-2 py-1`, bolinha `h-2 w-2 rounded-full` + nome +
contagem `font-semibold`) que também filtra. Título `h3 text-xl font-semibold`,
contagem total `text-xs text-muted-foreground`. Vazio: `h-48` centrado "Nenhum
processo cadastrado". Cores vêm de `useThemeTokens()` (`theme/tokens.ts`, copiado em
`assets/exemplos/theme/tokens.ts`): aberto = `info`, em andamento = `warning`,
concluído = `success`, arquivado = `textMuted`.
> **Corrija ao copiar**: a legenda usa `text-platinum-50/200/100` (escala do
> LicitarsAI antigo). Troque por `text-foreground` (selecionado) e
> `text-muted-foreground` (normal); contagem `text-foreground`.

**(b) Barras por categoria** — `ModalityBar.tsx`: `BarChart layout="vertical"
margin={{left:8,right:16}}`, `CartesianGrid strokeDasharray="3 3" horizontal={false}`,
`XAxis type="number" fontSize={11} allowDecimals={false}`, `YAxis type="category"
width={100} fontSize={11}`, barra `fill={t.chart[0]}` (azul Okabe–Ito) com
`radius={[0,4,4,0]}`, `Tooltip` com `backgroundColor: t.bgCard, border: 1px solid
t.border, borderRadius: 8, fontSize: 12`. Vazio: "Sem dados".
Paleta categórica (`t.chart`): `#0072B2 #E69F00 #009E73 #D55E00 #56B4E9 #CC79A7
#F0E442` (segura para daltonismo). **Nunca** invente outra paleta nem use vermelho/
verde como único diferenciador.

**(c) Barras de CSS simples** (ritmo por mês, "Processos abertos por mês" —
`RitmoDoOrgao.tsx`): sem biblioteca; é o formato preferido para séries curtas:
```tsx
<ol className="mt-3 space-y-2" aria-label="Processos abertos nos últimos 6 meses">
  <li className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_2rem] items-center gap-2 text-sm">
    <span className="truncate text-muted-foreground">Em andamento</span>
    <span className="h-3 rounded-sm bg-muted" aria-hidden="true">
      <span className="block h-3 rounded-sm bg-primary dark:bg-accent" style={{ width: `${(m.total / maior) * 100}%` }} />
    </span>
    <span className="text-right font-semibold tabular-nums">{m.total}</span>
  </li>
</ol>
```

**(d) Número grande** (cartões de contagem): `p.font-ui.text-xs.font-semibold.uppercase.tracking-[0.12em].text-muted-foreground`
(rótulo) + `p.font-display.text-4xl.font-semibold.leading-none.lining-nums.tabular-nums` (valor) + `dl.grid.grid-cols-3.gap-2.text-sm`
com `dt text-muted-foreground` / `dd font-semibold tabular-nums` (aberturas por situação).
Carregando: "Contando…" · erro: "Não deu para contar os documentos agora. [Tentar de
novo]" (botão-link `font-semibold text-primary hover:underline dark:text-accent`) ·
erro com dado antigo: `p[role=status].text-xs.tinta-carmim` "A última contagem falhou;
mostrando a de antes. [Tentar de novo]" · parcial: "A divisão por situação conta N
dos M documentos."

**Regras**: todo gráfico tem **título visível** e **equivalente em texto** (legenda
ou `aria-label` com os números) — o gráfico sozinho não basta; nenhum gráfico 3D,
nenhuma animação de entrada; **nunca** zero no lugar de "falhou" (zero engana — diga
que não deu para contar); filtros de gráfico são os mesmos `DivisoriasDeFiltro`
quando não são clique no próprio gráfico.

### 13.7 Impressão (autos e livros)

Telas "para o papel" (autos do processo, "Processos do período", prévia de diário):

1. **Envolva a tela** em `MesaPagina imprimivel` ou `ProcessoNaMesa imprimivel`
   (coloca a classe `area-impressao` e o botão **"Imprimir"** `variant="secondary"`
   com ícone `Printer`, que chama `window.print()`). Só habilite `imprimivel`
   **depois que os dados chegaram** (senão o papel sai com o aviso de espera).
2. Cada **página** é um `<article aria-labelledby="…" className="folha folha-furada
   quebra-pagina p-5 md:p-6 print:p-10">` com `h2.mesa-secao`; a **capa** e o
   **encerramento** usam `sem-quebra` em vez de `quebra-pagina`; itens que não
   podem partir no meio (`li`) levam `sem-quebra`. Espaço entre páginas:
   `div.space-y-6.print:space-y-10`.
3. O que **não deve sair no papel** (avisos, notas, filtros, botões) leva
   `nao-imprimir`. As classes de impressão (`area-impressao`, `nao-imprimir`,
   `quebra-pagina`, `sem-quebra`) estão no bloco `@media print` do `index.css`
   (ver 01). Em página com `.area-impressao` o CSS **esconde todo `aside`, `footer`, a
   faixa do alto da moldura (o elemento com `data-moldura-faixa`, que é o `<header>` do
   `AppHeaderV3`) e tudo com `nao-imprimir`**, zera margens, tira sombra/borda das folhas
   e, no tema escuro, imprime com as cores do tema claro. O `<header>` **interno** de uma
   folha (por exemplo o da capa da pasta, com o número e o título) **sai** no papel.
   **Consequência**: dentro de uma folha que deve sair no papel **não use as tags
   `<aside>` ou `<footer>`** (use `div`/`section`), senão o trecho some; a moldura, o menu
   e a faixa azul-noite nunca saem. Se você criar outra faixa de moldura, marque-a com
   `data-moldura-faixa`.
4. **Capa** dos autos: órgão (`mesa-rotulo mesa-apoio`) · "Autos do processo" (`mesa-secao`)
   · número (`font-mono text-2xl sm:text-3xl break-all`) · `CarimboDatado ato="Autuado"
   data rodape={número} giro={-6} bateAoAbrir` + `CarimboSituacao giro={3}` · `dl`
   de campos (`Linha`: `grid grid-cols-1 gap-1 border-t mesa-linha py-2 text-sm
   sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4`; `dt.mesa-rotulo.mesa-apoio`).
5. **Índice**: tabela `w-full min-w-[520px] text-left text-sm`, `thead tr.mesa-rotulo.mesa-apoio`,
   `tr.border-t.mesa-linha`, números `tabular-nums`.
6. **Termos**: `ol.margem-registro.mt-4.space-y-6.pl-4` com `p.documento-oficial.max-w-prose`
   ("Em ____, junto a estes autos o documento “…”, que recebe o número de peça 01.") e
   **`Rubrica`**: `div.mt-8.flex.flex-col.items-end.gap-1.text-sm` com linha
   `span.block.w-56.border-b.border-current` e legenda `mesa-apoio`.
7. **Lacunas**: o que o sistema não sabe vira **`LACUNA("o que falta")`**
   (sai `[o que falta]`, entre colchetes, a preencher à mão) — **nunca invente** data,
   nome ou matrícula.
8. Aviso de integridade (carmim, tracejado): "Atenção: o sistema registra N
   documentos neste processo, mas só M puderam ser trazidos. Não use esta
   impressão como autos completos; avise {`MARCA.equipeDeSuporte`}." (`role="alert"`).
9. Nota de abertura da tela (sempre `nao-imprimir folha-simples p-4 text-sm`), com
   `details` "Como os autos são montados" e, se houver, lista `tinta-ocre` do que
   ficou de fora.

> **Onde estão as funções.** Cálculos: `assets/base/src/utils/ferramentasMesa.ts` exporta
> `valorEmReais`, `formatarMoeda`, `LACUNA`, `dataDoRegistro`, `contarTexto`,
> `dataDeReferencia`, `filtrarPorPeriodo`, `resumirPor`, `resumirLivro`, `ordenarPecas`,
> `separarPecas`, `emAndamento`, `SEM_RESPONSAVEL`, `agruparPorResponsavel` (e os tipos
> `ContagemTexto`, `LinhaResumo`, `PilhaResponsavel`); `lerData` vem de
> `utils/datas.ts` (`prazosLicitacao.ts`, que só existe em sistema de licitação, apenas o reexporta). Peças de papel: `assets/components/mesa/PecasDosAutos.tsx`
> exporta `Rubrica` (`referencia?`) e `Linha` (`rotulo`, `children`).
> **`LACUNA("o que falta")` devolve `[o que falta]` entre colchetes** (não sublinhado):
> `contarTexto` conta as lacunas por esse formato; o que a pessoa vê no papel é o
> texto entre colchetes, a preencher à mão. Só `montarExtrato` (aviso de diário) fica no
> exemplo de licitação (`assets/exemplos/pages/`), não na base.

### 13.8 Lei ao lado (painel lateral de consulta)

Padrão para **qualquer consulta que não deve tirar a pessoa do que está fazendo**
(lei, glossário, ajuda contextual): painel à direita, aberto por uma citação
sublinhada. Modelo: `assets/exemplos/features/lei/{LeiAoLado,CitacaoDaLei}.tsx`.

```tsx
// 1) uma citação no texto (abre o painel; sem provider vira texto comum)
<p>Conforme <CitacaoDaLei noSeuCaso="O prazo conta em dias úteis a partir da publicação.">art. 164 da Lei 14.133/2021</CitacaoDaLei>…</p>
// (aparência: botão inline, sublinhado pontilhado `underline decoration-dotted underline-offset-2 hover:decoration-solid`)

// 2) o painel
<Sheet open={!!a} onOpenChange={(v) => !v && onFechar()}>
  <SheetContent side="right" className="flex w-full flex-col gap-5 overflow-y-auto sm:max-w-md"
                onOpenAutoFocus={(e) => { e.preventDefault(); titulo.current?.focus(); }}>
    <SheetHeader className="space-y-1 text-left">
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{LEI_NOME} · ao lado</p>
      <SheetTitle ref={titulo} tabIndex={-1} className="font-display text-3xl font-semibold leading-tight focus:outline-none">Art. {a.numero}</SheetTitle>
      <SheetDescription className="text-base text-foreground">{a.titulo}</SheetDescription>
    </SheetHeader>

    {aberto?.noSeuCaso && (
      <div className="rounded-md border border-border bg-card p-4">
        <Carimbo tinta="carmim">No seu caso</Carimbo>
        <p className="mt-2 text-sm">{aberto.noSeuCaso}</p>
      </div>
    )}

    <section aria-labelledby="lei-resumo" className="space-y-2">
      <h3 id="lei-resumo" className="font-sans text-sm font-semibold">Em linguagem comum</h3>
      <div className="documento-oficial space-y-2 text-base">{/* <p> do resumo */}</div>
      <p className="text-xs text-muted-foreground">Resumo para orientar; não substitui o texto oficial. Antes de citar num documento, confira o original.</p>
    </section>

    <section aria-labelledby="lei-no-sistema" className="space-y-1">
      <h3 id="lei-no-sistema" className="font-sans text-sm font-semibold">Onde o sistema usa</h3>
      <p className="text-sm text-muted-foreground">{a.noSistema}</p>
    </section>

    <div className="flex flex-wrap gap-2">
      {/* Só com link: a base traz LEI_LINK_OFICIAL vazio, e linkOficial() devolve "" */}
      {linkOficial(a.numero) && (
        <Button asChild variant="outline" size="sm">
          <a href={linkOficial(a.numero)} target="_blank" rel="noopener noreferrer">Ler o texto oficial<ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (abre o texto oficial em outra aba)</span></a>
        </Button>
      )}
      {/* Sem artigo antes de LEI_NOME: "da"/"do" dependeria do gênero do nome da norma */}
      <BotaoCopiar texto={`art. ${a.numero} — ${LEI_NOME}`} rotulo="Copiar a referência" />
    </div>

    <nav aria-label="Outros artigos" className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4 text-sm">
      <Button variant="ghost" size="sm" onClick={irParaAnterior}>‹ Art. 163</Button>
      {LEI_ROTA_DA_LISTA ? <Link to={LEI_ROTA_DA_LISTA} onClick={onFechar} className="font-semibold text-primary hover:underline dark:text-accent">Ver todos os artigos</Link> : <span />}
      <Button variant="ghost" size="sm" onClick={irParaSeguinte}>Art. 165 ›</Button>
    </nav>
  </SheetContent>
</Sheet>
```
Fornecimento: `LeiAoLadoProvider` (em volta do `<Outlet/>` na casca) guarda o artigo
aberto e expõe `useLeiAoLado().abrir(numero, noSeuCaso?)`; `artigos.ts` tem a tabela
(`artigo`, `vizinhos`, `linkOficial`, `artigoDaCitacao`) e `contextoDaLei.ts` o contexto.
Na base o recurso vem **desligado** (`MARCA.leiAoLado = false`; o provider só repassa os
filhos). Em outro domínio (outro corpus), ligue-o e troque `ARTIGOS`, `LEI_NOME`,
`LEI_ROTA_DA_LISTA` e o link oficial em `artigos.ts`; mantenha o painel. A base traz o
código em `assets/base/src/features/lei/`; `assets/exemplos/features/lei/` é o modelo
ilustrado.

**Regras**: o foco inicial vai ao **título** (leitor de tela recomeça por ele ao
trocar de artigo); fecha com `×` ou `Esc`; sempre diz "resumo, não substitui o texto
oficial"; "No seu caso" só aparece quando a tela chamadora **sabe a conta**; nunca
cole o texto integral da lei (direitos/atualização) — resuma e linke o oficial. Em
< sm o painel ocupa a largura toda.

---

## 14. Telas que não cabem nas cascas padrão (conversa com a IA, repetir, editor)

Estas telas existem no LicitarsAI e **não** estão em `assets/base/src/pages/`. Se o seu
sistema tiver algo equivalente, siga estas receitas; se não tiver, ignore.

### 14.1 Conversa com a IA (`Chat8V3`) — pergunta-e-resposta num documento

**Quando usar**: uma tela em que a IA conduz perguntas e a pessoa responde, ligada a
um documento já escolhido. É **página de texto** (sem `FolhaDaTela`): um `div`
`flex flex-col gap-4 md:h-[calc(100dvh-10rem)] md:min-h-[32rem]` (do tablet para cima a
altura é fixa para o botão "Enviar respostas" ficar sempre à vista; no celular a
página cresce e a folha rola até ele), contendo:

1. **Cabeçalho** (`Chat8HeaderV3`): `Trilha` (início › lista › código do processo ›
   nome do documento › **"Gerar por IA"**), depois linha `flex flex-wrap items-end
   justify-between`: à esquerda o rótulo `font-ui text-xs font-semibold uppercase
   tracking-[0.12em] text-muted-foreground` ("Gerar por IA · " + `tinta-violeta`
   "a IA pergunta, você responde"), o `h1` `font-display text-3xl font-semibold` (nome do
   tipo do documento) e "Processo nº" + `font-mono` com o código; à direita
   `Button ghost sm` "Sobre este documento", link "Ler o documento pronto ›" (só se já
   existe) e "‹ Voltar à linha do tempo". Fecha com `text-xs text-muted-foreground`:
   "A IA escreve; quem decide e assina é você."
2. **Corpo** `flex min-h-0 flex-1 flex-col` → `overflow-hidden flex-1 flex flex-col` →
   `div.flex.flex-col.h-full.min-h-0.space-y-3` com, no alto, o cartão de **documento
   pronto** (quando a IA terminou: dispensável) e abaixo o **painel de perguntas**
   (cada pergunta numa folha; rodapé fixo com o botão "Enviar respostas"). A cadeia
   `flex` + `min-h-0` não pode ser quebrada: sem ela o rodapé é cortado.
3. Sem barra de status e sem balões de chat estilo mensageiro: é um formulário
   conduzido, não um bate-papo.

**Estados**: sem documento escolhido → `AvisoDeEstado` rótulo "Gerar por IA", título
"Escolha o documento primeiro", ação "Ver os processos ›" e texto "A IA trabalha num
documento de cada vez. Abra a pasta do processo e, na linha do tempo, clique em “Gerar
por IA” na etapa que quer escrever."; carregando → `p role="status"` com `Loader2`:
"Abrindo a conversa com a IA…"; erro → `AvisoDeEstado alerta` "Não deu para abrir a
conversa", ações "Tentar de novo" + "Voltar aos processos", texto "… Nada foi
alterado; abra o documento de novo pela pasta do processo."

### 14.2 Comparar e repetir (`RepetirContratacao`)

**Quando usar**: "copiar este item com ajustes" — mostra antes × depois e abre o
formulário preenchido, sem criar nada. Abre dentro de `ProcessoNaMesa` (pasta compacta
no alto) e o corpo é um `grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]`:

- **Painel de ajuste** `aside.folha-simples.space-y-4.p-5` com `xl:order-last xl:sticky
  xl:top-4 xl:self-start` (no código vem **primeiro**, para a ordem do Tab e do celular;
  no xl vai para a direita): `Label` + `Input` (`inputMode="decimal"`, `aria-invalid`,
  `aria-describedby`), ajuda `text-xs` (`mesa-apoio`; `tinta-carmim` quando inválido),
  `Button w-full` "Abrir no formulário de novo processo" (desabilitado enquanto o valor
  for inválido) e a frase "Nada é criado agora. O formulário abre preenchido e o
  processo só existe quando você clicar em “Criar Processo”."
- **Comparação** `section.folha.p-5 md:p-6`: `h2.mesa-secao`, tabela em
  `div.overflow-x-auto` (`min-w-[480px]`, cabeçalho em `mesa-rotulo mesa-apoio`, linhas
  `border-t mesa-linha`, `th scope="row"` em `mesa-apoio`, números `tabular-nums`). A
  coluna "depois" fica em `tinta-azul font-semibold` quando difere; o valor corrigido
  leva `Carimbo tinta="azul" giro={-3}` "Corrigido". Nota final `text-xs mesa-apoio`:
  "Em azul, o que fica diferente."
- Os dados vão ao formulário por `navigate(rota, { state: { repetir } })`.

### 14.3 Editor de documento e detalhe de documento

`Editor` (editor de texto) e `DocumentDetail` (detalhe com versões e `BaixarDocumento`)
foram adaptados só em parte à mesa no LicitarsAI: o `DocumentDetail` usa `Trilha` +
`h1` + `BaixarDocumento`; o `Editor` ainda tem `h1` genérico. **Não os use como
modelo de aparência.** Para documento, siga a receita do §8 (`FolhaDaTela`, texto
serifado via `TextoDoDocumento`, botão **"Baixar .docx"** visível); para edição, a
mesma casca com o editor dentro de uma `folha` e os botões Salvar/Baixar numa linha
no alto.

### 14.4 Peças soltas: linha do tempo de etapas, lista de ativos, cartão "documento pronto"

Três peças dos exemplos que não têm tela própria. Leia o arquivo antes de copiar; todas
dependem de dados do sistema de origem (`Process`, `Document`, serviços, Redux).

- **Linha do tempo de etapas** (`exemplos/components/documents/VisualTimeline.tsx`): lista
  vertical de cartões (`Card` + `rounded-md border`, `shadow-[0_2px_0_mesa-linha2]`), um
  por etapa. A cor vem **só do estado**, sempre por tinta: concluída `tinta-verde`
  (ícone `Check`), dispensada `tinta-ocre` (ícone `Ban`, título riscado), atual
  `tinta-azul` com `border-primary dark:border-gold` e `shadow-md` (fio de ouro só no
  escuro, onde tem contraste), pendente em `muted`. Clicar abre/fecha o cartão; a etapa
  atual já nasce aberta. Fechado: título, selo de estado, contador `n/total` e, havendo
  documento pronto, o botão **Baixar** visível (nunca atrás do clique). Aberto: barra de
  progresso (`--cta` na atual, `tinta-verde` na concluída), link do documento e os
  botões "Gerar por IA" (`--cta`), "Criar/Editar" (contorno) e "Dispensar" (contorno
  `tinta-carmim`); a dispensada troca os três por "Reativar" (só para quem pode). Todo
  botão interno chama `e.stopPropagation()`. A regra de qual etapa é feita, dispensada ou
  atual mora num arquivo só (`etapasDoProcesso`), não no JSX.
- **Lista de ativos** (`exemplos/features/dashboard/ActiveProcessesList.tsx`): bloco
  "Meus processos ativos" com cabeçalho (título, legenda, botão "limpar" quando há filtro,
  contador "n processos") e estados carregando / vazio (com link "Criar primeiro
  processo") / lista. Cada linha é um `Link` com `etiqueta-pasta` em `font-mono`,
  `CarimboSituacao`, objeto truncado e uma linha miúda "modalidade · valor · abre em N
  dias" (prazo em `error` com ≤ 3 dias, `warning` com ≤ 7). É a versão simples: em tela
  nova prefira as pastas/gaveta do §2 dentro de `FolhaDaTela`.
- **Cartão "documento pronto"** (`exemplos/components/chat/DocumentReadyCard.tsx`): caixa
  `rounded-lg border` com fio `tinta-verde` que aparece na conversa quando a IA termina.
  Título "Documento pronto" (`tinta-verde`, `CheckCircle2`); se veio só um trecho vira
  "Trecho revisado" em `tinta-ocre` e some o "Próxima etapa". Ações: "Ler o documento
  pronto", **"Baixar .docx"**, "Editar" e "Próxima etapa" (ou "Processo concluído" na
  última). Erro em `text-destructive role="alert"`; apoio em `text-xs text-muted-foreground`.
