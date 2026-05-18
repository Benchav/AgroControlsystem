import type { ChatMessage, ChatThreadId, SystemSettings, UserProfile } from '../types/app';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_MAX_COMPLETION_TOKENS = 512;
const DEFAULT_TEMPERATURE = 0.15;
const RECENT_MESSAGE_LIMIT = 8;

const threadContext: Record<ChatThreadId, { title: string; specialization: string }> = {
  bot: {
    title: 'Asistente AgroControl',
    specialization: 'Soporte general de la plataforma Agro Control, navegación, módulos, datos, sensores, reportes y configuración.',
  },
  expert1: {
    title: 'María Campos',
    specialization: 'Cultivos, sanidad vegetal y recomendaciones agronómicas ligadas a las funcionalidades de la plataforma.',
  },
  expert2: {
    title: 'Jorge Méndez',
    specialization: 'Suelos, fertilización, umbrales y lectura operativa de sensores dentro de Agro Control.',
  },
  expert3: {
    title: 'Ana López',
    specialization: 'Plagas, diagnóstico preventivo y uso de los módulos de análisis e información del sistema.',
  },
};

type GroqChatInput = {
  thread: ChatThreadId;
  messages: ChatMessage[];
  profile: UserProfile;
  settings: SystemSettings;
};

type GroqChoice = {
  message?: {
    content?: string | null;
  };
};

type GroqErrorResponse = {
  error?: {
    message?: string;
  };
  choices?: GroqChoice[];
};

function readEnvNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getGroqConfig() {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Falta VITE_GROQ_API_KEY en el archivo .env.');
  }

  return {
    apiKey,
    model: import.meta.env.VITE_GROQ_MODEL?.trim() || DEFAULT_MODEL,
    maxCompletionTokens: readEnvNumber(import.meta.env.VITE_GROQ_MAX_COMPLETION_TOKENS, DEFAULT_MAX_COMPLETION_TOKENS),
    temperature: readEnvNumber(import.meta.env.VITE_GROQ_TEMPERATURE, DEFAULT_TEMPERATURE),
  };
}

function toApiMessages(messages: ChatMessage[]) {
  return messages.slice(-RECENT_MESSAGE_LIMIT).map((message) => ({
    role: message.role === 'user' ? 'user' : 'assistant',
    content: message.text,
  }));
}

function buildSystemPrompt(thread: ChatThreadId, profile: UserProfile, settings: SystemSettings) {
  const context = threadContext[thread];

  return [
    'Eres un asistente senior integrado en la plataforma Agro Control.',
    'Responde siempre en español, con tono claro, preciso y orientado a producto.',
    'Solo debes responder preguntas relacionadas con esta plataforma: dashboard, IoT, IA, chat, mapa, marketplace, modelos 3D, reportes, configuración, usuarios y uso operativo.',
    'Si la consulta no tiene relación con el proyecto, redirige educadamente la conversación hacia Agro Control y ofrece ayuda con la plataforma.',
    'No inventes endpoints, módulos o funciones que no estén respaldados por el código visible en la aplicación.',
    'Si falta contexto, explica qué archivo, módulo o parte de la UI conviene revisar.',
    'Responde de forma breve: idealmente entre 2 y 4 frases cortas o hasta 3 viñetas.',
    'Evita introducciones largas, repeticiones y explicaciones extensas; prioriza la claridad y la acción.',
    'Si la respuesta puede ser directa, usa una sola frase.',
    '',
    `Hilo activo: ${context.title}.`,
    `Especialidad del hilo: ${context.specialization}.`,
    `Usuario activo: ${profile.name} (${profile.org}) <${profile.email}>.`,
    `Umbrales de sistema: humedad ${settings.humidityThreshold}%, temperatura ${settings.temperatureThreshold}°C, pH ${settings.phThreshold}.`,
    'Prioriza respuestas útiles, accionables y breves, pero da el detalle necesario cuando se trate de configuración o flujo del producto.',
  ].join('\n');
}

async function readGroqErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as GroqErrorResponse;
    if (typeof payload.error?.message === 'string' && payload.error.message.trim()) {
      return payload.error.message.trim();
    }
  } catch {
    // Ignore JSON parsing errors and fall back to raw text.
  }

  try {
    const text = await response.text();
    if (text.trim()) {
      return text.trim();
    }
  } catch {
    // Ignore body read failures.
  }

  return `Groq respondió con estado ${response.status}.`;
}

export async function generateGroqChatReply(input: GroqChatInput) {
  const config = getGroqConfig();

  const response = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(input.thread, input.profile, input.settings),
        },
        ...toApiMessages(input.messages),
      ],
      temperature: config.temperature,
      max_completion_tokens: config.maxCompletionTokens,
      top_p: 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(await readGroqErrorMessage(response));
  }

  const payload = (await response.json()) as GroqErrorResponse;
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('La respuesta de Groq llegó vacía.');
  }

  return content;
}