/** Peças de papel dos autos (receita 09 §13.7): a linha rótulo/valor e a rubrica com lacuna. */
import React from "react";
import { LACUNA } from "@/utils/ferramentasMesa";
import { MARCA } from "@/config/marca";

export const Rubrica: React.FC<{ referencia?: string }> = ({ referencia }) => (
  <div className="mt-8 flex flex-col items-end gap-1 text-sm">
    <span className="block w-56 border-b border-current" aria-hidden="true" />
    <span className="mesa-apoio">{LACUNA(MARCA.campos.rubrica)}</span>
    {referencia && <span className="text-xs mesa-apoio">{referencia}</span>}
  </div>
);

export const Linha: React.FC<{ rotulo: string; children: React.ReactNode }> = ({ rotulo, children }) => (
  // No celular o rótulo fica em cima do valor: lado a lado, o valor ficava com ~70px
  <div className="grid grid-cols-1 gap-1 border-t mesa-linha py-2 text-sm sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
    <dt className="mesa-rotulo mesa-apoio">{rotulo}</dt>
    <dd className="[overflow-wrap:anywhere]">{children}</dd>
  </div>
);
