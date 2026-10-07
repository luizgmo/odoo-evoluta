/**
 * A tela como folha de papel sobre a mesa: trilha, título em serifa, ação
 * principal à direita e o conteúdo dentro da folha. Mesma moldura em toda
 * lista, agenda e painel do sistema.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Trilha, type PassoDaTrilha } from "./Trilha";

interface Props {
  trilha: PassoDaTrilha[];
  titulo: string;
  subtitulo?: React.ReactNode;
  /** Botão principal da tela, à direita do título. */
  acao?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const FolhaDaTela: React.FC<Props> = ({ trilha, titulo, subtitulo, acao, className, children }) => (
  <section className={cn("folha mx-auto w-full max-w-7xl p-4 sm:p-6 md:p-8", className)}>
    <Trilha passos={trilha} className="mb-4" />
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-4xl font-semibold leading-[1.08] text-foreground md:text-[2.75rem]">{titulo}</h1>
        {subtitulo && <p className="mt-2 max-w-[56ch] text-muted-foreground">{subtitulo}</p>}
      </div>
      {acao}
    </header>
    <div className="mt-6 space-y-6">{children}</div>
  </section>
);
