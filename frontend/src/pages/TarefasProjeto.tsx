import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { useAuth } from "@/contexts/AuthContext";
import { listarUsuarios, type UsuarioMunicipal } from "@/services/api/organization";
import { atualizarTask, buscarKanbanProjeto, criarTask, type KanbanProject, type KanbanTask } from "@/services/api/kanban";
import { MARCA } from "@/config/marca";

const dataBR = (value: string | false) => value ? value.slice(0, 10).split("-").reverse().join("/") : "Sem prazo";

export const TarefasProjeto: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const { can } = useAuth();
  const { avisar } = useAvisoDeResultado();
  const [projeto, setProjeto] = useState<KanbanProject | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioMunicipal[]>([]);
  const [form, setForm] = useState({ name: "", date_deadline: "", stage_id: "", responsavel_id: "" });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    return buscarKanbanProjeto(projectId).then((resposta) => {
      if (!resposta.record) throw new Error("Projeto não encontrado.");
      setProjeto(resposta.record);
      setForm((atual) => ({ ...atual, stage_id: atual.stage_id || String(resposta.record?.stages[0]?.id ?? "") }));
    }).catch((error) => setErro(error instanceof Error ? error.message : "Não foi possível carregar as tasks.")).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => { void listarUsuarios().then((resposta) => setUsuarios(resposta.records)).catch(() => setUsuarios([])); }, []);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando || !form.name.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      if (editandoId === null) {
        await criarTask({ project_id: projectId, name: form.name.trim(), date_deadline: form.date_deadline || null, stage_id: Number(form.stage_id) || undefined, responsavel_id: Number(form.responsavel_id) || undefined });
      } else {
        await atualizarTask(editandoId, { name: form.name.trim(), date_deadline: form.date_deadline || null, stage_id: Number(form.stage_id) || undefined, responsavel_id: Number(form.responsavel_id) || undefined });
      }
      setForm({ name: "", date_deadline: "", stage_id: form.stage_id, responsavel_id: "" });
      setEditandoId(null);
      await carregar();
      avisar({ texto: editandoId === null ? "Task criada no projeto." : "Task atualizada no projeto." });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível criar a task.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <MesaCarregando texto="Buscando tasks do projeto…" />;
  if (erro || !projeto) return <MesaErroBusca titulo="Não deu para buscar as tasks" texto={erro ?? "Projeto não encontrado."} onTentarDeNovo={() => void carregar()} />;

  const editar = (task: KanbanTask) => {
    setEditandoId(task.id);
    setForm({ name: task.name, date_deadline: task.date_deadline ? task.date_deadline.slice(0, 10) : "", stage_id: task.stage_id ? String(task.stage_id) : "", responsavel_id: task.responsaveis[0] ? String(task.responsaveis[0].id) : "" });
    setErro(null);
  };

  const cancelarEdicao = () => { setEditandoId(null); setForm({ name: "", date_deadline: "", stage_id: String(projeto.stages[0]?.id ?? ""), responsavel_id: "" }); };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-3xl font-semibold">Tasks do projeto</h2><p className="text-sm text-muted-foreground">{projeto.tasks.length} {projeto.tasks.length === 1 ? "task ativa" : "tasks ativas"} persistidas no Odoo.</p></div><Button asChild variant="outline" size="sm"><Link to={`${MARCA.rotaDaLista}/${projectId}/kanban`}>Abrir Kanban</Link></Button></div>
    {can("manage_projects") && <form onSubmit={salvar} className="folha-simples grid gap-4 border border-border p-4 md:grid-cols-2"><div className="md:col-span-2"><h3 className="font-display text-2xl font-semibold">{editandoId === null ? "Nova task" : `Editar task #${editandoId}`}</h3><p className="text-sm text-muted-foreground">A task sempre ficará vinculada a este projeto e ao seu escopo municipal.</p></div><div className="grid gap-2 md:col-span-2"><Label htmlFor="task-name">Nome da task</Label><Input id="task-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="task-stage">Etapa</Label><select id="task-stage" value={form.stage_id} onChange={(event) => setForm({ ...form, stage_id: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem etapa</option>{projeto.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="task-deadline">Prazo</Label><Input id="task-deadline" type="date" value={form.date_deadline} onChange={(event) => setForm({ ...form, date_deadline: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="task-responsavel">Responsável</Label><select id="task-responsavel" value={form.responsavel_id} onChange={(event) => setForm({ ...form, responsavel_id: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem responsável</option>{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.name}</option>)}</select></div><div className="flex items-end gap-2"><Button type="submit" disabled={enviando}>{enviando ? (editandoId === null ? "Criando…" : "Salvando…") : editandoId === null ? "Criar task" : "Salvar alterações"}</Button>{editandoId !== null && <Button type="button" variant="outline" onClick={cancelarEdicao} disabled={enviando}>Cancelar</Button>}</div>{erro && <p role="alert" className="text-sm text-destructive md:col-span-2">{erro}</p>}</form>}
    {projeto.tasks.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhuma task ativa</p><p className="mt-1 text-sm text-muted-foreground">Crie uma task ou gere uma ação a partir de um 5W2H aprovado.</p></div> : <ul className="grid gap-3" aria-label="Tasks do projeto">{projeto.tasks.map((task) => <li key={task.id} className="folha-simples border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs text-muted-foreground">Task #{task.id} · {task.stage_name ?? "Sem etapa"}</p><h3 className="mt-1 font-semibold">{task.name}</h3></div><span className="text-sm text-muted-foreground">{dataBR(task.date_deadline)}</span></div>{task.responsaveis.length > 0 && <p className="mt-2 text-sm text-muted-foreground">Responsável: {task.responsaveis.map((responsavel) => responsavel.name).join(", ")}</p>}{can("manage_projects") && <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => editar(task)}>Editar task</Button>}</li>)}</ul>}
  </div>;
};

export default TarefasProjeto;
