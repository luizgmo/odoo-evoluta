/**
 * Trilha "você está em": Minha Mesa / Processos / 000123/2026 / … O primeiro passo
 * é sempre a tela inicial (MARCA.inicio → MARCA.rotaInicial). Cada passo leva de volta;
 * o último é a tela atual. Número de processo em letra de máquina (mono), como na
 * etiqueta da pasta.
 */
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface PassoDaTrilha {
  rotulo: string;
  /** Sem destino: é a tela atual. */
  para?: string;
  /** Número de processo, folha: em mono. */
  numero?: boolean;
}

export const Trilha: React.FC<{ passos: PassoDaTrilha[]; className?: string }> = ({ passos, className }) => (
  <nav aria-label="Você está em" className={cn("nao-imprimir text-sm", className)}>
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
      {passos.map((passo, i) => {
        const ultimo = i === passos.length - 1;
        const texto = <span className={cn(passo.numero && "font-mono")}>{passo.rotulo}</span>;
        return (
          <li key={`${passo.rotulo}-${i}`} className="flex items-center gap-2">
            {passo.para && !ultimo ? (
              <Link to={passo.para} className="rounded-sm hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {texto}
              </Link>
            ) : (
              <span aria-current={ultimo ? "page" : undefined} className={cn(ultimo && "font-semibold text-foreground")}>
                {texto}
              </span>
            )}
            {!ultimo && (
              <span aria-hidden="true" className="text-muted-foreground">
                /
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
