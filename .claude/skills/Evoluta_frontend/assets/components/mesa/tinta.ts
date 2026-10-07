/**
 * Regras dos carimbos que não são desenho: a inclinação de cada um e a
 * lembrança de quais já "bateram" nesta visita.
 */
import { chaveDoSistema } from "@/config/marca";

/**
 * Inclinação própria de cada carimbo, tirada do texto: o mesmo carimbo sai
 * sempre igual, e carimbos diferentes não ficam todos com a mesma inclinação.
 * Entre -4° e +3°, nunca reto.
 */
export function giroDoTexto(texto: string): number {
  let h = 7;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) | 0;
  const opcoes = [-4, -3, -2.5, -2, -1.5, 1.5, 2, 3];
  return opcoes[Math.abs(h) % opcoes.length];
}

const CHAVE = chaveDoSistema("carimbos-batidos");

const lerBatidos = (): string[] => {
  try {
    const salvo = JSON.parse(sessionStorage.getItem(CHAVE) ?? "[]");
    return Array.isArray(salvo) ? salvo : [];
  } catch {
    return [];
  }
};

/** O carimbo com esta chave ainda não bateu nesta visita? */
export function aindaNaoBateu(chave: string): boolean {
  try {
    return !lerBatidos().includes(chave);
  } catch {
    return false;
  }
}

export function marcarComoBatido(chave: string): void {
  try {
    const batidos = lerBatidos();
    if (batidos.includes(chave)) return;
    // guarda só os últimos 200: a visita é longa, mas a lista não precisa crescer sem fim
    sessionStorage.setItem(CHAVE, JSON.stringify([...batidos, chave].slice(-200)));
  } catch {
    // sem armazenamento: o carimbo pode bater de novo, sem prejuízo
  }
}

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

/** "28 SET 2026", como nos carimbos datadores. Data só com dia é lida sem fuso. */
export function dataDeCarimbo(data: Date | string): string {
  if (typeof data === "string") {
    const soData = /^(\d{4})-(\d{2})-(\d{2})/.exec(data);
    if (soData && !data.includes("T")) return `${soData[3]} ${MESES[Number(soData[2]) - 1]} ${soData[1]}`;
    data = new Date(data);
  }
  if (Number.isNaN(data.getTime())) return "";
  return `${String(data.getDate()).padStart(2, "0")} ${MESES[data.getMonth()]} ${data.getFullYear()}`;
}
