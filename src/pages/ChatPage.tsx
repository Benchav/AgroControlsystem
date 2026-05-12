import { useState } from 'react';
import { PageSection } from '../components/layout/PageSection';
import type { ChatMessage, ChatThreadId } from '../types/app';

type ChatPageProps = {
  selectedChat: ChatThreadId;
  messages: ChatMessage[];
  onSelectChat: (thread: ChatThreadId) => void;
  onSendMessage: (text: string) => void;
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

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export function ChatPage({ selectedChat, messages, onSelectChat, onSendMessage }: ChatPageProps) {
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    const value = draft.trim();
    if (!value) return;
    onSendMessage(value);
    setDraft('');
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[240px_1fr]">
      <PageSection title="Canal de comunicación" subtitle="Groq · Llama 3 · ~0.3s resp.">
        <div className="space-y-3">
          {(
            [
              ['bot', '🤖'],
              ['expert1', 'MC'],
              ['expert2', 'JM'],
              ['expert3', 'AL'],
            ] as const
          ).map(([thread, avatar]) => (
            <button
              key={thread}
              type="button"
              onClick={() => onSelectChat(thread)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selectedChat === thread ? 'border-emerald-400/15 bg-emerald-500/5' : 'border-white/6 bg-black/10'}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-white">{avatar}</div>
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
              <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white" type="button" onClick={handleSend}>
                <i className="fas fa-paper-plane" />
              </button>
            </div>
          </div>
        </PageSection>
      </div>
    </div>
  );
}
