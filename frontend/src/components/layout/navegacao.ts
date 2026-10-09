/**
 * Itens de navegação da moldura — uma lista só, usada pelo menu lateral
 * (AppSidebarV3), pela gaveta do celular (AppHeaderV3) e pela busca rápida.
 * Gavetas: trabalho do dia, consulta e a administração do órgão.
 * A navegação expõe somente recursos reais da gestão municipal.
 */
import {
  Accessibility,
  Archive,
  BarChart3,

  CalendarClock,
  FolderOpen,
  Home,

  LifeBuoy,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { MARCA } from "@/config/marca";
import type { Perfil } from "@/contexts/AuthContext";

export type { Perfil };

const capitalizada = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export interface ItemNavegacao {
  caminho: string;
  rotulo: string;
  /** Rótulo curto para a barra do celular (cabe em ~90px); sem ele, vale `rotulo`. */
  curto?: string;
  icone: LucideIcon;
  /** Só estes perfis veem o item (sem a lista, todos veem). */
  perfis?: Perfil[];
}

export interface GrupoDoMenu {
  titulo: string;
  itens: ItemNavegacao[];
}

export const GRUPOS_DO_MENU: GrupoDoMenu[] = [
  {
    titulo: "Trabalho",
    itens: [
      { caminho: MARCA.rotaInicial, rotulo: MARCA.inicio, curto: MARCA.inicioCurto, icone: Home },
      { caminho: MARCA.rotaDaLista, rotulo: capitalizada(MARCA.objeto.plural), icone: FolderOpen },
      { caminho: "/agenda", rotulo: MARCA.campos.agenda, curto: "Prazos", icone: CalendarClock },
      { caminho: "/arquivo", rotulo: MARCA.campos.arquivo, icone: Archive },
    ],
  },
  {
    titulo: "Consulta",
    itens: [
      { caminho: "/chamados", rotulo: "Demandas", icone: LifeBuoy },
      { caminho: "/metrics", rotulo: MARCA.campos.paineisTrilha, icone: BarChart3, perfis: ["super_admin", "admin_municipal", "secretario"] },
    ],
  },

  {
    titulo: "Administração",
    itens: [
      { caminho: "/templates", rotulo: "Modelos do município", icone: Settings, perfis: ["super_admin", "admin_municipal", "secretario"] },
      { caminho: "/configuracoes/organizacao", rotulo: "Estrutura municipal", icone: Settings, perfis: ["super_admin", "admin_municipal"] },
            { caminho: "/configuracoes/usuarios", rotulo: "Usuários municipais", icone: Settings, perfis: ["super_admin", "admin_municipal"] },
            { caminho: "/auditoria", rotulo: "Auditoria", icone: Settings, perfis: ["super_admin", "admin_municipal"] },
    ],
  },
];

/** No pé do menu: o que é da pessoa, não do trabalho. */
export const ITENS_DO_PE: ItemNavegacao[] = [{ caminho: "/acessibilidade", rotulo: "Acessibilidade", icone: Accessibility }];

/** Grupos com só os itens que o perfil vê; grupo vazio some. */
export const menuDoPerfil = (perfil: string | undefined): GrupoDoMenu[] =>
  GRUPOS_DO_MENU.map((g) => ({
    ...g,
    itens: g.itens.filter((i) => !i.perfis || i.perfis.includes(perfil as Perfil)),
  })).filter((g) => g.itens.length > 0);

/** Todos os itens que o perfil vê, em ordem. */
export const itensDoPerfil = (perfil: string | undefined): ItemNavegacao[] => [
  ...menuDoPerfil(perfil).flatMap((g) => g.itens),
  ...ITENS_DO_PE,
];

/** A tela inicial também responde em "/". */
export const abaAtiva = (caminho: string, pathname: string) =>
  // Criar um item acende a ação principal, não a lista dele
  !(caminho === MARCA.rotaDaLista && pathname.startsWith(MARCA.acaoPrincipal.caminho)) &&
  (pathname === caminho || pathname.startsWith(`${caminho}/`) || (caminho === MARCA.rotaInicial && pathname === "/"));

/** A ação principal está em tela? */
export const acaoPrincipalAtiva = (pathname: string) => pathname === MARCA.acaoPrincipal.caminho;
