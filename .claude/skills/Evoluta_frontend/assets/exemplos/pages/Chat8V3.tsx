// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual. Atenção: usa localStorage/sessionStorage SEM try/catch (a base e components/ protegem todos os usos); envolva-os ao copiar.
/**
 * COMPONENTE CHAT8 - INTERFACE PRINCIPAL DE CHAT INTELIGENTE
 *
 * @description Página principal do chat inteligente com IA
 *
 * @features
 * - Chat em tempo real via WebSocket
 * - Integração com provedor de IA
 * - Painel de perguntas do assistente
 * - Gerenciamento de sessões
 * - Seleção de documentos
 *
 * @components
 * - Chat8Content: Componente wrapper que gerencia estado global
 * - Chat8Header: Header com navegação e seleção de documentos
 * - Chat8EmptyState: Estado vazio quando nenhum documento selecionado
 * - Chat8SessionInfo: Informações da sessão atual
 * - Chat8MessagesHeader: Header colapsável das mensagens
 * - Chat8InputArea: Área de input com validação
 * - Chat8StatusBar: Barra de status com informações de conexão
 * - Chat8PerguntasPanel: Painel de perguntas do assistente
 *
 * @hooks
 * - useChatRedux: Hook principal para gerenciamento de chat
 * - useWebSocket: Hook para comunicação WebSocket
 * - useUniqueMessages: Hook para gerenciamento de mensagens únicas
 *
 * @state
 * - Redux: Estado global do chat, sessões e documentos
 * - Local: Estado de UI (colapsado/expandido, loading, etc.)
 * - SessionStorage: Persistência de seleções entre sessões
 *
 * @websocket
 * - URL: ws://localhost:8000/ws/chat/{session_id}/
 * - Autenticação: JWT token via query string
 * - Reconexão: Exponential backoff automático
 * - Sincronização: Middleware Redux para sincronizar mensagens
 *
 * @security
 * - JWT Authentication
 * - CORS Protection
 * - Input Sanitization
 * - Session Management
 *
 * @accessibility
 * - ARIA Labels
 * - Keyboard Navigation
 * - Screen Reader Support
 * - Focus Management
 *
 * @performance
 * - React.memo para componentes
 * - useCallback para otimização
 * - Lazy loading de componentes
 * - Code splitting
 *
 * @testing
 * - Unit tests para hooks
 * - Integration tests para WebSocket
 * - E2E tests para fluxo completo
 *
 * @dependencies
 * - React 18+
 * - TypeScript
 * - Redux Toolkit
 * - Material-UI
 * - Tailwind CSS
 * - Axios
 * - WebSocket
 *
 * @author LicitarsAI Team
 * @version 1.0.0
 * @since 2024-06-20
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useChatRedux } from "@/hooks/useChatRedux";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { Chat8HeaderV3 } from "@/components/chat/Chat8HeaderV3";
import { Chat8EmptyState } from "@/components/chat/Chat8EmptyState";
import { AvisoDeEstado } from "@/components/mesa/AvisoDeEstado";
import { Button } from "@/components/ui/button";
import { Chat8PerguntasPanel } from "@/components/chat/Chat8PerguntasPanel";
import { Chat8ErrorBoundary } from "@/components/chat/Chat8ErrorBoundary";
import { DocumentReadyCard } from "@/components/chat/DocumentReadyCard";
import { STORAGE_KEYS } from "@/constants";
import { logger } from "@/utils/logger";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { persistor } from "@/store";
import {
  selectSelectedDocumentId,
  setSelectedDocumentId,
  setIsSending,
} from "@/store/slices/chatSlice";
import {
  selectDocuments,
  fetchDocuments,
  selectDocumentsLoading,
  selectLatestGeneratedForDocument,
} from "@/store/slices/documentsSlice";
import { selectWebSocketMessages } from "@/store/slices/websocketSlice";
import { Message } from "@/types/index";
import { Chat8LayoutV3 } from "./Chat8/layout/Chat8LayoutV3";

/**
 * @component Chat8Content
 * @description Componente wrapper que gerencia estado global e lógica do chat
 *
 * @features
 * - Gerenciamento de sessões
 * - Integração WebSocket
 * - Seleção automática de documentos
 * - Envio automático de informações
 * - Tratamento de erros
 *
 * @state
 * - currentSession: Sessão atual do chat
 * - selectedDocumentId: ID do documento selecionado
 * - documents: Lista de documentos disponíveis
 * - messages: Mensagens do WebSocket
 * - isConnected: Status da conexão WebSocket
 *
 * @effects
 * - Auto-seleção de documento criado
 * - Envio automático de informações
 * - Sincronização de estado
 *
 * @handlers
 * - handlePerguntasResponse: Envio de respostas do painel
 * - handleError: Tratamento de erros
 *
 * @dependencies
 * - useChatRedux: Hook principal
 * - useWebSocket: Hook WebSocket
 * - useUniqueMessages: Hook mensagens
 * - Redux selectors
 * - SessionStorage
 *
 * @author LicitarsAI Team
 * @version 1.0.0
 * @since 2024-06-20
 */
const Chat8ContentV3: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // B-WS2 (2026-05-10): sessão stale (URL antiga ou redux-persist) faz o
  // backend devolver 404. useChatRedux.fetchSession agora limpa o estado e
  // devolve null nesse caso — aqui dedupamos o tratamento (3 useEffects
  // abaixo podem disparar fetchSession em paralelo) e mandamos o user pra
  // /documents com um toast explicando o que houve.
  const notFoundIdsRef = useRef<Set<string>>(new Set());
  const handleSessionNotFound = useCallback(
    (badId: string) => {
      if (!badId || notFoundIdsRef.current.has(badId)) return;
      notFoundIdsRef.current.add(badId);
      logger.warn(`[Chat8ContentV3] Sessão ${badId} não encontrada — redirecionando para /documents`);
      toast({
        title: "Sessão não encontrada",
        description:
          "Esta sessão de chat pode ter sido removida ou não pertence a você.",
        variant: "destructive",
      });
      navigate("/documents");
    },
    [toast, navigate]
  );

  // Hooks do chat
  const {
    messages,
    currentSession: session,
    connectionStatus,
    error,
    loading,
    isSending,
    sendChatMessage,
    addMessage,
    fetchSession,
    closeSession,
    loadMessages,
    updateUI,
    clearChat,
    setSelectedDocumentIdFromHook,
    handleSelectDocument,
  } = useChatRedux();

  logger.info(`[Chat8ContentV3] 🔧 Componente inicializado`);

  // ✅ OBTER selectedDocumentId do Redux
  const selectedDocumentId = useAppSelector(selectSelectedDocumentId);

  // ✅ DEBUG: Log hook results
  logger.info(`[Chat8ContentV3] 🔍 Resultados do useChatRedux:`, {
    hasSession: !!session,
    sessionId: session?.id,
    selectedDocumentId,
    isSending,
    messagesCount: messages?.length
  });

  // ✅ DEBUG: Manual test - call fetchSession directly if needed
  useEffect(() => {
    if (selectedDocumentId && !session) {
      logger.info(`[Chat8ContentV3] 🔄 TESTE MANUAL: Chamando fetchSession diretamente`);
      logger.info(`[Chat8ContentV3] 🔍 Parâmetros: selectedDocumentId=${selectedDocumentId}, session=${session?.id || 'null'}`);
      
      fetchSession(selectedDocumentId).then((fetchedSession) => {
        if (!fetchedSession) {
          // B-WS2: 404 já foi tratado em useChatRedux (estado limpo); aqui só redireciona
          handleSessionNotFound(selectedDocumentId);
          return;
        }
        logger.info(`[Chat8ContentV3] ✅ TESTE MANUAL: fetchSession concluído:`, {
          sessionId: fetchedSession?.id,
          hasSession: !!fetchedSession
        });
      }).catch((error) => {
        logger.error(`[Chat8ContentV3] ❌ TESTE MANUAL: fetchSession falhou:`, error);
      });
    }
  }, [selectedDocumentId, session, fetchSession]);
  const { isConnected, sendMessage: wsSendMessage } = useWebSocket();

  // Redux selectors
  const docs = useAppSelector(selectDocuments) || [];
  const loadingDocuments = useAppSelector(selectDocumentsLoading);
  const wsMessages = useAppSelector(selectWebSocketMessages);

  // ✅ DEBUG: Log Redux state changes
  useEffect(() => {
    logger.info(`[Chat8ContentV3] 🔄 Redux state atualizado:`, {
      selectedDocumentId,
      hasSession: !!session,
      sessionId: session?.id,
      documentsCount: docs.length,
      loadingDocuments
    });
    
    // Log 1: Documento atual selecionado
    if (selectedDocumentId) {
      const selectedDoc = docs.find(doc => doc.id === selectedDocumentId);
      logger.info(`📄 [FRONTEND] Documento atual selecionado no Chat8V3:`);
      logger.info(`📄 [FRONTEND] - ID: ${selectedDocumentId}`);
      logger.info(`📄 [FRONTEND] - Nome: ${selectedDoc?.name || 'N/A'}`);
      logger.info(`📄 [FRONTEND] - Tipo: ${selectedDoc?.document_type?.name || 'N/A'}`);
      logger.info(`📄 [FRONTEND] - Processo: ${selectedDoc?.process?.description || 'N/A'}`);
      logger.info(`📄 [FRONTEND] - Session ID: ${session?.id || 'N/A'}`);
      logger.info(`📄 [FRONTEND] - WebSocket Conectado: ${isConnected}`);
    }
  }, [selectedDocumentId, session, docs.length, loadingDocuments, isConnected]);

  // Local state
  const [input, setInput] = useState("");
  const [loadingSession, setLoadingSession] = useState(false);
  // ⚠️ IMPORTANTE: O painel de mensagens SEMPRE deve iniciar colapsado (false)
  // Isso melhora a experiência do usuário, permitindo que ele foque primeiro no painel de perguntas
  // e expanda o histórico de mensagens apenas quando necessário
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSendTimeoutRef = useRef<NodeJS.Timeout>();

  // Buscar documentos quando o componente for montado
  useEffect(() => {
    logger.info("[Chat8ContentV3] Buscando documentos...");
    dispatch(fetchDocuments());
  }, [dispatch]);

  // Controlar estado de loading da sessão
  useEffect(() => {
    if (selectedDocumentId && !session?.id) {
      setLoadingSession(true);
      logger.info(
        "[Chat8ContentV3] 🎯 LOADING SESSION ATIVADO:",
        {
          selectedDocumentId,
          sessionId: session?.id,
          timestamp: new Date().toISOString(),
          reason: "documento selecionado mas sem sessão"
        }
      );
    } else if (session?.id) {
      setLoadingSession(false);
      logger.info(
        "[Chat8ContentV3] 🎯 LOADING SESSION DESATIVADO:",
        {
          selectedDocumentId,
          sessionId: session?.id,
          timestamp: new Date().toISOString(),
          reason: "sessão encontrada"
        }
      );
    }
  }, [selectedDocumentId, session?.id]);

  // ============================================================================
  // EFFECT CRÍTICO: BUSCAR SESSÃO IMEDIATAMENTE QUANDO DOCUMENTO É SELECIONADO
  // ============================================================================
  /**
   * useEffect para buscar sessão imediatamente quando documento é selecionado
   * 
   * CRÍTICO: Este effect é executado quando selectedDocumentId muda e não há sessão
   * Responsabilidades:
   * - Chamar fetchSession imediatamente (sem debounce)
   * - Buscar a sessão existente (criada automaticamente pelo backend)
   * - Garantir que sessão seja encontrada antes do WebSocket conectar
   * - O backend cria a sessão quando o documento é criado, usando document_id como session_id
   * 
   * Dependências: selectedDocumentId, session?.id, fetchSession
   */
  useEffect(() => {
    if (selectedDocumentId && !session?.id && fetchSession) {
      logger.info(
        "[Chat8ContentV3] CRÍTICO: Documento selecionado sem sessão. Buscando sessão imediatamente:",
        selectedDocumentId,
      );
      
      fetchSession(selectedDocumentId)
        .then((session) => {
          if (session) {
            logger.info(
              "[Chat8ContentV3] CRÍTICO: Sessão encontrada com sucesso:",
              session.id,
            );
          } else {
            // B-WS2: null vem de 404 já tratado em useChatRedux — redireciona
            handleSessionNotFound(selectedDocumentId);
          }
        })
        .catch((error) => {
          logger.error(
            "[Chat8ContentV3] CRÍTICO: Erro ao buscar sessão:",
            error,
          );
        });
    }
  }, [selectedDocumentId, session?.id, fetchSession]);

  // ============================================================================
  // EFFECT CRÍTICO: DETECTAR MENSAGEM DO ASSISTENTE APÓS CRIAÇÃO DE DOCUMENTO
  // ============================================================================
  /**
   * useEffect para detectar mensagem do assistente após criação de documento
   * 
   * CRÍTICO: Este effect monitora mensagens para detectar resposta da IA
   * Responsabilidades:
   * - Detectar quando mensagem do assistente é recebida
   * - Resetar loading quando assistente responde
   * - Logar recebimento da mensagem para debugging
   * 
   * Dependências: messages, isSending, dispatch
   */
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.role === "assistant" && isSending) {
        logger.info(
          "[Chat8ContentV3] CRÍTICO: Mensagem do assistente detectada:",
          {
            messageId: lastMessage.id,
            content: lastMessage.content?.substring(0, 100) + "...",
            timestamp: lastMessage.timestamp,
          },
        );
        dispatch(setIsSending(false));
      }
    }
  }, [messages, isSending, dispatch]);

  // ============================================================================
  // EFFECT CRÍTICO: AGUARDAR CONEXÃO WEBSOCKET ANTES DE BUSCAR SESSÃO
  // ============================================================================
  /**
   * useEffect para aguardar conexão WebSocket antes de buscar sessão
   * 
   * CRÍTICO: Este effect garante que WebSocket esteja conectado antes de buscar sessão
   * Responsabilidades:
   * - Aguardar conexão WebSocket
   * - Buscar sessão apenas quando WebSocket estiver pronto
   * - Buscar a sessão existente (criada automaticamente pelo backend)
   * - O backend cria a sessão quando o documento é criado, usando document_id como session_id
   * 
   * Dependências: isConnected, selectedDocumentId, session?.id, fetchSession
   */
  useEffect(() => {
    if (isConnected && selectedDocumentId && !session?.id && fetchSession) {
      logger.info(
        "[Chat8ContentV3] CRÍTICO: WebSocket conectado e documento selecionado. Buscando sessão:",
        selectedDocumentId,
      );
      
      const timeout = setTimeout(() => {
        fetchSession(selectedDocumentId)
          .then((session) => {
            if (session) {
              logger.info(
                "[Chat8ContentV3] CRÍTICO: Sessão encontrada após conexão WebSocket:",
                session.id,
              );
            } else {
              // B-WS2: null vem de 404 já tratado em useChatRedux — redireciona
              handleSessionNotFound(selectedDocumentId);
            }
          })
          .catch((error) => {
            logger.error(
              "[Chat8ContentV3] CRÍTICO: Erro ao buscar sessão após conexão WebSocket:",
              error,
            );
          });
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isConnected, selectedDocumentId, session?.id, fetchSession]);

  // Auto-seleção de documento criado
  useEffect(() => {
    // Esta lógica foi movida para o componente pai `Chat8V3`
    // para garantir que o estado do Redux seja atualizado ANTES
    // de `useChatRedux` ser chamado.
  }, []);

  // Scroll para o final das mensagens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Efeito para persistir estado de expansão no localStorage
  useEffect(() => {
    localStorage.setItem(
      "chat8-messages-expanded",
      JSON.stringify(isMessagesExpanded),
    );
  }, [isMessagesExpanded]);

  // Efeito para ajustar scroll e transições quando o painel é colapsado/expandido
  useEffect(() => {
    if (isMessagesExpanded && messagesEndRef.current) {
      // Scroll para o final das mensagens quando expandido
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isMessagesExpanded, messages]);

  // Efeito para carregar estado de expansão do localStorage
  // ⚠️ IMPORTANTE: O painel SEMPRE deve iniciar colapsado, independente do valor salvo
  // Isso garante uma experiência consistente para o usuário
  useEffect(() => {
    // Forçar estado inicial como colapsado (false)
    // Comentado o código que carregava do localStorage para garantir comportamento consistente
    // const storedExpanded = localStorage.getItem('chat8-messages-expanded');
    // if (storedExpanded) {
    //   setIsMessagesExpanded(JSON.parse(storedExpanded));
    // }

    // Sempre iniciar colapsado
    setIsMessagesExpanded(false);
  }, []);

  // ✅ Efeito para resetar loading quando mensagem do assistente é recebida
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Se a última mensagem é do assistente e estamos enviando, resetar o loading
      if (lastMessage.role === "assistant" && isSending) {
        dispatch(setIsSending(false));
      }
    }
  }, [messages, isSending, dispatch]);

  // ✅ Timeout de segurança para resetar loading se ficar preso
  useEffect(() => {
    if (isSending) {
      const timeout = setTimeout(() => {
        logger.warn(
          "[Chat8V3] Timeout de segurança: resetando loading após 30 segundos",
        );
        dispatch(setIsSending(false));
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, [isSending, dispatch]);

  // Handler para envio de mensagens
  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    try {
      dispatch(setIsSending(true));
      // Auditoria F2 (2026-07-21): sendMessage retorna boolean e NÃO lança
      // quando o WS está desconectado — o catch abaixo nunca disparava e a
      // falha era silenciosa (input limpo, mensagem perdida).
      const sent = await wsSendMessage(input);
      if (!sent) {
        dispatch(setIsSending(false));
        toast({
          title: "Erro",
          description:
            "Sem conexão com o servidor. A mensagem não foi enviada — tente novamente.",
          variant: "destructive",
        });
        return; // preserva o input para reenvio
      }
      setInput(""); // Clear input after sending
      // Auditoria F7: NÃO resetar isSending no sucesso — o indicador fica
      // ativo até a resposta chegar (effect) ou o timeout de 30s resetar.
    } catch (err) {
      dispatch(setIsSending(false));
      logger.error("[Chat8V3] Erro ao enviar mensagem:", err);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [input, wsSendMessage, toast, dispatch]);

  // Handler para respostas do painel de perguntas
  const handlePerguntasResponse = useCallback(
    async (response: string) => {
      if (!response.trim()) {
        logger.error("[Chat8V3] Tentativa de enviar resposta vazia do painel.");
        return;
      }

      if (!wsSendMessage) {
        logger.error(
          "[Chat8V3] handlePerguntasResponse: wsSendMessage não está disponível!",
          {
            hasSendMessage: !!wsSendMessage,
            sessionId: session?.id,
            documentId: selectedDocumentId,
          },
        );
        return;
      }

      try {
        dispatch(setIsSending(true));
        logger.info("[Chat8V3] Preparando para enviar resposta do painel...");

        // Adicionar mensagem ao Redux primeiro
        const userMessage: Message = {
          id: crypto.randomUUID(),
          content: response,
          role: "user",
          timestamp: new Date().toISOString(),
          status: "sent", // F2: adicionada só após envio bem-sucedido
          session_id: session?.id || "",
          document_id: selectedDocumentId || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: { id: "user", type: "user", name: "Você" },
        };

        // Auditoria F2 (2026-07-21): enviar ANTES de adicionar a otimista —
        // sendMessage retorna boolean (nunca lança); se falhar, nada é
        // adicionado e o usuário é avisado (antes: otimista ficava "sending"
        // para sempre, sem toast).
        const sent = await wsSendMessage(response);
        if (!sent) {
          dispatch(setIsSending(false));
          toast({
            title: "Erro",
            description:
              "Sem conexão com o servidor. A resposta não foi enviada — tente novamente.",
            variant: "destructive",
          });
          return;
        }

        addMessage(userMessage);
        logger.info("[Chat8V3] Resposta do painel enviada com sucesso.");
        // Auditoria F7: isSending permanece ativo até a resposta chegar
        // (effect) ou o timeout de 30s resetar.
      } catch (err) {
        dispatch(setIsSending(false));
        logger.error("[Chat8V3] Erro ao enviar resposta do painel:", err);
        toast({
          title: "Erro",
          description: "Não foi possível enviar a resposta. Tente novamente.",
          variant: "destructive",
        });
      }
    },
    [
      wsSendMessage,
      session?.id,
      selectedDocumentId,
      addMessage,
      toast,
      dispatch,
    ],
  );

  // Handler para erros
  const handleError = useCallback(
    (error: string) => {
      logger.error("[Chat8V3] Erro no painel de perguntas:", error);
      toast({
        title: "Erro",
        description: error || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
    [toast],
  );

  // Callbacks
  const handleDocumentSelect = useCallback((docId: string) => {
    logger.info(`[Chat8V3] Documento selecionado no header: ${docId}`);
    dispatch(setSelectedDocumentId(docId));
  }, [dispatch]);

  // F-19 — detecta documento gerado para exibir o card "Próxima etapa".
  // Estado local `dismissedGeneratedDocId` permite ocultar o card após ação
  // do usuário sem zerar o slice (outros componentes podem depender dele).
  const latestGenerated = useAppSelector((state) =>
    selectedDocumentId
      ? selectLatestGeneratedForDocument(state, selectedDocumentId)
      : null,
  );
  const [dismissedGeneratedDocId, setDismissedGeneratedDocId] =
    useState<string | null>(null);
  const shouldShowReadyCard =
    !!latestGenerated &&
    latestGenerated.status === "completed" &&
    latestGenerated.generated_doc_id !== dismissedGeneratedDocId;
  const currentDocumentName =
    docs?.find((d: any) => d.id === selectedDocumentId)?.name || undefined;

  // Se não há documento selecionado, mostrar estado vazio
  if (!selectedDocumentId) {
    return (
      <Chat8EmptyState
        title="Escolha o documento primeiro"
        description="A IA trabalha num documento de cada vez. Abra a pasta do processo e, na linha do tempo, clique em “Gerar por IA” na etapa que quer escrever."
      />
    );
  }

  return (
    <Chat8ErrorBoundary>
      <Chat8LayoutV3
        header={
          <Chat8HeaderV3
            documents={docs || []}
            selectedDocumentId={selectedDocumentId}
            loadingDocuments={loadingDocuments}
            loadingSession={loadingSession}
            onDocumentSelect={handleDocumentSelect}
          />
        }
        perguntasSection={
          /* `flex flex-col h-full min-h-0`: sem isto a cadeia flex se
              rompe aqui. O painel é `flex flex-col h-full` dentro de um
              wrapper `overflow-hidden` (Chat8LayoutV3), mas este div não era
              flex nem tinha altura, então `h-full` resolvia para `auto` e o
              rodapé com o botão "Enviar Respostas" era empurrado para fora e
              cortado. Era o §2.8/§2.11 do relatório de Aguaí: campos sem
              botão, que só aparecia depois de recarregar a página — porque o
              DocumentReadyCard, que consome altura acima do painel, some no
              reload (o slice `documents` não é persistido, e isso é
              deliberado: fix F-07, dados sensíveis vazavam entre sessões). */
          <div
            data-testid="chat8-perguntas-section"
            className="flex flex-col h-full min-h-0 space-y-3"
          >
            {shouldShowReadyCard && latestGenerated && (
              <DocumentReadyCard
                info={latestGenerated}
                documentName={currentDocumentName}
                onDismiss={() =>
                  setDismissedGeneratedDocId(latestGenerated.generated_doc_id)
                }
              />
            )}
            <Chat8PerguntasPanel
              sessionId={session?.id}
              documentId={selectedDocumentId}
              onResponseGenerated={(response) => {
                handlePerguntasResponse(response);
              }}
              onError={(error) => {
                logger.error('Erro no painel de perguntas:', error);
              }}
            />
          </div>
        }
        statusBar={null}
      />
    </Chat8ErrorBoundary>
  );
};

/**
 * @component Chat8V3
 * @description Página principal do chat V3 com interface Navy/Silver
 */
export const Chat8V3: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedDocumentId = useAppSelector(selectSelectedDocumentId);
  const { documentId } = useParams<{ documentId?: string }>();

  // ✅ DEBUG: Log component initialization
  logger.info(`[Chat8V3] 🔍 Componente inicializado - selectedDocumentId: ${selectedDocumentId}, documentId: ${documentId}`);

  // ✅ SIMPLIFICAÇÃO: Validação de estado persistido mais robusta
  useEffect(() => {
    logger.info(`[Chat8V3] 🔍 Verificando estado persistido...`);
    
    // Verificar se há estado persistido
    const persistedState = localStorage.getItem('persist:root');
    
    if (persistedState) {
      try {
        const parsedState = JSON.parse(persistedState);
        logger.info(`[Chat8V3] ✅ Estado persistido encontrado`);
        
        // Usar o estado do Redux em vez de chatState inexistente
        const hasInvalidIds = 
          selectedDocumentId === "undefined" ||
          selectedDocumentId === undefined;
        
        if (hasInvalidIds) {
          logger.warn(`[Chat8V3] ⚠️ IDs inválidos detectados no estado persistido!`);
          logger.warn(`[Chat8V3] 🧹 Limpando estado persistido com IDs inválidos...`);
          
          // Auditoria F13 (2026-07-21): persistor.purge() em vez de remoção
          // manual de persist:root — a remoção manual dessincronizava o
          // estado em memória do persistido até o próximo flush.
          void persistor.purge();
          sessionStorage.removeItem('painel_selected_document_id');
          sessionStorage.removeItem('SELECTED_DOCUMENT');
          
          // Não forçar reload, deixar o componente se recuperar
          logger.info(`[Chat8V3] ✅ Estado limpo, continuando...`);
          return;
        }
        
        // Validação mais flexível para sessionId vs documentId
        if (selectedDocumentId) {
          logger.info(`[Chat8V3] 🔍 Verificando consistência de IDs:`);
          logger.info(`[Chat8V3] 🔍 selectedDocumentId: ${selectedDocumentId}`);
          
          // Aceitar IDs diferentes (pode ser normal)
          logger.info(`[Chat8V3] ✅ IDs válidos detectados`);
        }
      } catch (error) {
        logger.error(`[Chat8V3] ❌ Erro ao verificar estado persistido:`, error);
        // Limpar apenas se realmente corrompido
        logger.warn(`[Chat8V3] 🧹 Limpando estado persistido corrompido...`);
        // F13: purge via persistor (mantém memória e storage em sincronia).
        void persistor.purge();
        sessionStorage.removeItem('painel_selected_document_id');
        sessionStorage.removeItem('SELECTED_DOCUMENT');
        // Não forçar reload
        logger.info(`[Chat8V3] ✅ Estado limpo, continuando...`);
      }
    } else {
      logger.info(`[Chat8V3] ✅ Nenhum estado persistido encontrado`);
    }
  }, [selectedDocumentId]); // ✅ Dependência correta

  // ✅ NOVO: Sempre priorizar o documentId da URL
  useEffect(() => {
    if (
      documentId &&
      documentId !== "undefined" &&
      documentId.length > 10 &&
      selectedDocumentId !== documentId
    ) {
      logger.info(`[Chat8V3] 🚀 Forçando setSelectedDocumentId para o documentId da URL: ${documentId}`);
      dispatch(setSelectedDocumentId(documentId));
    }
  }, [documentId, selectedDocumentId, dispatch]);

  // ✅ NOVO: Limpar sessionStorage depois que documento for carregado
  useEffect(() => {
    if (selectedDocumentId) {
      logger.info(`[Chat8V3] 🧹 Preparando limpeza do sessionStorage para documento: ${selectedDocumentId}`);
      
      // Limpar apenas após confirmar que WebSocket está conectado e sessão carregada
      const cleanupSessionStorage = () => {
        logger.info(`[Chat8V3] 🧹 Executando limpeza do sessionStorage`);
        sessionStorage.removeItem(STORAGE_KEYS.SELECTED_DOCUMENT);
        sessionStorage.removeItem('painel_selected_document_id'); // Manter compatibilidade
        logger.info(`[Chat8V3] ✅ SessionStorage limpo com sucesso`);
      };

      // Aguardar WebSocket conectar e sessão carregar
      const timeout = setTimeout(cleanupSessionStorage, 2000); // Aumentar para 2 segundos

      return () => clearTimeout(timeout);
    }
  }, [selectedDocumentId]);

  // ✅ SIMPLIFICAÇÃO: Loading state claro
  if (!selectedDocumentId) {
    logger.info(`[Chat8V3] 🚫 Renderizando estado vazio - sem documento selecionado`);
    return (
      <Chat8ErrorBoundary>
        <AvisoDeEstado
          rotulo="Gerar por IA"
          titulo="Escolha o documento primeiro"
          acoes={
            <Button asChild>
              <Link to="/processes">Ver os processos ›</Link>
            </Button>
          }
        >
          A IA trabalha num documento de cada vez. Abra a pasta do processo e, na linha do tempo, clique em “Gerar por IA” na etapa que
          quer escrever.
        </AvisoDeEstado>
      </Chat8ErrorBoundary>
    );
  }

  logger.info(`[Chat8V3] ✅ Renderizando Chat8ContentV3 com documentId: ${selectedDocumentId}`);
  
  return (
    <Chat8ErrorBoundary>
      <Chat8WithWebSocketV3 documentId={selectedDocumentId} />
    </Chat8ErrorBoundary>
  );
};

// ✅ NOVO: Componente intermediário que aguarda sessão ser carregada
const Chat8WithWebSocketV3: React.FC<{ documentId: string }> = ({ documentId }) => {
  const dispatch = useAppDispatch();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ DEBUG: Log component initialization
  logger.info(`[Chat8WithWebSocketV3] 🔧 Componente inicializado - documentId: ${documentId}`);

  // ✅ EFEITO: Buscar sessão quando documentId mudar
  useEffect(() => {
    if (documentId && documentId !== "undefined" && documentId.length > 10) {
      logger.info(`[Chat8WithWebSocketV3] 🔄 Buscando sessão para documentId: ${documentId}`);
      setIsLoading(true);
      
      // Usar documentId como sessionId (mesmo ID)
      const sessionIdFromDocument = documentId;
      logger.info(`[Chat8WithWebSocketV3] ✅ Usando documentId como sessionId: ${sessionIdFromDocument}`);
      setSessionId(sessionIdFromDocument);
      setIsLoading(false);
    } else {
      logger.error(`[Chat8WithWebSocketV3] ❌ DocumentId inválido: ${documentId}`);
      setSessionId(null);
      setIsLoading(false);
    }
  }, [documentId]);

  // ✅ LOADING: Mostrar loading enquanto busca sessão
  if (isLoading) {
    logger.info(`[Chat8WithWebSocketV3] 🔄 Renderizando loading - aguardando sessão`);
    return (
      <p role="status" className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Abrindo a conversa com a IA…
      </p>
    );
  }

  // ✅ ERRO: Se não conseguiu carregar sessão
  if (!sessionId) {
    logger.error(`[Chat8WithWebSocketV3] ❌ Renderizando erro - sessão não encontrada`);
    return (
      <AvisoDeEstado
        alerta
        rotulo="Gerar por IA"
        titulo="Não deu para abrir a conversa"
        acoes={
          <>
            <Button onClick={() => window.location.reload()}>Tentar de novo</Button>
            <Link to="/processes" className="text-sm font-semibold text-primary hover:underline dark:text-accent">
              Voltar aos processos
            </Link>
          </>
        }
      >
        O endereço não aponta para um documento válido. Nada foi alterado; abra o documento de novo pela pasta do processo.
      </AvisoDeEstado>
    );
  }

  // ✅ SUCESSO: Renderizar Chat8ContentV3 diretamente (WebSocketProvider já está no App.tsx)
  logger.info(`[Chat8WithWebSocketV3] ✅ Renderizando Chat8ContentV3 com sessionId: ${sessionId}`);
  
  return <Chat8ContentV3 />;
};

export default Chat8V3;
