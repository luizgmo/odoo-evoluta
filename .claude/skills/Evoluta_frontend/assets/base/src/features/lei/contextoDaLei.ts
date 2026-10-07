import { createContext, useContext } from "react";

export interface LeiAoLadoApi {
  /** Abre a gaveta no artigo; "noSeuCaso" é a conta já feita para o processo. */
  abrir: (numero: string, noSeuCaso?: string) => void;
}

export const ContextoLeiAoLado = createContext<LeiAoLadoApi | null>(null);

/** Null fora do layout (testes, telas sem gaveta): a citação vira texto comum. */
export const useLeiAoLado = () => useContext(ContextoLeiAoLado);
