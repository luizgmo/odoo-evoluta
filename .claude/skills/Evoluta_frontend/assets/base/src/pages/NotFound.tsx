import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AvisoDeEstado } from "@/components/mesa/AvisoDeEstado";
import { MARCA } from "@/config/marca";

const NotFound = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
    <AvisoDeEstado
      rotulo="Página não encontrada"
      titulo="Este endereço não leva a nenhuma tela"
      acoes={
        <>
          <Button asChild>
            <Link to={MARCA.rotaInicial}>Ir para {MARCA.inicio} ›</Link>
          </Button>
          <Link to={MARCA.rotaDaLista} className="font-semibold text-primary hover:underline dark:text-accent">
            Procurar na lista
          </Link>
        </>
      }
    >
      O link pode ter sido copiado pela metade ou a página pode ter mudado de lugar.
    </AvisoDeEstado>
  </div>
);

export default NotFound;
