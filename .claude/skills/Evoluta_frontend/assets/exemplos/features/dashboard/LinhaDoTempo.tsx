// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React, { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Carimbo } from "@/components/mesa/Mesa";
import type { ColunaLinha } from "./montarLinhaDoTempo";

interface Props {
  colunas: ColunaLinha[];
  hoje: Date;
}

/** Marca de cada ponto do trilho. */
const MARCO: Record<ColunaLinha["id"], string> = {
  feito: "h-3.5 w-3.5 border-2 border-muted-foreground/60 bg-card",
  hoje: "h-3.5 w-3.5 bg-moldura ring-4 ring-card outline outline-1 outline-moldura dark:bg-foreground dark:outline-foreground",
  aguarda: "h-5 w-5 bg-gold",
  semana: "h-3.5 w-3.5 bg-primary",
  adiante: "h-3.5 w-3.5 border-2 border-muted-foreground/60 bg-card",
};

const Rotulo: React.FC<{ coluna: ColunaLinha; className?: string }> = ({ coluna, className }) => (
  <span
    className={cn(
      "font-ui text-xs font-semibold uppercase tracking-[0.12em]",
      coluna.id === "aguarda" && coluna.itens.length > 0
        ? "text-[color:var(--color-status-warning)]"
        : "text-muted-foreground",
      className,
    )}
  >
    {coluna.rotulo}
  </span>
);

const Cartao: React.FC<{ coluna: ColunaLinha }> = ({ coluna }) => {
  const [primeiro, ...resto] = coluna.itens;
  // Sem tela própria para onde ir (ex.: "Feito há pouco"), os demais abrem aqui mesmo
  const [mostrarResto, setMostrarResto] = useState(false);
  const idResto = useId();
  const chamaAtencao = coluna.id === "aguarda" && primeiro !== undefined;

  const conteudo = primeiro ? (
    <>
      {chamaAtencao && (
        <Carimbo tinta="ocre" giro={-3} className="mb-2">
          Pendente
        </Carimbo>
      )}
      <p className={cn("font-semibold leading-snug", !chamaAtencao && "text-foreground")}>{primeiro.titulo}</p>
      <p className={cn("mt-1 line-clamp-2 text-sm", chamaAtencao ? "opacity-90" : "text-muted-foreground")}>{primeiro.detalhe}</p>
      <p
        className={cn(
          "mt-2 text-xs",
          chamaAtencao ? "font-semibold" : "text-muted-foreground",
        )}
      >
        {primeiro.quando}
      </p>
    </>
  ) : (
    <p className="text-sm text-muted-foreground">{coluna.vazio}</p>
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg p-4",
        // Ouro não tem contraste de borda no claro: lá a borda é a cor de aviso
        chamaAtencao
          ? "border-2 border-[color:var(--color-status-warning)] bg-[hsl(var(--mesa-bilhete))] text-[hsl(var(--mesa-bilhete-texto))] shadow-md dark:border-gold"
          : "mesa-un",
      )}
    >
      <Rotulo coluna={coluna} className={cn("mb-2 lg:hidden", chamaAtencao && "!text-inherit")} />
      {primeiro?.para ? (
        <Link
          to={primeiro.para}
          className="group -m-1 block rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {conteudo}
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-xs font-semibold group-hover:underline",
              chamaAtencao ? "underline" : "text-primary dark:text-accent",
            )}
          >
            {chamaAtencao ? "Resolver" : "Abrir pasta"}
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </span>
        </Link>
      ) : (
        conteudo
      )}
      {resto.length > 0 && (
        <div className="mt-auto pt-3">
          {coluna.verTodos ? (
            <Link to={coluna.verTodos} className={cn("text-xs font-medium hover:underline", chamaAtencao ? "underline" : "text-primary dark:text-accent")}>
              e mais {resto.length}
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMostrarResto((v) => !v)}
                aria-expanded={mostrarResto}
                aria-controls={idResto}
                className={cn("text-xs font-medium hover:underline", chamaAtencao ? "underline" : "text-primary dark:text-accent")}
              >
                {mostrarResto ? "mostrar menos" : `e mais ${resto.length}`}
              </button>
              {mostrarResto && (
                <ul id={idResto} className={cn("mt-2 space-y-2 border-t pt-2", chamaAtencao ? "border-[hsl(var(--mesa-bilhete-texto)/0.3)]" : "border-border")}>
                  {resto.map((item, i) => (
                    <li key={i} className="text-sm">
                      {item.para ? (
                        <Link to={item.para} className={cn("font-semibold hover:underline", !chamaAtencao && "text-foreground")}>
                          {item.titulo}
                        </Link>
                      ) : (
                        <p className={cn("font-semibold", !chamaAtencao && "text-foreground")}>{item.titulo}</p>
                      )}
                      <p className={cn("line-clamp-2", chamaAtencao ? "opacity-90" : "text-muted-foreground")}>{item.detalhe}</p>
                      <p className={cn("text-xs", chamaAtencao ? "opacity-90" : "text-muted-foreground")}>{item.quando}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const LinhaDoTempo: React.FC<Props> = ({ colunas, hoje }) => (
  <section aria-labelledby="linha-do-tempo" className="tampo-vista">
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="linha-do-tempo" className="text-2xl font-semibold">
        Linha do tempo
      </h2>
      <span className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Hoje, {hoje.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
      </span>
    </div>

    <div className="relative">
      {/* Trilho que liga os pontos (só onde as colunas ficam lado a lado) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[10%] right-[10%] top-[49px] hidden h-0.5 bg-border xl:block"
      />
      <ol className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {colunas.map((coluna) => (
          <li key={coluna.id} className="flex flex-col">
            <div className="hidden flex-col items-center pb-3 text-center lg:flex">
              <Rotulo coluna={coluna} />
              <span className="text-xs text-muted-foreground">
                {coluna.itens.length === 0 ? "nada" : coluna.itens.length === 1 ? "1 item" : `${coluna.itens.length} itens`}
              </span>
              <span className="mt-2 flex h-5 items-center">
                {/* Ponto vazio quando não há nada naquela coluna */}
                <span className={cn("relative rounded-full", coluna.itens.length > 0 ? MARCO[coluna.id] : MARCO.adiante)} />
              </span>
            </div>
            <Cartao coluna={coluna} />
          </li>
        ))}
      </ol>
    </div>
  </section>
);
