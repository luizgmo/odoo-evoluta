/**
 * Moldura das ferramentas e divisórias de UM processo: busca o processo, trata
 * carregando/erro e mostra a pasta (capa cheia na primeira divisória e em uma linha
 * nas demais; divisórias no alto e ferramentas na borda).
 */
import React from "react";
import { useMatch, useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import type { Process } from "@/types/process";
import { Button } from "@/components/ui/button";
import { useProcessoDaMesa } from "@/hooks/useMesaDados";
import { AvisoAtualizacaoFalhou, MesaAviso, MesaCarregando, MesaPagina, MesaErroBusca } from "./Mesa";
import { PastaDoProcesso } from "./PastaDoProcesso";
import { GEN, MARCA } from "@/config/marca";

const objeto = MARCA.objeto;
const capitalizada = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Código HTTP do erro: o serviço de processos o põe em .status; o axios, em .response.status. */
function statusDoErro(erro: unknown): number | undefined {
  const e = erro as { status?: number; response?: { status?: number } } | null;
  return e?.status ?? e?.response?.status;
}

interface ProcessoNaMesaProps {
  imprimivel?: boolean;
  /** Força a capa em uma linha (true) ou cheia (false). Sem isto: cheia só na primeira divisória. */
  compacta?: boolean;
  /** Botões da capa; aceita uma função para usar os dados do processo (ex.: baixar a ficha dele). */
  acoes?: React.ReactNode | ((processo: Process) => React.ReactNode);
  children: (processo: Process) => React.ReactNode;
}

export const ProcessoNaMesa: React.FC<ProcessoNaMesaProps> = ({ imprimivel, compacta, acoes, children }) => {
  const { id } = useParams<{ id: string }>();
  // Capa cheia só na primeira divisória (rota `<lista>/:id`); nas demais, a capa vira uma linha
  const comAba = useMatch(`${MARCA.rotaDaLista}/:id/:aba/*`);
  const capaCompacta = compacta ?? Boolean(comAba?.params.aba);
  const { data: processo, isLoading, error, refetch } = useProcessoDaMesa(id);

  if (!processo) {
    return (
      <MesaPagina titulo={capitalizada(objeto.singular)} voltarPara={MARCA.rotaDaLista} voltarRotulo={`Voltar para a lista de ${objeto.plural}`} compacto>
        {isLoading ? (
          <MesaCarregando texto={`Buscando ${GEN.o} ${objeto.singular}…`} />
        ) : statusDoErro(error) === 404 ? (
          <MesaAviso titulo={`${capitalizada(objeto.singular)} não encontrad${GEN.fim}`} tinta="carmim">
            {GEN.Este} {objeto.singular} não existe mais ou o endereço está errado. Volte à lista de {objeto.plural}.
          </MesaAviso>
        ) : (
          <MesaErroBusca
            titulo={`Não deu para buscar ${GEN.o} ${objeto.singular}`}
            texto={`Não foi possível carregar agora. ${GEN.O} ${objeto.singular} não foi apagad${GEN.fim}; tente de novo em instantes.`}
            onTentarDeNovo={() => refetch()}
          />
        )}
      </MesaPagina>
    );
  }

  const botoes = typeof acoes === "function" ? acoes(processo) : acoes;

  return (
    <PastaDoProcesso
      processo={processo}
      compacta={capaCompacta}
      imprimivel={imprimivel}
      acoes={
        (botoes || imprimivel) && (
          <>
            {botoes}
            {imprimivel && (
              <Button onClick={() => window.print()} variant="secondary">
                <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                Imprimir
              </Button>
            )}
          </>
        )
      }
    >
      {error && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
      {children(processo)}
    </PastaDoProcesso>
  );
};
