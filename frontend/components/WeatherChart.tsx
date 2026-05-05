'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { WeatherHistory, Prediction } from '@/types/weather';
import { format } from 'date-fns';

interface WeatherChartProps {
  history: WeatherHistory[];
  predictions: Prediction[];
  dataType: 'temperature' | 'humidity' | 'wind_speed' | 'cloud_cover';
}

const dataTypeConfig = {
  temperature: { label: 'Suhu',      unit: '°C',   color: '#EF4444', domain: [15, 42] as [number,number] },
  humidity:    { label: 'Kelembaban', unit: '%',    color: '#3B82F6', domain: [30, 100] as [number,number] },
  wind_speed:  { label: 'Angin',      unit: 'km/h', color: '#10B981', domain: [0, 70] as [number,number] },
  cloud_cover: { label: 'Awan',       unit: '%',    color: '#8B5CF6', domain: [0, 100] as [number,number] },
};

export default function WeatherChart({ history, predictions, dataType }: WeatherChartProps) {
  const config = dataTypeConfig[dataType];

  const chartData = [
    ...history.slice(-24).map(h => ({
      time:      format(new Date(h.timestamp), 'HH:mm'),
      actual:    h[dataType] as number,
      predicted: null as number | null,
      type: 'hist',
    })),
    ...predictions.slice(0, 24).map(p => ({
      time:      format(new Date(p.timestamp), 'HH:mm'),
      actual:    null as number | null,
      predicted: p[dataType] as number,
      type: 'pred',
    })),
  ];

  // Mark where history ends
  const splitIdx = history.slice(-24).length;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number | null; color: string; payload: { type: string } }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg border border-border/50">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, i) =>
          entry.value !== null ? (
            <p key={i} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value} {config.unit}
            </p>
          ) : null
        )}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <h4 className="text-sm font-semibold mb-3 text-foreground">
        {config.label} ({config.unit})
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.4} />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={5} className="text-muted-foreground" />
          <YAxis domain={config.domain} tick={{ fontSize: 10 }} className="text-muted-foreground" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {splitIdx > 0 && <ReferenceLine x={chartData[splitIdx - 1]?.time} stroke="#6B7280" strokeDasharray="4 4" label={{ value: 'Sekarang', position: 'insideTopRight', fontSize: 9, fill: '#6B7280' }} />}
          <Line type="monotone" dataKey="actual" stroke={config.color} strokeWidth={2} dot={false} name="Aktual" connectNulls={false} />
          <Line type="monotone" dataKey="predicted" stroke={config.color} strokeWidth={2} strokeDasharray="6 3" dot={false} name="Prediksi" opacity={0.75} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}