import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { Carimbo, MesaCarregando, MesaErroBusca, type Tinta } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { criarChamado, listarChamados, listarEquipesChamados, type Chamado, type EquipeChamado } from "@/services/api/tickets";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const erroDa = (error: unknown, padrao: string) => error instanceof Error ? error.message : padrao;

const tintaDaSituacao = (situacao: Chamado["situacao_key"]): Tinta => {
  if (situacao === "done" || situacao === "closed") return "violeta";
  if (situacao === "in_progress") return "verde";
  return "ocre";
};

const textoSla = (status: Chamado["sla_status"]) => {
  if (status === "atrasado") return "SLA vencido";
  if (status === "sem_prazo") return "Sem prazo de SLA";
  return "Dentro do prazo";
};

const formatarPrazo = (prazo: Chamado["prazo"]) => {
  if (!prazo) return "Sem prazo definido";
  const [data, hora] = prazo.split(" ");
  const dataFormatada = data?.split("-").reverse().join("/") || prazo;
  return `${dataFormatada}${hora ? ` às ${hora.slice(0, 5)}` : ""}`;
};

const limparDescricao = (descricao: string) => descricao.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const Chamados: React.FC = () => {
  const [records, setRecords] = useState<Chamado[]>([]);
  const [equipes, setEquipes] = useState<EquipeChamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [busca, setBusca] = useState("");
  const [novoAberto, setNovoAberto] = useState(false);
  const [form, setForm] = useState({ titulo: "", descricao: "", team_id: "" });
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { avisar } = useAvisoDeResultado();

  const carregar = useCallback(() => {
    setLoading(true);
    setErroBusca(false);
    return Promise.all([listarChamados(), listarEquipesChamados()])
      .then(([chamados, equipesResposta]) => { setRecords(chamados.records); setEquipes(equipesResposta.records); })
      .catch(() => setErroBusca(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase();
    if (!termo) return records;
    return records.filter((record) => [record.codigo, record.titulo, record.descricao, record.equipe_nome, record.situacao].some((valor) => valor.toLocaleLowerCase().includes(termo)));
  }, [busca, records]);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviando) return;
    if (!form.titulo.trim()) { setErroForm("Informe o título do chamado."); return; }
    if (!form.descricao.trim()) { setErroForm("Informe a descrição do chamado."); return; }
    setErroForm(null);
    setEnviando(true);
    try {
      await criarChamado({ titulo: form.titulo.trim(), descricao: form.descricao.trim(), ...(form.team_id ? { team_id: Number(form.team_id) } : {}) });
      await carregar();
      setForm({ titulo: "", descricao: "", team_id: "" });
      setNovoAberto(false);
      avisar({ texto: "Chamado criado no Helpdesk." });
    } catch (error) {
      setErroForm(erroDa(error, "Não foi possível criar o chamado."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <FolhaDaTela trilha={[{ rotulo: "Chamados" }]} titulo="Chamados" subtitulo="Pedidos das secretarias com prazo acompanhado." acao={<Button type="button" size="sm" onClick={() => { setNovoAberto((aberto) => !aberto); setErroForm(null); }}>{novoAberto ? "Fechar formulário" : "Novo chamado"}</Button>}>
      {novoAberto && <form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6"><div><h2 className="font-display text-2xl font-semibold">Novo chamado</h2><p className="mt-1 text-sm text-muted-foreground">O ticket será criado no Helpdesk do Odoo.</p></div><div className="grid gap-2"><Label htmlFor="chamado-titulo" className={ROTULO}>Título</Label><Input id="chamado-titulo" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="chamado-descricao" className={ROTULO}>Descrição</Label><Textarea id="chamado-descricao" rows={4} value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="chamado-equipe" className={ROTULO}>Equipe</Label><select id="chamado-equipe" value={form.team_id} onChange={(event) => setForm({ ...form, team_id: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem equipe específica</option>{equipes.map((equipe) => <option key={equipe.id} value={equipe.id}>{equipe.name}{equipe.use_sla ? " — SLA ativo" : ""}</option>)}</select>{equipes.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma equipe ativa foi cadastrada; o Helpdesk aceitará o chamado sem equipe.</p>}</div><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={enviando}>{enviando ? "Criando…" : "Criar chamado"}</Button>{erroForm && <p role="alert" className="text-sm text-destructive">{erroForm}</p>}</div></form>}
      {loading ? <MesaCarregando texto="Buscando chamados no Helpdesk…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar os chamados" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhum chamado cadastrado</p><p className="mt-1 text-sm text-muted-foreground">Crie o primeiro chamado usando o botão acima.</p></div> : <div className="space-y-4"><div className="grid gap-2"><Label htmlFor="busca-chamados" className={ROTULO}>Buscar</Label><Input id="busca-chamados" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Código, título, equipe ou situação" /></div>{filtrados.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhum chamado encontrado</p><p className="mt-1 text-sm text-muted-foreground">Tente outro termo de busca.</p></div> : <ul className="grid gap-3" aria-label="Chamados do Helpdesk">{filtrados.map((record) => <li key={record.id} className="folha-simples space-y-3 border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">{record.codigo}</p><h2 className="mt-1 font-display text-2xl font-semibold">{record.titulo}</h2></div><Carimbo tinta={tintaDaSituacao(record.situacao_key)}>{record.situacao}</Carimbo></div><p className="text-sm text-muted-foreground">{limparDescricao(record.descricao)}</p><dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className={ROTULO}>Equipe</dt><dd>{record.equipe_nome || "Não atribuída"}</dd></div><div><dt className={ROTULO}>Prioridade</dt><dd>{record.prioridade_label}</dd></div><div><dt className={ROTULO}>SLA</dt><dd className={record.sla_status === "atrasado" ? "font-semibold text-destructive" : ""}>{textoSla(record.sla_status)}</dd></div><div><dt className={ROTULO}>Prazo</dt><dd>{formatarPrazo(record.prazo)}</dd></div></dl></li>)}</ul>}</div>}
    </FolhaDaTela>
  );
};

export default Chamados;
