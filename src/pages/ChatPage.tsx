import { useEffect, useRef, useState } from 'react';
import { PageSection } from '../components/layout/PageSection';
import type { ChatMessage, ChatThreadId } from '../types/app';

type ChatPageProps = {
  selectedChat: ChatThreadId;
  messages: ChatMessage[];
  onSelectChat: (thread: ChatThreadId) => void;
  onSendMessage: (text: string) => void | Promise<void>;
  onClearChat: () => void;
  isSending: boolean;
  errorMessage?: string | null;
};

const chatLabels: Record<ChatThreadId, string> = {
  bot: 'Asistente IA',
  expert1: 'María Campos',
  expert2: 'Jorge Méndez',
  expert3: 'Ana López',
};

const chatRoles: Record<ChatThreadId, string> = {
  bot: 'Llama 3 · Groq API',
  expert1: 'Especialista · Cultivos',
  expert2: 'Suelos · Fertilización',
  expert3: 'Plagas · Entomología',
};

const quickPrompts: Record<ChatThreadId, string[]> = {
  bot: ['¿Qué hace el dashboard?', 'Explícame el flujo de sensores', '¿Cómo veo reportes?', '¿Dónde cambio la configuración?'],
  expert1: ['Resume el módulo de IA', '¿Cómo uso el mapa?', '¿Qué muestra el marketplace?', '¿Dónde veo modelos 3D?'],
  expert2: ['¿Cómo interpreto alertas IoT?', '¿Qué umbral recomiendas?', '¿Cómo ajusto pH?', '¿Cómo priorizo acciones?'],
  expert3: ['¿Cómo detecto plagas?', 'Resume el flujo de diagnóstico', '¿Cómo uso el chat?', '¿Qué módulos ayudan al seguimiento?'],
};

function getThreadBadge(thread: ChatThreadId) {
  switch (thread) {
    case 'bot':
      return 'Sistema';
    case 'expert1':
      return 'Cultivos';
    case 'expert2':
      return 'Suelos';
    case 'expert3':
      return 'Plagas';
  }
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export function ChatPage({ selectedChat, messages, onSelectChat, onSendMessage, onClearChat, isSending, errorMessage }: ChatPageProps) {
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesPanelRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasMessages = messages.length > 0;
  const [isNearBottom, setIsNearBottom] = useState(true);

  useEffect(() => {
    setIsNearBottom(true);
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [selectedChat]);

  useEffect(() => {
    if (!isNearBottom) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isNearBottom]);

  const handleMessagesScroll = () => {
    const container = messagesPanelRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsNearBottom(distanceFromBottom < 120);
  };

  const handlePromptSelect = (prompt: string) => {
    setDraft(prompt);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleSend = async () => {
    const value = draft.trim();
    if (!value || isSending) return;

    await onSendMessage(value);
    setDraft('');
  };

  return (
    <div className="flex min-h-[calc(100vh-170px)] flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-3 rounded-[22px] border border-white/8 bg-[#25283d]/55 px-4 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-5 md:py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/80">Mensajería profesional</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
            Canal de ayuda contextual conectado a Groq · Llama 3. Respuestas cortas, claras y enfocadas en la plataforma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            Conectado
          </span>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-slate-400">Soporte multi-hilo</span>
        </div>
      </div>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <PageSection title="Canales" subtitle="Selecciona el hilo de conversación" className="h-full">
            <div className="space-y-2">
              {(
                [
                  ['bot', 'Asistente IA'],
                  ['expert1', 'Cultivos'],
                  ['expert2', 'Suelos'],
                  ['expert3', 'Plagas'],
                ] as const
              ).map(([thread, label]) => (
                <button
                  key={thread}
                  type="button"
                  onClick={() => onSelectChat(thread)}
                  disabled={isSending}
                  className={`group flex w-full items-center gap-3 rounded-[18px] border px-3 py-2.5 text-left transition ${selectedChat === thread ? 'border-emerald-400/20 bg-emerald-500/[0.06]' : 'border-white/6 bg-black/5 hover:border-white/10 hover:bg-white/[0.03]'} ${isSending ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold text-white transition ${selectedChat === thread ? 'border-emerald-400/25 bg-emerald-500/15' : 'border-white/8 bg-white/[0.04] group-hover:bg-white/[0.06]'}`}>
                    {label
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">{chatLabels[thread]}</div>
                    <div className="truncate text-xs text-slate-400">{chatRoles[thread]}</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${selectedChat === thread ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>
                    {getThreadBadge(thread)}
                  </span>
                </button>
              ))}
            </div>
          </PageSection>
        </div>

        <div className="min-h-0 space-y-4">
          <PageSection
            title={selectedChat === 'bot' ? 'Asistente AgroControl' : chatLabels[selectedChat]}
            subtitle={isSending ? 'Generando respuesta breve...' : 'Groq · Llama 3 · contexto de la plataforma'}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex items-center justify-between gap-3 px-1 pt-1">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{chatLabels[selectedChat]}</div>
                  <div className="truncate text-xs text-slate-400">{chatRoles[selectedChat]}</div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  Activo
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-1">
                <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {quickPrompts[selectedChat].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isSending}
                      onClick={() => handlePromptSelect(prompt)}
                      className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-400/20 hover:bg-emerald-500/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isSending || !messages.length}
                  onClick={onClearChat}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fas fa-trash text-[10px]" />
                  Vaciar
                </button>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {errorMessage}
                </div>
              ) : null}

              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-white/8 bg-[#151827] p-2">
                <div
                  ref={messagesPanelRef}
                  onScroll={handleMessagesScroll}
                  className="flex-1 space-y-3 overflow-y-auto rounded-[20px] px-1 py-2 text-sm text-slate-300"
                >
                  {hasMessages ? (
                    <div className="mx-auto flex max-w-5xl flex-col gap-2.5">
                      {messages.map((message) => {
                        const isUser = message.role === 'user';
                        return (
                          <div key={message.id} className={`chat-bubble-enter flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            {!isUser ? (
                              <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-[10px] font-semibold text-slate-200">
                                AG
                              </div>
                            ) : null}

                            <div className={`max-w-[88%] rounded-[20px] px-4 py-3 md:max-w-[74%] ${isUser ? 'rounded-br-md border border-emerald-400/18 bg-emerald-500/12 text-white' : 'rounded-bl-md border border-white/8 bg-white/[0.035] text-slate-200'}`}>
                              <div className="whitespace-pre-wrap leading-6">{message.text}</div>
                              <div className={`mt-2 text-[10px] uppercase tracking-[0.18em] ${isUser ? 'text-emerald-100/70' : 'text-slate-500'}`}>
                                {isUser ? 'Tú' : selectedChat === 'bot' ? 'AgroControl AI' : chatLabels[selectedChat]} · {formatTime(message.timestamp)}
                              </div>
                            </div>

                            {isUser ? (
                              <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/18 bg-emerald-500/12 text-[10px] font-semibold text-emerald-100">
                                JR
                              </div>
                            ) : null}
                          </div>
                        );
                      })}

                      {isSending ? (
                        <div className="chat-bubble-enter flex justify-start">
                          <div className="flex items-end gap-2">
                            <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-[10px] font-semibold text-slate-200">
                              AG
                            </div>
                            <div className="rounded-[20px] rounded-bl-md border border-white/8 bg-white/[0.04] px-4 py-3 text-slate-300 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 [animation-delay:-0.2s]" />
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 [animation-delay:-0.1s]" />
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                              </div>
                              <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                AgroControl AI escribiendo
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center">
                      <div className="max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-2xl text-emerald-300">
                          <i className="fas fa-comment-dots" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-white">Empieza una conversación</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          Elige un canal o usa un atajo para abrir un hilo con una interfaz tipo mensajería, clara y profesional.
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {!isNearBottom && hasMessages ? (
                  <button
                    type="button"
                    onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
                    className="absolute bottom-24 right-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1b2030]/95 px-4 py-2 text-xs font-medium text-white transition hover:border-emerald-400/20 hover:text-emerald-300"
                  >
                    <i className="fas fa-arrow-down" />
                    Ir al final
                  </button>
                ) : null}

                <div className="mt-3 rounded-[18px] border border-white/8 bg-white/[0.03] p-2.5">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      className="min-h-[52px] flex-1 resize-none rounded-[16px] border border-white/8 bg-[#0b1020] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/25 focus:ring-2 focus:ring-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Escribe un mensaje..."
                      disabled={isSending}
                      rows={2}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          void handleSend();
                        }
                      }}
                    />

                    <button
                      className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[16px] bg-emerald-500 px-4 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={isSending || !draft.trim()}
                    >
                      <i className="fas fa-paper-plane" />
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </PageSection>
        </div>
      </div>
    </div>
  );
}
