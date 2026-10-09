import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, CalendarDays, CheckCircle2, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { arquivarTask, buscarKanbanProjeto, concluirTask, moverTask, type KanbanProject, type KanbanStage, type KanbanTask } from "@/services/api/kanban";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const hoje = () => {
  const valor = new Date();
  valor.setHours(0, 0, 0, 0);
  return valor;
};

const atrasada = (prazo: string | false) => {
  if (!prazo) return false;
  const data = new Date(`${prazo.slice(0, 10)}T00:00:00`);
  return data < hoje();
};

const dataBR = (prazo: string | false) => {
  if (!prazo) return "Sem prazo";
  const [ano, mes, dia] = prazo.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
};

const porEtapa = (tasks: KanbanTask[], stageId: number) => tasks.filter((task) => task.stage_id === stageId);

export const KanbanProjeto: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const [projeto, setProjeto] = useState<KanbanProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [movendo, setMovendo] = useState<number | null>(null);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const { avisar } = useAvisoDeResultado();
  const { can } = useAuth();

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    return buscarKanbanProjeto(projectId)
      .then((resposta) => {
        if (!resposta.record) throw new Error("Projeto não encontrado.");
        setProjeto(resposta.record);
      })
      .catch((error) => setErro(error instanceof Error ? error.message : "Não foi possível carregar o Kanban."))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { void carregar(); }, [carregar]);

  const concluir = async (task: KanbanTask) => {
    if (!can("manage_projects") || movendo !== null || !window.confirm(`Concluir a ação “${task.name}”?`)) return;
    setMovendo(task.id);
    setErro(null);
    try {
      await concluirTask(task.id);
      await carregar();
      avisar({ texto: "Ação concluída e movida para a etapa final." });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível concluir a ação.");
    } finally {
      setMovendo(null);
    }
  };

  const arquivar = async (task: KanbanTask) => {
    if (!can("archive_projects") || movendo !== null || !window.confirm(`Arquivar a ação “${task.name}”?`)) return;
    setMovendo(task.id);
    setErro(null);
    try {
      await arquivarTask(task.id);
      await carregar();
      avisar({ texto: "Ação arquivada; o histórico permanece no Odoo." });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível arquivar a ação.");
    } finally {
      setMovendo(null);
    }
  };

  const mover = async (taskId: number, stageId: number) => {
    if (!projeto || movendo) return;
    const anterior = projeto.tasks;
    const task = anterior.find((item) => item.id === taskId);
    if (!task || task.stage_id === stageId) return;
    setErro(null);
    setMovendo(taskId);
    setProjeto({ ...projeto, tasks: anterior.map((item) => item.id === taskId ? { ...item, stage_id: stageId } : item) });
    try {
      await moverTask(taskId, stageId);
      const stage = projeto.stages.find((item) => item.id === stageId);
      avisar({ texto: `Ação movida para ${stage?.name ?? "a nova etapa"}.` });
      await carregar();
    } catch (error) {
      setProjeto({ ...projeto, tasks: anterior });
      setErro(error instanceof Error ? error.message : "Não foi possível mover a ação. A posição anterior foi mantida.");
    } finally {
      setMovendo(null);
      setArrastando(null);
    }
  };

  const totalTasks = useMemo(() => projeto?.tasks.length ?? 0, [projeto]);

  if (loading) return <MesaCarregando texto="Montando o Kanban do projeto…" />;
  if (erro || !projeto) return <MesaErroBusca titulo="Não deu para carregar o Kanban" texto={erro ?? "O projeto não foi encontrado."} onTentarDeNovo={() => void carregar()} />;
  if (projeto.stages.length === 0) return <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Este projeto ainda não tem etapas</p><p className="mt-1 text-sm text-muted-foreground">Configure as etapas no Odoo antes de acompanhar as ações aqui.</p></div>;

  return <div className="space-y-4" aria-label={`Kanban do projeto ${projeto.name}`}>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="font-display text-3xl font-semibold">Kanban do projeto</h2><p className="text-sm text-muted-foreground">{totalTasks} {totalTasks === 1 ? "ação cadastrada" : "ações cadastradas"}. Arraste um card ou use o seletor para mover.</p></div>
      {erro && <p role="alert" className="text-sm tinta-carmim">{erro}</p>}
    </div>
    {totalTasks === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhuma ação neste projeto</p><p className="mt-1 text-sm text-muted-foreground">As ações criadas pelas ferramentas aparecerão aqui.</p></div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projeto.stages.map((stage: KanbanStage) => <section key={stage.id} className="min-w-0 rounded-md border border-[hsl(var(--mesa-linha))] bg-[hsl(var(--mesa-papel2))] p-3" onDragOver={(event) => event.preventDefault()} onDrop={() => { if (arrastando) void mover(arrastando, stage.id); }} aria-labelledby={`kanban-stage-${stage.id}`}>
        <header className="mb-3 flex items-center justify-between gap-2 border-b border-dotted border-[hsl(var(--mesa-linha))] pb-2"><h3 id={`kanban-stage-${stage.id}`} className="font-ui text-xs font-semibold uppercase tracking-[0.1em]">{stage.name}</h3><span className="font-mono text-xs text-muted-foreground">{porEtapa(projeto.tasks, stage.id).length}</span></header>
        <ul className="space-y-3" aria-label={`Ações em ${stage.name}`}>
          {porEtapa(projeto.tasks, stage.id).map((task) => <li key={task.id} draggable={movendo === null} onDragStart={() => setArrastando(task.id)} onDragEnd={() => setArrastando(null)} className="rounded-md border border-border bg-[hsl(var(--mesa-papel))] p-3 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <div className="flex items-start gap-2"><GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="min-w-0 flex-1 font-semibold">{task.name}</p>{movendo === task.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Movendo ação" />}</div>
            <p className={`mt-2 flex items-center gap-1 text-xs ${atrasada(task.date_deadline) && !stage.fold ? "tinta-carmim" : "text-muted-foreground"}`}><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{atrasada(task.date_deadline) && !stage.fold ? `Atrasada · ${dataBR(task.date_deadline)}` : dataBR(task.date_deadline)}</p>
            {task.responsaveis.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Responsável: {task.responsaveis.map((responsavel) => responsavel.name).join(", ")}</p>}
            <label className="mt-3 grid gap-1 text-xs text-muted-foreground"><span>Mover para</span><select value={stage.id} disabled={movendo !== null} onChange={(event) => void mover(task.id, Number(event.target.value))} className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"><option value={stage.id}>{stage.name}</option>{projeto.stages.filter((option) => option.id !== stage.id).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
            <div className="mt-3 flex flex-wrap gap-2">{can("manage_projects") && !stage.fold && <Button type="button" variant="outline" size="sm" onClick={() => void concluir(task)} disabled={movendo !== null}><CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />Concluir</Button>}{can("archive_projects") && <Button type="button" variant="ghost" size="sm" onClick={() => void arquivar(task)} disabled={movendo !== null}><Archive className="mr-1 h-3.5 w-3.5" aria-hidden="true" />Arquivar</Button>}</div>
          </li>)}
          {porEtapa(projeto.tasks, stage.id).length === 0 && <li className="py-4 text-center text-xs text-muted-foreground">Nenhuma ação nesta etapa</li>}
        </ul>
      </section>)}
    </div>}
    <Button type="button" variant="outline" size="sm" onClick={() => void carregar()}>Atualizar Kanban</Button>
  </div>;
};
