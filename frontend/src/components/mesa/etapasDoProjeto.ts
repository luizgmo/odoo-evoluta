import type { Process } from "@/types/process";
import { ehSituacaoConcluida, ehSituacaoEncerrada } from "@/constants/process-status";

/**
 * A etapa exibida na Mesa é sempre a etapa persistida no projeto pelo Odoo.
 * Sem etapa persistida, não estimamos nem inventamos uma etapa local.
 */
export const nomeDaEtapa = (processo: Pick<Process, "projectInfo">): string | null =>
  processo.projectInfo?.etapa?.name || null;

/** Espessura puramente visual da pasta, sem inferir andamento de datas. */
export const espessuraDaPasta = (processo: Pick<Process, "status" | "projectInfo">): 1 | 2 | 3 => {
  if (ehSituacaoConcluida(processo.status)) return 3;
  if (ehSituacaoEncerrada(processo.status)) return 1;
  return processo.projectInfo?.etapa ? 2 : 1;
};
