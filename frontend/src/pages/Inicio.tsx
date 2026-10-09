/**
 * Minha Mesa de exemplo (receita 09 §1): raiz `div.folha` com cabeçalho próprio (saudação + data +
 * ações), SEM trilha e SEM FolhaDaTela. Depois, o bloco azul "Resumo do dia" e o que pede atenção.
 * Troque os números e a lista; mantenha o cabeçalho e as medidas. Textos de marca vêm de MARCA.
 *
 * VERSÃO ENXUTA da receita 09 §1: sem LinhaDoTempo, sem QuickActionsRow e sem os estados de
 * carregando/erro (MesaCarregando / MesaErroBusca / AvisoAtualizacaoFalhou) — a fonte local
 * é síncrona. Com fonte remota, acrescente-os como na receita; a ordem é cabeçalho →
 * (LinhaDoTempo) → resumo azul + destaque → (atalhos).
 */
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarimboSituacao } from "@/components/mesa/Mesa";
import { useAuth } from "@/contexts/AuthContext";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { daAba, ordenar } from "@/features/processos/listaDeProcessos";
import { dataDeAbertura, diaPorExtenso, formatBRL, formatBRLCompacto, saudacao } from "@/features/dashboard/formatos";
import { GEN, MARCA } from "@/config/marca";

const ROTULO_DO_RESUMO = "text-xs leading-snug text-moldura-foreground/75";
const NUMERO = "font-display font-semibold leading-none text-gold lining-nums tabular-nums";

const Inicio: React.FC = () => {
  const { user } = useAuth();
  const { processos } = useProcessosDaMesa();
  const agora = new Date();
  const primeiroNome = user?.username?.trim().split(/\s+/)[0];
  const ativos = daAba(processos, "ativos");
  const proximos = ordenar(ativos, "proximo-prazo", agora).slice(0, 4);
  const valorTotal = ativos.reduce((soma, p) => soma + (Number.parseFloat(p.estimated_value) || 0), 0);
  const contagens = [
    { rotulo: `${MARCA.objeto.plural} ativ${GEN.fim}s`, valor: ativos.length },
    { rotulo: MARCA.campos.semData.toLowerCase(), valor: daAba(processos, "sem-data").length },
    { rotulo: `encerrad${GEN.fim}s`, valor: processos.length - ativos.length },
  ];

  return (
    <div className="folha mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold leading-none md:text-5xl">
            {saudacao(agora.getHours())}
            {primeiroNome ? `, ${primeiroNome}.` : "."}
          </h1>
          <p className="mt-2 text-muted-foreground">{diaPorExtenso(agora)}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to={MARCA.rotaDaLista}>Ver {MARCA.objeto.plural}</Link>
          </Button>
          {user && user.permissions.manage_projects && <Button asChild>
            <Link to={MARCA.acaoPrincipal.caminho}>
              <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
              {MARCA.acaoPrincipal.rotulo}
            </Link>
          </Button>}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <section aria-labelledby="resumo-do-dia" className="flex min-w-0 flex-col rounded-xl bg-moldura p-5 text-moldura-foreground">
          <h2 id="resumo-do-dia" className="font-sans text-base font-semibold">
            {MARCA.campos.resumoDoDia}
          </h2>
          <dl className="mt-5 space-y-6">
            <div className="flex min-w-0 flex-col-reverse justify-end gap-1">
              <dt className={ROTULO_DO_RESUMO}>em {MARCA.campos.valor.toLowerCase()}</dt>
              <dd className={`${NUMERO} text-[2.5rem] [overflow-wrap:anywhere]`} title={formatBRL(valorTotal)}>
                {formatBRLCompacto(valorTotal)}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-x-3">
              {contagens.map(({ rotulo, valor }) => (
                <div key={rotulo} className="flex min-w-0 flex-col-reverse justify-end gap-1">
                  <dt className={ROTULO_DO_RESUMO}>{rotulo}</dt>
                  <dd className={`${NUMERO} text-[2rem]`}>{valor}</dd>
                </div>
              ))}
            </div>
          </dl>
          <Link
            to={MARCA.rotaDaLista}
            className="mt-auto inline-flex items-center gap-1 self-start pt-6 text-sm font-semibold text-moldura-foreground/85 hover:text-moldura-foreground hover:underline"
          >
            Ver {GEN.todos} {GEN.os} {MARCA.objeto.plural}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        <section aria-labelledby="proximas" className="mesa-un min-w-0 p-5">
          <h2 id="proximas" className="font-display text-2xl font-semibold">
            O que pede a sua atenção
          </h2>
          {proximos.length === 0 ? (
            <p className="mt-3 text-muted-foreground">Nada em andamento por agora.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {proximos.map((p) => (
                <li key={p.id}>
                  <Link to={`${MARCA.rotaDaLista}/${p.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-muted/50">
                    <span className="min-w-0">
                      <span className="block font-mono text-xs text-muted-foreground">
                        {p.code} · {MARCA.campos.data.toLowerCase()} {p.projectInfo?.date_deadline ? dataDeAbertura(p.projectInfo.date_deadline) : MARCA.campos.semData}
                      </span>
                      <span className="block truncate font-semibold" title={p.object}>
                        {p.object}
                      </span>
                    </span>
                    <CarimboSituacao status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Inicio;
