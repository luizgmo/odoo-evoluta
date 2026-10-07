/**
 * Autenticação real no Odoo (sessão em cookie). Mantém a forma do contexto
 * ({ user, isAuthenticated, isLoading, login, logout }).
 * O perfil continua pelo nome na demonstração (admin/master/operador/gestor);
 * o servidor decide o que cada conta pode ver (grupos do Odoo).
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MARCA, chaveDoSistema } from "@/config/marca";
import { loginOdoo, logoutOdoo, sessaoAtual } from "@/services/api/client";

/** Única definição dos perfis: ProtectedRoute, RequerPerfil, navegacao e Unauthorized importam este tipo. */
export type Perfil = "master" | "admin" | "gestor" | "operador";

/** Nomes de usuário que entram com o perfil de mesmo nome na demonstração (a dica do Login lê esta lista). */
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

/** Perfil pelo nome (demonstração de menus): admin/master/operador entram com
 * esse perfil; qualquer outro nome entra como gestor. O servidor separa o acesso real. */
const paraUsuario = (nome: string): Usuario => {
  const curto = nome.trim();
  const role: Perfil = (PERFIS_DE_DEMONSTRACAO as readonly string[]).includes(curto.toLowerCase())
    ? (curto.toLowerCase() as Perfil)
    : "gestor";
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
        setUser(paraUsuario(sessao.username));
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
    const novo = paraUsuario(sessao.username);
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
