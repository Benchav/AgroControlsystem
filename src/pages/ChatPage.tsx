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
    requestAnimationFrame(() => {
      const input = messagesPanelRef.current?.closest('section')?.querySelector('textarea');
      input instanceof HTMLTextAreaElement && input.focus();
    });
  };

  const handleSend = async () => {
    const value = draft.trim();
    if (!value || isSending) return;

    await onSendMessage(value);
    setDraft('');
  };

  return (
    <div className="flex min-h-[calc(100vh-170px)] flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-3 rounded-[24px] border border-white/8 bg-[#25283d]/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/80">Mensajería profesional</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
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
            <div className="space-y-3">
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
                  className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selectedChat === thread ? 'border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-white/[0.03] shadow-[0_8px_30px_rgba(16,185,129,0.08)]' : 'border-white/6 bg-black/10 hover:border-white/10 hover:bg-white/[0.04]'} ${isSending ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full border text-xs font-bold text-white transition ${selectedChat === thread ? 'border-emerald-400/25 bg-emerald-500/15' : 'border-white/8 bg-white/[0.04] group-hover:bg-white/[0.06]'}`}>
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
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{chatLabels[selectedChat]}</div>
                  <div className="truncate text-xs text-slate-400">{chatRoles[selectedChat]}</div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
                  Activo
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/8 bg-black/15 p-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Atajos rápidos</div>
                  <div className="text-sm text-slate-300">Toca uno para escribirlo al instante.</div>
                </div>

                <button
                  type="button"
                  disabled={isSending || !messages.length}
                  onClick={onClearChat}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fas fa-trash" />
                  Vaciar chat
                </button>

              </div>

              <div className="rounded-[22px] border border-white/8 bg-black/15 p-3">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {quickPrompts[selectedChat].map((prompt) => (
                      <button
                      key={prompt}
                      type="button"
                      disabled={isSending}
                      onClick={() => handlePromptSelect(prompt)}
                      className="rounded-2xl border border-white/6 bg-[#202334] px-3 py-2 text-left text-sm text-slate-300 transition hover:border-emerald-400/15 hover:bg-emerald-500/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {errorMessage}
                </div>
              ) : null}

              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_35%),#111521] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                <div
                  ref={messagesPanelRef}
                  onScroll={handleMessagesScroll}
                  className="flex-1 space-y-3 overflow-y-auto rounded-[20px] px-1 py-2 text-sm text-slate-300"
                >
                  {hasMessages ? (
                    <div className="mx-auto flex max-w-5xl flex-col gap-3">
                      {messages.map((message) => {
                        const isUser = message.role === 'user';
                        return (
                          <div key={message.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            {!isUser ? (
                              <div className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.05] text-[10px] font-bold text-slate-200">
                                AG
                              </div>
                            ) : null}

                            <div className={`max-w-[88%] rounded-[22px] px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)] md:max-w-[74%] ${isUser ? 'rounded-br-md border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 text-white' : 'rounded-bl-md border border-white/8 bg-white/[0.04] text-slate-200'}`}>
                              <div className="whitespace-pre-wrap leading-6">{message.text}</div>
                              <div className={`mt-2 text-[10px] uppercase tracking-[0.18em] ${isUser ? 'text-emerald-100/75' : 'text-slate-500'}`}>
                                {isUser ? 'Tú' : selectedChat === 'bot' ? 'AgroControl AI' : chatLabels[selectedChat]} · {formatTime(message.timestamp)}
                              </div>
                            </div>

                            {isUser ? (
                              <div className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/15 text-[10px] font-bold text-emerald-100">
                                JR
                              </div>
                            ) : null}
                          </div>
                        );
                      })}

                      {isSending ? (
                        <div className="flex justify-start">
                          <div className="inline-flex items-center gap-2 rounded-[18px] border border-white/8 bg-white/[0.04] px-4 py-3 text-slate-300">
                            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                            Escribiendo respuesta...
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
                    className="absolute bottom-24 right-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1b2030]/95 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] transition hover:border-emerald-400/20 hover:text-emerald-300"
                  >
                    <i className="fas fa-arrow-down" />
                    Ir al final
                  </button>
                ) : null}

                <div className="mt-3 rounded-[20px] border border-white/8 bg-black/20 p-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex-1">
                      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Escribir mensaje</label>
                      <textarea
                        className="min-h-[56px] w-full resize-none rounded-[18px] border border-white/10 bg-[#0b1020] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/30 focus:ring-2 focus:ring-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Pregunta sobre la plataforma, sensores, reportes o navegación..."
                        disabled={isSending}
                        rows={2}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            void handleSend();
                          }
                        }}
                      />
                    </div>

                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={isSending || !draft.trim()}
                    >
                      <i className="fas fa-paper-plane" />
                      Enviar
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Enter envía. Shift + Enter agrega una nueva línea.
                  </p>
                </div>
              </div>
            </div>
          </PageSection>
        </div>
      </div>
    </div>
  );
}
