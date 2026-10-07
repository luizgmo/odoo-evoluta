/**
 * NEUTRO: a base não traz texto de lei. Troque pelo conteúdo de apoio do SEU domínio
 * (normas, manuais, glossário) ou deixe como está: com `MARCA.leiAoLado = false` (padrão)
 * nada daqui aparece na tela. Com `leiAoLado = true` e ARTIGOS vazio, a gaveta e o grupo
 * "Na lei" da busca simplesmente não têm o que abrir.
 *
 * O conteúdo real da Lei nº 14.133/2021 (sistema de licitação) está em
 * exemplos/features/lei/artigos.ts: copie-o por cima deste arquivo só se o seu sistema for de licitação.
 *
 * Este arquivo é a ÚNICA fonte desse conteúdo: LeiAoLado, BuscaRapida e prazosLicitacao importam
 * daqui. Não apague o arquivo; esvazie as listas. Mantenha os nomes exportados.
 */
export interface HipotesePrazo {
  id: string;
  rotulo: string;
  diasUteis: number;
  fundamento: string;
}

/** Tabela de prazos que o simulador de `utils/prazosLicitacao.ts` usa. Vazia na base neutra. */
export const HIPOTESES_PRAZO: HipotesePrazo[] = [];

/** Endereço do texto oficial; "" = sem link (o botão "Ler o texto oficial" some da gaveta). */
export const LEI_LINK_OFICIAL = "";

/** Como a gaveta cita a norma; é o único lugar com o nome dela (LeiAoLado.tsx só lê daqui). */
export const LEI_NOME = "Norma de apoio"; // EXEMPLO DE DOMÍNIO — troque (ex.: "Regulamento interno")

/** Rota de uma tela que lista todos os artigos; "" se o sistema não tiver (o link some da gaveta). */
export const LEI_ROTA_DA_LISTA = "";

export interface ArtigoDaLei {
  numero: string;
  titulo: string;
  /** Parágrafos do resumo, em linguagem comum. */
  resumo: string[];
  /** Onde o sistema usa este artigo. */
  noSistema: string;
}

/** Itens da gaveta "Lei ao lado" e do grupo "Na lei" da busca. Vazio na base neutra. */
export const ARTIGOS: ArtigoDaLei[] = [];

const POR_NUMERO = new Map(ARTIGOS.map((a) => [a.numero, a]));

export const artigo = (numero: string): ArtigoDaLei | undefined => POR_NUMERO.get(numero);

/** "art. 164, parágrafo único" → "164"; o primeiro artigo citado que o sistema conhece. */
export function artigoDaCitacao(citacao: string): string | undefined {
  for (const m of citacao.matchAll(/art\.?\s*(\d+)/gi)) {
    if (POR_NUMERO.has(m[1])) return m[1];
  }
  return undefined;
}

/** Vizinhos na lista, para navegar ‹ anterior / seguinte ›. */
export function vizinhos(numero: string): { anterior?: ArtigoDaLei; seguinte?: ArtigoDaLei } {
  const i = ARTIGOS.findIndex((a) => a.numero === numero);
  if (i < 0) return {};
  return { anterior: ARTIGOS[i - 1], seguinte: ARTIGOS[i + 1] };
}

/** Link do artigo no texto oficial; "" se não houver endereço oficial. */
export const linkOficial = (numero: string) => (LEI_LINK_OFICIAL ? `${LEI_LINK_OFICIAL}#art${numero}` : "");
