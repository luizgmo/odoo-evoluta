/**
 * Rotas do esqueleto. A casca (AppLayoutV3) é uma rota de layout: tudo o que
 * fica dentro dela ganha a faixa azul, o menu lateral e a folha. Login e
 * autenticação fica fora (usa MolduraDeEntrada).
 *
 * Os caminhos abaixo são os de navegacao.ts. Ao trocar os itens do menu lá,
 * troque as rotas aqui.
 */
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { aplicarPreferencias, lerPreferencias } from "@/features/preferencias/preferencias";
import AppLayoutV3 from "@/components/layout/AppLayoutV3";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RequerPerfil from "@/components/auth/RequerPerfil";
import { MARCA } from "@/config/marca";
import Login from "@/components/auth/Login";

import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import Acessibilidade from "@/pages/Acessibilidade";
import Inicio from "@/pages/Inicio";
import Lista from "@/pages/Lista";
import Item from "@/pages/Item";
import Formulario from "@/pages/Formulario";
import Documento from "@/pages/Documento";
import Agenda from "@/pages/Agenda";
import Paineis from "@/pages/Paineis";
import Templates from "@/pages/Templates";
import Chamados from "@/pages/Chamados";
import ChamadoDetalhe from "@/pages/ChamadoDetalhe";
import Organizacao from "@/pages/Organizacao";
import UsuariosMunicipais from "@/pages/UsuariosMunicipais";
import Arquivo from "@/pages/Arquivo";
import Auditoria from "@/pages/Auditoria";

export default function App() {
  // Aplica as preferências de leitura (tamanho do texto, contraste…) como classes em <html>
  useEffect(() => aplicarPreferencias(lerPreferencias()), []);

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayoutV3 />
            </ProtectedRoute>
          }
        >
          {/* RequerPerfil recusa pela URL o que o menu esconde do perfil (campo `perfis` de navegacao.ts) */}
          <Route element={<RequerPerfil />}>
            <Route index element={<Navigate to={MARCA.rotaInicial} replace />} />
            <Route path={MARCA.rotaInicial} element={<Inicio />} />
            <Route path={MARCA.rotaDaLista} element={<Lista />} />
            {/* O caminho do formulário é o da ação principal (MARCA); rota fixa vence `<lista>/:id/*` */}
            <Route path={MARCA.acaoPrincipal.caminho} element={<Formulario />} />
            <Route path={`${MARCA.rotaDaLista}/:id/editar`} element={<Formulario />} />
            <Route path={`${MARCA.rotaDaLista}/:id/*`} element={<Item />} />
            <Route path="/documents/:id" element={<Documento />} />
            <Route path="/acessibilidade" element={<Acessibilidade />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/metrics" element={<Paineis />} />
            <Route path="/arquivo" element={<Arquivo />} />
            <Route path="/auditoria" element={<Auditoria />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/chamados" element={<Chamados />} />
            <Route path="/chamados/:id" element={<ChamadoDetalhe />} />
            <Route path="/configuracoes/organizacao" element={<Organizacao />} />
            <Route path="/configuracoes/usuarios" element={<UsuariosMunicipais />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </TooltipProvider>
  );
}
