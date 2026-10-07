// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useThemeTokens } from "@/theme/tokens";

type StatusKey = "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO" | "ARQUIVADO";

interface Props {
  byStatus: Record<StatusKey, number>;
  selected?: StatusKey | null;
  onSelect?: (status: StatusKey | null) => void;
  /** Sem o cartão em volta: o gráfico vai direto numa página (livro dos Painéis). */
  semMoldura?: boolean;
}

const LABELS: Record<string, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  ARQUIVADO: "Arquivado",
};

export const StatusDonut: React.FC<Props> = ({ byStatus, selected, onSelect, semMoldura }) => {
  const t = useThemeTokens();
  const COLORS: Record<string, string> = {
    ABERTO: t.info,
    EM_ANDAMENTO: t.warning,
    CONCLUIDO: t.success,
    ARQUIVADO: t.textMuted,
  };
  const handleClick = (status: StatusKey) => {
    if (!onSelect) return;
    onSelect(selected === status ? null : status);
  };

  const data = (
    ["ABERTO", "EM_ANDAMENTO", "CONCLUIDO", "ARQUIVADO"] as const
  )
    .map((k) => ({ name: LABELS[k], status: k, value: byStatus[k] || 0 }))
    .filter((d) => d.value > 0);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className={semMoldura ? undefined : "rounded-xl border border-border bg-card p-5"}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Processos por situação
        </h3>
        <span className="text-xs text-muted-foreground">{total} processos</span>
      </div>
      {total === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Nenhum processo cadastrado
        </div>
      ) : (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={data}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke={t.bgCard}
                  strokeWidth={2}
                  onClick={(d: any) => handleClick(d.status as StatusKey)}
                  cursor={onSelect ? "pointer" : undefined}
                >
                  {data.map((d) => (
                    <Cell
                      key={d.status}
                      fill={COLORS[d.status]}
                      opacity={selected && selected !== d.status ? 0.35 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: t.bgCard,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  itemStyle={{ color: t.text }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-xs">
            {data.map((d) => {
              const isSelected = selected === d.status;
              return (
                <li key={d.status}>
                  <button
                    type="button"
                    onClick={() => handleClick(d.status as StatusKey)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition-colors ${
                      isSelected
                        ? "bg-muted text-platinum-50"
                        : "text-platinum-200 hover:bg-muted/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLORS[d.status] }}
                      />
                      {d.name}
                    </span>
                    <span className="font-semibold text-platinum-100">
                      {d.value}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};
