// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Modelos do órgão (proposta 7, tela 20): o texto que vem antes e depois do
 * conteúdo escrito pela IA em cada .docx, por tipo de documento. À esquerda,
 * os modelos do órgão e o padrão do sistema; à direita, a folha como sai no
 * .docx — e, para quem administra, os campos ao lado da prévia ao vivo.
 * O papel timbrado (.docx) continua cadastrado pela equipe do Licitars.
 */
import React, { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { documentTemplateApi, type DocumentTemplate } from "@/services/api/endpoints";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { AvisoAtualizacaoFalhou, Carimbo, MesaErroBusca } from "@/components/mesa/Mesa";
import { ConfirmarAto } from "@/components/mesa/ConfirmarAto";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { TextoDoDocumento } from "@/components/mesa/TextoDoDocumento";
import { notaDoPadrao, podeEditar, separarModelos, tamanhoDoModelo } from "@/features/modelos/modelos";

interface Rascunho {
  texto_pre: string;
  texto_pos: string;
  is_active: boolean;
}

const doModelo = (m: DocumentTemplate): Rascunho => ({ texto_pre: m.texto_pre, texto_pos: m.texto_pos, is_active: m.is_active });

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

/** A folha como sai no .docx: texto antes, o lugar do conteúdo da IA, texto depois. */
const PreviaDoDocx: React.FC<{ nome: string; rascunho: Rascunho }> = ({ nome, rascunho }) => (
  <div className="folha space-y-4 p-6" aria-label={`Prévia de ${nome}, como sai no .docx`}>
    <p className="border-b border-dashed border-border pb-3 text-center font-ui text-xs uppercase tracking-[0.14em] text-muted-foreground">
      Papel timbrado do órgão · cabeçalho e rodapé cadastrados pela equipe do Licitars
    </p>
    {rascunho.texto_pre.trim() ? (
      <TextoDoDocumento markdown={rascunho.texto_pre} />
    ) : (
      <p className="text-sm italic text-muted-foreground">Sem texto antes do conteúdo.</p>
    )}
    <p className="rounded-md border border-dashed border-[hsl(var(--tinta-violeta)/0.6)] px-4 py-3 text-center text-sm tinta-violeta">
      Aqui entra o conteúdo escrito pela IA para cada processo.
    </p>
    {rascunho.texto_pos.trim() ? (
      <TextoDoDocumento markdown={rascunho.texto_pos} />
    ) : (
      <p className="text-sm italic text-muted-foreground">Sem texto depois do conteúdo.</p>
    )}
  </div>
);

const LinhaDoModelo: React.FC<{
  modelo: DocumentTemplate;
  escolhido: boolean;
  onEscolher: () => void;
  nota?: React.ReactNode;
}> = ({ modelo, escolhido, onEscolher, nota }) => {
  const tamanho = tamanhoDoModelo(modelo);
  return (
    <li>
      <button
        type="button"
        onClick={onEscolher}
        aria-pressed={escolhido}
        data-testid={`preview-${modelo.id}`}
        className={cn(
          "flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          escolhido ? "border-primary bg-card shadow-sm dark:border-accent" : "border-transparent hover:border-border hover:bg-card/70",
        )}
      >
        <span className="min-w-0">
          <span className="block font-semibold">{modelo.document_type.name}</span>
          <span className="block text-sm text-muted-foreground">
            {tamanho ?? "Sem textos configurados"} · atualizado em <span className="font-mono text-xs">{dataCurta(modelo.updated_at)}</span>
          </span>
          {nota && <span className="mt-0.5 block text-sm text-muted-foreground">{nota}</span>}
        </span>
        {!modelo.is_active && <Carimbo tinta="ocre">Inativo</Carimbo>}
      </button>
    </li>
  );
};

const Templates: React.FC = () => {
  const { user } = useAuth();
  const perfil = user?.role;
  const administra = perfil === "admin" || perfil === "master";
  const { avisar } = useAvisoDeResultado();
  const queryClient = useQueryClient();
  const painel = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["document-templates", { includeInactive: administra }],
    queryFn: () => documentTemplateApi.list({ includeInactive: administra }),
  });
  // Modelo recém-criado fica na lista até a busca do servidor o trazer
  const [criadoAgora, setCriadoAgora] = useState<DocumentTemplate | null>(null);
  const { doOrgao, padrao } = useMemo(() => {
    const lista = data ?? [];
    const comCriado = criadoAgora && !lista.some((m) => m.id === criadoAgora.id) ? [...lista, criadoAgora] : lista;
    return separarModelos(comCriado);
  }, [data, criadoAgora]);

  const [escolhidoId, setEscolhidoId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [trocarPara, setTrocarPara] = useState<string | null>(null);
  const [descartar, setDescartar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const todos = useMemo(() => [...doOrgao, ...padrao.map((p) => p.modelo)], [doOrgao, padrao]);
  const escolhido = todos.find((m) => m.id === escolhidoId) ?? todos[0];
  // Rascunho aberto só vale para o modelo que foi escolhido; nunca para o "primeiro da lista"
  const editando = !!rascunho && !!escolhido && (!escolhidoId || escolhido.id === escolhidoId);
  const mudou =
    editando &&
    (rascunho.texto_pre !== escolhido.texto_pre ||
      rascunho.texto_pos !== escolhido.texto_pos ||
      rascunho.is_active !== escolhido.is_active);

  const abrir = (id: string) => {
    setEscolhidoId(id);
    setRascunho(null);
    setErro(null);
    // No celular a folha fica abaixo da lista: leva o olho até ela
    if (typeof window !== "undefined" && window.matchMedia?.("(max-width: 1023px)").matches) {
      painel.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  };
  const escolher = (id: string) => {
    if (id === escolhido?.id) return;
    // Enquanto grava, a troca esperaria: o aviso e a volta ao modelo salvo sairiam trocados
    if (salvar.isPending) return;
    if (mudou) setTrocarPara(id);
    else abrir(id);
  };

  const salvar = useMutation({
    mutationFn: (args: { id: string; payload: Rascunho }) => documentTemplateApi.update(args.id, args.payload),
    onSuccess: (_r, args) => {
      queryClient.invalidateQueries({ queryKey: ["document-templates"] });
      setRascunho(null);
      // O aviso fala do modelo gravado (args.id), não do que estiver na tela agora
      const gravado = todos.find((m) => m.id === args.id);
      const tipo = gravado?.document_type.name ?? "este tipo";
      avisar({
        texto: !args.payload.is_active
          ? `Modelo salvo e desligado. Os próximos .docx de ${tipo} não usam este modelo.`
          : padrao.find((p) => p.modelo.id === args.id)?.doOrgao?.is_active
            ? // padrão editado, mas o órgão tem a sua versão ligada: a nota da lista diz o mesmo
              `Modelo salvo. Onde o órgão tem a sua versão ligada, os .docx de ${tipo} continuam saindo com ela.`
            : `Modelo salvo. Os próximos .docx de ${tipo} já saem com ele.`,
      });
      setEscolhidoId(args.id);
    },
    onError: () => setErro("Não deu para salvar. Confira se você ainda tem permissão e tente de novo; o texto continua aqui."),
  });

  const criar = useMutation({
    mutationFn: (m: DocumentTemplate) =>
      documentTemplateApi.create({ document_type_id: m.document_type.id, texto_pre: m.texto_pre, texto_pos: m.texto_pos, is_active: true }),
    onSuccess: (criado) => {
      // Entra na lista já, antes de a busca voltar: senão o escolhido cairia noutro modelo
      // e o "Salvar modelo" gravaria no modelo errado
      setCriadoAgora(criado);
      queryClient.invalidateQueries({ queryKey: ["document-templates"] });
      setEscolhidoId(criado.id);
      setRascunho(doModelo(criado));
      setErro(null);
      avisar({ texto: `Versão do órgão criada a partir do padrão. Ajuste o texto e salve.` });
    },
    onError: () => setErro("Não deu para criar a versão do órgão agora. Tente de novo em instantes."),
  });

  const padraoDoEscolhido = escolhido ? padrao.find((p) => p.modelo.id === escolhido.id) : undefined;
  const pode = escolhido ? podeEditar(escolhido, perfil) : false;

  return (
    <FolhaDaTela
      trilha={[{ rotulo: "Biblioteca", para: "/library" }, { rotulo: "Modelos do órgão" }]}
      titulo="Modelos dos documentos"
      subtitulo="O texto que vem antes e depois do conteúdo escrito pela IA em cada .docx. Quando o órgão não tem o seu, vale o padrão do sistema."
    >

      {isError && !!data && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
      {isLoading ? (
        <p role="status" className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Buscando os modelos…
        </p>
      ) : isError && !data ? (
        <MesaErroBusca titulo="Não deu para buscar os modelos" onTentarDeNovo={() => refetch()} />
      ) : todos.length === 0 ? (
        <p className="folha-simples p-5 text-muted-foreground">
          Ainda não há modelos. Os .docx saem só com o conteúdo escrito pela IA, no papel timbrado do órgão.
        </p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="space-y-6">
            <section aria-labelledby="modelos-do-orgao">
              <h2 id="modelos-do-orgao" className="mesa-secao">
                Do seu órgão · {doOrgao.length}
              </h2>
              {doOrgao.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenhum ainda. {administra ? "Escolha um padrão abaixo e crie a versão do órgão." : "Vale o padrão do sistema."}
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {doOrgao.map((m) => (
                    <LinhaDoModelo key={m.id} modelo={m} escolhido={m.id === escolhido?.id} onEscolher={() => escolher(m.id)} />
                  ))}
                </ul>
              )}
            </section>
            {padrao.length > 0 && (
              <section aria-labelledby="modelos-padrao">
                <h2 id="modelos-padrao" className="mesa-secao">
                  Padrão do sistema
                </h2>
                <p className="text-sm text-muted-foreground">Usado quando o órgão não tem o seu.</p>
                <ul className="mt-2 space-y-1">
                  {padrao.map((p) => (
                    <LinhaDoModelo
                      key={p.modelo.id}
                      modelo={p.modelo}
                      escolhido={p.modelo.id === escolhido?.id}
                      onEscolher={() => escolher(p.modelo.id)}
                      nota={notaDoPadrao(p)}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>

          {escolhido && (
            <div ref={painel} className="scroll-mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {escolhido.company === null ? "Padrão do sistema" : escolhido.company_name}
                  </p>
                  <h2 className="font-display text-2xl font-semibold">{escolhido.document_type.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!editando && pode && (
                    <Button variant="outline" onClick={() => setRascunho(doModelo(escolhido))} data-testid={`edit-${escolhido.id}`}>
                      <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                      Editar o modelo
                    </Button>
                  )}
                  {!editando && administra && padraoDoEscolhido && !padraoDoEscolhido.doOrgao && (
                    <Button onClick={() => criar.mutate(escolhido)} disabled={criar.isPending}>
                      {criar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                      Criar versão do órgão
                    </Button>
                  )}
                  {!editando && padraoDoEscolhido?.doOrgao && (
                    <Button variant="link" onClick={() => escolher(padraoDoEscolhido.doOrgao!.id)}>
                      Ver a versão do órgão ›
                    </Button>
                  )}
                </div>
              </div>

              {erro && (
                <p role="alert" className="rounded-md border border-destructive/40 px-4 py-3 text-sm text-destructive">
                  {erro}
                </p>
              )}

              {editando ? (
                <div className="space-y-4">
                  <div className="folha-simples space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="modelo-ativo" className="font-semibold">
                        Modelo ativo
                        <span className="block text-sm font-normal text-muted-foreground">
                          {escolhido.company === null
                            ? "Desligado, o sistema deixa de usar este padrão nos .docx deste tipo."
                            : "Desligado, os .docx deste tipo saem com o padrão do sistema."}
                        </span>
                      </Label>
                      <Switch
                        id="modelo-ativo"
                        data-testid="tpl-active"
                        checked={rascunho.is_active}
                        onCheckedChange={(v) => setRascunho({ ...rascunho, is_active: v })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="modelo-antes" className="font-semibold">
                        Texto antes do conteúdo
                      </Label>
                      <Textarea
                        id="modelo-antes"
                        rows={6}
                        value={rascunho.texto_pre}
                        onChange={(e) => setRascunho({ ...rascunho, texto_pre: e.target.value })}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="modelo-depois" className="font-semibold">
                        Texto depois do conteúdo
                      </Label>
                      <Textarea
                        id="modelo-depois"
                        rows={6}
                        value={rascunho.texto_pos}
                        onChange={(e) => setRascunho({ ...rascunho, texto_pos: e.target.value })}
                        className="font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Aceita markdown: # título, **negrito**, listas com -. A prévia abaixo acompanha o que você digita.
                    </p>
                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
                      <Button variant="ghost" onClick={() => (mudou ? setDescartar(true) : setRascunho(null))} disabled={salvar.isPending}>
                        {mudou ? "Descartar alterações" : "Fechar a edição"}
                      </Button>
                      <Button
                        data-testid="tpl-submit"
                        onClick={() => {
                          setErro(null);
                          salvar.mutate({ id: escolhido.id, payload: rascunho });
                        }}
                        disabled={!mudou || salvar.isPending}
                      >
                        {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                        Salvar modelo
                      </Button>
                    </div>
                  </div>
                  <PreviaDoDocx nome={escolhido.document_type.name} rascunho={rascunho} />
                </div>
              ) : (
                <PreviaDoDocx nome={escolhido.document_type.name} rascunho={doModelo(escolhido)} />
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmarAto
        aberto={descartar || !!trocarPara}
        onAbertoChange={(a) => {
          if (!a) {
            setDescartar(false);
            setTrocarPara(null);
          }
        }}
        origem="Modelos do órgão"
        pergunta="Descartar as alterações deste modelo?"
        motivo="nenhum"
        consequencia="O texto volta a ser o que está salvo. O que você escreveu agora se perde."
        rotuloConfirmar="Descartar alterações"
        rotuloVoltar="Continuar editando"
        onConfirmar={() => {
          const destino = trocarPara;
          setDescartar(false);
          setTrocarPara(null);
          if (destino) abrir(destino);
          else setRascunho(null);
        }}
      />
    </FolhaDaTela>
  );
};

export default Templates;
