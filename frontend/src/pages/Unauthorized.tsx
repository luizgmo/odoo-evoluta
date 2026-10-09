/**
 * Sem permissão: diz que parte é de outro perfil, qual é
 * o perfil da pessoa, com quem falar e oferece o caminho de volta.
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, NOME_DO_PERFIL } from "@/contexts/AuthContext";
import { AvisoDeEstado } from "@/components/mesa/AvisoDeEstado";
import { MARCA } from "@/config/marca";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const perfil = user ? NOME_DO_PERFIL[user.role] : "usuário";
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <AvisoDeEstado
        rotulo="Sem permissão"
        titulo="Esta parte é de outro perfil"
        acoes={
          <>
            <Button asChild>
              <Link to={MARCA.rotaInicial}>Voltar para {MARCA.inicio} ›</Link>
            </Button>
            <button type="button" onClick={() => navigate(-1)} className="font-semibold text-primary hover:underline dark:text-accent">
              Voltar à tela anterior
            </button>
          </>
        }
      >
        {user ? `Seu perfil é ${perfil}. ` : ""}Para ter acesso, fale com {MARCA.quemConvida}.
      </AvisoDeEstado>
    </div>
  );
};

export default Unauthorized;
