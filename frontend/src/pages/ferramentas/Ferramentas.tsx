import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStakeholders } from "@/hooks/useStakeholders";
import { arquivarStakeholder, atualizarStakeholder, criarStakeholder, type NovoStakeholder, type StakeholderInfluencia, type StakeholderPoder, type StakeholderPosicao } from "@/services/api/stakeholders";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const INICIAL = (projectId: number): NovoStakeholder => ({
  project_id: projectId,
  name: "",
  organizacao: "",
  poder: "medio",
  interesse: "medio",
  posicao: "neutro",
  influencia: "media",
  estrategia: "",
});

const SelectCampo: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}> = ({ id, label, value, onChange, children }) => (
  <div className="grid gap-2">
    <Label htmlFor={id} className={ROTULO}>{label}</Label>
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </select>
  </div>
);

const TelaStakeholders: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const { stakeholders, isLoading, isError, refetch } = useStakeholders(projectId);
  const { avisar } = useAvisoDeResultado();
  const [form, setForm] = useState<NovoStakeholder>(() => INICIAL(projectId));
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const atualizarCampo = <K extends keyof NovoStakeholder>(campo: K, valor: NovoStakeholder[K]) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const cancelar = () => {
    setEditandoId(null);
    setForm(INICIAL(projectId));
    setErro(null);
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
      const resposta = editandoId
        ? await atualizarStakeholder(editandoId, { ...form, name: form.name.trim() })
        : await criarStakeholder({ ...form, name: form.name.trim() });
      await refetch();
      cancelar();
      avisar({ texto: `Stakeholder “${resposta.record.name}” foi ${editandoId ? "atualizado" : "adicionado"} ao projeto.` });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar. Nada foi alterado.");
    } finally {
      setEnviando(false);
    }
  };

  const editar = (stakeholder: (typeof stakeholders)[number]) => {
    setEditandoId(stakeholder.id);
    setForm({
      project_id: projectId,
      name: stakeholder.name,
      organizacao: stakeholder.organizacao,
      poder: stakeholder.poder,
      interesse: stakeholder.interesse,
      posicao: stakeholder.posicao,
      influencia: stakeholder.influencia,
      estrategia: stakeholder.estrategia,
    });
    setErro(null);
  };

  const arquivar = async (stakeholder: (typeof stakeholders)[number]) => {
    if (!window.confirm(`Arquivar “${stakeholder.name}”?`)) return;
    setErro(null);
    try {
      await arquivarStakeholder(stakeholder.id);
      await refetch();
      if (editandoId === stakeholder.id) cancelar();
      avisar({ texto: "Stakeholder arquivado." });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível arquivar o stakeholder.");
    }
  };

  return (
    <FolhaDaTela
      trilha={[{ rotulo: "Projetos" }, { rotulo: "Ferramenta" }, { rotulo: "Stakeholders" }]}
      titulo="Stakeholders"
      subtitulo="Pessoas e organizações que influenciam o projeto ou são afetadas por ele."
    >
      {isLoading ? <MesaCarregando texto="Buscando os stakeholders do projeto…" /> : isError ? (
        <MesaErroBusca titulo="Não deu para buscar os stakeholders" texto="O projeto não foi alterado. Tente de novo em instantes." onTentarDeNovo={() => void refetch()} />
      ) : stakeholders.length === 0 ? (
        <div className="folha-simples border border-dashed border-border p-5">
          <p className="mesa-secao tinta-ocre">Nenhum stakeholder cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground">Adicione a primeira pessoa ou organização considerada no projeto.</p>
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Stakeholders do projeto">
          {stakeholders.map((stakeholder) => (
            <li key={stakeholder.id} className="folha-simples space-y-3 border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{stakeholder.name}</h2>
                  {stakeholder.organizacao && <p className="text-sm text-muted-foreground">{stakeholder.organizacao}</p>}
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">{stakeholder.posicao_label}</p>
              </div>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div><dt className={ROTULO}>Poder</dt><dd>{stakeholder.poder_label}</dd></div>
                <div><dt className={ROTULO}>Interesse</dt><dd>{stakeholder.interesse_label}</dd></div>
                <div><dt className={ROTULO}>Influência</dt><dd>{stakeholder.influencia_label}</dd></div>
              </dl>
              {stakeholder.estrategia && <p className="border-t border-dotted border-border pt-2 text-sm text-muted-foreground"><strong className="text-foreground">Estratégia:</strong> {stakeholder.estrategia}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => editar(stakeholder)}>Editar</Button>
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => void arquivar(stakeholder)}>Arquivar</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">{editandoId ? "Editar stakeholder" : "Adicionar stakeholder"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">O registro será salvo diretamente no projeto atual.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="stakeholder-name" className={ROTULO}>Nome</Label><Input id="stakeholder-name" value={form.name} onChange={(event) => atualizarCampo("name", event.target.value)} required /></div>
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="stakeholder-organizacao" className={ROTULO}>Organização</Label><Input id="stakeholder-organizacao" value={form.organizacao} onChange={(event) => atualizarCampo("organizacao", event.target.value)} /></div>
          <SelectCampo id="stakeholder-poder" label="Poder" value={form.poder} onChange={(value) => atualizarCampo("poder", value as StakeholderPoder)}><option value="baixo">Baixo</option><option value="medio">Médio</option><option value="alto">Alto</option></SelectCampo>
          <SelectCampo id="stakeholder-interesse" label="Interesse" value={form.interesse} onChange={(value) => atualizarCampo("interesse", value as StakeholderPoder)}><option value="baixo">Baixo</option><option value="medio">Médio</option><option value="alto">Alto</option></SelectCampo>
          <SelectCampo id="stakeholder-posicao" label="Posição" value={form.posicao} onChange={(value) => atualizarCampo("posicao", value as StakeholderPosicao)}><option value="apoiador">Apoiador</option><option value="neutro">Neutro</option><option value="opositor">Opositor</option></SelectCampo>
          <SelectCampo id="stakeholder-influencia" label="Influência" value={form.influencia} onChange={(value) => atualizarCampo("influencia", value as StakeholderInfluencia)}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option></SelectCampo>
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="stakeholder-estrategia" className={ROTULO}>Estratégia de relacionamento</Label><Textarea id="stakeholder-estrategia" rows={3} value={form.estrategia} onChange={(event) => atualizarCampo("estrategia", event.target.value)} /></div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editandoId ? "Salvar alterações" : "Salvar stakeholder"}</Button>
          {editandoId && <Button type="button" variant="ghost" onClick={cancelar}>Cancelar</Button>}
          {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
        </div>
      </form>
    </FolhaDaTela>
  );
};

export { TelaStakeholders };
