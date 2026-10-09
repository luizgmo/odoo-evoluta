import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { PastaNaGaveta } from "@/components/mesa/PastaNaGaveta";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";

import { dataDeAbertura, formatBRL } from "@/features/dashboard/formatos";
import { MARCA } from "@/config/marca";

const Arquivo: React.FC = () => {
  const { processos, isLoading, isError, refetch } = useProcessosDaMesa(true);
  const encerrados = useMemo(() => processos.filter((processo) => !processo.active), [processos]);

  return (
    <FolhaDaTela
      trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: MARCA.campos.arquivo }]}
      titulo={MARCA.campos.arquivo}
      subtitulo="Projetos encerrados permanecem disponíveis para consulta, sem voltar ao trabalho em andamento."
    >
      {isLoading ? (
        <MesaCarregando texto="Buscando projetos encerrados…" />
      ) : isError ? (
        <MesaErroBusca titulo="Não deu para buscar o arquivo" onTentarDeNovo={refetch} />
      ) : encerrados.length === 0 ? (
        <div className="folha-simples border border-dashed border-border px-4 py-12 text-center">
          <p className="font-display text-2xl font-semibold">Nenhum projeto encerrado</p>
          <p className="mt-1 text-muted-foreground">Quando uma iniciativa for concluída ou arquivada, ela aparecerá aqui.</p>
          <Link to={MARCA.rotaDaLista} className="mt-4 inline-block font-semibold text-primary hover:underline dark:text-accent">Ver projetos em andamento</Link>
        </div>
      ) : (
        <ul className="gaveta" aria-label="Projetos encerrados">
          {encerrados.map((projeto, index) => (
            <li key={projeto.id}>
              <PastaNaGaveta
                processo={projeto}
                posicao={index}
                aviso={null}
                progresso={null}
                espessura={1}
                dados={[
                  { rotulo: MARCA.campos.valor, valor: formatBRL(projeto.estimated_value) },
                  { rotulo: MARCA.campos.responsavel, valor: projeto.responsible || "Sem responsável" },
                  { rotulo: MARCA.campos.data, valor: projeto.projectInfo.date_deadline ? dataDeAbertura(projeto.projectInfo.date_deadline) : MARCA.campos.semData },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </FolhaDaTela>
  );
};

export default Arquivo;
