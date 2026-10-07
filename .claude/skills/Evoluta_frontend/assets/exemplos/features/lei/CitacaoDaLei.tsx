// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Citação de lei sublinhada que abre a gaveta "Lei ao lado". Artigo que o
 * Licitars não resume, ou tela fora do layout, fica texto comum.
 */
import React from "react";
import { artigoDaCitacao } from "./artigos";
import { useLeiAoLado } from "./contextoDaLei";

export const CitacaoDaLei: React.FC<{ children: string; noSeuCaso?: string; className?: string }> = ({
  children,
  noSeuCaso,
  className,
}) => {
  const lei = useLeiAoLado();
  const numero = artigoDaCitacao(children);
  if (!lei || !numero) return <span className={className}>{children}</span>;
  return (
    <button
      type="button"
      onClick={() => lei.abrir(numero, noSeuCaso)}
      className={
        "inline rounded-sm p-0 text-left underline decoration-dotted underline-offset-2 hover:decoration-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
        (className ?? "")
      }
      aria-label={`${children}: abrir a lei ao lado`}
    >
      {children}
    </button>
  );
};
