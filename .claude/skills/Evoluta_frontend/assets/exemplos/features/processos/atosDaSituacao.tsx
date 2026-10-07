// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Atos que mudam a situação do processo na ficha (proposta 7, tela 14): o que
 * cada situação permite, com a pergunta, a consequência e o aviso de cada ato.
 */
import React from "react";
import { Archive, CheckCircle2, PlayCircle, RotateCcw, Undo2, type LucideIcon } from "lucide-react";
import { PROCESS_STATUS } from "@/constants/process-status";

export interface AtoDaSituacao {
  id: string;
  para: string;
  /** Botão na coluna. */
  botao: string;
  icone: LucideIcon;
  pergunta: (code: string) => string;
  consequencia: React.ReactNode;
  confirmar: string;
  voltar: string;
  /** Aviso depois do ato. */
  feito: (code: string) => string;
}

/** "o processo PE 7/2026", ou "este processo" quando ainda não tem número. */
const oProcesso = (c: string) => (c ? `o processo ${c}` : "este processo");

const HISTORICO_AINDA_NAO = "A mudança não aparece no Histórico do processo.";

const EM_ANDAMENTO: AtoDaSituacao = {
  id: "andamento",
  para: PROCESS_STATUS.EM_ANDAMENTO,
  botao: "Marcar em andamento",
  icone: PlayCircle,
  pergunta: (c) => `Marcar ${oProcesso(c)} como em andamento?`,
  consequencia: <>A pasta continua em Processos, agora como em condução. {HISTORICO_AINDA_NAO}</>,
  confirmar: "Marcar em andamento",
  voltar: "Manter como está",
  feito: (c) => `${c} está em andamento.`,
};

const VOLTAR_ABERTO: AtoDaSituacao = {
  id: "aberto",
  para: PROCESS_STATUS.ABERTO,
  botao: "Voltar para aberto",
  icone: Undo2,
  pergunta: (c) => `Voltar ${oProcesso(c)} para aberto?`,
  consequencia: <>A pasta continua em Processos, de novo como aberta, preparando os documentos. {HISTORICO_AINDA_NAO}</>,
  confirmar: "Voltar para aberto",
  voltar: "Manter em andamento",
  feito: (c) => `${c} voltou para aberto.`,
};

const CONCLUIR: AtoDaSituacao = {
  id: "concluir",
  para: PROCESS_STATUS.CONCLUIDO,
  botao: "Concluir o processo",
  icone: CheckCircle2,
  pergunta: (c) => `Concluir ${oProcesso(c)}?`,
  consequencia: (
    <>
      A pasta sai de Processos e vai para o Arquivo como concluída, com tudo o que tem. Logo depois aparece "Desfazer", e ela
      pode ser reaberta aqui na ficha. {HISTORICO_AINDA_NAO}
    </>
  ),
  confirmar: "Concluir processo",
  voltar: "Manter aberto",
  feito: (c) => `${c} foi concluído e está no Arquivo.`,
};

const ARQUIVAR: AtoDaSituacao = {
  id: "arquivar",
  para: PROCESS_STATUS.ARQUIVADO,
  botao: "Arquivar o processo",
  icone: Archive,
  pergunta: (c) => `Arquivar ${oProcesso(c)}?`,
  consequencia: (
    <>
      A pasta sai de Processos e vai para o Arquivo, com tudo o que tem. Logo depois aparece "Desfazer", e ela pode ser reaberta
      aqui na ficha. O arquivamento ainda não fica registrado no Histórico do processo, nem o motivo.
    </>
  ),
  confirmar: "Arquivar processo",
  voltar: "Manter aberto",
  feito: (c) => `${c} foi para o Arquivo.`,
};

const REABRIR: AtoDaSituacao = {
  id: "reabrir",
  para: PROCESS_STATUS.EM_ANDAMENTO,
  botao: "Reabrir o processo",
  icone: RotateCcw,
  pergunta: (c) => `Reabrir ${oProcesso(c)}?`,
  consequencia: <>A pasta sai do Arquivo e volta para Processos, em andamento. {HISTORICO_AINDA_NAO}</>,
  confirmar: "Reabrir processo",
  voltar: "Manter no Arquivo",
  feito: (c) => `${c} foi reaberto e voltou para Processos.`,
};

/** O que se pode fazer a partir de cada situação. */
export function atosDaSituacao(atual: string): AtoDaSituacao[] {
  if (atual === PROCESS_STATUS.ABERTO) return [EM_ANDAMENTO, CONCLUIR, ARQUIVAR];
  if (atual === PROCESS_STATUS.EM_ANDAMENTO) return [CONCLUIR, VOLTAR_ABERTO, ARQUIVAR];
  if (atual === PROCESS_STATUS.CONCLUIDO || atual === PROCESS_STATUS.ARQUIVADO) return [REABRIR];
  return [];
}
