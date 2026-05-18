import { useState } from 'react';
import { PageSection } from '../components/layout/PageSection';
import type { ChatMessage, ChatThreadId } from '../types/app';

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

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<ChatThreadId>('bot');
  const [draft, setDraft] = useState('');
  const [messagesByThread, setMessagesByThread] = useState<Record<ChatThreadId, ChatMessage[]>>({
    bot: [
      {
        id: 'welcome-bot',
        role: 'bot',
        text: '¡Hola! Soy el asistente de Agro Control. Puedo ayudarte con la plataforma, sensores, reportes y configuración.',
        timestamp: Date.now(),
      },
    ],
    expert1: [],
    expert2: [],
    expert3: [],
  });

  const messages = messagesByThread[selectedChat];

  const handleSend = () => {
    const value = draft.trim();
    if (!value) return;

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `user-${selectedChat}-${now}`,
      role: 'user',
      text: value,
      timestamp: now,
    };

    const botMessage: ChatMessage = {
      id: `bot-${selectedChat}-${now}`,
      role: 'bot',
      text: 'Procesando diagnóstico agronómico...',
      timestamp: now + 1,
    };

    setMessagesByThread((current) => ({
      ...current,
      [selectedChat]: [...(current[selectedChat] ?? []), userMessage, botMessage],
    }));
    setDraft('');
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[240px_1fr]">
      <PageSection title="Canal de comunicación" subtitle="Groq · Llama 3 · interfaz local">
        <div className="space-y-3">
          {([
            ['bot', '🤖'],
            ['expert1', 'MC'],
            ['expert2', 'JM'],
            ['expert3', 'AL'],
          ] as const).map(([thread, avatar]) => (
            <button
              key={thread}
              type="button"
              onClick={() => setSelectedChat(thread)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selectedChat === thread ? 'border-emerald-400/15 bg-emerald-500/5' : 'border-white/6 bg-black/10'}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-white">
                {avatar}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{chatLabels[thread]}</div>
                <div className="text-xs text-slate-400">{chatRoles[thread]}</div>
              </div>
            </button>
          ))}
        </div>
      </PageSection>

      <div className="space-y-4">
        <PageSection title={selectedChat === 'bot' ? 'Asistente AgroControl' : chatLabels[selectedChat]} subtitle="Respuesta instantánea">
          <div className="space-y-4">
            <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'border border-emerald-400/20 bg-emerald-500/10 text-white' : 'border border-white/8 bg-white/[0.03] text-slate-300'}`}>
                    <div>{message.text}</div>
                    <div className="mt-2 text-[10px] text-slate-500">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {quickPrompts[selectedChat].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-400/20 hover:bg-emerald-500/5 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Escribe tu consulta agronómica..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSend();
                  }
                }}
              />
              <button
                className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
                type="button"
                onClick={handleSend}
              >
                <i className="fas fa-paper-plane" />
              </button>
            </div>
          </div>
        </PageSection>
      </div>
    </div>
  );
}
