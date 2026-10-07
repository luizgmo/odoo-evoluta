/**
 * Telas mock das ferramentas Evoluta (G3b): formulário simples + botão que
 * "gera", tudo em memória. Em G4/G5 cada uma liga no endpoint real.
 * DENTRO da pasta do projeto (divisórias); fora dela, use EmConstrucao.
 */
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/services/api/client";
import { criarStakeholder, type NovoStakeholder, type StakeholderInfluencia, type StakeholderPoder, type StakeholderPosicao } from "@/services/api/stakeholders";
import { useStakeholders } from "@/hooks/useStakeholders";

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

export const TelaW2H: React.FC = () => {
  const { id } = useParams();
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [who, setWho] = useState("");
  const [how, setHow] = useState("");
  const [howMuch, setHowMuch] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const gerar = async () => {
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await apiPost("/api/5w2h", {
        project_id: Number(id),
        what: what.trim(),
        why,
        where,
        date_deadline: when || undefined,
        // MVP: "Quem" em texto livre vai junto do Como (who_id exige usuário do sistema).
        how: who.trim() ? `Quem: ${who.trim()}. ${how}`.trim() : how,
        how_much: Number(howMuch.replace(",", ".")) || 0,
      });
      setFeito(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não deu para salvar, e nada foi alterado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <FolhaDaTela
      trilha={TRILHA}
      titulo="5W2H"
      subtitulo="O plano em sete perguntas."
    >
      <div className="grid grid-cols-1 gap-4">
        <Campo rotulo="What — o quê">
          <Input value={what} onChange={(e) => setWhat(e.target.value)} />
        </Campo>
        <Campo rotulo="Why — por quê">
          <Textarea rows={2} value={why} onChange={(e) => setWhy(e.target.value)} />
        </Campo>
        <Campo rotulo="Where — onde">
          <Input value={where} onChange={(e) => setWhere(e.target.value)} />
        </Campo>
        <Campo rotulo="When — quando">
          <Input type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
        </Campo>
        <Campo rotulo="Who — quem">
          <Input value={who} onChange={(e) => setWho(e.target.value)} />
        </Campo>
        <Campo rotulo="How — como">
          <Textarea rows={2} value={how} onChange={(e) => setHow(e.target.value)} />
        </Campo>
        <Campo rotulo="How much — quanto (R$)">
          <Input inputMode="decimal" placeholder="R$ 0,00" value={howMuch} onChange={(e) => setHowMuch(e.target.value)} />
        </Campo>
        <div>
          <Button type="button" onClick={gerar} disabled={enviando}>
            {enviando ? "Gerando…" : "Gerar task"}
          </Button>
        </div>
        {erro && (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}
        {feito && !erro && (
          <p role="status" className="text-sm text-muted-foreground">
            Plano gravado no projeto.
          </p>
        )}
      </div>
    </FolhaDaTela>
  );
};

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

const STAKEHOLDER_INICIAL: NovoStakeholder = {
  project_id: 0,
  name: "",
  organizacao: "",
  poder: "medio",
  interesse: "medio",
  posicao: "neutro",
  influencia: "media",
  estrategia: "",
};

const StakeholderSelect: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}> = ({ id, label, value, onChange, children }) => (
  <div className="grid gap-2">
    <Label htmlFor={id} className={ROTULO}>
      {label}
    </Label>
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {children}
    </select>
  </div>
);

export const TelaStakeholders: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const { stakeholders, isLoading, isError, refetch } = useStakeholders(projectId);
  const { avisar } = useAvisoDeResultado();
  const [form, setForm] = useState<NovoStakeholder>({ ...STAKEHOLDER_INICIAL, project_id: projectId });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const atualizar = <K extends keyof NovoStakeholder>(campo: K, valor: NovoStakeholder[K]) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    if (!form.name.trim()) {
      setErro("Informe o nome do stakeholder antes de salvar.");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await criarStakeholder({ ...form, name: form.name.trim() });
      await refetch();
      setForm({ ...STAKEHOLDER_INICIAL, project_id: projectId });
      avisar({ texto: `Stakeholder \"${resposta.record.name}\" foi adicionado ao projeto.` });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar. Nada foi alterado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <FolhaDaTela
      trilha={[{ rotulo: "Projetos" }, { rotulo: "Ferramenta" }, { rotulo: "Stakeholders" }]}
      titulo="Stakeholders"
      subtitulo="Pessoas e organizações que influenciam o projeto ou são afetadas por ele."
    >
      {isLoading ? (
        <MesaCarregando texto="Buscando os stakeholders do projeto…" />
      ) : isError ? (
        <MesaErroBusca
          titulo="Não deu para buscar os stakeholders"
          texto="O projeto não foi alterado. Tente de novo em instantes."
          onTentarDeNovo={() => void refetch()}
        />
      ) : stakeholders.length === 0 ? (
        <div className="folha-simples border border-dashed border-border p-5">
          <p className="mesa-secao tinta-ocre">Nenhum stakeholder cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground">Adicione a primeira pessoa ou organização que deve ser considerada neste projeto.</p>
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Stakeholders do projeto">
          {stakeholders.map((stakeholder) => (
            <li key={stakeholder.id} className="folha-simples space-y-2 border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{stakeholder.name}</h2>
                  {stakeholder.organizacao && <p className="text-sm text-muted-foreground">{stakeholder.organizacao}</p>}
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">{stakeholder.posicao_label}</p>
              </div>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className={ROTULO}>Poder</dt>
                  <dd>{stakeholder.poder_label}</dd>
                </div>
                <div>
                  <dt className={ROTULO}>Interesse</dt>
                  <dd>{stakeholder.interesse_label}</dd>
                </div>
                <div>
                  <dt className={ROTULO}>Influência</dt>
                  <dd>{stakeholder.influencia_label}</dd>
                </div>
              </dl>
              {stakeholder.estrategia && (
                <p className="border-t border-dotted border-border pt-2 text-sm text-muted-foreground">
                  <strong className="text-foreground">Estratégia:</strong> {stakeholder.estrategia}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Adicionar stakeholder</h2>
          <p className="mt-1 text-sm text-muted-foreground">O registro será salvo diretamente no projeto atual.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="stakeholder-name" className={ROTULO}>Nome</Label>
            <Input id="stakeholder-name" value={form.name} onChange={(event) => atualizar("name", event.target.value)} required />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="stakeholder-organizacao" className={ROTULO}>Organização</Label>
            <Input id="stakeholder-organizacao" value={form.organizacao} onChange={(event) => atualizar("organizacao", event.target.value)} />
          </div>
          <StakeholderSelect id="stakeholder-poder" label="Poder" value={form.poder} onChange={(value) => atualizar("poder", value as StakeholderPoder)}>
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
          </StakeholderSelect>
          <StakeholderSelect id="stakeholder-interesse" label="Interesse" value={form.interesse} onChange={(value) => atualizar("interesse", value as StakeholderPoder)}>
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
          </StakeholderSelect>
          <StakeholderSelect id="stakeholder-posicao" label="Posição" value={form.posicao} onChange={(value) => atualizar("posicao", value as StakeholderPosicao)}>
            <option value="apoiador">Apoiador</option>
            <option value="neutro">Neutro</option>
            <option value="opositor">Opositor</option>
          </StakeholderSelect>
          <StakeholderSelect id="stakeholder-influencia" label="Influência" value={form.influencia} onChange={(value) => atualizar("influencia", value as StakeholderInfluencia)}>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </StakeholderSelect>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="stakeholder-estrategia" className={ROTULO}>Estratégia de relacionamento</Label>
            <Textarea id="stakeholder-estrategia" rows={3} value={form.estrategia} onChange={(event) => atualizar("estrategia", event.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : "Salvar stakeholder"}</Button>
          {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
        </div>
      </form>
    </FolhaDaTela>
  );
};
