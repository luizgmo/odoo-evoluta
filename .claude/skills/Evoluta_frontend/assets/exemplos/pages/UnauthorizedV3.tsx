// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Sem permissão (proposta 7, estados): diz que parte é de outro perfil, qual é
 * o perfil da pessoa, com quem falar e oferece o caminho de volta.
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AvisoDeEstado } from "@/components/mesa/AvisoDeEstado";

const NOME_DO_PERFIL: Record<string, string> = { master: "Master", admin: "administrador", gestor: "gestor", operador: "operador" };

const UnauthorizedV3: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const perfil = NOME_DO_PERFIL[user?.role ?? ""] ?? "operador";
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <AvisoDeEstado
        rotulo="Sem permissão"
        titulo="Esta parte é de outro perfil"
        acoes={
          <>
            <Button asChild>
              <Link to="/dashboard">Voltar à Minha Mesa ›</Link>
            </Button>
            <button type="button" onClick={() => navigate(-1)} className="font-semibold text-primary hover:underline dark:text-accent">
              Voltar à tela anterior
            </button>
          </>
        }
      >
        {user ? `Seu perfil é ${perfil}. ` : ""}Para ter acesso, fale com o administrador do LicitarsAI no seu órgão.
      </AvisoDeEstado>
    </div>
  );
};

export default UnauthorizedV3;
