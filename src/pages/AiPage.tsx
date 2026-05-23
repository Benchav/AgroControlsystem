import { useEffect, useRef, useState } from "react";
import { PageSection } from "../components/layout/PageSection";
import {
  analyzePlantImage,
  type PlantDiagnosisResult,
} from "../services/geminiDiagnosis";
import {
  clearHistoryStorage,
  deleteDiagnosisItem,
  downloadDiagnosisItem,
  exportTextFile,
  parseReportSections,
  readHistory,
  ScanHistoryItem,
  writeHistory,
} from "../types/ai";
import { formatLongTime } from "../utils/formatTime";

export function AiPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PlantDiagnosisResult | null>(null);
  const [displayResult, setDisplayResult] =
    useState<PlantDiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>(() =>
    readHistory(),
  );
  const report = result ? parseReportSections(result.text) : null;

  useEffect(() => {
    if (isAnalyzing) return;
    setDisplayResult(result);
  }, [result, isAnalyzing]);

  useEffect(() => {
    writeHistory(history);
  }, [history]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 800);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredHistory = history.filter((item) =>
    item.fileName.toLowerCase().includes(debouncedSearch),
  );

  const handleFile = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Selecciona una imagen válida.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setResult(null);
    setDisplayResult(null);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };

    reader.readAsDataURL(file);
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
          imageUrl: previewUrl ?? "",
        },
        ...current,
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible analizar la imagen.";
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

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const clearHistory = () => {
    const confirmed = window.confirm(
      "¿Deseas borrar todo el historial de análisis?",
    );
    if (!confirmed) return;

    setHistory([]);
    clearHistoryStorage();
  };

  const removeHistoryItem = (id: string) => {
    const confirmed = window.confirm(
      "¿Deseas borrar este análisis del historial?",
    );
    if (!confirmed) return;

    setHistory((current) => deleteDiagnosisItem(current, id));
  };

  const exportReport = () => {
    if (!result) return;

    exportTextFile(
      `diagnostico-ia-${Date.now()}.txt`,
      [
        "Diagnóstico IA - Agro Control",
        `Archivo: ${selectedFile?.name ?? "imagen"}`,
        `Modelo: ${result.model}`,
        `Clave usada: ${result.keyUsed}`,
        "",
        result.text,
        "",
        "Historial reciente:",
        ...history
          .slice(0, 3)
          .map((item) => `- ${item.fileName}: ${item.resultText}`),
      ].join("\n"),
    );
  };

  return (
    <div className="space-y-4">
      <PageSection
        title="Diagnóstico visual Gemini 2.5 Flash"
        subtitle="Sube una imagen o toma una foto y obtén el informe en texto"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="rounded-[14px] border border-dashed border-emerald-400 bg-black/50 p-6">
              <div className="text-sm text-white/80">
                Analiza enfermedades de plantas con Gemini
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">
                Carga una foto o toma una imagen desde tu dispositivo
              </div>
              <div className="mt-2 text-sm text-white/70">
                El informe se mostrará aquí mismo, en texto, dentro de esta
                misma pantalla.
              </div>

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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  handleFile(event.target.files?.[0] ?? null)
                }
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) =>
                  handleFile(event.target.files?.[0] ?? null)
                }
              />
            </div>

            <div
              className={`analysis-frame overflow-hidden rounded-[14px] border border-white/50 bg-black/60 backdrop-blur ${isAnalyzing ? "analysis-frame--active" : ""}`}
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Vista previa del cultivo"
                    className="max-h-[420px] w-full object-cover"
                  />
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
                <div className="flex h-[240px] items-center justify-center text-center text-sm text-white ">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/60/No-Image-Placeholder-banner.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
                    alt="upload image"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={analyze}
                disabled={!selectedFile || isAnalyzing}
                className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? "Analizando..." : "Analizar enfermedad"}
              </button>
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

          <div className="space-y-4">
            {errorMessage ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {errorMessage}
              </div>
            ) : null}

            <div className="h-full rounded-[14px] border border-black/40 bg-black/60 backdrop-blur overflow-hidden">
              <div className="p-5">
                <div className="text-sm font-semibold text-white">
                  Resultado del análisis con Gemini
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Reporte profesional estructurado
                </div>
              </div>

              {report ? (
                <div
                  className={`report-shell mt-4 p-5 space-y-3 ${displayResult ? "report-shell--visible" : "report-shell--hidden"}`}
                >
                  <div className="rounded-[14px] border border-black/50 bg-black/50 p-4 flex flex-col gap-2">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      ✔️ Tipo de Resultado:
                    </div>
                    <div className="mt-2 text-sm  text-white">
                      {report.resultado}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      ✔️ Cultivo probable:
                    </div>
                    <div className="mt-2 text-sm text-white">
                      {report.cultivo}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      ✔️ Problema probable
                    </div>
                    <div className="mt-2 text-sm text-white">
                      {report.problema}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      ✔️ Causa probable
                    </div>
                    <div className="mt-2 text-sm text-white">
                      {report.causa}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      ✔️ Confianza
                    </div>
                    <div className="mt-2 text-sm text-white">
                      {report.confianza}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      ✔️ Seguimiento
                    </div>
                    <div className="mt-2 text-sm text-white">
                      {report.seguimiento}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      ✔️ Resumen clínico
                    </div>
                    <div className="mt-2 text-sm leading-7 text-white">
                      {report.resumen}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      ✔️ Por qué sucede
                    </div>
                    <div className="mt-2 text-sm leading-7 text-white">
                      {report.porQueSucede}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      ✔️ Manejo sugerido
                    </div>
                    <div className="mt-2 text-sm leading-7 text-white">
                      {report.manejoSugerido}
                    </div>
                  </div>
                  <div className="rounded-[14px] border border-black/40 bg-black/40 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      Recomendaciones
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {report.recomendaciones.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-300">
                            {index + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[14px] border border-black/40 bg-black/40 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                      Cómo mejorar la salud
                    </div>
                    <div className="mt-2 text-sm leading-7 text-white">
                      {report.comoMejorarLaSalud}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center report-placeholder h-full mt-4 rounded-b-[14px] bg-black/20 text-sm leading-7 text-slate-200 whitespace-pre-wrap overflow-hidden">
                  <img
                    src="https://img.freepik.com/vector-premium/ilustracion-vectorial-sobre-concepto-no-resultado-datos-o-documento-o-archivo-no-encontrado_675567-5773.jpg"
                    alt="report image"
                    className="h-full w-full object-cover"
                  />
                  {/* {isAnalyzing
                    ? "Generando informe técnico..."
                    : "Aquí aparecerá el informe de diagnóstico una vez analices la imagen."} */}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageSection>
      {/* seccion de historial de análisis realizados */}
      <PageSection
        title="Historial de análisis"
        subtitle="Últimos resultados guardados"
      >
        <div className="mb-4 flex flex-row gap-2 justify-between">
          <div className="relative w-1/2">
            <i className="fas fa-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500"></i>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de archivo..."
              className="w-full rounded-xl border border-white/10 bg-black/50 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400/30 focus:bg-black/30"
            />
          </div>
          <button
            type="button"
            onClick={clearHistory}
            className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-200 transition border-red-500/20 bg-red-500/70 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!history.length}
          >
            Borrar historial
          </button>
        </div>

        {filteredHistory.length ? (
          <div className="text-sm text-slate-300 grid grid-cols-4 gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/6 bg-black/20 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.fileName}
                    className="mb-3 h-48 w-full rounded-xl object-cover"
                  />
                </div>
                <div className="flex flex-row text-xs text-white w-full justify-between">
                  <strong>{item.fileName}</strong>

                  <span>{formatLongTime(item.createdAt)}</span>
                </div>
                <div className="mt-2 text-slate-300 w-full whitespace-pre-wrap line-clamp-3">
                  {item.resultText}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 ">
                  <button
                    type="button"
                    onClick={() => downloadDiagnosisItem(item)}
                    className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/50"
                  >
                    Descargar informe
                  </button>
                  <button
                    type="button"
                    onClick={() => removeHistoryItem(item.id)}
                    className="rounded-lg bg-red-500/70 hover:bg-red-500 px-3 py-2 text-xs font-semibold text-slate-200 transition"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[14px] border border-white/8 bg-black/20 p-6 text-sm text-slate-400">
            No hay análisis previos.
          </div>
        )}
      </PageSection>
    </div>
  );
}
