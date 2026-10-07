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
  { caminho: "", curto: "Capa", rotulo: "Capa do projeto" },
  { caminho: "kanban", curto: "Kanban", rotulo: "Kanban do projeto" },
  { caminho: "porques", curto: "5 Porquês", rotulo: "5 Porquês" },
  { caminho: "w2h", curto: "5W2H", rotulo: "5W2H" },
  { caminho: "ishikawa", curto: "Ishikawa", rotulo: "Ishikawa" },
  { caminho: "matriz", curto: "Matriz", rotulo: "Matriz de Decisão" },
  { caminho: "raci", curto: "RACI", rotulo: "RACI" },
  { caminho: "riscos", curto: "Riscos", rotulo: "Riscos" },
  { caminho: "estrategia", curto: "Estratégia", rotulo: "Estratégia" },
  { caminho: "stakeholders", curto: "Stakeholders", rotulo: "Stakeholders" },
];

export const FERRAMENTAS_DO_PROCESSO: AbaDaPasta[] = [];


export const caminhoDaAba = (processoId: string | number, aba: AbaDaPasta) =>
  aba.caminho ? `${MARCA.rotaDaLista}/${processoId}/${aba.caminho}` : `${MARCA.rotaDaLista}/${processoId}`;
