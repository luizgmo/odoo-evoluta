import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiGet, apiPost, caminhoComCsrf, loginOdoo, logoutOdoo } from "./client";

describe("cliente HTTP Evoluta", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "location", { configurable: true, value: { origin: "http://localhost:8080" } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserva a query e o fragmento ao adicionar o token CSRF", () => {
    expect(caminhoComCsrf("/api/projetos?arquivados=1#lista", "token-seguro")).toBe("/api/projetos?arquivados=1&csrf_token=token-seguro#lista");
  });

  it("busca o token da sessão antes de enviar uma escrita", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: "token-seguro" }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ record: { id: 7 } }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const resposta = await apiPost<{ record: { id: number } }>("/api/projetos", { name: "Projeto A" });

    expect(resposta.record.id).toBe(7);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain("csrf_token=token-seguro");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "POST", credentials: "include" });
  });

  it("transforma resposta não JSON em erro acionável", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("<html>erro</html>", { status: 502 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiPost("/api/projetos", { name: "Projeto A" })).rejects.toMatchObject({ status: 502 });
  });

  it("preserva erros por campo e limpa o CSRF em uma resposta de permissão", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Sem permissão", field_errors: { name: "Obrigatório" } }), { status: 403, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiGet("/api/projetos/7")).rejects.toMatchObject({
      status: 403,
      fieldErrors: { name: "Obrigatório" },
    });
  });

  it("não envia CSRF para login e rejeita sessão sem uid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: { uid: 0 } }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(loginOdoo("usuario", "senha")).rejects.toThrow("Usuário ou senha incorretos");
    expect(String(fetchMock.mock.calls[0][0])).not.toContain("csrf_token");
  });

  it("encerra a sessão sem guardar CSRF no navegador", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: true }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await logoutOdoo();
    expect(fetchMock).toHaveBeenCalledWith("/web/session/destroy", expect.objectContaining({ credentials: "include" }));
  });

  it("não transforma um erro JSON devolvido com status 200 em sucesso", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Projeto não encontrado." }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiGet("/api/projetos/999")).rejects.toMatchObject({ status: 404, message: "Projeto não encontrado." });
  });

  it("converte resposta JSON de sessão expirada em erro acionável", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Sessão expirada" }), { status: 401, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiGet("/api/me")).rejects.toMatchObject({ status: 401, message: "Sessão expirada" });
  });

  it("converte timeout em erro de conexão sem confirmar a operação", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    vi.stubGlobal("fetch", fetchMock);

    const requisicao = expect(apiGet("/api/projetos")).rejects.toMatchObject({ status: 408 });
    await vi.advanceTimersByTimeAsync(15_000);
    await requisicao;
    vi.useRealTimers();
  });
});
