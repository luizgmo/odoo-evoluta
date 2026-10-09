/**
 * Faixa do alto (Workspace Evoluta).
 *
 * Azul do fundo do logo Evoluta, com o logo do produto (MARCA.logo) e a assinatura
 * "uma solução Evoluta". No celular, o botão de menu abre uma gaveta azul com os
 * mesmos grupos, itens e item aceso do menu lateral (ver navegacao.ts).
 */

import React from "react";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth, NOME_DO_PERFIL } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { ITENS_DO_PE, abaAtiva, acaoPrincipalAtiva, menuDoPerfil } from "./navegacao";
import { BuscaRapida } from "./BuscaRapida";
import { AssinaturaEvoluta } from "./AssinaturaEvoluta";
import { APP_VERSION, APP_GIT_SHA } from "@/constants";
import { MARCA } from "@/config/marca";

/** Botões de ícone sobre a faixa azul (claro sobre escuro nos dois temas). */
const BOTAO_NA_FAIXA =
  "text-moldura-foreground/80 hover:bg-moldura-foreground/10 hover:text-moldura-foreground focus-visible:ring-gold focus-visible:ring-offset-0";

/** Item da gaveta do celular: o mesmo desenho do menu lateral (item aceso com barrinha). Repassa ref e props para o SheetClose. */
const ItemDaGaveta = React.forwardRef<
  HTMLAnchorElement,
  { caminho: string; rotulo: string; Icone: LucideIcon; ativo: boolean } & Omit<React.ComponentPropsWithoutRef<typeof Link>, "to">
>(({ caminho, rotulo, Icone, ativo, className, ...props }, ref) => (
  <Link
    ref={ref}
    to={caminho}
    aria-current={ativo ? "page" : undefined}
    className={cn(
      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
      ativo
        ? "bg-moldura-2 font-semibold text-moldura-foreground before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r before:bg-accent"
        : "text-moldura-foreground/75 hover:bg-moldura-foreground/10 hover:text-moldura-foreground",
      className,
    )}
    {...props}
  >
    <Icone className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
    {rotulo}
  </Link>
));
ItemDaGaveta.displayName = "ItemDaGaveta";

interface AppHeaderV3Props {
  /** Menu lateral aberto (true) ou recolhido; sem esta prop, o botão não aparece. */
  menuAberto?: boolean;
  onAlternarMenu?: () => void;
}

const AppHeaderV3: React.FC<AppHeaderV3Props> = ({ menuAberto, onAlternarMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const gruposDaGaveta = menuDoPerfil(user?.role);

  return (
    <header data-moldura-faixa className="flex items-center gap-3 bg-moldura px-4 py-2 text-moldura-foreground md:gap-5 md:px-6">
      {/* Menu móvel com as mesmas permissões da navegação lateral. */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("md:hidden", BOTAO_NA_FAIXA)}
            aria-label="Abrir menu de navegação"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        {/* Gaveta azul, igual ao menu lateral: mesmos grupos, mesma ação principal, mesmo item aceso */}
        <SheetContent side="left" className="rolagem-moldura w-72 overflow-y-auto border-moldura-2 bg-moldura p-0 text-moldura-foreground">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SheetDescription className="sr-only">Seções do sistema, tema e saída.</SheetDescription>
          <nav className="flex flex-col gap-5 px-3 pb-4 pt-12" aria-label="Seções do sistema">
            <SheetClose asChild>
              <Link
                to={MARCA.acaoPrincipal.caminho}
                aria-current={acaoPrincipalAtiva(pathname) ? "page" : undefined}
                className="flex items-center gap-2 rounded-lg bg-[hsl(var(--cta))] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moldura-foreground"
              >
                <Plus className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
                {MARCA.acaoPrincipal.rotulo}
              </Link>
            </SheetClose>
            {gruposDaGaveta.map(({ titulo, itens }) => (
              <div key={titulo}>
                <p className="mb-1 px-3 font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-moldura-foreground/50">
                  {titulo}
                </p>
                <ul className="space-y-0.5" aria-label={titulo}>
                  {itens.map(({ caminho, rotulo, icone: Icone }) => (
                    <li key={caminho}>
                      <SheetClose asChild>
                        <ItemDaGaveta caminho={caminho} rotulo={rotulo} Icone={Icone} ativo={abaAtiva(caminho, pathname)} />
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <ul className="space-y-0.5 border-t border-moldura-foreground/10 pt-3" aria-label="Preferências">
              {ITENS_DO_PE.map(({ caminho, rotulo, icone: Icone }) => (
                <li key={caminho}>
                  <SheetClose asChild>
                    <ItemDaGaveta caminho={caminho} rotulo={rotulo} Icone={Icone} ativo={abaAtiva(caminho, pathname)} />
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>
          {/* No celular a faixa não comporta tudo (sobretudo com o texto aumentado):
              tema e a saída ficam aqui, sempre ao alcance */}
          <div className="mx-3 space-y-1 border-t border-moldura-foreground/10 py-4">
            <p className="px-3 text-sm font-semibold">{user?.username || "Usuário"}</p>
            <p className="px-3 pb-2 text-xs text-moldura-foreground/65 first-letter:uppercase">{user?.role ? NOME_DO_PERFIL[user.role] : "usuário"}</p>

            <div className="flex items-center justify-between rounded-lg px-3 text-sm text-moldura-foreground/75">
              Tema
              <ThemeToggle className={BOTAO_NA_FAIXA} />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-moldura-foreground/75 hover:bg-moldura-foreground/10 hover:text-moldura-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <LogOut className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
              Sair
            </button>
            {/* Não há rodapé: a versão fica no menu da conta, para o suporte */}
            <p className="px-3 pt-3 text-xs text-moldura-foreground/55">
              {MARCA.nome} v{APP_VERSION}
              {APP_GIT_SHA && APP_GIT_SHA !== "dev" ? `-${APP_GIT_SHA}` : ""}
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Abre e recolhe o menu lateral (do tablet para cima) */}
      {onAlternarMenu && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onAlternarMenu}
          aria-label={menuAberto ? "Recolher menu lateral" : "Expandir menu lateral"}
          aria-expanded={menuAberto}
          aria-controls="menu-lateral"
          title={menuAberto ? "Recolher menu" : "Expandir menu"}
          className={cn("hidden md:inline-flex", BOTAO_NA_FAIXA)}
        >
          {menuAberto ? <PanelLeftClose className="h-5 w-5" aria-hidden="true" /> : <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />}
        </Button>
      )}

      {/* Marca: logo do produto (MARCA.logo) + assinatura Evoluta */}
      <NavLink
        to={MARCA.rotaInicial}
        className="min-w-0 shrink rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {/* Menor no celular, e encolhe em tablet: a faixa precisa caber mesmo com o texto "Bem maior" */}
        <img src={MARCA.logo} alt={`${MARCA.nome} — ir para ${MARCA.inicio}`} className="-my-1 h-9 w-auto max-w-full object-contain object-left sm:h-12 md:h-14" />
      </NavLink>
      <span className="hidden h-8 w-px bg-moldura-foreground/20 sm:block" aria-hidden="true" />
      <AssinaturaEvoluta className="hidden w-[5.5rem] text-moldura-foreground/70 sm:flex" />

      {/* Right Side Actions */}
      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 md:gap-2">
        <BuscaRapida perfil={user?.role} className="mr-1 w-10 justify-center px-0 lg:w-52 lg:justify-start lg:px-3 xl:w-72" />
        <ThemeToggle className={cn("hidden sm:inline-flex", BOTAO_NA_FAIXA)} />
        <div className="mx-1 hidden h-6 w-px bg-moldura-foreground/20 sm:block" aria-hidden="true" />
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              // No celular o nome some da tela; o leitor de tela continua ouvindo quem é
              aria-label={`Conta de ${user?.username || "usuário"}: abrir menu`}
              className="flex items-center gap-3 rounded-md p-1 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-moldura-foreground/15">
                <span className="text-sm font-bold text-moldura-foreground">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              {/* Nome e perfil só a partir de lg e com limite (truncam): com o texto "Bem maior" empurravam o avatar para fora da faixa */}
              <div className="hidden min-w-0 max-w-[9rem] text-left lg:block xl:max-w-[14rem]">
                <p className="truncate text-sm font-semibold text-moldura-foreground">
                  {user?.username || "Usuário"}
                </p>
                <p className="truncate text-xs text-moldura-foreground/65 first-letter:uppercase">
                  {user?.role ? NOME_DO_PERFIL[user.role] : "usuário"}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-foreground">
                {user?.username || "Usuário"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || "usuario@example.com"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
              Sair
            </DropdownMenuItem>
            <p className="px-2 pb-1 pt-2 text-xs text-muted-foreground">
              {MARCA.nome} v{APP_VERSION}
              {APP_GIT_SHA && APP_GIT_SHA !== "dev" ? `-${APP_GIT_SHA}` : ""}
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeaderV3;
