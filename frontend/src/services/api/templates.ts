import { apiGet, apiPost } from "./client";

export interface TemplateProjeto {
  id: number;
  name: string;
  descricao: string;
  task_count: number;
}

export type JobState = "pending" | "started" | "done" | "failed";

export interface JobStatus {
  id: string;
  state: JobState;
  project_id?: number;
  error?: string;
}

export function listarTemplates() {
  return apiGet<{ records: TemplateProjeto[] }>("/api/templates");
}

export function gerarProjetoTemplate(templateId: number, data: { municipio_id?: number; secretaria_id?: number; departamento_id?: number } = {}) {
  return apiPost<{ job: JobStatus }>(`/api/templates/${templateId}/gerar`, data);
}

export function consultarJob(jobId: string) {
  return apiGet<{ job: JobStatus }>(`/api/jobs/${encodeURIComponent(jobId)}`);
}
