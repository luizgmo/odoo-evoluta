import { apiGet } from "./client";

export interface RegistroAuditoria {
  id: number;
  action: string;
  action_label: string;
  name: string;
  model: string;
  res_id: number;
  res_name: string;
  details: string;
  user: { id: number; name: string } | null;
  municipio: { id: number; name: string } | null;
  project_id: number | false;
  created_at: string | false;
}

export function listarAuditoria(filtros: { project_id?: number; from?: string; to?: string } = {}) {
  const params = new URLSearchParams();
  if (filtros.project_id) params.set("project_id", String(filtros.project_id));
  if (filtros.from) params.set("from", filtros.from);
  if (filtros.to) params.set("to", filtros.to);
  const query = params.toString();
  return apiGet<{ records: RegistroAuditoria[] }>(`/api/auditoria${query ? `?${query}` : ""}`);
}
