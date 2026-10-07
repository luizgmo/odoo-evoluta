/**
 * SUBSTITUÍVEL: cliente de API de demonstração. Só existe para a tela de
 * recuperação de senha compilar e funcionar sem servidor. Troque pelo
 * cliente HTTP do sistema (axios/fetch), mantendo `apiClient.post(url, corpo)`.
 */

/** Enquanto for `true`, a tela de recuperação avisa ao usuário que nada é enviado. Ponha `false` (ou apague) ao ligar o servidor real. */
export const CLIENTE_DE_DEMONSTRACAO = true;

export const apiClient = {
  async post(_url: string, _corpo?: unknown): Promise<{ data: Record<string, unknown> }> {
    await new Promise((r) => setTimeout(r, 300));
    return { data: {} };
  },
};
