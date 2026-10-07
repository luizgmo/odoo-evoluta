// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Repetir a contratação — parte de um processo antigo, corrige o valor pelo
 * percentual que o servidor informar (IPCA acumulado, por exemplo) e abre o
 * formulário de novo processo já preenchido. Nada é criado até o servidor
 * conferir e clicar em "Criar Processo" no formulário de sempre.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { FilePlus2 } from "lucide-react";
import type { Process } from "@/types/process";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Carimbo } from "@/components/mesa/Mesa";
import { ProcessoNaMesa } from "@/components/mesa/ProcessoNaMesa";
import {
  corrigirValor,
  lerPercentual,
  situacaoDaModalidade,
  type ModalidadeDaLista,
} from "@/utils/ferramentasPropostas";
import { formatarMoeda, valorEmReais } from "@/utils/ferramentasMesa";
import { formatarData, lerData } from "@/utils/prazosLicitacao";

/** O que vai para o formulário de novo processo (via estado da navegação). */
export interface DadosRepeticao {
  object: string;
  description: string;
  modality_id: number | string;
  estimated_value: string;
  responsible?: string;
}

export const PainelRepetir: React.FC<{ processo: Process; modalidades?: ModalidadeDaLista[] }> = ({
  processo,
  modalidades,
}) => {
  const navigate = useNavigate();
  const [percentualTexto, setPercentualTexto] = useState("");
  const lido = lerPercentual(percentualTexto);
  // -100% ou menos zeraria ou tornaria negativo o valor: não faz sentido como correção.
  const percentual = lido !== null && lido > -100 ? lido : null;
  const foraDaFaixa = lido !== null && lido <= -100;
  const valorAntigo = valorEmReais(processo.estimated_value);
  const valorNovo = percentual === null ? null : corrigirValor(valorAntigo, percentual);
  const situacaoModalidade = situacaoDaModalidade(processo, modalidades);
  const modalidadeValida = situacaoModalidade === "valida";

  const abrirFormulario = () => {
    if (valorNovo === null) return;
    const dados: DadosRepeticao = {
      object: processo.object || "",
      description: processo.description
        ? `${processo.description}\n\nRepetição do processo ${processo.code || ""}${percentual ? `, com valor corrigido em ${percentual.toLocaleString("pt-BR")}%` : ""}.`
        : `Repetição do processo ${processo.code || ""}.`,
      // Modalidade extinta (Lei 14.133) não pode nascer num processo novo.
      modality_id: modalidadeValida ? (processo.modality?.id ?? "") : "",
      estimated_value: valorNovo.toFixed(2),
      // Vazio vira undefined: assim o formulário sugere o nome de quem está usando.
      responsible: processo.responsible?.trim() || undefined,
    };
    navigate("/processes/new", { state: { repetir: dados } });
  };

  const linhas: [string, string, string][] = [
    ["Objeto", processo.object || "—", processo.object || "—"],
    [
      "Modalidade",
      processo.modality?.name || "—",
      {
        valida: processo.modality?.name || "—",
        extinta: "Escolher no formulário (a anterior não vale mais)",
        "nao-conferida": "Escolher no formulário (não deu para conferir se a anterior ainda vale)",
        ausente: "Escolher no formulário",
      }[situacaoModalidade],
    ],
    ["Responsável", processo.responsible || "—", processo.responsible || "Você (sugerido no formulário)"],
    [
      "Datas",
      `Publicação em ${formatarData(lerData(processo.publication_date))}; abertura em ${formatarData(lerData(processo.opening_date))}`,
      "Em branco: definir no formulário",
    ],
  ];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* No código, o campo vem antes da tabela: abaixo de xl é a ordem da tela (e do Tab); no xl vai para a direita */}
      <aside className="folha-simples space-y-4 p-5 xl:order-last xl:sticky xl:top-4 xl:self-start">
        <div className="space-y-2">
          <Label htmlFor="percentual">Correção do valor (%)</Label>
          <Input
            id="percentual"
            inputMode="decimal"
            placeholder="Ex.: 4,5"
            value={percentualTexto}
            onChange={(e) => setPercentualTexto(e.target.value)}
            aria-invalid={percentual === null}
            aria-describedby="percentual-ajuda"
          />
          <p id="percentual-ajuda" className={`text-xs ${percentual === null ? "tinta-carmim" : "mesa-apoio"}`}>
            {foraDaFaixa
              ? "A correção precisa ser maior que -100%."
              : percentual === null
              ? "Use só números, com vírgula: 4,5"
              : "Informe o índice acumulado desde a contratação anterior (IPCA, por exemplo). Em branco, o valor fica igual."}
          </p>
        </div>
        <Button type="button" className="w-full" onClick={abrirFormulario} disabled={valorNovo === null}>
          <FilePlus2 className="mr-2 h-4 w-4" />
          Abrir no formulário de novo processo
        </Button>
        <p className="text-xs mesa-apoio">
          Nada é criado agora. O formulário abre preenchido e o processo só existe quando você clicar em “Criar
          Processo”.
        </p>
      </aside>
      <section aria-labelledby="titulo-comparacao" className="folha p-5 md:p-6">
        <h2 id="titulo-comparacao" className="mesa-secao">
          O que muda na nova contratação
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="mesa-rotulo mesa-apoio">
                <th className="py-2 pr-3 font-semibold" scope="col">
                  Campo
                </th>
                <th className="py-2 pr-3 font-semibold" scope="col">
                  Processo {processo.code || "anterior"}
                </th>
                <th className="py-2 font-semibold" scope="col">
                  Nova contratação
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t mesa-linha">
                <th scope="row" className="py-2 pr-3 font-normal mesa-apoio">
                  Valor estimado
                </th>
                <td className="py-2 pr-3 tabular-nums">{formatarMoeda(valorAntigo)}</td>
                <td className="py-2 tabular-nums">
                  {valorNovo === null ? "—" : formatarMoeda(valorNovo)}
                  {valorNovo !== null && valorNovo !== valorAntigo && (
                    <span className="ml-2">
                      <Carimbo tinta="azul" giro={-3}>
                        Corrigido
                      </Carimbo>
                    </span>
                  )}
                </td>
              </tr>
              {linhas.map(([campo, antes, depois]) => (
                <tr key={campo} className="border-t mesa-linha">
                  <th scope="row" className="py-2 pr-3 font-normal mesa-apoio">
                    {campo}
                  </th>
                  <td className="py-2 pr-3">{antes}</td>
                  <td className={`py-2 ${antes !== depois ? "tinta-azul font-semibold" : ""}`}>{depois}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs mesa-apoio">
          Em azul, o que fica diferente. O número do processo novo é sugerido pelo sistema no formulário.
        </p>
      </section>

    </div>
  );
};

const RepetirContratacao: React.FC = () => {
  // Mesma chave e mesmo formato (lista simples) que o formulário de processo usa
  const { data: modalidades } = useQuery<ModalidadeDaLista[]>({
    queryKey: ["modalities"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/modalities/");
        return Array.isArray(response.data) ? response.data : response.data.results || [];
      } catch {
        return [];
      }
    },
  });
  return <ProcessoNaMesa>{(processo) => <PainelRepetir processo={processo} modalidades={modalidades} />}</ProcessoNaMesa>;
};

export default RepetirContratacao;
