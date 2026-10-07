/**
 * EXEMPLO DE DOMÍNIO (licitações): os marcos (edital, impugnação, sessão, recurso) são de
 * licitação; em outro sistema, monte os compromissos do seu domínio.
 *
 * Agenda de todos os processos: os prazos legais
 * contados em dias úteis a partir das datas gravadas em cada processo.
 * Só entram marcos que não dependem da hipótese do art. 55 (que a ficha ainda
 * não guarda): impugnação, resposta, sessão, recurso e contrarrazões.
 *
 * Em outro sistema: este arquivo continua sendo o dono dos tipos `Compromisso`,
 * `Janela`, `naJanela`, `diasAte` e `paraIcs` (usados por Agenda, Inicio e
 * calendarioDoMes). Reescreva só `montarAgenda` (e tire daqui o import de `ehContratacaoDireta`
 * e a lista TIPOS_DA_LICITACAO) para montar os compromissos do seu domínio; não apague o arquivo.
 * Os títulos e fundamentos dos seis marcos vêm de `MARCA.campos.eventos`.
 *
 * As CHAVES de `MARCA.campos.eventos` (publicacao, impugnacao, resposta, sessao, recurso,
 * contrarrazoes) são os `tipo` dos compromissos e podem ser renomeadas — desde que se
 * renomeiem juntos: a chave em marca.ts, o `tipo` e o `...ev.<chave>` de cada marco em
 * `montarAgenda`, a lista TIPOS_DA_LICITACAO e `MARCA.campos.tipoDoEvento` (o tipo que o
 * calendário destaca). A regra de data de cada marco (dias úteis antes/depois) mora aqui.
 */
import type { Process } from "@/types/process";
import {
  CALENDARIO_PADRAO,
  lerData,
  somarDiasUteis,
  subtrairDiasUteis,
  type OpcoesCalendario,
} from "@/utils/datas";
import { ehContratacaoDireta } from "@/components/mesa/fasesDaLicitacao";
import { ehSituacaoAtiva } from "@/constants/process-status";
import { MARCA } from "@/config/marca";

/**
 * Tipo do compromisso: texto livre do domínio ("vencimento", "reuniao"…). Os do exemplo
 * de licitação estão em TIPOS_DA_LICITACAO; em outro sistema, use os seus.
 */
export type TipoDeCompromisso = string;

export const TIPOS_DA_LICITACAO = ["publicacao", "impugnacao", "resposta", "sessao", "recurso", "contrarrazoes"] as const;

export interface Compromisso {
  id: string;
  tipo: TipoDeCompromisso;
  data: Date;
  hora: string | null;
  titulo: string;
  fundamento: string;
  /**
   * Prazo (rotulado por `MARCA.campos.prazo`): vence e tem consequência; `false` só marca o dia
   * (`MARCA.campos.evento`). O nome `legal` é herdado do exemplo de licitação e não aparece na tela:
   * em outro domínio quer dizer "crítico". Renomear exige trocar também Paineis, Agenda e calendarioDoMes.
   */
  legal: boolean;
  processo: { id: string | number; code: string; objeto: string };
}

export interface PendenciaDeData {
  processo: { id: string | number; code: string; objeto: string };
}

export function montarAgenda(processos: Process[], cal: OpcoesCalendario = CALENDARIO_PADRAO) {
  const compromissos: Compromisso[] = [];
  const semData: PendenciaDeData[] = [];

  for (const p of processos) {
    if (!ehSituacaoAtiva(p.status)) continue;
    // Contratação direta não tem sessão pública nem os prazos dos arts. 164 e 165
    if (ehContratacaoDireta(p.modality?.name)) continue;
    const processo = { id: p.id, code: p.code || MARCA.objeto.semNumero, objeto: p.object || MARCA.objeto.semDescricao };
    const sessao = lerData(p.opening_date);
    const publicacao = lerData(p.publication_date);
    if (!sessao) {
      semData.push({ processo });
      continue;
    }
    const hora = p.opening_time ? p.opening_time.slice(0, 5) : null;
    const recurso = somarDiasUteis(sessao, 3, cal);
    // Títulos e fundamentos vêm de MARCA.campos.eventos (exemplo de domínio: troque lá)
    const ev = MARCA.campos.eventos;
    const marcos: Omit<Compromisso, "id" | "processo">[] = [
      ...(publicacao ? [{ tipo: "publicacao" as const, data: publicacao, hora: null, ...ev.publicacao, legal: false }] : []),
      { tipo: "impugnacao", data: subtrairDiasUteis(sessao, 3, cal), hora: null, ...ev.impugnacao, legal: true },
      { tipo: "resposta", data: subtrairDiasUteis(sessao, 1, cal), hora: null, ...ev.resposta, legal: true },
      { tipo: "sessao", data: sessao, hora, ...ev.sessao, legal: false },
      { tipo: "recurso", data: recurso, hora: null, ...ev.recurso, legal: true },
      { tipo: "contrarrazoes", data: somarDiasUteis(recurso, 3, cal), hora: null, ...ev.contrarrazoes, legal: true },
    ];
    for (const m of marcos) compromissos.push({ ...m, id: `${p.id}-${m.tipo}`, processo });
  }

  compromissos.sort((a, b) => a.data.getTime() - b.data.getTime() || (a.hora ?? "").localeCompare(b.hora ?? ""));
  return { compromissos, semData };
}

export type Janela = "semana" | "trinta" | "tudo";

const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Do dia de hoje em diante, até o fim da janela. "semana" e "trinta" = hoje e os 7 (ou 30) dias seguintes, como na Minha Mesa. */
export function naJanela(compromissos: Compromisso[], janela: Janela, hoje: Date = new Date()): Compromisso[] {
  const inicio = inicioDoDia(hoje).getTime();
  const dias = janela === "semana" ? 8 : janela === "trinta" ? 31 : Number.POSITIVE_INFINITY;
  const fim = inicio + dias * 86_400_000;
  return compromissos.filter((c) => c.data.getTime() >= inicio && c.data.getTime() < fim);
}

/** Dias corridos até o compromisso (0 = hoje). */
export const diasAte = (data: Date, hoje: Date = new Date()) =>
  Math.round((inicioDoDia(data).getTime() - inicioDoDia(hoje).getTime()) / 86_400_000);

const ics = (texto: string) => texto.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
const dataIcs = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/** Arquivo .ics (calendário do e-mail): um evento de dia inteiro por compromisso; a sessão com hora, se houver. */
export function paraIcs(compromissos: Compromisso[], agora: Date = new Date()): string {
  const carimbo = `${dataIcs(agora)}T000000Z`;
  const eventos = compromissos.map((c) => {
    const inicio = c.hora
      ? `DTSTART:${dataIcs(c.data)}T${c.hora.replace(":", "")}00`
      : `DTSTART;VALUE=DATE:${dataIcs(c.data)}`;
    return [
      "BEGIN:VEVENT",
      `UID:${c.id}@${MARCA.agenda.dominio}`,
      `DTSTAMP:${carimbo}`,
      inicio,
      `SUMMARY:${ics(`${c.processo.code} — ${c.titulo}`)}`,
      `DESCRIPTION:${ics(`${c.processo.objeto}. Fundamento: ${c.fundamento}. Calculado por ${MARCA.agenda.produto}; confira a data antes de usar.`)}`,
      "END:VEVENT",
    ].join("\r\n");
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${MARCA.agenda.produto}//${MARCA.campos.agenda}//PT-BR`, ...eventos, "END:VCALENDAR"].join("\r\n");
}
