/**
 * Divisórias de filtro: abas sobre a folha que mudam o que a
 * lista mostra — "Ativos · 7", "Próximos 7 dias · 3". A escolhida sobe um pouco e
 * se funde à folha.
 */
import React from "react";
import { cn } from "@/lib/utils";

export interface OpcaoDeFiltro<T extends string> {
  id: T;
  rotulo: string;
  total?: number;
}

interface Props<T extends string> {
  /** Nome do grupo para leitor de tela: "Filtrar o histórico". */
  rotulo: string;
  opcoes: OpcaoDeFiltro<T>[];
  valor: T;
  onChange: (id: T) => void;
  className?: string;
}

export function DivisoriasDeFiltro<T extends string>({ rotulo, opcoes, valor, onChange, className }: Props<T>) {
  return (
    <div role="group" aria-label={rotulo} className={cn("flex flex-wrap items-end gap-1 border-b border-border", className)}>
      {opcoes.map((o) => {
        const ativo = o.id === valor;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={ativo}
            onClick={() => onChange(o.id)}
            className={cn(
              // As abas quebram para a linha de baixo e o rótulo pode ter duas linhas: nada fica cortado fora da tela (400px com "texto maior").
              // min-h + py + leading: o texto não cola na borda de baixo
              "max-w-full whitespace-normal text-left rounded-t-lg border border-b-0 px-4 py-1.5 text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              ativo ? "-mb-px min-h-10 border-border bg-card font-bold" : "min-h-9 border-border/60 bg-muted/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {o.rotulo}
            {o.total !== undefined && ` · ${o.total}`}
          </button>
        );
      })}
    </div>
  );
}
