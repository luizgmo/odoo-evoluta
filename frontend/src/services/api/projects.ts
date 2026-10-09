import { apiGet, apiPatch, apiPost } from "./client";

export interface EtapaProjeto {
  id: number;
  name: string;
  fold: boolean;
}

export interface ProjetoAtualizacao {
  name: string;
  orcamento: number;
  municipio_id?: number;
  secretaria_id?: number;
  departamento_id?: number;
  date_deadline: string | null;
  responsavel_id?: number;
  etapa_id?: number;
}

export const listarEtapasProjeto = () =>
  apiGet<{ records: EtapaProjeto[] }>("/api/projeto-etapas");

export const atualizarProjeto = (id: number, body: ProjetoAtualizacao) =>
  apiPatch<{ record: unknown }>(`/api/projetos/${id}`, body);

export const arquivarProjeto = (id: number) =>
  apiPost<{ record: { id: number; active: boolean } }>(`/api/projetos/${id}/arquivar`, {});
