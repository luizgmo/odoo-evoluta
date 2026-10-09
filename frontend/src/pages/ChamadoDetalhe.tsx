import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { Carimbo, MesaCarregando, MesaErroBusca, type Tinta } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { listarUsuarios, type UsuarioMunicipal } from "@/services/api/organization";
import { adicionarAnexoChamado, adicionarComentarioChamado, atribuirChamado, atualizarChamado, concluirChamado, listarEstagiosChamados, listarEquipesChamados, moverChamado, obterChamado, type Chamado, type EstagioChamado, type EquipeChamado } from "@/services/api/tickets";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const erroDa = (error: unknown, padrao: string) => error instanceof Error ? error.message : padrao;
const tintaDaSituacao = (situacao: Chamado["situacao_key"]): Tinta => situacao === "done" || situacao === "closed" ? "violeta" : situacao === "in_progress" ? "verde" : "ocre";
const texto = (valor: string) => valor.replace(/<br\s*\/?>(?=.)/gi, "\n").replace(/<[^>]*>/g, "").trim();
const dataLegivel = (valor: string | false) => valor ? new Date(valor.replace(" ", "T") + (valor.length === 16 ? ":00" : "")).toLocaleString("pt-BR") : "";

const ChamadoDetalhe: React.FC = () => {
  const { id = "" } = useParams();
  const ticketId = Number(id);

  const { avisar } = useAvisoDeResultado();
  const { can } = useAuth();
  const [record, setRecord] = useState<Chamado | null>(null);
  const [equipes, setEquipes] = useState<EquipeChamado[]>([]);
  const [estagios, setEstagios] = useState<EstagioChamado[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioMunicipal[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [comentario, setComentario] = useState("");
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ titulo: "", descricao: "", prioridade: "1", teamId: "", responsavelId: "" });

  const carregar = useCallback(() => {
    if (!Number.isInteger(ticketId) || ticketId <= 0) { setLoading(false); setErroBusca(true); return Promise.resolve(); }
    setLoading(true); setErroBusca(false);
    return obterChamado(ticketId).then(({ record: item }) => {
      setRecord(item);
      setForm({ titulo: item.titulo, descricao: texto(item.descricao), prioridade: item.prioridade === "baixa" ? "0" : item.prioridade === "alta" ? "2" : item.prioridade === "muito_alta" ? "3" : "1", teamId: item.equipe_id ? String(item.equipe_id) : "", responsavelId: item.responsavel ? String(item.responsavel.id) : "" });
      return item;
    }).catch(() => setErroBusca(true)).finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => { void Promise.all([listarEquipesChamados(), listarUsuarios()]).then(([equipesResposta, usuariosResposta]) => { setEquipes(equipesResposta.records); setUsuarios(usuariosResposta.records); }).catch(() => { setEquipes([]); setUsuarios([]); }); }, []);
  useEffect(() => { void listarEstagiosChamados(form.teamId ? Number(form.teamId) : undefined).then((resposta) => setEstagios(resposta.records)).catch(() => setEstagios([])); }, [form.teamId]);

  const aplicar = (item: Chamado) => { setRecord(item); setForm((atual) => ({ ...atual, titulo: item.titulo, descricao: texto(item.descricao), teamId: item.equipe_id ? String(item.equipe_id) : "", responsavelId: item.responsavel ? String(item.responsavel.id) : "" })); };
  const executar = async (acao: () => Promise<{ record: Chamado }>, sucesso: string) => { if (salvando) return; setErro(null); setSalvando(true); try { const resposta = await acao(); aplicar(resposta.record); avisar({ texto: sucesso }); } catch (error) { setErro(erroDa(error, "O Odoo não permitiu executar esta ação.")); } finally { setSalvando(false); } };

  const salvar = async (event: React.FormEvent) => { event.preventDefault(); await executar(() => atualizarChamado(ticketId, { titulo: form.titulo.trim(), descricao: form.descricao.trim(), prioridade: form.prioridade }), "Chamado atualizado."); setEditando(false); };
  const salvarAtribuicao = () => void executar(() => atribuirChamado(ticketId, { team_id: form.teamId ? Number(form.teamId) : undefined, responsavel_id: form.responsavelId ? Number(form.responsavelId) : undefined }), "Chamado atribuído.");
  const comentar = async (event: React.FormEvent) => { event.preventDefault(); if (!comentario.trim()) return; await executar(() => adicionarComentarioChamado(ticketId, comentario.trim()), "Comentário adicionado."); setComentario(""); };
  const anexar = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (file.size > 10 * 1024 * 1024) { setErro("O anexo não pode ultrapassar 10 MB."); return; } const reader = new FileReader(); reader.onload = () => { const resultado = String(reader.result || ""); const [, data = ""] = resultado.split(","); void executar(() => adicionarAnexoChamado(ticketId, { name: file.name, mimetype: file.type || "application/octet-stream", data }), "Anexo adicionado."); }; reader.onerror = () => setErro("Não foi possível ler o arquivo selecionado."); reader.readAsDataURL(file); };

  return <FolhaDaTela trilha={[{ rotulo: "Chamados", para: "/chamados" }, { rotulo: record?.codigo || "Chamado" }]} titulo={record?.titulo || "Chamado"} subtitulo="Detalhe, acompanhamento, Chatter e arquivos do chamado." acao={<Button asChild variant="outline" size="sm"><Link to="/chamados">Voltar aos chamados</Link></Button>}>
    {loading ? <MesaCarregando texto="Abrindo chamado…" /> : erroBusca || !record ? <MesaErroBusca titulo="Não deu para abrir o chamado" onTentarDeNovo={() => void carregar()} /> : <div className="space-y-5">
      <div className="folha-simples space-y-4 border border-border p-4 md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">{record.codigo} · {record.estagio_nome || "Sem estágio"}</p><h2 className="mt-1 font-display text-3xl font-semibold">{record.titulo}</h2></div><Carimbo tinta={tintaDaSituacao(record.situacao_key)}>{record.situacao}</Carimbo></div><dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className={ROTULO}>Município</dt><dd>{record.municipio?.name || "Sem município"}</dd></div><div><dt className={ROTULO}>Secretaria</dt><dd>{record.secretaria?.name || "Sem secretaria"}</dd></div><div><dt className={ROTULO}>Departamento</dt><dd>{record.departamento?.name || "Sem departamento"}</dd></div><div><dt className={ROTULO}>SLA</dt><dd className={record.sla_status === "atrasado" ? "font-semibold text-destructive" : ""}>{record.sla_status === "atrasado" ? "Vencido" : record.sla_status === "sem_prazo" ? "Sem prazo" : `Até ${dataLegivel(record.prazo)}`}</dd></div></dl><div className="whitespace-pre-wrap text-sm leading-6">{texto(record.descricao)}</div><div className="flex flex-wrap gap-2">{can("manage_tickets") && <Button type="button" variant="outline" size="sm" onClick={() => setEditando((atual) => !atual)}>{editando ? "Cancelar edição" : "Editar chamado"}</Button>}<Button type="button" size="sm" onClick={() => void executar(() => concluirChamado(ticketId), "Chamado concluído.")} disabled={salvando || record.situacao_key === "done" || record.situacao_key === "closed"}>Concluir chamado</Button></div></div>
      {editando && <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6"><h2 className="font-display text-2xl font-semibold">Editar chamado</h2><div className="grid gap-2"><Label htmlFor="ticket-titulo" className={ROTULO}>Título</Label><Input id="ticket-titulo" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="ticket-descricao" className={ROTULO}>Descrição</Label><Textarea id="ticket-descricao" rows={5} value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="ticket-prioridade" className={ROTULO}>Prioridade</Label><select id="ticket-prioridade" value={form.prioridade} onChange={(event) => setForm({ ...form, prioridade: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="0">Baixa</option><option value="1">Normal</option><option value="2">Alta</option><option value="3">Muito alta</option></select></div><Button type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Salvar alterações"}</Button></form>}
      {can("assign_tickets") && <div className="folha-simples space-y-4 border border-border p-4 md:p-6"><h2 className="font-display text-2xl font-semibold">Equipe e fluxo</h2><div className="grid gap-4 md:grid-cols-3"><div className="grid gap-2"><Label htmlFor="ticket-equipe" className={ROTULO}>Equipe</Label><select id="ticket-equipe" value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value, responsavelId: "" })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem equipe</option>{equipes.map((equipe) => <option key={equipe.id} value={equipe.id}>{equipe.name}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="ticket-responsavel" className={ROTULO}>Responsável</Label><select id="ticket-responsavel" value={form.responsavelId} onChange={(event) => setForm({ ...form, responsavelId: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem responsável</option>{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.name}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="ticket-estagio" className={ROTULO}>Estágio</Label><select id="ticket-estagio" value={record.estagio_id ? String(record.estagio_id) : ""} onChange={(event) => { const stageId = Number(event.target.value); if (stageId) void executar(() => moverChamado(ticketId, stageId), "Estágio atualizado."); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem estágio</option>{estagios.map((estagio) => <option key={estagio.id} value={estagio.id}>{estagio.name}</option>)}</select></div></div><Button type="button" variant="outline" size="sm" onClick={salvarAtribuicao} disabled={salvando}>Salvar equipe e responsável</Button></div>}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]"><section className="folha-simples space-y-4 border border-border p-4 md:p-6"><h2 className="font-display text-2xl font-semibold">Chatter</h2><form onSubmit={comentar} className="space-y-2"><Label htmlFor="ticket-comentario" className={ROTULO}>Novo comentário</Label><Textarea id="ticket-comentario" rows={4} value={comentario} onChange={(event) => setComentario(event.target.value)} placeholder="Registre uma atualização para a equipe…" /><Button type="submit" disabled={salvando || !comentario.trim()}>{salvando ? "Enviando…" : "Adicionar comentário"}</Button></form><ol className="space-y-4 border-t border-dotted border-border pt-4" aria-label="Comentários do chamado">{(record.comentarios || []).map((item) => <li key={item.id} className="border-l-2 border-border pl-3"><p className="text-xs text-muted-foreground">{item.author}{item.date ? ` · ${dataLegivel(item.date)}` : ""}</p><p className="mt-1 whitespace-pre-wrap text-sm">{texto(item.body)}</p></li>)}{(record.comentarios || []).length === 0 && <li className="text-sm text-muted-foreground">Nenhum comentário registrado.</li>}</ol></section><section className="folha-simples space-y-4 border border-border p-4 md:p-6"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl font-semibold">Anexos</h2><label htmlFor="ticket-anexo" className="cursor-pointer rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent"><span>Adicionar arquivo</span></label><input id="ticket-anexo" type="file" className="sr-only" onChange={anexar} /></div><ul className="space-y-2">{record.anexos.map((anexo) => <li key={anexo.id} className="flex items-center justify-between gap-3 border-b border-dotted border-border py-2 text-sm"><a className="min-w-0 truncate hover:underline" href={anexo.url}>{anexo.name}</a><span className="shrink-0 text-xs text-muted-foreground">{Math.ceil(anexo.size / 1024)} KB</span></li>)}{record.anexos.length === 0 && <li className="text-sm text-muted-foreground">Nenhum anexo enviado.</li>}</ul></section></div>
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    </div>}
  </FolhaDaTela>;
};

export default ChamadoDetalhe;
