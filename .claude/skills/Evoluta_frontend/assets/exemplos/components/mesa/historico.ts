// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Livro de registro do processo, montado com o que o servidor já guarda: a
 * criação do processo, as versões de cada documento (escritas pela IA,
 * editadas ou restauradas) e as dispensas de etapa.
 */
import type { Process } from "@/types/process";
import type { Document } from "@/types/document";
import type { DocumentRevision } from "@/services/api/endpoints/document-revisions";
import type { Tinta } from "./Mesa";

export type TipoDeRegistro = "autuacao" | "ia" | "versao" | "restauracao" | "dispensa";

export interface Registro {
  id: string;
  ts: string;
  tipo: TipoDeRegistro;
  carimbo: string;
  tinta: Tinta;
  frase: string;
  /** Motivo ou anotação que acompanhou o ato. */
  nota?: string;
  /** Para onde "Ver ›" leva. */
  para?: string;
}

/** Filtros do livro (divisórias de filtro). */
export const FILTROS_DO_HISTORICO = [
  { id: "tudo", rotulo: "Tudo", tipos: null },
  { id: "versoes", rotulo: "Versões", tipos: ["versao", "restauracao"] },
  { id: "ia", rotulo: "IA", tipos: ["ia"] },
  { id: "atos", rotulo: "Atos do processo", tipos: ["autuacao", "dispensa"] },
] as const;

export type IdDoFiltro = (typeof FILTROS_DO_HISTORICO)[number]["id"];

const nomeDo = (d: Document) => d.name || d.document_type?.name || "Documento";
const quem = (autor: string | null | undefined) => (autor ? autor : "Alguém");

export function montarHistorico(
  processo: Pick<Process, "id" | "code" | "created_at">,
  documentos: Document[],
  versoesPorDocumento: Record<string, DocumentRevision[]>,
): Registro[] {
  const registros: Registro[] = [];

  if (processo.created_at) {
    registros.push({
      id: "autuacao",
      ts: processo.created_at,
      tipo: "autuacao",
      carimbo: "Autuação",
      tinta: "azul",
      frase: `Processo ${processo.code || "sem número"} aberto no Licitars.`,
    });
  }

  for (const doc of documentos) {
    const nome = nomeDo(doc);
    for (const v of versoesPorDocumento[String(doc.id)] ?? []) {
      const base = { ts: v.created_at, para: `/documents/${doc.id}`, nota: v.notes?.trim() || undefined };
      if (v.source === "AI_GENERATED") {
        registros.push({
          ...base,
          id: `v-${v.id}`,
          tipo: "ia",
          carimbo: "IA",
          tinta: "violeta",
          frase: `A IA escreveu a versão ${v.revision_number} de ${nome}${v.author_username ? `, a pedido de ${v.author_username}` : ""}.`,
        });
      } else if (v.source === "RESTORED") {
        registros.push({
          ...base,
          id: `v-${v.id}`,
          tipo: "restauracao",
          carimbo: "Restauração",
          tinta: "ocre",
          frase: `${quem(v.author_username)} restaurou uma versão anterior de ${nome}, que virou a versão ${v.revision_number}.`,
        });
      } else {
        registros.push({
          ...base,
          id: `v-${v.id}`,
          tipo: "versao",
          carimbo: "Versão",
          tinta: "azul",
          frase: `${quem(v.author_username)} salvou a versão ${v.revision_number} de ${nome}.`,
        });
      }
    }
    if (doc.status === "dismissed" && doc.dismissed_at) {
      registros.push({
        id: `d-${doc.id}`,
        ts: doc.dismissed_at,
        tipo: "dispensa",
        carimbo: "Dispensa",
        tinta: "ocre",
        frase: `A etapa ${nome} foi dispensada.`,
        nota: doc.dismiss_reason?.trim() || undefined,
        para: `/processes/${processo.id}`,
      });
    }
  }

  return registros.sort((a, b) => b.ts.localeCompare(a.ts));
}

export const filtrar = (registros: Registro[], filtro: IdDoFiltro) => {
  const tipos = FILTROS_DO_HISTORICO.find((f) => f.id === filtro)?.tipos;
  return tipos ? registros.filter((r) => (tipos as readonly string[]).includes(r.tipo)) : registros;
};

/** Agrupa por dia (data local), mantendo a ordem. */
export function porDia(registros: Registro[]): { dia: Date; chave: string; registros: Registro[] }[] {
  const grupos: { dia: Date; chave: string; registros: Registro[] }[] = [];
  for (const r of registros) {
    const d = new Date(r.ts);
    if (Number.isNaN(d.getTime())) continue;
    const chave = d.toLocaleDateString("pt-BR");
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.chave === chave) ultimo.registros.push(r);
    else grupos.push({ dia: new Date(d.getFullYear(), d.getMonth(), d.getDate()), chave, registros: [r] });
  }
  return grupos;
}
