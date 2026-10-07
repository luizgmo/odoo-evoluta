import { apiGet, apiPost } from "./client";

export interface Triangulo {
  id: number;
  project_id: number;
  name: string;
  valor_publico: string;
  legitimidade: string;
  capacidade: string;
}

export interface ArvoreObjetivo {
  id: number;
  name: string;
  objetivo_central: string;
  task_id: number | false;
}

export interface ArvoreProblemas {
  id: number;
  project_id: number;
  name: string;
  causas: string;
  problema_central: string;
  efeitos: string;
  objetivo: ArvoreObjetivo | null;
}

export interface TeoriaMudanca {
  id: number;
  project_id: number;
  name: string;
  contexto: string;
  insumos: string;
  atividades: string;
  produtos: string;
  resultados: string;
}

export interface NovaTriangulo {
  project_id: number;
  name: string;
  valor_publico: string;
  legitimidade: string;
  capacidade: string;
}

export interface NovaArvoreProblemas {
  project_id: number;
  name: string;
  causas: string;
  problema_central: string;
  efeitos: string;
}

export interface NovaTeoriaMudanca {
  project_id: number;
  name: string;
  contexto: string;
  insumos: string;
  atividades: string;
  produtos: string;
  resultados: string;
}

export function listarTriangulos(projectId: number) {
  return apiGet<{ records: Triangulo[] }>(`/api/estrategia/triangulo?project_id=${encodeURIComponent(projectId)}`);
}

export function criarTriangulo(data: NovaTriangulo) {
  return apiPost<{ record: Triangulo }>("/api/estrategia/triangulo", data);
}

export function listarArvoresProblemas(projectId: number) {
  return apiGet<{ records: ArvoreProblemas[] }>(`/api/estrategia/arvores-problemas?project_id=${encodeURIComponent(projectId)}`);
}

export function criarArvoreProblemas(data: NovaArvoreProblemas) {
  return apiPost<{ record: ArvoreProblemas }>("/api/estrategia/arvores-problemas", data);
}

export function converterArvoreProblemas(id: number) {
  return apiPost<{ record: ArvoreProblemas; objetivo_id: number }>(`/api/estrategia/arvores-problemas/${id}/converter`, {});
}

export function listarTeorias(projectId: number) {
  return apiGet<{ records: TeoriaMudanca[] }>(`/api/teoria?project_id=${encodeURIComponent(projectId)}`);
}

export function criarTeoria(data: NovaTeoriaMudanca) {
  return apiPost<{ record: TeoriaMudanca }>("/api/teoria", data);
}
