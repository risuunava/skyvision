'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WeatherHistory, Prediction } from '@/types/weather';
import { format } from 'date-fns';

interface WeatherChartProps {
  history: WeatherHistory[];
  predictions: Prediction[];
  dataType: 'temperature' | 'humidity' | 'wind_speed' | 'cloud_cover';
}

const dataTypeConfig = {
  temperature: {
    label: 'Temperature',
    unit: '°C',
    color: '#EF4444',
    range: [15, 40] as [number, number],
  },
  humidity: {
    label: 'Humidity',
    unit: '%',
    color: '#3B82F6',
    range: [0, 100] as [number, number],
  },
  wind_speed: {
    label: 'Wind Speed',
    unit: 'km/h',
    color: '#10B981',
    range: [0, 60] as [number, number],
  },
  cloud_cover: {
    label: 'Cloud Cover',
    unit: '%',
    color: '#8B5CF6',
    range: [0, 100] as [number, number],
  },
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
      confidence: p.confidence,
    })),
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{config.label} Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            domain={config.range}
            label={{ 
              value: `${config.label} (${config.unit})`, 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border p-2 rounded shadow-lg">
                    <p className="text-sm font-medium">Time: {label}</p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value?.toFixed(2)} {config.unit}
                        {entry.payload.confidence && (
                          <span className="text-xs ml-2">
                            ({entry.payload.confidence * 100}% confidence)
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            stroke={config.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Actual"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke={config.color}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            name="Predicted"
            opacity={0.7}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}