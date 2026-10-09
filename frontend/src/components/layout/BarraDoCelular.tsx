/**
 * Barra inferior no celular: os quatro destinos do dia
 * a dia ao alcance do polegar — três telas (MARCA.destinosDoCelular) e a ação
 * principal (MARCA.acaoPrincipal). O resto continua no menu do cabeçalho.
 * Some do tablet para cima, onde o menu lateral está sempre à vista.
 */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { MARCA } from "@/config/marca";
import { cn } from "@/lib/utils";
import { abaAtiva, acaoPrincipalAtiva, itensDoPerfil, type ItemNavegacao, type Perfil } from "./navegacao";

const FOCO = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold";

export const BarraDoCelular: React.FC<{ userRole?: Perfil }> = ({ userRole }) => {
  const { pathname } = useLocation();

  // Na ordem de MARCA.destinosDoCelular, só os que o perfil enxerga (o item some do menu e some daqui)
  const itens = itensDoPerfil(userRole);
  const destinos = MARCA.destinosDoCelular
    .map((caminho) => itens.find((i) => i.caminho === caminho))
    .filter((i): i is ItemNavegacao => i !== undefined);
  const novaAtiva = acaoPrincipalAtiva(pathname);
  return (
    <nav
      aria-label="Atalhos do celular"
      className="nao-imprimir grid flex-shrink-0 grid-cols-4 border-t border-moldura-foreground/10 bg-moldura pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      {destinos.map(({ caminho, rotulo, curto, icone: Icone }) => {
        const ativo = abaAtiva(caminho, pathname);
        return (
          <Link
            key={caminho}
            to={caminho}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-xs font-semibold transition-colors",
              FOCO,
              ativo ? "text-gold" : "text-moldura-foreground/70 hover:text-moldura-foreground",
            )}
          >
            <Icone className="h-5 w-5" aria-hidden="true" />
            {curto ?? rotulo}
          </Link>
        );
      })}
      <Link
        to={MARCA.acaoPrincipal.caminho}
        aria-label={MARCA.acaoPrincipal.rotulo}
        aria-current={novaAtiva ? "page" : undefined}
        className={cn(
          "col-start-4 flex flex-col items-center gap-1 py-2 text-xs font-semibold transition-colors",
          FOCO,
          novaAtiva ? "text-gold" : "text-moldura-foreground/70 hover:text-moldura-foreground",
        )}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--cta))] text-white">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </span>
        {MARCA.acaoPrincipal.curto}
      </Link>
    </nav>
  );
};
