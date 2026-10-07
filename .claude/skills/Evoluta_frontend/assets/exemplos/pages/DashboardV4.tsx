// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Minha Mesa — tela inicial no estilo Workspace Evoluta.
 *
 * Consome /api/dashboard/stats/ via useDashboardStats e mostra, de cima para baixo:
 *  - saudação com o resumo da semana
 *  - linha do tempo (feito há pouco, hoje, aguarda você, próximos 7 dias, mais adiante)
 *  - resumo do dia (bloco azul) e processo em destaque
 *  - acesso rápido
 * Os gráficos por situação e modalidade ficam nos Painéis do gestor.
 */

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";

import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { getFullName } from "@/utils/getFullName";
import { LinhaDoTempo } from "@/features/dashboard/LinhaDoTempo";
import { AvisoAtualizacaoFalhou } from "@/components/mesa/Mesa";
import { montarLinhaDoTempo, processoMaisProximo, resumoDaSemana } from "@/features/dashboard/montarLinhaDoTempo";
import { ResumoDoDia } from "@/features/dashboard/ResumoDoDia";
import { ProcessoEmDestaque } from "@/features/dashboard/ProcessoEmDestaque";
import { QuickActionsRow } from "@/features/dashboard/QuickActionsRow";

const DashboardV4: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  const colunas = React.useMemo(() => (stats ? montarLinhaDoTempo(stats) : []), [stats]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Carregando a Minha Mesa">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-transparent" />
      </div>
    );
  }

  // Com a mesa em mãos, uma atualização que falha só ganha o aviso
  if (!stats) {
    return (
      <div className="mx-auto max-w-7xl">
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
          <p className="font-semibold text-destructive">Não foi possível carregar a Minha Mesa</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente novamente em alguns instantes. Se continuar, avise a equipe do LicitarsAI.
          </p>
        </div>
      </div>
    );
  }

  const processoEmDestaque = processoMaisProximo(stats.upcoming_openings);

  return (
    <div className="folha mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 md:p-8">
      {error &&<AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
      <DashboardHeader displayName={getFullName(user)} resumo={resumoDaSemana(colunas)} />

      <LinhaDoTempo colunas={colunas} hoje={new Date()} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <ResumoDoDia kpis={stats.kpis} />
        <ProcessoEmDestaque processo={processoEmDestaque} />
      </div>

      <QuickActionsRow />

    </div>
  );
};

export default DashboardV4;
