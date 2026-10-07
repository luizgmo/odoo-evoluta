/**
 * Telas mock das ferramentas Evoluta (G3b): formulário simples + botão que
 * "gera", tudo em memória. Em G4/G5 cada uma liga no endpoint real.
 * DENTRO da pasta do projeto (divisórias); fora dela, use EmConstrucao.
 */
import React, { useState } from "react";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const TRILHA = [{ rotulo: "Projetos" }, { rotulo: "Ferramenta" }];

const Campo: React.FC<{ rotulo: string; children: React.ReactNode }> = ({ rotulo, children }) => (
  <div className="grid gap-2">
    <Label className={ROTULO}>{rotulo}</Label>
    {children}
  </div>
);

const Gerar: React.FC<{ rotulo: string; feito: boolean; aoGerar: () => void }> = ({ rotulo, feito, aoGerar }) => (
  <div className="grid gap-3">
    <div>
      <Button type="button" onClick={aoGerar}>
        {rotulo}
      </Button>
    </div>
    {feito && (
      <p role="status" className="text-sm text-muted-foreground">
        Demonstração: registrado nesta visita. Some ao recarregar.
      </p>
    )}
  </div>
);

const Molde: React.FC<{ titulo: string; subtitulo: string; botao: string; children: React.ReactNode }> = ({
  titulo,
  subtitulo,
  botao,
  children,
}) => {
  const [feito, setFeito] = useState(false);
  return (
    <FolhaDaTela trilha={TRILHA} titulo={titulo} subtitulo={subtitulo}>
      <div className="grid grid-cols-1 gap-4">
        {children}
        <Gerar rotulo={botao} feito={feito} aoGerar={() => setFeito(true)} />
      </div>
    </FolhaDaTela>
  );
};

export const TelaPorques: React.FC = () => (
  <Molde titulo="5 Porquês" subtitulo="Do problema até a causa raiz." botao="Criar ação">
    <Campo rotulo="Problema">
      <Textarea rows={2} />
    </Campo>
    {[1, 2, 3, 4, 5].map((n) => (
      <Campo key={n} rotulo={`Por quê ${n}?`}>
        <Input />
      </Campo>
    ))}
    <Campo rotulo="Causa raiz">
      <Textarea rows={2} />
    </Campo>
  </Molde>
);

export const TelaW2H: React.FC = () => (
  <Molde titulo="5W2H" subtitulo="O plano em sete perguntas." botao="Gerar task">
    <Campo rotulo="What — o quê">
      <Input />
    </Campo>
    <Campo rotulo="Why — por quê">
      <Textarea rows={2} />
    </Campo>
    <Campo rotulo="Where — onde">
      <Input />
    </Campo>
    <Campo rotulo="When — quando">
      <Input type="date" />
    </Campo>
    <Campo rotulo="Who — quem">
      <Input />
    </Campo>
    <Campo rotulo="How — como">
      <Textarea rows={2} />
    </Campo>
    <Campo rotulo="How much — quanto (R$)">
      <Input inputMode="decimal" placeholder="R$ 0,00" />
    </Campo>
  </Molde>
);

const CATEGORIAS = ["Pessoas", "Processos", "Tecnologia", "Recursos", "Ambiente", "Gestão"];

export const TelaIshikawa: React.FC = () => (
  <Molde titulo="Ishikawa" subtitulo="Uma causa por categoria." botao="Gerar ação">
    <Campo rotulo="Problema (efeito)">
      <Input />
    </Campo>
    {CATEGORIAS.map((c) => (
      <Campo key={c} rotulo={c}>
        <Input />
      </Campo>
    ))}
    <Campo rotulo="Causa principal">
      <Input />
    </Campo>
  </Molde>
);

export const TelaMatriz: React.FC = () => (
  <Molde titulo="Matriz de Decisão" subtitulo="Notas por critério, vence a maior soma." botao="Gerar 5W2H">
    <Campo rotulo="Alternativa A">
      <Input />
    </Campo>
    <Campo rotulo="Alternativa B">
      <Input />
    </Campo>
    <Campo rotulo="Critério 1 (peso)">
      <Input placeholder="Ex.: Custo, peso 2" />
    </Campo>
    <Campo rotulo="Critério 2 (peso)">
      <Input placeholder="Ex.: Prazo, peso 1" />
    </Campo>
  </Molde>
);

export const TelaRaci: React.FC = () => (
  <Molde titulo="RACI" subtitulo="Quem faz, quem responde, quem opina, quem acompanha." botao="Salvar matriz">
    <Campo rotulo="Responsible — executa">
      <Input />
    </Campo>
    <Campo rotulo="Accountable — responde (diferente de quem executa)">
      <Input />
    </Campo>
    <Campo rotulo="Consulted — opinam">
      <Input />
    </Campo>
    <Campo rotulo="Informed — acompanham">
      <Input />
    </Campo>
  </Molde>
);

export const TelaRiscos: React.FC = () => (
  <Molde titulo="Riscos" subtitulo="Probabilidade, impacto e mitigação." botao="Gerar ação">
    <Campo rotulo="Risco">
      <Input />
    </Campo>
    <Campo rotulo="Probabilidade (baixa, média, alta)">
      <Input />
    </Campo>
    <Campo rotulo="Impacto (baixo, médio, alto)">
      <Input />
    </Campo>
    <Campo rotulo="Mitigação">
      <Textarea rows={2} />
    </Campo>
    <Campo rotulo="Responsável">
      <Input />
    </Campo>
  </Molde>
);

export const TelaEstrategia: React.FC = () => (
  <Molde titulo="Estratégia" subtitulo="Triângulo, árvores e teoria da mudança." botao="Salvar análise">
    <Campo rotulo="Valor público">
      <Textarea rows={2} />
    </Campo>
    <Campo rotulo="Legitimidade e apoio">
      <Textarea rows={2} />
    </Campo>
    <Campo rotulo="Capacidade operacional">
      <Textarea rows={2} />
    </Campo>
    <Campo rotulo="Problema central">
      <Input />
    </Campo>
    <Campo rotulo="Objetivo central">
      <Input />
    </Campo>
  </Molde>
);
