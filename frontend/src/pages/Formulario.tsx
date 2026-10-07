/**
 * Formulário de exemplo: rótulo acima, campo, ação principal no fim. Troque os campos, mantenha a estrutura.
 * Ao salvar: avisar() ANTES de navegar — o aviso de resultado (AvisosDeResultado) sobrevive à troca de tela
 * e aparece na lista; não use toast para confirmar um ato.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { apiPost } from "@/services/api/client";
import { GEN, MARCA } from "@/config/marca";

const plural = MARCA.objeto.plural.charAt(0).toUpperCase() + MARCA.objeto.plural.slice(1);

const Formulario: React.FC = () => {
  const navigate = useNavigate();
  const { avisar } = useAvisoDeResultado();
  const [objeto, setObjeto] = useState("");
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      const criado = await apiPost<{ record: { id: number; name: string } }>("/api/projetos", {
        name: objeto.trim(),
      });
      avisar({ texto: `${GEN.O} ${MARCA.objeto.singular} "${criado.record.name}" foi criad${GEN.fim}.` });
      navigate(`${MARCA.rotaDaLista}/${criado.record.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não deu para salvar, e nada foi alterado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <FolhaDaTela
      trilha={[
        { rotulo: MARCA.inicio, para: MARCA.rotaInicial },
        { rotulo: plural, para: MARCA.rotaDaLista },
        { rotulo: MARCA.acaoPrincipal.rotulo },
      ]}
      titulo={MARCA.acaoPrincipal.rotulo}
      subtitulo="Preencha o essencial; o resto pode vir depois."
    >
      <form onSubmit={salvar} className="max-w-xl space-y-5">
        <div className="space-y-2">
          {/* EXEMPLO DE DOMÍNIO — o rótulo vem de MARCA.campos.objeto */}
          <Label htmlFor="objeto">{MARCA.campos.objeto}</Label>
          <Textarea id="objeto" value={objeto} onChange={(e) => setObjeto(e.target.value)} required rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor">{MARCA.campos.valor} (R$)</Label>
          <Input id="valor" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={enviando}>
            {enviando ? "Salvando…" : "Salvar"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
        {erro && (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}
      </form>
    </FolhaDaTela>
  );
};

export default Formulario;
