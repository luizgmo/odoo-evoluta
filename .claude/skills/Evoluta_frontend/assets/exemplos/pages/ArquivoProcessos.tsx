// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Arquivo — processos encerrados (proposta 7, tela 18). Nada se apaga: o que
 * terminou fica aqui, por ano, com os autos à mão e o atalho para repetir a
 * contratação.
 */
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import {
  CarimboSituacao,
  MesaCarregando,
  AvisoAtualizacaoFalhou,
  MesaErroBusca,
} from "@/components/mesa/Mesa";
import { DivisoriasDeFiltro } from "@/components/mesa/DivisoriasDeFiltro";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { formatBRLComCentavos } from "@/features/dashboard/formatos";
import {
  anoDoArquivo,
  anosDoArquivo,
  ehEncerrado,
} from "@/features/processos/listaDeProcessos";

const ArquivoProcessos: React.FC = () => {
  const {
    processos,
    isLoading,
    isError,
    refetch,
    data: jaCarregado,
  } = useProcessosDaMesa();
  const encerrados = useMemo(() => processos.filter(ehEncerrado), [processos]);
  const anos = useMemo(() => anosDoArquivo(encerrados), [encerrados]);
  const [ano, setAno] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const visiveis = encerrados
    .filter((p) => ano === "todos" || String(anoDoArquivo(p)) === ano)
    .filter(
      (p) =>
        !termo ||
        `${p.code} ${p.object}`.toLocaleLowerCase("pt-BR").includes(termo),
    )
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));

  return (
    <FolhaDaTela
      trilha={[{ rotulo: "Mesa", para: "/dashboard" }, { rotulo: "Arquivo" }]}
      titulo="Processos encerrados"
      subtitulo={`${encerrados.length === 1 ? "1 processo" : `${encerrados.length} processos`}, com a pasta completa. Nada se apaga: o que terminou fica aqui.`}
      acao={
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Número ou objeto…"
            aria-label="Buscar no Arquivo"
            className="w-full pl-9"
          />
        </div>
      }
    >

      {isLoading ? (
        <MesaCarregando texto="Abrindo o arquivo…" />
      ) : isError && !jaCarregado ? (
        <MesaErroBusca
          titulo="Não deu para abrir o arquivo"
          texto="A conexão ou o servidor falhou. Nada foi perdido; tente de novo em instantes."
          onTentarDeNovo={() => refetch()}
        />
      ) : (
        <>
          {/* Com a lista de antes: ela fica, com aviso de que não atualizou */}
          {isError && (
            <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />
          )}
          <DivisoriasDeFiltro<string>
            rotulo="Ano"
            opcoes={[
              { id: "todos", rotulo: "Todos", total: encerrados.length },
              ...anos.map((a) => ({
                id: String(a.ano),
                rotulo: String(a.ano),
                total: a.total,
              })),
            ]}
            valor={ano}
            onChange={setAno}
          />
          {visiveis.length === 0 ? (
            <div className="rounded-md border border-dashed border-[hsl(var(--mesa-contorno))] p-6">
              <p className="font-semibold">
                {encerrados.length === 0
                  ? "Nenhum processo encerrado ainda"
                  : "Nada encontrado com esse texto"}
              </p>
              <p className="text-sm text-muted-foreground">
                {encerrados.length === 0 ? (
                  "Quando um processo for concluído ou arquivado, ele vem para cá."
                ) : (
                  <>
                    Os processos em andamento estão em{" "}
                    <Link
                      to="/processes"
                      className="font-semibold text-primary hover:underline dark:text-accent"
                    >
                      Processos
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-y-4 border-double border-[hsl(var(--mesa-contorno))]">
              <table className="w-full min-w-[44rem] text-sm">
                <caption className="sr-only">Processos encerrados</caption>
                <thead className="text-left">
                  <tr>
                    {[
                      "Processo",
                      "Objeto",
                      "Situação",
                      "Encerrado em",
                      "Valor estimado",
                    ].map((c) => (
                      <th
                        key={c}
                        scope="col"
                        className="px-3 py-2 font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                      >
                        {c}
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-2">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-dotted border-[hsl(var(--mesa-linha))] align-middle"
                    >
                      <td className="px-3 py-3">
                        <span className="etiqueta-pasta font-mono text-foreground">
                          {p.code || "Sem número"}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {p.modality?.name}
                        </span>
                      </td>
                      <td className="max-w-xs px-3 py-3">{p.object || "—"}</td>
                      <td className="px-3 py-3">
                        <CarimboSituacao status={p.status} />
                      </td>
                      <td className="px-3 py-3 font-mono">
                        {p.updated_at
                          ? new Date(p.updated_at).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td className="px-3 py-3 font-mono">
                        {p.estimated_value
                          ? formatBRLComCentavos(p.estimated_value)
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex flex-wrap justify-end gap-3 whitespace-nowrap">
                          <Link
                            to={`/processes/${p.id}`}
                            className="font-semibold text-primary hover:underline dark:text-accent"
                          >
                            Abrir a pasta ›
                          </Link>
                          <Link
                            to={`/processes/${p.id}/repetir`}
                            className="font-semibold text-primary hover:underline dark:text-accent"
                          >
                            Repetir ›
                          </Link>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <p className="text-xs text-muted-foreground">
        "Encerrado em" é a data da última alteração do processo. O resultado
        (homologado, deserto, fracassado, revogado) e o valor contratado passam
        a aparecer quando a ficha registrá-los.
      </p>
    </FolhaDaTela>
  );
};

export default ArquivoProcessos;
