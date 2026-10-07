/**
 * Datas e o último andamento da pasta, a partir dos documentos do processo.
 * EXEMPLO DE DOMÍNIO: "dispensado/concluído/em redação" são estados de documento gerado; troque pelos do seu sistema.
 */
import type { Document } from "@/types/document";

export const quando = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

/** O documento mexido por último; dispensa também é andamento. */
export const ultimoAndamento = (documentos: Document[]) => {
  const comData = documentos
    .map((d) => ({ d, ts: d.dismissed_at && d.dismissed_at > d.updated_at ? d.dismissed_at : d.updated_at }))
    .filter((x) => !!x.ts)
    .sort((a, b) => b.ts.localeCompare(a.ts));
  const mais = comData[0];
  if (!mais) return null;
  const { d, ts } = mais;
  const nome = d.name || d.document_type?.name || "Documento";
  const texto =
    d.status === "dismissed"
      ? `${nome} dispensado${d.dismiss_reason ? `: ${d.dismiss_reason}` : "."}`
      : d.has_completed_generated_doc
        ? `${nome} concluído.`
        : `${nome} em redação.`;
  return { quando: quando(ts), texto };
};

