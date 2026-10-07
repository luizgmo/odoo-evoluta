// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Preferências de leitura e de uso (proposta 7, tela 27). Ficam neste
 * computador (localStorage) e viram classes no <html>, que o CSS usa.
 */
export interface Preferencias {
  /** 0 = padrão; -1 menor; 1, 2 maiores. */
  tamanho: -1 | 0 | 1 | 2;
  altoContraste: boolean;
  sublinharLinks: boolean;
  maisEntrelinha: boolean;
  semMovimento: boolean;
  menuRecolhido: boolean;
  somAoCarimbar: boolean;
}

export const PADRAO: Preferencias = {
  tamanho: 0,
  altoContraste: false,
  sublinharLinks: false,
  maisEntrelinha: false,
  semMovimento: false,
  menuRecolhido: false,
  somAoCarimbar: false,
};

const CHAVE = "licitars.preferencias";

export function lerPreferencias(): Preferencias {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    return salvo && typeof salvo === "object" ? { ...PADRAO, ...salvo } : { ...PADRAO };
  } catch {
    return { ...PADRAO };
  }
}

export function gravarPreferencias(p: Preferencias): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p));
  } catch {
    // sem armazenamento: vale só nesta visita
  }
}

const CLASSES_DE_TAMANHO = ["pref-texto-menor", "", "pref-texto-maior", "pref-texto-grande"];

/** Aplica as preferências no elemento raiz (o <html>). */
export function aplicarPreferencias(p: Preferencias, raiz: HTMLElement = document.documentElement): void {
  for (const c of CLASSES_DE_TAMANHO) if (c) raiz.classList.remove(c);
  const classe = CLASSES_DE_TAMANHO[p.tamanho + 1];
  if (classe) raiz.classList.add(classe);
  raiz.classList.toggle("pref-alto-contraste", p.altoContraste);
  raiz.classList.toggle("pref-links", p.sublinharLinks);
  raiz.classList.toggle("pref-entrelinha", p.maisEntrelinha);
  raiz.classList.toggle("pref-sem-movimento", p.semMovimento);
}

/** Atalhos Alt+letra da proposta 7. */
export const ATALHOS: { tecla: string; rotulo: string; para?: string }[] = [
  { tecla: "Ctrl K", rotulo: "Buscar processo ou tela" },
  { tecla: "Alt M", rotulo: "Minha Mesa", para: "/dashboard" },
  { tecla: "Alt P", rotulo: "Processos", para: "/processes" },
  { tecla: "Alt A", rotulo: "Prazos e agenda", para: "/agenda" },
  { tecla: "Alt N", rotulo: "Nova contratação", para: "/processes/new" },
  { tecla: "Esc", rotulo: "Fechar janela, busca ou lei ao lado" },
];

/** Para onde vai um Alt+letra (ou nada). */
export function destinoDoAtalho(
  e: Pick<KeyboardEvent, "altKey" | "ctrlKey" | "metaKey" | "key"> & { code?: string },
): string | null {
  if (!e.altKey || e.ctrlKey || e.metaKey) return null;
  // No Mac, Option+M produz "µ" (e Option+N, uma tecla morta): quando o caractere
  // não é a própria letra, vale a tecla física
  const letra = /^[a-z]$/i.test(e.key) ? e.key : (/^Key([A-Z])$/.exec(e.code ?? "")?.[1] ?? "");
  const achado = ATALHOS.find((a) => a.para && a.tecla === `Alt ${letra.toUpperCase()}`);
  return achado?.para ?? null;
}
