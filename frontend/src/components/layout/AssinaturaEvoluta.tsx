/**
 * "Uma solução Evoluta": o texto tem sempre a mesma largura do logo, em
 * qualquer tamanho. A largura vem de quem usa (w-20, w-24…); o texto é desenhado
 * num SVG com textLength igual à largura do logo, então as letras se espaçam
 * para caber exatamente.
 */
import React from "react";
import { cn } from "@/lib/utils";

export const AssinaturaEvoluta: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex w-20 flex-col gap-[5%]", className)}>
    <span className="sr-only">Uma solução</span>
    <svg viewBox="0 0 100 9" className="block h-auto w-full overflow-visible" aria-hidden="true">
      <text
        x="0"
        y="8"
        textLength="100"
        lengthAdjust="spacing"
        fill="currentColor"
        style={{ fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 600 }}
      >
        UMA SOLUÇÃO
      </text>
    </svg>
    <img src="/evoluta-logo.png" alt="Evoluta" className="block h-auto w-full" />
  </div>
);
