import { apiGet, apiPatch, apiPost } from "./client";

export interface KanbanStage {
  id: number;
  name: string;
  fold: boolean;
}

export interface KanbanResponsavel {
  id: number;
  name: string;
}

export interface KanbanTask {
  id: number;
  name: string;
  project_id: number;
  project_name: string;
  stage_id: number | false;
  stage_name?: string;
  date_deadline: string | false;
  active: boolean;
  responsaveis: KanbanResponsavel[];
}

export interface KanbanProject {
  id: number;
  name: string;
  stages: KanbanStage[];
  tasks: KanbanTask[];
}

export function buscarKanbanProjeto(projectId: number) {
  return apiGet<{ record?: KanbanProject }>(`/api/projetos/${encodeURIComponent(projectId)}`);
}

export function listarTasksProjeto(projectId: number) {
  return apiGet<{ records: KanbanTask[] }>(`/api/projetos/${encodeURIComponent(projectId)}/tasks`);
}

export function criarTask(body: { project_id: number; name: string; stage_id?: number; date_deadline?: string | null; responsavel_id?: number }) {
  return apiPost<{ record: KanbanTask }>("/api/tasks", body);
}

export function atualizarTask(id: number, body: Partial<{ name: string; stage_id: number; date_deadline: string | null; responsavel_id: number }>) {
  return apiPatch<{ record: KanbanTask }>(`/api/tasks/${id}`, body);
}

export function moverTask(taskId: number, stageId: number) {
  return apiPost<{ record: { id: number; stage_id: number } }>(`/api/tasks/${taskId}/mover`, { stage_id: stageId });
}

export function concluirTask(taskId: number) {
  return apiPost<{ record: KanbanTask }>(`/api/tasks/${taskId}/concluir`, {});
}

export function arquivarTask(taskId: number) {
  return apiPost<{ record: { id: number; active: boolean } }>(`/api/tasks/${taskId}/arquivar`, {});
}
