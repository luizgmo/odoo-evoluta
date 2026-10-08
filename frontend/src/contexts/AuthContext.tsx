/**
 * Autenticação real no Odoo (sessão em cookie). Mantém a forma do contexto
 * ({ user, isAuthenticated, isLoading, login, logout }).
 * O perfil administrativo vem dos indicadores reais da sessão Odoo;
 * o servidor continua sendo a fonte das permissões da conta.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MARCA, chaveDoSistema } from "@/config/marca";
import { loginOdoo, logoutOdoo, sessaoAtual } from "@/services/api/client";

/** Única definição dos perfis: ProtectedRoute, RequerPerfil, navegacao e Unauthorized importam este tipo. */
export type Perfil = "master" | "admin" | "gestor" | "operador";

/** Mantido apenas para a dica de desenvolvimento; não define permissões reais. */
export const PERFIS_DE_DEMONSTRACAO: readonly Perfil[] = ["admin", "master", "operador", "gestor"];

/** Texto da dica do Login para cada perfil; um perfil novo precisa de uma linha aqui. */
export const DESCRICAO_DO_PERFIL: Record<Perfil, string> = {
  admin: "vê o menu completo",
  master: "vê só a faixa do alto",
  operador: "vê só o menu de operação",
  gestor: `vê o menu e ${MARCA.campos.paineisTrilha.toLowerCase()}, sem a administração`,
};

/** Nome legível do perfil (faixa do alto, gaveta do celular e tela "sem permissão"); um perfil novo precisa de uma linha aqui. */
export const NOME_DO_PERFIL: Record<Perfil, string> = { master: "master", admin: "administrador", gestor: "gestor", operador: "operador" };

export interface Usuario {
  username: string;
  email: string;
  role: Perfil;
}

interface AuthContextValue {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const CHAVE = chaveDoSistema("sessao-demo");
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** O menu administrativo acompanha os flags reais enviados pelo Odoo, não o login digitado. */
const paraUsuario = (sessao: { username: string; is_admin?: boolean; is_system?: boolean }): Usuario => {
  const curto = sessao.username.trim();
  const role: Perfil = sessao.is_admin || sessao.is_system ? "admin" : "gestor";
  return { username: curto, email: curto.includes("@") ? curto : `${curto}@exemplo.org`, role };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let vivo = true;
    sessaoAtual()
      .then((sessao) => {
        if (!vivo || !sessao) return;
        setUser(paraUsuario(sessao));
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
    const sessao = await loginOdoo(username.trim(), password);
    const novo = paraUsuario(sessao);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch {
      /* segue sem guardar */
    }
    setUser(novo);
  }, []);

  const logout = useCallback(() => {
    logoutOdoo().catch(() => {});
    try {
      localStorage.removeItem(CHAVE);
    } catch {
      /* nada a limpar */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
};
