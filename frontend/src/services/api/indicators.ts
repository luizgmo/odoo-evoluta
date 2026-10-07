import { apiGet } from "./client";

export interface IndicadorPorEtapa {
  stage_id: number | false;
  stage_name: string;
  total: number;
}

export interface IndicadoresProjeto {
  project_id: number;
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
  open_tasks: number;
  by_stage: IndicadorPorEtapa[];
}

export function listarIndicadoresProjeto(projectId: number) {
  return apiGet<{ record: IndicadoresProjeto }>(`/api/indicadores?project_id=${encodeURIComponent(projectId)}`);
}
