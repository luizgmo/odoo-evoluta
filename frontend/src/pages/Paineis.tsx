import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { Label } from "@/components/ui/label";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import {
  listarIndicadoresMunicipais,
  listarIndicadoresProjeto,
  type IndicadoresMunicipais,
  type IndicadoresProjeto,
} from "@/services/api/indicators";
import { listarChamados } from "@/services/api/tickets";
import { listarPlanos5W2H } from "@/services/api/w2h";
import { listarPorques, listarRiscos, listarIshikawa } from "@/services/api/tools";
import { listarMatrizes } from "@/services/api/matrix";
import { listarStakeholders } from "@/services/api/stakeholders";
import { listarTriangulos, listarArvoresProblemas, listarTeorias } from "@/services/api/strategy";
import { listarAtividades } from "@/services/api/activities";
import { buscarKanbanProjeto } from "@/services/api/kanban";
import { formatBRL, formatBRLCompacto, dataDeAbertura } from "@/features/dashboard/formatos";
import { MARCA } from "@/config/marca";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";

/** Cartão empilhado: rótulo em cima, número à esquerda embaixo, detalhe por último.
 * O número nunca fica órfão à direita de outro cartão. */
const Cartao: React.FC<{ rotulo: string; valor: string | number; detalhe: string; para?: string; alerta?: boolean }> = ({ rotulo, valor, detalhe, para, alerta }) => (
  <div className="border-t-2 border-[hsl(var(--mesa-linha))] pt-3">
    <p className={ROTULO}>{rotulo}</p>
    <p className={`mt-1 font-display text-4xl font-semibold leading-none lining-nums tabular-nums ${alerta ? "text-[color:var(--color-status-error)]" : ""}`}>{valor}</p>
    <p className="mt-1 text-sm text-muted-foreground">{detalhe}</p>
    {para && <Link to={para} className="mt-1 inline-block text-sm font-semibold text-primary hover:underline dark:text-accent">Ver<span className="sr-only"> {rotulo.toLowerCase()}</span> ›</Link>}
  </div>
);

/** Barra horizontal com rótulo, trilha e valor. */
const Barra: React.FC<{ rotulo: string; valor: number; maximo: number; para?: string; titulo?: string }> = ({ rotulo, valor, maximo, para, titulo }) => {
  const pct = maximo > 0 ? Math.min(100, Math.round((valor / maximo) * 100)) : 0;
  const linha = (
    <span className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_2.5rem] items-center gap-2 text-sm">
      <span className="truncate text-muted-foreground" title={titulo ?? rotulo}>{rotulo}</span>
      <span className="h-3 overflow-hidden rounded-sm bg-muted" role="img" aria-label={`${rotulo}: ${valor}`}>
        <span className="block h-3 rounded-sm bg-primary dark:bg-accent" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-right font-semibold tabular-nums">{valor}</span>
    </span>
  );
  return para ? <Link to={para} className="block rounded-sm hover:bg-muted/50">{linha}</Link> : linha;
};

/** Donut de conclusão em conic-gradient com tokens atuais. */
const AnelConclusao: React.FC<{ taxa: number; concluidas: number; total: number }> = ({ taxa, concluidas, total }) => (
  <div className="flex items-center gap-4">
    <span
      className="relative inline-flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
      role="img"
      aria-label={`Taxa de conclusão: ${taxa}% (${concluidas} de ${total} tasks)`}
      style={{ background: `conic-gradient(var(--mesa-carimbo) ${Math.min(100, Math.max(0, taxa))}%, hsl(var(--muted)) 0)` }}
    >
      <span className="flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-full bg-[hsl(var(--mesa-folha))]">
        <span className="font-display text-3xl font-semibold lining-nums tabular-nums">{taxa}%</span>
      </span>
    </span>
    <span className="text-sm text-muted-foreground">{concluidas} de {total} tasks concluídas no município.</span>
  </div>
);

/** Selo de cobertura metodológica: tem (com quantidade e link) ou vazio. */
const SeloMetodo: React.FC<{ rotulo: string; total: number; para: string }> = ({ rotulo, total, para }) => (
  <Link
    to={para}
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${total > 0 ? "border-[hsl(var(--mesa-linha))] bg-muted/60" : "border-dashed border-border text-muted-foreground"}`}
    title={total > 0 ? `${total} registro(s)` : "Nenhum registro ainda"}
  >
    <span aria-hidden="true">{total > 0 ? "●" : "○"}</span>
    {rotulo}
    <span className="tabular-nums">{total}</span>
  </Link>
);


/** Sub-blocos municipais (só leitura, calculados sobre o payload do Odoo). */
const OrcamentoSecretarias: React.FC<{ processos: ReturnType<typeof useProcessosDaMesa>["processos"] }> = ({ processos }) => {
  const pares = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of processos) {
      const nome = p.projectInfo?.secretaria?.name ?? "Sem secretaria";
      mapa.set(nome, (mapa.get(nome) ?? 0) + (Number.parseFloat(p.estimated_value) || 0));
    }
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }, [processos]);
  const total = useMemo(() => pares.reduce((s, [, v]) => s + v, 0), [pares]);
  const maximo = Math.max(1, ...pares.map(([, v]) => v));
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Total empenhado: <span className="font-semibold text-foreground">{formatBRL(total)}</span></p>
      {pares.length === 0 || total <= 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum orçamento informado nos projetos.</p>
      ) : (
        <ol className="space-y-2" aria-label="Orçamento por secretaria">
          {pares.map(([nome, valor]) => (
            <li key={nome} className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto] items-center gap-2 text-sm">
              <span className="truncate text-muted-foreground" title={nome}>{nome}</span>
              <span className="h-3 overflow-hidden rounded-sm bg-muted" role="img" aria-label={`${nome}: ${formatBRL(valor)}`}>
                <span className="block h-3 rounded-sm bg-primary dark:bg-accent" style={{ width: `${Math.min(100, Math.round((valor / maximo) * 100))}%` }} />
              </span>
              <span className="text-right font-semibold tabular-nums" title={formatBRL(valor)}>{formatBRLCompacto(valor)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const FunilMunicipal: React.FC<{ byStage: Array<{ stage_name: string; total: number }> }> = ({ byStage }) => {
  const maximo = Math.max(1, ...byStage.map((i) => i.total));
  if (byStage.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-display text-xl font-semibold">Funil do município por etapa</h3>
      <ol className="grid grid-cols-1 gap-2 md:grid-cols-2" aria-label="Tasks do município por etapa">
        {byStage.map((item) => (
          <li key={item.stage_name}><Barra rotulo={item.stage_name} valor={item.total} maximo={maximo} /></li>
        ))}
      </ol>
    </div>
  );
};

const RankingProjetos: React.FC<{ itens: Array<{ id: number; name: string; taxa: number; total_tasks: number; concluidas: number; atrasadas: number }> }> = ({ itens }) => {
  if (itens.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-display text-xl font-semibold">Ranking de projetos</h3>
      <p className="text-sm text-muted-foreground">Do menor para o maior avanço. Toque para analisar.</p>
      <ol className="space-y-2" aria-label="Projetos por taxa de conclusão">
        {itens.map((item) => (
          <li key={item.id}>
            <Link to={`${MARCA.rotaDaLista}/${item.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-sm px-2 py-1 hover:bg-muted/50">
              <span className="min-w-0">
                <span className="block truncate font-semibold" title={item.name}>{item.name}</span>
                <span className="block text-xs text-muted-foreground">{item.concluidas} de {item.total_tasks} concluídas{item.atrasadas > 0 ? ` · ${item.atrasadas} atrasada(s)` : " · em dia"}</span>
                <span className="mt-1 block h-2 overflow-hidden rounded-sm bg-muted" role="img" aria-label={`${item.name}: ${item.taxa}% concluído`}>
                  <span className="block h-2 rounded-sm bg-primary dark:bg-accent" style={{ width: `${Math.min(100, Math.max(0, item.taxa))}%` }} />
                </span>
              </span>
              <span className="font-display text-2xl font-semibold tabular-nums">{item.taxa}%</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
};

const AtencaoImediata: React.FC<{ itens: Array<{ task_id: number; task_name: string; project_name: string; dias_atraso: number }> }> = ({ itens }) => {
  if (itens.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-display text-xl font-semibold">Atenção imediata</h3>
      <p className="text-sm text-muted-foreground">As 5 tasks mais atrasadas do município.</p>
      <ol className="divide-y divide-dotted divide-border" aria-label="Tasks mais atrasadas">
        {itens.map((item) => (
          <li key={item.task_id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <span className="min-w-0">
              <span className="block truncate font-semibold" title={item.task_name}>{item.task_name}</span>
              <span className="block truncate text-xs text-muted-foreground" title={item.project_name}>{item.project_name}</span>
            </span>
            <span className="mesa-secao tinta-carmim" role="img" aria-label={`${item.dias_atraso} dias de atraso`}>{item.dias_atraso}d de atraso</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

const TabelaSecretarias: React.FC<{ itens: IndicadoresMunicipais["por_secretaria"] }> = ({ itens }) => {
  const taxas = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const item of itens) {
      const total = item.tasks || 0;
      mapa.set(item.secretaria_name, total > 0 ? (item.concluidas / total) * 100 : 0);
    }
    return mapa;
  }, [itens]);
  if (itens.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-display text-xl font-semibold">Resumo por secretaria</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Secretaria</th>
              <th className="py-2 pr-3">Projetos</th>
              <th className="py-2 pr-3">Tasks</th>
              <th className="py-2 pr-3">Concluídas</th>
              <th className="py-2 pr-3">Atrasadas</th>
              <th className="py-2">Avanço</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => {
              const taxa = Math.round(taxas.get(item.secretaria_name) ?? 0);
              return (
                <tr key={String(item.secretaria_id)} className="border-b border-dotted border-border">
                  <td className="py-2 pr-3">{item.secretaria_name}</td>
                  <td className="py-2 pr-3 tabular-nums">{item.projetos}</td>
                  <td className="py-2 pr-3 tabular-nums">{item.tasks}</td>
                  <td className="py-2 pr-3 tabular-nums">{item.concluidas}</td>
                  <td className="py-2 pr-3 tabular-nums">{item.atrasadas}</td>
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-20 overflow-hidden rounded-sm bg-muted" role="img" aria-label={`${item.secretaria_name}: ${taxa}% concluído`}>
                        <span className="block h-2 rounded-sm bg-primary dark:bg-accent" style={{ width: `${Math.min(100, Math.max(0, taxa))}%` }} />
                      </span>
                      <span className="tabular-nums">{taxa}%</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface RaioXContagens {
  w2h: number; porques: number; ishikawa: number; matriz: number; riscos: number;
  triangulos: number; arvores: number; teorias: number; stakeholders: number;
  raci: number; atividades: number;
}

interface FichaProjeto {
  secretaria: string; responsavel: string; prazo: string | null; orcamento: number; etapa: string;
}

const SeletorProjeto: React.FC<{
  processos: ReturnType<typeof useProcessosDaMesa>["processos"];
  projectId: number | undefined;
  aoEscolher: (id: number) => void;
  projetosCarregando: boolean; projetosComErro: boolean;
  aoRecarregar: () => void; objetos: string;
  indicadores: IndicadoresProjeto | null; indicadoresCarregando: boolean; indicadoresComErro: boolean;
  aoRecarregarIndicadores: () => void;
  projetoSelecionadoNome: string; maiorEtapa: number;
  ficha: FichaProjeto | null; raioX: RaioXContagens; raioXCarregando: boolean;
  matrizVencedora: string; raciNomes: string[];
  diasParaPrazo: (iso: string | null) => number | null;
}> = (props) => {
  const {
    processos, projectId, aoEscolher, projetosCarregando, projetosComErro, aoRecarregar, objetos,
    indicadores, indicadoresCarregando, indicadoresComErro, aoRecarregarIndicadores,
    projetoSelecionadoNome, maiorEtapa, ficha, raioX, raioXCarregando,
    matrizVencedora, raciNomes, diasParaPrazo,
  } = props;
  if (projetosCarregando) return <MesaCarregando texto={MARCA.campos.paineisMontando} />;
  if (projetosComErro) {
    return (
      <MesaErroBusca
        titulo={`Não deu para montar ${MARCA.campos.paineisTrilha.toLowerCase()}`}
        texto="Não foi possível carregar os projetos agora. Tente novamente em instantes."
        onTentarDeNovo={aoRecarregar}
      />
    );
  }
  if (processos.length === 0) {
    return (
      <div className="folha-simples p-6 text-center">
        <p className="font-display text-2xl font-semibold">Selecione um projeto para começar</p>
        <p className="mt-1 text-muted-foreground">Os indicadores aparecem quando houver {objetos} cadastrados.</p>
      </div>
    );
  }
  const dias = diasParaPrazo(ficha?.prazo ?? null);
  const prazoTexto = !ficha?.prazo
    ? "Sem prazo definido"
    : dias === null ? dataDeAbertura(ficha.prazo)
    : dias < 0 ? `${dataDeAbertura(ficha.prazo)} · vencido há ${Math.abs(dias)}d`
    : dias === 0 ? `${dataDeAbertura(ficha.prazo)} · vence hoje`
    : `${dataDeAbertura(ficha.prazo)} · faltam ${dias}d`;
  return (
    <div className="space-y-6">
      <div className="grid max-w-xl gap-2">
        <Label htmlFor="painel-projeto" className={ROTULO}>Projeto analisado</Label>
        <select
          id="painel-projeto"
          value={projectId ?? ""}
          onChange={(event) => aoEscolher(Number(event.target.value))}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Escolha um projeto</option>
          {processos.map((processo) => (
            <option key={processo.id} value={processo.id}>{processo.object || `Projeto #${processo.id}`}</option>
          ))}
        </select>
      </div>
      {!projectId ? (
        <div className="folha-simples border border-dashed border-border p-5">
          <p className="mesa-secao tinta-ocre">Nenhum projeto selecionado</p>
          <p className="mt-1 text-sm text-muted-foreground">Escolha um projeto acima para carregar o raio-X.</p>
        </div>
      ) : indicadoresCarregando ? (
        <MesaCarregando texto="Buscando indicadores no Odoo…" />
      ) : indicadoresComErro || !indicadores ? (
        <MesaErroBusca
          titulo="Não deu para buscar os indicadores"
          texto="Os contadores não foram alterados; tente novamente."
          onTentarDeNovo={aoRecarregarIndicadores}
        />
      ) : (
        <section className="folha-simples space-y-6 border border-border p-4 md:p-6" aria-label={`Raio-X de ${projetoSelecionadoNome}`}>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">Raio-X do projeto</p>
            <h2 className="font-display text-3xl font-semibold">{projetoSelecionadoNome}</h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-4">
            <div><dt className={ROTULO}>Secretaria</dt><dd className="mt-1 font-semibold">{ficha?.secretaria || "—"}</dd></div>
            <div><dt className={ROTULO}>Responsável</dt><dd className="mt-1 font-semibold">{ficha?.responsavel || "—"}</dd></div>
            <div><dt className={ROTULO}>Prazo</dt><dd className="mt-1 font-semibold">{prazoTexto}</dd></div>
            <div><dt className={ROTULO}>Orçamento</dt><dd className="mt-1 font-semibold tabular-nums" title={ficha ? formatBRL(ficha.orcamento) : ""}>{ficha ? formatBRLCompacto(ficha.orcamento) : "—"}</dd></div>
          </dl>
          <div className="space-y-3">
            <h3 className="font-display text-xl font-semibold">Funil por etapa</h3>
            {indicadores.by_stage.length === 0 ? (
              <p className="text-sm text-muted-foreground">Este projeto ainda não tem tasks.</p>
            ) : (
              <ol className="space-y-2" aria-label="Tasks do projeto por etapa">
                {indicadores.by_stage.map((item) => (
                  <li key={String(item.stage_id)}>
                    <Barra rotulo={item.stage_name} valor={item.total} maximo={maiorEtapa} para={`${MARCA.rotaDaLista}/${projectId}/kanban`} />
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-xl font-semibold">Cobertura metodológica</h3>
            {raioXCarregando ? (
              <p className="text-sm text-muted-foreground">Conferindo ferramentas no Odoo…</p>
            ) : (
              <div className="flex flex-wrap gap-2" aria-label="Ferramentas do projeto">
                <SeloMetodo rotulo="5W2H" total={raioX.w2h} para={`${MARCA.rotaDaLista}/${projectId}/w2h`} />
                <SeloMetodo rotulo="5 Porquês" total={raioX.porques} para={`${MARCA.rotaDaLista}/${projectId}/porques`} />
                <SeloMetodo rotulo="Ishikawa" total={raioX.ishikawa} para={`${MARCA.rotaDaLista}/${projectId}/ishikawa`} />
                <SeloMetodo rotulo="Matriz" total={raioX.matriz} para={`${MARCA.rotaDaLista}/${projectId}/matriz`} />
                <SeloMetodo rotulo="Riscos" total={raioX.riscos} para={`${MARCA.rotaDaLista}/${projectId}/riscos`} />
                <SeloMetodo rotulo="RACI" total={raioX.raci} para={`${MARCA.rotaDaLista}/${projectId}/raci`} />
                <SeloMetodo rotulo="Estratégia" total={raioX.triangulos + raioX.arvores + raioX.teorias} para={`${MARCA.rotaDaLista}/${projectId}/estrategia`} />
                <SeloMetodo rotulo="Stakeholders" total={raioX.stakeholders} para={`${MARCA.rotaDaLista}/${projectId}/stakeholders`} />
                <SeloMetodo rotulo="Atividades" total={raioX.atividades} para={`${MARCA.rotaDaLista}/${projectId}/atividades`} />
              </div>
            )}
            {matrizVencedora ? (
              <p className="text-sm text-muted-foreground">Decisão vigente: <span className="font-semibold text-foreground">{matrizVencedora}</span></p>
            ) : null}
            {raciNomes.length > 0 ? (
              <p className="text-sm text-muted-foreground">RACI em: {raciNomes.join(" · ")}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`${MARCA.rotaDaLista}/${projectId}/kanban`} className="text-sm font-semibold text-primary hover:underline dark:text-accent">Abrir Kanban ›</Link>
            <Link to={`${MARCA.rotaDaLista}/${projectId}`} className="text-sm font-semibold text-primary hover:underline dark:text-accent">Abrir pasta ›</Link>
          </div>
        </section>
      )}
    </div>
  );
};

const Paineis: React.FC = () => {
  const { processos, isLoading: projetosCarregando, isError: projetosComErro, refetch: recarregarProjetos } = useProcessosDaMesa();
  const [projectId, setProjectId] = useState<number | undefined>();
  const [indicadores, setIndicadores] = useState<IndicadoresProjeto | null>(null);
  const [indicadoresCarregando, setIndicadoresCarregando] = useState(false);
  const [indicadoresComErro, setIndicadoresComErro] = useState(false);
  const [municipais, setMunicipais] = useState<IndicadoresMunicipais | null>(null);
  const [municipaisCarregando, setMunicipaisCarregando] = useState(true);
  const [municipaisComErro, setMunicipaisComErro] = useState(false);
  const [chamadosFechados, setChamadosFechados] = useState<number | null>(null);
  // Raio-X do projeto: contagens por ferramenta + atividades + ficha.
  const [raioX, setRaioX] = useState({
    w2h: 0, porques: 0, ishikawa: 0, matriz: 0, riscos: 0, triangulos: 0,
    arvores: 0, teorias: 0, stakeholders: 0, raci: 0, atividades: 0,
  });
  const [raciNomes, setRaciNomes] = useState<string[]>([]);
  const [matrizVencedora, setMatrizVencedora] = useState<string>("");
  const [ficha, setFicha] = useState<{ secretaria: string; responsavel: string; prazo: string | null; orcamento: number; etapa: string } | null>(null);
  const [raioXCarregando, setRaioXCarregando] = useState(false);

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
  useEffect(() => {
    setMunicipaisCarregando(true);
    setMunicipaisComErro(false);
    listarIndicadoresMunicipais()
      .then((resposta) => setMunicipais(resposta.record))
      .catch(() => setMunicipaisComErro(true))
      .finally(() => setMunicipaisCarregando(false));
    listarChamados()
      .then((resposta) => setChamadosFechados(resposta.records.filter((c) => c.situacao_key === "done" || c.situacao_key === "closed").length))
      .catch(() => setChamadosFechados(null));
  }, []);

  // Carrega o raio-X sempre que o projeto analisado muda (chamadas em paralelo, só leitura).
  useEffect(() => {
    if (!projectId) {
      setFicha(null);
      return;
    }
    let vivo = true;
    setRaioXCarregando(true);
    const pid = projectId;
    Promise.allSettled([
      listarPlanos5W2H(pid), listarPorques(pid), listarIshikawa(pid), listarMatrizes(pid),
      listarRiscos(pid), listarTriangulos(pid), listarArvoresProblemas(pid), listarTeorias(pid),
      listarStakeholders(pid), listarAtividades(pid), buscarKanbanProjeto(pid),
    ]).then((resultados) => {
      if (!vivo) return;
      const total = (r: PromiseSettledResult<{ records: unknown[] }>) =>
        r.status === "fulfilled" && Array.isArray(r.value.records) ? r.value.records.length : 0;
      const [w2h, porques, ishikawa, matrizes, riscos, triangulos, arvores, teorias, stakeholders, atividades, kanban] = resultados;
      const matrizLista = matrizes.status === "fulfilled" ? (matrizes.value.records as Array<{ vencedor_name?: string }>) : [];
      const vencedora = matrizLista.find((m) => m.vencedor_name)?.vencedor_name ?? "";
      setMatrizVencedora(vencedora);
      // RACI é por task: conta nas tasks do kanban.
      const kanbanRec = kanban.status === "fulfilled" ? kanban.value.record : undefined;
      const taskIds = kanbanRec?.tasks.map((t) => t.id) ?? [];
      setRaciNomes([]);
      setRaioX({
        w2h: total(w2h), porques: total(porques), ishikawa: total(ishikawa),
        matriz: total(matrizes), riscos: total(riscos), triangulos: total(triangulos),
        arvores: total(arvores), teorias: total(teorias), stakeholders: total(stakeholders),
        raci: 0, atividades: total(atividades),
      });
      // Ficha vem do processo já carregado (lista); prazo/orçamento do detalhe abaixo.
      const proc = processos.find((p) => Number(p.id) === pid);
      setFicha({
        secretaria: proc?.projectInfo?.secretaria?.name ?? "",
        responsavel: proc?.responsible ?? "",
        prazo: proc?.projectInfo?.date_deadline ?? null,
        orcamento: Number.parseFloat(proc?.estimated_value ?? "0") || 0,
        etapa: "",
      });
      // Conta RACI por task em paralelo (falha silenciosa mantém 0).
      if (taskIds.length > 0) {
        void Promise.allSettled(taskIds.slice(0, 12).map((tid) =>
          import("@/services/api/tools").then((m) => m.listarRaci(tid)),
        )).then((rr) => {
          if (!vivo) return;
          let n = 0;
          const nomes: string[] = [];
          for (const r of rr) {
            if (r.status === "fulfilled") {
              n += r.value.records.length;
              for (const rec of r.value.records.slice(0, 2)) nomes.push(rec.task_name);
            }
          }
          setRaioX((atual) => ({ ...atual, raci: n }));
          setRaciNomes(nomes.slice(0, 3));
        });
      }
      // `finally` abaixo desliga o carregando; sem duplicação aqui.
    }).finally(() => { if (vivo) setRaioXCarregando(false); });
    return () => { vivo = false; };
  }, [projectId, processos]);

  const diasParaPrazo = (iso: string | null): number | null => {
    if (!iso) return null;
    const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    const base = soData ? new Date(Number(soData[1]), Number(soData[2]) - 1, Number(soData[3])) : new Date(iso);
    if (Number.isNaN(base.getTime())) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return Math.round((base.getTime() - hoje.getTime()) / 86_400_000);
  };

  const objetos = MARCA.objeto.plural;
  const projetoSelecionado = projectId
    ? processos.find((processo) => Number(processo.id) === projectId)
    : undefined;
  const maiorEtapa = Math.max(1, ...(indicadores?.by_stage ?? []).map((item) => item.total));

  return <FolhaDaTela trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: MARCA.campos.paineisTrilha }]} titulo={MARCA.campos.paineisTitulo} subtitulo="Visão municipal agregada pelo Odoo e raio-X do projeto selecionado.">
    {municipaisCarregando ? <MesaCarregando texto="Buscando indicadores no Odoo…" /> : municipaisComErro ? (
      <MesaErroBusca
        titulo="Não deu para buscar a visão municipal"
        texto="Tente novamente em instantes."
        onTentarDeNovo={() => {
          setMunicipaisCarregando(true);
          setMunicipaisComErro(false);
          listarIndicadoresMunicipais().then((r) => setMunicipais(r.record)).catch(() => setMunicipaisComErro(true)).finally(() => setMunicipaisCarregando(false));
        }}
      />
    ) : municipais && (
      <section className="folha-simples space-y-6 border border-border p-4 md:p-6" aria-label="Visão municipal">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">Visão municipal</p>
          <h2 className="font-display text-3xl font-semibold">{municipais.municipio.name}</h2>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 xl:grid-cols-5">
          <Cartao rotulo="Projetos" valor={municipais.projetos} detalhe="ativos no município" />
          <Cartao rotulo="Tasks" valor={municipais.total_tasks} detalhe="no Kanban do município" />
          <Cartao rotulo="Concluídas" valor={municipais.done_tasks} detalhe={`${municipais.taxa_conclusao}% de conclusão`} />
          <Cartao rotulo="Atrasadas" valor={municipais.overdue_tasks} detalhe="prazo vencido, sem concluir" alerta={municipais.overdue_tasks > 0} />
          <Cartao rotulo="Demandas" valor={municipais.chamados_abertos} detalhe={chamadosFechados === null ? `${municipais.chamados} no total` : `${chamadosFechados} concluídas de ${municipais.chamados}`} para="/chamados" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-display text-xl font-semibold">Conclusão geral</h3>
            <AnelConclusao taxa={municipais.taxa_conclusao} concluidas={municipais.done_tasks} total={municipais.total_tasks} />
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-xl font-semibold">Orçamento por secretaria</h3>
            <OrcamentoSecretarias processos={processos} />
          </div>
        </div>
        <FunilMunicipal byStage={municipais.by_stage ?? []} />
        <RankingProjetos itens={municipais.projetos_resumo ?? []} />
        <AtencaoImediata itens={municipais.top_atrasadas ?? []} />
        <TabelaSecretarias itens={municipais.por_secretaria} />
      </section>
    )}<SeletorProjeto
      processos={processos} projectId={projectId} aoEscolher={setProjectId}
      projetosCarregando={projetosCarregando} projetosComErro={projetosComErro}
      aoRecarregar={recarregarProjetos} objetos={objetos}
      indicadores={indicadores} indicadoresCarregando={indicadoresCarregando} indicadoresComErro={indicadoresComErro}
      aoRecarregarIndicadores={() => void carregarIndicadores()}
      projetoSelecionadoNome={projetoSelecionado?.object || (projectId ? `Projeto #${projectId}` : "")}
      maiorEtapa={maiorEtapa} ficha={ficha} raioX={raioX} raioXCarregando={raioXCarregando}
      matrizVencedora={matrizVencedora} raciNomes={raciNomes} diasParaPrazo={diasParaPrazo}
    />
  </FolhaDaTela>;
};

export default Paineis;
