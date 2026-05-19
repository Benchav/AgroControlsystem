import { useState } from "react";
import { PageSection } from "../components/layout/PageSection";
import { generateGroqChatReply } from "../services/groqChat";
import type { ChatMessage, ChatThreadId } from "../types/app";
import { formatShortTime } from "../utils/formatTime";

const chatLabels: Record<ChatThreadId, string> = {
  bot: "Asistente IA",
  expert1: "María Campos",
  expert2: "Jorge Méndez",
  expert3: "Ana López",
};

const chatRoles: Record<ChatThreadId, string> = {
  bot: "Llama 3 · Groq API",
  expert1: "Especialista · Cultivos",
  expert2: "Suelos · Fertilización",
  expert3: "Plagas · Entomología",
};

const quickPrompts: Record<ChatThreadId, string[]> = {
  bot: [
    "¿Qué hace el dashboard?",
    "Explícame el flujo de sensores",
    "¿Cómo veo reportes?",
    "¿Dónde cambio la configuración?",
  ],
  expert1: [
    "Resume el módulo de IA",
    "¿Cómo uso el mapa?",
    "¿Qué muestra el marketplace?",
    "¿Dónde veo modelos 3D?",
  ],
  expert2: [
    "¿Cómo interpreto alertas IoT?",
    "¿Qué umbral recomiendas?",
    "¿Cómo ajusto pH?",
    "¿Cómo priorizo acciones?",
  ],
  expert3: [
    "¿Cómo detecto plagas?",
    "Resume el flujo de diagnóstico",
    "¿Cómo uso el chat?",
    "¿Qué módulos ayudan al seguimiento?",
  ],
};

const defaultProfile = {
  name: "Juan Rodríguez",
  email: "juan@agrocontrol.io",
  org: "Finca La Esperanza",
};

const defaultSettings = {
  humidityThreshold: 40,
  temperatureThreshold: 30,
  phThreshold: 6,
};

const chatThreads: {
  thread: ChatThreadId;
  avatar: string;
}[] = [
  {
    thread: "bot",
    avatar:
      "https://cdn.prod.website-files.com/65ba9a1f0a4a7ab901ad8d3e/6696608407e73f8c26e6e422_KI%20Assistent.webp",
  },
  {
    thread: "expert1",
    avatar:
      "https://eluniversalexpress.com/web/wp-content/uploads/2025/06/la-empresaria-juana-bar.png",
  },
  {
    thread: "expert2",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4D03AQGzNupeLUFAyw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1730153946491?e=2147483647&v=beta&t=IlTbPxy6bAEzcbG5Sz5Fi2AZEPHLeNh9o_QzsPKdP0M",
  },
  {
    thread: "expert3",
    avatar:
      "https://upload.wikimedia.org/wikipedia/commons/2/24/HANDSHAKE_-_BRATISLAVA_INFORMAL_PARLIAMENTARY_SUMMIT_2016-10-07_%2830166706905%29_%28cropped%29.jpg",
  },
];

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<ChatThreadId>("bot");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<
    Record<ChatThreadId, ChatMessage[]>
  >({
    bot: [
      {
        id: "welcome-bot",
        role: "bot",
        text: "¡Hola! Soy el asistente de Agro Control. Puedo ayudarte con la plataforma, sensores, reportes y configuración.",
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
    if (!value || isSending) return;

    const now = Date.now();
    const thread = selectedChat;
    const userMessage: ChatMessage = {
      id: `user-${thread}-${now}`,
      role: "user",
      text: value,
      timestamp: now,
    };

    const threadMessages = [...(messagesByThread[thread] ?? []), userMessage];

    setErrorMessage(null);
    setIsSending(true);
    setMessagesByThread((current) => ({
      ...current,
      [thread]: threadMessages,
    }));
    setDraft("");

    void generateGroqChatReply({
      thread,
      messages: threadMessages,
      profile: defaultProfile,
      settings: defaultSettings,
    })
      .then((replyText) => {
        const botMessage: ChatMessage = {
          id: `bot-${thread}-${now}`,
          role: "bot",
          text: replyText,
          timestamp: now + 1,
        };

        setMessagesByThread((current) => ({
          ...current,
          [thread]: [...(current[thread] ?? []), botMessage],
        }));
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "No fue posible conectar con Groq.";
        setErrorMessage(message);

        const botMessage: ChatMessage = {
          id: `bot-error-${thread}-${now}`,
          role: "bot",
          text: `No pude responder ahora mismo: ${message}`,
          timestamp: now + 1,
        };

        setMessagesByThread((current) => ({
          ...current,
          [thread]: [...(current[thread] ?? []), botMessage],
        }));
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <div className="grid xl:grid-cols-[240px_1fr] h-full">
      <PageSection
        title="Canal de comunicación"
        subtitle="Contactos disponibles"
        className="rounded-r-none h-full px-3"
      >
        <div className="space-y-2">
          {chatThreads.map(({ thread, avatar }) => (
            <button
              key={thread}
              type="button"
              onClick={() => setSelectedChat(thread)}
              className={`flex w-full items-center gap-3 rounded-[10px] border p-3 text-left ${selectedChat === thread ? "border-emerald-400/50 bg-emerald-500/30" : "border-white/6 bg-black/10"}`}
            >
              <div className="flex h-10 w-10 overflow-hidden rounded-full bg-white/5">
                <img
                  src={avatar}
                  alt={chatLabels[thread]}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {chatLabels[thread]}
                </div>
                <div className="text-xs text-white/70">{chatRoles[thread]}</div>
              </div>
            </button>
          ))}
        </div>
      </PageSection>

      <div className="h-full min-h-0">
        <PageSection
          title={
            selectedChat === "bot"
              ? "Asistente AgroControl"
              : chatLabels[selectedChat]
          }
          subtitle="Respuesta instantánea"
          className="rounded-l-none h-full px-3"
        >
          <div className="flex h-full flex-col gap-4">
            {errorMessage ? (
              <div className="rounded-[14px] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {errorMessage}
              </div>
            ) : null}

            <div className="basis-[70%] min-h-0 overflow-y-auto rounded-[14px] border border-white/8 bg-black/50 p-4 text-sm text-slate-300">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-[10px] px-4 py-3 ${message.role === "user" ? "border border-emerald-400/20 bg-emerald-500/10 text-white" : "border border-white/8 bg-white/[0.03] text-slate-300"}`}
                    >
                      <div>{message.text}</div>
                      <div className="mt-2 text-[10px] text-slate-500">
                        {formatShortTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                disabled={isSending}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSend();
                  }
                }}
              />
              <button
                className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
                type="button"
                onClick={handleSend}
                disabled={isSending || !draft.trim()}
              >
                {isSending ? "..." : <i className="fas fa-paper-plane" />}
              </button>
            </div>
          </div>
        </PageSection>
      </div>
    </div>
  );
}
