import React from "react";
import type { Process } from "@/types/process";
import { MARCA } from "@/config/marca";

/** Mostra somente a etapa que veio do project.stage_id no Odoo. */
export const EtapaEmDestaque: React.FC<{ processo: Pick<Process, "projectInfo"> }> = ({ processo }) => {
  const etapa = processo.projectInfo?.etapa?.name;
  if (!etapa) return null;
  return (
    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--tinta-azul))]" aria-hidden="true" />
      <span>{MARCA.campos.fase}: {etapa}</span>
    </p>
  );
};
