import React from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Process } from "@/types/process";
import { CarimboSituacao } from "./Mesa";
import { EtapaEmDestaque } from "./EtapaEmDestaque";
import { espessuraDaPasta } from "./etapasDoProjeto";
import { GEN, MARCA } from "@/config/marca";

interface Dado {
  rotulo: string;
  valor: string;
}

interface Props {
  processo: Process;
  posicao: number;
  dados: Dado[];
  onExcluir?: () => void;
  /** Aviso contextual; passe null quando não houver aviso a exibir. */
  aviso?: React.ReactNode;
  /** Conteúdo de progresso; null desabilita o marcador. */
  progresso?: React.ReactNode;
  espessura?: 1 | 2 | 3;
  rotaBase?: string;
  nomeDoObjeto?: string;
}

export const PastaNaGaveta: React.FC<Props> = ({
  processo,
  posicao,
  dados,
  onExcluir,
  aviso,
  progresso,
  espessura,
  rotaBase = MARCA.rotaDaLista,
  nomeDoObjeto = MARCA.objeto.singular,
}) => {
  const textoDeAviso = aviso === undefined
    ? (!processo.projectInfo?.date_deadline ? MARCA.campos.faltaData : null)
    : aviso;
  return (
    <article className="pasta-gaveta" style={{ "--pos": posicao % 3 } as React.CSSProperties}>
      <span className="pasta-orelha">
        {processo.code && <span className="etiqueta-pasta min-w-0 max-w-full truncate text-foreground" title={processo.code}>{processo.code}</span>}
      </span>
      <div className="pasta-corpo group" style={{ "--espessura": espessura ?? espessuraDaPasta(processo) } as React.CSSProperties}>
        <i className="pasta-lombada" aria-hidden="true" />
        <i className="clipe-de-papel" aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {processo.projectInfo?.secretaria?.name && <span className="mesa-rotulo mesa-apoio">{processo.projectInfo.secretaria.name}</span>}
          {textoDeAviso && <span className="rounded-[3px] border border-[hsl(var(--gold)/0.45)] bg-[hsl(var(--gold)/0.14)] px-2.5 py-1 text-xs [transform:rotate(1.2deg)]">{textoDeAviso}</span>}
          <span className="ml-auto flex items-center gap-1">
            <CarimboSituacao status={processo.status} />
            {onExcluir && <Button size="icon" variant="ghost" aria-label={`Excluir ${GEN.o} ${nomeDoObjeto} ${processo.code || processo.object || processo.id}`} data-testid={`delete-process-${processo.id}`} className="relative z-10 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onExcluir}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>}
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-semibold leading-snug text-foreground">
          <Link to={`${rotaBase}/${processo.id}`} className={cn("transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-primary dark:group-hover:text-accent", "focus-visible:outline-none focus-visible:after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-ring")}>
            {processo.object || MARCA.objeto.semDescricao}
          </Link>
        </h2>
        {processo.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{processo.description}</p>}
        {progresso !== undefined ? progresso : <EtapaEmDestaque processo={processo} />}
        {dados.length > 0 && <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4">{dados.map(({ rotulo, valor }) => <div key={rotulo} className="min-w-0"><dt className="mesa-rotulo mesa-apoio">{rotulo}</dt><dd className="break-words text-sm font-semibold text-foreground">{valor}</dd></div>)}</dl>}
      </div>
    </article>
  );
};
