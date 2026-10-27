import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  MapPin,
  Compass,
  ExternalLink,
  Loader2,
  Bot,
  User as UserIcon,
  Trash2,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  groundingChunks?: any[];
  timestamp: string;
}

interface ConciergeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBusinessQuery?: (query: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'Onde comer moqueca fresca em Itaparica e Vera Cruz?',
  'Onde comprar cabos de aço e materiais elétricos (Loja do Cabo)?',
  'Serviços automotivos e oficinas em Simões Filho',
  'Farmácias e clínicas em Lauro de Freitas e Camaçari',
  'Como funciona a travessia de Ferry-boat e lanchas para a Ilha?'
];

export const ConciergeChatModal: React.FC<ConciergeChatModalProps> = ({
  isOpen,
  onClose,
  onSelectBusinessQuery
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Olá! Sou o **Concierge Guia da Ilha & RMS** 🌴🌊.\n\nEstou aqui com inteligência em tempo real e dados do **Google Maps** para lhe indicar as melhores empresas, rotas, praias e serviços em toda a Ilha de Itaparica (Itaparica e Vera Cruz), Salvador e Região Metropolitana.\n\nComo posso ajudar você hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Attempt to get user location for accurate Maps grounding
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        () => {
          // Fallback coordinate for Salvador / Ilha de Itaparica
          setUserLocation({ latitude: -12.9777, longitude: -38.5016 });
        },
        { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newHistory.map(m => ({ role: m.role, content: m.content })),
          userLocation
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API (${response.status})`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: 'model-' + Date.now(),
        role: 'model',
        content: data.reply || 'Aqui estão as informações para você!',
        groundingChunks: data.groundingChunks || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error fetching concierge response:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'model',
        content:
          'Ops, tive uma oscilação na conexão com o serviço de satélite/mapas. Mas você pode navegar pelos 66 estabelecimentos catalogados na página inicial ou me mandar outra pergunta!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'model',
        content: 'Conversa reiniciada. Em que posso ajudar você agora?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[700px] border border-teal-100 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="concierge-title"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="concierge-title" className="font-bold text-lg text-white leading-tight">
                  Concierge Guia da Ilha
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-400/25 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Maps Grounding
                </span>
              </div>
              <p className="text-xs text-teal-100">
                IA especializada em Itaparica, Vera Cruz, Salvador & RMS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Limpar conversa"
              className="p-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Fechar"
              className="p-2 text-teal-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/70 dark:bg-slate-950/40">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Grounding Google Maps links */}
                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/70 space-y-1.5">
                      <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Locais encontrados no Google Maps:
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.groundingChunks.map((chunk: any, idx: number) => {
                          const mapItem = chunk.maps;
                          if (!mapItem?.uri) return null;
                          return (
                            <a
                              key={idx}
                              href={mapItem.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition-colors"
                            >
                              <span>{mapItem.title || 'Ver no Google Maps'}</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1.5 text-right ${
                      isUser ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-sm text-slate-500 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
                <span className="text-xs">Consultando base regional e Google Maps...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-900/90 border-t border-slate-200/60 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-thin">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Sugestões:
              </span>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="text-xs px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre comércios, praias, rotas ou serviços..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all border border-transparent dark:border-slate-700"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white p-3 rounded-2xl transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer"
              title="Enviar mensagem"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Respostas fundamentadas com Google Maps Grounding & Catálogo Local</span>
            <span>Central: (71) 98382-1218</span>
          </div>
        </div>
      </div>
    </div>
  );
};
