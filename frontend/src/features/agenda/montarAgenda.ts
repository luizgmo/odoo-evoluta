import type { Process } from "@/types/process";
import { CALENDARIO_PADRAO, lerData, type OpcoesCalendario } from "@/utils/datas";
import { ehSituacaoAtiva } from "@/constants/process-status";
import { MARCA } from "@/config/marca";

export type TipoDeCompromisso = "prazo_final" | "atividade";

export interface Compromisso {
  id: string;
  tipo: TipoDeCompromisso;
  data: Date;
  hora: string | null;
  titulo: string;
  fundamento: string;
  /** Indica um prazo cadastrado no projeto, não um prazo jurídico calculado no navegador. */
  critico: boolean;
  processo: { id: string | number; code: string; objeto: string };
}

export interface PendenciaDeData {
  processo: { id: string | number; code: string; objeto: string };
}

/**
 * A agenda do frontend apenas apresenta o prazo final persistido no projeto.
 * Atividades e compromissos mais ricos devem vir do Odoo quando a API de agenda for exposta;
 * o navegador nunca deriva datas jurídicas ou cria compromissos fictícios.
 */
export function montarAgenda(processos: Process[], _cal: OpcoesCalendario = CALENDARIO_PADRAO) {
  const compromissos: Compromisso[] = [];
  const semData: PendenciaDeData[] = [];

  for (const p of processos) {
    if (!ehSituacaoAtiva(p.status)) continue;
    const processo = {
      id: p.id,
      code: p.code || MARCA.objeto.semNumero,
      objeto: p.object || MARCA.objeto.semDescricao,
    };
    const prazo = lerData(p.projectInfo?.date_deadline);
    if (!prazo) {
      semData.push({ processo });
      continue;
    }
    compromissos.push({
      id: `${p.id}-prazo-final`,
      tipo: "prazo_final",
      data: prazo,
      hora: null,
      titulo: "Prazo final do projeto",
      fundamento: "Data final cadastrada no projeto",
      critico: true,
      processo,
    });
  }

  compromissos.sort((a, b) => a.data.getTime() - b.data.getTime());
  return { compromissos, semData };
}

export type Janela = "semana" | "trinta" | "tudo";

const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function naJanela(compromissos: Compromisso[], janela: Janela, hoje: Date = new Date()): Compromisso[] {
  const inicio = inicioDoDia(hoje).getTime();
  const dias = janela === "semana" ? 8 : janela === "trinta" ? 31 : Number.POSITIVE_INFINITY;
  const fim = inicio + dias * 86_400_000;
  return compromissos.filter((c) => c.data.getTime() >= inicio && c.data.getTime() < fim);
}

export const diasAte = (data: Date, hoje: Date = new Date()) =>
  Math.round((inicioDoDia(data).getTime() - inicioDoDia(hoje).getTime()) / 86_400_000);

const ics = (texto: string) => texto.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
const dataIcs = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

export function paraIcs(compromissos: Compromisso[], agora: Date = new Date()): string {
  const carimbo = `${dataIcs(agora)}T000000Z`;
  const eventos = compromissos.map((c) => [
    "BEGIN:VEVENT",
    `UID:${c.id}@${MARCA.agenda.dominio}`,
    `DTSTAMP:${carimbo}`,
    `DTSTART;VALUE=DATE:${dataIcs(c.data)}`,
    `SUMMARY:${ics(`${c.processo.code} — ${c.titulo}`)}`,
    `DESCRIPTION:${ics(`${c.processo.objeto}. ${c.fundamento}.`)}`,
    "END:VEVENT",
  ].join("\r\n"));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${MARCA.agenda.produto}//${MARCA.campos.agenda}//PT-BR`, ...eventos, "END:VCALENDAR"].join("\r\n");
}
