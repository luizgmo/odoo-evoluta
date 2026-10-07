/**
 * Guarda de perfil por URL: o menu esconde o que o perfil não vê (campo `perfis` de
 * navegacao.ts), e esta rota de layout recusa o mesmo item quando alguém digita o
 * endereço à mão. Uma regra só, em navegacao.ts: some do menu = recusa aqui.
 */
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type Perfil } from "@/contexts/AuthContext";
import { GRUPOS_DO_MENU, abaAtiva } from "@/components/layout/navegacao";

const TODOS_OS_ITENS = GRUPOS_DO_MENU.flatMap((g) => g.itens);

const RequerPerfil: React.FC = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const item = TODOS_OS_ITENS.find((i) => abaAtiva(i.caminho, pathname));
  if (item?.perfis && !item.perfis.includes(user?.role as Perfil)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};

export default RequerPerfil;
