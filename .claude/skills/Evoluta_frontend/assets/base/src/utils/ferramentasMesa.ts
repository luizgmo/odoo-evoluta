/**
 * Cálculos genéricos das ferramentas da mesa (livro do período, quem está com o quê,
 * autos para imprimir, painéis). Só organizam o que o servidor já entrega. Os exemplos em
 * `exemplos/pages/` (LivroGestao, PlantaReparticao, AutosImpressao) importam daqui.
 * Fora do genérico (fica no exemplo de licitação): montarExtrato, que escreve o aviso do diário.
 */
import type { Process } from "@/types/process";
import type { Document } from "@/types/document";
import { getProcessStatusConfig, getProcessStatusLabel } from "@/constants/process-status";
import { MARCA } from "@/config/marca";
import { lerData } from "./datas";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function valorEmReais(valor: string | number | null | undefined): number {
  if (valor === null || valor === undefined || valor === "") return 0;
  const n = typeof valor === "number" ? valor : parseFloat(valor);
  return Number.isFinite(n) ? n : 0;
}

export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

/** Lacuna a preencher à mão antes de imprimir ou publicar: nunca invente o dado que falta. Escrita entre colchetes porque `contarTexto` conta assim. */
export const LACUNA = (o_que: string) => `[${o_que}]`;

/** Data de um registro do servidor (com hora) no fuso de quem está vendo. */
export function dataDoRegistro(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? lerData(valor) : d;
}

export interface ContagemTexto {
  caracteresComEspacos: number;
  caracteresSemEspacos: number;
  palavras: number;
  lacunas: number;
}

export function contarTexto(texto: string): ContagemTexto {
  const semQuebras = texto.replace(/\r?\n/g, " ");
  return {
    caracteresComEspacos: semQuebras.length,
    caracteresSemEspacos: texto.replace(/\s/g, "").length,
    palavras: texto.trim() ? texto.trim().split(/\s+/).length : 0,
    lacunas: (texto.match(/\[[^\]\n]+\]/g) || []).length,
  };
}

/* ------------------------------ Livro do período --------------------------- */

/** Data que representa o item no livro: a de publicação, ou a de criação se não publicado. */
export function dataDeReferencia(processo: Process): Date | null {
  const publicacao = lerData(processo.publication_date);
  if (publicacao) return publicacao;
  // created_at vem com hora em UTC: o dia que conta é o do fuso de quem vê.
  const criacao = dataDoRegistro(processo.created_at);
  return criacao ? new Date(criacao.getFullYear(), criacao.getMonth(), criacao.getDate()) : null;
}

export function filtrarPorPeriodo(processos: Process[], de: Date | null, ate: Date | null): Process[] {
  return processos
    .filter((p) => {
      const data = dataDeReferencia(p);
      if (!data) return false;
      if (de && data < de) return false;
      if (ate && data > ate) return false;
      return true;
    })
    .sort((a, b) => (dataDeReferencia(a)?.getTime() ?? 0) - (dataDeReferencia(b)?.getTime() ?? 0));
}

export interface LinhaResumo {
  rotulo: string;
  quantidade: number;
  valor: number;
}

export function resumirPor(processos: Process[], chave: (p: Process) => string): LinhaResumo[] {
  const mapa = new Map<string, LinhaResumo>();
  for (const p of processos) {
    const rotulo = chave(p);
    const linha = mapa.get(rotulo) ?? { rotulo, quantidade: 0, valor: 0 };
    linha.quantidade++;
    linha.valor += valorEmReais(p.estimated_value);
    mapa.set(rotulo, linha);
  }
  return [...mapa.values()].sort((a, b) => b.quantidade - a.quantidade || a.rotulo.localeCompare(b.rotulo, "pt-BR"));
}

export function resumirLivro(processos: Process[]) {
  return {
    total: processos.length,
    valorTotal: processos.reduce((soma, p) => soma + valorEmReais(p.estimated_value), 0),
    porModalidade: resumirPor(processos, (p) => p.modality?.name || MARCA.objeto.semAgrupamento),
    porSituacao: resumirPor(processos, (p) => getProcessStatusLabel(p.status)),
  };
}

/* ---------------------------- Autos para imprimir -------------------------- */

/** Peças na ordem em que foram juntadas. */
export function ordenarPecas(documentos: Document[]): Document[] {
  return [...documentos].sort(
    (a, b) => (dataDoRegistro(a.created_at)?.getTime() ?? 0) - (dataDoRegistro(b.created_at)?.getTime() ?? 0),
  );
}

/**
 * Separa o que é peça dos autos do que não é: etapa dispensada (status "dismissed") e etapa
 * aberta e não concluída (status "pending" sem documento gerado concluído). Registro sem
 * status fica como peça, para não sumir documento enviado.
 * EXEMPLO DE DOMÍNIO: "dispensada"/"Document" (etapa dispensada de um fluxo de documentos gerados) são
 * conceitos do sistema de origem; os nomes ficam só no código, o texto que o usuário vê vem de quem chama.
 */
export function separarPecas(documentos: Document[]): {
  pecas: Document[];
  dispensadas: Document[];
  naoConcluidas: Document[];
} {
  const pecas: Document[] = [];
  const dispensadas: Document[] = [];
  const naoConcluidas: Document[] = [];
  for (const d of ordenarPecas(documentos)) {
    if (d.status === "dismissed") dispensadas.push(d);
    else if (d.status === "pending" && !d.has_completed_generated_doc) naoConcluidas.push(d);
    else pecas.push(d);
  }
  return { pecas, dispensadas, naoConcluidas };
}

/* --------------------------- Quem está com o quê -------------------------- */

/** Encerrados (a tabela de constants/process-status.ts diz quais) saem da planta, a não ser que se peça. */
export function emAndamento(processo: Process): boolean {
  return !getProcessStatusConfig(processo.status).encerrada;
}

export const SEM_RESPONSAVEL = "Sem responsável";

export interface PilhaResponsavel {
  responsavel: string;
  processos: Process[];
  valorTotal: number;
}

/** Agrupa por responsável; nomes que só diferem em maiúsculas/espaços são a mesma pessoa. */
export function agruparPorResponsavel(processos: Process[]): PilhaResponsavel[] {
  const mapa = new Map<string, PilhaResponsavel>();
  for (const p of processos) {
    const nome = (p.responsible || "").trim().replace(/\s+/g, " ");
    const chave = nome ? nome.toLocaleLowerCase("pt-BR") : "";
    const pilha = mapa.get(chave) ?? { responsavel: nome || SEM_RESPONSAVEL, processos: [], valorTotal: 0 };
    pilha.processos.push(p);
    pilha.valorTotal += valorEmReais(p.estimated_value);
    mapa.set(chave, pilha);
  }
  return [...mapa.values()].sort(
    (a, b) => b.processos.length - a.processos.length || a.responsavel.localeCompare(b.responsavel, "pt-BR"),
  );
}
