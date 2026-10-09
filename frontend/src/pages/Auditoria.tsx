import React, { useCallback, useEffect, useState } from "react";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listarAuditoria, type RegistroAuditoria } from "@/services/api/audit";

const ROTULO = "font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const formatar = (value: string | false) => value ? new Date(value.replace(" ", "T")).toLocaleString("pt-BR") : "";

const Auditoria: React.FC = () => {
  const [records, setRecords] = useState<RegistroAuditoria[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const carregar = useCallback(() => { setLoading(true); setErro(false); return listarAuditoria({ from: from || undefined, to: to || undefined }).then((resposta) => setRecords(resposta.records)).catch(() => setErro(true)).finally(() => setLoading(false)); }, [from, to]);
  useEffect(() => { void carregar(); }, [carregar]);
  return <FolhaDaTela trilha={[{ rotulo: "Administração" }, { rotulo: "Auditoria" }]} titulo="Auditoria" subtitulo="Registro somente leitura das ações realizadas na gestão municipal."><div className="folha-simples mb-5 grid gap-4 border border-border p-4 md:grid-cols-[1fr_1fr_auto]"><div className="grid gap-2"><Label htmlFor="auditoria-de" className={ROTULO}>De</Label><Input id="auditoria-de" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="auditoria-ate" className={ROTULO}>Até</Label><Input id="auditoria-ate" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div><Button type="button" className="self-end" onClick={() => void carregar()}>Aplicar filtro</Button></div>{loading ? <MesaCarregando texto="Buscando auditoria…" /> : erro ? <MesaErroBusca titulo="Não deu para buscar a auditoria" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhum evento encontrado</p><p className="mt-1 text-sm text-muted-foreground">Os eventos das novas operações aparecerão aqui.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[48rem] text-left text-sm"><caption className="sr-only">Eventos de auditoria</caption><thead><tr className="border-b border-border"><th className="py-3 pr-3">Quando</th><th className="py-3 pr-3">Ação</th><th className="py-3 pr-3">Registro</th><th className="py-3 pr-3">Usuário</th><th className="py-3">Detalhes</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b border-dotted border-border align-top"><td className="py-3 pr-3 whitespace-nowrap">{formatar(record.created_at)}</td><td className="py-3 pr-3">{record.action_label}</td><td className="py-3 pr-3"><strong>{record.res_name}</strong><span className="block text-xs text-muted-foreground">{record.model} #{record.res_id}</span></td><td className="py-3 pr-3">{record.user?.name || "Sistema"}</td><td className="py-3">{record.details || "—"}</td></tr>)}</tbody></table></div>}</FolhaDaTela>;
};

export default Auditoria;
