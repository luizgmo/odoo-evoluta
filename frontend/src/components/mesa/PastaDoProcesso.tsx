/**
 * A pasta do projeto: trilha, divisórias, capa, carimbos, dados municipais e
 * ferramentas metodológicas nas abas da borda direita.
 *
 * Duas alturas de capa:
 * - completa, na Linha do tempo (número grande, carimbos, dados, fases);
 * - compacta, nas outras divisórias e ferramentas (número, objeto e situação),
 *   para o conteúdo da aba aparecer logo.
 */
import React from "react";
import { Link, useMatch } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Process } from "@/types/process";
import { dataDeAbertura, formatBRLComCentavos } from "@/features/dashboard/formatos";
import { CarimboDatado, CarimboSituacao } from "./Mesa";
import { Trilha } from "./Trilha";
import { DIVISORIAS_DO_PROCESSO, FERRAMENTAS_DO_PROCESSO, caminhoDaAba } from "./ferramentas";

import { GEN, MARCA } from "@/config/marca";

const capitalizada = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

interface Props {
  processo: Process;
  /** Nome da secretaria quando a tela precisar sobrescrevê-lo. */
  secretaria?: string;
  compacta?: boolean;
  /** Botões da capa (Imprimir, Editar…). */
  acoes?: React.ReactNode;
  /** Prepara para o papel: esconde divisórias, ferramentas e a capa da tela. */
  imprimivel?: boolean;
  children?: React.ReactNode;
}

const dataComHora = (data?: string | null, hora?: string | null) => {
  if (!data) return MARCA.campos.semData;
  const d = dataDeAbertura(data);
  return hora ? `${d} às ${hora.slice(0, 5)}` : d;
};

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";


export const PastaDoProcesso: React.FC<Props> = ({ processo, secretaria, compacta, acoes, imprimivel, children }) => {
  // useMatch lê o endereço do roteador (a aba acesa vem da rota, não de estado)
  const comAba = useMatch(`${MARCA.rotaDaLista}/:id/:aba/*`);
  const abaAtual = comAba?.params.aba ?? "";
  const nomeSecretaria = secretaria || processo.projectInfo?.secretaria?.name || MARCA.objeto.semAgrupamento;
  const prazoFinal = processo.projectInfo?.date_deadline
    ? dataComHora(processo.projectInfo.date_deadline, null)
    : MARCA.campos.semData;
  const etapaAtual = processo.projectInfo?.etapa?.name || "A fazer";

  const dados = [
    { rotulo: MARCA.campos.agrupamento, valor: nomeSecretaria },
    { rotulo: MARCA.campos.data, valor: prazoFinal },
    { rotulo: MARCA.campos.valor, valor: processo.estimated_value ? formatBRLComCentavos(processo.estimated_value) : "R$ 0,00" },
    { rotulo: MARCA.campos.responsavel, valor: processo.projectInfo?.responsavel?.name || processo.responsible || "Sem responsável" },
    { rotulo: MARCA.campos.fase, valor: etapaAtual, destaque: true },
  ];

  return (
    <div className={cn(imprimivel && "area-impressao")}>
      <Trilha
        className="mb-3"
        passos={[
          { rotulo: MARCA.inicio, para: MARCA.rotaInicial },
          { rotulo: capitalizada(MARCA.objeto.plural), para: MARCA.rotaDaLista },
          { rotulo: processo.code || MARCA.objeto.semNumero, numero: true },
        ]}
      />

      <div className="flex flex-col xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Divisórias: as partes da pasta */}
          {/* A faixa sobe 1px sobre a capa (a divisória ativa "funde" com ela); as barras de rolagem ficam ocultas: o 1px não pode gerar rolagem vertical */}
          <nav aria-label={`Divisórias ${GEN.do} ${MARCA.objeto.singular}`} className="nao-imprimir relative z-10 -mb-px flex items-end gap-1 overflow-x-auto pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DIVISORIAS_DO_PROCESSO.map((aba) => {
              const ativa = aba.caminho === abaAtual;
              return (
                <Link
                  key={aba.caminho || "linha"}
                  to={caminhoDaAba(processo.id, aba)}
                  aria-label={aba.rotulo}
                  aria-current={ativa ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-t-lg border border-b-0 px-4 font-ui text-xs font-semibold uppercase tracking-[0.1em] transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    ativa
                      ? "border-border bg-card pb-2.5 pt-3 text-foreground"
                      : "border-border/70 bg-muted/70 py-2 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {aba.curto}
                </Link>
              );
            })}
          </nav>

          <article
            aria-labelledby="pasta-numero"
            className={cn(
              "pasta-capa relative flex-1 rounded-xl rounded-tl-none border border-border bg-card",
              compacta ? "p-4 md:p-6" : "p-5 md:p-8",
            )}
          >
            <span className="clipe-de-papel nao-imprimir" aria-hidden="true" />

            {compacta ? (
              <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 id="pasta-numero" className="text-2xl font-bold leading-none [overflow-wrap:anywhere]">
                      {processo.code || MARCA.objeto.semNumero}
                    </h1>
                    <span className="text-sm text-muted-foreground">{nomeSecretaria}</span>
                    <CarimboSituacao status={processo.status} />
                  </div>
                  <p className="mt-1 line-clamp-1 font-display text-lg" title={processo.object}>
                    {processo.object || MARCA.objeto.semDescricao}
                  </p>
                </div>
                {/* No papel o número e o objeto ficam (identificam a folha); só os botões somem */}
                {acoes && <div className="nao-imprimir flex flex-wrap gap-2">{acoes}</div>}
              </header>
            ) : (
              <>
                {/* Os carimbos ficam ACIMA do título até xl: com o menu aberto e texto grande a coluna ao lado esmagava número e título */}
                <div className="flex flex-col-reverse gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className={ROTULO}>{MARCA.objeto.rotuloDaCapa}</p>
                    {/* Número livre (NUP/SEI "00123.000045/2026-11") não tem onde quebrar: menor no celular e quebra se preciso */}
                    <h1 id="pasta-numero" className="mt-1 text-3xl font-bold leading-none [overflow-wrap:anywhere] sm:text-4xl xl:text-5xl">
                      {processo.code || MARCA.objeto.semNumero}
                    </h1>
                    <p className="mt-2 line-clamp-3 max-w-3xl font-display text-xl leading-snug md:text-2xl" title={processo.object}>
                      {processo.object || MARCA.objeto.semDescricao}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-row flex-wrap items-start gap-4 xl:flex-col xl:items-end xl:pt-1">
                    <CarimboSituacao status={processo.status} grande giro={-4} bateAoAbrir={`capa-${processo.id}-${processo.status}`} />
                    {processo.created_at && (
                      <CarimboDatado ato={MARCA.campos.criadoEm} data={processo.created_at} tinta="carmim" giro={2} className="text-xs" />
                    )}
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-y border-border py-4 sm:grid-cols-2 lg:grid-cols-5">
                  {dados.map(({ rotulo, valor, destaque }) => (
                    <div key={rotulo} className="min-w-0">
                      <dt className={ROTULO}>{rotulo}</dt>
                      <dd className={cn("mt-0.5 font-semibold", destaque && "text-primary dark:text-accent print:text-foreground")}>{valor}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-5 border-t border-dashed border-border pt-4 text-sm text-muted-foreground">
                  As ações do projeto avançam pelas etapas no Kanban.
                </p>
                {acoes && <div className="nao-imprimir mt-5 flex flex-wrap gap-2">{acoes}</div>}
              </>
            )}

            <div className={cn(!compacta && "mt-6")}>{children}</div>
          </article>
        </div>

        {/* Ferramentas: no celular, uma fileira acima da pasta; na tela larga, abas na borda direita */}
        <nav
          aria-label={`Ferramentas ${GEN.deste} ${MARCA.objeto.singular}`}
          className="nao-imprimir order-first mb-3 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:order-none xl:mb-0 xl:flex-col xl:gap-1 xl:overflow-visible xl:p-0 xl:pt-14"
        >
          {FERRAMENTAS_DO_PROCESSO.map((aba) => {
            const ativa = aba.caminho === abaAtual;
            return (
              <Link
                key={aba.caminho}
                to={caminhoDaAba(processo.id, aba)}
                aria-label={aba.rotulo}
                title={aba.rotulo}
                aria-current={ativa ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  "xl:rounded-none xl:rounded-r-lg xl:border-l-0 xl:px-2 xl:py-2.5 xl:font-ui xl:text-xs xl:font-semibold xl:uppercase xl:tracking-[0.12em] xl:[writing-mode:vertical-rl]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  ativa
                    ? "border-primary/40 bg-primary/10 text-primary dark:text-accent xl:bg-card"
                    : "border-border bg-card text-muted-foreground hover:text-foreground xl:bg-muted/60 xl:hover:bg-card",
                )}
              >
                {aba.curto}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
