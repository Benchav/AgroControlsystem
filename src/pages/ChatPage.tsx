import { useEffect, useRef, useState } from 'react';
import { PageSection } from '../components/layout/PageSection';
import type { ChatMessage, ChatThreadId } from '../types/app';

type ChatPageProps = {
  selectedChat: ChatThreadId;
  messages: ChatMessage[];
  onSelectChat: (thread: ChatThreadId) => void;
  onSendMessage: (text: string) => void | Promise<void>;
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

function getThreadAccent(thread: ChatThreadId) {
  switch (thread) {
    case 'bot':
      return 'from-emerald-400/20 via-emerald-500/10 to-transparent';
    case 'expert1':
      return 'from-sky-400/20 via-sky-500/10 to-transparent';
    case 'expert2':
      return 'from-amber-400/20 via-amber-500/10 to-transparent';
    case 'expert3':
      return 'from-rose-400/20 via-rose-500/10 to-transparent';
  }
}

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

export function ChatPage({ selectedChat, messages, onSelectChat, onSendMessage, isSending, errorMessage }: ChatPageProps) {
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, selectedChat]);

  const handleSend = async () => {
    const value = draft.trim();
    if (!value || isSending) return;

    await onSendMessage(value);
    setDraft('');
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <p className="text-sm leading-6 text-slate-400">
        Canal de ayuda contextual conectado a Groq · Llama 3. Respuestas cortas, claras y enfocadas en la plataforma.
      </p>

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <PageSection title="Canales" subtitle="Selecciona el hilo de conversación">
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
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selectedChat === thread ? 'border-emerald-400/15 bg-emerald-500/5' : 'border-white/6 bg-black/10 hover:border-white/10 hover:bg-white/[0.04]'} ${isSending ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-xs font-bold text-white">
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

          <PageSection title="Atajos" subtitle="Preguntas frecuentes">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {quickPrompts[selectedChat].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isSending}
                  onClick={() => setDraft(prompt)}
                  className="rounded-2xl border border-white/6 bg-black/10 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-emerald-400/15 hover:bg-emerald-500/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </PageSection>
        </div>

        <div className="space-y-4">
          <PageSection title={selectedChat === 'bot' ? 'Asistente AgroControl' : chatLabels[selectedChat]} subtitle={isSending ? 'Generando respuesta breve...' : 'Groq · Llama 3 · contexto de la plataforma'}>
            <div className="space-y-4">
              {errorMessage ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {errorMessage}
                </div>
              ) : null}

              <div className="max-h-[56vh] space-y-3 overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
                <div className="mx-auto flex max-w-4xl flex-col gap-3">
                  {messages.map((message) => {
                    const isUser = message.role === 'user';
                    return (
                      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.12)] md:max-w-[76%] ${isUser ? 'border border-emerald-400/20 bg-emerald-500/10 text-white' : 'border border-white/8 bg-white/[0.03] text-slate-300'}`}>
                          <div className="whitespace-pre-wrap leading-6">{message.text}</div>
                          <div className={`mt-2 text-[10px] uppercase tracking-[0.18em] ${isUser ? 'text-emerald-100/70' : 'text-slate-500'}`}>
                            {isUser ? 'Tú' : selectedChat === 'bot' ? 'AgroControl AI' : chatLabels[selectedChat]} · {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isSending ? (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-slate-300">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                        Pensando...
                      </div>
                    </div>
                  ) : null}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Escribir mensaje</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/30 focus:ring-2 focus:ring-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Pregunta sobre la plataforma, sensores, reportes o navegación..."
                      disabled={isSending}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void handleSend();
                        }
                      }}
                    />
                  </div>

                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={isSending || !draft.trim()}
                  >
                    <i className="fas fa-paper-plane" />
                    Enviar
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  El asistente responde corto para ahorrar tokens y mantener la conversación más fluida.
                </p>
              </div>
            </div>
          </PageSection>
        </div>
      </div>
    </div>
  );
}
