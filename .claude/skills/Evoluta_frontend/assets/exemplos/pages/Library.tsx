// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Biblioteca (proposta 7, tela 19): exemplares de outros órgãos, a lei que o
 * Licitars usa nos cálculos (abre ao lado), os modelos do órgão e o caminho
 * para perguntar à IA. Exemplares são os documentos marcados `is_exemplar`,
 * vistos por todos os órgãos; a marcação é feita no documento (admin).
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { libraryApi, type LibraryDocument } from "@/services/api/endpoints";
import { PROD_HTTP_ORIGIN } from "@/config/origin";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { AvisoAtualizacaoFalhou, MesaErroBusca } from "@/components/mesa/Mesa";
import { ARTIGOS, LEI_14133_OFICIAL } from "@/features/lei/artigos";
import { useLeiAoLado } from "@/features/lei/contextoDaLei";
import { filtrarExemplares, agruparPorTipo } from "@/features/biblioteca/exemplares";

const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_HTTP_ORIGIN : "http://localhost:8000");

const GIROS = ["-0.4deg", "0.3deg", "-0.2deg", "0.4deg"];

const Exemplar: React.FC<{ doc: LibraryDocument }> = ({ doc }) => (
  <li
    data-testid={`library-${doc.id}`}
    className="ficha flex flex-col"
    style={{ ["--giro" as string]: GIROS[[...doc.id].reduce((s, ch) => s + ch.charCodeAt(0), 0) % GIROS.length] }}
  >
    <h4 className="font-display text-xl font-semibold leading-[26px]">{doc.name}</h4>
    <p className="mt-1 text-sm leading-[26px] text-muted-foreground">
      <span className="font-medium text-foreground">{doc.company_name}</span>
      {doc.process_code && (
        <>
          <br />
          <span className="font-mono text-xs">{doc.process_code}</span>
        </>
      )}
      <br />
      atualizado em <span className="font-mono text-xs">{new Date(doc.updated_at).toLocaleDateString("pt-BR")}</span>
    </p>
    {doc.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{doc.description}</p>}
    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3">
      <Link
        to={`/documents/${doc.id}`}
        aria-label={`Abrir ${doc.name}`}
        className="whitespace-nowrap text-sm font-semibold text-primary hover:underline dark:text-accent"
      >
        Abrir ›
      </Link>
      {doc.download_url ? (
        <a
          href={`${apiBase}${doc.download_url}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Baixar ${doc.name} em .docx`}
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-primary hover:underline dark:text-accent"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          .docx
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">sem .docx gerado</span>
      )}
    </div>
  </li>
);

const Library: React.FC = () => {
  const { hash } = useLocation();
  const lei = useLeiAoLado();
  const secaoDaLei = useRef<HTMLElement>(null);
  const [busca, setBusca] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["library"], queryFn: () => libraryApi.list() });

  const grupos = useMemo(() => agruparPorTipo(filtrarExemplares(data ?? [], busca)), [data, busca]);
  const total = data?.length ?? 0;

  // Vindo de "Todos na Biblioteca" (gaveta da lei): desce até a lei
  useEffect(() => {
    if (hash === "#lei") secaoDaLei.current?.scrollIntoView?.({ block: "start" });
  }, [hash]);

  return (
    <FolhaDaTela
      trilha={[{ rotulo: "Mesa", para: "/dashboard" }, { rotulo: "Biblioteca" }]}
      titulo="Biblioteca"
      subtitulo="O fichário da repartição: documentos de outros órgãos para servir de exemplo, a lei que o Licitars usa nos cálculos e os modelos do seu órgão."
    >
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <section aria-labelledby="exemplares">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 id="exemplares" className="font-display text-2xl font-semibold">
                Exemplares de outros órgãos
              </h2>
              <p className="text-sm text-muted-foreground">Escolhidos para servir de referência. Baixe, leia e adapte ao seu caso.</p>
            </div>
            {total > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome, órgão ou tipo"
                  aria-label="Buscar nos exemplares"
                  className="pl-9"
                />
              </div>
            )}
          </div>

          <div className="mt-6">
            {isError && !!data && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
            {isLoading ? (
              <p role="status" className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Buscando os exemplares…
              </p>
            ) : isError && !data ? (
              <MesaErroBusca titulo="Não deu para buscar os exemplares" onTentarDeNovo={() => refetch()} />
            ) : total === 0 ? (
              <p className="text-muted-foreground">
                Ainda não há exemplares. Quando um administrador marcar um documento como exemplar, ele aparece aqui para todos os órgãos.
              </p>
            ) : grupos.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhum exemplar com “{busca.trim()}”.{" "}
                <button type="button" onClick={() => setBusca("")} className="font-semibold text-primary hover:underline dark:text-accent">
                  Limpar a busca
                </button>
              </p>
            ) : (
              <div className="space-y-8">
                {grupos.map((g) => (
                  <div key={g.tipo}>
                    <h3 className="mesa-secao mb-4 text-base">
                      {g.tipo} · {g.itens.length}
                    </h3>
                    <ul className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                      {g.itens.map((doc) => (
                        <Exemplar key={doc.id} doc={doc} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="space-y-7 lg:pt-14">
          <section aria-labelledby="pergunte" className="bilhete">
            <h2 id="pergunte" className="font-display text-xl font-semibold">
              Pergunte à IA
            </h2>
            <p className="mt-2 text-sm">
              A IA responde olhando o processo. Abra o documento em que você está trabalhando e use <b>Conversar com a IA</b>.
            </p>
            <p className="mt-2 text-sm opacity-80">A IA orienta; a decisão e a assinatura são sempre do servidor.</p>
            <Link to="/processes" className="mt-3 inline-block text-sm font-semibold underline">
              Ir para os processos ›
            </Link>
          </section>

          <section aria-labelledby="modelos" className="rounded-md border border-border bg-[hsl(var(--mesa-papel2))] p-4">
            <h2 id="modelos" className="font-display text-xl font-semibold">
              Modelos do órgão
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              O texto que vem antes e depois do conteúdo da IA em cada .docx: cabeçalho, preâmbulo e fecho.
            </p>
            <Link to="/templates" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline dark:text-accent">
              Ver os modelos ›
            </Link>
          </section>
        </div>
      </div>

      <section ref={secaoDaLei} id="lei" aria-labelledby="lei-titulo" className="scroll-mt-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="lei-titulo" className="font-display text-2xl font-semibold">
              A lei que o Licitars usa
            </h2>
            <p className="text-sm text-muted-foreground">
              Lei nº 14.133/2021. Cada artigo abre ao lado, com um resumo em linguagem comum e onde ele entra nas contas do sistema.
            </p>
          </div>
          <a
            href={LEI_14133_OFICIAL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-primary hover:underline dark:text-accent"
          >
            Texto oficial completo no Planalto ›<span className="sr-only"> (abre em outra aba)</span>
          </a>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {ARTIGOS.map((a) => (
            <li key={a.numero} className="border-t border-border/70 py-2.5">
              {lei ? (
                <button
                  type="button"
                  onClick={() => lei.abrir(a.numero)}
                  className="group flex w-full items-baseline gap-3 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="w-20 shrink-0 whitespace-nowrap font-mono text-sm text-muted-foreground">Art. {a.numero}</span>
                  <span className="font-semibold group-hover:underline">{a.titulo}</span>
                </button>
              ) : (
                <span className="flex items-baseline gap-3">
                  <span className="w-20 shrink-0 whitespace-nowrap font-mono text-sm text-muted-foreground">Art. {a.numero}</span>
                  <span className="font-semibold">{a.titulo}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </FolhaDaTela>
  );
};

export default Library;
