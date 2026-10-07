/**
 * Estados do sistema: toda mensagem diz o que aconteceu,
 * por quê, e oferece o próximo passo. Nenhuma tela termina num beco sem saída.
 */
import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface Props {
  rotulo: string;
  titulo: string;
  children: React.ReactNode;
  /** Os caminhos: o primeiro é o principal. */
  acoes: React.ReactNode;
  /** Rótulo em carmim (erro), não em cinza. */
  alerta?: boolean;
  /** Nível do título: 1 quando o aviso é a única cabeça da tela (404, sem permissão); 2 dentro de uma FolhaDaTela, que já tem o seu h1. */
  nivel?: 1 | 2;
  className?: string;
}

export const AvisoDeEstado: React.FC<Props> = ({ rotulo, titulo, children, acoes, alerta, nivel = 1, className }) => {
  const Titulo = nivel === 2 ? "h2" : "h1";
  const idDoTitulo = useId();
  return (
  <section className={cn("folha mx-auto max-w-lg space-y-3 p-6 md:p-8", className)} aria-labelledby={idDoTitulo}>
    <p
      className={cn(
        "font-ui text-xs font-semibold uppercase tracking-[0.12em]",
        alerta ? "text-[color:var(--color-status-error)]" : "text-muted-foreground",
      )}
    >
      {rotulo}
    </p>
    <Titulo id={idDoTitulo} className="text-3xl font-semibold leading-tight">
      {titulo}
    </Titulo>
    <div className="text-muted-foreground">{children}</div>
    <div className="flex flex-wrap items-center gap-4 pt-2">{acoes}</div>
  </section>
  );
};
