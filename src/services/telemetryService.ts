import { HistoricalPoint } from "../entities/parcel_model";

export interface ExternalTelemetry {
  temperature: number;
  humidity: number;
  soilMoisture: number;
}

/**
 * Obtiene datos climatológicos y de suelo reales en tiempo real
 * basados en coordenadas específicas de tu parcela.
 */
export const fetchRealLocationTelemetry = async (
  lat: number,
  lon: number
): Promise<ExternalTelemetry> => {
  try {
    // Consultamos temperatura actual, humedad relativa y humedad de suelo (0 a 1cm de profundidad)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,soil_moisture_0_to_1cm&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al conectar con el satélite meteorológico");
    
    const data = await response.json();
    
    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      soilMoisture: data.current.soil_moisture_0_to_1cm * 100, // Lo convertimos a porcentaje estimado
    };
  } catch (error) {
    console.error("Error en telemetría externa:", error);
    // Valores de respaldo seguros en caso de caída de red
    return { temperature: 22.5, humidity: 60, soilMoisture: 45 };
  }
};

/**
 * Obtiene el histórico real de los últimos 50 días para una coordenada
 */
export const fetchParcel50DaysHistory = async (
  lat: number, 
  lon: number, 
  baseFertilityStr: string, 
  hasCrop: boolean
): Promise<HistoricalPoint[]> => {
  try {
    const today = new Date();
    const fiftyDaysAgo = new Date();
    fiftyDaysAgo.setDate(today.getDate() - 50);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const startDate = formatDate(fiftyDaysAgo);
    const endDate = formatDate(today);

    // URL CORREGIDA: Se usa 'archive-api' en lugar de 'api' para datos históricos reales
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,relative_humidity_2m_mean&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error en el archivo histórico");
    
    const data = await response.json();
    const daily = data.daily;

    if (!daily || !daily.time) return [];

    const baseFertility = parseInt(baseFertilityStr) || 70;

    return daily.time.map((dateStr: string, index: number) => {
      const temp = daily.temperature_2m_mean[index] ?? 22;
      const hum = daily.relative_humidity_2m_mean[index] ?? 60;

      // Estimación de fertilidad histórica estable
      let modifier = hum < 40 ? -10 : hum > 80 ? -5 : 5;
      if (hasCrop) modifier -= 4;

      return {
        date: dateStr,
        temperature: temp,
        humidity: hum,
        fertility: Math.min(100, Math.max(0, baseFertility + modifier))
      };
    });
  } catch (error) {
    console.error("Error cargando histórico de 50 días:", error);
    return []; 
  }
};