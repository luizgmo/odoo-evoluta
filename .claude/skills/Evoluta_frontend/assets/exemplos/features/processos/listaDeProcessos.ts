// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Regras da lista de Processos e do Arquivo (proposta 7, telas 3 e 18):
 * divisórias de filtro, ordenação e o ano de cada processo encerrado.
 */
import type { Process } from "@/types/process";
import { ehContratacaoDireta } from "@/components/mesa/fasesDaLicitacao";

export type AbaDaLista = "ativos" | "sem-data" | "todos";
export type Ordem = "proxima-abertura" | "recentes" | "maior-valor" | "numero";

const ATIVOS = new Set(["ABERTO", "EM_ANDAMENTO"]);
const ENCERRADOS = new Set(["CONCLUIDO", "ARQUIVADO"]);

export const ehAtivo = (p: Pick<Process, "status">) => ATIVOS.has((p.status ?? "").toUpperCase());
export const ehEncerrado = (p: Pick<Process, "status">) => ENCERRADOS.has((p.status ?? "").toUpperCase());

export function daAba(processos: Process[], aba: AbaDaLista): Process[] {
  if (aba === "ativos") return processos.filter(ehAtivo);
  // contratação direta não tem sessão: não fica cobrando data de abertura
  if (aba === "sem-data") return processos.filter((p) => ehAtivo(p) && !p.opening_date && !ehContratacaoDireta(p.modality?.name));
  return processos;
}

/** Filtro "Situação" da lista ("all" = todas). */
export const daSituacao = (processos: Process[], situacao: string): Process[] =>
  situacao === "all" ? processos : processos.filter((p) => (p.status ?? "").toUpperCase() === situacao);

const situacaoEncerrada = (s: string) => ENCERRADOS.has(s);

/**
 * A divisória e a situação não podem se excluir (Ativos + Concluído daria
 * sempre lista vazia): escolher um encerrado leva a Todos; voltar a Ativos ou
 * Sem data desfaz a situação de encerrado.
 */
export function combinarAbaESituacao(
  aba: AbaDaLista,
  situacao: string,
  mudou: "aba" | "situacao",
): { aba: AbaDaLista; situacao: string } {
  if (aba === "todos" || !situacaoEncerrada(situacao)) return { aba, situacao };
  return mudou === "situacao" ? { aba: "todos", situacao } : { aba, situacao: "all" };
}

const valor = (p: Process) => {
  const n = Number.parseFloat(p.estimated_value ?? "");
  return Number.isFinite(n) ? n : -1;
};

/** "AAAA-MM-DD" do dia local (sem passar pelo UTC). */
const diaDeHoje = (hoje: Date) =>
  `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

export function ordenar(processos: Process[], ordem: Ordem, hoje: Date = new Date()): Process[] {
  const lista = [...processos];
  switch (ordem) {
    case "proxima-abertura": {
      // Primeiro as sessões de hoje em diante (a mais próxima no alto); depois as
      // que já passaram, da mais recente para a mais antiga; por último as sem data.
      // Datas em "AAAA-MM-DD" ordenam como texto.
      const agora = diaDeHoje(hoje);
      const grupo = (p: Process) => {
        const d = p.opening_date?.slice(0, 10);
        return !d ? 2 : d >= agora ? 0 : 1;
      };
      return lista.sort((a, b) => {
        const ga = grupo(a);
        const gb = grupo(b);
        if (ga !== gb) return ga - gb;
        // Mesmo dia: desempata pela hora (sessão sem hora fica no fim do dia)
        const da = `${a.opening_date ?? ""} ${a.opening_time || "99"}`;
        const db = `${b.opening_date ?? ""} ${b.opening_time || "99"}`;
        return ga === 1 ? db.localeCompare(da) : da.localeCompare(db);
      });
    }
    case "recentes":
      return lista.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    case "maior-valor":
      return lista.sort((a, b) => valor(b) - valor(a));
    case "numero":
      return lista.sort((a, b) => (a.code ?? "").localeCompare(b.code ?? "", "pt-BR", { numeric: true }));
  }
}

/**
 * Ano em que o processo encerrado é arquivado na gaveta: o da última
 * atualização, no fuso de quem lê — a data vem em UTC, e 01h do dia 1º de
 * janeiro em UTC ainda é 31 de dezembro em Brasília (e a coluna "Encerrado em"
 * mostra assim).
 */
export const anoDoArquivo = (p: Pick<Process, "updated_at" | "created_at">) => {
  const valor = p.updated_at || p.created_at;
  if (!valor) return null;
  // só a data (AAAA-MM-DD) já é o próprio dia: sem conversão de fuso
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return Number(valor.slice(0, 4));
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d.getFullYear();
};

/** Anos presentes no arquivo, do mais recente ao mais antigo, com a contagem. */
export function anosDoArquivo(encerrados: Process[]): { ano: number; total: number }[] {
  const contagem = new Map<number, number>();
  for (const p of encerrados) {
    const ano = anoDoArquivo(p);
    if (ano) contagem.set(ano, (contagem.get(ano) ?? 0) + 1);
  }
  return [...contagem.entries()].sort((a, b) => b[0] - a[0]).map(([ano, total]) => ({ ano, total }));
}

/** O que a lista diz quando não sobra nenhuma pasta para mostrar. */
export function listaVazia({ filtrando, aba, totalGeral }: { filtrando: boolean; aba: AbaDaLista; totalGeral: number }): {
  titulo: string;
  texto: string;
  oferecerCriar: boolean;
} {
  if (filtrando) return { titulo: "Nenhum processo encontrado", texto: "Tente outra busca ou outro filtro.", oferecerCriar: false };
  if (totalGeral === 0)
    return { titulo: "Nenhum processo ainda", texto: "Comece pela Nova contratação: três perguntas abrem a pasta.", oferecerCriar: true };
  if (aba === "ativos")
    return { titulo: "Nenhum processo em andamento", texto: "Os encerrados estão no Arquivo.", oferecerCriar: true };
  if (aba === "sem-data")
    return { titulo: "Todos têm data de abertura", texto: "Os prazos legais de todos os processos já podem ser contados.", oferecerCriar: false };
  return { titulo: "Nenhum processo", texto: "", oferecerCriar: true };
}
