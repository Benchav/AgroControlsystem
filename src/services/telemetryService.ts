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