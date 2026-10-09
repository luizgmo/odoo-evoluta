export interface ProjectReference {
  id: string | number;
  name: string;
}

export interface ProjectInfo {
  municipio: ProjectReference | null;
  secretaria: ProjectReference | null;
  departamento: ProjectReference | null;
  responsavel: ProjectReference | null;
  etapa: ProjectReference | null;
  date_deadline: string | null;
}

/** DTO de apresentação do projeto municipal retornado pela API Evoluta. */
export interface Process {
  id: string | number;
  code: string;
  description: string;
  object: string;
  estimated_value: string;
  responsible: string;
  status: string;
  author: string | number;
  company: string | number | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  projectInfo: ProjectInfo;
}

export interface ProcessResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Process[];
}
