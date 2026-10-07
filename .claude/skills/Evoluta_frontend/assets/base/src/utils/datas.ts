/**
 * Datas e calendário de dias úteis — peça genérica, usada por qualquer sistema.
 *
 * Contagem: exclui o dia do começo e inclui o do vencimento; só contam dias com
 * expediente. Feriados nacionais vêm daqui; feriados do órgão entram em `datasExtras`.
 * Nada aqui é gravado no servidor.
 */

export interface OpcoesCalendario {
  /** Carnaval e Corpus Christi são ponto facultativo; muitos órgãos não abrem. */
  facultativosSemExpediente: boolean;
  /** Datas extras sem expediente (feriados municipais, recessos), em AAAA-MM-DD. */
  datasExtras: string[];
}

export const CALENDARIO_PADRAO: OpcoesCalendario = {
  facultativosSemExpediente: true,
  datasExtras: [],
};

/** Lê "AAAA-MM-DD" (ou com hora) como data local, sem o deslocamento de fuso do `new Date(str)`. */
export function lerData(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  if (!m) return null;
  const ano = Number(m[1]);
  // Fora desta faixa é digitação pela metade (o campo de data emite 0002, 0020, 0202…).
  if (ano < 1900 || ano > 2200) return null;
  const data = new Date(ano, Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(data.getTime()) ? null : data;
}

export function paraISO(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function formatarData(data: Date | null): string {
  if (!data) return "—";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatarDataExtenso(data: Date | null): string {
  if (!data) return "—";
  return data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

export function somarDias(data: Date, dias: number): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias);
}

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
export function domingoDePascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

const feriadosEmCache = new Map<string, Map<string, string>>();

/** Feriados nacionais (e, se pedido, os pontos facultativos) do ano, por data ISO. */
export function feriadosDoAno(ano: number, incluirFacultativos: boolean): Map<string, string> {
  const chave = `${ano}-${incluirFacultativos}`;
  const guardado = feriadosEmCache.get(chave);
  if (guardado) return guardado;
  const feriados = new Map<string, string>([
    [`${ano}-01-01`, "Confraternização Universal"],
    [`${ano}-04-21`, "Tiradentes"],
    [`${ano}-05-01`, "Dia do Trabalho"],
    [`${ano}-09-07`, "Independência do Brasil"],
    [`${ano}-10-12`, "Nossa Senhora Aparecida"],
    [`${ano}-11-02`, "Finados"],
    [`${ano}-11-15`, "Proclamação da República"],
    [`${ano}-12-25`, "Natal"],
  ]);
  if (ano >= 2024) feriados.set(`${ano}-11-20`, "Consciência Negra");

  const pascoa = domingoDePascoa(ano);
  feriados.set(paraISO(somarDias(pascoa, -2)), "Sexta-feira Santa");
  if (incluirFacultativos) {
    feriados.set(paraISO(somarDias(pascoa, -48)), "Carnaval (ponto facultativo)");
    feriados.set(paraISO(somarDias(pascoa, -47)), "Carnaval (ponto facultativo)");
    feriados.set(paraISO(somarDias(pascoa, 60)), "Corpus Christi (ponto facultativo)");
  }
  feriadosEmCache.set(chave, feriados);
  return feriados;
}

/** Motivo de a data não ter expediente, ou null se for dia útil. */
export function motivoSemExpediente(data: Date, cal: OpcoesCalendario): string | null {
  const diaSemana = data.getDay();
  if (diaSemana === 0) return "Domingo";
  if (diaSemana === 6) return "Sábado";
  const iso = paraISO(data);
  if (cal.datasExtras.includes(iso)) return "Sem expediente";
  return feriadosDoAno(data.getFullYear(), cal.facultativosSemExpediente).get(iso) ?? null;
}

export function ehDiaUtil(data: Date, cal: OpcoesCalendario): boolean {
  return motivoSemExpediente(data, cal) === null;
}

/** N-ésimo dia útil depois de `inicio` (o dia do começo não conta). */
export function somarDiasUteis(inicio: Date, n: number, cal: OpcoesCalendario): Date {
  let atual = inicio;
  let contados = 0;
  while (contados < n) {
    atual = somarDias(atual, 1);
    if (ehDiaUtil(atual, cal)) contados++;
  }
  return atual;
}

/** N-ésimo dia útil antes de `data` (a própria data não conta). */
export function subtrairDiasUteis(data: Date, n: number, cal: OpcoesCalendario): Date {
  let atual = data;
  let contados = 0;
  while (contados < n) {
    atual = somarDias(atual, -1);
    if (ehDiaUtil(atual, cal)) contados++;
  }
  return atual;
}
