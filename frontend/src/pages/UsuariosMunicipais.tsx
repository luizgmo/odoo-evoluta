import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { useAuth, type Perfil } from "@/contexts/AuthContext";
import {
  criarUsuario,
  atualizarUsuario,
  listarDepartamentos,
  listarMunicipios,
  listarSecretarias,
  listarUsuarios,
  type Departamento,
  type Municipio,
  type Secretaria,
  type UsuarioMunicipal,
} from "@/services/api/organization";

const ROTULO = "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";
type PapelCriavel = Exclude<Perfil, "super_admin">;

const nomePapel: Record<PapelCriavel, string> = {
  admin_municipal: "Admin Municipal",
  secretario: "Secretário",
  atendente: "Atendente",
};

const UsuariosMunicipais: React.FC = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioMunicipal[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipioId, setMunicipioId] = useState("");
  const [secretariaId, setSecretariaId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [form, setForm] = useState({
    name: "",
    login: "",
    email: "",
    password: "",
    role: "atendente" as PapelCriavel,
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroAto, setErroAto] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro("");
    try {
      const [usuariosResposta, municipiosResposta] = await Promise.all([listarUsuarios(), listarMunicipios()]);
      setUsuarios(usuariosResposta.records);
      setMunicipios(municipiosResposta.records);
      const municipioInicial = user?.municipio?.id ?? municipiosResposta.records[0]?.id;
      if (municipioInicial) setMunicipioId(String(municipioInicial));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar os usuários municipais.");
    } finally {
      setCarregando(false);
    }
  };

  const carregarSecretarias = async (id: string) => {
    setSecretarias([]);
    setDepartamentos([]);
    setSecretariaId("");
    setDepartamentoId("");
    if (!id) return;
    try {
      const resposta = await listarSecretarias(Number(id));
      setSecretarias(resposta.records);
    } catch (error) {
      setErroAto(error instanceof Error ? error.message : "Não foi possível carregar as secretarias.");
    }
  };

  const carregarDepartamentos = async (id: string) => {
    setDepartamentos([]);
    setDepartamentoId("");
    if (!id) return;
    try {
      const resposta = await listarDepartamentos(Number(id));
      setDepartamentos(resposta.records);
    } catch (error) {
      setErroAto(error instanceof Error ? error.message : "Não foi possível carregar os departamentos.");
    }
  };

  useEffect(() => {
    void carregarUsuarios();
  }, []);

  useEffect(() => {
    void carregarSecretarias(municipioId);
  }, [municipioId]);

  useEffect(() => {
    void carregarDepartamentos(secretariaId);
  }, [secretariaId]);

  const editar = async (usuario: UsuarioMunicipal) => {
    const nome = window.prompt("Nome do usuário", usuario.name);
    if (nome === null || !nome.trim()) return;
    const email = window.prompt("E-mail do usuário", usuario.email);
    if (email === null) return;
    setSalvando(true); setErroAto("");
    try { await atualizarUsuario(usuario.id, { name: nome.trim(), email: email.trim() }); await carregarUsuarios(); }
    catch (error) { setErroAto(error instanceof Error ? error.message : "Não foi possível atualizar o usuário."); }
    finally { setSalvando(false); }
  };

  const desativar = async (usuario: UsuarioMunicipal) => {
    if (!window.confirm(`Desativar o acesso de ${usuario.name}?`)) return;
    setSalvando(true); setErroAto("");
    try { await atualizarUsuario(usuario.id, { active: false }); await carregarUsuarios(); }
    catch (error) { setErroAto(error instanceof Error ? error.message : "Não foi possível desativar o usuário."); }
    finally { setSalvando(false); }
  };

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    setSalvando(true);
    setErroAto("");
    try {
      if (!municipioId) throw new Error("Selecione o município do usuário.");
      if ((form.role === "secretario" || form.role === "atendente") && !secretariaId) {
        throw new Error("Secretário e atendente precisam de uma secretaria.");
      }
      if (form.role === "atendente" && !departamentoId) {
        throw new Error("Atendente precisa de um departamento.");
      }
      await criarUsuario({
        ...form,
        municipio_id: Number(municipioId),
        secretaria_id: secretariaId ? Number(secretariaId) : undefined,
        departamento_id: departamentoId ? Number(departamentoId) : undefined,
      });
      setForm({ name: "", login: "", email: "", password: "", role: user?.isSystem ? "admin_municipal" : "atendente" });
      await carregarUsuarios();
    } catch (error) {
      setErroAto(error instanceof Error ? error.message : "Não foi possível criar o usuário.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <MesaCarregando texto="Buscando os usuários municipais…" />;
  if (erro && usuarios.length === 0) {
    return <MesaErroBusca titulo="Não foi possível carregar os usuários" onTentarDeNovo={() => void carregarUsuarios()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mesa-secao tinta-azul">Acesso da prefeitura</p>
        <h1 className="font-display text-4xl font-semibold">Usuários municipais</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          O super administrador cria o primeiro Admin Municipal de cada tenant. Depois, cada Admin Municipal gerencia apenas os usuários do próprio município.
        </p>
      </div>

      {erro && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>}
      {erroAto && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{erroAto}</p>}

      <section className="folha-simples space-y-4 border border-border p-4 md:p-6" aria-labelledby="novo-usuario-titulo">
        <div><p className={ROTULO}>Novo acesso</p><h2 id="novo-usuario-titulo" className="font-display text-2xl font-semibold">Adicionar usuário</h2></div>
        <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2"><span className={ROTULO}>Nome completo</span><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label className="grid gap-2"><span className={ROTULO}>Login</span><Input value={form.login} onChange={(event) => setForm({ ...form, login: event.target.value })} autoComplete="username" required /></label>
          <label className="grid gap-2"><span className={ROTULO}>E-mail</span><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="grid gap-2"><span className={ROTULO}>Senha temporária</span><Input type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" required /></label>
          <label className="grid gap-2"><span className={ROTULO}>Perfil</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as PapelCriavel })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{(Object.keys(nomePapel) as PapelCriavel[]).filter((papel) => user?.isSystem || papel !== "admin_municipal").map((papel) => <option key={papel} value={papel}>{nomePapel[papel]}</option>)}</select></label>
          <label className="grid gap-2"><span className={ROTULO}>Município</span><select value={municipioId} onChange={(event) => setMunicipioId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm" disabled={!user?.permissions.manage_municipios}>{municipios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="grid gap-2"><span className={ROTULO}>Secretaria</span><select value={secretariaId} onChange={(event) => setSecretariaId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Nenhuma</option>{secretarias.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="grid gap-2"><span className={ROTULO}>Departamento</span><select value={departamentoId} onChange={(event) => setDepartamentoId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Nenhum</option>{departamentos.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <div className="flex items-end md:col-span-2"><Button type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Adicionar usuário"}</Button></div>
        </form>
      </section>

      <section className="folha-simples space-y-4 border border-border p-4 md:p-6" aria-labelledby="usuarios-titulo">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className={ROTULO}>Contas autorizadas</p><h2 id="usuarios-titulo" className="font-display text-2xl font-semibold">Usuários cadastrados</h2></div><span className="text-sm text-muted-foreground">{usuarios.length} usuário(s)</span></div>
        {usuarios.length === 0 ? <p className="border border-dashed border-border p-4 text-sm text-muted-foreground">Nenhum usuário municipal encontrado.</p> : <ul className="space-y-2" aria-label="Usuários municipais">{usuarios.map((item) => <li key={item.id} className="grid gap-2 border border-border p-3 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.login} · {item.email || "Sem e-mail"} · {item.municipio?.name || "Sem município"}{item.secretaria ? ` · ${item.secretaria.name}` : ""}{item.departamento ? ` · ${item.departamento.name}` : ""}</p></div><div className="flex items-center gap-2"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{nomePapel[item.role as PapelCriavel] || item.role}</span><Button type="button" variant="ghost" size="sm" onClick={() => void editar(item)}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => void desativar(item)}>Desativar</Button></div></li>)}</ul>}
      </section>
    </div>
  );
};

export default UsuariosMunicipais;
