import { apiGet, apiPatch, apiPost } from "./client";

export type SituacaoChamado = "open" | "in_progress" | "done" | "closed";
export type SlaStatus = "no_prazo" | "atrasado" | "sem_prazo";

export interface RelacaoChamado { id: number; name: string }
export interface AnexoChamado { id: number; name: string; mimetype: string; size: number; url: string }
export interface ComentarioChamado { id: number; author: string; date: string | false; body: string; anexos: AnexoChamado[] }

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
  estagio_id: number | false;
  estagio_nome: string;
  responsavel: RelacaoChamado | null;
  municipio: RelacaoChamado | null;
  secretaria: RelacaoChamado | null;
  departamento: RelacaoChamado | null;
  anexos: AnexoChamado[];
  comentarios?: ComentarioChamado[];
}

export interface EquipeChamado { id: number; name: string; use_sla: boolean }
export interface EstagioChamado { id: number; name: string; closed: boolean; fold: boolean }

export function listarChamados() { return apiGet<{ records: Chamado[] }>("/api/chamados"); }
export function obterChamado(id: number) { return apiGet<{ record: Chamado }>(`/api/chamados/${id}`); }
export function listarEquipesChamados() { return apiGet<{ records: EquipeChamado[] }>("/api/chamados/equipes"); }
export function listarEstagiosChamados(teamId?: number) { return apiGet<{ records: EstagioChamado[] }>(`/api/chamados/estagios${teamId ? `?team_id=${teamId}` : ""}`); }
export function criarChamado(data: { titulo: string; descricao: string; team_id?: number; prioridade?: string }) { return apiPost<{ record: Chamado }>("/api/chamados", data); }
export function atualizarChamado(id: number, data: { titulo?: string; descricao?: string; team_id?: number; prioridade?: string }) { return apiPatch<{ record: Chamado }>(`/api/chamados/${id}`, data); }
export function atribuirChamado(id: number, data: { team_id?: number; responsavel_id?: number }) { return apiPost<{ record: Chamado }>(`/api/chamados/${id}/atribuir`, data); }
export function moverChamado(id: number, stageId: number) { return apiPost<{ record: Chamado }>(`/api/chamados/${id}/mover`, { stage_id: stageId }); }
export function concluirChamado(id: number) { return apiPost<{ record: Chamado }>(`/api/chamados/${id}/concluir`, {}); }
export function adicionarComentarioChamado(id: number, body: string) { return apiPost<{ record: Chamado }>(`/api/chamados/${id}/comentarios`, { body }); }
export function adicionarAnexoChamado(id: number, data: { name: string; mimetype: string; data: string }) { return apiPost<{ record: Chamado; attachment: AnexoChamado }>(`/api/chamados/${id}/anexos`, data); }
