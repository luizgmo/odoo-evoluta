/**
 * Item aberto de exemplo: a pasta (capa + divisórias + ferramentas) com o conteúdo da aba atual.
 * A rota é `${MARCA.rotaDaLista}/:id/*` (App.tsx): o que vem depois do id escolhe a aba, igual às
 * divisórias de components/mesa/ferramentas.ts. "" = a própria pasta (capa + ficha).
 * Troque cada ramo pela tela real da divisória; o envoltório (ProcessoNaMesa) não muda.
 */
import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProcessoNaMesa } from "@/components/mesa/ProcessoNaMesa";
import { DIVISORIAS_DO_PROCESSO, FERRAMENTAS_DO_PROCESSO, caminhoDaAba } from "@/components/mesa/ferramentas";
import { BaixarDocumento } from "@/components/documents/BaixarDocumento";
import { TelaStakeholders } from "./ferramentas/Ferramentas";
import { KanbanProjeto } from "./KanbanProjeto";
import TarefasProjeto from "./TarefasProjeto";
import AtividadesProjeto from "./AtividadesProjeto";
import { MatrizProjeto } from "./MatrizProjeto";
import { EstrategiaProjeto } from "./EstrategiaProjeto";
import W2HProjeto from "./W2HProjeto";
import { TelaIshikawaReal, TelaPorquesReal, TelaRaciReal, TelaRiscosReal } from "./ferramentas/FerramentasReais";
import { formatBRLComCentavos } from "@/features/dashboard/formatos";
import { useAuth } from "@/contexts/AuthContext";
import { GEN, MARCA } from "@/config/marca";
import { blocosDoItem, nomeDoDocumentoDoItem } from "@/utils/blocosDoItem";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";

const Ficha: React.FC<{ objeto: string; valor: string }> = ({ objeto, valor }) => (
  <div className="folha space-y-4 p-4 md:p-6">
    <h2 className="font-display text-2xl font-semibold">Ficha {GEN.do} {MARCA.objeto.singular}</h2>
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        {/* EXEMPLO DE DOMÍNIO — o rótulo vem de MARCA.campos.objeto */}
        <dt className={ROTULO}>{MARCA.campos.objeto}</dt>
        <dd>{objeto}</dd>
      </div>
      <div>
        <dt className={ROTULO}>{MARCA.campos.valor}</dt>
        <dd>{valor}</dd>
      </div>
    </dl>
  </div>
);


const Item: React.FC = () => {
  const { can } = useAuth();
  const { "*": resto = "" } = useParams();
  const caminho = resto.split("/")[0];
  const aba = [...DIVISORIAS_DO_PROCESSO, ...FERRAMENTAS_DO_PROCESSO].find((a) => a.caminho === caminho);

  return (
    <ProcessoNaMesa
      imprimivel={caminho === ""}
      acoes={(p) => (
        <>
          {can("manage_projects") && <Button asChild variant="outline" size="sm" className="nao-imprimir"><Link to={`${MARCA.rotaDaLista}/${p.id}/editar`}>Editar projeto</Link></Button>}
          <Button asChild variant="outline" size="sm" className="nao-imprimir"><Link to={`/documents/${p.id}`}>Abrir como documento</Link></Button>
          <BaixarDocumento
            variant="outline"
            nome={nomeDoDocumentoDoItem(p)}
            idDoArquivo={String(p.id)}
            blocos={blocosDoItem(p)}
            rotulo="Baixar a ficha (.docx)"
          />
        </>
      )}
    >
      {(p) => {
        if (!aba) return <Navigate to={`${MARCA.rotaDaLista}/${p.id}`} replace />;
        if (aba.caminho === "") return <Ficha objeto={p.object} valor={formatBRLComCentavos(p.estimated_value)} />;
        if (aba.caminho === "kanban") return <KanbanProjeto />;
        if (aba.caminho === "tarefas") return <TarefasProjeto />;
        if (aba.caminho === "atividades") return <AtividadesProjeto />;
        if (aba.caminho === "porques") return <TelaPorquesReal />;
        if (aba.caminho === "w2h") return <W2HProjeto />;
        if (aba.caminho === "ishikawa") return <TelaIshikawaReal />;
        if (aba.caminho === "matriz") return <MatrizProjeto />;
        if (aba.caminho === "raci") return <TelaRaciReal />;
        if (aba.caminho === "riscos") return <TelaRiscosReal />;
        if (aba.caminho === "estrategia") return <EstrategiaProjeto />;
        if (aba.caminho === "stakeholders") return <TelaStakeholders />;
        return <Navigate to={caminhoDaAba(p.id, DIVISORIAS_DO_PROCESSO[0])} replace />;
      }}
    </ProcessoNaMesa>
  );
};

export default Item;
