const DEFAULT_MODEL = 'gemini-2.5-flash';
const RECENT_API_KEY_INDEX_STORAGE = 'agro_gemini_api_key_index';

type RetryableError = Error & {
  retryable?: boolean;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export type PlantDiagnosisResult = {
  model: string;
  text: string;
  keyUsed: number;
};

function getGeminiApiKeys() {
  const keys = [
    import.meta.env.VITE_GEMINI_API_KEY_1,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3,
    import.meta.env.VITE_GEMINI_API_KEY_4,
    import.meta.env.VITE_GEMINI_API_KEY_5,
  ]
    .map((key) => key?.trim())
    .filter((key): key is string => Boolean(key));

  if (!keys.length) {
    throw new Error('Faltan las claves de Gemini en el archivo .env.');
  }

  return keys;
}

function getModel() {
  return import.meta.env.VITE_GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function readStoredKeyIndex(max: number) {
  try {
    const raw = localStorage.getItem(RECENT_API_KEY_INDEX_STORAGE);
    const parsed = Number.parseInt(raw ?? '', 10);
    if (!Number.isFinite(parsed)) return 0;
    return ((parsed % max) + max) % max;
  } catch {
    return 0;
  }
}

function writeStoredKeyIndex(index: number) {
  try {
    localStorage.setItem(RECENT_API_KEY_INDEX_STORAGE, String(index));
  } catch {
    // Ignore storage failures.
  }
}

function fileToBase64(file: File) {
  return new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('No fue posible leer la imagen seleccionada.'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('La imagen no pudo convertirse a base64.'));
        return;
      }

      const base64 = result.includes(',') ? result.split(',')[1] ?? '' : result;
      resolve({
        mimeType: file.type || 'image/jpeg',
        data: base64,
      });
    };

    reader.readAsDataURL(file);
  });
}

function buildPrompt() {
  return [
    'Eres un especialista en fitopatología y diagnóstico visual de plantas.',
    'Analiza la imagen y responde en español con formato profesional, claro y compuesto.',
    'No uses JSON, no uses markdown y no uses bloques de código.',
    'Usa exactamente estas secciones con estos títulos, una por línea:',
    'Resultado:',
    'Cultivo probable:',
    'Problema probable:',
    'Causa probable:',
    'Confianza:',
    'Resumen clínico:',
    'Por qué sucede:',
    'Recomendaciones:',
    'Manejo sugerido:',
    'Cómo mejorar la salud:',
    'Seguimiento:',
    'Si la imagen no alcanza para determinarlo, dilo explícitamente y da una guía de nueva toma.',
    'Menciona el nombre científico cuando sea pertinente.',
    'Explica causas típicas como humedad, ventilación, nutrición, estrés hídrico o infecciones.',
    'Incluye acciones preventivas y correctivas realistas.',
    'Mantén cada sección profesional, concreta y orientada a campo.',
  ].join('\n');
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as GeminiResponse;
    if (typeof payload.error?.message === 'string' && payload.error.message.trim()) {
      return payload.error.message.trim();
    }
  } catch {
    // Fall back to raw text.
  }

  try {
    const text = await response.text();
    if (text.trim()) return text.trim();
  } catch {
    // Ignore read failures.
  }

  return `Gemini respondió con estado ${response.status}.`;
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 500 || status === 503;
}

function createRetryableError(message: string, retryable: boolean) {
  const error = new Error(message) as RetryableError;
  error.retryable = retryable;
  return error;
}

async function analyzeWithKey(file: File, apiKey: string, keyUsed: number) {
  const model = getModel();
  const { mimeType, data } = await fileToBase64(file);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: buildPrompt() },
              {
                inlineData: {
                  mimeType,
                  data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 1,
          maxOutputTokens: 512,
        },
      }),
    },
  );

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw createRetryableError(message, isRetryableStatus(response.status) || /quota|limit|rate|exceed|key/i.test(message));
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();

  if (!text) {
    throw createRetryableError('Gemini respondió vacío.', true);
  }

  return {
    model,
    keyUsed,
    text,
  } satisfies PlantDiagnosisResult;
}

export async function analyzePlantImage(file: File): Promise<PlantDiagnosisResult> {
  const apiKeys = getGeminiApiKeys();
  const startIndex = readStoredKeyIndex(apiKeys.length);
  let lastError: Error | null = null;

  for (let offset = 0; offset < apiKeys.length; offset += 1) {
    const keyIndex = (startIndex + offset) % apiKeys.length;
    const apiKey = apiKeys[keyIndex];

    try {
      const result = await analyzeWithKey(file, apiKey, keyIndex + 1);
      writeStoredKeyIndex((keyIndex + 1) % apiKeys.length);
      return result;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('No fue posible analizar la imagen.');
      lastError = normalizedError;

      if (!('retryable' in normalizedError) || !(normalizedError as RetryableError).retryable) {
        throw normalizedError;
      }
    }
  }

  throw lastError ?? new Error('No fue posible analizar la imagen con las claves disponibles.');
}
