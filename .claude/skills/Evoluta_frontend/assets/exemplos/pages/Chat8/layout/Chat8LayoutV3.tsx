// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Moldura da conversa com a IA: cabeçalho e, abaixo, o painel de perguntas.
 * Do tablet para cima a altura é fixa (a tela menos a barra, o rodapé e o
 * recuo da folha): o painel precisa de altura definida para o botão "Enviar
 * respostas" ficar à vista (§2.8/§2.11 do relatório de Aguaí). No celular não
 * cabe: cabeçalho, cartão de documento pronto e painel somam mais que a tela,
 * e a altura fixa cortava o botão. Lá a moldura cresce e a folha rola até ele.
 */

import React from "react";

interface Chat8LayoutV3Props {
  header: React.ReactNode;
  perguntasSection: React.ReactNode;
  statusBar?: React.ReactNode;
}

/**
 * Chat8LayoutV3 - Estrutura principal do chat inteligente
 * Responsável apenas pelo layout visual e organização das áreas
 * Usa modal para mensagens em vez de seção inline
 * Aplica tema navy/silver com glassmorphism
 */
export const Chat8LayoutV3: React.FC<Chat8LayoutV3Props> = ({
  header,
  perguntasSection,
  statusBar,
}) => {
  return (
    <div
      id="chat8-root"
      className="chat8-root flex flex-col gap-4 text-foreground md:h-[calc(100dvh-10rem)] md:min-h-[32rem]"
      data-testid="chat8-root"
    >
      {/* Header */}
      {header}
      {/* Main Content */}
      <div
        id="chat8-main-content"
        className="chat8-main-content flex min-h-0 flex-1 flex-col"
        data-testid="chat8-main-content"
      >
        {/* Questions Panel - Occupies all available space */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {perguntasSection}
        </div>
      </div>
      {/* Status Bar */}
      {statusBar && (
        <div className="border-t border-border">
          {statusBar}
        </div>
      )}
    </div>
  );
};

export default Chat8LayoutV3;
