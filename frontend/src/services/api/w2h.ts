import { apiGet, apiPost } from "./client";

export interface RevisaoPlano {
  id: number;
  name: string;
  status: "waiting" | "pending" | "approved" | "rejected" | "cancel";
  can_review: boolean;
}

export interface Plano5W2H {
  id: number;
  name: string;
  project_id: number;
  what: string;
  why: string;
  where: string;
  date_deadline: string | false;
  how: string;
  how_much: number;
  state: "draft" | "confirmed" | "approved" | "cancel";
  validation_status: "no" | "waiting" | "pending" | "validated" | "rejected";
  can_request_validation: boolean;
  can_validate: boolean;
  can_restart_validation: boolean;
  task_id: number | false;
  reviews: RevisaoPlano[];
}

export function listarPlanos5W2H(projectId: number) {
  return apiGet<{ records: Plano5W2H[] }>(`/api/5w2h?project_id=${encodeURIComponent(projectId)}`);
}

export function criarPlano5W2H(data: { project_id: number; name?: string; what: string; why: string; where: string; date_deadline?: string; how: string; how_much: number }) {
  return apiPost<{ record: Plano5W2H }>("/api/5w2h", data);
}

export function solicitarValidacaoPlano(id: number) {
  return apiPost<{ record: Plano5W2H }>(`/api/5w2h/${id}/solicitar-validacao`, {});
}

export function aprovarPlano(id: number) {
  return apiPost<{ record: Plano5W2H }>(`/api/5w2h/${id}/aprovar`, {});
}

export function reiniciarValidacaoPlano(id: number) {
  return apiPost<{ record: Plano5W2H }>(`/api/5w2h/${id}/reiniciar-validacao`, {});
}

export function gerarTaskPlano(id: number) {
  return apiPost<{ record: Plano5W2H }>(`/api/5w2h/${id}/gerar-task`, {});
}
