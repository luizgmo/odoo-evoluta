import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { ContextoDeAvisos, type AvisoDeResultado } from "./avisoDeResultado";

/**
 * Guarda o aviso da vez e o mostra numa faixa azul-noite no alto da folha.
 * Um aviso novo substitui o anterior. Fica até fechar ou até a pessoa mudar de
 * tela — o "Desfazer" de uma pasta não pode ficar à vista na pasta de outro processo.
 * Exceção: o aviso dado logo antes de navegar (salvou o formulário e voltou à lista:
 * `avisar(...); navigate(...)`) sobrevive à mudança de tela que ele mesmo provocou.
 */
const JANELA_DA_NAVEGACAO_MS = 1500;

export const AvisosDeResultado: React.FC<{ children: React.ReactNode; tela?: string }> = ({ children, tela }) => {
  const [aviso, setAviso] = useState<AvisoDeResultado | null>(null);
  const [desfazendo, setDesfazendo] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const chegouEm = useRef(0);

  const avisar = useCallback((novo: AvisoDeResultado) => {
    chegouEm.current = Date.now();
    setFalhou(false);
    setAviso(novo);
  }, []);
  const fechar = useCallback(() => {
    setFalhou(false);
    setAviso(null);
  }, []);
  const valor = useMemo(() => ({ avisar, fechar }), [avisar, fechar]);

  // Mudou de tela: o aviso (e o Desfazer dele) era da anterior — salvo o que acabou de chegar
  useEffect(() => {
    if (Date.now() - chegouEm.current < JANELA_DA_NAVEGACAO_MS) return;
    setAviso(null);
    setFalhou(false);
  }, [tela]);

  const desfazer = async () => {
    if (!aviso?.desfazer) return;
    const desfeito = aviso;
    setDesfazendo(true);
    setFalhou(false);
    try {
      await desfeito.desfazer!();
      // Só fecha se ainda for o mesmo: um aviso novo que chegou no meio fica
      setAviso((atual) => (atual === desfeito ? null : atual));
    } catch {
      setFalhou(true);
    } finally {
      setDesfazendo(false);
    }
  };

  return (
    <ContextoDeAvisos.Provider value={valor}>
      {aviso && (
        <div
          role="status"
          className="nao-imprimir sticky top-0 z-30 mb-4 flex items-center gap-3 rounded-lg bg-moldura px-4 py-3 text-sm text-moldura-foreground shadow-lg"
        >
          <Check className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          <span className="flex-1">
            {aviso.texto}
            {falhou && <span className="ml-2 font-semibold underline decoration-gold underline-offset-4">Não deu para desfazer. Tente de novo.</span>}
          </span>
          {aviso.desfazer && (
            <button
              type="button"
              onClick={desfazer}
              disabled={desfazendo}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-moldura-foreground/35 px-3 font-semibold hover:bg-moldura-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {desfazendo && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Desfazer
            </button>
          )}
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar o aviso"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-moldura-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {children}
    </ContextoDeAvisos.Provider>
  );
};
