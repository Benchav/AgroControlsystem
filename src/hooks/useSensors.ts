import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sensor } from '../entities/sensor_model';
import { initialSensors } from '../data/sensor_data';
import { Arduino } from '../entities/arduino_model';

// Intentar leer de localStorage para mantener la persistencia que ya tenías
let sensorsDb: Sensor[] = (() => {
  try {
    const saved = localStorage.getItem('ac_sensors');
    return saved ? JSON.parse(saved) : initialSensors;
  } catch (e) {
    return initialSensors;
  }
})();

const SENSORS_QUERY_KEY = ['sensors'];

interface UseSensorsParams {
  isSimulating?: boolean;
  arduinos?: Arduino[];
}

export const useSensors = (params?: UseSensorsParams) => {
  const isSimulating = params?.isSimulating ?? false;
  const arduinos = params?.arduinos ?? [];
  
  const queryClient = useQueryClient();

  // --- HISTORIAL DE HUMEDAD (Mantenido local ya que cambia cada 3s) ---
  const [humidityHistory, setHumidityHistory] = useState<{ time: string; value: number }[]>(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, idx) => {
      const minutesAgo = 5 - idx;
      const t = new Date(now.getTime() - minutesAgo * 60000);
      return {
        time: `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`,
        value: 50 + Math.floor(Math.random() * 20),
      };
    });
  });

  // 1. GET ALL (TanStack Query)
  const sensorsQuery = useQuery({
    queryKey: SENSORS_QUERY_KEY,
    queryFn: async (): Promise<Sensor[]> => {
      await new Promise((resolve) => setTimeout(resolve, 150)); 
      return [...sensorsDb];
    },
  });

  const currentSensors = sensorsQuery.data || [];

  // Guardar en LocalStorage automáticamente cada vez que la caché cambie exitosamente
  useEffect(() => {
    if (sensorsQuery.data) {
      localStorage.setItem('ac_sensors', JSON.stringify(sensorsQuery.data));
    }
  }, [sensorsQuery.data]);

  // --- MUTACIONES ---

  const createSensorMutation = useMutation({
    mutationFn: async (newSensor: Sensor) => {
      sensorsDb.push(newSensor);
      return newSensor;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SENSORS_QUERY_KEY }),
  });

  const updateSensorMutation = useMutation({
    mutationFn: async ({ id, updatedSensor }: { id: string; updatedSensor: Sensor }) => {
      sensorsDb = sensorsDb.map((s) => (s.id === id ? updatedSensor : s));
      return updatedSensor;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SENSORS_QUERY_KEY }),
  });

  const deleteSensorMutation = useMutation({
    mutationFn: async (id: string) => {
      sensorsDb = sensorsDb.filter((s) => s.id !== id);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SENSORS_QUERY_KEY }),
  });

  // Mutación masiva interna para la simulación y efectos de Arduinos
  const setSensorsMutation = useMutation({
    mutationFn: async (nextSensors: Sensor[]) => {
      sensorsDb = nextSensors;
      return sensorsDb;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SENSORS_QUERY_KEY }),
  });


  // --- EFECTO 1: Reaccionar al estado de los Arduinos ---
  useEffect(() => {
    if (!arduinos.length || !sensorsQuery.data) return;

    const updated = currentSensors.map((sensor) => {
      const parent = arduinos.find((a) => a.id === sensor.arduinoId);
      if (parent && parent.status === 'inactive') {
        return { ...sensor, value: '---', status: 'Crítico' as const, tone: 'red' as const };
      }
      if (parent && parent.status === 'active' && sensor.value === '---') {
        const baseVal =
          sensor.type === 'Humedad' ? 68 :
          sensor.type === 'Temperatura' ? 28 :
          sensor.type === 'pH' ? 7.2 :
          sensor.type === 'Nutrientes' ? 185 : 820;
        
        const formattedVal = `${baseVal.toFixed(sensor.type === 'pH' ? 1 : 0)}${sensor.unit}`;
        return {
          ...sensor,
          numericValue: baseVal,
          value: formattedVal,
          status: 'OK' as const,
          tone: sensor.type === 'pH' ? ('cyan' as const) : sensor.type === 'Humedad' ? ('emerald' as const) : ('amber' as const),
        };
      }
      return sensor;
    });

    // Validar si realmente cambió algo para evitar bucles infinitos de renderizado
    if (JSON.stringify(updated) !== JSON.stringify(currentSensors)) {
      setSensorsMutation.mutate(updated);
    }
  }, [arduinos]);


  // --- EFECTO 2: Simulación de Fluctuaciones en Tiempo Real ---
  useEffect(() => {
    if (!isSimulating || !sensorsQuery.data) return;

    const interval = setInterval(() => {
      let updatedAvgHumidity = 0;
      let humidityCount = 0;

      let activeSettings = { humidityThreshold: 40, temperatureThreshold: 30, phThreshold: 6.0 };
      try {
        const saved = localStorage.getItem('ac_settings');
        if (saved) activeSettings = JSON.parse(saved);
      } catch (e) { /* ignore */ }

      const nextSensors = currentSensors.map((sensor) => {
        const parentArd = arduinos.find((a) => a.id === sensor.arduinoId);
        if (parentArd && parentArd.status === 'inactive') {
          return { ...sensor, value: '---', status: 'Crítico' as const, tone: 'red' as const };
        }

        let delta = 0;
        let newValue = sensor.numericValue;

        if (sensor.type === 'Humedad') {
          delta = (Math.random() - 0.5) * 4;
          newValue = Math.max(0, Math.min(100, sensor.numericValue + delta));
          updatedAvgHumidity += newValue;
          humidityCount++;
        } else if (sensor.type === 'Temperatura') {
          delta = (Math.random() - 0.5) * 0.8;
          newValue = Math.max(10, Math.min(50, sensor.numericValue + delta));
        } else if (sensor.type === 'pH') {
          delta = (Math.random() - 0.5) * 0.1;
          newValue = Math.max(4, Math.min(10, sensor.numericValue + delta));
        } else if (sensor.type === 'Nutrientes') {
          delta = (Math.random() - 0.5) * 6;
          newValue = Math.max(50, Math.min(300, sensor.numericValue + delta));
        } else if (sensor.type === 'Gas') {
          delta = (Math.random() - 0.5) * 15;
          newValue = Math.max(300, Math.min(1500, sensor.numericValue + delta));
        }

        const formattedVal = `${newValue.toFixed(sensor.type === 'pH' ? 1 : 0)}${sensor.unit}`;
        let status: 'OK' | 'Atención' | 'Crítico' = 'OK';
        let tone: 'emerald' | 'amber' | 'red' | 'cyan' = 'emerald';

        if (sensor.type === 'Humedad') {
          if (newValue < activeSettings.humidityThreshold) { status = 'Crítico'; tone = 'red'; }
          else if (newValue < activeSettings.humidityThreshold + 15) { status = 'Atención'; tone = 'amber'; }
        } else if (sensor.type === 'Temperatura') {
          if (newValue > activeSettings.temperatureThreshold) { status = 'Crítico'; tone = 'red'; }
          else if (newValue > activeSettings.temperatureThreshold - 4) { status = 'Atención'; tone = 'amber'; }
        } else if (sensor.type === 'pH') {
          tone = 'cyan';
          if (newValue < activeSettings.phThreshold) { status = 'Crítico'; tone = 'red'; }
          else if (newValue < activeSettings.phThreshold + 1.0) { status = 'Atención'; tone = 'amber'; }
        }

        return { ...sensor, numericValue: newValue, value: formattedVal, status, tone };
      });

      // Actualizar Base de datos y Caché
      setSensorsMutation.mutate(nextSensors);

      // Historial de humedad
      if (humidityCount > 0) {
        const finalAvg = Math.round(updatedAvgHumidity / humidityCount);
        const t = new Date();
        const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;

        setHumidityHistory((prevHistory) => {
          const nextHistory = [...prevHistory, { time: timeStr, value: finalAvg }];
          if (nextHistory.length > 10) nextHistory.shift();
          return nextHistory;
        });
      }

    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, arduinos, currentSensors]);

  // Métodos puente para mantener compatibilidad exacta con tu interfaz anterior
  const removeSensorsByArduinoId = (arduinoId: string) => {
    const updated = sensorsDb.filter((s) => s.arduinoId !== arduinoId);
    setSensorsMutation.mutate(updated);
  };

  return {
    sensors: currentSensors,
    isLoading: sensorsQuery.isLoading,
    isError: sensorsQuery.isError,
    humidityHistory,
    // CRUD
    createSensor: createSensorMutation.mutate,
    updateSensor: updateSensorMutation.mutate,
    deleteSensor: deleteSensorMutation.mutate,
    // Métodos heredados/compatibles
    addSensor: createSensorMutation.mutate, 
    removeSensorsByArduinoId,
    setSensors: setSensorsMutation.mutate,
  };
};

export default useSensors;