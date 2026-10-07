import { apiGet, apiPost } from "./client";

export interface KanbanStage {
  id: number;
  name: string;
  fold: boolean;
}

export interface KanbanTask {
  id: number;
  name: string;
  stage_id: number | false;
  date_deadline: string | false;
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

export function moverTask(taskId: number, stageId: number) {
  return apiPost<{ record: { id: number; stage_id: number } }>(`/api/tasks/${taskId}/mover`, { stage_id: stageId });
}
