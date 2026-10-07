import { apiGet, apiPost } from "./client";

export type SituacaoChamado = "open" | "in_progress" | "done" | "closed";
export type SlaStatus = "no_prazo" | "atrasado" | "sem_prazo";

export interface Chamado {
  id: number;
  codigo: string;
  titulo: string;
  descricao: string;
  situacao: string;
  situacao_key: SituacaoChamado;
  prioridade: "baixa" | "normal" | "alta" | "muito_alta";
  prioridade_label: string;
  prazo: string | false;
  sla_status: SlaStatus;
  equipe_id: number | false;
  equipe_nome: string;
  estagio_nome: string;
}

export interface EquipeChamado {
  id: number;
  name: string;
  use_sla: boolean;
}

export function listarChamados() {
  return apiGet<{ records: Chamado[] }>("/api/chamados");
}

export function listarEquipesChamados() {
  return apiGet<{ records: EquipeChamado[] }>("/api/chamados/equipes");
}

export function criarChamado(data: { titulo: string; descricao: string; team_id?: number }) {
  return apiPost<{ record: Chamado }>("/api/chamados", data);
}
