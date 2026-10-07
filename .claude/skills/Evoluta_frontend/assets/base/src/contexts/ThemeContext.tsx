import React, { createContext, useState, useEffect } from "react";
import { chaveDoSistema } from "@/config/marca";

// Mesma chave do script anti-flash de index.html (que não consegue importar a marca)
const CHAVE_DO_TEMA = chaveDoSistema("tema");

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Preferência persistida vence (o armazenamento pode estar bloqueado: aí vale o padrão)
    try {
      const storedTheme = localStorage.getItem(CHAVE_DO_TEMA);
      if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
      }
    } catch {
      /* sem armazenamento */
    }
    // 1ª visita: honrar preferência do SO; padrão CLARO (Evoluta)
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    // Guarda a escolha; sem armazenamento, o tema vale só nesta visita
    try {
      localStorage.setItem(CHAVE_DO_TEMA, theme);
    } catch {
      /* segue sem guardar */
    }
    // Update document class for Tailwind dark mode
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
