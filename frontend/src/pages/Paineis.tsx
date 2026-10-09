import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { Label } from "@/components/ui/label";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { listarIndicadoresMunicipais, listarIndicadoresProjeto, type IndicadoresMunicipais, type IndicadoresProjeto } from "@/services/api/indicators";
import { MARCA } from "@/config/marca";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";

const Cartao: React.FC<{ rotulo: string; valor: number; detalhe: string; para?: string; alerta?: boolean }> = ({ rotulo, valor, detalhe, para, alerta }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-b border-dotted border-[hsl(var(--mesa-linha))] py-3 first:pt-0"><p className="col-start-1 font-semibold">{rotulo}</p><p className={`col-start-2 row-span-3 row-start-1 self-center text-right font-display text-4xl font-semibold leading-none lining-nums tabular-nums ${alerta ? "text-[color:var(--color-status-error)]" : ""}`}>{valor}</p><p className="col-start-1 text-sm text-muted-foreground">{detalhe}</p>{para && <Link to={para} className="col-start-1 mt-1 text-sm font-semibold text-primary hover:underline dark:text-accent">Ver<span className="sr-only"> {rotulo.toLowerCase()}</span> ›</Link>}</div>
);

const Paineis: React.FC = () => {
  const { processos, isLoading: projetosCarregando, isError: projetosComErro, refetch: recarregarProjetos } = useProcessosDaMesa();
  const [projectId, setProjectId] = useState<number | undefined>();
  const [indicadores, setIndicadores] = useState<IndicadoresProjeto | null>(null);
  const [indicadoresCarregando, setIndicadoresCarregando] = useState(false);
  const [indicadoresComErro, setIndicadoresComErro] = useState(false);
  const [municipais, setMunicipais] = useState<IndicadoresMunicipais | null>(null);
  const [municipaisComErro, setMunicipaisComErro] = useState(false);

  useEffect(() => {
    if (processos.length === 0) {
      setProjectId(undefined);
      return;
    }
    if (!projectId || !processos.some((processo) => Number(processo.id) === projectId)) setProjectId(Number(processos[0].id));
  }, [processos, projectId]);

  const carregarIndicadores = useCallback(() => {
    if (!projectId) {
      setIndicadores(null);
      setIndicadoresComErro(false);
      setIndicadoresCarregando(false);
      return Promise.resolve();
    }
    setIndicadoresCarregando(true);
    setIndicadoresComErro(false);
    return listarIndicadoresProjeto(projectId).then((resposta) => setIndicadores(resposta.record)).catch(() => setIndicadoresComErro(true)).finally(() => setIndicadoresCarregando(false));
  }, [projectId]);

  useEffect(() => { void carregarIndicadores(); }, [carregarIndicadores]);
  useEffect(() => { void listarIndicadoresMunicipais().then((resposta) => setMunicipais(resposta.record)).catch(() => setMunicipaisComErro(true)); }, []);

  const projetoSelecionado = processos.find((processo) => processo.id === projectId);
  const maiorEtapa = useMemo(() => Math.max(1, ...(indicadores?.by_stage.map((item) => item.total) ?? [])), [indicadores]);
  const objetos = MARCA.objeto.plural;


  return <FolhaDaTela trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: MARCA.campos.paineisTrilha }]} titulo={MARCA.campos.paineisTitulo} subtitulo="Contadores calculados pelo Odoo para o projeto selecionado.">
    {municipaisComErro && <p role="status" className="mb-4 text-sm text-muted-foreground">A visão municipal não está disponível neste momento; os indicadores por projeto continuam acessíveis.</p>}{municipais && <section className="folha-simples mb-6 space-y-4 border border-border p-4 md:p-6" aria-label="Resumo municipal"><div><p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">Visão municipal</p><h2 className="font-display text-3xl font-semibold">{municipais.municipio.name}</h2></div><div className="grid grid-cols-2 gap-3 md:grid-cols-5"><Cartao rotulo="Projetos" valor={municipais.projetos} detalhe="ativos" /><Cartao rotulo="Tasks" valor={municipais.total_tasks} detalhe="no município" /><Cartao rotulo="Concluídas" valor={municipais.done_tasks} detalhe={`${municipais.taxa_conclusao}% de conclusão`} /><Cartao rotulo="Atrasadas" valor={municipais.overdue_tasks} detalhe="sem conclusão" alerta={municipais.overdue_tasks > 0} /><Cartao rotulo="Demandas abertas" valor={municipais.chamados_abertos} detalhe={`${municipais.chamados} no total`} /></div>{municipais.por_secretaria.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm"><caption className="mb-2 text-left font-display text-xl font-semibold">Resumo por secretaria</caption><thead><tr className="border-b border-border"><th className="py-2 pr-3">Secretaria</th><th className="py-2 pr-3">Projetos</th><th className="py-2 pr-3">Tasks</th><th className="py-2 pr-3">Concluídas</th><th className="py-2">Atrasadas</th></tr></thead><tbody>{municipais.por_secretaria.map((item) => <tr key={String(item.secretaria_id)} className="border-b border-dotted border-border"><td className="py-2 pr-3">{item.secretaria_name}</td><td className="py-2 pr-3">{item.projetos}</td><td className="py-2 pr-3">{item.tasks}</td><td className="py-2 pr-3">{item.concluidas}</td><td className="py-2">{item.atrasadas}</td></tr>)}</tbody></table></div>}</section>}{projetosCarregando ? <MesaCarregando texto={MARCA.campos.paineisMontando} /> : projetosComErro ? <MesaErroBusca titulo={`Não deu para montar ${MARCA.campos.paineisTrilha.toLowerCase()}`} texto="Não foi possível carregar os projetos agora. Tente novamente em instantes." onTentarDeNovo={() => recarregarProjetos()} /> : processos.length === 0 ? <div className="folha-simples p-6 text-center"><p className="font-display text-2xl font-semibold">Selecione um projeto para começar</p><p className="mt-1 text-muted-foreground">Os indicadores aparecem quando houver {objetos} cadastrados.</p></div> : <div className="space-y-6"><div className="grid max-w-xl gap-2"><Label htmlFor="painel-projeto" className={ROTULO}>Projeto analisado</Label><select id="painel-projeto" value={projectId ?? ""} onChange={(event) => setProjectId(Number(event.target.value))} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Escolha um projeto</option>{processos.map((processo) => <option key={processo.id} value={processo.id}>{processo.object || `Projeto #${processo.id}`}</option>)}</select></div>{!projectId ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhum projeto selecionado</p><p className="mt-1 text-sm text-muted-foreground">Escolha um projeto acima para carregar os indicadores.</p></div> : indicadoresCarregando ? <MesaCarregando texto="Buscando indicadores no Odoo…" /> : indicadoresComErro ? <MesaErroBusca titulo="Não deu para buscar os indicadores" texto="Os contadores não foram alterados; tente novamente." onTentarDeNovo={() => void carregarIndicadores()} /> : indicadores && <div className="livro-aberto grid grid-cols-1 lg:grid-cols-2"><div className="livro-pagina livro-pagina-esq space-y-6"><div><p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">Projeto selecionado</p><h2 className="font-display text-3xl font-medium">{projetoSelecionado?.object || `Projeto #${projectId}`}</h2></div><div><Cartao rotulo="Total de tasks" valor={indicadores.total_tasks} detalhe="tasks encontradas no Kanban Odoo" para={`${MARCA.rotaDaLista}/${projectId}/kanban`} /><Cartao rotulo="Concluídas" valor={indicadores.done_tasks} detalhe="tasks em etapas encerradas" para={`${MARCA.rotaDaLista}/${projectId}/kanban`} /><Cartao rotulo="Em aberto" valor={indicadores.open_tasks} detalhe="tasks ainda não encerradas" para={`${MARCA.rotaDaLista}/${projectId}/kanban`} /><Cartao rotulo="Atrasadas" valor={indicadores.overdue_tasks} detalhe="prazo vencido sem etapa encerrada" alerta={indicadores.overdue_tasks > 0} para={`${MARCA.rotaDaLista}/${projectId}/kanban`} /></div></div><div className="livro-pagina space-y-4"><h2 className="font-display text-3xl font-medium">Tasks por etapa</h2>{indicadores.by_stage.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Este projeto ainda não tem tasks</p><p className="mt-1 text-sm text-muted-foreground">Os contadores acima permanecem em zero até uma task ser criada.</p></div> : <ol className="space-y-3" aria-label="Tasks por etapa">{indicadores.by_stage.map((item) => <li key={String(item.stage_id)} className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_2rem] items-center gap-2 text-sm"><span className="truncate text-muted-foreground" title={item.stage_name}>{item.stage_name}</span><span className="h-3 rounded-sm bg-muted" aria-hidden="true"><span className="block h-3 rounded-sm bg-primary dark:bg-accent" style={{ width: `${(item.total / maiorEtapa) * 100}%` }} /></span><span className="text-right font-semibold tabular-nums">{item.total}</span></li>)}</ol>}</div></div>}</div>}
  </FolhaDaTela>;
};

export default Paineis;
