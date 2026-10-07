// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Quem está com o quê — as pastas em andamento empilhadas na mesa de cada
 * responsável, vistas de cima. A pilha mais alta mostra onde o trabalho está
 * acumulado. O sistema não conhece setores; por isso a planta é por pessoa.
 */
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Process } from "@/types/process";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AvisoAtualizacaoFalhou,
  AvisoListaParcial,
  Carimbo,
  CarimboSituacao,
  MesaAviso,
  MesaCarregando,
  MesaErroBusca,
} from "@/components/mesa/Mesa";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { agruparPorResponsavel, emAndamento, formatarMoeda, SEM_RESPONSAVEL } from "@/utils/ferramentasMesa";

const MAX_PASTAS_NA_PILHA = 12;
const ESPESSURA_DA_FOLHA = 5;

/** Uma folha por pasta (até 12); a de cima mostra o número da pasta que está por cima. */
const PilhaDeFolhas: React.FC<{ processos: Process[] }> = ({ processos }) => {
  const mostradas = processos.slice(0, MAX_PASTAS_NA_PILHA);
  return (
    <div
      className="relative w-36 max-w-full"
      style={{ height: `${76 + (mostradas.length - 1) * ESPESSURA_DA_FOLHA}px` }}
      aria-hidden="true"
    >
      {/* De baixo para cima: a última da lista fica por baixo, a primeira por cima */}
      {[...mostradas].reverse().map((p, i) => (
        <span
          key={p.id}
          className="pilha-folha h-[72px]"
          style={{ bottom: `${i * ESPESSURA_DA_FOLHA}px`, left: `${((i * 7) % 5) - 2}px`, zIndex: i }}
        />
      ))}
      <span className="absolute inset-x-2 top-3 font-mono text-[11px] leading-tight text-foreground" style={{ zIndex: 50 }}>
        <span className="font-ui font-semibold text-[hsl(var(--tinta-verde))]">No alto:</span>{" "}
        <span className="block truncate">{`Pasta ${mostradas[0].code || "sem número"}`}</span>
      </span>
    </div>
  );
};

export const Planta: React.FC<{
  processos: Process[];
  /** Quantos processos ficaram de fora por estarem concluídos ou arquivados (para explicar a mesa vazia). */
  ocultos?: number;
}> = ({ processos, ocultos = 0 }) => {
  const pilhas = useMemo(() => agruparPorResponsavel(processos), [processos]);
  if (pilhas.length === 0) {
    return (
      <MesaAviso titulo="Mesas vazias">
        {ocultos > 0
          ? `Nenhuma pasta em andamento. ${ocultos} ${ocultos === 1 ? "processo está concluído ou arquivado" : "processos estão concluídos ou arquivados"}: ligue “Mostrar também os concluídos e arquivados” para ${ocultos === 1 ? "vê-lo" : "vê-los"}.`
          : "Ainda não há processos no sistema. Eles aparecem aqui, na mesa do responsável, assim que forem criados."}
      </MesaAviso>
    );
  }
  const maior = pilhas[0].processos.length;
  // Só há "a" maior pilha quando ninguém empata com ela.
  const maiorUnica = pilhas.length > 1 && pilhas[1].processos.length < maior;

  return (
    <div className="tampo-vista">
      {/* Grade com items-start: cada mesa tem a altura da própria pilha (sem esticar até a do vizinho)
          e lugar fixo — abrir "Ver todas" não faz os cartões trocarem de coluna */}
      <ul className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 2xl:grid-cols-3" aria-label="Mesas por responsável">
        {pilhas.map((pilha) => {
          const quantidade = pilha.processos.length;
          const eMaior = maiorUnica && quantidade === maior;
          return (
            <li key={pilha.responsavel} className="mesa-un flex min-w-0 flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-sans text-base font-semibold" title={pilha.responsavel}>
                    {pilha.responsavel}
                  </h2>
                  <p className="text-sm mesa-apoio">
                    {quantidade} {quantidade === 1 ? "pasta" : "pastas"}
                    {pilha.valorTotal > 0 ? `, somando ${formatarMoeda(pilha.valorTotal)}` : ""}
                  </p>
                </div>
                {eMaior && (
                  <Carimbo tinta="azul" giro={-6}>
                    Mais pastas
                  </Carimbo>
                )}
                {pilha.responsavel === SEM_RESPONSAVEL && (
                  <Carimbo tinta="ocre" giro={-4}>
                    Sem dono
                  </Carimbo>
                )}
              </div>

              {/* A altura da pilha acompanha as pastas: mesa com 1 pasta não reserva o espaço de 12 */}
              <div className="mt-4 border-b-4 border-double mesa-linha pb-2">
                <PilhaDeFolhas processos={pilha.processos} />
              </div>
              {quantidade > MAX_PASTAS_NA_PILHA && (
                <p className="mt-1 text-xs mesa-apoio">A pilha passa de {MAX_PASTAS_NA_PILHA} pastas.</p>
              )}

              <ListaDePastas processos={pilha.processos} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/** Pastas de uma mesa: as primeiras à vista, o resto a um clique (uma mesa cheia não empurra as outras). */
const PASTAS_A_VISTA = 5;
const ListaDePastas: React.FC<{ processos: Process[] }> = ({ processos }) => {
  const [todas, setTodas] = useState(false);
  const visiveis = todas ? processos : processos.slice(0, PASTAS_A_VISTA);
  return (
    <>
      <ul className="mt-4 space-y-3">
        {visiveis.map((p) => (
          <li key={p.id} className="flex items-start justify-between gap-3">
            <Link to={`/processes/${p.id}`} className="group min-w-0">
              <span className="etiqueta-pasta group-hover:underline">{p.code || "Sem número"}</span>
              <span className="mt-1 block truncate text-sm mesa-apoio" title={p.object || p.description || undefined}>
                {p.object || p.description || "Sem objeto informado"}
              </span>
            </Link>
            <CarimboSituacao status={p.status} giro={-1} />
          </li>
        ))}
      </ul>
      {processos.length > PASTAS_A_VISTA && (
        <Button type="button" variant="link" size="sm" className="mt-2 h-auto self-start px-0" onClick={() => setTodas(!todas)}>
          {todas ? "Mostrar menos" : `Ver todas as ${processos.length} pastas`}
        </Button>
      )}
    </>
  );
};

const PlantaReparticao: React.FC = () => {
  const { processos, total, isLoading, error, data, refetch } = useProcessosDaMesa();
  const [incluirEncerrados, setIncluirEncerrados] = useState(false);
  const visiveis = useMemo(
    () => (incluirEncerrados ? processos : processos.filter(emAndamento)),
    [processos, incluirEncerrados],
  );

  return (
    <FolhaDaTela
      trilha={[{ rotulo: "Mesa", para: "/dashboard" }, { rotulo: "Quem está com o quê" }]}
      titulo="Quem está com o quê"
      subtitulo="As mesas vistas de cima, uma por responsável. A pilha mais alta mostra onde o trabalho está acumulado."
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Switch id="encerrados" checked={incluirEncerrados} onCheckedChange={setIncluirEncerrados} />
          <Label htmlFor="encerrados" className="font-normal">
            Mostrar também os concluídos e arquivados
          </Label>
        </div>
        <p className="max-w-md text-xs mesa-apoio">
          Agrupado pelo campo “Responsável” de cada processo. Maiúsculas e espaços não importam, mas abreviações
          (“A. Souza” e “Ana Souza”) viram mesas diferentes.
        </p>
      </div>
      {isLoading ? (
        <MesaCarregando />
      ) : !data ? (
        <MesaErroBusca titulo="Não deu para buscar os processos" onTentarDeNovo={() => refetch()} />
      ) : (
        <>
          {/* Uma nova busca que falhou não apaga o que já está na tela (nem a escolha feita acima) */}
          {error && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
          <AvisoListaParcial exibidos={processos.length} total={total} />
          <Planta processos={visiveis} ocultos={processos.length - visiveis.length} />
        </>
      )}
    </FolhaDaTela>
  );
};

export default PlantaReparticao;
