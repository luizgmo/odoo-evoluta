import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { useAuth } from "@/contexts/AuthContext";
import { useProcessoDaMesa } from "@/hooks/useMesaDados";
import { apiPost } from "@/services/api/client";
import { atualizarProjeto, arquivarProjeto, listarEtapasProjeto, type EtapaProjeto } from "@/services/api/projects";
import { listarDepartamentos, listarMunicipios, listarSecretarias, listarUsuarios, type Departamento, type Municipio, type Secretaria, type UsuarioMunicipal } from "@/services/api/organization";
import { GEN, MARCA } from "@/config/marca";

const plural = MARCA.objeto.plural.charAt(0).toUpperCase() + MARCA.objeto.plural.slice(1);

const numeroDoOrcamento = (valor: string) => Number(valor.replace(/\./g, "").replace(",", ".")) || 0;
const orcamentoParaInput = (valor: string) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero.toFixed(2).replace(".", ",") : "";
};

const Formulario: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const projetoId = id ? Number(id) : 0;
  const editando = Number.isInteger(projetoId) && projetoId > 0;
  const { avisar } = useAvisoDeResultado();
  const { user, can } = useAuth();
  const { data: projeto, isLoading: projetoCarregando, error: projetoErro } = useProcessoDaMesa(editando ? id : undefined);
  const [objeto, setObjeto] = useState("");
  const [valor, setValor] = useState("");
  const [municipioId, setMunicipioId] = useState("");
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [prazo, setPrazo] = useState("");
  const [secretariaId, setSecretariaId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [etapaId, setEtapaId] = useState("");
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioMunicipal[]>([]);
  const [etapas, setEtapas] = useState<EtapaProjeto[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [carregado, setCarregado] = useState(false);
  const eSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    if (!user) return;
    if (eSuperAdmin) {
      void listarMunicipios().then((resposta) => setMunicipios(resposta.records)).catch(() => setMunicipios([]));
      return;
    }
    setMunicipioId(user.municipio?.id ? String(user.municipio.id) : "");
  }, [eSuperAdmin, user]);

  useEffect(() => {
    if (editando || !user) return;
    if (user.secretaria?.id) setSecretariaId(String(user.secretaria.id));
    if (user.departamento?.id) setDepartamentoId(String(user.departamento.id));
    if (user.id) setResponsavelId(String(user.id));
  }, [editando, user]);

  useEffect(() => {
    if (!editando || !projeto || carregado) return;
    setObjeto(projeto.object);
    setValor(orcamentoParaInput(projeto.estimated_value));
    setMunicipioId(projeto.projectInfo.municipio ? String(projeto.projectInfo.municipio.id) : "");
    setPrazo(projeto.projectInfo.date_deadline ?? "");
    setSecretariaId(projeto.projectInfo.secretaria ? String(projeto.projectInfo.secretaria.id) : "");
    setDepartamentoId(projeto.projectInfo.departamento ? String(projeto.projectInfo.departamento.id) : "");
    setResponsavelId(projeto.projectInfo.responsavel ? String(projeto.projectInfo.responsavel.id) : "");
    setEtapaId(projeto.projectInfo.etapa ? String(projeto.projectInfo.etapa.id) : "");
    setCarregado(true);
  }, [carregado, editando, projeto]);

  useEffect(() => {
    void listarEtapasProjeto().then((resposta) => {
      setEtapas(resposta.records);
      if (!editando && resposta.records[0]) setEtapaId(String(resposta.records[0].id));
    }).catch(() => setEtapas([]));
    void listarUsuarios().then((resposta) => setUsuarios(resposta.records)).catch(() => setUsuarios([]));
  }, [editando]);

  useEffect(() => {
    setSecretarias([]);
    setDepartamentos([]);
    if (!municipioId) return;
    void listarSecretarias(Number(municipioId)).then((resposta) => setSecretarias(resposta.records)).catch(() => setSecretarias([]));
  }, [municipioId]);

  useEffect(() => {
    setDepartamentos([]);
    if (secretariaId) {
      void listarDepartamentos(Number(secretariaId)).then((resposta) => setDepartamentos(resposta.records)).catch(() => setDepartamentos([]));
    }
  }, [secretariaId]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    if (!objeto.trim()) { setErro("Informe o nome do projeto."); return; }
    const orcamento = numeroDoOrcamento(valor);
    if (!Number.isFinite(orcamento) || orcamento < 0) { setErro("Informe um orçamento igual ou maior que zero."); return; }
    if (eSuperAdmin && !municipioId) { setErro("Selecione o município do projeto."); return; }
    if (!eSuperAdmin && !user?.municipio?.id) { setErro("Sua conta não possui município configurado."); return; }
    setErro(null);
    setEnviando(true);
    const payload = {
      name: objeto.trim(),
      orcamento,
      municipio_id: Number(municipioId) || undefined,
      secretaria_id: Number(secretariaId) || undefined,
      departamento_id: Number(departamentoId) || undefined,
      date_deadline: prazo || null,
      responsavel_id: Number(responsavelId) || undefined,
      etapa_id: Number(etapaId) || undefined,
    };
    try {
      if (editando) {
        await atualizarProjeto(projetoId, payload);
        avisar({ texto: `${GEN.O} ${MARCA.objeto.singular} foi atualizad${GEN.fim}.` });
        navigate(`${MARCA.rotaDaLista}/${projetoId}`);
      } else {
        const criado = await apiPost<{ record: { id: number; name: string } }>("/api/projetos", payload);
        avisar({ texto: `${GEN.O} ${MARCA.objeto.singular} "${criado.record.name}" foi criad${GEN.fim}. Agora preencha o plano 5W2H.` });
        navigate(`${MARCA.rotaDaLista}/${criado.record.id}/w2h`);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar; nada foi alterado.");
    } finally {
      setEnviando(false);
    }
  };

  const arquivar = async () => {
    if (!editando || !can("archive_projects") || enviando) return;
    if (!window.confirm("Arquivar este projeto? Ele sairá do trabalho em andamento, mas seu histórico permanecerá disponível no Arquivo.")) return;
    setErro(null);
    setEnviando(true);
    try {
      await arquivarProjeto(projetoId);
      avisar({ texto: `${GEN.O} ${MARCA.objeto.singular} foi arquivad${GEN.fim}.` });
      navigate("/arquivo");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível arquivar o projeto.");
    } finally {
      setEnviando(false);
    }
  };

  if (editando && projetoCarregando) {
    return <FolhaDaTela trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: plural, para: MARCA.rotaDaLista }, { rotulo: "Editar projeto" }]} titulo="Editar projeto"><MesaCarregando texto="Buscando o projeto…" /></FolhaDaTela>;
  }
  if (!can("manage_projects")) return <Navigate to="/unauthorized" replace />;
  if (editando && (!projeto || projetoErro)) {
    return <FolhaDaTela trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: plural, para: MARCA.rotaDaLista }, { rotulo: "Editar projeto" }]} titulo="Editar projeto"><MesaErroBusca titulo="Não deu para buscar o projeto" texto="O projeto pode não existir ou estar fora do seu município." onTentarDeNovo={() => window.location.reload()} /></FolhaDaTela>;
  }

  return (
    <FolhaDaTela
      trilha={[
        { rotulo: MARCA.inicio, para: MARCA.rotaInicial },
        { rotulo: plural, para: MARCA.rotaDaLista },
        { rotulo: editando ? "Editar projeto" : MARCA.acaoPrincipal.rotulo },
      ]}
      titulo={editando ? "Editar projeto" : "Novo projeto"}
      subtitulo={editando ? "Atualize os dados persistidos desta iniciativa municipal." : "Crie a pasta do projeto e depois preencha o plano 5W2H completo."}
    >
      <form onSubmit={salvar} className="max-w-xl space-y-5">
        {!editando && <div className="border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground"><p className="font-semibold text-foreground">O que será preenchido agora?</p><p className="mt-1">Crie a pasta com os dados básicos. Na próxima tela estarão What, Why, Where, When, Who, How e How much.</p></div>}
        <div className="space-y-2"><Label htmlFor="objeto">Nome do projeto</Label><Textarea id="objeto" value={objeto} onChange={(e) => setObjeto(e.target.value)} required rows={3} /></div>
        <div className="space-y-2"><Label htmlFor="valor">Orçamento inicial (R$)</Label><Input id="valor" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" /></div>
        <div className="grid gap-4 md:grid-cols-2">
          {eSuperAdmin ? <div className="space-y-2"><Label htmlFor="municipio">Município</Label><select id="municipio" value={municipioId} onChange={(e) => { setMunicipioId(e.target.value); setSecretariaId(""); setDepartamentoId(""); setResponsavelId(""); }} required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione o município</option>{municipios.map((municipio) => <option key={municipio.id} value={municipio.id}>{municipio.name}</option>)}</select><p className="text-xs text-muted-foreground">O município é definido pela Evoluta para manter cada cliente isolado.</p></div> : <div className="space-y-2"><Label htmlFor="municipio">Município</Label><Input id="municipio" value={user?.municipio?.name || "Sem município configurado"} readOnly aria-readonly="true" /><p className="text-xs text-muted-foreground">Sua conta só pode trabalhar no município vinculado a ela.</p></div>}
          <div className="space-y-2"><Label htmlFor="secretaria">Secretaria</Label><select id="secretaria" value={secretariaId} onChange={(e) => { setSecretariaId(e.target.value); setDepartamentoId(""); }} disabled={!municipioId || user?.role === "secretario" || user?.role === "atendente"} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Projeto municipal geral</option>{secretarias.map((secretaria) => <option key={secretaria.id} value={secretaria.id}>{secretaria.name}</option>)}</select><p className="text-xs text-muted-foreground">Sem secretaria significa uma iniciativa municipal geral, visível conforme as regras do município.</p></div>
          <div className="space-y-2"><Label htmlFor="departamento">Departamento</Label><select id="departamento" value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)} disabled={!secretariaId} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Toda a secretaria</option>{departamentos.map((departamento) => <option key={departamento.id} value={departamento.id}>{departamento.name}</option>)}</select></div>
          <div className="space-y-2"><Label htmlFor="prazo">Prazo final</Label><Input id="prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="responsavel">Responsável</Label><select id="responsavel" value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem responsável</option>{usuarios.filter((usuario) => !municipioId || usuario.municipio?.id === Number(municipioId)).map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.name} · {usuario.role}</option>)}</select></div>
          <div className="space-y-2"><Label htmlFor="etapa">Etapa atual</Label><select id="etapa" value={etapaId} onChange={(e) => setEtapaId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem etapa</option>{etapas.map((etapa) => <option key={etapa.id} value={etapa.id}>{etapa.name}</option>)}</select><p className="text-xs text-muted-foreground">A etapa vem do fluxo de projetos do Odoo.</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editando ? "Salvar alterações" : "Criar projeto e continuar para o 5W2H"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={enviando}>Cancelar</Button>
          {editando && can("archive_projects") && <Button type="button" variant="destructive" onClick={() => void arquivar()} disabled={enviando}>Arquivar projeto</Button>}
        </div>
        {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      </form>
    </FolhaDaTela>
  );
};

export default Formulario;
