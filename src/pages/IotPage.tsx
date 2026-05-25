import { useState, useEffect } from "react";
import { Arduino } from "../entities/arduino_model";
import { initialArduinos } from "../data/arduino_data";
import { Sensor } from "../entities/sensor_model";
import { initialSensors } from "../data/sensor_data";
import { Alert } from "../entities/alert_model";
import { initialAlerts } from "../data/alert_data";

import IotHeader from "../components/iot/IotHeader";
import StatsGrid from "../components/iot/StatsGrid";
import TabsNav from "../components/iot/TabsNav";
import MonitorContent from "../components/iot/MonitorContent";
import ArduinoContent from "../components/iot/ArduinoContent";
import TutorialsContent from "../components/iot/TutorialsContent";

export function IotPage() {
  // Pestaña activa
  const [activeTab, setActiveTab] = useState<
    "monitor" | "arduino" | "tutorials"
  >("monitor");

  // Estados cargados desde LocalStorage
  const [arduinos, setArduinos] = useState<Arduino[]>(() => {
    const saved = localStorage.getItem("ac_arduinos");
    return saved ? JSON.parse(saved) : initialArduinos;
  });

  const [sensors, setSensors] = useState<Sensor[]>(() => {
    const saved = localStorage.getItem("ac_sensors");
    return saved ? JSON.parse(saved) : initialSensors;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem("ac_alerts");
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  // Estado de simulación
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Historial de Humedad para Recharts
  const [humidityHistory, setHumidityHistory] = useState<
    { time: string; value: number }[]
  >(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, idx) => {
      const minutesAgo = 5 - idx;
      const t = new Date(now.getTime() - minutesAgo * 60000);
      return {
        time: `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`,
        value: 50 + Math.floor(Math.random() * 20),
      };
    });
  });

  // Estado del formulario de nuevo Arduino
  const [newArdId, setNewArdId] = useState("");
  const [newArdName, setNewArdName] = useState("");
  const [newArdLoc, setNewArdLoc] = useState("Parcela Norte");
  const [newArdStatus, setNewArdStatus] = useState<"active" | "inactive">(
    "active",
  );
  const [newArdBaud, setNewArdBaud] = useState<number>(9600);
  const [newArdFreq, setNewArdFreq] = useState<number>(5);
  const [newArdDesc, setNewArdDesc] = useState("");
  const [formError, setFormError] = useState("");

  // Persistir en LocalStorage al cambiar estados
  useEffect(() => {
    localStorage.setItem("ac_arduinos", JSON.stringify(arduinos));
  }, [arduinos]);

  useEffect(() => {
    localStorage.setItem("ac_sensors", JSON.stringify(sensors));
  }, [sensors]);

  useEffect(() => {
    localStorage.setItem("ac_alerts", JSON.stringify(alerts));
  }, [alerts]);

  // Simulación en tiempo real (fluctuación sutil de valores)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      let updatedAvgHumidity = 0;
      let humidityCount = 0;

      // Cargar umbrales dinámicamente desde localStorage para evitar closures de estado stale
      let activeSettings = {
        humidityThreshold: 40,
        temperatureThreshold: 30,
        phThreshold: 6.0,
      };
      try {
        const saved = localStorage.getItem("ac_settings");
        if (saved) activeSettings = JSON.parse(saved);
      } catch (e) {
        // Fallback silencioso en caso de error
      }

      setSensors((prevSensors) => {
        const nextSensors = prevSensors.map((sensor) => {
          // Solo actualizamos sensores asociados a Arduinos activos
          const parentArd = arduinos.find((a) => a.id === sensor.arduinoId);
          if (parentArd && parentArd.status === "inactive") {
            return {
              ...sensor,
              value: "---",
              status: "Crítico" as const,
              tone: "red" as const,
            };
          }

          let delta = 0;
          let newValue = sensor.numericValue;

          if (sensor.type === "Humedad") {
            delta = (Math.random() - 0.5) * 4; // Fluctúa +/- 2%
            newValue = Math.max(0, Math.min(100, sensor.numericValue + delta));
            updatedAvgHumidity += newValue;
            humidityCount++;
          } else if (sensor.type === "Temperatura") {
            delta = (Math.random() - 0.5) * 0.8; // Fluctúa +/- 0.4°C
            newValue = Math.max(10, Math.min(50, sensor.numericValue + delta));
          } else if (sensor.type === "pH") {
            delta = (Math.random() - 0.5) * 0.1; // Fluctúa +/- 0.05 pH
            newValue = Math.max(4, Math.min(10, sensor.numericValue + delta));
          } else if (sensor.type === "Nutrientes") {
            delta = (Math.random() - 0.5) * 6; // Fluctúa +/- 3 mg/kg
            newValue = Math.max(50, Math.min(300, sensor.numericValue + delta));
          } else if (sensor.type === "Gas") {
            delta = (Math.random() - 0.5) * 15; // Fluctúa +/- 7.5 ppm
            newValue = Math.max(
              300,
              Math.min(1500, sensor.numericValue + delta),
            );
          }

          // Formatear valor visual
          let formattedVal = `${newValue.toFixed(sensor.type === "pH" ? 1 : 0)}${sensor.unit}`;

          // Calcular tono y estado según rangos dinámicos configurados
          let status: "OK" | "Atención" | "Crítico" = "OK";
          let tone: "emerald" | "amber" | "red" | "cyan" = "emerald";

          if (sensor.type === "Humedad") {
            if (newValue < activeSettings.humidityThreshold) {
              status = "Crítico";
              tone = "red";
            } else if (newValue < activeSettings.humidityThreshold + 15) {
              status = "Atención";
              tone = "amber";
            } else {
              status = "OK";
              tone = "emerald";
            }
          } else if (sensor.type === "Temperatura") {
            if (newValue > activeSettings.temperatureThreshold) {
              status = "Crítico";
              tone = "red";
            } else if (newValue > activeSettings.temperatureThreshold - 4) {
              status = "Atención";
              tone = "amber";
            } else {
              status = "OK";
              tone = "emerald";
            }
          } else if (sensor.type === "pH") {
            tone = "cyan";
            if (newValue < activeSettings.phThreshold) {
              status = "Crítico";
              tone = "red";
            } else if (newValue < activeSettings.phThreshold + 1.0) {
              status = "Atención";
              tone = "amber";
            } else {
              status = "OK";
            }
          }

          return {
            ...sensor,
            numericValue: newValue,
            value: formattedVal,
            status,
            tone,
          };
        });

        // Actualizar el historial del promedio de humedad con la nueva fluctuación
        if (humidityCount > 0) {
          const finalAvg = Math.round(updatedAvgHumidity / humidityCount);
          const t = new Date();
          const timeStr = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}:${t.getSeconds().toString().padStart(2, "0")}`;

          setHumidityHistory((prevHistory) => {
            const nextHistory = [
              ...prevHistory,
              { time: timeStr, value: finalAvg },
            ];
            if (nextHistory.length > 10) {
              nextHistory.shift();
            }
            return nextHistory;
          });
        }

        return nextSensors;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, arduinos]);

  // Cálculos estadísticos dinámicos
  const activeArduinosCount = arduinos.filter(
    (a) => a.status === "active",
  ).length;
  const totalArduinosCount = arduinos.length;

  const humiditySensors = sensors.filter(
    (s) => s.type === "Humedad" && s.value !== "---",
  );
  const avgHumidity =
    humiditySensors.length > 0
      ? Math.round(
          humiditySensors.reduce((acc, curr) => acc + curr.numericValue, 0) /
            humiditySensors.length,
        )
      : 0;

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const onlineSensorsCount = sensors.filter((s) => s.value !== "---").length;

  // Manejo de agregación de Arduino
  const handleAddArduino = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArdId || !newArdName) {
      setFormError("El ID de placa y el Nombre son requeridos.");
      return;
    }

    if (arduinos.some((a) => a.id.toUpperCase() === newArdId.toUpperCase())) {
      setFormError("Ya existe una placa Arduino con este ID.");
      return;
    }

    const newArduino: Arduino = {
      id: newArdId.toUpperCase(),
      name: newArdName,
      location: newArdLoc,
      status: newArdStatus,
      baudRate: newArdBaud,
      frequency: newArdFreq,
      description: newArdDesc || `Dispositivo de control en ${newArdLoc}.`,
    };

    // Agregar sensores ficticios automáticamente a este nuevo Arduino para darle vida
    const newSensor: Sensor = {
      id: `S${Math.floor(Math.random() * 90) + 20}`,
      name: `Humedad de Suelo (${newArduino.id})`,
      type: "Humedad",
      value: "70%",
      numericValue: 70,
      unit: "%",
      location: newArduino.location,
      status: "OK",
      tone: "emerald",
      arduinoId: newArduino.id,
    };

    setArduinos((prev) => [...prev, newArduino]);
    setSensors((prev) => [...prev, newSensor]);

    // Resetear formulario
    setNewArdId("");
    setNewArdName("");
    setNewArdDesc("");
    setFormError("");
  };

  // Alternar estado de un Arduino (Activo/Inactivo)
  const toggleArduinoStatus = (id: string) => {
    const target = arduinos.find((a) => a.id === id);
    if (!target) return;

    const nextStatus = target.status === "active" ? "inactive" : "active";

    // 1. Actualizar Arduinos
    setArduinos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)),
    );

    // 2. Actualizar sensores asociados de inmediato (de forma secuencial y limpia)
    setSensors((prevSensors) =>
      prevSensors.map((sensor) => {
        if (sensor.arduinoId === id) {
          if (nextStatus === "inactive") {
            return {
              ...sensor,
              value: "---",
              status: "Crítico" as const,
              tone: "red" as const,
            };
          } else {
            // Restaurar un valor por defecto realista
            const baseVal =
              sensor.type === "Humedad"
                ? 68
                : sensor.type === "Temperatura"
                  ? 28
                  : sensor.type === "pH"
                    ? 7.2
                    : sensor.type === "Nutrientes"
                      ? 185
                      : 820;
            const formattedVal = `${baseVal.toFixed(sensor.type === "pH" ? 1 : 0)}${sensor.unit}`;
            return {
              ...sensor,
              numericValue: baseVal,
              value: formattedVal,
              status: "OK" as const,
              tone:
                sensor.type === "pH"
                  ? ("cyan" as const)
                  : sensor.type === "Humedad"
                    ? ("emerald" as const)
                    : ("amber" as const),
            };
          }
        }
        return sensor;
      }),
    );
  };

  // Eliminar placa Arduino
  const handleDeleteArduino = (id: string) => {
    setArduinos((prev) => prev.filter((a) => a.id !== id));
    // Los sensores asociados se quedan apagados (---)
    setSensors((prev) => prev.filter((s) => s.arduinoId !== id));
  };

  // Resolver alerta
  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
    );
  };

  return (
    <div className="space-y-6">
      <IotHeader
        isSimulating={isSimulating}
        toggleSim={() => setIsSimulating(!isSimulating)}
      />

      <StatsGrid
        activeArduinosCount={activeArduinosCount}
        totalArduinosCount={totalArduinosCount}
        avgHumidity={avgHumidity}
        humiditySensorsCount={humiditySensors.length}
        onlineSensorsCount={onlineSensorsCount}
        totalSensors={sensors.length}
        activeAlertsCount={activeAlertsCount}
      />

      <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "monitor" && (
        <MonitorContent
          humidityHistory={humidityHistory}
          sensors={sensors}
          alerts={alerts}
          handleResolveAlert={handleResolveAlert}
        />
      )}

      {activeTab === "arduino" && (
        <ArduinoContent
          arduinos={arduinos}
          toggleArduinoStatus={toggleArduinoStatus}
          handleDeleteArduino={handleDeleteArduino}
          handleAddArduino={handleAddArduino}
          formError={formError}
          newArdId={newArdId}
          setNewArdId={setNewArdId}
          newArdName={newArdName}
          setNewArdName={setNewArdName}
          newArdLoc={newArdLoc}
          setNewArdLoc={setNewArdLoc}
          newArdBaud={newArdBaud}
          setNewArdBaud={setNewArdBaud}
          newArdFreq={newArdFreq}
          setNewArdFreq={setNewArdFreq}
          newArdStatus={newArdStatus}
          setNewArdStatus={setNewArdStatus}
          newArdDesc={newArdDesc}
          setNewArdDesc={setNewArdDesc}
        />
      )}

      {activeTab === "tutorials" && <TutorialsContent />}
    </div>
  );
}
