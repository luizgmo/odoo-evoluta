/**
 * Situações do processo (exemplo de domínio): valores em maiúsculas como o backend
 * manda, rótulos em português e classes de cor só por token (--tinta-*). Em outro
 * sistema, troque os valores e rótulos por os da sua entidade. Os rótulos que mudam
 * de gênero ("Aberto"/"Aberta") concordam com MARCA.objeto.genero por GEN.fim.
 *
 * ESTA TABELA É A ÚNICA FONTE das situações: rótulo, cor do selo (`color`), tinta do carimbo
 * (`tinta`), se encerra o item (`encerrada`) e se o encerra concluindo o fluxo (`concluida`).
 * Mesa (carimbo), lista, agenda, fases e ferramentas leem daqui: situação nova = uma linha nova
 * em `SITUACOES` (os `apelidos` da linha cobrem outros nomes que o servidor mande; `padrao: true`
 * marca a situação usada para valor vazio/desconhecido). Renomear ou trocar linhas não exige
 * editar mais nada neste arquivo.
 */
import { GEN } from "@/config/marca";
import type { Tinta } from "@/components/mesa/Mesa";

interface DefinicaoDaSituacao {
  label: string;
  /** Classes do selo (badge), só por token. */
  color: string;
  /** Tinta do carimbo da situação (components/mesa/Mesa.tsx). */
  tinta: Tinta;
  /** Item encerrado: sai de "ativos" e da agenda, vai para o arquivo. */
  encerrada: boolean;
  /** Só para encerradas: terminou o fluxo (todas as fases feitas). Encerrada sem isto = interrompida (arquivada, cancelada). */
  concluida?: boolean;
  /** A situação usada quando o valor vem vazio ou desconhecido (exatamente UMA na tabela; sem nenhuma, vale a primeira). */
  padrao?: boolean;
  /** Outros nomes (em maiúsculas) que o servidor ou sistemas antigos usam para esta situação. */
  apelidos?: string[];
}

const definir = <K extends string>(tabela: Record<K, DefinicaoDaSituacao>) => tabela;

const SITUACOES = definir({
  ABERTO: {
    label: `Abert${GEN.fim}`,
    color: "bg-[hsl(var(--tinta-verde)/0.12)] text-[hsl(var(--tinta-verde))] border-[hsl(var(--tinta-verde))]",
    tinta: "verde",
    encerrada: false,
    padrao: true,
    apelidos: ["ACTIVE", "DRAFT", "OPEN"],
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    color: "bg-[hsl(var(--tinta-azul)/0.12)] text-[hsl(var(--tinta-azul))] border-[hsl(var(--tinta-azul))]",
    tinta: "azul",
    encerrada: false,
    apelidos: ["IN_PROGRESS", "EMANDAMENTO"],
  },
  CONCLUIDO: {
    label: `Concluíd${GEN.fim}`,
    color: "bg-[hsl(var(--tinta-violeta)/0.12)] text-[hsl(var(--tinta-violeta))] border-[hsl(var(--tinta-violeta))]",
    tinta: "violeta",
    encerrada: true,
    concluida: true,
    apelidos: ["COMPLETED"],
  },
  ARQUIVADO: {
    label: `Arquivad${GEN.fim}`,
    color: "bg-muted text-muted-foreground border-border",
    tinta: "grafite",
    encerrada: true,
    apelidos: ["ARCHIVED", "SUSPENDED", "CANCELLED", "CANCELED"],
  },
});

export type ProcessStatus = keyof typeof SITUACOES;

/** Os valores válidos, como constantes: `PROCESS_STATUS.ABERTO === "ABERTO"` (as telas da base NÃO usam estas constantes; só os exemplos). */
export const PROCESS_STATUS = Object.fromEntries(Object.keys(SITUACOES).map((k) => [k, k])) as { [K in ProcessStatus]: K };

export interface ProcessStatusConfig {
  value: ProcessStatus;
  label: string;
  color: string;
  tinta: Tinta;
  encerrada: boolean;
  concluida: boolean;
}

export const PROCESS_STATUS_CONFIG = Object.fromEntries(
  Object.entries<DefinicaoDaSituacao>(SITUACOES).map(([valor, d]) => [valor, { ...d, value: valor, concluida: d.concluida === true }]),
) as Record<ProcessStatus, ProcessStatusConfig>;

/** A situação exata (maiúsculas), sem apelidos nem padrão: undefined se o valor não existe na tabela. */
const situacaoExata = (status?: string | null): ProcessStatusConfig | undefined =>
  PROCESS_STATUS_CONFIG[(status ?? "").toUpperCase() as ProcessStatus];

/** Situações em curso e encerradas, na ordem da tabela (para filtros e contagens). */
export const SITUACOES_ATIVAS = (Object.keys(PROCESS_STATUS_CONFIG) as ProcessStatus[]).filter((s) => !PROCESS_STATUS_CONFIG[s].encerrada);
export const SITUACOES_ENCERRADAS = (Object.keys(PROCESS_STATUS_CONFIG) as ProcessStatus[]).filter((s) => PROCESS_STATUS_CONFIG[s].encerrada);

/** Em curso (valor desconhecido não é ativo nem encerrado, como antes). */
export const ehSituacaoAtiva = (status?: string | null) => situacaoExata(status)?.encerrada === false;
export const ehSituacaoEncerrada = (status?: string | null) => situacaoExata(status)?.encerrada === true;
/** Encerrada concluindo o fluxo (as fases ficam todas "feitas"). */
export const ehSituacaoConcluida = (status?: string | null) => situacaoExata(status)?.concluida === true;

/**
 * Get status configuration from status value
 * Handles both backend format (ABERTO) and legacy formats (active, aberto, etc.)
 */
const CHAVES = Object.keys(SITUACOES) as ProcessStatus[];

/** A situação `padrao` da tabela (ou a primeira): vale para valor vazio ou desconhecido. */
const SITUACAO_PADRAO: ProcessStatus = CHAVES.find((k) => (SITUACOES[k] as DefinicaoDaSituacao).padrao) ?? CHAVES[0];

/** Apelido (maiúsculas) → situação, montado dos `apelidos` da própria tabela. */
const APELIDOS: Record<string, ProcessStatus> = Object.fromEntries(
  CHAVES.flatMap((k) => ((SITUACOES[k] as DefinicaoDaSituacao).apelidos ?? []).map((a) => [a, k] as const)),
);

export const getProcessStatusConfig = (status: string): ProcessStatusConfig => {
  const statusUpper = (status ?? "").toUpperCase();
  if (statusUpper in PROCESS_STATUS_CONFIG) return PROCESS_STATUS_CONFIG[statusUpper as ProcessStatus];
  const mapped = APELIDOS[statusUpper];
  return PROCESS_STATUS_CONFIG[mapped ?? SITUACAO_PADRAO];
};

/**
 * Get status label for display
 */
export const getProcessStatusLabel = (status: string): string => {
  return getProcessStatusConfig(status).label;
};

/**
 * Get status color class for badges/tags
 */
export const getProcessStatusColor = (status: string): string => {
  return getProcessStatusConfig(status).color;
};

/** Tinta do carimbo da situação (CarimboSituacao usa isto). */
export const tintaDaSituacao = (status: string): Tinta => getProcessStatusConfig(status).tinta;

/**
 * Get all available statuses for select/dropdown components
 */
export const getProcessStatusOptions = (): ProcessStatusConfig[] => {
  return Object.values(PROCESS_STATUS_CONFIG);
};
