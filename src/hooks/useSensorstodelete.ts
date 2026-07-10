import { useState, useEffect } from 'react';
import { Sensor } from '../entities/sensor_model';
import { initialSensors } from '../data/sensor_data';
import { Arduino } from '../entities/arduino_model';

export function useSensors(params: { isSimulating: boolean; arduinos: Arduino[] }) {
  const { isSimulating, arduinos } = params;

  const [sensors, setSensors] = useState<Sensor[]>(() => {
    try {
      const saved = localStorage.getItem('ac_sensors');
      return saved ? JSON.parse(saved) : initialSensors;
    } catch (e) {
      return initialSensors;
    }
  });

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

  useEffect(() => {
    localStorage.setItem('ac_sensors', JSON.stringify(sensors));
  }, [sensors]);

  // React to arduinos status changes: mark sensors offline or restore defaults
  useEffect(() => {
    setSensors((prev) =>
      prev.map((sensor) => {
        const parent = arduinos.find((a) => a.id === sensor.arduinoId);
        if (parent && parent.status === 'inactive') {
          return { ...sensor, value: '---', status: 'Crítico' as const, tone: 'red' as const };
        }
        if (parent && parent.status === 'active' && sensor.value === '---') {
          const baseVal =
            sensor.type === 'Humedad'
              ? 68
              : sensor.type === 'Temperatura'
              ? 28
              : sensor.type === 'pH'
              ? 7.2
              : sensor.type === 'Nutrientes'
              ? 185
              : 820;
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
      }),
    );
  }, [arduinos]);

  // Simulation effect (fluctuación sutil)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      let updatedAvgHumidity = 0;
      let humidityCount = 0;

      let activeSettings = { humidityThreshold: 40, temperatureThreshold: 30, phThreshold: 6.0 };
      try {
        const saved = localStorage.getItem('ac_settings');
        if (saved) activeSettings = JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }

      setSensors((prevSensors) => {
        const nextSensors = prevSensors.map((sensor) => {
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
            if (newValue < activeSettings.humidityThreshold) {
              status = 'Crítico';
              tone = 'red';
            } else if (newValue < activeSettings.humidityThreshold + 15) {
              status = 'Atención';
              tone = 'amber';
            } else {
              status = 'OK';
              tone = 'emerald';
            }
          } else if (sensor.type === 'Temperatura') {
            if (newValue > activeSettings.temperatureThreshold) {
              status = 'Crítico';
              tone = 'red';
            } else if (newValue > activeSettings.temperatureThreshold - 4) {
              status = 'Atención';
              tone = 'amber';
            } else {
              status = 'OK';
              tone = 'emerald';
            }
          } else if (sensor.type === 'pH') {
            tone = 'cyan';
            if (newValue < activeSettings.phThreshold) {
              status = 'Crítico';
              tone = 'red';
            } else if (newValue < activeSettings.phThreshold + 1.0) {
              status = 'Atención';
              tone = 'amber';
            } else {
              status = 'OK';
            }
          }

          return { ...sensor, numericValue: newValue, value: formattedVal, status, tone };
        });

        if (humidityCount > 0) {
          const finalAvg = Math.round(updatedAvgHumidity / humidityCount);
          const t = new Date();
          const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;

          setHumidityHistory((prevHistory) => {
            const nextHistory = [...prevHistory, { time: timeStr, value: finalAvg }];
            if (nextHistory.length > 10) nextHistory.shift();
            return nextHistory;
          });
        }

        return nextSensors;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, arduinos]);

  const addSensor = (s: Sensor) => setSensors((p) => [...p, s]);
  const removeSensorsByArduinoId = (id: string) => setSensors((p) => p.filter((s) => s.arduinoId !== id));

  return { sensors, addSensor, removeSensorsByArduinoId, humidityHistory, setSensors };
}

export default useSensors;
