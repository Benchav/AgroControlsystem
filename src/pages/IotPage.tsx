import { useState, useEffect } from 'react';
import { PageSection } from '../components/layout/PageSection';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Arduino {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  baudRate: number;
  frequency: number;
  description: string;
}

interface Sensor {
  id: string;
  name: string;
  type: string;
  value: string;
  numericValue: number;
  unit: string;
  location: string;
  status: 'OK' | 'Atención' | 'Crítico';
  tone: 'emerald' | 'amber' | 'red' | 'cyan';
  arduinoId: string;
}

interface Alert {
  id: string;
  emoji: string;
  title: string;
  description: string;
  time: string;
  severity: 'red' | 'amber';
  resolved: boolean;
}

// Semillas de datos iniciales
const initialArduinos: Arduino[] = [
  {
    id: 'ARD-MEGA-01',
    name: 'Arduino Mega - Principal',
    location: 'Parcela Norte',
    status: 'active',
    baudRate: 115200,
    frequency: 2,
    description: 'Controlador de sensores de suelo de alta precisión en parcela norte.',
  },
  {
    id: 'ARD-UNO-02',
    name: 'Arduino Uno - Invernadero',
    location: 'Sector 2A',
    status: 'active',
    baudRate: 9600,
    frequency: 5,
    description: 'Monitoreo de temperatura y humedad interna en domo invernadero.',
  },
  {
    id: 'ARD-NANO-03',
    name: 'Arduino Nano - Riego',
    location: 'Zona Crítica',
    status: 'inactive',
    baudRate: 9600,
    frequency: 10,
    description: 'Control de electroválvulas y sensor de flujo de agua en sector sur.',
  },
];

const initialSensors: Sensor[] = [
  {
    id: 'S01',
    name: 'Humedad del Suelo',
    type: 'Humedad',
    value: '68%',
    numericValue: 68,
    unit: '%',
    location: 'Parcela Norte',
    status: 'OK',
    tone: 'emerald',
    arduinoId: 'ARD-MEGA-01',
  },
  {
    id: 'S05',
    name: 'Temperatura Suelo',
    type: 'Temperatura',
    value: '28°C',
    numericValue: 28,
    unit: '°C',
    location: 'Sector 2A',
    status: 'Atención',
    tone: 'amber',
    arduinoId: 'ARD-UNO-02',
  },
  {
    id: 'S09',
    name: 'Humedad Zona Crítica',
    type: 'Humedad',
    value: '34%',
    numericValue: 34,
    unit: '%',
    location: 'Zona Crítica',
    status: 'Crítico',
    tone: 'red',
    arduinoId: 'ARD-NANO-03',
  },
  {
    id: 'S12',
    name: 'pH del Suelo',
    type: 'pH',
    value: '7.2 pH',
    numericValue: 7.2,
    unit: ' pH',
    location: 'Parcela Sur',
    status: 'OK',
    tone: 'cyan',
    arduinoId: 'ARD-MEGA-01',
  },
  {
    id: 'S14',
    name: 'Nitrógeno (N)',
    type: 'Nutrientes',
    value: '185 mg/kg',
    numericValue: 185,
    unit: ' mg/kg',
    location: 'Parcela Norte',
    status: 'OK',
    tone: 'emerald',
    arduinoId: 'ARD-MEGA-01',
  },
  {
    id: 'S18',
    name: 'CO₂ del Suelo',
    type: 'Gas',
    value: '820 ppm',
    numericValue: 820,
    unit: ' ppm',
    location: 'Sector 2A',
    status: 'Atención',
    tone: 'amber',
    arduinoId: 'ARD-UNO-02',
  },
];

const initialAlerts: Alert[] = [
  {
    id: 'A01',
    emoji: '🐛',
    title: 'Anomalía de presión — Posible plaga subterránea',
    description: 'Parcela Norte: Variación anormal en sensores S01, S03. Patrón consistente con actividad de roedores.',
    time: 'hace 12m',
    severity: 'red',
    resolved: false,
  },
  {
    id: 'A02',
    emoji: '🦗',
    title: 'Posible actividad de insectos — Sector 2A',
    description: 'Temperatura de suelo elevada con patrón de vibración en sensor S05. Monitoreo continuo activo.',
    time: 'hace 58m',
    severity: 'amber',
    resolved: false,
  },
];

export function IotPage() {
  // Pestaña activa
  const [activeTab, setActiveTab] = useState<'monitor' | 'arduino' | 'tutorials'>('monitor');

  // Estados cargados desde LocalStorage
  const [arduinos, setArduinos] = useState<Arduino[]>(() => {
    const saved = localStorage.getItem('ac_arduinos');
    return saved ? JSON.parse(saved) : initialArduinos;
  });

  const [sensors, setSensors] = useState<Sensor[]>(() => {
    const saved = localStorage.getItem('ac_sensors');
    return saved ? JSON.parse(saved) : initialSensors;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('ac_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  // Estado de simulación
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Historial de Humedad para Recharts
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

  // Estado del formulario de nuevo Arduino
  const [newArdId, setNewArdId] = useState('');
  const [newArdName, setNewArdName] = useState('');
  const [newArdLoc, setNewArdLoc] = useState('Parcela Norte');
  const [newArdStatus, setNewArdStatus] = useState<'active' | 'inactive'>('active');
  const [newArdBaud, setNewArdBaud] = useState<number>(9600);
  const [newArdFreq, setNewArdFreq] = useState<number>(5);
  const [newArdDesc, setNewArdDesc] = useState('');
  const [formError, setFormError] = useState('');

  // Persistir en LocalStorage al cambiar estados
  useEffect(() => {
    localStorage.setItem('ac_arduinos', JSON.stringify(arduinos));
  }, [arduinos]);

  useEffect(() => {
    localStorage.setItem('ac_sensors', JSON.stringify(sensors));
  }, [sensors]);

  useEffect(() => {
    localStorage.setItem('ac_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Simulación en tiempo real (fluctuación sutil de valores)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      let updatedAvgHumidity = 0;
      let humidityCount = 0;

      setSensors((prevSensors) => {
        const nextSensors = prevSensors.map((sensor) => {
          // Solo actualizamos sensores asociados a Arduinos activos
          const parentArd = arduinos.find((a) => a.id === sensor.arduinoId);
          if (parentArd && parentArd.status === 'inactive') {
            return {
              ...sensor,
              value: '---',
              status: 'Crítico' as const,
              tone: 'red' as const,
            };
          }

          let delta = 0;
          let newValue = sensor.numericValue;

          if (sensor.type === 'Humedad') {
            delta = (Math.random() - 0.5) * 4; // Fluctúa +/- 2%
            newValue = Math.max(0, Math.min(100, sensor.numericValue + delta));
            updatedAvgHumidity += newValue;
            humidityCount++;
          } else if (sensor.type === 'Temperatura') {
            delta = (Math.random() - 0.5) * 0.8; // Fluctúa +/- 0.4°C
            newValue = Math.max(10, Math.min(50, sensor.numericValue + delta));
          } else if (sensor.type === 'pH') {
            delta = (Math.random() - 0.5) * 0.1; // Fluctúa +/- 0.05 pH
            newValue = Math.max(4, Math.min(10, sensor.numericValue + delta));
          } else if (sensor.type === 'Nutrientes') {
            delta = (Math.random() - 0.5) * 6; // Fluctúa +/- 3 mg/kg
            newValue = Math.max(50, Math.min(300, sensor.numericValue + delta));
          } else if (sensor.type === 'Gas') {
            delta = (Math.random() - 0.5) * 15; // Fluctúa +/- 7.5 ppm
            newValue = Math.max(300, Math.min(1500, sensor.numericValue + delta));
          }

          // Formatear valor visual
          let formattedVal = `${newValue.toFixed(sensor.type === 'pH' ? 1 : 0)}${sensor.unit}`;

          // Calcular tono y estado según rangos realistas
          let status: 'OK' | 'Atención' | 'Crítico' = 'OK';
          let tone: 'emerald' | 'amber' | 'red' | 'cyan' = 'emerald';

          if (sensor.type === 'Humedad') {
            if (newValue < 40) {
              status = 'Crítico';
              tone = 'red';
            } else if (newValue < 60) {
              status = 'Atención';
              tone = 'amber';
            } else {
              status = 'OK';
              tone = 'emerald';
            }
          } else if (sensor.type === 'Temperatura') {
            if (newValue > 32) {
              status = 'Crítico';
              tone = 'red';
            } else if (newValue > 27) {
              status = 'Atención';
              tone = 'amber';
            } else {
              status = 'OK';
              tone = 'emerald';
            }
          } else if (sensor.type === 'pH') {
            tone = 'cyan';
            if (newValue < 6.0 || newValue > 8.0) {
              status = 'Atención';
            } else {
              status = 'OK';
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
          const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
          
          setHumidityHistory((prevHistory) => {
            const nextHistory = [...prevHistory, { time: timeStr, value: finalAvg }];
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
  const activeArduinosCount = arduinos.filter((a) => a.status === 'active').length;
  const totalArduinosCount = arduinos.length;

  const humiditySensors = sensors.filter((s) => s.type === 'Humedad' && s.value !== '---');
  const avgHumidity =
    humiditySensors.length > 0
      ? Math.round(humiditySensors.reduce((acc, curr) => acc + curr.numericValue, 0) / humiditySensors.length)
      : 0;

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const onlineSensorsCount = sensors.filter((s) => s.value !== '---').length;

  // Manejo de agregación de Arduino
  const handleAddArduino = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArdId || !newArdName) {
      setFormError('El ID de placa y el Nombre son requeridos.');
      return;
    }

    if (arduinos.some((a) => a.id.toUpperCase() === newArdId.toUpperCase())) {
      setFormError('Ya existe una placa Arduino con este ID.');
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
      type: 'Humedad',
      value: '70%',
      numericValue: 70,
      unit: '%',
      location: newArduino.location,
      status: 'OK',
      tone: 'emerald',
      arduinoId: newArduino.id,
    };

    setArduinos((prev) => [...prev, newArduino]);
    setSensors((prev) => [...prev, newSensor]);

    // Resetear formulario
    setNewArdId('');
    setNewArdName('');
    setNewArdDesc('');
    setFormError('');
  };

  // Alternar estado de un Arduino (Activo/Inactivo)
  const toggleArduinoStatus = (id: string) => {
    setArduinos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a))
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
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-slate-400">Panel Administrativo de Control y Telemetría Industrial</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Consola Central IoT</h1>
        </div>
        
        {/* Toggle de Simulación en tiempo real */}
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border transition-all duration-200 hover:scale-105 active:scale-95 ${
            isSimulating
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-white/10 bg-white/5 text-slate-400'
          }`}
        >
          <span className={`relative flex h-2.5 w-2.5`}>
            {isSimulating && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
          </span>
          {isSimulating ? 'Simulación en Vivo Activa' : 'Simulación Pausada'}
        </button>
      </div>

      {/* Tarjetas Estadísticas Dinámicas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tarjeta 1: Estado de Arduinos */}
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Placas Arduino</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white">{activeArduinosCount}</span>
            <span className="text-sm text-slate-500">/ {totalArduinosCount} Activas</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${activeArduinosCount === totalArduinosCount ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-xs text-slate-400">
              {activeArduinosCount === totalArduinosCount ? 'Todos los nodos OK' : 'Hay placas inactivas'}
            </span>
          </div>
        </div>

        {/* Tarjeta 2: Humedad Promedio */}
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Humedad de Suelo Promedio</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-white">{avgHumidity}%</div>
          <div className="mt-2 text-xs text-slate-400">Calculado sobre {humiditySensors.length} sensores activos</div>
        </div>

        {/* Tarjeta 3: Sensores En Línea */}
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Sensores en Línea</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-white">{onlineSensorsCount}</div>
          <div className="mt-2 text-xs text-slate-400">De un total de {sensors.length} instalados</div>
        </div>

        {/* Tarjeta 4: Alertas Activas */}
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Alertas Activas</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tight ${activeAlertsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {activeAlertsCount}
            </span>
            <span className="text-xs text-slate-500">requieren atención</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Monitoreo automático 24/7</div>
        </div>
      </div>

      {/* Pestañas de Navegación del Panel Administrativo */}
      <div className="flex border-b border-white/10 text-sm">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-4 py-2 font-semibold transition-all border-b-2 ${
            activeTab === 'monitor'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 Monitoreo en Vivo
        </button>
        <button
          onClick={() => setActiveTab('arduino')}
          className={`px-4 py-2 font-semibold transition-all border-b-2 ${
            activeTab === 'arduino'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🔌 Administración Arduino
        </button>
        <button
          onClick={() => setActiveTab('tutorials')}
          className={`px-4 py-2 font-semibold transition-all border-b-2 ${
            activeTab === 'tutorials'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📺 Guías y Tutoriales
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑA: MONITOREO */}
      {activeTab === 'monitor' && (
        <div className="space-y-6">
          {/* Gráfico de Historial en Tiempo Real de Humedad */}
          <PageSection title="Telemetría de Humedad en Tiempo Real" subtitle="Fluctuación del promedio de humedad del suelo en parcelas monitoreadas">
            <div className="h-[240px] w-full rounded-2xl bg-white/[0.01] p-2 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={humidityHistory}>
                  <defs>
                    <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[30, 90]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e2f', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                    itemStyle={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHumidity)" name="Humedad Promedio" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PageSection>

          {/* Tarjetas Principales (Grid rápido) */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sensors.map((sensor) => (
              <div key={sensor.id} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">{sensor.name}</div>
                  <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded border border-white/5 bg-white/5">
                    {sensor.arduinoId}
                  </span>
                </div>
                <div className="mt-3 text-4xl font-black tracking-tight text-white">{sensor.value}</div>
                <div className="mt-2 text-xs text-slate-400">{sensor.location} · {sensor.id}</div>
                <div className="mt-4 flex justify-between items-center">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    sensor.tone === 'red'
                      ? 'bg-red-500/10 text-red-300'
                      : sensor.tone === 'amber'
                      ? 'bg-amber-500/10 text-amber-300'
                      : sensor.tone === 'cyan'
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'bg-emerald-500/10 text-emerald-300'
                  }`}>
                    {sensor.value === '---' ? '📴 Placa Desconectada' : `✔ ${sensor.status}`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detección de Plagas Terrestres / Alertas */}
          <PageSection title="Detección de anomalías y plagas" subtitle="Análisis en tiempo real · Alertas automáticas">
            <div className="space-y-3">
              {alerts.filter(a => !a.resolved).length === 0 ? (
                <div className="text-center py-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                  <p className="text-sm text-slate-400">🟢 No hay anomalías activas detectadas en el sistema.</p>
                </div>
              ) : (
                alerts
                  .filter((a) => !a.resolved)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200 hover:bg-white/[0.02] ${
                        alert.severity === 'red'
                          ? 'border-red-400/15 bg-red-500/5'
                          : 'border-amber-400/15 bg-amber-500/5'
                      }`}
                    >
                      <span className="text-2xl">{alert.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{alert.title}</div>
                        <div className="mt-1 text-sm text-slate-400">{alert.description}</div>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="mt-2 text-xs text-emerald-400 font-semibold hover:underline"
                        >
                          Marcar como atendido / corregido
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">{alert.time}</div>
                        <span className={`mt-1 inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                          alert.severity === 'red' ? 'bg-red-500/25 text-red-200' : 'bg-amber-500/25 text-amber-200'
                        }`}>
                          {alert.severity === 'red' ? 'Crítico' : 'Advertencia'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </PageSection>

          {/* Tabla de Todos los Sensores */}
          <PageSection title="Todos los sensores" subtitle="Inventario y lecturas detalladas de hardware">
            <div className="overflow-x-auto rounded-2xl border border-white/8">
              <table className="w-full border-collapse text-left min-w-[600px]">
                <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Sensor</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Ubicación</th>
                    <th className="px-4 py-3 font-semibold">Placa Arduino</th>
                    <th className="px-4 py-3 font-semibold">Lectura</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-300">
                  {sensors.map((sensor) => (
                    <tr key={sensor.id} className="border-t border-white/6 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-emerald-300">{sensor.id}</td>
                      <td className="px-4 py-3">{sensor.name}</td>
                      <td className="px-4 py-3">{sensor.location}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{sensor.arduinoId}</td>
                      <td className="px-4 py-3 font-mono">{sensor.value}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          sensor.value === '---'
                            ? 'bg-slate-500/10 text-slate-400'
                            : sensor.tone === 'red'
                            ? 'bg-red-500/10 text-red-300'
                            : sensor.tone === 'amber'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-emerald-500/10 text-emerald-300'
                        }`}>
                          {sensor.value === '---' ? 'Inactivo' : sensor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PageSection>
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA: ADMINISTRACIÓN ARDUINO */}
      {activeTab === 'arduino' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Listado de Arduinos */}
            <div className="space-y-4 lg:col-span-2">
              <PageSection title="Placas de Desarrollo Conectadas" subtitle="Control de hardware IoT y telemetría de campo">
                <div className="space-y-4">
                  {arduinos.map((arduino) => {
                    const isActive = arduino.status === 'active';
                    return (
                      <div
                        key={arduino.id}
                        className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 flex flex-col justify-between md:flex-row md:items-center gap-4 hover:border-white/12 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                            <span className="font-mono text-xs font-bold text-slate-500">{arduino.id}</span>
                            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                              isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <h3 className="text-md font-bold text-white">{arduino.name}</h3>
                          <p className="text-xs text-slate-400">{arduino.description}</p>
                          <div className="flex gap-4 pt-1 text-[10px] text-slate-500">
                            <span>📍 {arduino.location}</span>
                            <span>⚡ {arduino.baudRate} baudios</span>
                            <span>🕒 {arduino.frequency}s de lectura</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                          {/* Botón Encender / Apagar */}
                          <button
                            onClick={() => toggleArduinoStatus(arduino.id)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
                              isActive
                                ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isActive ? '🔴 Desactivar' : '🟢 Activar'}
                          </button>
                          {/* Botón Eliminar */}
                          <button
                            onClick={() => handleDeleteArduino(arduino.id)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-all"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PageSection>
            </div>

            {/* Formulario Agregar Arduino */}
            <div className="space-y-4">
              <PageSection title="Registrar Placa Arduino" subtitle="Vincular nuevo nodo al ecosistema">
                <form onSubmit={handleAddArduino} className="space-y-4">
                  {formError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">ID del Dispositivo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. ARD-UNO-04"
                      value={newArdId}
                      onChange={(e) => setNewArdId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Nombre de la Placa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Arduino de Riego Central"
                      value={newArdName}
                      onChange={(e) => setNewArdName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Ubicación</label>
                      <select
                        value={newArdLoc}
                        onChange={(e) => setNewArdLoc(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                      >
                        <option value="Parcela Norte" className="bg-slate-900 text-white">Parcela Norte</option>
                        <option value="Parcela Sur" className="bg-slate-900 text-white">Parcela Sur</option>
                        <option value="Sector 2A" className="bg-slate-900 text-white">Sector 2A</option>
                        <option value="Zona Crítica" className="bg-slate-900 text-white">Zona Crítica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Baudios (Serial)</label>
                      <select
                        value={newArdBaud}
                        onChange={(e) => setNewArdBaud(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                      >
                        <option value={9600} className="bg-slate-900 text-white">9600 bps</option>
                        <option value={19200} className="bg-slate-900 text-white">19200 bps</option>
                        <option value={115200} className="bg-slate-900 text-white">115200 bps</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Frecuencia (seg.)</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={newArdFreq}
                        onChange={(e) => setNewArdFreq(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Estado Inicial</label>
                      <select
                        value={newArdStatus}
                        onChange={(e) => setNewArdStatus(e.target.value as 'active' | 'inactive')}
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                      >
                        <option value="active" className="bg-slate-900 text-white">Activo</option>
                        <option value="inactive" className="bg-slate-900 text-white">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Descripción corta</label>
                    <textarea
                      placeholder="Detalles sobre su propósito u orientación de sensores..."
                      rows={3}
                      value={newArdDesc}
                      onChange={(e) => setNewArdDesc(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-black text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-md shadow-emerald-500/20"
                  >
                    ➕ Registrar Arduino
                  </button>
                </form>
              </PageSection>
            </div>
          </div>

          {/* Modelo Arduino 3D Interactivo */}
          <PageSection title="Hardware Inspector: Placa Arduino Uno R3" subtitle="Modelo interactivo 3D del microcontrolador físico">
            <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-white/8 bg-[#1e1e2f] shadow-lg">
              <iframe
                src="https://sketchfab.com/models/6b856b3e945c478a9c4033c4a22be1a4/embed?ui_theme=dark&ui_hint=0&autostart=0"
                title="Arduino Uno 3D Model"
                allow="autoplay; fullscreen; vr"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
            <div className="mt-3 text-xs text-slate-400">
              💡 <strong>Inspección Virtual 3D:</strong> Haz clic, arrastra para rotar, o usa el scroll del mouse para hacer zoom sobre el modelo tridimensional de la placa Arduino. Examina la distribución exacta de los pines digitales (PWM), pines analógicos (A0-A5), puerto USB tipo B y el chip ATMega328P de montaje.
            </div>
          </PageSection>
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA: TUTORIALES Y GUÍAS */}
      {activeTab === 'tutorials' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Reproductor de Video */}
            <div className="lg:col-span-2 space-y-4">
              <PageSection title="Videotutorial: Configuración e Instalación del Sensor" subtitle="Guía práctica y explicativa">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/4iUKqnasR6s?autoplay=1&mute=1&loop=1&playlist=4iUKqnasR6s"
                    title="Configuración de Sensor de Humedad con Arduino"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-4 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
                  <p className="text-xs text-slate-300">
                    <strong>💡 Recomendación Técnica:</strong> Para lecturas continuas estables en tierra agrícola comercial, se recomienda usar sensores de humedad capacitivos (como el v1.2) en lugar de los sensores resistivos estándar, ya que previenen la corrosión de los electrodos por electrólisis.
                  </p>
                </div>
              </PageSection>
            </div>

            {/* Materiales y Código de Ejemplo */}
            <div className="space-y-4">
              <PageSection title="Esquema de Conexión" subtitle="Hardware requerido">
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between items-center border-b border-white/6 py-1.5">
                    <span>1. Arduino Board (Uno o Mega)</span>
                    <span className="text-xs text-slate-500">1 unidad</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/6 py-1.5">
                    <span>2. Sensor FC-28 o Capacitivo</span>
                    <span className="text-xs text-slate-500">1 unidad</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/6 py-1.5">
                    <span>3. Cables Dupont (Macho-Hembra)</span>
                    <span className="text-xs text-slate-500">3 unidades</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/6 py-1.5">
                    <span>4. Resistencia 10k Ohm (Resistivo)</span>
                    <span className="text-xs text-slate-500">Opcional</span>
                  </div>
                </div>
              </PageSection>

              <PageSection title="Código Arduino Básico" subtitle="Sketch para lectura de humedad">
                <pre className="overflow-x-auto rounded-xl bg-black/40 p-4 font-mono text-[11px] text-emerald-400 border border-white/5 max-h-[220px]">
{`const int sensorPin = A0; 
int sensorValue = 0;

void setup() {
  Serial.begin(115200); 
}

void loop() {
  sensorValue = analogRead(sensorPin);
  
  // Convertir lectura a porcentaje (0-100)
  int porcentaje = map(sensorValue, 1023, 200, 0, 100);
  
  Serial.print("Humedad: ");
  Serial.print(porcentaje);
  Serial.println("%");
  
  delay(2000); // 2 segundos
}`}
                </pre>
              </PageSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
