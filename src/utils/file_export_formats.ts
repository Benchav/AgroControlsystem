import { Alert } from "../entities/alert_model";
import { Arduino } from "../entities/arduino_model";
import { Sensor } from "../entities/sensor_model";
import * as XLSX from 'xlsx';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { Period, PERIOD_LABELS } from "../pages/ReportsPage";

// ─── Exportar CSV ─────────────────────────────────────────────────────────────
export function exportCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((row) =>
    Object.values(row).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const blob = new Blob([`\uFEFF${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Exportar Excel (multi-hoja) ──────────────────────────────────────────────
export function exportExcel(
  sensors: Sensor[],
  arduinos: Arduino[],
  alerts: Alert[],
  parcelaData: any[],
  multiHistory: any[],
  period: string,
  kpis: { label: string; value: string; sub: string }[]
) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().slice(0, 10);

  // Hoja 1: Resumen KPIs
  const kpiRows = [
    ['AGRO CONTROL SYSTEM — Reporte Ejecutivo', '', '', ''],
    [`Período: ${period}`, '', 'Generado:', dateStr],
    ['', '', '', ''],
    ['INDICADOR', 'VALOR', 'DETALLE', ''],
    ...kpis.map(k => [k.label, k.value, k.sub, '']),
  ];
  const wsKPI = XLSX.utils.aoa_to_sheet(kpiRows);
  wsKPI['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 38 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsKPI, 'Resumen KPIs');

  // Hoja 2: Sensores
  const sensorRows = sensors.map(s => ({
    ID: s.id,
    Nombre: s.name,
    Tipo: s.type,
    Ubicacion: s.location,
    'Placa Arduino': s.arduinoId,
    'Lectura Actual': s.value === '---' ? 'Sin señal' : s.value,
    'Valor Numerico': s.value === '---' ? '' : s.numericValue,
    Unidad: s.unit.trim(),
    Estado: s.value === '---' ? 'Offline' : s.status,
  }));
  const wsSensors = XLSX.utils.json_to_sheet(sensorRows);
  wsSensors['!cols'] = [{ wch: 8 }, { wch: 24 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsSensors, 'Sensores');

  // Hoja 3: Arduinos
  const ardRows = arduinos.map(a => ({
    ID: a.id,
    Nombre: a.name,
    Ubicacion: a.location,
    Estado: a.status === 'active' ? 'Activo' : 'Inactivo',
    'Baudios (bps)': a.baudRate,
    'Frecuencia (seg)': a.frequency,
    Descripcion: a.description,
  }));
  const wsArd = XLSX.utils.json_to_sheet(ardRows);
  wsArd['!cols'] = [{ wch: 16 }, { wch: 28 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsArd, 'Arduinos');

  // Hoja 4: Parcelas
  const parcRows = parcelaData.map(p => ({
    Parcela: p.parcela,
    'Indice Salud (%)': p.saludPct,
    'Humedad (%)': p.humedad || 'N/A',
    'Temperatura (C)': p.temperatura || 'N/A',
    'pH Suelo': p.ph || 'N/A',
    'Sensores Activos': p.sensores,
    'Estado General': p.saludPct >= 80 ? 'Optimo' : p.saludPct >= 60 ? 'Atencion' : 'Critico',
  }));
  const wsParc = XLSX.utils.json_to_sheet(parcRows);
  wsParc['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsParc, 'Parcelas');

  // Hoja 5: Alertas
  const alertRows = alerts.map(a => ({
    ID: a.id,
    Titulo: a.title,
    Descripcion: a.description,
    Severidad: a.severity === 'red' ? 'Critica' : 'Advertencia',
    Tiempo: a.time,
    Resuelta: a.resolved ? 'Sí' : 'No',
  }));
  const wsAlerts = XLSX.utils.json_to_sheet(alertRows);
  wsAlerts['!cols'] = [{ wch: 8 }, { wch: 46 }, { wch: 54 }, { wch: 14 }, { wch: 14 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsAlerts, 'Alertas');

  // Hoja 6: Telemetría histórica
  const wsTelem = XLSX.utils.json_to_sheet(multiHistory);
  wsTelem['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsTelem, 'Telemetria');

  XLSX.writeFile(wb, `AgroControl-Reporte-${dateStr}.xlsx`);
}

// ─── Exportar PDF profesional ─────────────────────────────────────────────────
export function exportPDF(
  sensors: Sensor[],
  arduinos: Arduino[],
  alerts: Alert[],
  parcelaData: any[],
  period: string,
  kpis: { label: string; value: string; sub: string }[],
  systemHealth: number,
  avgHumidity: number,
  avgTemp: number,
  avgPH: number
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('es-MX');
  const pageW = doc.internal.pageSize.getWidth();

  // ── Encabezado ──
  doc.setFillColor(10, 16, 27);
  doc.rect(0, 0, pageW, 38, 'F');

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 5, 38, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('AGRO CONTROL SYSTEM', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Centro de Inteligencia Agrícola — Reporte Ejecutivo', 14, 22);
  doc.text(`Período: ${PERIOD_LABELS[period as Period] ?? period}`, 14, 28);
  doc.text(`Generado: ${dateStr} a las ${timeStr}`, 14, 34);

  // ── Sección KPIs ──
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 42, pageW, 7, 'F');
  doc.text('INDICADORES CLAVE DEL SISTEMA', 14, 47.5);

  const kpiTableData = kpis.map(k => [k.label, k.value, k.sub]);
  autoTable(doc, {
    startY: 52,
    head: [['Indicador', 'Valor', 'Detalle']],
    body: kpiTableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3, textColor: [203, 213, 225], fillColor: [15, 23, 42] },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [20, 30, 48] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65 }, 1: { cellWidth: 30, halign: 'center' }, 2: { cellWidth: 80 } },
    margin: { left: 14, right: 14 },
  });

  // ── Métricas clave en recuadros ──
  const metricsY = (doc as any).lastAutoTable.finalY + 8;
  const metricsData = [
    { label: 'Salud Sistema', value: `${systemHealth}%`, color: systemHealth >= 80 ? [16, 185, 129] : [245, 158, 11] },
    { label: 'Humedad Prom.', value: `${avgHumidity}%`, color: [56, 189, 248] },
    { label: 'Temperatura', value: `${avgTemp}°C`, color: [245, 158, 11] },
    { label: 'pH Promedio', value: avgPH > 0 ? `${avgPH}` : 'N/A', color: [167, 139, 250] },
  ];
  const boxW = (pageW - 28 - 9) / 4;
  metricsData.forEach((m, i) => {
    const x = 14 + i * (boxW + 3);
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(...(m.color as [number, number, number]));
    doc.setLineWidth(0.5);
    doc.roundedRect(x, metricsY, boxW, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...(m.color as [number, number, number]));
    doc.text(m.value, x + boxW / 2, metricsY + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label.toUpperCase(), x + boxW / 2, metricsY + 15, { align: 'center' });
  });

  // ── Tabla de Sensores ──
  doc.addPage();
  doc.setFillColor(10, 16, 27);
  doc.rect(0, 0, pageW, 14, 'F');
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 5, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('INVENTARIO DE SENSORES', 14, 9);

  const sensorTableData = sensors.map(s => [
    s.id,
    s.name,
    s.type,
    s.location,
    s.arduinoId,
    s.value === '---' ? 'Sin señal' : s.value,
    s.value === '---' ? 'Offline' : s.status,
  ]);
  autoTable(doc, {
    startY: 18,
    head: [['ID', 'Nombre', 'Tipo', 'Ubicación', 'Arduino', 'Lectura', 'Estado']],
    body: sensorTableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [203, 213, 225], fillColor: [15, 23, 42] },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [20, 30, 48] },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw as string;
        if (val === 'OK') data.cell.styles.textColor = [16, 185, 129];
        else if (val === 'Crítico' || val === 'Offline') data.cell.styles.textColor = [239, 68, 68];
        else if (val === 'Atención') data.cell.styles.textColor = [245, 158, 11];
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Tabla de Parcelas ──
  const parcY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(15, 23, 42);
  doc.rect(14, parcY - 6, pageW - 28, 7, 'F');
  doc.text('REPORTE POR PARCELA', 17, parcY - 0.5);

  const parcTableData = parcelaData.map(p => [
    p.parcela,
    `${p.saludPct}%`,
    p.humedad > 0 ? `${p.humedad}%` : 'N/A',
    p.temperatura > 0 ? `${p.temperatura}°C` : 'N/A',
    p.ph > 0 ? `${p.ph}` : 'N/A',
    `${p.sensores}`,
    p.saludPct >= 80 ? 'Óptimo' : p.saludPct >= 60 ? 'Atención' : 'Crítico',
  ]);
  autoTable(doc, {
    startY: parcY + 3,
    head: [['Parcela', 'Salud', 'Humedad', 'Temperatura', 'pH', 'Sensores', 'Estado']],
    body: parcTableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [203, 213, 225], fillColor: [15, 23, 42] },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [20, 30, 48] },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw as string;
        if (val === 'Óptimo') data.cell.styles.textColor = [16, 185, 129];
        else if (val === 'Crítico') data.cell.styles.textColor = [239, 68, 68];
        else if (val === 'Atención') data.cell.styles.textColor = [245, 158, 11];
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Tabla de Alertas ──
  doc.addPage();
  doc.setFillColor(10, 16, 27);
  doc.rect(0, 0, pageW, 14, 'F');
  doc.setFillColor(239, 68, 68);
  doc.rect(0, 0, 5, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('HISTORIAL DE ALERTAS Y ANOMALÍAS', 14, 9);

  const alertTableData = alerts.map(a => [
    a.id,
    a.title.length > 50 ? a.title.slice(0, 50) + '…' : a.title,
    a.description.length > 60 ? a.description.slice(0, 60) + '…' : a.description,
    a.severity === 'red' ? 'Crítica' : 'Advertencia',
    a.time,
    a.resolved ? 'Sí' : 'No',
  ]);
  autoTable(doc, {
    startY: 18,
    head: [['ID', 'Alerta', 'Descripción', 'Severidad', 'Tiempo', 'Resuelta']],
    body: alertTableData,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [203, 213, 225], fillColor: [15, 23, 42] },
    headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [20, 30, 48] },
    didParseCell: (data: any) => {
      if (data.section === 'body') {
        if (data.column.index === 3) {
          data.cell.styles.textColor = data.cell.raw === 'Crítica' ? [239, 68, 68] : [245, 158, 11];
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.column.index === 5) {
          data.cell.styles.textColor = data.cell.raw === 'Sí' ? [16, 185, 129] : [239, 68, 68];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Tabla de Arduinos ──
  const ardY2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(15, 23, 42);
  doc.rect(14, ardY2 - 6, pageW - 28, 7, 'F');
  doc.text('REGISTRO DE PLACAS ARDUINO', 17, ardY2 - 0.5);

  const ardTableData = arduinos.map(a => [
    a.id,
    a.name,
    a.location,
    a.status === 'active' ? 'Activo' : 'Inactivo',
    `${a.baudRate} bps`,
    `${a.frequency}s`,
  ]);
  autoTable(doc, {
    startY: ardY2 + 3,
    head: [['ID', 'Nombre', 'Ubicación', 'Estado', 'Baudios', 'Frecuencia']],
    body: ardTableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [203, 213, 225], fillColor: [15, 23, 42] },
    headStyles: { fillColor: [15, 23, 42], textColor: [16, 185, 129], fontStyle: 'bold', lineColor: [16, 185, 129], lineWidth: 0.3 },
    alternateRowStyles: { fillColor: [20, 30, 48] },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 3) {
        data.cell.styles.textColor = data.cell.raw === 'Activo' ? [16, 185, 129] : [239, 68, 68];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Pie de página en todas las páginas ──
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(10, 16, 27);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('Agro Control System — Reporte Confidencial', 14, pageH - 3.5);
    doc.text(`Página ${i} de ${totalPages}`, pageW - 14, pageH - 3.5, { align: 'right' });
    doc.text(dateStr, pageW / 2, pageH - 3.5, { align: 'center' });
  }

  doc.save(`AgroControl-Reporte-${new Date().toISOString().slice(0, 10)}.pdf`);
}