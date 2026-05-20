import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface MiniSensorChartProps {
  data: { value: number }[];
  color: string;
}

export const MiniSensorChart = ({
  data,
  color,
}: MiniSensorChartProps) => (
  <div style={{ width: "100%", height: "40px" }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />

        <Line
          type="linear"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);