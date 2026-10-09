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
