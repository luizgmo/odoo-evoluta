import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Carimbo, MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { listarUsuarios, type UsuarioMunicipal } from "@/services/api/organization";
import { atualizarAtividade, concluirAtividade, criarAtividade, listarAtividades, type Atividade } from "@/services/api/activities";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const dataBR = (value: string | false) => value ? value.slice(0, 10).split("-").reverse().join("/") : "Sem prazo";

export const AtividadesProjeto: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const { avisar } = useAvisoDeResultado();
  const [records, setRecords] = useState<Atividade[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioMunicipal[]>([]);
  const [form, setForm] = useState({ summary: "", note: "", date_deadline: "", responsavel_id: "" });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [acao, setAcao] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    return listarAtividades(projectId).then((resposta) => setRecords(resposta.records)).catch((error) => setErro(error instanceof Error ? error.message : "Não foi possível carregar as atividades.")).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => { void listarUsuarios().then((resposta) => setUsuarios(resposta.records)).catch(() => setUsuarios([])); }, []);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando || !form.summary.trim() || !form.date_deadline) return;
    setEnviando(true);
    setErro(null);
    try {
      if (editandoId === null) {
        await criarAtividade({ project_id: projectId, summary: form.summary.trim(), note: form.note.trim() || undefined, date_deadline: form.date_deadline, responsavel_id: Number(form.responsavel_id) || undefined });
      } else {
        await atualizarAtividade(editandoId, { summary: form.summary.trim(), note: form.note.trim(), date_deadline: form.date_deadline, responsavel_id: Number(form.responsavel_id) || undefined });
      }
      setForm({ summary: "", note: "", date_deadline: "", responsavel_id: "" });
      setEditandoId(null);
      await carregar();
      avisar({ texto: editandoId === null ? "Atividade criada no Odoo e incluída na agenda do projeto." : "Atividade atualizada no Odoo." });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível criar a atividade.");
    } finally {
      setEnviando(false);
    }
  };

  const concluir = async (atividade: Atividade) => {
    if (acao !== null || !window.confirm(`Concluir a atividade “${atividade.summary}”?`)) return;
    setAcao(atividade.id);
    setErro(null);
    try {
      await concluirAtividade(atividade.id);
      await carregar();
      avisar({ texto: "Atividade concluída no Odoo." });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível concluir a atividade.");
    } finally {
      setAcao(null);
    }
  };

  const editar = (atividade: Atividade) => {
    setEditandoId(atividade.id);
    setForm({ summary: atividade.summary, note: atividade.note, date_deadline: atividade.date_deadline ? atividade.date_deadline.slice(0, 10) : "", responsavel_id: atividade.responsavel ? String(atividade.responsavel.id) : "" });
    setErro(null);
  };

  const cancelarEdicao = () => { setEditandoId(null); setForm({ summary: "", note: "", date_deadline: "", responsavel_id: "" }); };

  if (loading) return <MesaCarregando texto="Buscando atividades do projeto…" />;
  if (erro && records.length === 0) return <MesaErroBusca titulo="Não deu para buscar as atividades" texto={erro} onTentarDeNovo={() => void carregar()} />;

  return <div className="space-y-5">
    <div><h2 className="font-display text-3xl font-semibold">Atividades</h2><p className="text-sm text-muted-foreground">Compromissos e acompanhamentos persistidos no Odoo, com reflexo na agenda.</p></div>
    <form onSubmit={salvar} className="folha-simples grid gap-4 border border-border p-4 md:grid-cols-2"><div className="md:col-span-2"><h3 className="font-display text-2xl font-semibold">{editandoId === null ? "Nova atividade" : `Editar atividade #${editandoId}`}</h3></div><div className="grid gap-2 md:col-span-2"><Label htmlFor="atividade-resumo" className={ROTULO}>Resumo</Label><Input id="atividade-resumo" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="atividade-prazo" className={ROTULO}>Data</Label><Input id="atividade-prazo" type="date" value={form.date_deadline} onChange={(event) => setForm({ ...form, date_deadline: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="atividade-responsavel" className={ROTULO}>Responsável</Label><select id="atividade-responsavel" value={form.responsavel_id} onChange={(event) => setForm({ ...form, responsavel_id: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Minha conta</option>{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.name}</option>)}</select></div><div className="grid gap-2 md:col-span-2"><Label htmlFor="atividade-nota" className={ROTULO}>Nota</Label><Textarea id="atividade-nota" rows={3} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></div><div className="flex flex-wrap items-center gap-3 md:col-span-2"><Button type="submit" disabled={enviando}>{enviando ? (editandoId === null ? "Criando…" : "Salvando…") : editandoId === null ? "Criar atividade" : "Salvar alterações"}</Button>{editandoId !== null && <Button type="button" variant="outline" onClick={cancelarEdicao} disabled={enviando}>Cancelar</Button>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div></form>
    {records.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhuma atividade pendente</p><p className="mt-1 text-sm text-muted-foreground">Crie a primeira atividade acima para acompanhá-la na agenda.</p></div> : <ul className="grid gap-3" aria-label="Atividades do projeto">{records.map((atividade) => <li key={atividade.id} className="folha-simples flex flex-wrap items-start justify-between gap-4 border border-border p-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold">{atividade.summary}</h3><Carimbo tinta={atividade.done ? "violeta" : "ocre"}>{atividade.done ? "Concluída" : "Pendente"}</Carimbo></div><p className="mt-2 text-sm text-muted-foreground">{dataBR(atividade.date_deadline)}{atividade.responsavel ? ` · ${atividade.responsavel.name}` : ""}</p>{atividade.note && <p className="mt-2 whitespace-pre-wrap text-sm">{atividade.note}</p>}</div><div className="flex flex-wrap gap-2">{!atividade.done && <><Button type="button" variant="outline" size="sm" onClick={() => editar(atividade)} disabled={acao !== null}>Editar</Button><Button type="button" variant="outline" size="sm" onClick={() => void concluir(atividade)} disabled={acao !== null}>{acao === atividade.id ? "Concluindo…" : "Concluir"}</Button></>}</div></li>)}</ul>}
  </div>;
};

export default AtividadesProjeto;
