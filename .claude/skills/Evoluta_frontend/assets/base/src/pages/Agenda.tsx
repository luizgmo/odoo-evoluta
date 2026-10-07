/**
 * Prazos e agenda de exemplo: o mês numa folha de espiral (CalendarioDeMesa) e, ao lado,
 * os próximos compromissos agrupados por semana. Os dados vêm de montarAgenda() sobre os
 * processos de exemplo (inventados); em um sistema real, troque pelos seus compromissos.
 */
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { CalendarioDeMesa } from "@/components/mesa/CalendarioDeMesa";
import { Carimbo } from "@/components/mesa/Mesa";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { agruparPorSemana } from "@/features/agenda/calendarioDoMes";
import { montarAgenda, naJanela, paraIcs } from "@/features/agenda/montarAgenda";
import { dataPorExtenso } from "@/features/dashboard/formatos";
import { MARCA } from "@/config/marca";

const baixarIcs = (texto: string) => {
  const url = URL.createObjectURL(new Blob([texto], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "agenda.ics";
  a.click();
  URL.revokeObjectURL(url);
};

const Agenda: React.FC = () => {
  const { processos } = useProcessosDaMesa();
  const hoje = useMemo(() => new Date(), []);
  const { compromissos, semData } = useMemo(() => montarAgenda(processos), [processos]);
  const proximos = naJanela(compromissos, "tudo", hoje);
  const semanas = agruparPorSemana(proximos, hoje);

  return (
    <FolhaDaTela
      trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: MARCA.campos.agenda }]}
      titulo={MARCA.campos.agenda}
      subtitulo={`Hoje é ${dataPorExtenso(hoje)}. Os prazos são calculados a partir das datas de cada ${MARCA.objeto.singular}.`}
      acao={
        // Rótulo longo: com "texto bem maior" e menu fixo (768–810px) o botão passava da folha; por isso quebra linha
        <Button
          variant="outline"
          className="h-auto max-w-full whitespace-normal py-2 text-left"
          onClick={() => baixarIcs(paraIcs(proximos, hoje))}
          disabled={proximos.length === 0}
        >
          <Download className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
          Levar para o meu calendário (.ics)
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,min(26rem,48%))_minmax(0,1fr)]">
        <div className="min-w-0">
          <CalendarioDeMesa compromissos={compromissos} hoje={hoje} />
        </div>

        <div className="min-w-0 space-y-6">
          {semanas.length === 0 && (
            <p className="text-muted-foreground">Nenhum compromisso daqui para a frente.</p>
          )}
          {semanas.map((semana) => (
            <section key={semana.chave} aria-label={semana.rotulo}>
              <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{semana.rotulo}</h2>
              <ul className="mt-2 divide-y divide-border rounded-md border border-border">
                {semana.itens.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <div className="min-w-0 [overflow-wrap:anywhere]">
                      <p className="font-semibold">{c.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                        {c.hora && ` às ${c.hora}`} ·{" "}
                        <Link to={`${MARCA.rotaDaLista}/${c.processo.id}`} className="font-mono text-primary hover:underline dark:text-accent">
                          {c.processo.code}
                        </Link>{" "}
                        · {c.fundamento}
                      </p>
                    </div>
                    {c.legal && <Carimbo tinta="carmim" giro={-2}>{MARCA.campos.prazo}</Carimbo>}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {semData.length > 0 && (
            <section aria-label={MARCA.campos.semData}>
              <h2 className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{MARCA.campos.semData}</h2>
              <ul className="mt-2 divide-y divide-border rounded-md border border-border">
                {semData.map(({ processo }) => (
                  <li key={processo.id} className="min-w-0 p-3 [overflow-wrap:anywhere]">
                    <Link to={`${MARCA.rotaDaLista}/${processo.id}`} className="font-mono text-primary hover:underline dark:text-accent">
                      {processo.code}
                    </Link>
                    <span className="text-muted-foreground"> — informe a data para calcular os prazos.</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </FolhaDaTela>
  );
};

export default Agenda;
