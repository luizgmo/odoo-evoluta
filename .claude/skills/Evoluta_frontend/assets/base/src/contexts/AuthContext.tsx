/**
 * SUBSTITUÍVEL: autenticação de demonstração. Não fala com servidor nenhum:
 * qualquer usuário e senha (com 3+ caracteres) entram, e a "sessão" fica no
 * localStorage.
 *
 * Perfis de demonstração, pelo nome digitado:
 *   - "admin": vê o menu completo (use este para conferir a moldura);
 *   - "master": vê só a faixa do alto, sem menu lateral nem barra do celular;
 *   - "operador": vê só o menu de operação;
 *   - "gestor" ou qualquer outro nome: entra como gestor.
 *
 * Em um sistema real, troque o miolo de login/logout/useEffect pela autenticação
 * do sistema, MANTENDO a forma do contexto
 * ({ user, isAuthenticated, isLoading, login, logout }) — a moldura só usa isso.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MARCA, chaveDoSistema } from "@/config/marca";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) setUser(JSON.parse(salvo));
    } catch {
      /* sem sessão guardada */
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    await new Promise((r) => setTimeout(r, 300));
    if (username.trim().length < 3 || password.length < 3) {
      throw new Error("Usuário ou senha incorretos.");
    }
    const nome = username.trim();
    // Só para ver os menus de cada perfil: o usuário "admin", "master" ou "operador"
    // entra com esse perfil; qualquer outro nome entra como gestor
    const role: Perfil = (PERFIS_DE_DEMONSTRACAO as readonly string[]).includes(nome.toLowerCase())
      ? (nome.toLowerCase() as Perfil)
      : "gestor";
    const novo: Usuario = { username: nome, email: `${nome}@exemplo.org`, role };
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch {
      /* segue sem guardar */
    }
    setUser(novo);
  }, []);

  const logout = useCallback(() => {
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
