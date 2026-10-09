import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { CalendarioDeMesa } from "@/components/mesa/CalendarioDeMesa";
import { Carimbo, MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { listarAgenda, type ItemAgenda } from "@/services/api/activities";
import { agruparPorSemana } from "@/features/agenda/calendarioDoMes";
import { paraIcs, type Compromisso } from "@/features/agenda/montarAgenda";
import { dataPorExtenso } from "@/features/dashboard/formatos";
import { MARCA } from "@/config/marca";

const baixarIcs = (texto: string) => {
  const url = URL.createObjectURL(new Blob([texto], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "agenda-evoluta.ics";
  a.click();
  URL.revokeObjectURL(url);
};

const hojeISO = () => new Date().toISOString().slice(0, 10);
const daquiUmAnoISO = () => {
  const data = new Date();
  data.setFullYear(data.getFullYear() + 1);
  return data.toISOString().slice(0, 10);
};

const paraCompromisso = (item: ItemAgenda): Compromisso => ({
  id: item.id,
  tipo: item.kind === "activity" ? "atividade" : "prazo_final",
  data: new Date(`${item.date.slice(0, 10)}T00:00:00`),
  hora: null,
  titulo: item.title,
  fundamento: item.kind === "activity" ? "Atividade registrada no Odoo" : "Prazo final persistido no projeto",
  critico: item.kind === "project_deadline",
  processo: { id: item.project_id, code: `EVG-${String(item.project_id).padStart(5, "0")}`, objeto: item.project_name },
});

const Agenda: React.FC = () => {
  const hoje = useMemo(() => new Date(), []);
  const { processos } = useProcessosDaMesa();
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    return listarAgenda(hojeISO(), daquiUmAnoISO())
      .then((resposta) => setCompromissos(resposta.records.map(paraCompromisso)))
      .catch((error) => setErro(error instanceof Error ? error.message : "Não foi possível buscar a agenda."))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const semData = processos.filter((processo) => processo.active && !processo.projectInfo.date_deadline);
  const semanas = agruparPorSemana(compromissos, hoje);

  return <FolhaDaTela
    trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: MARCA.campos.agenda }]}
    titulo={MARCA.campos.agenda}
    subtitulo={`Hoje é ${dataPorExtenso(hoje)}. Os prazos e atividades vêm do Odoo.`}
    acao={<Button variant="outline" className="h-auto max-w-full whitespace-normal py-2 text-left" onClick={() => baixarIcs(paraIcs(compromissos, hoje))} disabled={compromissos.length === 0}><Download className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />Levar para o meu calendário (.ics)</Button>}
  >
    {carregando ? <MesaCarregando texto="Buscando prazos e atividades no Odoo…" /> : erro ? <MesaErroBusca titulo="Não deu para buscar a agenda" texto={erro} onTentarDeNovo={() => void carregar()} /> : <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,min(26rem,48%))_minmax(0,1fr)]">
      <div className="min-w-0"><CalendarioDeMesa compromissos={compromissos} hoje={hoje} /></div>
      <div className="min-w-0 space-y-6">
        {semanas.length === 0 && <p className="text-muted-foreground">Nenhum compromisso futuro cadastrado.</p>}
        {semanas.map((semana) => <section key={semana.chave} aria-label={semana.rotulo}><h2 className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{semana.rotulo}</h2><ul className="mt-2 divide-y divide-border rounded-md border border-border">{semana.itens.map((compromisso) => <li key={compromisso.id} className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="min-w-0 [overflow-wrap:anywhere]"><p className="font-semibold">{compromisso.titulo}</p><p className="text-sm text-muted-foreground">{compromisso.data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} · <Link to={`${MARCA.rotaDaLista}/${compromisso.processo.id}`} className="font-mono text-primary hover:underline dark:text-accent">{compromisso.processo.code}</Link> · {compromisso.fundamento}</p></div>{compromisso.critico && <Carimbo tinta="carmim" giro={-2}>{MARCA.campos.prazo}</Carimbo>}</li>)}</ul></section>)}
        {semData.length > 0 && <section aria-label={MARCA.campos.semData}><h2 className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Projetos sem prazo</h2><ul className="mt-2 divide-y divide-border rounded-md border border-border">{semData.map((processo) => <li key={processo.id} className="min-w-0 p-3 [overflow-wrap:anywhere]"><Link to={`${MARCA.rotaDaLista}/${processo.id}`} className="font-mono text-primary hover:underline dark:text-accent">{processo.code}</Link><span className="text-muted-foreground"> — informe o prazo final do projeto.</span></li>)}</ul></section>}
      </div>
    </div>}
  </FolhaDaTela>;
};

export default Agenda;
