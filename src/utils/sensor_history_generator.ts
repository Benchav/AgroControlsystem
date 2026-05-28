export function generateMultiSensorHistory(days: number) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const dayLabel = d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    return {
      day: dayLabel,
      Humedad: Math.round(55 + (Math.random() - 0.5) * 30),
      Temperatura: Math.round(24 + (Math.random() - 0.5) * 10),
      pH: Math.round((7.0 + (Math.random() - 0.5) * 1.5) * 10) / 10,
      CO2: Math.round(750 + (Math.random() - 0.5) * 400),
    };
  });
}