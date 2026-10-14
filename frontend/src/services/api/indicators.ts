import { apiGet } from "./client";

export interface IndicadorPorEtapa {
  stage_id: number | false;
  stage_name: string;
  total: number;
}

export interface IndicadorSecretaria {
  secretaria_id: number | false;
  secretaria_name: string;
  projetos: number;
  tasks: number;
  concluidas: number;
  atrasadas: number;
}

export interface IndicadorEtapaMunicipal {
  stage_name: string;
  total: number;
}

export interface ProjetoResumo {
  id: number;
  name: string;
  taxa: number;
  total_tasks: number;
  concluidas: number;
  atrasadas: number;
  date_deadline: string | false;
}

export interface TaskAtrasada {
  project_id: number | false;
  project_name: string;
  task_id: number;
  task_name: string;
  dias_atraso: number;
}

export interface IndicadoresMunicipais {
  municipio: { id: number | false; name: string };
  projetos: number;
  total_tasks: number;
  done_tasks: number;
  open_tasks: number;
  overdue_tasks: number;
  taxa_conclusao: number;
  chamados: number;
  chamados_abertos: number;
  por_secretaria: IndicadorSecretaria[];
  by_stage: IndicadorEtapaMunicipal[];
  projetos_resumo: ProjetoResumo[];
  top_atrasadas: TaskAtrasada[];
}

export interface IndicadoresProjeto {
  project_id: number;
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
  open_tasks: number;
  by_stage: IndicadorPorEtapa[];
}

export function listarIndicadoresMunicipais() {
  return apiGet<{ record: IndicadoresMunicipais }>("/api/indicadores");
}

export function listarIndicadoresProjeto(projectId: number) {
  return apiGet<{ record: IndicadoresProjeto }>(`/api/indicadores?project_id=${encodeURIComponent(projectId)}`);
}
