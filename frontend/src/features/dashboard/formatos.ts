/** Formatos de número e de tempo usados na Minha Mesa (um lugar só). */

const paraNumero = (bruto: string | number | null | undefined) => {
  if (bruto === null || bruto === undefined) return null;
  const n = typeof bruto === "number" ? bruto : Number.parseFloat(bruto || "0");
  return Number.isFinite(n) ? n : null;
};

/** R$ 48.500 — sem centavos. */
export const formatBRL = (bruto: string | number | null | undefined) => {
  const n = paraNumero(bruto);
  if (n === null) return "—";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/** R$ 48.499,90 — valor exato, com centavos. */
export const formatBRLComCentavos = (bruto: string | number | null | undefined) => {
  const n = paraNumero(bruto);
  if (n === null) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/** R$ 1,2 mi — para caber num número grande. */
export const formatBRLCompacto = (bruto: string | number | null | undefined) => {
  const n = paraNumero(bruto);
  if (n === null) return "—";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  });
};

/** "agora", "há 5 min", "há 3 h", "há 2 dias". */
export const tempoRelativo = (iso: string, agora: Date = new Date()) => {
  const diff = Math.max(0, agora.getTime() - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
};

/** "hoje", "amanhã", "em 5 dias", "sem data". */
export const quandoAbre = (dias: number | null) => {
  if (dias === null) return "sem data";
  if (dias === 0) return "hoje";
  if (dias === 1) return "amanhã";
  return `em ${dias} dias`;
};

/** 09/10/2026 (e "às 09:00" quando a data traz hora). */
export const dataDeAbertura = (iso: string | null) => {
  if (!iso) return "sem data";
  // Só a data ("2026-10-09"): montar à mão. new Date() leria como meia-noite
  // UTC, que em Brasília ainda é o dia anterior.
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (soData) return `${soData[3]}/${soData[2]}/${soData[1]}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "sem data";
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

/** "sexta-feira, 9 de outubro de 2026" — data por extenso, com ano (cabeçalho da agenda). */
export const dataPorExtenso = (data: Date = new Date()) =>
  data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** "Sexta-feira, 9 de outubro" — sem ano e com inicial maiúscula (cabeçalho da Minha Mesa; o ponto final é de quem usa). */
export const diaPorExtenso = (data: Date = new Date()) => {
  const t = data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/** "Bom dia" das 5h ao meio-dia, "Boa tarde" até as 18h, "Boa noite" no resto. */
export const saudacao = (hora: number) => {
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
};
