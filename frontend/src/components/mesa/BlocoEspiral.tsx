/**
 * Bloco preso por argolas de metal: o calendário e o bloco de notas da agenda.
 * As argolas são só enfeite; o conteúdo vem por baixo delas.
 */
import React from "react";
import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  argolas?: number;
}

export const BlocoEspiral: React.FC<Props> = ({ argolas = 9, className, children, ...resto }) => (
  <div className={cn("bloco-espiral", className)} {...resto}>
    <span className="espiral" aria-hidden="true">
      {Array.from({ length: argolas }, (_, i) => (
        <i key={i} />
      ))}
    </span>
    {children}
  </div>
);
