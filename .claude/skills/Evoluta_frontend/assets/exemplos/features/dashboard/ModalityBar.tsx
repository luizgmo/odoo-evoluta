// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardModality } from "@/services/api/endpoints/dashboard";
import { useThemeTokens } from "@/theme/tokens";

interface Props {
  data: DashboardModality[];
  selected?: string | null;
  onSelect?: (modality: string | null) => void;
  /** Sem o cartão em volta: o gráfico vai direto numa página (livro dos Painéis). */
  semMoldura?: boolean;
}

export const ModalityBar: React.FC<Props> = ({ data, selected, onSelect, semMoldura }) => {
  const t = useThemeTokens();
  const handleClick = (name: string) => {
    if (!onSelect) return;
    onSelect(selected === name ? null : name);
  };

  return (
    <div className={semMoldura ? undefined : "rounded-xl border border-border bg-card p-5"}>
      <h3 className="mb-4 text-xl font-semibold">
        Processos por modalidade
      </h3>
      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Sem dados
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
              <XAxis
                type="number"
                stroke={t.textMuted}
                fontSize={11}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke={t.textMuted}
                fontSize={11}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: t.bgCard,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                itemStyle={{ color: t.text }}
                cursor={{ fill: t.border }}
              />
              <Bar
                isAnimationActive={false}
                dataKey="count"
                fill={t.chart[0]}
                radius={[0, 4, 4, 0]}
                onClick={(d: any) => handleClick(d.name)}
                cursor={onSelect ? "pointer" : undefined}
              >
                {data.map((d) => (
                  <Cell
                    key={d.name}
                    fill={t.chart[0]}
                    opacity={selected && selected !== d.name ? 0.35 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
