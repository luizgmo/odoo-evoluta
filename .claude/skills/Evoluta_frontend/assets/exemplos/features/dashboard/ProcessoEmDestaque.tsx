// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React from "react";
import { Link } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardUpcoming } from "@/services/api/endpoints/dashboard";
import { dataDeAbertura, formatBRL, quandoAbre } from "./formatos";
import { Carimbo } from "@/components/mesa/Mesa";
import { carimboDaAbertura, proximaAcao } from "./montarLinhaDoTempo";

/** O processo que abre primeiro, com o que fazer com ele agora. */
export const ProcessoEmDestaque: React.FC<{ processo?: DashboardUpcoming }> = ({ processo }) => {
  if (!processo) {
    return (
      <section className="mesa-un flex flex-col justify-center p-5">
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Processo em destaque
        </p>
        <p className="mt-2 font-display text-2xl font-semibold">Nenhuma abertura marcada</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Quando um processo tiver data de abertura nos próximos 30 dias, ele aparece aqui com o próximo passo.
        </p>
        <Button asChild variant="outline" className="mt-4 self-start">
          <Link to="/processes">Ver processos</Link>
        </Button>
      </section>
    );
  }

  const acao = proximaAcao(processo);
  const carimbo = carimboDaAbertura(processo.days_left);
  const dados = [
    { rotulo: "Modalidade", valor: processo.modality || "Sem modalidade" },
    { rotulo: "Valor estimado", valor: formatBRL(processo.estimated_value) },
    { rotulo: "Abertura", valor: `${dataDeAbertura(processo.opening_date)} (${quandoAbre(processo.days_left)})` },
  ];

  return (
    <section aria-labelledby="processo-em-destaque" className="mesa-un relative p-5">
      {/* O carimbo grande da tela: quanto falta para a abertura */}
      {carimbo && (
        <div className="float-right ml-4 mt-1 sm:mr-2">
          <Carimbo tinta={carimbo.tinta} grande giro={-5} bateAoAbrir={`destaque-${processo.id}-${carimbo.texto}`}>
            {carimbo.texto}
          </Carimbo>
        </div>
      )}
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Processo em destaque
      </p>
      <h2 id="processo-em-destaque" className="mt-1 text-3xl font-semibold leading-tight [overflow-wrap:anywhere]">
        {processo.code}
      </h2>
      <p className="font-display text-xl leading-snug">{processo.object || "Processo sem objeto descrito"}</p>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 border-y border-border py-3 sm:grid-cols-3">
        {dados.map(({ rotulo, valor }) => (
          <div key={rotulo}>
            <dt className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{rotulo}</dt>
            <dd className="text-sm font-semibold">{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[color:var(--color-status-warning)] bg-gold/10 dark:border-gold/60 p-4">
        <div>
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-status-warning)]">
            Próxima ação
          </p>
          <p className="font-semibold">{acao.texto}</p>
          <p className="text-sm text-muted-foreground">{acao.porque}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={acao.para}>{acao.botao}</Link>
          </Button>
          <Button asChild>
            <Link to={`/processes/${processo.id}`}>
              <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Abrir pasta
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
