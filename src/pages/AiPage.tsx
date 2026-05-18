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

type ReportSections = {
  resultado: string;
  cultivo: string;
  problema: string;
  causa: string;
  confianza: string;
  resumen: string;
  porQueSucede: string;
  recomendaciones: string[];
  manejoSugerido: string;
  comoMejorarLaSalud: string;
  seguimiento: string;
  raw: string;
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

function downloadDiagnosisItem(item: ScanHistoryItem) {
  exportTextFile(
    `diagnostico-ia-${item.fileName}-${item.createdAt}.txt`,
    [
      'Diagnóstico IA - Agro Control',
      `Archivo: ${item.fileName}`,
      `Fecha: ${formatTime(item.createdAt)}`,
      '',
      item.resultText,
    ].join('\n'),
  );
}

function deleteDiagnosisItem(items: ScanHistoryItem[], id: string) {
  const nextItems = items.filter((item) => item.id !== id);
  writeHistory(nextItems);
  return nextItems;
}

function clearHistoryStorage() {
  writeJsonSafe(HISTORY_STORAGE_KEY, [] as ScanHistoryItem[]);
}

function parseReportSections(text: string): ReportSections {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sections: ReportSections = {
    resultado: '',
    cultivo: '',
    problema: '',
    causa: '',
    confianza: '',
    resumen: '',
    porQueSucede: '',
    recomendaciones: [],
    manejoSugerido: '',
    comoMejorarLaSalud: '',
    seguimiento: '',
    raw: text,
  };

  let current: keyof Omit<ReportSections, 'raw' | 'recomendaciones'> | 'recomendaciones' | null = null;

  const assign = (line: string) => {
    if (current === 'recomendaciones') {
      sections.recomendaciones.push(line.replace(/^[-•*]\s*/, ''));
      return;
    }

    if (!current) return;

    const value = line.replace(/^[^:]+:\s*/, '').trim();

    if (current === 'resultado') sections.resultado = value || line;
    if (current === 'cultivo') sections.cultivo = value || line;
    if (current === 'problema') sections.problema = value || line;
    if (current === 'causa') sections.causa = value || line;
    if (current === 'confianza') sections.confianza = value || line;
    if (current === 'resumen') sections.resumen = value || line;
    if (current === 'porQueSucede') sections.porQueSucede = value || line;
    if (current === 'manejoSugerido') sections.manejoSugerido = value || line;
    if (current === 'comoMejorarLaSalud') sections.comoMejorarLaSalud = value || line;
    if (current === 'seguimiento') sections.seguimiento = value || line;
  };

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.startsWith('resultado:')) {
      current = 'resultado';
      sections.resultado = line.replace(/^resultado:\s*/i, '').trim();
      continue;
    }

    if (lower.startsWith('cultivo probable:')) {
      current = 'cultivo';
      sections.cultivo = line.replace(/^cultivo probable:\s*/i, '').trim();
      continue;
    }

    if (lower.startsWith('problema probable:')) {
      current = 'problema';
      sections.problema = line.replace(/^problema probable:\s*/i, '').trim();
      continue;
    }

    if (lower.startsWith('causa probable:')) {
      current = 'causa';
      sections.causa = line.replace(/^causa probable:\s*/i, '').trim();
      continue;
    }

    if (lower.startsWith('confianza:')) {
      current = 'confianza';
      sections.confianza = line.replace(/^confianza:\s*/i, '').trim();
      continue;
    }

    if (lower.startsWith('resumen clínico:')) {
      current = 'resumen';
      sections.resumen = line.replace(/^resumen clínico:\s*/i, '').trim();
      continue;
    }

    if (lower.startsWith('por qué sucede:')) {
      current = 'porQueSucede';
      sections.porQueSucede = line.replace(/^por qué sucede:\s*/i, '').trim();
      continue;
    }

    if (lower.startsWith('recomendaciones:')) {
      current = 'recomendaciones';
      const rest = line.replace(/^recomendaciones:\s*/i, '').trim();
      if (rest) sections.recomendaciones.push(rest);
      continue;
    }

    if (lower.startsWith('manejo sugerido:')) {
      current = 'manejoSugerido';
      sections.manejoSugerido = line.replace(/^manejo sugerido:\s*/i, '').trim();
      continue;
    }

    if (lower.startsWith('cómo mejorar la salud:')) {
      current = 'comoMejorarLaSalud';
      sections.comoMejorarLaSalud = line.replace(/^cómo mejorar la salud:\s*/i, '').trim();
      continue;
    }

    if (lower.startsWith('seguimiento:')) {
      current = 'seguimiento';
      sections.seguimiento = line.replace(/^seguimiento:\s*/i, '').trim();
      continue;
    }

    assign(line);
  }

  if (!sections.resultado) sections.resultado = 'Resultado no especificado';
  if (!sections.cultivo) sections.cultivo = 'No identificado';
  if (!sections.problema) sections.problema = 'No identificado';
  if (!sections.causa) sections.causa = 'No identificada';
  if (!sections.confianza) sections.confianza = 'No disponible';
  if (!sections.resumen) sections.resumen = text;
  if (!sections.porQueSucede) sections.porQueSucede = 'Condiciones ambientales, manejo o sintomatología no suficientemente claras en la imagen.';
  if (!sections.recomendaciones.length) sections.recomendaciones = ['Revisar la imagen con otra toma más cercana y mejor luz.'];
  if (!sections.manejoSugerido) sections.manejoSugerido = 'Retirar tejido afectado, corregir humedad y reforzar ventilación y monitoreo.';
  if (!sections.comoMejorarLaSalud) sections.comoMejorarLaSalud = 'Aplicar manejo preventivo, nutrición equilibrada y seguimiento frecuente del cultivo.';
  if (!sections.seguimiento) sections.seguimiento = 'Monitorear evolución y repetir la toma en 24-48 horas si persisten los síntomas.';

  return sections;
}

export function AiPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PlantDiagnosisResult | null>(null);
  const [displayResult, setDisplayResult] = useState<PlantDiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => readHistory());
  const report = result ? parseReportSections(result.text) : null;

  useEffect(() => {
    if (isAnalyzing) return;
    setDisplayResult(result);
  }, [result, isAnalyzing]);

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
    setDisplayResult(null);
  };

  const analyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    setDisplayResult(null);

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
    setDisplayResult(null);
    setErrorMessage(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const clearHistory = () => {
    const confirmed = window.confirm('¿Deseas borrar todo el historial de análisis?');
    if (!confirmed) return;

    setHistory([]);
    clearHistoryStorage();
  };

  const removeHistoryItem = (id: string) => {
    const confirmed = window.confirm('¿Deseas borrar este análisis del historial?');
    if (!confirmed) return;

    setHistory((current) => deleteDiagnosisItem(current, id));
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

            <div className={`analysis-frame overflow-hidden rounded-[28px] border border-white/8 bg-[#27293d] ${isAnalyzing ? 'analysis-frame--active' : ''}`}>
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Vista previa del cultivo" className="max-h-[420px] w-full object-cover" />
                  {isAnalyzing ? (
                    <div className="analysis-overlay absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#0b1020]/92 via-[#0b1020]/45 to-transparent p-5">
                      <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                        <span className="relative flex h-2 w-2 items-center justify-center">
                          <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400/60" />
                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                        </span>
                        Analizando imagen
                      </div>
                      <div className="space-y-2">
                        <div className="analysis-line h-3 w-4/5 rounded-full bg-white/10" />
                        <div className="analysis-line h-3 w-3/5 rounded-full bg-white/10 [animation-delay:120ms]" />
                        <div className="analysis-line h-3 w-2/3 rounded-full bg-white/10 [animation-delay:240ms]" />
                        <div className="analysis-line h-3 w-1/2 rounded-full bg-white/10 [animation-delay:360ms]" />
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-300 analysis-progress" />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-[240px] items-center justify-center px-6 text-center text-sm text-slate-400">
                  Aún no has seleccionado una imagen.
                </div>
              )}
            </div>

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
              <div className="mt-1 text-xs text-slate-400">Reporte profesional estructurado</div>

              {report ? (
                <div className={`report-shell mt-4 space-y-3 ${displayResult ? 'report-shell--visible' : 'report-shell--hidden'}`}>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Resultado</div>
                    <div className="mt-2 text-xl font-semibold text-white">{report.resultado}</div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cultivo probable</div>
                      <div className="mt-2 text-sm text-slate-200">{report.cultivo}</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Problema probable</div>
                      <div className="mt-2 text-sm text-slate-200">{report.problema}</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4 sm:col-span-2">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Causa probable</div>
                      <div className="mt-2 text-sm text-slate-200">{report.causa}</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Confianza</div>
                      <div className="mt-2 text-sm text-slate-200">{report.confianza}</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Seguimiento</div>
                      <div className="mt-2 text-sm text-slate-200">{report.seguimiento}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Resumen clínico</div>
                    <div className="mt-2 text-sm leading-7 text-slate-200">{report.resumen}</div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Por qué sucede</div>
                      <div className="mt-2 text-sm leading-7 text-slate-200">{report.porQueSucede}</div>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Manejo sugerido</div>
                      <div className="mt-2 text-sm leading-7 text-slate-200">{report.manejoSugerido}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Recomendaciones</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {report.recomendaciones.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-300">{index + 1}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cómo mejorar la salud</div>
                    <div className="mt-2 text-sm leading-7 text-slate-200">{report.comoMejorarLaSalud}</div>
                  </div>
                </div>
              ) : (
                <div className="report-placeholder mt-4 min-h-[320px] rounded-3xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-slate-200 whitespace-pre-wrap">
                  {isAnalyzing ? 'Generando informe técnico...' : 'Aquí aparecerá el informe de diagnóstico una vez analices la imagen.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection title="Historial de análisis" subtitle="Últimos resultados guardados">
        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" onClick={clearHistory} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/8" disabled={!history.length}>
            Borrar historial
          </button>
        </div>

        {history.length ? (
          <div className="space-y-3 text-sm text-slate-300">
            {history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/6 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-white">{item.fileName}</div>
                  <div className="text-xs text-slate-500">{formatTime(item.createdAt)}</div>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-slate-300">{item.resultText}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => downloadDiagnosisItem(item)} className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15">
                    Descargar informe
                  </button>
                  <button type="button" onClick={() => removeHistoryItem(item.id)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/8">
                    Borrar
                  </button>
                </div>
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
