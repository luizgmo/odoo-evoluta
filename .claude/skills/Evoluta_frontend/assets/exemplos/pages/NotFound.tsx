// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AvisoDeEstado } from "@/components/mesa/AvisoDeEstado";

const NotFound = () => (
  <div className="flex min-h-[60vh] items-center justify-center p-4">
    <AvisoDeEstado
      rotulo="Página não encontrada"
      titulo="Este endereço não leva a nenhuma tela"
      acoes={
        <>
          <Button asChild>
            <Link to="/dashboard">Ir para a Minha Mesa ›</Link>
          </Button>
          <Link
            to="/processes"
            className="font-semibold text-primary hover:underline dark:text-accent"
          >
            Procurar na lista de processos
          </Link>
        </>
      }
    >
      O link pode ter sido copiado pela metade, ou levar a uma função que não
      está disponível no seu órgão. Processos encerrados continuam abrindo
      normalmente, pelo Arquivo.
    </AvisoDeEstado>
  </div>
);

export default NotFound;
