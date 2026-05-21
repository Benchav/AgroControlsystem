import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Parcel } from "../entities/parcel_model";

interface SoilMetricsPanelProps {
  selectedParcel: Parcel;
}

export function SoilMetricsPanel({ selectedParcel }: SoilMetricsPanelProps) {
  // 1. Configuración del Gráfico de Semicírculo (Gauge)
  const fertilityValue =
    parseInt(selectedParcel.fertility.replace("%", "")) || 0;

  const gaugeData = [
    { value: 40, color: "#f87171" }, // Rango Crítico (Rojo)
    { value: 40, color: "#fbbf24" }, // Rango Atención (Ámbar)
    { value: 20, color: "#34d399" }, // Rango Óptimo (Verde esmeralda)
  ];

  // Cálculo trigonométrico exacto para posicionar la aguja indicadora
  const RADIAN = Math.PI / 180;
  const targetAngle = 180 - (fertilityValue / 100) * 180; // Mapea 0-100% a 180°-0°
  const cx = 100; // Centro X dentro de la caja del Pie
  const cy = 110; // Centro Y dentro de la caja del Pie
  const rOuter = 75; // Radio de la aguja

  const xA = cx + rOuter * Math.cos(targetAngle * RADIAN);
  const yA = cy - rOuter * Math.sin(targetAngle * RADIAN);

  // 2. Configuración de Respaldos para el Gráfico de Líneas
  const defaultHistory = [
    { time: "0", humidity: 0, fertility: 0 },
    { time: "50", humidity: 0, fertility: 0 },
  ];
  const chartData = selectedParcel.soilHistory || defaultHistory;

  return (
    <div className="rounded-[14px] border border-white/8 bg-white/[0.03] p-5 backdrop-blur">
      {/* Título de la Sección */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">
          Métricas de Fertilidad y Suelo —{" "}
          <span className="text-emerald-400">{selectedParcel.name}</span>
        </div>
        <button className="text-white/40 hover:text-white transition-colors">
          •••
        </button>
      </div>

      {/* Grid de Dos Columnas para distribuir equitativamente el espacio vacío */}
      <div className="flex flex-col gap-4">
        {/* GRÁFICO 1: Semicírculo de Fertilidad */}
        <div className="flex flex-col items-center justify-center h-[170px] relative bg-black/20 rounded-xl border border-white/5 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={gaugeData}
                cx="50%" // Centrado automático perfecto en cualquier resolución
                cy="75%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={78}
                dataKey="value"
                stroke="none"
              >
                {gaugeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={0.85}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Aguja Renderizada mediante un SVG absoluto superpuesto */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ left: "50%", transform: "translateX(-100px)" }}
          >
            <defs>
              <linearGradient
                id="needleGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            {/* Cuerpo estilizado: Base ancha en el origen y punta fina metálica */}
            <path
              d={`
                    M ${100 + 6 * Math.cos((180 - (fertilityValue / 100) * 180 + 90) * (Math.PI / 180))} ${110 - 6 * Math.sin((180 - (fertilityValue / 100) * 180 + 90) * (Math.PI / 180))}
                    L ${100 + 75 * Math.cos((180 - (fertilityValue / 100) * 180) * (Math.PI / 180))} ${110 - 75 * Math.sin((180 - (fertilityValue / 100) * 180) * (Math.PI / 180))}
                    L ${100 + 6 * Math.cos((180 - (fertilityValue / 100) * 180 - 90) * (Math.PI / 180))} ${110 - 6 * Math.sin((180 - (fertilityValue / 100) * 180 - 90) * (Math.PI / 180))} Z
                  `}
              fill="url(#needleGrad)"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="0.5"
              style={{ transformOrigin: "50% 75%", transform: "scale(1)" }} // Sincronizado con el cx/cy del Pie
            />
            {/* Pin central metálico */}
            <circle
              cx={cx}
              cy={cy}
              r="6"
              fill="#1e293b"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle cx={cx} cy={cy} r="2" fill="#ffffff" />
          </svg>

          {/* Valor Numérico Central */}
          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none z-10 pt-2">
            <span className="text-2xl font-black text-white font-mono tracking-tight block leading-none">
              {selectedParcel.fertility}
            </span>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium mt-1">
              Tasa de Fertilidad
            </p>
          </div>
        </div>

        {/* GRÁFICO 2: Línea de Tendencia Temporal (Humedad/Fertilidad) */}
        <div className="h-[170px] bg-black/20 rounded-xl border border-white/5 p-3 pr-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: -5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0b1814",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#34d399", fontWeight: "bold" }}
                itemStyle={{ color: "#fff" }}
              />

              {/* Línea de Humedad (Emerald/Cyan) */}
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#34d399"
                strokeWidth={2}
                dot={{
                  r: 3,
                  stroke: "#34d399",
                  fill: "#0b1814",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 5 }}
                name="Humedad"
              />

              {/* Línea de Fertilidad (Amber/Naranja como Subastas) */}
              <Line
                type="monotone"
                dataKey="fertility"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={{
                  r: 3,
                  stroke: "#fbbf24",
                  fill: "#0b1814",
                  strokeWidth: 2,
                }}
                name="Fertilidad"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
