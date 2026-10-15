import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ForecastChartProps {
  data: {
    period: string;
    actual?: number;
    forecast: number;
    lower: number;
    upper: number;
  }[];
  dataKey?: string;
  name?: string;
  valueFormatter?: (val: number) => string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  dataKey = 'forecast',
  name = 'Forecasted Value',
  valueFormatter = (val) => val.toLocaleString(),
}) => {
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="period"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => valueFormatter(val)}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
            formatter={(value: any, nameStr: any) => [valueFormatter(value), nameStr]}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

          {/* Shaded confidence interval area */}
          <Area
            name="Confidence Range"
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#colorConfidence)"
            // Use low key as reference range
            // recharts doesn't natively support range area as clean without custom ranges,
            // but we can map low range to dataKey or use Area with two points
            // Alternatively, we can draw the Area with dataKey = "upper" and fill it,
            // or just render upper and lower lines with transparent bounds.
          />
          <Area
            name="Confidence Bounds"
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#ffffff" // hides lower area to construct the bounds band
            className="dark:fill-slate-900"
          />

          {/* Actual Line */}
          <Line
            name="Actual Data"
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />

          {/* Forecasted Line */}
          <Line
            name={name}
            type="monotone"
            dataKey={dataKey}
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
export default ForecastChart;
