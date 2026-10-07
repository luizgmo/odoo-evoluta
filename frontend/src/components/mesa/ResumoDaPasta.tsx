/**
 * Os dois quadros da capa da pasta: o último andamento e os documentos
 * principais. Tudo vem dos documentos do próprio processo.
 */
import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import type { Document } from "@/types/document";
import { BaixarDocumento } from "@/components/documents/BaixarDocumento";
import { MARCA } from "@/config/marca";
import { quando, ultimoAndamento } from "./andamento";

const ROTULO = "mb-3 block font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const QUADRO = "rounded-lg border border-border bg-background/60 p-4 text-sm";

export const ResumoDaPasta: React.FC<{ documentos: Document[] }> = ({ documentos }) => {
  const andamento = ultimoAndamento(documentos);
  const principais = documentos.filter((d) => d.has_completed_generated_doc && d.status !== "dismissed").slice(0, 3);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className={QUADRO} aria-labelledby="quadro-andamento">
        <span id="quadro-andamento" className={ROTULO}>
          Último andamento
        </span>
        {andamento ? (
          <>
            <p className="font-semibold">{andamento.quando}</p>
            <p className="mt-1">{andamento.texto}</p>
          </>
        ) : (
          <p className="text-muted-foreground">Nenhum documento ainda. Comece pela primeira etapa, abaixo.</p>
        )}
      </section>

      <section className={QUADRO} aria-labelledby="quadro-documentos">
        <span id="quadro-documentos" className={ROTULO}>
          {MARCA.campos.documentos}
        </span>
        {principais.length === 0 ? (
          <p className="text-muted-foreground">Nenhum documento concluído ainda.</p>
        ) : (
          <ul className="space-y-2">
            {principais.map((d) => (
              <li key={d.id} className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <Link to={`/documents/${d.id}`} className="group flex min-w-0 items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-destructive/80" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block font-medium [overflow-wrap:anywhere] group-hover:underline">{d.name || d.document_type?.name}</span>
                    {quando(d.updated_at) && (
                      <span className="block text-xs text-muted-foreground">atualizado em {quando(d.updated_at)}</span>
                    )}
                  </span>
                </Link>
                <BaixarDocumento
                  nome={d.name || d.document_type?.name || "documento"}
                  idDoArquivo={d.completed_generated_doc_id}
                  contexto="na capa da pasta"
                  variant="outline"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
