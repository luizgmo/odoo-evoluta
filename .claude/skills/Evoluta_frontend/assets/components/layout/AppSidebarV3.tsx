/**
 * Menu lateral (Workspace Evoluta).
 *
 * Coluna azul colada à faixa do alto. Aberto, mostra ícone e nome; recolhido,
 * só os ícones (o nome aparece ao passar o mouse ou no foco do teclado). Quem
 * abre e fecha é o botão da faixa (AppHeaderV3). No celular o menu some e a
 * navegação vai para a gaveta do cabeçalho.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { MARCA } from "@/config/marca";
import { ITENS_DO_PE, abaAtiva, acaoPrincipalAtiva, menuDoPerfil, type ItemNavegacao, type Perfil } from "./navegacao";

interface AppSidebarV3Props {
  userRole?: Perfil;
  /** Recolhido: só os ícones. */
  aberto?: boolean;
}

const Item: React.FC<{ item: ItemNavegacao; ativo: boolean; aberto: boolean }> = ({ item, ativo, aberto }) => {
  const { caminho, rotulo, icone: Icone } = item;
  const link = (
    // Link (e não NavLink): a regra de item aceso é a nossa, que inclui "/"
    <Link
      to={caminho}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "relative flex items-center rounded-lg text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        aberto ? "gap-3 px-3 py-2.5" : "mx-auto h-10 w-10 justify-center",
        ativo
          ? "bg-moldura-2 font-semibold text-moldura-foreground before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r before:bg-accent"
          : "text-moldura-foreground/75 hover:bg-moldura-foreground/10 hover:text-moldura-foreground",
      )}
    >
      <Icone className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
      <span className={aberto ? "truncate" : "sr-only"}>{rotulo}</span>
    </Link>
  );
  if (aberto) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{rotulo}</TooltipContent>
    </Tooltip>
  );
};

const AppSidebarV3: React.FC<AppSidebarV3Props> = ({ userRole = "operador", aberto = true }) => {
  const { pathname } = useLocation();

  // O perfil master (Evoluta) não navega pelas telas do cliente.
  if (userRole === "master") return null;

  const grupos = menuDoPerfil(userRole);
  const novaAtiva = acaoPrincipalAtiva(pathname);
  // A ação principal (MARCA.acaoPrincipal): sempre no alto do menu
  const botaoNova = (
    <Link
      to={MARCA.acaoPrincipal.caminho}
      aria-current={novaAtiva ? "page" : undefined}
      className={cn(
        "flex items-center rounded-lg bg-[hsl(var(--cta))] font-semibold text-white transition-colors hover:brightness-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moldura-foreground",
        aberto ? "gap-2 px-3 py-2.5 text-sm" : "mx-auto h-10 w-10 justify-center",
      )}
    >
      <Plus className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
      <span className={aberto ? "truncate" : "sr-only"}>{MARCA.acaoPrincipal.rotulo}</span>
    </Link>
  );

  return (
    <nav
      id="menu-lateral"
      aria-label="Seções do sistema"
      className={cn(
        "nao-imprimir rolagem-moldura hidden shrink-0 flex-col gap-5 overflow-y-auto overflow-x-hidden bg-moldura px-3 pb-4 pt-2 md:flex",
        "transition-[width] duration-200 motion-reduce:transition-none",
        aberto ? "w-64" : "w-[4.25rem]",
      )}
    >
      {aberto ? (
        botaoNova
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{botaoNova}</TooltipTrigger>
          <TooltipContent side="right">{MARCA.acaoPrincipal.rotulo}</TooltipContent>
        </Tooltip>
      )}
      {grupos.map(({ titulo, itens }) => (
        <div key={titulo}>
          {aberto ? (
            <p className="mb-1 px-3 font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-moldura-foreground/50">
              {titulo}
            </p>
          ) : (
            <span className="mx-auto mb-2 block h-px w-6 bg-moldura-foreground/20" aria-hidden="true" />
          )}
          <ul className="space-y-0.5" aria-label={titulo}>
            {itens.map((item) => (
              <li key={item.caminho}>
                <Item item={item} ativo={abaAtiva(item.caminho, pathname)} aberto={aberto} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {/* Pé do menu: preferências da pessoa */}
      <ul className="mt-auto space-y-0.5 border-t border-moldura-foreground/10 pt-3" aria-label="Preferências">
        {ITENS_DO_PE.map((item) => (
          <li key={item.caminho}>
            <Item item={item} ativo={abaAtiva(item.caminho, pathname)} aberto={aberto} />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AppSidebarV3;
