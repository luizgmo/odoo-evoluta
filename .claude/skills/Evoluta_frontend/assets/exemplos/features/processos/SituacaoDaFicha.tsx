// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Coluna "Situação" da ficha (proposta 7, tela 14): a situação em carimbos e os
 * atos que a mudam — pôr em andamento, concluir, arquivar (encerrar sem
 * concluir) e reabrir. Cada ato pede confirmação e, depois, oferece Desfazer
 * (volta à situação anterior). É o único lugar da pasta onde a situação muda.
 */
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Process } from "@/types/process";
import { processApi } from "@/services/api/endpoints";
import { PROCESS_STATUS, getProcessStatusConfig } from "@/constants/process-status";
import { Button } from "@/components/ui/button";
import { Carimbo, type Tinta } from "@/components/mesa/Mesa";
import { ConfirmarAto } from "@/components/mesa/ConfirmarAto";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { atosDaSituacao, type AtoDaSituacao } from "./atosDaSituacao";

const SITUACOES: { valor: string; tinta: Tinta; explica: string }[] = [
  { valor: PROCESS_STATUS.ABERTO, tinta: "verde", explica: "Pasta aberta, preparando os documentos." },
  { valor: PROCESS_STATUS.EM_ANDAMENTO, tinta: "azul", explica: "Em condução: edital, sessão ou contratação em curso." },
  { valor: PROCESS_STATUS.CONCLUIDO, tinta: "violeta", explica: "Terminou; a pasta vai para o Arquivo." },
  { valor: PROCESS_STATUS.ARQUIVADO, tinta: "grafite", explica: "Encerrado sem concluir; fica no Arquivo." },
];

export const SituacaoDaFicha: React.FC<{ processo: Process }> = ({ processo }) => {
  const queryClient = useQueryClient();
  const { avisar } = useAvisoDeResultado();
  // O ato fica guardado enquanto a janela fecha, para o texto não sumir na animação
  const [ato, setAto] = useState<AtoDaSituacao | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const atual = getProcessStatusConfig(processo.status).value;
  const atos = atosDaSituacao(atual);

  const atualizar = async (status: string) => {
    // A situação gravada já vale na tela, antes da nova busca: se ela falhar, salvar
    // a ficha em seguida não manda de volta a situação antiga
    queryClient.setQueryData<Process>(["process", String(processo.id)], (p) => p && { ...p, status });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["process", String(processo.id)] }),
      queryClient.invalidateQueries({ queryKey: ["processes"] }),
    ]);
  };

  const fazer = async (escolhido: AtoDaSituacao) => {
    const anterior = atual;
    await processApi.update(String(processo.id), { status: escolhido.para });
    await atualizar(escolhido.para);
    avisar({
      texto: escolhido.feito(processo.code || "O processo"),
      desfazer: async () => {
        await processApi.update(String(processo.id), { status: anterior });
        await atualizar(anterior);
      },
    });
  };

  return (
    <aside aria-labelledby="situacao-ficha" className="space-y-4">
      <h2 id="situacao-ficha" className="font-sans text-base font-semibold">
        Situação
      </h2>
      <ul className="space-y-3">
        {SITUACOES.map((s) => {
          const config = getProcessStatusConfig(s.valor);
          const eh = s.valor === atual;
          return (
            <li key={s.valor} className={eh ? "" : "opacity-45"}>
              <Carimbo tinta={s.tinta}>{eh ? `✓ ${config.label}` : config.label}</Carimbo>
              <p className="mt-1 text-xs text-muted-foreground">
                {s.explica}
                {eh && <span className="sr-only"> (situação atual)</span>}
              </p>
            </li>
          );
        })}
      </ul>

      {atos.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="font-sans text-sm font-semibold">Mudar a situação</p>
          <p className="text-xs text-muted-foreground">Nada se apaga: cada mudança pede confirmação e pode ser desfeita.</p>
          <div className="flex flex-col items-start gap-2">
            {atos.map((a) => (
              <Button
                key={a.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  setAto(a);
                  setConfirmando(true);
                }}
              >
                <a.icone className="mr-2 h-4 w-4" aria-hidden="true" />
                {a.botao}
              </Button>
            ))}
          </div>
        </div>
      )}

      {ato && (
        <ConfirmarAto
          aberto={confirmando}
          onAbertoChange={setConfirmando}
          origem="Ficha do processo"
          pergunta={ato.pergunta(processo.code || "")}
          motivo="nenhum"
          consequencia={ato.consequencia}
          rotuloConfirmar={ato.confirmar}
          rotuloVoltar={ato.voltar}
          onConfirmar={() => fazer(ato)}
        />
      )}
    </aside>
  );
};
