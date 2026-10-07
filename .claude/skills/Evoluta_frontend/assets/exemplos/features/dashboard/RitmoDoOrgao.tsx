// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Faixa "Documentos e ritmo" dos Painéis: quantos documentos o órgão tem e em
 * que pé estão, e quantos processos foram abertos por mês. Traz de volta o que
 * a antiga tela de Métricas mostrava.
 */
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Process } from "@/types/process";
import { documentApi } from "@/services/api/endpoints";
import { contarDocumentos, processosPorMes } from "./contasDoRitmo";

const TITULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";

export const RitmoDoOrgao: React.FC<{
  processos: Process[];
  processosCarregando: boolean;
  /** A lista de processos não veio (e não há a de antes): zeros enganariam. */
  processosFalharam?: boolean;
  onTentarProcessos?: () => void;
}> = ({ processos, processosCarregando, processosFalharam, onTentarProcessos }) => {
  const docs = useQuery({ queryKey: ["paineis", "documentos"], queryFn: () => documentApi.list() });
  const resultados = useMemo(() => docs.data?.results ?? [], [docs.data]);
  const total = docs.data?.count ?? resultados.length;
  const contagem = useMemo(() => contarDocumentos(resultados), [resultados]);
  // A busca traz uma página; se o órgão tem mais, a divisão por situação é só dessa parte
  const parcial = resultados.length < total;
  const meses = useMemo(() => processosPorMes(processos), [processos]);
  const maior = Math.max(1, ...meses.map((m) => m.total));

  return (
    <section aria-labelledby="ritmo-titulo" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <h2 id="ritmo-titulo" className="sr-only">
        Documentos e ritmo
      </h2>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className={TITULO}>Documentos do órgão</p>
        {docs.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Contando…</p>
        ) : docs.isError && !docs.data ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Não deu para contar os documentos agora.{" "}
            <button type="button" onClick={() => docs.refetch()} className="font-semibold text-primary hover:underline dark:text-accent">
              Tentar de novo
            </button>
          </p>
        ) : (
          <>
            <p className="mt-1 font-display text-4xl font-semibold leading-none lining-nums tabular-nums">{total}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
              {[
                { rotulo: "Concluídos", valor: contagem.concluidos },
                { rotulo: "Em redação", valor: contagem.emRedacao },
                { rotulo: "Dispensados", valor: contagem.dispensados },
              ].map((c) => (
                <div key={c.rotulo}>
                  <dt className="text-muted-foreground">{c.rotulo}</dt>
                  <dd className="font-semibold tabular-nums">{c.valor}</dd>
                </div>
              ))}
            </dl>
            {docs.isError && (
              <p role="status" className="mt-2 text-xs tinta-carmim">
                A última contagem falhou; mostrando a de antes.{" "}
                <button type="button" onClick={() => docs.refetch()} className="font-semibold underline">
                  Tentar de novo
                </button>
              </p>
            )}
            {parcial && (
              <p className="mt-2 text-xs text-muted-foreground">
                A divisão por situação conta {resultados.length} dos {total} documentos.
              </p>
            )}
          </>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className={TITULO}>Processos abertos por mês</p>
        {processosCarregando ? (
          <p className="mt-2 text-sm text-muted-foreground">Contando…</p>
        ) : processosFalharam ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Não deu para contar os processos agora.{" "}
            {onTentarProcessos && (
              <button type="button" onClick={onTentarProcessos} className="font-semibold text-primary hover:underline dark:text-accent">
                Tentar de novo
              </button>
            )}
          </p>
        ) : (
          <ol className="mt-3 space-y-2" aria-label="Processos abertos nos últimos 6 meses">
            {meses.map((m) => (
              <li key={m.chave} className="grid grid-cols-[3.5rem_minmax(0,1fr)_2rem] items-center gap-2 text-sm">
                <span className="text-muted-foreground">{m.rotulo}</span>
                <span className="h-3 rounded-sm bg-muted" aria-hidden="true">
                  <span className="block h-3 rounded-sm bg-primary dark:bg-accent" style={{ width: `${(m.total / maior) * 100}%` }} />
                </span>
                <span className="text-right font-semibold tabular-nums">{m.total}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};
