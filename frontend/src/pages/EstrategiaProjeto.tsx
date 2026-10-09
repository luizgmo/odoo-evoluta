import React, { useCallback, useEffect, useState } from "react";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  converterArvoreProblemas,
  gerarPlanoArvoreObjetivos,
  criarArvoreProblemas,
  criarTeoria,
  atualizarTeoria,
  arquivarTeoria,
  criarTriangulo,
  atualizarTriangulo,
  arquivarTriangulo,
  atualizarArvoreProblemas,
  arquivarArvoreProblemas,
  listarArvoresProblemas,
  listarTeorias,
  listarTriangulos,
  type ArvoreProblemas,
  type NovaArvoreProblemas,
  type NovaTeoriaMudanca,
  type NovaTriangulo,
  type TeoriaMudanca,
  type Triangulo,
} from "@/services/api/strategy";
import { useParams } from "react-router-dom";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const TRILHA = [{ rotulo: "Projetos" }, { rotulo: "Ferramenta" }, { rotulo: "Estratégia" }];

type AbaEstrategia = "triangulo" | "arvore" | "teoria";

const Campo: React.FC<{ rotulo: string; htmlFor: string; children: React.ReactNode }> = ({ rotulo, htmlFor, children }) => (
  <div className="grid gap-2">
    <Label htmlFor={htmlFor} className={ROTULO}>{rotulo}</Label>
    {children}
  </div>
);

const erroDa = (error: unknown, padrao: string) => error instanceof Error ? error.message : padrao;

const TrianguloSection: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [records, setRecords] = useState<Triangulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [form, setForm] = useState<NovaTriangulo>({ project_id: projectId, name: "", valor_publico: "", legitimidade: "", capacidade: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const { avisar } = useAvisoDeResultado();

  const carregar = useCallback(() => {
    setLoading(true);
    setErroBusca(false);
    return listarTriangulos(projectId).then((resposta) => setRecords(resposta.records)).catch(() => setErroBusca(true)).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { void carregar(); }, [carregar]);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    if (![form.valor_publico, form.legitimidade, form.capacidade].every((valor) => valor.trim())) {
      setErro("Preencha valor público, legitimidade e capacidade operacional.");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const resposta = editandoId ? await atualizarTriangulo(editandoId, { ...form }) : await criarTriangulo({ ...form, project_id: projectId });
      await carregar();
      setForm({ project_id: projectId, name: "", valor_publico: "", legitimidade: "", capacidade: "" }); setEditandoId(null);
      avisar({ texto: `Triângulo “${resposta.record.name}” foi ${editandoId ? "atualizado" : "salvo"} no projeto.` });
    } catch (error) {
      setErro(erroDa(error, "Não foi possível salvar o triângulo estratégico."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-5">
      {loading ? <MesaCarregando texto="Buscando os triângulos estratégicos…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar os triângulos" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? (
        <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhum triângulo cadastrado</p><p className="mt-1 text-sm text-muted-foreground">Registre como o projeto cria valor, obtém apoio e atua.</p></div>
      ) : (
        <ul className="space-y-3" aria-label="Triângulos estratégicos">
          {records.map((record) => <li key={record.id} className="folha-simples space-y-4 border border-border p-4"><h2 className="font-display text-2xl font-semibold">{record.name}</h2><dl className="grid gap-4 md:grid-cols-3"><div><dt className={ROTULO}>Valor público</dt><dd className="mt-1 text-sm">{record.valor_publico}</dd></div><div><dt className={ROTULO}>Legitimidade e apoio</dt><dd className="mt-1 text-sm">{record.legitimidade}</dd></div><div><dt className={ROTULO}>Capacidade operacional</dt><dd className="mt-1 text-sm">{record.capacidade}</dd></div></dl><div className="flex flex-wrap gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => { setEditandoId(record.id); setForm({ project_id: projectId, name: record.name, valor_publico: record.valor_publico, legitimidade: record.legitimidade, capacidade: record.capacidade }); }}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (!window.confirm("Arquivar este triângulo?")) return; try { await arquivarTriangulo(record.id); await carregar(); avisar({ texto: "Triângulo arquivado." }); } catch (error) { setErro(erroDa(error, "Não foi possível arquivar o triângulo.")); } }}>Arquivar</Button></div></li>)}
        </ul>
      )}
      <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6">
        <div><h2 className="font-display text-2xl font-semibold">{editandoId ? "Editar triângulo estratégico" : "Novo triângulo estratégico"}</h2><p className="mt-1 text-sm text-muted-foreground">Os três campos são obrigatórios no Odoo.</p></div>
        <Campo rotulo="Nome da análise" htmlFor="triangulo-name"><Input id="triangulo-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Estratégia 2026" /></Campo>
        <div className="grid gap-4 md:grid-cols-3"><Campo rotulo="Valor público" htmlFor="triangulo-valor"><Textarea id="triangulo-valor" rows={4} value={form.valor_publico} onChange={(event) => setForm({ ...form, valor_publico: event.target.value })} required /></Campo><Campo rotulo="Legitimidade e apoio" htmlFor="triangulo-legitimidade"><Textarea id="triangulo-legitimidade" rows={4} value={form.legitimidade} onChange={(event) => setForm({ ...form, legitimidade: event.target.value })} required /></Campo><Campo rotulo="Capacidade operacional" htmlFor="triangulo-capacidade"><Textarea id="triangulo-capacidade" rows={4} value={form.capacidade} onChange={(event) => setForm({ ...form, capacidade: event.target.value })} required /></Campo></div>
        <div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editandoId ? "Salvar alterações" : "Salvar triângulo"}</Button>{editandoId && <Button type="button" variant="ghost" onClick={() => { setEditandoId(null); setForm({ project_id: projectId, name: "", valor_publico: "", legitimidade: "", capacidade: "" }); }}>Cancelar</Button>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div>
      </form>
    </div>
  );
};

const ARVORE_VAZIA = (projectId: number): NovaArvoreProblemas => ({ project_id: projectId, name: "", causas: "", problema_central: "", efeitos: "" });

const ArvoreSection: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [records, setRecords] = useState<ArvoreProblemas[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [form, setForm] = useState<NovaArvoreProblemas>(ARVORE_VAZIA(projectId));
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [convertendoId, setConvertendoId] = useState<number | null>(null);
  const [gerandoPlanoId, setGerandoPlanoId] = useState<number | null>(null);
  const { avisar } = useAvisoDeResultado();

  const carregar = useCallback(() => {
    setLoading(true);
    setErroBusca(false);
    return listarArvoresProblemas(projectId).then((resposta) => setRecords(resposta.records)).catch(() => setErroBusca(true)).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { void carregar(); }, [carregar]);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    if (!form.problema_central.trim()) {
      setErro("Informe o problema central antes de salvar.");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const resposta = editandoId ? await atualizarArvoreProblemas(editandoId, { ...form }) : await criarArvoreProblemas({ ...form, project_id: projectId });
      await carregar();
      setForm(ARVORE_VAZIA(projectId)); setEditandoId(null);
      avisar({ texto: `Árvore “${resposta.record.name}” foi ${editandoId ? "atualizada" : "salva"} no projeto.` });
    } catch (error) {
      setErro(erroDa(error, "Não foi possível salvar a árvore de problemas."));
    } finally {
      setEnviando(false);
    }
  };

  const gerarPlano = async (record: ArvoreProblemas) => {
    if (!record.objetivo || gerandoPlanoId) return;
    setErro(null); setGerandoPlanoId(record.objetivo.id);
    try { await gerarPlanoArvoreObjetivos(record.objetivo.id); await carregar(); avisar({ texto: "Ação 5W2H criada a partir da árvore de objetivos. Revise e solicite a validação." }); }
    catch (error) { setErro(erroDa(error, "Não foi possível gerar a ação 5W2H.")); }
    finally { setGerandoPlanoId(null); }
  };

  const converter = async (record: ArvoreProblemas) => {
    if (convertendoId) return;
    setErro(null);
    setConvertendoId(record.id);
    try {
      await converterArvoreProblemas(record.id);
      await carregar();
      avisar({ texto: "Árvore de objetivos criada ou recuperada sem duplicata." });
    } catch (error) {
      setErro(erroDa(error, "Não foi possível converter a árvore em objetivos."));
    } finally {
      setConvertendoId(null);
    }
  };

  return (
    <div className="space-y-5">
      {loading ? <MesaCarregando texto="Buscando as árvores de problemas…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar as árvores" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? (
        <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhuma árvore cadastrada</p><p className="mt-1 text-sm text-muted-foreground">Registre o problema central, suas causas e seus efeitos.</p></div>
      ) : (
        <ul className="space-y-3" aria-label="Árvores de problemas">
          {records.map((record) => <li key={record.id} className="folha-simples space-y-4 border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-2xl font-semibold">{record.name}</h2><p className="mt-1 text-sm"><strong>Problema central:</strong> {record.problema_central}</p></div>{record.objetivo && <span className="rounded border border-border px-2 py-1 font-mono text-xs uppercase tracking-[0.08em]">Objetivos convertidos</span>}</div><dl className="grid gap-4 md:grid-cols-2"><div><dt className={ROTULO}>Causas</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{record.causas || "Não informado"}</dd></div><div><dt className={ROTULO}>Efeitos</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{record.efeitos || "Não informado"}</dd></div></dl>{record.objetivo ? <div className="border-t border-dotted border-border pt-3 text-sm"><p><strong>Objetivo central:</strong> {record.objetivo.objetivo_central}</p>{record.objetivo.task_id && <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Ação #{record.objetivo.task_id}</p>}{record.objetivo.five_w2h_id ? <p className="mt-2 text-muted-foreground">5W2H #{record.objetivo.five_w2h_id} criado; abra a aba 5W2H para preencher, validar e gerar a task.</p> : <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => void gerarPlano(record)} disabled={gerandoPlanoId === record.objetivo.id}>{gerandoPlanoId === record.objetivo.id ? "Gerando ação…" : "Gerar ação 5W2H"}</Button>}</div> : <Button type="button" variant="outline" size="sm" onClick={() => void converter(record)} disabled={convertendoId === record.id}>{convertendoId === record.id ? "Convertendo…" : "Converter em objetivos"}</Button>}<div className="flex flex-wrap gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => { setEditandoId(record.id); setForm({ project_id: projectId, name: record.name, causas: record.causas, problema_central: record.problema_central, efeitos: record.efeitos }); }}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (!window.confirm("Arquivar esta árvore?")) return; try { await arquivarArvoreProblemas(record.id); await carregar(); avisar({ texto: "Árvore arquivada." }); } catch (error) { setErro(erroDa(error, "Não foi possível arquivar a árvore.")); } }}>Arquivar</Button></div></li>)}
        </ul>
      )}
      <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6">
        <div><h2 className="font-display text-2xl font-semibold">{editandoId ? "Editar árvore de problemas" : "Nova árvore de problemas"}</h2><p className="mt-1 text-sm text-muted-foreground">A conversão para objetivos reaproveita os dados desta árvore.</p></div>
        <Campo rotulo="Nome da árvore" htmlFor="arvore-name"><Input id="arvore-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Diagnóstico territorial" /></Campo>
        <Campo rotulo="Problema central" htmlFor="arvore-problema"><Textarea id="arvore-problema" rows={3} value={form.problema_central} onChange={(event) => setForm({ ...form, problema_central: event.target.value })} required /></Campo>
        <div className="grid gap-4 md:grid-cols-2"><Campo rotulo="Causas" htmlFor="arvore-causas"><Textarea id="arvore-causas" rows={4} value={form.causas} onChange={(event) => setForm({ ...form, causas: event.target.value })} placeholder="Uma causa por linha" /></Campo><Campo rotulo="Efeitos" htmlFor="arvore-efeitos"><Textarea id="arvore-efeitos" rows={4} value={form.efeitos} onChange={(event) => setForm({ ...form, efeitos: event.target.value })} placeholder="Um efeito por linha" /></Campo></div>
        <div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editandoId ? "Salvar alterações" : "Salvar árvore"}</Button>{editandoId && <Button type="button" variant="ghost" onClick={() => { setEditandoId(null); setForm(ARVORE_VAZIA(projectId)); }}>Cancelar</Button>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div>
      </form>
    </div>
  );
};

const TEORIA_VAZIA = (projectId: number): NovaTeoriaMudanca => ({ project_id: projectId, name: "", contexto: "", insumos: "", atividades: "", produtos: "", resultados: "" });

const TeoriaSection: React.FC<{ projectId: number }> = ({ projectId }) => {
  const [records, setRecords] = useState<TeoriaMudanca[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [form, setForm] = useState<NovaTeoriaMudanca>(TEORIA_VAZIA(projectId));
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const { avisar } = useAvisoDeResultado();

  const carregar = useCallback(() => {
    setLoading(true);
    setErroBusca(false);
    return listarTeorias(projectId).then((resposta) => setRecords(resposta.records)).catch(() => setErroBusca(true)).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { void carregar(); }, [carregar]);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      const resposta = editandoId ? await atualizarTeoria(editandoId, { ...form }) : await criarTeoria({ ...form, project_id: projectId });
      await carregar();
      setForm(TEORIA_VAZIA(projectId)); setEditandoId(null);
      avisar({ texto: `Teoria “${resposta.record.name}” foi ${editandoId ? "atualizada" : "salva"} no projeto.` });
    } catch (error) {
      setErro(erroDa(error, "Não foi possível salvar a teoria da mudança."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-5">
      {loading ? <MesaCarregando texto="Buscando as teorias da mudança…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar as teorias" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? (
        <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhuma teoria cadastrada</p><p className="mt-1 text-sm text-muted-foreground">Descreva a cadeia de transformação esperada para o projeto.</p></div>
      ) : (
        <ul className="space-y-3" aria-label="Teorias da mudança">
          {records.map((record) => <li key={record.id} className="folha-simples space-y-4 border border-border p-4"><h2 className="font-display text-2xl font-semibold">{record.name}</h2><dl className="grid gap-4 md:grid-cols-2">{[["Contexto", record.contexto], ["Insumos", record.insumos], ["Atividades", record.atividades], ["Produtos", record.produtos], ["Resultados", record.resultados]].map(([rotulo, valor]) => <div key={rotulo}><dt className={ROTULO}>{rotulo}</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{valor || "Não informado"}</dd></div>)}</dl><div className="flex flex-wrap gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => { setEditandoId(record.id); setForm({ project_id: projectId, name: record.name, contexto: record.contexto, insumos: record.insumos, atividades: record.atividades, produtos: record.produtos, resultados: record.resultados }); }}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (!window.confirm("Arquivar esta teoria?")) return; try { await arquivarTeoria(record.id); await carregar(); avisar({ texto: "Teoria arquivada." }); } catch (error) { setErro(erroDa(error, "Não foi possível arquivar a teoria.")); } }}>Arquivar</Button></div></li>)}
        </ul>
      )}
      <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6">
        <div><h2 className="font-display text-2xl font-semibold">{editandoId ? "Editar teoria da mudança" : "Nova teoria da mudança"}</h2><p className="mt-1 text-sm text-muted-foreground">Organize contexto, recursos, execução, entregas e resultados.</p></div>
        <Campo rotulo="Nome da teoria" htmlFor="teoria-name"><Input id="teoria-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Teoria da mudança do projeto" /></Campo>
        <div className="grid gap-4 md:grid-cols-2"><Campo rotulo="Contexto" htmlFor="teoria-contexto"><Textarea id="teoria-contexto" rows={4} value={form.contexto} onChange={(event) => setForm({ ...form, contexto: event.target.value })} /></Campo><Campo rotulo="Insumos" htmlFor="teoria-insumos"><Textarea id="teoria-insumos" rows={4} value={form.insumos} onChange={(event) => setForm({ ...form, insumos: event.target.value })} /></Campo><Campo rotulo="Atividades" htmlFor="teoria-atividades"><Textarea id="teoria-atividades" rows={4} value={form.atividades} onChange={(event) => setForm({ ...form, atividades: event.target.value })} /></Campo><Campo rotulo="Produtos" htmlFor="teoria-produtos"><Textarea id="teoria-produtos" rows={4} value={form.produtos} onChange={(event) => setForm({ ...form, produtos: event.target.value })} /></Campo></div><Campo rotulo="Resultados" htmlFor="teoria-resultados"><Textarea id="teoria-resultados" rows={4} value={form.resultados} onChange={(event) => setForm({ ...form, resultados: event.target.value })} /></Campo>
        <div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editandoId ? "Salvar alterações" : "Salvar teoria"}</Button>{editandoId && <Button type="button" variant="ghost" onClick={() => { setEditandoId(null); setForm(TEORIA_VAZIA(projectId)); }}>Cancelar</Button>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div>
      </form>
    </div>
  );
};

export const EstrategiaProjeto: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const [aba, setAba] = useState<AbaEstrategia>("triangulo");
  const abas: Array<{ id: AbaEstrategia; rotulo: string }> = [{ id: "triangulo", rotulo: "Triângulo" }, { id: "arvore", rotulo: "Árvore de problemas" }, { id: "teoria", rotulo: "Teoria da mudança" }];

  return (
    <FolhaDaTela trilha={TRILHA} titulo="Estratégia" subtitulo="Registre escolhas estratégicas, problemas e a cadeia de mudança do projeto.">
      <div role="tablist" aria-label="Subseções da estratégia" className="flex flex-wrap gap-2 border-b border-border pb-3">
        {abas.map((item) => <button key={item.id} type="button" role="tab" aria-selected={aba === item.id} aria-controls={`painel-estrategia-${item.id}`} onClick={() => setAba(item.id)} className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${aba === item.id ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:bg-muted"}`}>{item.rotulo}</button>)}
      </div>
      <div id={`painel-estrategia-${aba}`} role="tabpanel" tabIndex={0}>
        {aba === "triangulo" && <TrianguloSection projectId={projectId} />}
        {aba === "arvore" && <ArvoreSection projectId={projectId} />}
        {aba === "teoria" && <TeoriaSection projectId={projectId} />}
      </div>
    </FolhaDaTela>
  );
};
