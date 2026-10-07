import { useCallback, useState } from "react";
import { chaveDoSistema } from "@/config/marca";
import { lerPreferencias } from "@/features/preferencias/preferencias";

const CHAVE = chaveDoSistema("menu-lateral");

const ler = (): boolean => {
  try {
    const escolhido = localStorage.getItem(CHAVE);
    if (escolhido) return escolhido !== "fechado";
    // Sem escolha na barra ainda: vale a preferência "começar com o menu recolhido"
    return !lerPreferencias().menuRecolhido;
  } catch {
    return true; // navegador bloqueando armazenamento: começa aberto
  }
};

/**
 * Esquece a escolha feita pelo botão do menu, para a preferência "Começar com o
 * menu recolhido" (Acessibilidade) voltar a valer na próxima abertura.
 */
export function esquecerEscolhaDoMenu() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // sem armazenamento: não há escolha guardada para esquecer
  }
}

/** Menu lateral aberto ou recolhido; a escolha fica guardada neste navegador. */
export function useMenuLateral() {
  const [aberto, setAberto] = useState(ler);
  const alternar = useCallback(() => {
    setAberto((atual) => {
      const novo = !atual;
      try {
        localStorage.setItem(CHAVE, novo ? "aberto" : "fechado");
      } catch {
        // sem armazenamento: vale só nesta visita
      }
      return novo;
    });
  }, []);
  return { aberto, alternar };
}
