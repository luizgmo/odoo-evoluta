/**
 * EXEMPLO DE DOMÍNIO (licitações): depende de fasesDaLicitacao.ts; em outro sistema,
 * use como modelo de um marcador de progresso e passe o seu em PastaNaGaveta.progresso.
 *
 * As fases da licitação em bolinhas, para caber numa linha de lista
 * (azul cheio = feita, azul com aro = atual, contorno = por vir), com o
 * nome da fase atual escrito ao lado.
 */
import React from "react";
import { cn } from "@/lib/utils";
import type { Process } from "@/types/process";
import { situacaoDasFases } from "./fasesDaLicitacao";
import { GEN, MARCA } from "@/config/marca";

export const FasesEmBolinhas: React.FC<{ processo: Pick<Process, "status" | "publication_date" | "opening_date" | "modality"> }> = ({ processo }) => {
  const { fases, atual, contratacaoDireta } = situacaoDasFases(processo);
  if (contratacaoDireta) {
    return <p className="mt-2 text-xs text-muted-foreground">{MARCA.campos.contratacaoDireta}</p>;
  }
  if (atual < 0) {
    return <p className="mt-2 text-xs text-muted-foreground">Encerrad{GEN.fim} sem concluir</p>;
  }
  return (
    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1" aria-hidden="true">
        {fases.map((f) => (
          <span
            key={f.nome}
            className={cn(
              "inline-block rounded-full",
              f.estado === "feita" && "h-2 w-2 bg-[hsl(var(--tinta-azul))]",
              f.estado === "atual" && "h-2.5 w-2.5 bg-[hsl(var(--tinta-azul))] ring-2 ring-[hsl(var(--tinta-azul)/0.35)] ring-offset-2 ring-offset-[hsl(var(--mesa-papel))]",
              f.estado === "por vir" && "h-2 w-2 border-[1.5px] border-[hsl(var(--mesa-contorno))]",
            )}
          />
        ))}
      </span>
      <span>
        {MARCA.campos.faseRotulo} {atual + 1} de {fases.length}: {fases[atual]?.nome}
      </span>
    </p>
  );
};
