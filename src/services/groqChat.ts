import type { ChatMessage, ChatThreadId, SystemSettings, UserProfile } from '../types/app';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';
const DEFAULT_MAX_COMPLETION_TOKENS = 250;
const DEFAULT_TEMPERATURE = 0.25;
const RECENT_MESSAGE_LIMIT = 4;

const threadContext: Record<ChatThreadId, { title: string; specialization: string }> = {
  bot: {
    title: 'Asistente AgroControl',
    specialization: 'soporte general de la plataforma, navegación, módulos, sensores y reportes',
  },
  expert1: {
    title: 'María Campos',
    specialization: 'cultivos, sanidad vegetal y recomendaciones agronómicas de la plataforma',
  },
  expert2: {
    title: 'Jorge Méndez',
    specialization: 'suelos, fertilización, umbrales y sensores de Agro Control',
  },
  expert3: {
    title: 'Ana López',
    specialization: 'plagas, diagnóstico preventivo y análisis fitosanitario',
  },
};

const RECENT_GROQ_API_KEY_INDEX_STORAGE = 'agro_groq_api_key_index';

type RetryableError = Error & {
  retryable?: boolean;
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
    type?: string;
    code?: string;
  };
  choices?: GroqChoice[];
};

function readEnvNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getGroqApiKeys(): string[] {
  const envKeys = [
    import.meta.env.VITE_GROQ_API_KEY,
    import.meta.env.VITE_GROQ_API_KEY_1,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3,
    import.meta.env.VITE_GROQ_API_KEY_4,
    import.meta.env.VITE_GROQ_API_KEY_5,
  ];

  const keys: string[] = [];
  for (const k of envKeys) {
    const trimmed = k?.trim();
    if (trimmed && !keys.includes(trimmed)) {
      keys.push(trimmed);
    }
  }

  if (!keys.length) {
    throw new Error('Faltan las claves de Groq (VITE_GROQ_API_KEY_1, etc.) en el archivo .env.');
  }

  return keys;
}

function readStoredKeyIndex(max: number): number {
  try {
    const raw = localStorage.getItem(RECENT_GROQ_API_KEY_INDEX_STORAGE);
    const parsed = Number.parseInt(raw ?? '', 10);
    if (!Number.isFinite(parsed)) return 0;
    return ((parsed % max) + max) % max;
  } catch {
    return 0;
  }
}

function writeStoredKeyIndex(index: number): void {
  try {
    localStorage.setItem(RECENT_GROQ_API_KEY_INDEX_STORAGE, String(index));
  } catch {
    // Ignore storage failures.
  }
}

function getGroqConfig() {
  return {
    model: import.meta.env.VITE_GROQ_MODEL?.trim() || DEFAULT_MODEL,
    maxCompletionTokens: readEnvNumber(import.meta.env.VITE_GROQ_MAX_COMPLETION_TOKENS, DEFAULT_MAX_COMPLETION_TOKENS),
    temperature: readEnvNumber(import.meta.env.VITE_GROQ_TEMPERATURE, DEFAULT_TEMPERATURE),
  };
}

function isRetryableGroqStatus(status: number): boolean {
  // 401 = Llave inválida o expirada -> reintentar con otra
  // 402 = Pago requerido / Crédito agotado
  // 403 = Prohibido o cuota excedida
  // 429 = Límite de tasa (Rate limit / Tokens per minute)
  // 500, 502, 503, 504 = Caída temporal de Groq
  return [401, 402, 403, 429, 500, 502, 503, 504].includes(status);
}

function isRetryableGroqMessage(message: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('credit') ||
    msg.includes('balance') ||
    msg.includes('exceeded') ||
    msg.includes('too many') ||
    msg.includes('unauthorized') ||
    msg.includes('invalid_api_key') ||
    msg.includes('invalid api key') ||
    msg.includes('deactivated') ||
    msg.includes('tokens per minute') ||
    msg.includes('requests per minute') ||
    msg.includes('capacity') ||
    msg.includes('overloaded')
  );
}

function createRetryableError(message: string, retryable: boolean): RetryableError {
  const error = new Error(message) as RetryableError;
  error.retryable = retryable;
  return error;
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
    `Eres ${context.title}, especialista en ${context.specialization} de la plataforma Agro Control.`,
    'Responde siempre en español con tono natural, cercano, profesional y directo (máximo 2 a 3 oraciones completas).',
    'Ve directo a la solución o explicación técnica; no uses saludos largos, introducciones repetitivas ni despedidas de relleno.',
    `Usuario/Finca: ${profile.name} (${profile.org}).`,
    `Umbrales del sistema: Humedad ${settings.humidityThreshold}%, Temperatura ${settings.temperatureThreshold}°C, pH ${settings.phThreshold}.`,
    'Si la duda no corresponde a la plataforma o temas agrícolas, redirige con amabilidad en una sola frase.',
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

const FALLBACK_MODEL = 'openai/gpt-oss-20b';

async function requestGroqChat(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  maxCompletionTokens: number
): Promise<string> {
  const modelsToTry = [model];
  if (model !== FALLBACK_MODEL) {
    modelsToTry.push(FALLBACK_MODEL);
  }

  let lastResponseError = '';
  let lastStatus = 0;

  for (const currentModel of modelsToTry) {
    const response = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: currentModel,
        messages,
        temperature,
        max_completion_tokens: maxCompletionTokens,
        top_p: 1,
        stream: false,
      }),
    });

    if (response.ok) {
      const payload = (await response.json()) as GroqErrorResponse;
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw createRetryableError('La respuesta de Groq llegó vacía.', true);
      }
      return content;
    }

    const message = await readGroqErrorMessage(response);
    lastResponseError = message;
    lastStatus = response.status;

    // Si el modelo preferido (ej. Llama) no está autorizado o no existe en la cuenta
    const isModelUnavailable =
      response.status === 404 ||
      /model_not_found|does not exist|do not have access|decommissioned/i.test(message);

    if (isModelUnavailable && currentModel !== FALLBACK_MODEL) {
      console.warn(
        `[GroqChat] El modelo "${currentModel}" no está habilitado en tu cuenta de Groq. Conmutando automáticamente a "${FALLBACK_MODEL}" de respaldo...`
      );
      continue;
    }

    // Si es error de cuota/créditos/rate limit, lanzamos retryable para rotar de API Key
    const retryable = isRetryableGroqStatus(response.status) || isRetryableGroqMessage(message);
    throw createRetryableError(message, retryable);
  }

  throw createRetryableError(
    lastResponseError || 'Error al procesar la solicitud con los modelos disponibles.',
    isRetryableGroqStatus(lastStatus) || isRetryableGroqMessage(lastResponseError)
  );
}

export async function generateGroqChatReply(input: GroqChatInput): Promise<string> {
  const config = getGroqConfig();
  const apiKeys = getGroqApiKeys();
  const startIndex = readStoredKeyIndex(apiKeys.length);
  let lastError: Error | null = null;

  const messagesPayload = [
    {
      role: 'system',
      content: buildSystemPrompt(input.thread, input.profile, input.settings),
    },
    ...toApiMessages(input.messages),
  ];

  for (let offset = 0; offset < apiKeys.length; offset += 1) {
    const keyIndex = (startIndex + offset) % apiKeys.length;
    const currentKey = apiKeys[keyIndex];

    try {
      const content = await requestGroqChat(
        currentKey,
        config.model,
        messagesPayload,
        config.temperature,
        config.maxCompletionTokens
      );

      // Guardamos la siguiente clave para el próximo mensaje (round-robin rotativo)
      writeStoredKeyIndex((keyIndex + 1) % apiKeys.length);
      return content;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('No fue posible conectar con Groq.');
      lastError = normalizedError;

      // Si el error no es recuperable (ej. formato inválido), no reintentar
      if (!('retryable' in normalizedError) || !(normalizedError as RetryableError).retryable) {
        throw normalizedError;
      }

      console.warn(
        `[GroqChat] Clave ${keyIndex + 1}/${apiKeys.length} falló (${normalizedError.message}). Rotando a la siguiente clave...`
      );
    }
  }

  throw lastError ?? new Error('Todas las claves de Groq configuradas han fallado o agotado sus créditos.');
}