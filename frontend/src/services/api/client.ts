/**
 * Cliente HTTP da Mesa → Odoo (mesmo domínio; em dev, o proxy do Vite
 * encaminha /api e /web/session para localhost:8069).
 * Sessão em cookie HttpOnly; nada de token no JS.
 */

/** Enquanto for `true`, a tela de recuperação avisa que nada é enviado. */
export const CLIENTE_DE_DEMONSTRACAO = true;

const BANCO_ODOO = "demo";

async function lerJson(res: Response) {
  const texto = await res.text();
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error("Resposta inválida do servidor.");
  }
}

/** GET autenticado pela sessão. Fora da sessão, o Odoo devolve o login (HTML). */
export async function apiGet<T>(caminho: string): Promise<T> {
  const res = await fetch(caminho, { credentials: "include" });
  if (!res.ok) throw new Error(`Falha ao buscar ${caminho}.`);
  const dados = await lerJson(res);
  if (dados && typeof dados === "object" && "error" in (dados as Record<string, unknown>)) {
    throw new Error("Registro não encontrado.");
  }
  return dados as T;
}

export interface SessaoOdoo {
  uid: number;
  username: string;
  name: string;
}

/** Login real no Odoo (cria a sessão em cookie). */
export async function loginOdoo(login: string, password: string): Promise<SessaoOdoo> {
  const res = await fetch("/web/session/authenticate", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { db: BANCO_ODOO, login, password },
    }),
  });
  const dados = await lerJson(res);
  const resultado = (dados as { result?: SessaoOdoo }).result;
  if (!resultado || !resultado.uid) throw new Error("Usuário ou senha incorretos.");
  return resultado;
}

/** Quem está na sessão atual (restaura o login ao recarregar). */
export async function sessaoAtual(): Promise<SessaoOdoo | null> {
  try {
    const res = await fetch("/web/session/get_session_info", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: {} }),
    });
    const dados = await lerJson(res);
    const resultado = (dados as { result?: SessaoOdoo }).result;
    return resultado && resultado.uid ? resultado : null;
  } catch {
    return null;
  }
}

/** Encerra a sessão no Odoo (sem falhar se já caiu). */
export async function logoutOdoo(): Promise<void> {
  try {
    await fetch("/web/session/destroy", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: {} }),
    });
  } catch {
    /* sessão já caiu */
  }
}

export const apiClient = {
  async post(_url: string, _corpo?: unknown): Promise<{ data: Record<string, unknown> }> {
    await new Promise((r) => setTimeout(r, 300));
    return { data: {} };
  },
};
