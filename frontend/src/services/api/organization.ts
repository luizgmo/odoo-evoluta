import { apiGet, apiPatch, apiPost } from "./client";

export interface Municipio {
  id: number;
  name: string;
  codigo_ibge: string;
  active: boolean;
}

export interface Secretaria {
  id: number;
  name: string;
  municipio_id: number;
  municipio_name: string;
  active: boolean;
}

export interface Departamento {
  id: number;
  name: string;
  secretaria_id: number;
  secretaria_name: string;
  municipio_id: number;
  municipio_name: string;
  active: boolean;
}

export interface UsuarioMunicipal {
  id: number;
  name: string;
  login: string;
  email: string;
  active: boolean;
  role: "super_admin" | "admin_municipal" | "secretario" | "atendente";
  municipio: { id: number; name: string } | null;
  secretaria: { id: number; name: string } | null;
  departamento: { id: number; name: string } | null;
}

export interface PassoOnboarding {
  id: number;
  name: string;
  description: string;
  done: boolean;
}

export const listarMunicipios = () => apiGet<{ records: Municipio[] }>("/api/municipios");
export const criarMunicipio = (body: { name: string; codigo_ibge?: string }) =>
  apiPost<{ record: Municipio }>("/api/municipios", body);
export const atualizarMunicipio = (id: number, body: Partial<Pick<Municipio, "name" | "codigo_ibge" | "active">>) =>
  apiPatch<{ record: Municipio }>(`/api/municipios/${id}`, body);

export const listarSecretarias = (municipioId: number) =>
  apiGet<{ records: Secretaria[] }>(`/api/secretarias?municipio_id=${municipioId}`);
export const criarSecretaria = (body: { name: string; municipio_id: number }) =>
  apiPost<{ record: Secretaria }>("/api/secretarias", body);
export const atualizarSecretaria = (id: number, body: Partial<Pick<Secretaria, "name" | "active">>) =>
  apiPatch<{ record: Secretaria }>(`/api/secretarias/${id}`, body);

export const listarDepartamentos = (secretariaId: number) =>
  apiGet<{ records: Departamento[] }>(`/api/departamentos?secretaria_id=${secretariaId}`);
export const criarDepartamento = (body: { name: string; secretaria_id: number }) =>
  apiPost<{ record: Departamento }>("/api/departamentos", body);
export const atualizarDepartamento = (id: number, body: Partial<Pick<Departamento, "name" | "active">>) =>
  apiPatch<{ record: Departamento }>(`/api/departamentos/${id}`, body);

export const listarUsuarios = () => apiGet<{ records: UsuarioMunicipal[] }>("/api/usuarios");
export const criarUsuario = (body: {
  name: string;
  login: string;
  email?: string;
  password: string;
  role: Exclude<UsuarioMunicipal["role"], "super_admin">;
  municipio_id: number;
  secretaria_id?: number;
  departamento_id?: number;
}) => apiPost<{ record: UsuarioMunicipal }>("/api/usuarios", body);
export const atualizarUsuario = (id: number, body: Partial<{
  name: string;
  email: string;
  password: string;
  active: boolean;
  role: Exclude<UsuarioMunicipal["role"], "super_admin">;
  municipio_id: number;
  secretaria_id: number;
  departamento_id: number;
}>) => apiPatch<{ record: UsuarioMunicipal }>(`/api/usuarios/${id}`, body);

export const listarOnboarding = () => apiGet<{ records: PassoOnboarding[] }>("/api/onboarding");
export const atualizarOnboarding = (id: number, done: boolean) =>
  apiPatch<{ record: PassoOnboarding }>(`/api/onboarding/${id}`, { done });
