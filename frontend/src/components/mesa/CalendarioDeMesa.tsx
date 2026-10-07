/**
 * Calendário de mesa: o mês numa folha de espiral. O dia de prazo legal é
 * circulado em tinta carmim; o da sessão pública leva moldura dupla azul; feriado
 * fica em carmim. Setas passam de mês; "Hoje" volta ao mês atual.
 */
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { montarMes, type DiaDoMes } from "@/features/agenda/calendarioDoMes";
import type { Compromisso } from "@/features/agenda/montarAgenda";
import { Carimbo } from "./Mesa";
import { BlocoEspiral } from "./BlocoEspiral";
import { MARCA } from "@/config/marca";

const SEMANA =["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const descricaoDoDia = (d: DiaDoMes) => {
  const partes = [d.data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })];
  if (d.hoje) partes.push("hoje");
  if (d.feriado) partes.push(d.feriado);
  for (const c of d.compromissos) partes.push(`${c.titulo}, ${c.processo.code}`);
  return partes.join(". ");
};

const Dia: React.FC<{ d: DiaDoMes }> = ({ d }) => {
  const marcado = d.prazo || d.sessao || d.hoje || !!d.feriado;
  return (
    <td
      className={cn(
        "relative h-11 border-t border-border p-0 text-center align-middle text-[15px] sm:h-[46px]",
        d.feriado ? "font-semibold text-[hsl(var(--tinta-carmim))]" : d.fimDeSemana ? "text-muted-foreground" : "text-foreground",
      )}
      title={d.feriado ?? undefined}
    >
      {d.prazo && <i className="cal-marca text-[hsl(var(--tinta-carmim))]" aria-hidden="true" />}
      {d.sessao && <i className="cal-marca cal-marca-quadro text-[hsl(var(--tinta-azul))]" aria-hidden="true" />}
      <span
        className={cn(
          "relative inline-grid h-[30px] w-[30px] place-items-center rounded-full",
          d.hoje && "bg-foreground font-semibold text-background",
        )}
        aria-current={d.hoje ? "date" : undefined}
      >
        {d.dia}
      </span>
      {marcado && <span className="sr-only">{descricaoDoDia(d)}</span>}
    </td>
  );
};

interface Props {
  compromissos: Compromisso[];
  hoje: Date;
  /** `tipo` do compromisso que ganha a moldura dupla azul (padrão MARCA.campos.tipoDoEvento). */
  tipoEmDestaque?: string;
  /** Rótulos da legenda (padrão MARCA.campos.prazo / .evento): troque por prop ou em MARCA, sem editar o componente. */
  rotuloPrazo?: string;
  rotuloDestaque?: string;
}

export const CalendarioDeMesa: React.FC<Props> = ({
  compromissos,
  hoje,
  tipoEmDestaque = MARCA.campos.tipoDoEvento,
  rotuloPrazo = MARCA.campos.prazo,
  rotuloDestaque = MARCA.campos.evento,
}) => {
  const [visto, setVisto] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() });
  const semanas = montarMes(visto.ano, visto.mes, compromissos, hoje, undefined, tipoEmDestaque);
  const noMesDeHoje = visto.ano === hoje.getFullYear() && visto.mes === hoje.getMonth();
  const passar = (n: number) => {
    const d = new Date(visto.ano, visto.mes + n, 1);
    setVisto({ ano: d.getFullYear(), mes: d.getMonth() });
  };
  const nomeDoMes = new Date(visto.ano, visto.mes, 1).toLocaleDateString("pt-BR", { month: "long" });

  return (
    <BlocoEspiral className="p-5 pt-11">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-[1.9rem] font-medium leading-none text-foreground">
          <span className="capitalize">{nomeDoMes}</span> <span className="font-normal text-muted-foreground">{visto.ano}</span>
        </h2>
        <span className="flex items-center gap-1">
          {!noMesDeHoje && (
            <button
              type="button"
              onClick={() => setVisto({ ano: hoje.getFullYear(), mes: hoje.getMonth() })}
              className="rounded px-2 py-1 text-sm font-semibold text-primary hover:underline dark:text-accent"
            >
              Hoje
            </button>
          )}
          <button
            type="button"
            aria-label="Mês anterior"
            onClick={() => passar(-1)}
            className="grid h-8 w-8 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Próximo mês"
            onClick={() => passar(1)}
            className="grid h-8 w-8 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </span>
      </div>

      <table className="w-full table-fixed border-collapse" aria-label={`Calendário de ${nomeDoMes} de ${visto.ano}`}>
        <thead>
          <tr>
            {SEMANA.map((s) => (
              <th key={s} scope="col" className="pb-2 text-center font-ui text-xs font-semibold text-muted-foreground">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanas.map((semana, i) => (
            <tr key={i}>
              {semana.map((d, j) => (d ? <Dia key={j} d={d} /> : <td key={j} className="h-11 border-t border-border sm:h-[46px]" />))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 grid gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex min-w-[5.5rem] justify-center">
            <Carimbo tinta="carmim" giro={-3}>{rotuloPrazo}</Carimbo>
          </span>
          circulado em tinta no dia
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex min-w-[5.5rem] justify-center">
            <Carimbo tinta="azul" giro={2}>{rotuloDestaque}</Carimbo>
          </span>
          moldura dupla
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-block min-w-[5.5rem] text-center font-semibold text-[hsl(var(--tinta-carmim))]">12</span>
          {MARCA.campos.feriadoNota}
        </div>
      </div>
    </BlocoEspiral>
  );
};
