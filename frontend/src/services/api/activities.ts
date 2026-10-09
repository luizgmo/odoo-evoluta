import { apiGet, apiPatch, apiPost } from "./client";

export interface Atividade {
  id: number;
  project_id: number;
  summary: string;
  note: string;
  date_deadline: string | false;
  activity_type: { id: number; name: string } | null;
  responsavel: { id: number; name: string } | null;
  done: boolean;
}

export interface ItemAgenda {
  id: string;
  kind: "project_deadline" | "activity";
  date: string;
  title: string;
  project_id: number;
  project_name: string;
}

export const listarAtividades = (projectId: number) =>
  apiGet<{ records: Atividade[] }>(`/api/atividades?project_id=${encodeURIComponent(projectId)}`);

export const criarAtividade = (body: { project_id: number; summary: string; note?: string; date_deadline: string; responsavel_id?: number }) =>
  apiPost<{ record: Atividade }>("/api/atividades", body);

export const atualizarAtividade = (id: number, body: Partial<{ summary: string; note: string; date_deadline: string; responsavel_id: number }>) =>
  apiPatch<{ record: Atividade }>(`/api/atividades/${id}`, body);

export const concluirAtividade = (id: number) =>
  apiPost<{ record: { id: number; done: boolean } }>(`/api/atividades/${id}/concluir`, {});

export const listarAgenda = (from: string, to: string) =>
  apiGet<{ records: ItemAgenda[] }>(`/api/agenda?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
