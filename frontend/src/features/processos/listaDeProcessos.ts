/** Regras da lista e do Arquivo: filtros, ordenação e agrupamento por ano. */
import type { Process } from "@/types/process";
import { GEN, MARCA } from "@/config/marca";

import { ehSituacaoAtiva, ehSituacaoEncerrada } from "@/constants/process-status";

export type AbaDaLista = "ativos" | "sem-data" | "todos";
export type Ordem = "proximo-prazo" | "recentes" | "maior-valor" | "numero";

// Quais situações são "ativas" e "encerradas" mora na tabela de constants/process-status.ts
export const ehAtivo = (p: Pick<Process, "status">) => ehSituacaoAtiva(p.status);
export const ehEncerrado = (p: Pick<Process, "status">) => ehSituacaoEncerrada(p.status);

export function daAba(processos: Process[], aba: AbaDaLista): Process[] {
  if (aba === "ativos") return processos.filter(ehAtivo);
  if (aba === "sem-data") return processos.filter((p) => ehAtivo(p) && !p.projectInfo?.date_deadline);
  return processos;
}

/** Filtro "Situação" da lista ("all" = todas). */
export const daSituacao = (processos: Process[], situacao: string): Process[] =>
  situacao === "all" ? processos : processos.filter((p) => (p.status ?? "").toUpperCase() === situacao);

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
  if (aba === "todos" || !ehSituacaoEncerrada(situacao)) return { aba, situacao };
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
    case "proximo-prazo": {
      // Primeiro os prazos de hoje em diante; depois os que já passaram;
      // por último os projetos sem prazo.
      // Datas em "AAAA-MM-DD" ordenam como texto.
      const agora = diaDeHoje(hoje);
      const grupo = (p: Process) => {
        const d = p.projectInfo?.date_deadline?.slice(0, 10);
        return !d ? 2 : d >= agora ? 0 : 1;
      };
      return lista.sort((a, b) => {
        const ga = grupo(a);
        const gb = grupo(b);
        if (ga !== gb) return ga - gb;
        const da = a.projectInfo?.date_deadline ?? "";
                const db = b.projectInfo?.date_deadline ?? "";
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
  if (filtrando) return { titulo: `${GEN.Nenhum} ${MARCA.objeto.singular} encontrad${GEN.fim}`, texto: "Tente outra busca ou outro filtro.", oferecerCriar: false };
  if (totalGeral === 0)
    return { titulo: `${GEN.Nenhum} ${MARCA.objeto.singular} ainda`, texto: `Comece por "${MARCA.acaoPrincipal.rotulo}": poucas perguntas abrem a pasta.`, oferecerCriar: true };
  if (aba === "ativos")
    return { titulo: `${GEN.Nenhum} ${MARCA.objeto.singular} em andamento`, texto: `${GEN.O}s encerrad${GEN.fim}s ficam em "${MARCA.campos.arquivo}".`, oferecerCriar: true };
  if (aba === "sem-data")
    return { titulo: `${GEN.Nenhum} ${MARCA.objeto.singular}: ${MARCA.campos.semData.toLowerCase()}`, texto: "Nenhuma pendência de data nesta lista.", oferecerCriar: false };
  return { titulo: `${GEN.Nenhum} ${MARCA.objeto.singular}`, texto: "", oferecerCriar: true };
}
