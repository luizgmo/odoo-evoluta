// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React from "react";
import { Link, useInRouterContext } from "react-router-dom";
import { MessageSquare } from "lucide-react";

interface Chat8EmptyStateProps {
  title?: string;
  description?: string;
}

/** Conversa sem documento: diz o que falta e leva aos processos (nenhum beco sem saída). */
export const Chat8EmptyState: React.FC<Chat8EmptyStateProps> = ({ title, description }) => {
  // Fora de um roteador (isolado, em teste) o caminho de volta não tem para onde ir
  const comRotas = useInRouterContext();
  const displayTitle = title ?? "LicitarsAI";
  const displayDescription =
    description ??
    "Selecione um documento na barra lateral para iniciar uma conversa inteligente com nosso assistente baseado em IA";

  return (
    <section className="folha mx-auto max-w-lg space-y-3 p-6 md:p-8">
      <p className="flex items-center gap-2 font-ui text-xs font-semibold uppercase tracking-[0.12em] tinta-violeta">
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
        Conversa com a IA
      </p>
      <h2 className="text-3xl font-semibold leading-tight">{displayTitle}</h2>
      <p className="text-muted-foreground">{displayDescription}</p>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Dica:</span> O assistente pode responder perguntas, gerar conteúdo e auxiliar na
        elaboração de documentos.
      </p>
      {comRotas && (
        <Link to="/processes" className="inline-block pt-2 text-sm font-semibold text-primary hover:underline dark:text-accent">
          Ver os processos ›
        </Link>
      )}
    </section>
  );
};
