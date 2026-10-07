// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual (copie para src/theme/tokens.ts; o StatusDonut e gráficos recharts dependem dele)
/**
 * Cores Evoluta resolvidas por tema, para uso em JS/SVG (recharts, `style={{}}`
 * inline) — contextos onde classes Tailwind e `var()` CSS não se aplicam.
 *
 * Em JSX comum, PREFIRA as utilities Tailwind que já flipam por tema
 * (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
 * `border-border`, `bg-primary`, `text-accent`, escalas `navy/platinum/steel`).
 * Use este helper só onde a cor precisa ser uma string JS.
 */
import { useTheme } from "@/hooks/useTheme";

export interface ThemeTokens {
  bg: string;
  bgCard: string;
  bgSidebar: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  /** Texto e ícone em destaque sobre o fundo da tela (primary é fundo de botão: no escuro, texto nele some) */
  textoDestaque: string;
  accent: string;
  gold: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  /** Paleta categórica de séries — Okabe–Ito (daltônico-safe), boa em light e dark. */
  chart: string[];
}

// Okabe–Ito: segura para deuteranopia/protanopia/tritanopia.
const CHART_CATEGORICAL = [
  "#0072B2", // azul
  "#E69F00", // laranja
  "#009E73", // verde-azulado
  "#D55E00", // vermelho-alaranjado
  "#56B4E9", // azul-céu
  "#CC79A7", // rosa
  "#F0E442", // amarelo
];

const light: ThemeTokens = {
  bg: "#F8F5EE", // marfim de papel
  bgCard: "#FFFFFF", // branco
  bgSidebar: "#FFFFFF",
  text: "#192038", // noite
  textSecondary: "#5A6480", // cinzaMedio
  textMuted: "#5A6480", // cinzaMedio (nunca cinzaSuave em fundo claro)
  border: "#D9D2C3", // fio de papel
  primary: "#243C6B", // institucional
  textoDestaque: "#243C6B", // institucional sobre papel
  accent: "#4475A7", // acento (= --accent claro; texto branco 4,8:1)
  gold: "#B8924A", // ouro (fill/ícone)
  success: "#1A5C38",
  warning: "#7A4A10",
  error: "#6E1C1C",
  info: "#1A3870",
  chart: CHART_CATEGORICAL,
};

const dark: ThemeTokens = {
  bg: "#141A2A", // navy-800
  bgCard: "#1B2236", // navy-600
  bgSidebar: "#171D2F", // navy-700
  text: "#f5f5f0",
  textSecondary: "#A5AEC4",
  textMuted: "#A5AEC4",
  border: "#2B3350", // navy-500
  primary: "#3D72A9", // = --primary escuro (branco-sobre ~5:1)
  textoDestaque: "#6A9DD0", // = --accent escuro do CSS (≥4,5:1 sobre navy)
  accent: "#6A9DD0", // = --accent escuro
  gold: "#B8924A", // ouro (fill/ícone), igual ao claro: é o --gold do index.css nos dois temas
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  chart: CHART_CATEGORICAL,
};

export const themeTokens = { light, dark };

export function useThemeTokens(): ThemeTokens {
  const { theme } = useTheme();
  return theme === "dark" ? dark : light;
}
