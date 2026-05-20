import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeProps {
  percentage: number;
  color: string;
}

export function GaugeSensorChart({ percentage, color }: GaugeProps) {
  // Limitamos el porcentaje entre 0 y 100 por seguridad
  const validPercent = Math.min(Math.max(percentage, 0), 100);
  
  // Datos: la parte llena y la parte vacía para completar el 100%
  const data = [
    { value: validPercent },
    { value: 100 - validPercent },
  ];

  return (
    <div className="w-[80px] h-[35px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={data}
            cx="50%"            // Centrado horizontal
            cy="100%"           // Anclado al fondo para que el pivote sea la base
            startAngle={180}    // Empieza a la izquierda
            endAngle={0}        // Termina a la derecha
            innerRadius={22}    // Radio interno (grosor del arco)
            outerRadius={30}    // Radio externo
            paddingAngle={0}
            dataKey="value"
            stroke="none"       // Quita bordes molestos entre secciones
          >
            {/* Color del progreso actual */}
            <Cell fill={color} />
            {/* Color del fondo restante (un gris sutil con opacidad) */}
            <Cell fill="rgba(255, 255, 255, 0.08)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}