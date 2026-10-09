/**
 * Autenticação real no Odoo (sessão em cookie) e perfil municipal derivado
 * dos grupos retornados pela API da Evoluta.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, loginOdoo, logoutOdoo, sessaoAtual, type SessaoOdoo } from "@/services/api/client";

export type Perfil = "super_admin" | "admin_municipal" | "secretario" | "atendente";

export interface Permissoes {
  manage_municipios: boolean;
  manage_organization: boolean;
  manage_users: boolean;
  manage_projects: boolean;
  archive_projects: boolean;
  manage_templates: boolean;
  approve_5w2h: boolean;
  view_indicators: boolean;
  view_audit: boolean;
  create_tickets: boolean;
  manage_tickets: boolean;
  assign_tickets: boolean;
}

export interface VinculoOrganizacional {
  id: number;
  name: string;
}

export interface Usuario {
  id: number;
  username: string;
  name: string;
  email: string;
  role: Perfil;
  groups: string[];
  isSystem: boolean;
  scopeReady: boolean;
  municipio: VinculoOrganizacional | null;
  secretaria: VinculoOrganizacional | null;
  departamento: VinculoOrganizacional | null;
  permissions: Permissoes;
}

interface PerfilApi {
  id: number;
  name: string;
  login: string;
  email: string;
  role: Perfil;
  groups?: string[];
  is_system?: boolean;
  scope_ready?: boolean;
  municipio?: VinculoOrganizacional | null;
  secretaria?: VinculoOrganizacional | null;
  departamento?: VinculoOrganizacional | null;
  permissions: Permissoes;
}

interface AuthContextValue {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: keyof Permissoes) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const paraUsuario = (perfil: PerfilApi): Usuario => ({
  id: perfil.id,
  username: perfil.login,
  name: perfil.name,
  email: perfil.email || perfil.login,
  role: perfil.role,
  groups: perfil.groups ?? [],
  isSystem: Boolean(perfil.is_system),
  scopeReady: Boolean(perfil.scope_ready),
  municipio: perfil.municipio ?? null,
  secretaria: perfil.secretaria ?? null,
  departamento: perfil.departamento ?? null,
  permissions: perfil.permissions,
});

const buscarPerfil = async (): Promise<Usuario> => {
  const resposta = await apiGet<{ record: PerfilApi }>("/api/me");
  if (!resposta.record) throw new Error("Não foi possível carregar o perfil da conta.");
  return paraUsuario(resposta.record);
};

export const NOME_DO_PERFIL: Record<Perfil, string> = {
  super_admin: "super administrador Evoluta",
  admin_municipal: "administrador municipal",
  secretario: "secretário",
  atendente: "atendente",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.race<SessaoOdoo | null>([
      sessaoAtual(),
      new Promise<null>((resolve) => globalThis.setTimeout(() => resolve(null), 5_000)),
    ])
      .then(async (sessao) => {
        if (!sessao || !vivo) return;
        const perfil = await buscarPerfil();
        if (vivo) setUser(perfil);
      })
      .catch(() => {})
      .finally(() => {
        if (vivo) setIsLoading(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    await loginOdoo(username.trim(), password);
    const novo = await buscarPerfil();
    // O cookie HttpOnly do Odoo é a única fonte de sessão. Não persistimos
    // perfil, tenant ou permissões no navegador para evitar estado municipal
    // obsoleto depois de logout, troca de conta ou expiração da sessão.
    setUser(novo);
  }, []);

  const logout = useCallback(() => {
    logoutOdoo().catch(() => {});
    setUser(null);
  }, []);

  const can = useCallback(
    (permission: keyof Permissoes) => Boolean(user?.permissions[permission]),
    [user],
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, login, logout, can }),
    [user, isLoading, login, logout, can],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
};
