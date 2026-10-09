import { apiGet, apiPatch, apiPost } from "./client";

export type StakeholderPoder = "baixo" | "medio" | "alto";
export type StakeholderPosicao = "apoiador" | "neutro" | "opositor";
export type StakeholderInfluencia = "baixa" | "media" | "alta";

export interface Stakeholder {
  id: number;
  project_id: number;
  project_name: string;
  name: string;
  organizacao: string;
  poder: StakeholderPoder;
  poder_label: string;
  interesse: StakeholderPoder;
  interesse_label: string;
  posicao: StakeholderPosicao;
  posicao_label: string;
  influencia: StakeholderInfluencia;
  influencia_label: string;
  estrategia: string;
}

export interface NovoStakeholder {
  project_id: number;
  name: string;
  organizacao: string;
  poder: StakeholderPoder;
  interesse: StakeholderPoder;
  posicao: StakeholderPosicao;
  influencia: StakeholderInfluencia;
  estrategia: string;
}

export function listarStakeholders(projectId: number): Promise<{ records: Stakeholder[] }> {
  const params = new URLSearchParams({ project_id: String(projectId) });
  return apiGet<{ records: Stakeholder[] }>(`/api/stakeholders?${params.toString()}`);
}

export function criarStakeholder(dados: NovoStakeholder): Promise<{ record: Stakeholder }> {
  return apiPost<{ record: Stakeholder }>("/api/stakeholders", dados);
}

export function atualizarStakeholder(id: number, dados: Partial<Omit<NovoStakeholder, "project_id">>) {
  return apiPatch<{ record: Stakeholder }>(`/api/stakeholders/${id}`, dados);
}

export function arquivarStakeholder(id: number) {
  return apiPost<{ record: { id: number; active: boolean } }>(`/api/stakeholders/${id}/arquivar`, {});
}
