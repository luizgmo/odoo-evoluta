// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, ChevronRight, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { processApi } from "@/services/api";
import { PROCESS_STATUS } from "@/constants/process-status";
import { useThemeTokens } from "@/theme/tokens";
import { lerData } from "@/utils/prazosLicitacao";
import { CarimboSituacao } from "@/components/mesa/Mesa";
import { formatBRL, quandoAbre } from "./formatos";

type StatusKey = "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO" | "ARQUIVADO";

interface Filter {
  status?: StatusKey | null;
  modality?: string | null;
}

interface Props {
  filter: Filter;
  onClearFilter: () => void;
}

interface ProcessRow {
  id: string | number;
  code: string;
  object: string;
  status: string;
  estimated_value: string | number | null;
  opening_date: string | null;
  modality: { name: string } | string | null;
}

const daysUntil = (iso: string | null): number | null => {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // lerData monta "AAAA-MM-DD" como dia local (new Date leria meia-noite UTC: um dia antes em Brasília)
  const target = lerData(iso);
  if (!target) return null;
  const diff = target.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

const STATUS_LABELS: Record<StatusKey, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  ARQUIVADO: "Arquivado",
};

export const ActiveProcessesList: React.FC<Props> = ({ filter, onClearFilter }) => {
  const t = useThemeTokens();
  const { data, isLoading } = useQuery({
    queryKey: ["processes-list-all"],
    queryFn: async () => {
      const res = await processApi.list();
      const list = Array.isArray(res) ? res : res?.results || [];
      return list as ProcessRow[];
    },
    staleTime: 30_000,
  });

  const filtered = React.useMemo(() => {
    let list = data || [];
    if (filter.status) {
      list = list.filter((p) => p.status?.toUpperCase() === filter.status);
    } else {
      // sem filtro de status: mostra apenas ativos
      list = list.filter((p) => {
        const s = p.status?.toUpperCase();
        return s === PROCESS_STATUS.ABERTO || s === PROCESS_STATUS.EM_ANDAMENTO;
      });
    }
    if (filter.modality) {
      list = list.filter((p) => {
        const name = typeof p.modality === "string" ? p.modality : p.modality?.name;
        return name === filter.modality;
      });
    }
    return list;
  }, [data, filter]);

  const filterLabel = React.useMemo(() => {
    const parts: string[] = [];
    if (filter.status) parts.push(STATUS_LABELS[filter.status]);
    if (filter.modality) parts.push(filter.modality);
    return parts.join(" · ");
  }, [filter]);

  const heading = filter.status || filter.modality ? "Processos filtrados" : "Meus processos ativos";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            {heading}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {filter.status || filter.modality
              ? `Filtro: ${filterLabel}`
              : "Em andamento ou aguardando abertura"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(filter.status || filter.modality) && (
            <button
              type="button"
              onClick={onClearFilter}
              className="flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:border-muted-foreground/40"
            >
              <X className="h-3 w-3" />
              limpar
            </button>
          )}
          <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-foreground">
            {filtered.length} {filtered.length === 1 ? "processo" : "processos"}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Carregando…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-sm text-muted-foreground">
          <Briefcase className="h-8 w-8 opacity-40" />
          <span>
            {filter.status || filter.modality
              ? "Nenhum processo bate com o filtro"
              : "Nenhum processo ativo no momento"}
          </span>
          {!filter.status && !filter.modality && (
            <Link
              to="/processes/new"
              className="mt-1 rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-muted-foreground/40"
            >
              Criar primeiro processo
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => {
            const days = daysUntil(p.opening_date);
            const modalityName =
              typeof p.modality === "string"
                ? p.modality
                : p.modality?.name || "—";
            return (
              <li key={p.id}>
                <Link
                  to={`/processes/${p.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3 transition-colors hover:border-muted-foreground/40 hover:bg-background/70"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="etiqueta-pasta font-mono text-xs text-foreground">{p.code}</span>
                      <CarimboSituacao status={p.status} />
                    </div>
                    <div className="mt-1 truncate text-sm font-medium text-foreground">
                      {p.object || "Processo sem título"}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{modalityName}</span>
                      <span>·</span>
                      <span>{formatBRL(p.estimated_value)}</span>
                      {days !== null && days >= 0 && (
                        <>
                          <span>·</span>
                          <span
                            className={days > 7 ? "text-muted-foreground" : undefined}
                            style={
                              days <= 3
                                ? { color: t.error }
                                : days <= 7
                                  ? { color: t.warning }
                                  : undefined
                            }
                          >
                            abre {quandoAbre(days)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
