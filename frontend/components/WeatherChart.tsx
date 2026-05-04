'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface WeatherDataPoint {
  temperature: number;
  humidity: number;
  wind_speed: number;
  cloud_cover: number;
  condition?: string;
  timestamp: string;
}

interface WeatherChartProps {
  history: WeatherDataPoint[];
  predictions: WeatherDataPoint[];
  dataType: 'temperature' | 'humidity' | 'wind_speed' | 'cloud_cover';
}

const dataTypeConfig = {
  temperature: { label: 'Temperature', unit: '°C', color: '#EF4444', range: [15, 40] as [number, number] },
  humidity: { label: 'Humidity', unit: '%', color: '#3B82F6', range: [0, 100] as [number, number] },
  wind_speed: { label: 'Wind Speed', unit: 'km/h', color: '#10B981', range: [0, 60] as [number, number] },
  cloud_cover: { label: 'Cloud Cover', unit: '%', color: '#8B5CF6', range: [0, 100] as [number, number] },
};

export default function WeatherChart({ history, predictions, dataType }: WeatherChartProps) {
  const config = dataTypeConfig[dataType];

  const chartData = [
    ...history.map((h) => ({
      timestamp: format(new Date(h.timestamp), 'HH:mm'),
      actual: h[dataType],
      predicted: null,
      type: 'Historical',
    })),
    ...predictions.map((p) => ({
      timestamp: format(new Date(p.timestamp), 'HH:mm'),
      actual: null,
      predicted: p[dataType],
      type: 'Predicted',
    })),
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{config.label} Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={config.range} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="actual" stroke={config.color} strokeWidth={2} dot={{ r: 3 }} name="Actual" />
          <Line type="monotone" dataKey="predicted" stroke={config.color} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Predicted" opacity={0.7} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}