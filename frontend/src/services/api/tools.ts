import { apiGet, apiPost } from "./client";

export interface CincoPorques {
  id: number;
  project_id: number;
  name: string;
  problema: string;
  pq1: string;
  pq2: string;
  pq3: string;
  pq4: string;
  pq5: string;
  causa_raiz: string;
  task_id: number | false;
  task_name: string;
}

export interface NovoCincoPorques {
  project_id: number;
  name: string;
  problema: string;
  pq1: string;
  pq2: string;
  pq3: string;
  pq4: string;
  pq5: string;
  causa_raiz: string;
}

export interface Risco {
  id: number;
  project_id: number;
  name: string;
  probabilidade: "baixa" | "media" | "alta";
  probabilidade_label: string;
  impacto: "baixo" | "medio" | "alto";
  impacto_label: string;
  mitigacao: string;
  responsavel_id: number | false;
  responsavel_name: string;
  task_id: number | false;
  task_name: string;
}

export interface NovoRisco {
  project_id: number;
  name: string;
  probabilidade: Risco["probabilidade"];
  impacto: Risco["impacto"];
  mitigacao: string;
  responsavel_id: number | false;
}

export function listarPorques(projectId: number) {
  return apiGet<{ records: CincoPorques[] }>(`/api/porques?project_id=${encodeURIComponent(projectId)}`);
}

export function criarPorques(dados: NovoCincoPorques) {
  return apiPost<{ record: CincoPorques }>("/api/porques", dados);
}

export function criarAcaoPorques(id: number) {
  return apiPost<{ record: { id: number; task_id: number; task_name: string } }>(`/api/porques/${id}/criar-acao`, {});
}

export function listarRiscos(projectId: number) {
  return apiGet<{ records: Risco[] }>(`/api/riscos?project_id=${encodeURIComponent(projectId)}`);
}

export function criarRisco(dados: NovoRisco) {
  return apiPost<{ record: Risco }>("/api/riscos", dados);
}

export function criarAcaoRisco(id: number) {
  return apiPost<{ record: { id: number; task_id: number; task_name: string } }>(`/api/riscos/${id}/criar-acao`, {});
}

export interface IshikawaCausa {
  id: number;
  categoria: "pessoas" | "processos" | "tecnologia" | "recursos" | "ambiente" | "gestao";
  categoria_label: string;
  descricao: string;
  eh_principal: boolean;
}

export interface Ishikawa {
  id: number;
  project_id: number;
  name: string;
  problema: string;
  causa_raiz: string;
  task_id: number | false;
  task_name: string;
  causas: IshikawaCausa[];
}

export interface NovaIshikawaCausa {
  categoria: IshikawaCausa["categoria"];
  descricao: string;
  eh_principal: boolean;
}

export function listarIshikawa(projectId: number) {
  return apiGet<{ records: Ishikawa[] }>(`/api/ishikawa?project_id=${encodeURIComponent(projectId)}`);
}

export function criarIshikawa(dados: { project_id: number; name: string; problema: string; causas: NovaIshikawaCausa[] }) {
  return apiPost<{ record: Ishikawa }>("/api/ishikawa", dados);
}

export function definirCausaRaizIshikawa(id: number) {
  return apiPost<{ record: Ishikawa }>(`/api/ishikawa/${id}/definir-causa-raiz`, {});
}

export function criarAcaoIshikawa(id: number) {
  return apiPost<{ record: { id: number; task_id: number; task_name: string } }>(`/api/ishikawa/${id}/criar-acao`, {});
}

export interface UsuarioOdoo { id: number; name: string; email: string }
export interface Raci {
  id: number;
  name: string;
  task_id: number;
  task_name: string;
  responsible_id: number;
  responsible_name: string;
  accountable_id: number;
  accountable_name: string;
  consulted: UsuarioOdoo[];
  informed: UsuarioOdoo[];
}

export function listarUsuarios() {
  return apiGet<{ records: UsuarioOdoo[] }>("/api/usuarios");
}

export function listarRaci(taskId: number) {
  return apiGet<{ records: Raci[] }>(`/api/raci?task=${encodeURIComponent(taskId)}`);
}

export function criarRaci(dados: { task_id: number; name: string; responsible_id: number; accountable_id: number; consulted_ids: number[]; informed_ids: number[] }) {
  return apiPost<{ record: Raci }>("/api/raci", dados);
}
