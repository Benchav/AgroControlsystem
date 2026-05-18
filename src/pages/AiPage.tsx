import { useEffect, useMemo, useRef, useState } from 'react';
import { PageSection } from '../components/layout/PageSection';
import { analyzePlantImage, type PlantDiagnosisResult } from '../services/geminiDiagnosis';
import { readJsonSafe, writeJsonSafe } from '../utils/storage';

function confidenceTone(confidence: number) {
  if (confidence >= 80) return 'text-emerald-300';
  if (confidence >= 55) return 'text-amber-300';
  return 'text-red-300';
}

function severityTone(severity: PlantDiagnosisResult['severity']) {
  switch (severity) {
    case 'Crítica':
      return 'border-red-400/20 bg-red-500/10 text-red-300';
    case 'Alta':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-300';
    case 'Media':
      return 'border-sky-400/20 bg-sky-500/10 text-sky-300';
    case 'Baja':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300';
  }
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString('es', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

type ScanHistoryItem = {
  id: string;
  fileName: string;
  result: PlantDiagnosisResult;
  createdAt: number;
};

const HISTORY_STORAGE_KEY = 'agro_ai_diagnosis_history';
const ACTIVE_RESULT_STORAGE_KEY = 'agro_ai_diagnosis_active_result';

function readHistory() {
  return readJsonSafe(HISTORY_STORAGE_KEY, [] as ScanHistoryItem[]);
}

function writeHistory(items: ScanHistoryItem[]) {
  writeJsonSafe(HISTORY_STORAGE_KEY, items.slice(0, 6));
}

function readActiveResult() {
  return readJsonSafe<PlantDiagnosisResult | null>(ACTIVE_RESULT_STORAGE_KEY, null);
}

function writeActiveResult(result: PlantDiagnosisResult | null) {
  writeJsonSafe(ACTIVE_RESULT_STORAGE_KEY, result);
}

export function AiPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantDiagnosisResult | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => readHistory());
  const [savedResult, setSavedResult] = useState<PlantDiagnosisResult | null>(() => readActiveResult());

  useEffect(() => {
    writeHistory(history);
  }, [history]);

  useEffect(() => {
    writeActiveResult(savedResult);
  }, [savedResult]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const hasSelectedImage = Boolean(selectedFile && previewUrl);

  const handleFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Selecciona una imagen válida.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setErrorMessage(null);
    setSelectedFile(file);
    setResult(savedResult);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const analyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const diagnosis = await analyzePlantImage(selectedFile);
      setResult(diagnosis);
      setSavedResult(diagnosis);

      const createdAt = Date.now();
      setHistory((current) => [
        {
          id: `${selectedFile.name}-${createdAt}`,
          fileName: selectedFile.name,
          result: diagnosis,
          createdAt,
        },
        ...current,
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible analizar la imagen.';
      setErrorMessage(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const actions = useMemo(() => {
    if (!result) return [];

    return result.recommendations.length ? result.recommendations : ['Revisar la imagen con otra toma más cercana y mejor luz.'];
  }, [result]);

  const exportReport = () => {
    if (!result) return;

    const payload = {
      generatedAt: new Date().toISOString(),
      fileName: selectedFile?.name ?? 'imagen-planta',
      diagnosis: result,
      history,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `diagnostico-ia-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const clearAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setResult(null);
    setSavedResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-[28px] border border-dashed border-emerald-400/20 bg-emerald-500/5 p-6">
          <div className="text-sm text-slate-400">Diagnóstico visual Gemini 2.5 Flash</div>
          <div className="mt-2 text-2xl font-semibold text-white">Detecta enfermedades de plantas desde una imagen</div>
          <div className="mt-2 text-sm text-slate-400">Sube una foto o toma una foto en el dispositivo para iniciar el análisis.</div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              Subir imagen
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/20 hover:bg-emerald-500/5 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              Tomar foto
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Persistencia local</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Export JSON</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Rotación multi-key</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <PageSection title="Vista previa" subtitle={hasSelectedImage ? selectedFile?.name ?? '' : 'Sin imagen cargada'}>
          {previewUrl ? (
            <div className="space-y-4">
              <img src={previewUrl} alt="Vista previa del cultivo" className="max-h-[340px] w-full rounded-3xl border border-white/8 object-cover" />
              <button
                type="button"
                onClick={analyze}
                disabled={!selectedFile || isAnalyzing}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? 'Analizando...' : 'Analizar enfermedad'}
              </button>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={clearAnalysis}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/8"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={exportReport}
                  disabled={!result}
                  className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Descargar informe
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/8 bg-black/20 p-6 text-sm text-slate-400">
              Aún no has seleccionado una imagen.
            </div>
          )}
        </PageSection>

        {errorMessage ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <PageSection title="Diagnóstico detectado" subtitle="Respuesta de Gemini">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-3xl">🌿</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{result.plant}</div>
                  <div className="mt-1 text-xs text-slate-400">{result.model}</div>
                  <div className="mt-2 text-lg font-semibold text-red-300">{result.disease}</div>
                  <div className="mt-1 text-xs text-slate-400">Confianza {result.confidence}%</div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/6">
                    <div className={`h-1.5 rounded-full ${confidenceTone(result.confidence)}`} style={{ width: `${Math.max(12, result.confidence)}%` }} />
                  </div>
                  <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${severityTone(result.severity)}`}>
                    Severidad {result.severity}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
                {result.summary}
              </div>

              {result.notes ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-300">
                  <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Observaciones</div>
                  {result.notes}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/8 bg-black/20 p-6 text-sm text-slate-400">
              Aquí aparecerá el diagnóstico generado por Gemini.
            </div>
          )}
        </PageSection>

        <PageSection title="Plan de acción" subtitle="Recomendaciones del modelo">
          <ul className="space-y-3 text-sm text-slate-300">
            {actions.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-2xl border border-white/6 bg-black/20 p-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-300">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </PageSection>

        <PageSection title="Historial de análisis" subtitle="Últimos escaneos">
          {history.length ? (
            <div className="space-y-3 text-sm text-slate-300">
              {history.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/6 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-white">{item.result.disease}</div>
                    <div className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severityTone(item.result.severity)}`}>
                      {item.result.severity}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{item.fileName}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatTime(item.createdAt)}</div>
                  <div className="mt-2 text-xs text-slate-400">{item.result.summary}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/8 bg-black/20 p-6 text-sm text-slate-400">
              No hay análisis previos.
            </div>
          )}
        </PageSection>
      </div>
    </div>
  );
}
