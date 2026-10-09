/**
 * Cliente HTTP da Mesa → Odoo (mesmo domínio; em dev, o proxy do Vite
 * encaminha /api e /web/session para localhost:8069).
 * Sessão em cookie HttpOnly; nada de token no JS.
 */


const BANCO_ODOO = import.meta.env.VITE_ODOO_DB || (import.meta.env.DEV ? "demo" : "");
const TEMPO_LIMITE_MS = 15_000;
let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

type CorpoJson = Record<string, unknown> | null;

async function buscarTokenCsrf(): Promise<string> {
  const resposta = await fetch("/api/csrf", { credentials: "include" });
  const dados = await lerJson(resposta, "/api/csrf");
  const token = dados && typeof dados.token === "string" ? dados.token : "";
  if (!resposta.ok || !token) throw new ApiError("Sua sessão não está mais disponível. Entre novamente para continuar.", resposta.status || 401, "/api/csrf");
  csrfToken = token;
  return token;
}

async function garantirTokenCsrf(): Promise<string> {
  if (csrfToken) return csrfToken;
  csrfPromise ??= buscarTokenCsrf().finally(() => { csrfPromise = null; });
  return csrfPromise;
}

export function caminhoComCsrf(caminho: string, token: string): string {
  const url = new URL(caminho, globalThis.location.origin);
  url.searchParams.set("csrf_token", token);
  return `${url.pathname}${url.search}${url.hash}`;
}

export class ApiError extends Error {
  readonly status: number;
  readonly caminho: string;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, caminho: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.caminho = caminho;
    this.fieldErrors = fieldErrors;
  }
}

async function lerJson(res: Response, caminho: string): Promise<CorpoJson> {
  const texto = await res.text();
  try {
    return JSON.parse(texto) as CorpoJson;
  } catch {
    throw new ApiError(
      res.status === 401 || res.status === 403
        ? "Sua sessão não está mais disponível. Entre novamente para continuar."
        : "O servidor respondeu em um formato inválido. Tente de novo em instantes.",
      res.status || 500,
      caminho,
    );
  }
}

function mensagemDoServidor(dados: CorpoJson, fallback: string): string {
  if (dados && typeof dados.error === "string" && dados.error.trim()) return dados.error;
  return fallback;
}

async function requisicaoJson<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  const controlador = new AbortController();
  const timer = globalThis.setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);
  const method = (init.method || "GET").toUpperCase();
  const exigeCsrf = !["GET", "HEAD", "OPTIONS"].includes(method) && !caminho.startsWith("/web/") && caminho !== "/api/csrf";
  try {
    const url = exigeCsrf ? caminhoComCsrf(caminho, await garantirTokenCsrf()) : caminho;
    const res = await fetch(url, { ...init, credentials: "include", signal: controlador.signal });
    const dados = await lerJson(res, caminho);
    if (!res.ok) {
      const corpo = dados as Record<string, unknown> | null;
      const fieldErrors = corpo?.field_errors && typeof corpo.field_errors === "object"
        ? Object.fromEntries(Object.entries(corpo.field_errors).filter(([, value]) => typeof value === "string"))
        : {};
      if (res.status === 401 || res.status === 403) csrfToken = null;
      throw new ApiError(
        mensagemDoServidor(dados, `Não foi possível concluir a solicitação (${res.status}).`),
        res.status,
        caminho,
        fieldErrors,
      );
    }
    return dados as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("A conexão demorou. Tente de novo em instantes.", 408, caminho);
    }
    throw new ApiError("Não foi possível conectar ao servidor. Tente de novo em instantes.", 0, caminho);
  } finally {
    globalThis.clearTimeout(timer);
  }
}

/** GET autenticado pela sessão. Fora da sessão, o Odoo devolve erro tratável. */
export async function apiGet<T>(caminho: string): Promise<T> {
  const dados = await requisicaoJson<T>(caminho);
  if (dados && typeof dados === "object" && "error" in (dados as Record<string, unknown>)) {
    const corpo = dados as Record<string, unknown>;
    throw new ApiError(typeof corpo.error === "string" ? corpo.error : "Registro não encontrado.", 404, caminho);
  }
  return dados;
}

export interface SessaoOdoo {
  uid: number;
  username: string;
  name: string;
  is_admin?: boolean;
  is_system?: boolean;
  is_internal_user?: boolean;
}

/** Login real no Odoo (cria a sessão em cookie). */
export async function loginOdoo(login: string, password: string): Promise<SessaoOdoo> {
  csrfToken = null;
  const dados = await requisicaoJson<{ result?: SessaoOdoo }>("/web/session/authenticate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { db: BANCO_ODOO, login, password },
    }),
  });
  const resultado = dados.result;
  if (!resultado || !resultado.uid) throw new Error("Usuário ou senha incorretos.");
  return resultado;
}

/** Quem está na sessão atual (restaura o login ao recarregar). */
export async function sessaoAtual(): Promise<SessaoOdoo | null> {
  try {
    const dados = await requisicaoJson<{ result?: SessaoOdoo }>("/web/session/get_session_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: {} }),
    });
    const resultado = dados.result;
    return resultado && resultado.uid ? resultado : null;
  } catch {
    return null;
  }
}

/** Encerra a sessão no Odoo (sem falhar se já caiu). */
export async function logoutOdoo(): Promise<void> {
  csrfToken = null;
  try {
    await requisicaoJson("/web/session/destroy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: {} }),
    });
  } catch {
    /* sessão já caiu */
  }
}

/** POST JSON autenticado (rotas com csrf=False). */
export async function apiPost<T>(caminho: string, corpo: unknown): Promise<T> {
  return requisicaoJson<T>(caminho, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo ?? {}),
  });
}

/** PATCH JSON autenticado para alterações parciais. */
export async function apiPatch<T>(caminho: string, corpo: unknown): Promise<T> {
  return requisicaoJson<T>(caminho, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo ?? {}),
  });
}
