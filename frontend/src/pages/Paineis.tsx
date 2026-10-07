/**
 * Painéis de exemplo (livro de registro aberto): os números numa página, um gráfico de barras
 * em CSS puro (receita 09 §13.6c, sem biblioteca) na outra. Os números vêm de useProcessosDaMesa;
 * troque o hook e as contas pelos do seu sistema (os rótulos vêm de MARCA.campos; "Arquivo" e
 * as abas "ativos/sem data" são exemplo de domínio). Visível para gestor, admin e master (navegacao.ts).
 */
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { montarAgenda, naJanela } from "@/features/agenda/montarAgenda";
import { daAba, ehEncerrado } from "@/features/processos/listaDeProcessos";
import { PROCESS_STATUS_CONFIG, SITUACOES_ENCERRADAS, getProcessStatusConfig } from "@/constants/process-status";
import { formatBRLCompacto } from "@/features/dashboard/formatos";
import { resumirPor, valorEmReais } from "@/utils/ferramentasMesa";
import { GEN, MARCA } from "@/config/marca";

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
  const { processos, isLoading, isError, refetch } = useProcessosDaMesa();

  const painel = useMemo(() => {
    const porSituacao = resumirPor(processos, (p) => getProcessStatusConfig(p.status).label);
    // Mantém a ordem do ciclo de vida (aberto → arquivado), não a do maior para o menor
    const ordem = Object.values(PROCESS_STATUS_CONFIG).map((c) => c.label);
    porSituacao.sort((a, b) => ordem.indexOf(a.rotulo) - ordem.indexOf(b.rotulo));
    return {
      porSituacao,
      maior: Math.max(1, ...porSituacao.map((l) => l.quantidade)),
      ativos: daAba(processos, "ativos").length,
      semData: daAba(processos, "sem-data").length,
      encerrados: processos.filter(ehEncerrado).length,
      prazosDaSemana: naJanela(montarAgenda(processos).compromissos, "semana").filter((c) => c.legal).length,
      valorEmAberto: daAba(processos, "ativos").reduce((soma, p) => soma + valorEmReais(p.estimated_value), 0),
    };
  }, [processos]);

  const objetos = MARCA.objeto.plural;

  return (
    <FolhaDaTela
      trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: MARCA.campos.paineisTrilha }]}
      titulo={MARCA.campos.paineisTitulo}
      subtitulo={MARCA.campos.paineisApoio}
    >
      {isLoading ? (
        <MesaCarregando texto={MARCA.campos.paineisMontando} />
      ) : isError ? (
        <MesaErroBusca
          titulo={`Não deu para montar ${MARCA.campos.paineisTrilha.toLowerCase()}`}
          texto="Não foi possível carregar agora. Nada foi perdido; tente de novo em instantes."
          onTentarDeNovo={() => refetch()}
        />
      ) : processos.length === 0 ? (
        <div className="folha-simples p-6 text-center">
          <p className="font-display text-2xl font-semibold">Nada para mostrar ainda</p>
          <p className="mt-1 text-muted-foreground">Esta tela aparece preenchida quando houver {objetos} cadastrad{GEN.fim}s.</p>
        </div>
      ) : (
        <div className="livro-aberto grid grid-cols-1 lg:grid-cols-2">
          <div className="livro-pagina livro-pagina-esq space-y-6">
            <h2 className="mb-4 font-display text-3xl font-medium">{MARCA.campos.paineisSituacao}</h2>
            <div>
              <Cartao rotulo={`Ativ${GEN.fim}s`} valor={painel.ativos} detalhe={`${formatBRLCompacto(painel.valorEmAberto)} em andamento`} para={MARCA.rotaDaLista} />
              <Cartao
                rotulo={`${MARCA.campos.prazo} nos próximos 7 dias`}
                valor={painel.prazosDaSemana}
                detalhe={`vencimentos que têm consequência (${MARCA.campos.evento.toLowerCase()} fica na agenda)`}
                para="/agenda"
                alerta={painel.prazosDaSemana > 0}
              />
              <Cartao
                rotulo={MARCA.campos.semData}
                valor={painel.semData}
                detalhe="falta a data principal para calcular os prazos"
                para={`${MARCA.rotaDaLista}?aba=sem-data`}
              />
              <Cartao rotulo={`Encerrad${GEN.fim}s`} valor={painel.encerrados} detalhe={SITUACOES_ENCERRADAS.map((s) => PROCESS_STATUS_CONFIG[s].label.toLowerCase()).join(" ou ")} para="/arquivo" />
            </div>
          </div>

          <div className="livro-pagina space-y-4">
            <h2 className="font-display text-3xl font-medium">{MARCA.campos.paineisPorSituacao}</h2>
            <ol className="space-y-2" aria-label={`${objetos} por situação: ${painel.porSituacao.map((l) => `${l.rotulo} ${l.quantidade}`).join(", ")}`}>
              {painel.porSituacao.map((l) => (
                <li key={l.rotulo} className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_2rem] items-center gap-2 text-sm">
                  <span className="truncate text-muted-foreground" title={l.rotulo}>{l.rotulo}</span>
                  <span className="h-3 rounded-sm bg-muted" aria-hidden="true">
                    <span className="block h-3 rounded-sm bg-primary dark:bg-accent" style={{ width: `${(l.quantidade / painel.maior) * 100}%` }} />
                  </span>
                  <span className="text-right font-semibold tabular-nums">{l.quantidade}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </FolhaDaTela>
  );
};

export default Paineis;
