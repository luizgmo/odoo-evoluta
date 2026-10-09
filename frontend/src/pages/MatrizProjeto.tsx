import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { arquivarMatriz, atualizarMatriz, criarMatriz, gerarPlanoMatriz, listarMatrizes, type Matrix } from "@/services/api/matrix";
import { useParams } from "react-router-dom";

const label = "font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground";

export const MatrizProjeto: React.FC = () => {
  const { id } = useParams();
  const projectId = Number(id);
  const [records, setRecords] = useState<Matrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [name, setName] = useState("");
  const [criteria, setCriteria] = useState([{ name: "", peso: "1" }, { name: "", peso: "1" }]);
  const [alternatives, setAlternatives] = useState([{ name: "", notas: ["0", "0"] }, { name: "", notas: ["0", "0"] }]);
  const [erro, setErro] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const { avisar } = useAvisoDeResultado();

  const carregar = useCallback(() => {
    setLoading(true); setErroBusca(false);
    return listarMatrizes(projectId).then((resposta) => setRecords(resposta.records)).catch(() => setErroBusca(true)).finally(() => setLoading(false));
  }, [projectId]);
  useEffect(() => { void carregar(); }, [carregar]);

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!criteria.every((item) => item.name.trim()) || !alternatives.every((item) => item.name.trim())) { setErro("Preencha o nome de todos os critérios e alternativas."); return; }
    setErro(null); setSaving(true);
    try { await criarMatriz({ project_id: projectId, name: name.trim() || "Matriz de decisão", criterios: criteria.map((item) => ({ name: item.name.trim(), peso: Number(item.peso.replace(",", ".")) || 1 })), alternativas: alternatives.map((item) => ({ name: item.name.trim(), notas: item.notas.map((nota) => Number(nota.replace(",", ".")) || 0) })) }); await carregar(); setName(""); setCriteria([{ name: "", peso: "1" }, { name: "", peso: "1" }]); setAlternatives([{ name: "", notas: ["0", "0"] }, { name: "", notas: ["0", "0"] }]); avisar({ texto: "Matriz de decisão salva no projeto." }); }
    catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível salvar a matriz."); }
    finally { setSaving(false); }
  };

  const gerar = async (record: Matrix) => {
    try { await gerarPlanoMatriz(record.id); avisar({ texto: "Plano 5W2H gerado a partir da alternativa vencedora." }); await carregar(); }
    catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível gerar o plano 5W2H."); }
  };

  return <div className="space-y-5"><div><h2 className="font-display text-3xl font-semibold">Matriz de Decisão</h2><p className="text-sm text-muted-foreground">Compare alternativas com critérios e pesos definidos pelo gestor.</p></div>{loading ? <MesaCarregando texto="Buscando matrizes…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar as matrizes" onTentarDeNovo={() => void carregar()} /> : records.length === 0 ? <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhuma matriz cadastrada</p><p className="mt-1 text-sm text-muted-foreground">Crie a primeira matriz abaixo.</p></div> : <ul className="space-y-3" aria-label="Matrizes de decisão">{records.map((record) => <li key={record.id} className="folha-simples space-y-3 border border-border p-4"><h3 className="font-display text-2xl font-semibold">{record.name}</h3><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{record.alternativas.map((item) => <div key={item.id} className={`border border-border p-3 ${item.id === record.vencedor_id ? "ring-2 ring-ring" : ""}`}><p className="font-semibold">{item.name}</p><p className="font-mono text-sm">Total: {item.total}</p></div>)}</div>{record.vencedor_name && <><p className="text-sm"><strong>Vencedora:</strong> {record.vencedor_name}</p><Button type="button" variant="outline" size="sm" onClick={() => void gerar(record)}>Gerar 5W2H</Button></>}<div className="flex flex-wrap gap-2"><Button type="button" variant="ghost" size="sm" onClick={async () => { const nome = window.prompt("Nome da matriz", record.name); if (nome === null || !nome.trim()) return; try { await atualizarMatriz(record.id, { name: nome.trim() }); await carregar(); avisar({ texto: "Matriz atualizada." }); } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível atualizar a matriz."); } }}>Editar nome</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={async () => { if (!window.confirm("Arquivar esta matriz?")) return; try { await arquivarMatriz(record.id); await carregar(); avisar({ texto: "Matriz arquivada." }); } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível arquivar a matriz."); } }}>Arquivar</Button></div></li>)}</ul>}<form onSubmit={salvar} className="folha-simples space-y-4 border border-border p-4 md:p-6"><h3 className="font-display text-2xl font-semibold">Nova matriz</h3><div className="grid gap-2"><Label htmlFor="matriz-name" className={label}>Nome</Label><Input id="matriz-name" value={name} onChange={(event) => setName(event.target.value)} /></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{criteria.map((item, index) => <div key={index} className="grid gap-2"><Label htmlFor={`criterio-${index}`} className={label}>Critério {index + 1}</Label><Input id={`criterio-${index}`} value={item.name} onChange={(event) => setCriteria(criteria.map((atual, i) => i === index ? { ...atual, name: event.target.value } : atual))} placeholder="Nome" /><Input aria-label={`Peso do critério ${index + 1}`} inputMode="decimal" value={item.peso} onChange={(event) => setCriteria(criteria.map((atual, i) => i === index ? { ...atual, peso: event.target.value } : atual))} placeholder="Peso" /></div>)}</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{alternatives.map((item, index) => <div key={index} className="grid gap-2"><Label htmlFor={`alternativa-${index}`} className={label}>Alternativa {index + 1}</Label><Input id={`alternativa-${index}`} value={item.name} onChange={(event) => setAlternatives(alternatives.map((atual, i) => i === index ? { ...atual, name: event.target.value } : atual))} />{item.notas.map((nota, noteIndex) => <Input key={noteIndex} aria-label={`Nota da alternativa ${index + 1}, critério ${noteIndex + 1}`} inputMode="decimal" value={nota} onChange={(event) => setAlternatives(alternatives.map((atual, i) => i === index ? { ...atual, notas: atual.notas.map((valor, j) => j === noteIndex ? event.target.value : valor) } : atual))} placeholder={`Nota do critério ${noteIndex + 1}`} />)}</div>)}</div><div className="flex flex-wrap items-center gap-3"><Button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar matriz"}</Button>{erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}</div></form></div>;
};
