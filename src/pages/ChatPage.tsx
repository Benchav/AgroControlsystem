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
    <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#101425] shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%)]" />
      <div className="relative grid gap-4 xl:grid-cols-[280px_1fr] p-4 md:p-5">
        <aside className="space-y-4">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Groq + Llama 3
                </div>
                <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.04em] text-white">Chat inteligente</h2>
                <p className="mt-2 max-w-[20ch] text-sm leading-6 text-slate-400">
                  Respuestas cortas, claras y enfocadas en la plataforma para mantener fluidez y ahorro de tokens.
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-lg text-emerald-300">
                <i className="fas fa-comments" />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
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
                  className={`group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all ${selectedChat === thread ? 'border-emerald-400/25 bg-emerald-500/10 shadow-[0_12px_30px_rgba(16,185,129,0.12)]' : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]'} ${isSending ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <span className={`absolute inset-0 bg-gradient-to-r ${getThreadAccent(thread)} opacity-80`} />
                  <span className="relative flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-semibold text-white">{label}</span>
                      <span className="block text-xs text-slate-400">{chatRoles[thread]}</span>
                    </span>
                    <span className={`rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${selectedChat === thread ? 'bg-white/10 text-white' : 'bg-black/20 text-slate-300'}`}>
                      {getThreadBadge(thread)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-5 backdrop-blur">
            <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-500">Atajos</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickPrompts[selectedChat].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isSending}
                  onClick={() => setDraft(prompt)}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-left text-[12px] text-slate-300 transition hover:border-emerald-400/20 hover:bg-emerald-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-h-[72vh] rounded-[24px] border border-white/8 bg-[#0f1424]/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4 md:px-6">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-500">Conversación activa</div>
              <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-white">{selectedChat === 'bot' ? 'Asistente AgroControl' : chatLabels[selectedChat]}</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 text-[11px] text-slate-300">
              <span className={`h-2 w-2 rounded-full ${isSending ? 'bg-amber-400' : 'bg-emerald-400'} shadow-[0_0_12px_rgba(52,211,153,0.55)]`} />
              {isSending ? 'Generando respuesta breve' : 'Listo para responder'}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 py-4 md:px-6">
            {errorMessage ? (
              <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 text-sm text-slate-300">
              <div className="mx-auto flex max-w-4xl flex-col gap-3">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  return (
                    <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] rounded-[22px] px-4 py-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.14)] md:max-w-[74%] ${isUser ? 'border border-emerald-400/20 bg-emerald-500/12 text-white' : 'border border-white/8 bg-white/[0.04] text-slate-200'}`}>
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
                    <div className="inline-flex items-center gap-2 rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3 text-slate-300">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                      Pensando una respuesta corta y clara...
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-white/8 bg-white/[0.04] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.16)] backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="flex-1">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Mensaje</label>
                  <textarea
                    className="min-h-[92px] w-full resize-none rounded-[18px] border border-white/10 bg-[#0b1020] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/30 focus:ring-2 focus:ring-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Haz una pregunta sobre la plataforma, sensores, reportes o navegación..."
                    disabled={isSending}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 md:flex-col md:items-stretch">
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={isSending || !draft.trim()}
                  >
                    <i className="fas fa-paper-plane" />
                    Enviar
                  </button>
                  <div className="text-[11px] leading-5 text-slate-500 md:max-w-[18ch]">
                    El bot responde en formato breve para ahorrar tokens y mantener la conversación fluida.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
