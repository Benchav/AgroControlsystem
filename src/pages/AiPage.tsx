import { useEffect, useRef, useState } from 'react';
import { PageSection } from '../components/layout/PageSection';
import { analyzePlantImage, type PlantDiagnosisResult } from '../services/geminiDiagnosis';
import { readJsonSafe, writeJsonSafe } from '../utils/storage';

type ScanHistoryItem = {
  id: string;
  fileName: string;
  resultText: string;
  createdAt: number;
};

const HISTORY_STORAGE_KEY = 'agro_ai_diagnosis_history';

function readHistory() {
  return readJsonSafe(HISTORY_STORAGE_KEY, [] as ScanHistoryItem[]);
}

function writeHistory(items: ScanHistoryItem[]) {
  writeJsonSafe(HISTORY_STORAGE_KEY, items.slice(0, 6));
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString('es', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function exportTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AiPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PlantDiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => readHistory());

  useEffect(() => {
    writeHistory(history);
  }, [history]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Selecciona una imagen válida.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setErrorMessage(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const analyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const diagnosis = await analyzePlantImage(selectedFile);
      setResult(diagnosis);

      const createdAt = Date.now();
      setHistory((current) => [
        {
          id: `${selectedFile.name}-${createdAt}`,
          fileName: selectedFile.name,
          resultText: diagnosis.text,
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

  const clearAnalysis = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMessage(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const exportReport = () => {
    if (!result) return;

    exportTextFile(
      `diagnostico-ia-${Date.now()}.txt`,
      [
        'Diagnóstico IA - Agro Control',
        `Archivo: ${selectedFile?.name ?? 'imagen'}`,
        `Modelo: ${result.model}`,
        `Clave usada: ${result.keyUsed}`,
        '',
        result.text,
        '',
        'Historial reciente:',
        ...history.slice(0, 3).map((item) => `- ${item.fileName}: ${item.resultText}`),
      ].join('\n'),
    );
  };

  return (
    <div className="space-y-4">
      <PageSection title="Diagnóstico visual Gemini 2.5 Flash" subtitle="Sube una imagen o toma una foto y obtén el informe en texto">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-dashed border-emerald-400/20 bg-emerald-500/5 p-6">
              <div className="text-sm text-slate-400">Analiza enfermedades de plantas con Gemini</div>
              <div className="mt-2 text-2xl font-semibold text-white">Carga una foto o toma una imagen desde tu dispositivo</div>
              <div className="mt-2 text-sm text-slate-400">El informe se mostrará aquí mismo, en texto, dentro de esta misma pantalla.</div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing}>
                  Subir imagen
                </button>
                <button type="button" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/20 hover:bg-emerald-500/5 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => cameraInputRef.current?.click()} disabled={isAnalyzing}>
                  Tomar foto
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
            </div>

            {previewUrl ? (
              <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[#27293d]">
                <img src={previewUrl} alt="Vista previa del cultivo" className="max-h-[420px] w-full object-cover" />
              </div>
            ) : null}

            <div className="flex gap-2">
              <button type="button" onClick={analyze} disabled={!selectedFile || isAnalyzing} className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60">
                {isAnalyzing ? 'Analizando...' : 'Analizar enfermedad'}
              </button>
              <button type="button" onClick={clearAnalysis} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/8">
                Limpiar
              </button>
              <button type="button" onClick={exportReport} disabled={!result} className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60">
                Descargar informe
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {errorMessage ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {errorMessage}
              </div>
            ) : null}

            <div className="rounded-[28px] border border-white/8 bg-[#27293d] p-5">
              <div className="text-sm font-semibold text-white">Informe Gemini</div>
              <div className="mt-1 text-xs text-slate-400">Respuesta en texto directo</div>
              <div className="mt-4 min-h-[320px] rounded-3xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-slate-200 whitespace-pre-wrap">
                {result ? result.text : 'Aquí aparecerá el informe de diagnóstico una vez analices la imagen.'}
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection title="Historial de análisis" subtitle="Últimos resultados guardados">
        {history.length ? (
          <div className="space-y-3 text-sm text-slate-300">
            {history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/6 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-white">{item.fileName}</div>
                  <div className="text-xs text-slate-500">{formatTime(item.createdAt)}</div>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-slate-300">{item.resultText}</div>
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
  );
}
