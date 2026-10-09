import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { useAuth } from "@/contexts/AuthContext";
import { Carimbo, MesaCarregando, MesaErroBusca, type Tinta } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listarUsuarios, type UsuarioMunicipal } from "@/services/api/organization";
import {
  aprovarPlano,
  atualizarPlano,
  criarPlano5W2H,
  gerarTaskPlano,
  listarPlanos5W2H,
  reiniciarValidacaoPlano,
  solicitarValidacaoPlano,
  type Plano5W2H,
} from "@/services/api/w2h";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const TRILHA = [{ rotulo: "Projetos" }, { rotulo: "Ferramenta" }, { rotulo: "5W2H" }];
const erroDa = (error: unknown, padrao: string) => error instanceof Error ? error.message : padrao;
const vazio = { name: "", what: "", why: "", where: "", when: "", whoId: "", how: "", howMuch: "" };
type FormularioPlano = typeof vazio;

const statusLabel = (status: Plano5W2H["validation_status"]) => ({ no: "Sem validação solicitada", waiting: "Aguardando próxima etapa", pending: "Aguardando sua aprovação", validated: "Aprovado", rejected: "Rejeitado" })[status];
const TINTAS_VALIDACAO: Record<Plano5W2H["validation_status"], Tinta> = { no: "azul", waiting: "ocre", pending: "ocre", validated: "violeta", rejected: "carmim" };
const statusTinta = (status: Plano5W2H["validation_status"]): Tinta => TINTAS_VALIDACAO[status];
const stateLabel = (state: Plano5W2H["state"]) => ({ draft: "Rascunho", confirmed: "Em validação", approved: "Aprovado", cancel: "Cancelado" })[state];

const formularioDoPlano = (plan: Plano5W2H): FormularioPlano => ({
  name: plan.name,
  what: plan.what,
  why: plan.why,
  where: plan.where,
  when: typeof plan.date_deadline === "string" ? plan.date_deadline : "",
  whoId: plan.who_id ? String(plan.who_id) : "",
  how: plan.how,
  howMuch: String(plan.how_much).replace(".", ","),
});

const W2HProjeto: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const [records, setRecords] = useState<Plano5W2H[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [form, setForm] = useState<FormularioPlano>(vazio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioMunicipal[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [acao, setAcao] = useState<string | null>(null);
  const { avisar } = useAvisoDeResultado();
  const { can } = useAuth();

  const carregar = useCallback(() => {
    setLoading(true);
    setErroBusca(false);
    return listarPlanos5W2H(projectId).then((resposta) => setRecords(resposta.records)).catch(() => setErroBusca(true)).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => { void listarUsuarios().then((resposta) => setUsuarios(resposta.records)).catch(() => setUsuarios([])); }, []);

  const cancelarEdicao = () => {
    setEditandoId(null);
    setForm(vazio);
    setErro(null);
  };

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    if (!form.what.trim()) { setErro("Preencha o campo What antes de salvar."); return; }
    let howMuch = Number(form.howMuch.replace(",", "."));
    if (!Number.isFinite(howMuch) || howMuch < 0) { setErro("Informe um valor válido e não negativo em How much."); return; }
    setErro(null);
    setEnviando(true);
    try {
      const dados = { name: form.name.trim() || undefined, what: form.what.trim(), why: form.why.trim(), where: form.where.trim(), date_deadline: form.when || undefined, who_id: Number(form.whoId) || undefined, how: form.how.trim(), how_much: howMuch };
      const resposta = editandoId === null
        ? await criarPlano5W2H({ project_id: projectId, ...dados })
        : await atualizarPlano(editandoId, dados);
      await carregar();
      avisar({ texto: editandoId === null ? `Plano “${resposta.record.name}” salvo no projeto.` : `Plano “${resposta.record.name}” atualizado.` });
      cancelarEdicao();
    } catch (error) {
      setErro(erroDa(error, editandoId === null ? "Não foi possível salvar o plano 5W2H." : "Não foi possível atualizar o plano 5W2H."));
    } finally {
      setEnviando(false);
    }
  };

  const iniciarEdicao = (plan: Plano5W2H) => {
    if (plan.state !== "draft") return;
    setEditandoId(plan.id);
    setForm(formularioDoPlano(plan));
    setErro(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const executar = async (plan: Plano5W2H, tipo: "solicitar" | "aprovar" | "reiniciar" | "task") => {
    const mensagens = { solicitar: "Solicitar validação deste plano?", aprovar: "Aprovar este plano conforme as regras do Odoo?", reiniciar: "Reiniciar o fluxo de validação deste plano?", task: "Gerar ou atualizar a task deste plano?" };
    if (!window.confirm(mensagens[tipo])) return;
    const chave = `${plan.id}:${tipo}`;
    if (acao) return;
    setErro(null);
    setAcao(chave);
    try {
      if (tipo === "solicitar") await solicitarValidacaoPlano(plan.id);
      if (tipo === "aprovar") await aprovarPlano(plan.id);
      if (tipo === "reiniciar") await reiniciarValidacaoPlano(plan.id);
      if (tipo === "task") await gerarTaskPlano(plan.id);
      await carregar();
      avisar({ texto: tipo === "task" ? "Task do plano criada ou atualizada pelo Odoo." : "Ação de validação executada pelo Odoo." });
    } catch (error) {
      setErro(erroDa(error, "O Odoo não permitiu executar esta ação."));
    } finally {
      setAcao(null);
    }
  };

  return <FolhaDaTela trilha={TRILHA} titulo="5W2H" subtitulo="Planos, validação em níveis e geração de task governados pelo Odoo.">
    {loading ? <MesaCarregando texto="Buscando os planos 5W2H…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar os planos" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhum plano cadastrado</p><p className="mt-1 text-sm text-muted-foreground">Registre o primeiro plano deste projeto abaixo.</p></div> : <ul className="space-y-3" aria-label="Planos 5W2H">{records.map((plan) => <li key={plan.id} className="folha-simples space-y-4 border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">Plano #{plan.id} · {stateLabel(plan.state)}</p><h2 className="mt-1 font-display text-2xl font-semibold">{plan.name}</h2><p className="mt-1 text-sm"><strong>What:</strong> {plan.what}</p></div><Carimbo tinta={statusTinta(plan.validation_status)}>{statusLabel(plan.validation_status)}</Carimbo></div><dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className={ROTULO}>Quando</dt><dd>{plan.date_deadline || "Sem prazo"}</dd></div><div><dt className={ROTULO}>Quem</dt><dd>{plan.who_name || "Sem responsável"}</dd></div><div><dt className={ROTULO}>Quanto</dt><dd>R$ {plan.how_much.toFixed(2).replace(".", ",")}</dd></div><div><dt className={ROTULO}>Task</dt><dd>{plan.task_id ? `#${plan.task_id}` : "Ainda não gerada"}</dd></div><div><dt className={ROTULO}>Revisões</dt><dd>{plan.reviews.length ? `${plan.reviews.filter((review) => review.status === "approved").length}/${plan.reviews.length} aprovadas` : "Nenhuma"}</dd></div></dl>{plan.reviews.length > 0 && <ul className="border-t border-dotted border-border pt-3 text-sm" aria-label={`Revisões do plano ${plan.name}`}>{plan.reviews.map((review) => <li key={review.id}>{review.name}: {review.status === "approved" ? "aprovada" : review.status === "pending" ? "pendente" : review.status === "waiting" ? "aguardando" : review.status}</li>)}</ul>}<div className="flex flex-wrap gap-2">{can("manage_projects") && plan.state === "draft" && <Button type="button" variant="outline" size="sm" onClick={() => iniciarEdicao(plan)} disabled={acao !== null || enviando}>Editar</Button>}{plan.can_request_validation && <Button type="button" variant="outline" size="sm" onClick={() => void executar(plan, "solicitar")} disabled={acao !== null}>{acao === `${plan.id}:solicitar` ? "Solicitando…" : "Solicitar validação"}</Button>}{plan.can_validate && <Button type="button" size="sm" onClick={() => void executar(plan, "aprovar")} disabled={acao !== null}>{acao === `${plan.id}:aprovar` ? "Aprovando…" : "Aprovar"}</Button>}{plan.can_restart_validation && <Button type="button" variant="outline" size="sm" onClick={() => void executar(plan, "reiniciar")} disabled={acao !== null}>{acao === `${plan.id}:reiniciar` ? "Reiniciando…" : "Reiniciar validação"}</Button>}{!plan.task_id && <Button type="button" variant="outline" size="sm" onClick={() => void executar(plan, "task")} disabled={acao !== null}>{acao === `${plan.id}:task` ? "Gerando task…" : "Gerar task"}</Button>}</div></li>)}</ul>}
    {can("manage_projects") && <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6"><div><h2 className="font-display text-2xl font-semibold">{editandoId === null ? "Novo plano 5W2H" : `Editar plano #${editandoId}`}</h2><p className="mt-1 text-sm text-muted-foreground">{editandoId === null ? "A validação e a geração da task seguem as permissões configuradas no Odoo." : "Somente rascunhos podem ser editados. Salvar mantém o plano no estado atual."}</p></div><div className="grid gap-2"><Label htmlFor="w2h-name" className={ROTULO}>Nome do plano</Label><Input id="w2h-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="w2h-what" className={ROTULO}>What — o quê</Label><Input id="w2h-what" value={form.what} onChange={(event) => setForm({ ...form, what: event.target.value })} required /></div><div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label htmlFor="w2h-why" className={ROTULO}>Why — por quê</Label><Textarea id="w2h-why" rows={3} value={form.why} onChange={(event) => setForm({ ...form, why: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="w2h-where" className={ROTULO}>Where — onde</Label><Input id="w2h-where" value={form.where} onChange={(event) => setForm({ ...form, where: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="w2h-when" className={ROTULO}>When — quando</Label><Input id="w2h-when" type="date" value={form.when} onChange={(event) => setForm({ ...form, when: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="w2h-who" className={ROTULO}>Who — responsável</Label><select id="w2h-who" value={form.whoId} onChange={(event) => setForm({ ...form, whoId: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione um usuário municipal (opcional)</option>{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.name} · {usuario.role}</option>)}</select><p className="text-xs text-muted-foreground">O responsável será atribuído à task quando ela for gerada.</p></div></div><div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label htmlFor="w2h-how" className={ROTULO}>How — como</Label><Textarea id="w2h-how" rows={3} value={form.how} onChange={(event) => setForm({ ...form, how: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="w2h-howmuch" className={ROTULO}>How much — quanto (R$)</Label><Input id="w2h-howmuch" inputMode="decimal" value={form.howMuch} onChange={(event) => setForm({ ...form, howMuch: event.target.value })} /></div></div><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={enviando}>{enviando ? (editandoId === null ? "Salvando…" : "Atualizando…") : (editandoId === null ? "Salvar plano" : "Salvar alterações")}</Button>{editandoId !== null && <Button type="button" variant="outline" onClick={cancelarEdicao} disabled={enviando}>Cancelar edição</Button>}{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div></form>}
  </FolhaDaTela>;
};

export default W2HProjeto;
