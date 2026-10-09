import React, { useCallback, useEffect, useState } from "react";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  criarAcaoPorques,
  criarAcaoRisco,
  criarPorques,
  atualizarPorques,
  arquivarPorques,
  criarRisco,
  atualizarRisco,
  arquivarRisco,
  listarPorques,
  listarRiscos,
  listarIshikawa,
  criarIshikawa,
  atualizarIshikawa,
  arquivarIshikawa,
  definirCausaRaizIshikawa,
  criarAcaoIshikawa,
  type CincoPorques,
  type NovoCincoPorques,
  type NovoRisco,
  type Risco,
  type Ishikawa,
  type NovaIshikawaCausa,
  criarRaci,
  atualizarRaci,
  arquivarRaci,
  listarRaci,
  listarUsuarios,
  type Raci,
  type UsuarioOdoo,
} from "@/services/api/tools";
import { useParams } from "react-router-dom";
import { apiGet } from "@/services/api/client";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const TRILHA = [{ rotulo: "Projetos" }, { rotulo: "Ferramenta" }];

const Campo: React.FC<{ rotulo: string; htmlFor: string; children: React.ReactNode }> = ({ rotulo, htmlFor, children }) => (
  <div className="grid gap-2">
    <Label htmlFor={htmlFor} className={ROTULO}>{rotulo}</Label>
    {children}
  </div>
);

const PORQUES_INICIAL: NovoCincoPorques = {
  project_id: 0,
  name: "",
  problema: "",
  pq1: "",
  pq2: "",
  pq3: "",
  pq4: "",
  pq5: "",
  causa_raiz: "",
};

export const TelaPorquesReal: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const [records, setRecords] = useState<CincoPorques[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [form, setForm] = useState<NovoCincoPorques>({ ...PORQUES_INICIAL, project_id: projectId });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [acaoId, setAcaoId] = useState<number | null>(null);
  const { avisar } = useAvisoDeResultado();

  const carregar = useCallback(() => {
    setLoading(true);
    setErroBusca(false);
    return listarPorques(projectId)
      .then((resposta) => setRecords(resposta.records))
      .catch(() => setErroBusca(true))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { void carregar(); }, [carregar]);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    if (!form.problema.trim()) {
      setErro("Informe o problema antes de salvar.");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const resposta = editandoId
        ? await atualizarPorques(editandoId, { ...form, problema: form.problema.trim() })
        : await criarPorques({ ...form, project_id: projectId, problema: form.problema.trim() });
      await carregar();
      setForm({ ...PORQUES_INICIAL, project_id: projectId });
      setEditandoId(null);
      avisar({ texto: `Análise "${resposta.record.name}" foi ${editandoId ? "atualizada" : "salva"} no projeto.` });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar a análise.");
    } finally {
      setEnviando(false);
    }
  };

  const gerarAcao = async (record: CincoPorques) => {
    if (acaoId) return;
    setErro(null);
    setAcaoId(record.id);
    try {
      await criarAcaoPorques(record.id);
      await carregar();
      avisar({ texto: "A ação da análise foi criada ou atualizada no projeto." });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível criar a ação.");
    } finally {
      setAcaoId(null);
    }
  };

  return (
    <FolhaDaTela trilha={[...TRILHA, { rotulo: "5 Porquês" }]} titulo="5 Porquês" subtitulo="Do problema até a causa raiz, com a ação registrada no Odoo.">
      {loading ? <MesaCarregando texto="Buscando as análises…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar as análises" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? (
        <div className="folha-simples border border-dashed border-border p-5">
          <p className="mesa-secao tinta-ocre">Nenhuma análise cadastrada</p>
          <p className="mt-1 text-sm text-muted-foreground">Registre o primeiro diagnóstico deste projeto abaixo.</p>
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Análises 5 Porquês">
          {records.map((record) => (
            <li key={record.id} className="folha-simples space-y-3 border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{record.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Problema: {record.problema}</p>
                </div>
                {record.task_id && <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">Ação #{record.task_id}</p>}
              </div>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {[record.pq1, record.pq2, record.pq3, record.pq4, record.pq5].map((value, index) => value && <div key={index}><dt className={ROTULO}>Por quê {index + 1}</dt><dd>{value}</dd></div>)}
              </dl>
              {record.causa_raiz && <p className="border-t border-dotted border-border pt-2 text-sm"><strong>Causa raiz:</strong> {record.causa_raiz}</p>}
              {record.causa_raiz && <Button type="button" variant="outline" size="sm" onClick={() => void gerarAcao(record)} disabled={acaoId === record.id}>{acaoId === record.id ? "Salvando ação…" : record.task_id ? "Atualizar ação" : "Criar ação"}</Button>}
              <Button type="button" variant="ghost" size="sm" onClick={() => { setEditandoId(record.id); setForm({ project_id: projectId, name: record.name, problema: record.problema, pq1: record.pq1, pq2: record.pq2, pq3: record.pq3, pq4: record.pq4, pq5: record.pq5, causa_raiz: record.causa_raiz }); }}>Editar</Button>
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (!window.confirm("Arquivar esta análise?")) return; try { await arquivarPorques(record.id); await carregar(); avisar({ texto: "Análise arquivada." }); } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível arquivar a análise."); } }}>Arquivar</Button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6">
        <div><h2 className="font-display text-2xl font-semibold">{editandoId ? "Editar análise" : "Nova análise"}</h2><p className="mt-1 text-sm text-muted-foreground">Preencha o problema e avance até a causa raiz.</p></div>
        <Campo rotulo="Nome da análise" htmlFor="porques-name"><Input id="porques-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Atraso na implantação" /></Campo>
        <Campo rotulo="Problema" htmlFor="porques-problema"><Textarea id="porques-problema" rows={2} value={form.problema} onChange={(event) => setForm({ ...form, problema: event.target.value })} required /></Campo>
        {[1, 2, 3, 4, 5].map((number) => {
          const campo = `pq${number}` as keyof Pick<NovoCincoPorques, "pq1" | "pq2" | "pq3" | "pq4" | "pq5">;
          return <Campo key={campo} rotulo={`Por quê ${number}?`} htmlFor={`porques-${campo}`}><Input id={`porques-${campo}`} value={form[campo]} onChange={(event) => setForm({ ...form, [campo]: event.target.value })} /></Campo>;
        })}
        <Campo rotulo="Causa raiz" htmlFor="porques-causa"><Textarea id="porques-causa" rows={2} value={form.causa_raiz} onChange={(event) => setForm({ ...form, causa_raiz: event.target.value })} /></Campo>
        <div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editandoId ? "Salvar alterações" : "Salvar análise"}</Button>{editandoId && <Button type="button" variant="ghost" onClick={() => { setEditandoId(null); setForm({ ...PORQUES_INICIAL, project_id: projectId }); }}>Cancelar</Button>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div>
      </form>
    </FolhaDaTela>
  );
};

const RISCO_INICIAL: NovoRisco = { project_id: 0, name: "", probabilidade: "media", impacto: "medio", mitigacao: "", responsavel_id: false };

export const TelaRiscosReal: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const [records, setRecords] = useState<Risco[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [form, setForm] = useState<NovoRisco>({ ...RISCO_INICIAL, project_id: projectId });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [acaoId, setAcaoId] = useState<number | null>(null);
  const { avisar } = useAvisoDeResultado();

  const carregar = useCallback(() => {
    setLoading(true);
    setErroBusca(false);
    return listarRiscos(projectId).then((resposta) => setRecords(resposta.records)).catch(() => setErroBusca(true)).finally(() => setLoading(false));
  }, [projectId]);
  useEffect(() => { void carregar(); }, [carregar]);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    if (!form.name.trim()) { setErro("Informe o risco antes de salvar."); return; }
    setErro(null); setEnviando(true);
    try {
      const resposta = editandoId
        ? await atualizarRisco(editandoId, { ...form, name: form.name.trim() })
        : await criarRisco({ ...form, project_id: projectId, name: form.name.trim() });
      await carregar(); setForm({ ...RISCO_INICIAL, project_id: projectId }); setEditandoId(null);
      avisar({ texto: `Risco "${resposta.record.name}" foi ${editandoId ? "atualizado" : "salvo"} no projeto.` });
    } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível salvar o risco."); }
    finally { setEnviando(false); }
  };

  const gerarAcao = async (record: Risco) => {
    if (acaoId) return;
    setErro(null); setAcaoId(record.id);
    try { await criarAcaoRisco(record.id); await carregar(); avisar({ texto: "A ação de mitigação foi criada ou atualizada no projeto." }); }
    catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível criar a ação."); }
    finally { setAcaoId(null); }
  };

  return (
    <FolhaDaTela trilha={[...TRILHA, { rotulo: "Riscos" }]} titulo="Riscos" subtitulo="Probabilidade, impacto e mitigação com ação persistida no Odoo.">
      {loading ? <MesaCarregando texto="Buscando os riscos…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar os riscos" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhum risco cadastrado</p><p className="mt-1 text-sm text-muted-foreground">Registre o primeiro risco deste projeto abaixo.</p></div> : (
        <ul className="space-y-3" aria-label="Riscos do projeto">
          {records.map((record) => <li key={record.id} className="folha-simples space-y-3 border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-2xl font-semibold">{record.name}</h2><p className="mt-1 text-sm text-muted-foreground">{record.probabilidade_label} probabilidade · {record.impacto_label} impacto</p></div>{record.task_id && <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">Ação #{record.task_id}</p>}</div>{record.mitigacao && <p className="text-sm"><strong>Mitigação:</strong> {record.mitigacao}</p>}{record.responsavel_name && <p className="text-sm text-muted-foreground">Responsável: {record.responsavel_name}</p>} <div className="flex flex-wrap gap-2">{record.mitigacao && <Button type="button" variant="outline" size="sm" onClick={() => void gerarAcao(record)} disabled={acaoId === record.id}>{acaoId === record.id ? "Salvando ação…" : record.task_id ? "Atualizar ação" : "Gerar ação"}</Button>}<Button type="button" variant="ghost" size="sm" onClick={() => { setEditandoId(record.id); setForm({ project_id: projectId, name: record.name, probabilidade: record.probabilidade, impacto: record.impacto, mitigacao: record.mitigacao, responsavel_id: record.responsavel_id }); }}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (!window.confirm("Arquivar este risco?")) return; try { await arquivarRisco(record.id); await carregar(); avisar({ texto: "Risco arquivado." }); } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível arquivar o risco."); } }}>Arquivar</Button></div></li>)}
        </ul>
      )}
      <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6"><div><h2 className="font-display text-2xl font-semibold">{editandoId ? "Editar risco" : "Novo risco"}</h2><p className="mt-1 text-sm text-muted-foreground">A mitigação é necessária para gerar uma ação.</p></div><Campo rotulo="Risco" htmlFor="risco-name"><Input id="risco-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Campo><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Campo rotulo="Probabilidade" htmlFor="risco-probabilidade"><select id="risco-probabilidade" value={form.probabilidade} onChange={(event) => setForm({ ...form, probabilidade: event.target.value as Risco["probabilidade"] })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option></select></Campo><Campo rotulo="Impacto" htmlFor="risco-impacto"><select id="risco-impacto" value={form.impacto} onChange={(event) => setForm({ ...form, impacto: event.target.value as Risco["impacto"] })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="baixo">Baixo</option><option value="medio">Médio</option><option value="alto">Alto</option></select></Campo></div><Campo rotulo="Mitigação" htmlFor="risco-mitigacao"><Textarea id="risco-mitigacao" rows={3} value={form.mitigacao} onChange={(event) => setForm({ ...form, mitigacao: event.target.value })} /></Campo><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editandoId ? "Salvar alterações" : "Salvar risco"}</Button>{editandoId && <Button type="button" variant="ghost" onClick={() => { setEditandoId(null); setForm({ ...RISCO_INICIAL, project_id: projectId }); }}>Cancelar</Button>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div></form>
    </FolhaDaTela>
  );
};

const CATEGORIAS_ISHIKAWA: Array<{ key: NovaIshikawaCausa["categoria"]; label: string }> = [
  { key: "pessoas", label: "Pessoas" },
  { key: "processos", label: "Processos" },
  { key: "tecnologia", label: "Tecnologia" },
  { key: "recursos", label: "Recursos" },
  { key: "ambiente", label: "Ambiente" },
  { key: "gestao", label: "Gestão" },
];

export const TelaIshikawaReal: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const [records, setRecords] = useState<Ishikawa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [name, setName] = useState("");
  const [problema, setProblema] = useState("");
  const [causas, setCausas] = useState<NovaIshikawaCausa[]>(CATEGORIAS_ISHIKAWA.map(({ key }) => ({ categoria: key, descricao: "", eh_principal: false })));
  const [erro, setErro] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [acaoId, setAcaoId] = useState<number | null>(null);
  const { avisar } = useAvisoDeResultado();

  const carregar = useCallback(() => {
    setLoading(true); setErroBusca(false);
    return listarIshikawa(projectId).then((resposta) => setRecords(resposta.records)).catch(() => setErroBusca(true)).finally(() => setLoading(false));
  }, [projectId]);
  useEffect(() => { void carregar(); }, [carregar]);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    if (!problema.trim()) { setErro("Informe o problema antes de salvar."); return; }
    setErro(null); setEnviando(true);
    try {
      const dados = { name: name.trim(), problema: problema.trim(), causas: causas.filter((causa) => causa.descricao.trim()).map((causa) => ({ ...causa, descricao: causa.descricao.trim() })) };
      await (editandoId ? atualizarIshikawa(editandoId, dados) : criarIshikawa({ project_id: projectId, ...dados }));
      await carregar(); setName(""); setProblema(""); setCausas(CATEGORIAS_ISHIKAWA.map(({ key }) => ({ categoria: key, descricao: "", eh_principal: false }))); setEditandoId(null);
      avisar({ texto: `Análise Ishikawa ${editandoId ? "atualizada" : "salva"} no projeto.` });
    } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível salvar a análise."); }
    finally { setEnviando(false); }
  };

  const definirRaiz = async (record: Ishikawa) => {
    setErro(null);
    try { await definirCausaRaizIshikawa(record.id); await carregar(); avisar({ texto: "Causa raiz definida no Odoo." }); }
    catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível definir a causa raiz."); }
  };

  const gerarAcao = async (record: Ishikawa) => {
    if (acaoId) return;
    setErro(null); setAcaoId(record.id);
    try { await criarAcaoIshikawa(record.id); await carregar(); avisar({ texto: "A ação da análise foi criada ou atualizada no projeto." }); }
    catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível criar a ação."); }
    finally { setAcaoId(null); }
  };

  return <FolhaDaTela trilha={[...TRILHA, { rotulo: "Ishikawa" }]} titulo="Ishikawa" subtitulo="Organize as causas por categoria e defina a causa raiz.">
    {loading ? <MesaCarregando texto="Buscando as análises…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar as análises Ishikawa" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhuma análise cadastrada</p><p className="mt-1 text-sm text-muted-foreground">Registre a primeira análise abaixo.</p></div> : <ul className="space-y-3" aria-label="Análises Ishikawa">{records.map((record) => <li key={record.id} className="folha-simples space-y-3 border border-border p-4"><div><h2 className="font-display text-2xl font-semibold">{record.name}</h2><p className="mt-1 text-sm text-muted-foreground">Problema: {record.problema}</p></div><ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">{record.causas.map((causa) => <li key={causa.id}><span className={ROTULO}>{causa.categoria_label}</span><p>{causa.descricao}{causa.eh_principal ? " · principal" : ""}</p></li>)}</ul>{record.causa_raiz && <p className="border-t border-dotted border-border pt-2 text-sm"><strong>Causa raiz:</strong> {record.causa_raiz}</p>}<div className="flex flex-wrap gap-2">{!record.causa_raiz && <Button type="button" variant="outline" size="sm" onClick={() => void definirRaiz(record)}>Definir causa raiz</Button>}{record.causa_raiz && <Button type="button" variant="outline" size="sm" onClick={() => void gerarAcao(record)} disabled={acaoId === record.id}>{acaoId === record.id ? "Salvando ação…" : record.task_id ? "Atualizar ação" : "Gerar ação"}</Button>}<Button type="button" variant="ghost" size="sm" onClick={() => { setEditandoId(record.id); setName(record.name); setProblema(record.problema); setCausas(CATEGORIAS_ISHIKAWA.map(({ key }) => { const causa = record.causas.find((item) => item.categoria === key); return { categoria: key, descricao: causa?.descricao ?? "", eh_principal: causa?.eh_principal ?? false }; })); }}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (!window.confirm("Arquivar esta análise?")) return; try { await arquivarIshikawa(record.id); await carregar(); avisar({ texto: "Análise arquivada." }); } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível arquivar a análise."); } }}>Arquivar</Button></div></li>)}</ul>}
    <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6"><div><h2 className="font-display text-2xl font-semibold">{editandoId ? "Editar análise" : "Nova análise"}</h2><p className="mt-1 text-sm text-muted-foreground">Marque uma causa principal para poder definir a causa raiz.</p></div><Campo rotulo="Nome da análise" htmlFor="ishikawa-name"><Input id="ishikawa-name" value={name} onChange={(event) => setName(event.target.value)} /></Campo><Campo rotulo="Problema (efeito)" htmlFor="ishikawa-problema"><Textarea id="ishikawa-problema" rows={2} value={problema} onChange={(event) => setProblema(event.target.value)} required /></Campo><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{causas.map((causa, index) => <div key={causa.categoria} className="grid gap-2"><Label htmlFor={`ishikawa-causa-${causa.categoria}`} className={ROTULO}>{CATEGORIAS_ISHIKAWA[index].label}</Label><Input id={`ishikawa-causa-${causa.categoria}`} value={causa.descricao} onChange={(event) => setCausas(causas.map((atual, atualIndex) => atualIndex === index ? { ...atual, descricao: event.target.value } : atual))} /><label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="radio" name="ishikawa-principal" checked={causa.eh_principal} onChange={() => setCausas(causas.map((atual, atualIndex) => ({ ...atual, eh_principal: atualIndex === index })))} /> Causa principal</label></div>)}</div><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editandoId ? "Salvar alterações" : "Salvar análise"}</Button>{editandoId && <Button type="button" variant="ghost" onClick={() => { setEditandoId(null); setName(""); setProblema(""); setCausas(CATEGORIAS_ISHIKAWA.map(({ key }) => ({ categoria: key, descricao: "", eh_principal: false }))); }}>Cancelar</Button>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div></form>
  </FolhaDaTela>;
};

interface TaskResumo { id: number; name: string }

export const TelaRaciReal: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const [tasks, setTasks] = useState<TaskResumo[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioOdoo[]>([]);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [records, setRecords] = useState<Raci[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [responsibleId, setResponsibleId] = useState("");
  const [accountableId, setAccountableId] = useState("");
  const [consultedIds, setConsultedIds] = useState<string[]>([]);
  const [informedIds, setInformedIds] = useState<string[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { avisar } = useAvisoDeResultado();

  const carregar = useCallback(async () => {
    setLoading(true); setErroBusca(null);
    try {
      const [projeto, usuariosResposta] = await Promise.all([
        apiGet<{ record: { tasks: TaskResumo[] } }>(`/api/projetos/${projectId}`),
        listarUsuarios(),
      ]);
      setTasks(projeto.record.tasks);
      setUsuarios(usuariosResposta.records);
      const primeiraTask = taskId && projeto.record.tasks.some((task) => task.id === taskId) ? taskId : projeto.record.tasks[0]?.id;
      setTaskId(primeiraTask ?? null);
      if (primeiraTask) {
        const raciResposta = await listarRaci(primeiraTask);
        setRecords(raciResposta.records);
      } else {
        setRecords([]);
      }
    } catch (error) {
      setErroBusca(error instanceof Error ? error.message : "Não foi possível carregar o RACI.");
    } finally { setLoading(false); }
  }, [projectId, taskId]);

  useEffect(() => { void carregar(); }, [carregar]);

  const trocarTask = async (value: string) => {
    const next = Number(value);
    setTaskId(next);
    setErroBusca(null);
    try { const resposta = await listarRaci(next); setRecords(resposta.records); }
    catch (error) { setErroBusca(error instanceof Error ? error.message : "Não foi possível carregar o RACI da task."); }
  };

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskId || !Number(responsibleId) || !Number(accountableId)) { setErro("Escolha a task, quem executa e quem responde."); return; }
    if (responsibleId === accountableId) { setErro("Responsible e Accountable devem ser pessoas diferentes."); return; }
    setErro(null); setEnviando(true);
    try { const dados = { name: `RACI — ${tasks.find((task) => task.id === taskId)?.name ?? "Task"}`, responsible_id: Number(responsibleId), accountable_id: Number(accountableId), consulted_ids: consultedIds.map(Number), informed_ids: informedIds.map(Number) }; if (editandoId) await atualizarRaci(editandoId, dados); else await criarRaci({ task_id: taskId, ...dados }); const resposta = await listarRaci(taskId); setRecords(resposta.records); setResponsibleId(""); setAccountableId(""); setConsultedIds([]); setInformedIds([]); setEditandoId(null); avisar({ texto: `Matriz RACI ${editandoId ? "atualizada" : "salva"} na task.` }); }
    catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível salvar a matriz RACI."); }
    finally { setEnviando(false); }
  };

  return <FolhaDaTela trilha={[...TRILHA, { rotulo: "RACI" }]} titulo="RACI" subtitulo="Quem executa, quem responde e quem precisa ser consultado.">
    {loading ? <MesaCarregando texto="Buscando tasks e usuários…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar o RACI" texto={erroBusca} onTentarDeNovo={() => void carregar()} /> : tasks.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">O projeto ainda não tem tasks</p><p className="mt-1 text-sm text-muted-foreground">Crie uma task antes de registrar uma matriz RACI.</p></div> : <>
      <div className="grid gap-2"><Label htmlFor="raci-task" className={ROTULO}>Task analisada</Label><select id="raci-task" value={taskId ?? ""} onChange={(event) => void trocarTask(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{tasks.map((task) => <option key={task.id} value={task.id}>{task.name}</option>)}</select></div>
      {records.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhuma matriz RACI nesta task</p><p className="mt-1 text-sm text-muted-foreground">Cadastre a primeira matriz abaixo.</p></div> : <ul className="space-y-3" aria-label="Matrizes RACI">{records.map((record) => <li key={record.id} className="folha-simples space-y-2 border border-border p-4"><h2 className="font-display text-2xl font-semibold">{record.name}</h2><p className="text-sm">Executa: {record.responsible_name}</p><p className="text-sm">Responde: {record.accountable_name}</p><p className="text-sm text-muted-foreground">Consultados: {record.consulted.map((user) => user.name).join(", ") || "Nenhum"} · Informados: {record.informed.map((user) => user.name).join(", ") || "Nenhum"}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => { setEditandoId(record.id); setResponsibleId(String(record.responsible_id)); setAccountableId(String(record.accountable_id)); setConsultedIds(record.consulted.map((user) => String(user.id))); setInformedIds(record.informed.map((user) => String(user.id))); }}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (!window.confirm("Arquivar esta matriz RACI?")) return; try { await arquivarRaci(record.id); const resposta = await listarRaci(taskId ?? 0); setRecords(resposta.records); avisar({ texto: "Matriz RACI arquivada." }); } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível arquivar a matriz RACI."); } }}>Arquivar</Button></div></li>)}</ul>}
    </>}
    <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6"><h2 className="font-display text-2xl font-semibold">{editandoId ? "Editar matriz RACI" : "Nova matriz RACI"}</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="raci-responsible" className={ROTULO}>Responsible — executa</Label><select id="raci-responsible" value={responsibleId} onChange={(event) => setResponsibleId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Escolha uma pessoa</option>{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.name}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="raci-accountable" className={ROTULO}>Accountable — responde</Label><select id="raci-accountable" value={accountableId} onChange={(event) => setAccountableId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Escolha uma pessoa</option>{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.name}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="raci-consulted" className={ROTULO}>Consulted — consultados</Label><select id="raci-consulted" multiple value={consultedIds} onChange={(event) => setConsultedIds(Array.from(event.target.selectedOptions, (option) => option.value))} className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm">{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.name}</option>)}</select><p className="text-xs text-muted-foreground">Use Ctrl/Cmd para selecionar mais de uma pessoa.</p></div><div className="grid gap-2"><Label htmlFor="raci-informed" className={ROTULO}>Informed — informados</Label><select id="raci-informed" multiple value={informedIds} onChange={(event) => setInformedIds(Array.from(event.target.selectedOptions, (option) => option.value))} className="min-h-24 rounded-md border border-input px-3 py-2 text-sm">{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.name}</option>)}</select><p className="text-xs text-muted-foreground">Use Ctrl/Cmd para selecionar mais de uma pessoa.</p></div></div><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editandoId ? "Salvar alterações" : "Salvar matriz RACI"}</Button>{editandoId && <Button type="button" variant="ghost" onClick={() => { setEditandoId(null); setResponsibleId(""); setAccountableId(""); setConsultedIds([]); setInformedIds([]); }}>Cancelar</Button>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div></form>
  </FolhaDaTela>;
};
