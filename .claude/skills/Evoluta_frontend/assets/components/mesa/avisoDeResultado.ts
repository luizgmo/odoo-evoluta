/**
 * Aviso de resultado depois de um ato: aparece no alto da folha,
 * fica até a pessoa fechar e, quando o ato se desfaz, traz "Desfazer".
 */
import { createContext, useContext } from "react";

export interface AvisoDeResultado {
  texto: string;
  /** Ato que se desfaz: mostra o botão. Publicar não traz. */
  desfazer?: () => Promise<void> | void;
}

export interface Avisos {
  avisar: (aviso: AvisoDeResultado) => void;
  /** Tira o aviso da tela (o ato foi desfeito por outro caminho, por exemplo). */
  fechar: () => void;
}

export const ContextoDeAvisos = createContext<Avisos>({ avisar: () => undefined, fechar: () => undefined });

export const useAvisoDeResultado = () => useContext(ContextoDeAvisos);
