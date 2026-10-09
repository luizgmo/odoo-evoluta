import { apiGet, apiPatch, apiPost } from "./client";

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
  five_w2h_id?: number | false;
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

export function atualizarTriangulo(id: number, data: Partial<Omit<NovaTriangulo, "project_id">>) { return apiPatch<{ record: Triangulo }>(`/api/estrategia/triangulo/${id}`, data); }
export function arquivarTriangulo(id: number) { return apiPost<{ record: { id: number; active: boolean } }>(`/api/estrategia/triangulo/${id}/arquivar`, {}); }

export function converterArvoreProblemas(id: number) {
  return apiPost<{ record: ArvoreProblemas; objetivo_id: number }>(`/api/estrategia/arvores-problemas/${id}/converter`, {});
}

export function gerarPlanoArvoreObjetivos(id: number) { return apiPost<{ record: { id: number; name: string; project_id: number } }>(`/api/estrategia/arvores-objetivos/${id}/gerar-5w2h`, {}); }
export function criarAcaoArvoreObjetivos(id: number) { return apiPost<{ record: { id: number; task_id: number } }>(`/api/estrategia/arvores-objetivos/${id}/criar-acao`, {}); }
export function atualizarArvoreProblemas(id: number, data: Partial<Omit<NovaArvoreProblemas, "project_id">>) { return apiPatch<{ record: ArvoreProblemas }>(`/api/estrategia/arvores-problemas/${id}`, data); }
export function arquivarArvoreProblemas(id: number) { return apiPost<{ record: { id: number; active: boolean } }>(`/api/estrategia/arvores-problemas/${id}/arquivar`, {}); }

export function listarTeorias(projectId: number) {
  return apiGet<{ records: TeoriaMudanca[] }>(`/api/teoria?project_id=${encodeURIComponent(projectId)}`);
}

export function criarTeoria(data: NovaTeoriaMudanca) {
  return apiPost<{ record: TeoriaMudanca }>("/api/teoria", data);
}
export function atualizarTeoria(id: number, data: Partial<Omit<NovaTeoriaMudanca, "project_id">>) { return apiPatch<{ record: TeoriaMudanca }>(`/api/teoria/${id}`, data); }
export function arquivarTeoria(id: number) { return apiPost<{ record: { id: number; active: boolean } }>(`/api/teoria/${id}/arquivar`, {}); }
