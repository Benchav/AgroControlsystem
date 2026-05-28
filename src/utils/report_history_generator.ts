export function generateDailyHistory(days: number, base: number, variance: number, label: string) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    data.push({
      day: dayLabel,
      [label]: Math.max(0, Math.round((base + (Math.random() - 0.5) * variance * 2) * 10) / 10),
    });
  }
  return data;
}