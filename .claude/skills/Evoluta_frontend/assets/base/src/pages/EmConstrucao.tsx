/** Tela de preenchimento: use como ponto de partida de cada item do menu ainda sem tela. */
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { AvisoDeEstado } from "@/components/mesa/AvisoDeEstado";
import { MARCA } from "@/config/marca";

const EmConstrucao: React.FC<{ titulo: string }> = ({ titulo }) => (
  <FolhaDaTela trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: titulo }]} titulo={titulo}>
    <AvisoDeEstado
      rotulo="Em construção"
      titulo="Esta tela ainda não está disponível"
      nivel={2}
      className="nao-imprimir"
      acoes={
        <Button asChild className="nao-imprimir">
          <Link to={MARCA.rotaInicial}>Voltar para {MARCA.inicio} ›</Link>
        </Button>
      }
    >
      {/* Para o desenvolvedor: troque este componente pela tela de verdade, mantendo a moldura FolhaDaTela. */}
      Estamos preparando esta parte do sistema.
    </AvisoDeEstado>
  </FolhaDaTela>
);

export default EmConstrucao;
