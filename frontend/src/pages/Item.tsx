/**
 * Item aberto de exemplo: a pasta (capa + divisórias + ferramentas) com o conteúdo da aba atual.
 * A rota é `${MARCA.rotaDaLista}/:id/*` (App.tsx): o que vem depois do id escolhe a aba, igual às
 * divisórias de components/mesa/ferramentas.ts. "" = a própria pasta (capa + ficha).
 * Troque cada ramo pela tela real da divisória; o envoltório (ProcessoNaMesa) não muda.
 */
import React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProcessoNaMesa } from "@/components/mesa/ProcessoNaMesa";
import { DIVISORIAS_DO_PROCESSO, FERRAMENTAS_DO_PROCESSO, caminhoDaAba } from "@/components/mesa/ferramentas";
import { BaixarDocumento } from "@/components/documents/BaixarDocumento";
import {
  TelaEstrategia,
  TelaIshikawa,
  TelaMatriz,
  TelaPorques,
  TelaRaci,
  TelaRiscos,
  TelaStakeholders,
  TelaW2H,
} from "./ferramentas/Ferramentas";
import { TelaIshikawaReal, TelaPorquesReal, TelaRaciReal, TelaRiscosReal } from "./ferramentas/FerramentasReais";
import { formatBRLComCentavos } from "@/features/dashboard/formatos";
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

/** Divisória ainda sem tela: fica dentro da pasta, com a saída de volta à capa. */
const AbaEmConstrucao: React.FC<{ rotulo: string; voltarPara: string }> = ({ rotulo, voltarPara }) => (
  <div className="folha nao-imprimir space-y-3 p-4 md:p-6">
    <p className={ROTULO}>Em construção</p>
    <h2 className="font-display text-2xl font-semibold">{rotulo}</h2>
    {/* Para o desenvolvedor: troque este bloco pela tela de verdade desta divisória. */}
    <p className="text-muted-foreground">Esta parte ainda não está disponível.</p>
    <Button asChild variant="outline">
      <Link to={voltarPara}>Voltar à capa ›</Link>
    </Button>
  </div>
);

const Item: React.FC = () => {
  const { "*": resto = "" } = useParams();
  const caminho = resto.split("/")[0];
  const aba = [...DIVISORIAS_DO_PROCESSO, ...FERRAMENTAS_DO_PROCESSO].find((a) => a.caminho === caminho);

  return (
    <ProcessoNaMesa
      imprimivel={caminho === ""}
      acoes={(p) => (
        <>
          <Button asChild variant="outline" size="sm" className="nao-imprimir">
            <Link to={`/documents/${p.id}`}>Abrir como documento</Link>
          </Button>
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
        if (!aba) return <AbaEmConstrucao rotulo="Divisória não encontrada" voltarPara={`${MARCA.rotaDaLista}/${p.id}`} />;
        if (aba.caminho === "") return <Ficha objeto={p.object} valor={formatBRLComCentavos(p.estimated_value)} />;
        if (aba.caminho === "porques") return <TelaPorquesReal />;
        if (aba.caminho === "w2h") return <TelaW2H />;
        if (aba.caminho === "ishikawa") return <TelaIshikawaReal />;
        if (aba.caminho === "matriz") return <TelaMatriz />;
        if (aba.caminho === "raci") return <TelaRaciReal />;
        if (aba.caminho === "riscos") return <TelaRiscosReal />;
        if (aba.caminho === "estrategia") return <TelaEstrategia />;
        if (aba.caminho === "stakeholders") return <TelaStakeholders />;
        return <AbaEmConstrucao rotulo={aba.rotulo} voltarPara={caminhoDaAba(p.id, DIVISORIAS_DO_PROCESSO[0])} />;
      }}
    </ProcessoNaMesa>
  );
};

export default Item;
