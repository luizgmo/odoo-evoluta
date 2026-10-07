export interface ModalityStage {
  id: string | number;
  name: string;
  description: string;
  order: number;
  is_required: boolean;
}

export interface Modality {
  /** False = agrupamento extinto (ex.: modalidade antiga), oculto do
   *  formulário mas preservado nos itens que o usam. */
  is_selectable?: boolean;
  id: string | number;
  name: string;
  description: string;
  stages?: ModalityStage[];
}

export interface Process {
  id: string | number;
  code: string;
  description: string;
  modality: Modality;
  modality_id?: string | number; // Usado para referenciar a FK
  object: string;
  estimated_value: string;
  publication_date: string;
  responsible: string;
  opening_date: string | null;
  opening_time: string | null;
  status: string;
  author: string | number;
  company: string | number | null;
  created_at: string;
  updated_at: string;
}

export interface ProcessResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Process[];
}
