/**
 * Calendário de mesa e bloco de notas da agenda: o mês em semanas (domingo a
 * sábado), com feriado, fim de semana, hoje e os dias de prazo; e os
 * compromissos agrupados por semana ("Esta semana", "Semana que vem"…).
 */
import { CALENDARIO_PADRAO, motivoSemExpediente, paraISO, type OpcoesCalendario } from "@/utils/datas";
import { diasAte, type Compromisso } from "./montarAgenda";

export interface DiaDoMes {
  data: Date;
  dia: number;
  hoje: boolean;
  fimDeSemana: boolean;
  /** Nome do feriado ou do dia sem expediente; fim de semana não entra aqui. */
  feriado: string | null;
  prazo: boolean;
  destaque: boolean;
  compromissos: Compromisso[];
}

/** Semanas completas do mês; fora do mês, a célula é `null`. */
export function montarMes(
  ano: number,
  mes: number,
  compromissos: Compromisso[],
  hoje: Date = new Date(),
  cal: OpcoesCalendario = CALENDARIO_PADRAO,
  /** Tipo de compromisso que recebe o destaque visual. */
  tipoEmDestaque: string = "prazo_final",
): (DiaDoMes | null)[][] {
  const doDia = new Map<string, Compromisso[]>();
  for (const c of compromissos) {
    const chave = paraISO(c.data);
    doDia.set(chave, [...(doDia.get(chave) ?? []), c]);
  }
  const hojeISO = paraISO(hoje);
  const total = new Date(ano, mes + 1, 0).getDate();
  const celulas: (DiaDoMes | null)[] = Array(new Date(ano, mes, 1).getDay()).fill(null);
  for (let dia = 1; dia <= total; dia++) {
    const data = new Date(ano, mes, dia);
    const iso = paraISO(data);
    const motivo = motivoSemExpediente(data, cal);
    const fimDeSemana = motivo === "Sábado" || motivo === "Domingo";
    const dele = doDia.get(iso) ?? [];
    celulas.push({
      data,
      dia,
      hoje: iso === hojeISO,
      fimDeSemana,
      feriado: fimDeSemana ? null : motivo,
      prazo: dele.some((c) => c.critico),
      destaque: dele.some((c) => c.tipo === tipoEmDestaque),
      compromissos: dele,
    });
  }
  while (celulas.length % 7 !== 0) celulas.push(null);
  const semanas: (DiaDoMes | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
}

const domingoDaSemana = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());

/** "Esta semana", "Semana que vem" ou "Semana de 19 de outubro". */
export function rotuloDaSemana(data: Date, hoje: Date = new Date()): string {
  const inicio = domingoDaSemana(data);
  const diferenca = Math.round(diasAte(inicio, domingoDaSemana(hoje)) / 7);
  if (diferenca === 0) return "Esta semana";
  if (diferenca === 1) return "Semana que vem";
  return `Semana de ${inicio.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}`;
}

/** Compromissos (já em ordem de data) agrupados por semana, mantendo a ordem. */
export function agruparPorSemana(compromissos: Compromisso[], hoje: Date = new Date()) {
  const semanas: { chave: string; rotulo: string; itens: Compromisso[] }[] = [];
  for (const c of compromissos) {
    const chave = paraISO(domingoDaSemana(c.data));
    const ultima = semanas[semanas.length - 1];
    if (ultima && ultima.chave === chave) ultima.itens.push(c);
    else semanas.push({ chave, rotulo: rotuloDaSemana(c.data, hoje), itens: [c] });
  }
  return semanas;
}
