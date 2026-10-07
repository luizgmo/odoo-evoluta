/**
 * EXEMPLO DE DOMÍNIO (licitações): o conteúdo abaixo é de licitação. Em outro sistema, NÃO apague
 * nem deixe de importar este arquivo (montarAgenda, listaDeProcessos, PastaDoProcesso e
 * PastaNaGaveta o importam e o tsc quebra).
 *
 * MOLDE NEUTRO: troque o CONTEÚDO — os nomes
 * das fases, as explicações e o critério de `ehContratacaoDireta` — mantendo os nomes e as
 * assinaturas exportados (`FASES_DA_LICITACAO`, `situacaoDasFases`, `espessuraDaPasta`,
 * `ehContratacaoDireta`) e o campo `contratacaoDireta` (use `false` fixo se não existir).
 * Fases sugeridas para um fluxo simples: "Início", "Andamento", "Conclusão".
 * Pode ter QUALQUER número de fases (1 ou mais): os índices abaixo são limitados por `ate()` à
 * última fase, e a situação marcada `concluida` na tabela de constants/process-status.ts (hoje
 * CONCLUIDO) sempre cai na última — então trocar a lista para 3 ou 4 nomes
 * não quebra "Fase atual" nem o "Fase N de M" da FasesEmBolinhas. Para o seu fluxo, reescreva só
 * os blocos `if` de `situacaoDasFases` (qual dado leva a qual fase) e a `explicacao` de cada um.
 *
 * As fases da licitação (Lei 14.133/2021, art. 17) e em qual delas o processo
 * está. O servidor ainda não registra a fase: ela é ESTIMADA pelas datas de
 * publicação e de abertura e pela situação do processo. Depois da sessão, o
 * sistema não sabe se o processo está em julgamento, habilitação ou recursos —
 * e a tela diz isso, em vez de adivinhar.
 */
import type { Process } from "@/types/process";
import { GEN, MARCA } from "@/config/marca";
import { ehSituacaoConcluida, ehSituacaoEncerrada } from "@/constants/process-status";

/** Primeira letra maiúscula, para abrir frase com o nome do objeto ("processo" → "Processo"). */
const inicial = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const OBJETO = inicial(MARCA.objeto.singular);

export const FASES_DA_LICITACAO = [
  "Não iniciado",
  "Planejado",
  "Em execução",
  "Aguardando terceiro",
  "Validação",
  "Concluído",
] as const;

export type EstadoDaFase = "feita" | "atual" | "por vir";

export interface SituacaoDasFases {
  /** Índice (0 a última fase) da fase atual; -1 quando o processo foi encerrado sem concluir. */
  atual: number;
  fases: { nome: string; estado: EstadoDaFase }[];
  /** Explica de onde veio a fase, para a pessoa confiar (ou desconfiar) dela. */
  explicacao: string;
  /** Contratação direta (dispensa, inexigibilidade) não passa por estas fases. */
  contratacaoDireta: boolean;
}

/** Limita o índice à última fase: com menos de 7 fases, nenhum índice sai da lista. */
export const ate = (indice: number) => Math.min(indice, FASES_DA_LICITACAO.length - 1);

/** "2026-10-09" como dia local, sem fuso. */
const dia = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

/** Acompanhamento direto (não passa pelas etapas): reservado, `false` fixo no mock. */
export const ehContratacaoDireta = (_modalidade?: string | null) => false;

export function situacaoDasFases(processo: Pick<Process, "status" | "publication_date" | "opening_date" | "modality">, hoje: Date = new Date()): SituacaoDasFases {
  const hojeDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const abertura = dia(processo.opening_date);
  // Quais situações encerram (e quais concluem o fluxo) vem da tabela de constants/process-status.ts
  const concluida = ehSituacaoConcluida(processo.status);

  let atual: number;
  let explicacao: string;
  if (concluida) {
    atual = FASES_DA_LICITACAO.length - 1;
    explicacao = `${OBJETO} concluíd${GEN.fim}.`;
  } else if (ehSituacaoEncerrada(processo.status)) {
    // Encerrado sem concluir: não está em fase nenhuma, e as datas não dizem mais nada
    atual = -1;
    explicacao = `${OBJETO} encerrad${GEN.fim} sem concluir.`;
  } else if (!abertura) {
    atual = ate(0);
    explicacao = "Ainda sem prazo final.";
  } else if (abertura > hojeDia) {
    atual = ate(2);
    explicacao = "Prazo futuro; em execução.";
  } else if (abertura.getTime() === hojeDia.getTime()) {
    atual = ate(4);
    explicacao = "Prazo é hoje; em validação.";
  } else {
    atual = ate(3);
    explicacao = `Prazo passou. O sistema ainda não registra se ${GEN.o} ${MARCA.objeto.singular} está aguardando terceiro ou em validação.`;
  }

  return {
    atual,
    explicacao,
    contratacaoDireta: ehContratacaoDireta(processo.modality?.name),
    fases: FASES_DA_LICITACAO.map((nome, i) => ({
      nome,
      estado: concluida || i < atual ? "feita" : i === atual ? "atual" : "por vir",
    })),
  };
}

/** Quanto mais adiantado o processo, mais folhas juntadas: a pasta engrossa de 1 a 3. */
export function espessuraDaPasta(processo: Pick<Process, "status" | "publication_date" | "opening_date" | "modality">): 1 | 2 | 3 {
  const { atual, fases } = situacaoDasFases(processo);
  if (atual < 0 || fases.length === 0) return 1;
  const adiantamento = (atual + 1) / fases.length;
  return adiantamento > 0.6 ? 3 : adiantamento > 0.3 ? 2 : 1;
}
