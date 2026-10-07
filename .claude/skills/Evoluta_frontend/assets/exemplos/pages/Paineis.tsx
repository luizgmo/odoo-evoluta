// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Painéis do gestor (proposta 7, tela 21): onde os processos estão, o que vence
 * nos próximos 7 dias e os números do órgão. Visível para gestor e administrador.
 * É o livro de registro aberto: o resumo numa página, os gráficos na outra.
 * As planilhas (CSV) ficam em Relatórios.
 */
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { AvisoAtualizacaoFalhou, MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { ResumoDoDia } from "@/features/dashboard/ResumoDoDia";
import { StatusDonut } from "@/features/dashboard/StatusDonut";
import { ModalityBar } from "@/features/dashboard/ModalityBar";
import { ActiveProcessesList } from "@/features/dashboard/ActiveProcessesList";
import { RitmoDoOrgao } from "@/features/dashboard/RitmoDoOrgao";
import { montarAgenda, naJanela } from "@/features/agenda/montarAgenda";
import { daAba } from "@/features/processos/listaDeProcessos";

type StatusKey = "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO" | "ARQUIVADO";

/** Uma linha do livro: o nome, o número grande à direita e o caminho para ver. */
const Cartao: React.FC<{ rotulo: string; valor: number | string; detalhe: string; para?: string; alerta?: boolean }> = ({
  rotulo,
  valor,
  detalhe,
  para,
  alerta,
}) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-b border-dotted border-[hsl(var(--mesa-linha))] py-3 first:pt-0">
    <p className="col-start-1 font-semibold">{rotulo}</p>
    <p
      className={`col-start-2 row-span-3 row-start-1 self-center text-right font-display text-4xl font-semibold leading-none lining-nums tabular-nums ${alerta ? "text-[color:var(--color-status-error)]" : ""}`}
    >
      {valor}
    </p>
    <p className="col-start-1 text-sm text-muted-foreground">{detalhe}</p>
    {para && (
      <Link to={para} className="col-start-1 mt-1 text-sm font-semibold text-primary hover:underline dark:text-accent">
        Ver<span className="sr-only"> {rotulo.toLowerCase()}</span> ›
      </Link>
    )}
  </div>
);

const Paineis: React.FC = () => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const {
    processos,
    isLoading: contandoPrazos,
    isError: buscaFalhou,
    data: processosCarregados,
    refetch: buscarProcessosDeNovo,
  } = useProcessosDaMesa();
  // Com a lista de antes em mãos, conta com ela; "?" só quando não há dado nenhum
  const prazosFalharam = buscaFalhou && !processosCarregados;
  const [statusFilter, setStatusFilter] = useState<StatusKey | null>(null);
  const [modalityFilter, setModalityFilter] = useState<string | null>(null);
  const prazosDaSemana = useMemo(
    () => naJanela(montarAgenda(processos).compromissos, "semana").filter((c) => c.legal).length,
    [processos],
  );

  if (isLoading) return <MesaCarregando texto="Montando os painéis…" />;
  // Com os números em mãos, uma atualização que falha só ganha o aviso
  if (!stats)
    return (
      <MesaErroBusca
        titulo="Não deu para montar os painéis"
        texto="A conexão ou o servidor falhou. Nada foi perdido; tente de novo em instantes."
        onTentarDeNovo={() => refetch()}
      />
    );

  const encerrados = (stats.by_status.CONCLUIDO ?? 0) + (stats.by_status.ARQUIVADO ?? 0);

  return (
    <FolhaDaTela
      trilha={[{ rotulo: "Mesa", para: "/dashboard" }, { rotulo: "Painéis" }]}
      titulo="Onde os processos estão e o que vence"
      subtitulo="O livro de registro do gestor. Clique num gráfico para filtrar a lista de processos abaixo."
      acao={
        <Button asChild variant="outline">
          <Link to="/reports">
            <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
            Exportar planilhas
          </Link>
        </Button>
      }
    >
      {/* Os números vêm de duas buscas: qualquer uma que falhe com dados na tela ganha o aviso */}
      {(error || (buscaFalhou && processosCarregados)) && (
        <AvisoAtualizacaoFalhou
          onTentarDeNovo={() => {
            if (error) void refetch();
            if (buscaFalhou) void buscarProcessosDeNovo();
          }}
        />
      )}

      <div className="livro-aberto grid grid-cols-1 lg:grid-cols-2">
        <div className="livro-pagina livro-pagina-esq space-y-6">
          <div>
            <h2 className="mb-4 font-display text-3xl font-medium">Situação da carteira</h2>
            <Cartao rotulo="Ativos" valor={stats.kpis.active_processes} detalhe="abertos ou em andamento" para="/processes" />
            <Cartao
              rotulo="Prazo legal nos próximos 7 dias"
              // Sem a lista de processos, "0" tranquilizaria à toa: diz que não contou
              valor={contandoPrazos ? "…" : prazosFalharam ? "?" : prazosDaSemana}
              detalhe={
                contandoPrazos
                  ? "contando…"
                  : prazosFalharam
                    ? "não deu para contar agora; veja em Prazos e agenda"
                    : "impugnação, resposta, recurso e contrarrazões (a sessão fica na agenda)"
              }
              para="/agenda"
              alerta={!contandoPrazos && (prazosFalharam || prazosDaSemana > 0)}
            />
            <Cartao
              rotulo="Sem data de abertura"
              // A mesma regra da divisória da lista (contratação direta não entra: não tem sessão)
              valor={contandoPrazos ? "…" : prazosFalharam ? "?" : daAba(processos, "sem-data").length}
              detalhe="os prazos deles não podem ser contados"
              para="/processes?aba=sem-data"
            />
            <Cartao rotulo="Encerrados" valor={encerrados} detalhe="concluídos ou arquivados" para="/arquivo" />
          </div>
          <ResumoDoDia kpis={stats.kpis} />
        </div>

        <div className="livro-pagina space-y-8">
          <StatusDonut byStatus={stats.by_status} selected={statusFilter} onSelect={setStatusFilter} semMoldura />
          <ModalityBar data={stats.by_modality} selected={modalityFilter} onSelect={setModalityFilter} semMoldura />
        </div>
      </div>

      <RitmoDoOrgao
        processos={processos}
        processosCarregando={contandoPrazos}
        processosFalharam={prazosFalharam}
        onTentarProcessos={() => void buscarProcessosDeNovo()}
      />

      <ActiveProcessesList
        filter={{ status: statusFilter, modality: modalityFilter }}
        onClearFilter={() => {
          setStatusFilter(null);
          setModalityFilter(null);
        }}
      />
    </FolhaDaTela>
  );
};

export default Paineis;
