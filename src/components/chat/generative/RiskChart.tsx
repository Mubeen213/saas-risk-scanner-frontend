import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface RiskChartProps {
  data: {
    total_apps: number;
    high_risk_apps: number;
    medium_risk_apps: number;
    low_risk_apps: number;
  };
}

const COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

export const RiskChart = ({ data }: RiskChartProps) => {
  const chartData = [
    { name: "High Risk", value: data.high_risk_apps, color: COLORS.high },
    { name: "Medium Risk", value: data.medium_risk_apps, color: COLORS.medium },
    { name: "Low Risk", value: data.low_risk_apps, color: COLORS.low },
  ];

  return (
    <div className="w-full h-64 bg-background-primary rounded-xl border border-border-light p-4">
      <h3 className="text-sm font-medium text-text-secondary mb-2">
        Risk Distribution ({data.total_apps} apps)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
