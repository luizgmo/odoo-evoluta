/**
 * Preferências de leitura e de uso. Ficam neste
 * computador (localStorage) e viram classes no <html>, que o CSS usa.
 */
import { MARCA, chaveDoSistema } from "@/config/marca";
import { ARTIGOS } from "@/features/lei/artigos";

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

const CHAVE = chaveDoSistema("preferencias");

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

const maiuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

const ATALHO_DA_ACAO = {
  tecla: `Alt ${MARCA.acaoPrincipal.atalho.toUpperCase()}`,
  rotulo: MARCA.acaoPrincipal.rotulo,
  para: MARCA.acaoPrincipal.caminho,
};

const ATALHO_DA_LISTA = `Alt ${MARCA.atalhoDaLista.toUpperCase()}`;

// M, A e a letra da lista (MARCA.atalhoDaLista) são fixos (início, agenda, lista): se a ação
// principal usar uma delas, ela vence em destinoDoAtalho e o atalho fixo deixa de responder.
// Troque a letra em MARCA.acaoPrincipal.atalho (ou MARCA.atalhoDaLista).
if (import.meta.env.DEV && ["ALT M", ATALHO_DA_LISTA.toUpperCase(), "ALT A"].includes(ATALHO_DA_ACAO.tecla.toUpperCase())) {
  console.warn(`[atalhos] ${ATALHO_DA_ACAO.tecla} colide com um atalho fixo; escolha outra letra em MARCA.acaoPrincipal.atalho.`);
}

/** Atalhos Alt+letra: M = início, MARCA.atalhoDaLista = lista, A = agenda e a letra da ação principal (MARCA). */
export const ATALHOS: { tecla: string; rotulo: string; para?: string }[] = [
  { tecla: "Ctrl K", rotulo: `Buscar ${MARCA.objeto.singular} ou tela` },
  { tecla: "Alt M", rotulo: MARCA.inicio, para: MARCA.rotaInicial },
  { tecla: ATALHO_DA_LISTA, rotulo: maiuscula(MARCA.objeto.plural), para: MARCA.rotaDaLista },
  { tecla: "Alt A", rotulo: MARCA.campos.agenda, para: "/agenda" },
  ATALHO_DA_ACAO,
  // "lei ao lado" só existe com a gaveta ligada E com artigos para abrir
  { tecla: "Esc", rotulo: MARCA.leiAoLado && ARTIGOS.length > 0 ? "Fechar janela, busca ou lei ao lado" : "Fechar janela ou busca" },
];

/** Para onde vai um Alt+letra (ou nada). */
export function destinoDoAtalho(
  e: Pick<KeyboardEvent, "altKey" | "ctrlKey" | "metaKey" | "key"> & { code?: string },
): string | null {
  if (!e.altKey || e.ctrlKey || e.metaKey) return null;
  // No Mac, Option+M produz "µ" (e Option+N, uma tecla morta): quando o caractere
  // não é a própria letra, vale a tecla física
  const letra = /^[a-z]$/i.test(e.key) ? e.key : (/^Key([A-Z])$/.exec(e.code ?? "")?.[1] ?? "");
  // A ação principal é testada primeiro: numa colisão com M, P ou A, é ela que responde
  const achado = [ATALHO_DA_ACAO, ...ATALHOS].find((a) => a.para && a.tecla === `Alt ${letra.toUpperCase()}`);
  return achado?.para ?? null;
}
