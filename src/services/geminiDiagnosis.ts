const DEFAULT_MODEL = 'gemini-2.5-flash';
const RECENT_API_KEY_INDEX_STORAGE = 'agro_gemini_api_key_index';

export type PlantDiagnosisSeverity = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export type PlantDiagnosisResult = {
  model: string;
  plant: string;
  disease: string;
  confidence: number;
  severity: PlantDiagnosisSeverity;
  summary: string;
  recommendations: string[];
  notes: string;
  rawText: string;
  keyUsed: number;
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

type RetryableError = Error & {
  retryable?: boolean;
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

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        // Continue to relaxed parsing below.
      }
    }

    const relaxed = candidate
      .replace(/\r?\n/g, ' ')
      .replace(/([,{\s])(\w+)\s*:/g, '$1"$2":')
      .replace(/'/g, '"');

    try {
      return JSON.parse(relaxed) as Record<string, unknown>;
    } catch {
      throw new Error('Gemini no devolvió JSON válido.');
    }
  }
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

function normalizeSeverity(value: unknown): PlantDiagnosisSeverity {
  const text = asString(value, 'Media').toLowerCase();

  if (text.includes('crit')) return 'Crítica';
  if (text.includes('alta') || text.includes('severa')) return 'Alta';
  if (text.includes('baja') || text.includes('leve')) return 'Baja';
  return 'Media';
}

function buildPrompt() {
  return [
    'Eres un experto en fitopatología y diagnóstico visual de plantas.',
    'Analiza la imagen adjunta y responde SOLO con JSON válido, sin texto extra ni markdown.',
    'No uses bloques ``` ni explicación adicional.',
    'El JSON debe tener esta forma exacta:',
    '{',
    '  "plant": "nombre de la planta o cultivo",',
    '  "disease": "tipo de enfermedad o plaga detectada",',
    '  "confidence": 0,',
    '  "severity": "Baja|Media|Alta|Crítica",',
    '  "summary": "resumen corto en español",',
    '  "recommendations": ["accion 1", "accion 2"],',
    '  "notes": "observaciones adicionales"',
    '}',
    'Si la imagen no es suficiente, indica enfermedad como "Imagen insuficiente" y baja confianza.',
    'Mantén las recomendaciones prácticas, breves y orientadas a campo.',
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
          responseMimeType: 'application/json',
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

  const dataJson = extractJson(text);

  return {
    model,
    keyUsed,
    plant: asString(dataJson.plant, 'Cultivo no identificado'),
    disease: asString(dataJson.disease, 'Diagnóstico no disponible'),
    confidence: Math.max(0, Math.min(100, asNumber(dataJson.confidence, 0))),
    severity: normalizeSeverity(dataJson.severity),
    summary: asString(dataJson.summary, text),
    recommendations: asStringArray(dataJson.recommendations),
    notes: asString(dataJson.notes, ''),
    rawText: text,
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
