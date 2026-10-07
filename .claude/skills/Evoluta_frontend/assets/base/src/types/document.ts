export interface Document {
  id: string;
  name: string;
  title?: string;
  description: string;
  document_type: {
    id: string;
    name: string;
  };
  process: {
    id: string;
    code: string;
    description: string;
  } | null;
  user: {
    id: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
  status?: string;
  type: string;
  session_id: string;
  has_completed_generated_doc?: boolean;
  completed_generated_doc_id?: string;
  // Dispensa da etapa (documento marcado como não necessário)
  dismissed_at?: string | null;
  dismissed_by?: number | null;
  dismiss_reason?: string;
  // Biblioteca de modelos
  is_exemplar?: boolean;
  download?: () => Promise<any>;
  createElement?: (tag: string) => HTMLElement;
  body?: HTMLElement;
}

export interface DocumentResponse {
  data: Document;
}

export interface DocumentListResponse {
  data: Document[];
}

export interface DocumentCreateResponse {
  data: Document;
  message: string;
}
