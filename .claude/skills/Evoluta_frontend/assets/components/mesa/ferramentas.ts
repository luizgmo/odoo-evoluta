/**
 * A pasta do objeto principal tem duas ordens de abas:
 * - DIVISÓRIAS, no alto: as partes da própria pasta;
 * - FERRAMENTAS, na borda direita: o que ajuda a conduzir o objeto,
 *   na ordem em que ele anda.
 * Uma lista só para a capa, as telas das ferramentas e a busca.
 * EXEMPLO DE DOMÍNIO: os rótulos abaixo (Autos, Prazos, Diário, Repetir contratação)
 * são de licitação; troque pelos do seu sistema, mantendo a estrutura.
 */
import { MARCA } from "@/config/marca";

export interface AbaDaPasta {
  /** Trecho depois de `${MARCA.rotaDaLista}/:id` ("" é a própria pasta). */
  caminho: string;
  curto: string;
  rotulo: string;
}

export const DIVISORIAS_DO_PROCESSO: AbaDaPasta[] = [
  { caminho: "", curto: "Linha do tempo", rotulo: "Linha do tempo" },
  { caminho: "documentos", curto: "Documentos", rotulo: "Documentos do processo" },
  { caminho: "autos", curto: "Autos", rotulo: "Autos para imprimir" },
  { caminho: "prazos", curto: "Prazos", rotulo: "Simular prazos" },
  { caminho: "historico", curto: "Histórico", rotulo: "Histórico do processo" },
  { caminho: "edit", curto: "Ficha", rotulo: "Ficha do processo" },
];

export const FERRAMENTAS_DO_PROCESSO: AbaDaPasta[] = [
  { caminho: "diario", curto: "Diário", rotulo: "Prévia no Diário" },
  { caminho: "repetir", curto: "Repetir", rotulo: "Repetir contratação" },
];


export const caminhoDaAba = (processoId: string | number, aba: AbaDaPasta) =>
  aba.caminho ? `${MARCA.rotaDaLista}/${processoId}/${aba.caminho}` : `${MARCA.rotaDaLista}/${processoId}`;
