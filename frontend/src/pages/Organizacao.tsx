import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAuth } from "@/contexts/AuthContext";
import {
  criarDepartamento,
  atualizarDepartamento,
  criarMunicipio,
  atualizarMunicipio,
  criarSecretaria,
  atualizarSecretaria,
  listarDepartamentos,
  listarMunicipios,
  listarSecretarias,
  type Departamento,
  type Municipio,
  type Secretaria,
} from "@/services/api/organization";

const ROTULO = "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

const Organizacao: React.FC = () => {
  const { user } = useAuth();
  const podeCriarMunicipio = Boolean(user?.permissions.manage_municipios);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipioId, setMunicipioId] = useState("");
  const [secretariaId, setSecretariaId] = useState("");
  const [novoMunicipio, setNovoMunicipio] = useState("");
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novaSecretaria, setNovaSecretaria] = useState("");
  const [novoDepartamento, setNovoDepartamento] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroAto, setErroAto] = useState("");
  const [salvando, setSalvando] = useState(false);

  const municipioSelecionado = useMemo(
    () => municipios.find((item) => String(item.id) === municipioId),
    [municipios, municipioId],
  );
  const secretariaSelecionada = useMemo(
    () => secretarias.find((item) => String(item.id) === secretariaId),
    [secretarias, secretariaId],
  );

  const carregarMunicipios = async () => {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await listarMunicipios();
      setMunicipios(resposta.records);
      setMunicipioId((atual) => atual || (resposta.records[0] ? String(resposta.records[0].id) : ""));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível buscar a estrutura municipal.");
    } finally {
      setCarregando(false);
    }
  };

  const carregarSecretarias = async (id: string) => {
    setSecretarias([]);
    setDepartamentos([]);
    setSecretariaId("");
    if (!id) return;
    try {
      const resposta = await listarSecretarias(Number(id));
      setSecretarias(resposta.records);
      setSecretariaId(resposta.records[0] ? String(resposta.records[0].id) : "");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível buscar as secretarias.");
    }
  };

  const carregarDepartamentos = async (id: string) => {
    setDepartamentos([]);
    if (!id) return;
    try {
      const resposta = await listarDepartamentos(Number(id));
      setDepartamentos(resposta.records);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível buscar os departamentos.");
    }
  };

  useEffect(() => {
    void carregarMunicipios();
  }, []);

  useEffect(() => {
    void carregarSecretarias(municipioId);
  }, [municipioId]);

  useEffect(() => {
    void carregarDepartamentos(secretariaId);
  }, [secretariaId]);

  const atualizar = async (tipo: "municipio" | "secretaria" | "departamento", id: number, nomeAtual: string) => {
    const nome = window.prompt("Novo nome", nomeAtual);
    if (nome === null || !nome.trim()) return;
    setSalvando(true); setErroAto("");
    try {
      if (tipo === "municipio") await atualizarMunicipio(id, { name: nome.trim() });
      if (tipo === "secretaria") await atualizarSecretaria(id, { name: nome.trim() });
      if (tipo === "departamento") await atualizarDepartamento(id, { name: nome.trim() });
      if (tipo === "municipio") await carregarMunicipios();
      if (tipo === "secretaria") await carregarSecretarias(municipioId);
      if (tipo === "departamento") await carregarDepartamentos(secretariaId);
    } catch (error) { setErroAto(error instanceof Error ? error.message : "Não foi possível atualizar o cadastro."); }
    finally { setSalvando(false); }
  };

  const arquivar = async (tipo: "municipio" | "secretaria" | "departamento", id: number, nome: string) => {
    if (!window.confirm(`Desativar ${nome}? Ele deixará de aparecer para novos vínculos.`)) return;
    setSalvando(true); setErroAto("");
    try {
      if (tipo === "municipio") await atualizarMunicipio(id, { active: false });
      if (tipo === "secretaria") await atualizarSecretaria(id, { active: false });
      if (tipo === "departamento") await atualizarDepartamento(id, { active: false });
      if (tipo === "municipio") await carregarMunicipios();
      if (tipo === "secretaria") await carregarSecretarias(municipioId);
      if (tipo === "departamento") await carregarDepartamentos(secretariaId);
    } catch (error) { setErroAto(error instanceof Error ? error.message : "Não foi possível desativar o cadastro."); }
    finally { setSalvando(false); }
  };

  const criar = async (tipo: "municipio" | "secretaria" | "departamento") => {
    setSalvando(true);
    setErroAto("");
    try {
      if (tipo === "municipio") {
        if (!novoMunicipio.trim()) throw new Error("Informe o nome do município.");
        const resposta = await criarMunicipio({ name: novoMunicipio, codigo_ibge: novoCodigo });
        setNovoMunicipio("");
        setNovoCodigo("");
        await carregarMunicipios();
        setMunicipioId(String(resposta.record.id));
      }
      if (tipo === "secretaria") {
        if (!municipioSelecionado) throw new Error("Selecione um município.");
        if (!novaSecretaria.trim()) throw new Error("Informe o nome da secretaria.");
        await criarSecretaria({ name: novaSecretaria, municipio_id: municipioSelecionado.id });
        setNovaSecretaria("");
        await carregarSecretarias(String(municipioSelecionado.id));
      }
      if (tipo === "departamento") {
        if (!secretariaSelecionada) throw new Error("Selecione uma secretaria.");
        if (!novoDepartamento.trim()) throw new Error("Informe o nome do departamento.");
        await criarDepartamento({ name: novoDepartamento, secretaria_id: secretariaSelecionada.id });
        setNovoDepartamento("");
        await carregarDepartamentos(String(secretariaSelecionada.id));
      }
    } catch (error) {
      setErroAto(error instanceof Error ? error.message : "Não foi possível salvar o cadastro.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <MesaCarregando texto="Buscando a estrutura municipal…" />;
  if (erro && municipios.length === 0) {
    return <MesaErroBusca titulo="Não foi possível carregar a estrutura" onTentarDeNovo={() => void carregarMunicipios()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mesa-secao tinta-azul">Administração municipal</p>
        <h1 className="font-display text-4xl font-semibold">Estrutura municipal</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Organize município, secretarias e departamentos. O vínculo salvo aqui será usado para limitar os dados dos usuários.
        </p>
      </div>

      {erro && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>}
      {erroAto && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{erroAto}</p>}

      <section className="folha-simples space-y-4 border border-border p-4 md:p-6" aria-labelledby="municipios-titulo">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={ROTULO}>Primeiro nível</p>
            <h2 id="municipios-titulo" className="font-display text-2xl font-semibold">Municípios</h2>
          </div>
          <span className="text-sm text-muted-foreground">{municipios.length} cadastrado(s)</span>
        </div>
        {municipios.length === 0 ? (
          <p className="border border-dashed border-border p-4 text-sm text-muted-foreground">Nenhum município cadastrado.</p>
        ) : (
          <label className="grid gap-2">
            <span className={ROTULO}>Município em edição</span>
            <div className="flex flex-wrap gap-2"><select value={municipioId} onChange={(event) => setMunicipioId(event.target.value)} className="h-10 min-w-56 flex-1 rounded-md border border-input bg-background px-3 text-sm">
              {municipios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>{municipioSelecionado && user?.isSystem && <><Button type="button" variant="outline" size="sm" onClick={() => void atualizar("municipio", municipioSelecionado.id, municipioSelecionado.name)}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => void arquivar("municipio", municipioSelecionado.id, municipioSelecionado.name)}>Desativar</Button></>}</div>
          </label>
        )}
        {podeCriarMunicipio ? (
          <div className="grid gap-3 md:grid-cols-[1fr_12rem_auto] md:items-end">
            <label className="grid gap-2"><span className={ROTULO}>Novo município</span><Input value={novoMunicipio} onChange={(event) => setNovoMunicipio(event.target.value)} placeholder="Nome oficial" /></label>
            <label className="grid gap-2"><span className={ROTULO}>Código IBGE</span><Input value={novoCodigo} onChange={(event) => setNovoCodigo(event.target.value)} inputMode="numeric" placeholder="Opcional" /></label>
            <Button type="button" onClick={() => void criar("municipio")} disabled={salvando}>Adicionar</Button>
          </div>
        ) : (
          <p className="border border-dashed border-border p-4 text-sm text-muted-foreground">O município é administrado pela Evoluta. Aqui você pode administrar apenas as secretarias e departamentos do seu município.</p>
        )}
      </section>

      <section className="folha-simples space-y-4 border border-border p-4 md:p-6" aria-labelledby="secretarias-titulo">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className={ROTULO}>Segundo nível</p><h2 id="secretarias-titulo" className="font-display text-2xl font-semibold">Secretarias</h2></div>
          <span className="text-sm text-muted-foreground">{municipioSelecionado?.name || "Selecione um município"}</span>
        </div>
        {secretarias.length === 0 ? <p className="border border-dashed border-border p-4 text-sm text-muted-foreground">Nenhuma secretaria cadastrada neste município.</p> : <div className="flex flex-wrap gap-2"><select aria-label="Secretaria em edição" value={secretariaId} onChange={(event) => setSecretariaId(event.target.value)} className="h-10 min-w-56 flex-1 rounded-md border border-input bg-background px-3 text-sm">{secretarias.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{secretariaSelecionada && <><Button type="button" variant="outline" size="sm" onClick={() => void atualizar("secretaria", secretariaSelecionada.id, secretariaSelecionada.name)}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => void arquivar("secretaria", secretariaSelecionada.id, secretariaSelecionada.name)}>Desativar</Button></>}</div>}
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end"><label className="grid gap-2"><span className={ROTULO}>Nova secretaria</span><Input value={novaSecretaria} onChange={(event) => setNovaSecretaria(event.target.value)} placeholder="Nome da secretaria" disabled={!municipioSelecionado} /></label><Button type="button" onClick={() => void criar("secretaria")} disabled={salvando || !municipioSelecionado}>Adicionar</Button></div>
      </section>

      <section className="folha-simples space-y-4 border border-border p-4 md:p-6" aria-labelledby="departamentos-titulo">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className={ROTULO}>Terceiro nível</p><h2 id="departamentos-titulo" className="font-display text-2xl font-semibold">Departamentos</h2></div><span className="text-sm text-muted-foreground">{secretariaSelecionada?.name || "Selecione uma secretaria"}</span></div>
        {departamentos.length === 0 ? <p className="border border-dashed border-border p-4 text-sm text-muted-foreground">Nenhum departamento cadastrado nesta secretaria.</p> : <ul className="grid gap-2 sm:grid-cols-2" aria-label="Departamentos cadastrados">{departamentos.map((item) => <li key={item.id} className="flex items-center justify-between gap-2 border border-border p-3 text-sm"><span>{item.name}</span><span className="flex gap-1"><Button type="button" variant="ghost" size="sm" onClick={() => void atualizar("departamento", item.id, item.name)}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => void arquivar("departamento", item.id, item.name)}>Desativar</Button></span></li>)}</ul>}
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end"><label className="grid gap-2"><span className={ROTULO}>Novo departamento</span><Input value={novoDepartamento} onChange={(event) => setNovoDepartamento(event.target.value)} placeholder="Nome do departamento" disabled={!secretariaSelecionada} /></label><Button type="button" onClick={() => void criar("departamento")} disabled={salvando || !secretariaSelecionada}>Adicionar</Button></div>
      </section>
    </div>
  );
};

export default Organizacao;
