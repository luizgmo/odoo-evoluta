// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { DashboardKpis } from "@/services/api/endpoints/dashboard";
import { formatBRL, formatBRLCompacto } from "./formatos";

const ROTULO = "text-xs leading-snug text-moldura-foreground/75";
const NUMERO = "font-display font-semibold leading-none text-gold lining-nums tabular-nums";

/**
 * Bloco azul da Minha Mesa: o valor em jogo, grande e na largura toda (um
 * "R$ 125,3 mi" não cabe em meia coluna), e as três contagens do dia embaixo.
 */
export const ResumoDoDia: React.FC<{ kpis: DashboardKpis }> = ({ kpis }) => {
  const contagens = [
    { rotulo: "processos ativos", valor: kpis.active_processes },
    { rotulo: "documentos na semana", valor: kpis.docs_generated_week },
    { rotulo: "conversas com a IA abertas", valor: kpis.active_chat_sessions },
  ];

  return (
    <section aria-labelledby="resumo-do-dia" className="flex flex-col rounded-xl bg-moldura p-5 text-moldura-foreground">
      <h2 id="resumo-do-dia" className="font-sans text-base font-semibold">
        Resumo do dia
      </h2>
      <dl className="mt-5 space-y-6">
        <div className="flex min-w-0 flex-col-reverse justify-end gap-1">
          <dt className={ROTULO}>em valor estimado</dt>
          <dd className={`${NUMERO} text-[2.5rem] [overflow-wrap:anywhere]`} title={formatBRL(kpis.total_estimated_value)}>
            {formatBRLCompacto(kpis.total_estimated_value)}
          </dd>
        </div>
        <div className="grid grid-cols-3 gap-x-3">
          {contagens.map(({ rotulo, valor }) => (
            <div key={rotulo} className="flex min-w-0 flex-col-reverse justify-end gap-1">
              <dt className={ROTULO}>{rotulo}</dt>
              <dd className={`${NUMERO} text-[2rem]`}>{valor}</dd>
            </div>
          ))}
        </div>
      </dl>
      <Link
        to="/processes"
        className="mt-auto inline-flex items-center gap-1 self-start rounded pt-6 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold text-moldura-foreground/85 hover:text-moldura-foreground hover:underline"
      >
        Ver todos os processos
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
};
