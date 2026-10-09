import { apiGet, apiPatch, apiPost } from "./client";

export interface Matrix {
  id: number;
  project_id: number;
  name: string;
  criterios: Array<{ id: number; name: string; peso: number }>;
  alternativas: Array<{ id: number; name: string; total: number; notas: Array<{ criterio_id: number; nota: number }> }>;
  vencedor_id: number | false;
  vencedor_name: string;
}

export function listarMatrizes(projectId: number) {
  return apiGet<{ records: Matrix[] }>(`/api/matriz?project_id=${encodeURIComponent(projectId)}`);
}

export function criarMatriz(data: { project_id: number; name: string; criterios: Array<{ name: string; peso: number }>; alternativas: Array<{ name: string; notas: number[] }> }) {
  return apiPost<{ record: Matrix }>("/api/matriz", data);
}

export function atualizarMatriz(id: number, data: { name?: string }) { return apiPatch<{ record: Matrix }>(`/api/matriz/${id}`, data); }
export function arquivarMatriz(id: number) { return apiPost<{ record: { id: number; active: boolean } }>(`/api/matriz/${id}/arquivar`, {}); }

export function gerarPlanoMatriz(id: number) {
  return apiPost<{ record: { id: number; name: string; project_id: number } }>(`/api/matriz/${id}/gerar-5w2h`, {});
}
