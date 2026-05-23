import { formatLongTime } from "../utils/formatTime";
import { readJsonSafe, writeJsonSafe } from "../utils/storage";
import { HISTORY_STORAGE_KEY } from "./globalVar";

export type ScanHistoryItem = {
  id: string;
  fileName: string;
  resultText: string;
  createdAt: number;
  imageUrl: string;
};

export type ReportSections = {
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

export function readHistory() {
  return readJsonSafe(HISTORY_STORAGE_KEY, [] as ScanHistoryItem[]);
}

export function writeHistory(items: ScanHistoryItem[]) {
  writeJsonSafe(HISTORY_STORAGE_KEY, items.slice(0, 6));
}

export function exportTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadDiagnosisItem(item: ScanHistoryItem) {
  exportTextFile(
    `diagnostico-ia-${item.fileName}-${item.createdAt}.txt`,
    [
      'Diagnóstico IA - Agro Control',
      `Archivo: ${item.fileName}`,
      `Fecha: ${formatLongTime(item.createdAt)}`,
      '',
      item.resultText,
    ].join('\n'),
  );
}

export function deleteDiagnosisItem(items: ScanHistoryItem[], id: string) {
  const nextItems = items.filter((item) => item.id !== id);
  writeHistory(nextItems);
  return nextItems;
}

export function clearHistoryStorage() {
  writeJsonSafe(HISTORY_STORAGE_KEY, [] as ScanHistoryItem[]);
}

export function parseReportSections(text: string): ReportSections {
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