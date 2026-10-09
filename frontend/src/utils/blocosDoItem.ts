/**
 * O que o .docx (e a tela do documento) leva a partir de um item: o subtítulo de cada campo, com os
 * rótulos de MARCA.campos, e o valor. Serve à ficha baixada na pasta (Item.tsx) e à tela
 * `/documents/:id` quando o id é o de um item (Documento.tsx). Em um sistema real, o conteúdo vem do
 * servidor; aqui ele é montado dos dados que a tela já tem.
 */
import type { Process } from "@/types/process";
import type { BlocoDocx } from "@/utils/baixarDocx";
import { MARCA } from "@/config/marca";
import { dataDeAbertura, formatBRLComCentavos } from "@/features/dashboard/formatos";

/** Nome do arquivo e título do documento do item ("Ficha PROC-2026-00001"). */
export const nomeDoDocumentoDoItem = (p: Pick<Process, "code">) => `Ficha ${p.code || MARCA.objeto.semNumero}`;

export const blocosDoItem = (p: Process): BlocoDocx[] => [
  { titulo: MARCA.campos.agrupamento },
  p.projectInfo?.secretaria?.name || MARCA.objeto.semAgrupamento,
  { titulo: MARCA.campos.objeto },
  p.object || MARCA.objeto.semDescricao,
  { titulo: MARCA.campos.data },
  p.projectInfo?.date_deadline ? dataDeAbertura(p.projectInfo.date_deadline) : MARCA.campos.semData,
  { titulo: MARCA.campos.valor },
  formatBRLComCentavos(p.estimated_value),
  { titulo: MARCA.campos.responsavel },
  p.responsible || "—",
];
