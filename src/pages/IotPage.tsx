import { useState } from "react";
import { Arduino } from "../entities/arduino_model";
import { Sensor } from "../entities/sensor_model";

import IotHeader from "../components/iot/IotHeader";
import StatsGrid from "../components/iot/StatsGrid";
import TabsNav from "../components/iot/TabsNav";
import MonitorContent from "../components/iot/MonitorContent";
import ArduinoContent from "../components/iot/ArduinoContent";
import TutorialsContent from "../components/iot/TutorialsContent";
import useArduinos from "../hooks/useArduinos";
import useSensors from "../hooks/useSensorstodelete";
import useAlerts from "../hooks/useAlerts";

export function IotPage() {
  // Pestaña activa
  const [activeTab, setActiveTab] = useState<
    "monitor" | "arduino" | "tutorials"
  >("monitor");

  // Estados cargados desde LocalStorage
  // Estado de simulación
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Estados cargados desde LocalStorage (hooks)
  const { arduinos, addArduino, toggleArduinoStatus, deleteArduino } =
    useArduinos();
  const { sensors, addSensor, removeSensorsByArduinoId, humidityHistory } =
    useSensors({ isSimulating, arduinos });
  const { alerts, resolveAlert } = useAlerts();

  // Historial de Humedad manejado por useSensors

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

  // Simulación y persistencia están ahora encapsulados en hooks

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

    addArduino(newArduino);
    addSensor(newSensor);

    // Resetear formulario
    setNewArdId("");
    setNewArdName("");
    setNewArdDesc("");
    setFormError("");
  };

  // Alternar estado de un Arduino (delegado al hook)
  const handleToggleArduino = (id: string) => toggleArduinoStatus(id);

  // Eliminar placa Arduino (delegado al hook)
  const handleDeleteArduino = (id: string) => {
    deleteArduino(id);
    removeSensorsByArduinoId(id);
  };

  // Resolver alerta (delegado al hook)
  const handleResolveAlert = (id: string) => resolveAlert(id);

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
          toggleArduinoStatus={handleToggleArduino}
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
