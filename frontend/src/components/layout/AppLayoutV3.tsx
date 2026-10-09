/**
 * Moldura Workspace Evoluta: faixa azul no alto, menu lateral azul
 * que abre e recolhe, e o conteúdo como uma folha (marfim no claro) sobre o azul.
 */

import React, { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { destinoDoAtalho } from "@/features/preferencias/preferencias";
import { useMenuLateral } from "./useMenuLateral";
import { AvisosDeResultado } from "@/components/mesa/AvisosDeResultado";

import AppSidebarV3 from "./AppSidebarV3";
import AppHeaderV3 from "./AppHeaderV3";
import { BarraDoCelular } from "./BarraDoCelular";
import { useAuth } from "@/contexts/AuthContext";

const AppLayoutV3 = () => {
  const { user } = useAuth();
  const menu = useMenuLateral();
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const folha = useRef<HTMLElement>(null);

  // Atalhos Alt+letra (ver ATALHOS em preferencias.ts); não disparam enquanto se escreve
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && (alvo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName))) return;
      const destino = destinoDoAtalho(e);
      if (destino) {
        e.preventDefault();
        navigate(destino);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [navigate]);

  // A folha é quem rola: ao trocar de tela, volta ao topo (senão a tela nova
  // abriria rolada no ponto em que a anterior estava). Com #âncora, quem rola é a
  // própria tela até a seção pedida — voltar ao topo aqui desfaria isso.
  useEffect(() => {
    if (!hash) folha.current?.scrollTo?.({ top: 0 });
  }, [pathname, hash]);

  return (
    <>
      {/* h-dvh: no celular, a altura visível de fato (com a barra do navegador), para a barra de atalhos não ficar por baixo dela */}
      {/* Sem viewport-fit=cover o próprio navegador já afasta a tela do recorte da câmera
          (e as folgas abaixo valem 0). Se um dia a tela for até as bordas, estas folgas
          protegem a moldura — mas diálogos e gavetas (position: fixed) precisariam da sua */}
      <div className="flex h-screen w-full flex-col overflow-hidden bg-moldura pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] pt-[env(safe-area-inset-top,0px)] supports-[height:100dvh]:h-dvh">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-md bg-card px-4 py-2 text-sm font-semibold text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-gold"
        >
          Pular para o conteúdo
        </a>
        <AppHeaderV3 menuAberto={menu.aberto} onAlternarMenu={menu.alternar} />
        <div className="flex min-h-0 flex-1">
          <AppSidebarV3 userRole={user?.role} aberto={menu.aberto} />
          {/* Folha: no celular ocupa a largura toda; do tablet para cima assenta
            sobre o azul, com margem e cantos arredondados. */}
          <main
            id="conteudo"
            ref={folha}
            tabIndex={-1}
            className="min-h-0 flex-1 overflow-auto bg-background p-4 focus:outline-none md:mr-4 md:rounded-b-none md:rounded-t-xl md:p-6 md:shadow-[0_24px_48px_-24px_rgb(0_0_0/0.55)] lg:mr-5"
          >
            <AvisosDeResultado tela={pathname}>
              <Outlet />
            </AvisosDeResultado>
          </main>
        </div>
        <BarraDoCelular userRole={user?.role} />
      </div>
    </>
  );
};

export default AppLayoutV3;
