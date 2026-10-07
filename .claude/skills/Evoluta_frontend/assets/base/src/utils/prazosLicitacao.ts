/**
 * EXEMPLO DE DOMÍNIO (licitações): só use em sistemas de licitação.
 * Pode ser APAGADO sem quebrar o build: o calendário genérico mora em
 * `utils/datas.ts` e a tabela de prazos em `features/lei/artigos.ts` (vazia na base
 * neutra: o conteúdo da Lei 14.133 está em exemplos/features/lei/artigos.ts); este
 * arquivo só as junta no cálculo do cronograma.
 *
 * Prazos da Lei 14.133/2021 contados em dias úteis — cálculo feito só na tela.
 *
 * Nada aqui é gravado no servidor: é um simulador. As hipóteses e a forma de
 * contar seguem a leitura mais conservadora da lei e precisam ser confirmadas
 * pela equipe jurídica antes de virar regra do sistema.
 *
 * Contagem (art. 183): exclui o dia do começo e inclui o do vencimento; só
 * contam dias com expediente. Feriados municipais não são conhecidos pelo
 * sistema — o servidor os informa na própria tela.
 */

import { HIPOTESES_PRAZO, type HipotesePrazo } from "@/features/lei/artigos";
import {
  CALENDARIO_PADRAO,
  formatarData,
  motivoSemExpediente,
  somarDias,
  somarDiasUteis,
  subtrairDiasUteis,
  type OpcoesCalendario,
} from "./datas";

// Quem já importava daqui continua funcionando; código novo importa de "@/utils/datas".
export * from "./datas";
export { HIPOTESES_PRAZO, type HipotesePrazo };

export interface MarcoCronograma {
  id: string;
  titulo: string;
  data: Date;
  explicacao: string;
  fundamento: string;
}

export interface Cronograma {
  hipotese: HipotesePrazo;
  publicacao: Date;
  fimDoPrazoDePropostas: Date;
  sessaoMinima: Date;
  sessao: Date;
  /** Problemas com a data de sessão escolhida pelo servidor. */
  alertas: string[];
  marcos: MarcoCronograma[];
  /** Dias sem expediente (fora fins de semana) entre a publicação e o último marco. */
  feriadosNoPeriodo: { data: Date; nome: string }[];
}

export function calcularCronograma(params: {
  publicacao: Date;
  hipoteseId: string;
  sessaoPretendida?: Date | null;
  calendario?: OpcoesCalendario;
}): Cronograma {
  const cal = params.calendario ?? CALENDARIO_PADRAO;
  const hipotese = HIPOTESES_PRAZO.find((h) => h.id === params.hipoteseId) ?? HIPOTESES_PRAZO[0];
  if (!hipotese) throw new Error("HIPOTESES_PRAZO está vazia: preencha features/lei/artigos.ts (ou apague este arquivo).");
  const publicacao = params.publicacao;

  const fimDoPrazoDePropostas = somarDiasUteis(publicacao, hipotese.diasUteis, cal);
  // Leitura conservadora: a sessão fica para o dia útil seguinte ao fim do prazo.
  const sessaoMinima = somarDiasUteis(fimDoPrazoDePropostas, 1, cal);

  const alertas: string[] = [];
  let sessao = sessaoMinima;
  if (params.sessaoPretendida) {
    sessao = params.sessaoPretendida;
    const motivo = motivoSemExpediente(sessao, cal);
    if (motivo) alertas.push(`A data escolhida para a sessão não tem expediente (${motivo}).`);
    if (sessao < sessaoMinima) {
      alertas.push(
        `A sessão está antes do mínimo legal: com ${hipotese.diasUteis} dias úteis, a primeira data possível é ${formatarData(sessaoMinima)}.`,
      );
    }
  }

  const limiteImpugnacao = subtrairDiasUteis(sessao, 3, cal);
  const limiteResposta = subtrairDiasUteis(sessao, 1, cal);
  const limiteRecurso = somarDiasUteis(sessao, 3, cal);
  const limiteContrarrazoes = somarDiasUteis(limiteRecurso, 3, cal);

  const marcos: MarcoCronograma[] = [
    {
      id: "publicacao",
      titulo: "Publicação do edital",
      data: publicacao,
      explicacao: "Dia da divulgação. Não entra na contagem.",
      fundamento: "art. 54 e art. 183",
    },
    {
      id: "fim-prazo",
      titulo: `Fim dos ${hipotese.diasUteis} dias úteis para propostas`,
      data: fimDoPrazoDePropostas,
      explicacao: hipotese.rotulo,
      fundamento: hipotese.fundamento,
    },
    {
      id: "impugnacao",
      titulo: "Último dia para impugnar o edital",
      data: limiteImpugnacao,
      explicacao: "Até 3 dias úteis antes da abertura da sessão.",
      fundamento: "art. 164",
    },
    {
      id: "resposta",
      titulo: "Último dia para responder impugnações",
      data: limiteResposta,
      explicacao: "Resposta em até 3 dias úteis, limitada ao último dia útil antes da abertura.",
      fundamento: "art. 164, parágrafo único",
    },
    {
      id: "sessao",
      titulo: "Sessão pública",
      data: sessao,
      explicacao: params.sessaoPretendida ? "Data escolhida por você." : "Primeira data possível (leitura conservadora).",
      fundamento: hipotese.fundamento,
    },
    {
      id: "recurso",
      titulo: "Fim do prazo de recurso",
      data: limiteRecurso,
      explicacao: "3 dias úteis contados da ata, supondo a ata lavrada no dia da sessão.",
      fundamento: "art. 165, I",
    },
    {
      id: "contrarrazoes",
      titulo: "Fim do prazo de contrarrazões",
      data: limiteContrarrazoes,
      explicacao:
        "O mesmo prazo do recurso, contado da divulgação da interposição — aqui, supondo o recurso apresentado no último dia.",
      fundamento: "art. 165, § 4º",
    },
  ];

  // Em ordem de data: a impugnação pode vencer antes do fim do prazo de propostas.
  marcos.sort((a, b) => a.data.getTime() - b.data.getTime());

  const feriadosNoPeriodo: { data: Date; nome: string }[] = [];
  // Limite de segurança: um cronograma real cabe folgado em dois anos.
  let passos = 0;
  for (let d = somarDias(publicacao, 1); d <= limiteContrarrazoes && passos < 800; d = somarDias(d, 1), passos++) {
    const motivo = motivoSemExpediente(d, cal);
    if (motivo && motivo !== "Sábado" && motivo !== "Domingo") feriadosNoPeriodo.push({ data: d, nome: motivo });
  }

  return { hipotese, publicacao, fimDoPrazoDePropostas, sessaoMinima, sessao, alertas, marcos, feriadosNoPeriodo };
}
