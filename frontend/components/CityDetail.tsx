'use client';

import { useWeatherData } from '@/hooks/useWeather';
import WeatherChart from './WeatherChart';
import RiskBadge from './RiskBadge';
import { format } from 'date-fns';

interface CityDetailProps {
  city: string;
}

export default function CityDetail({ city }: CityDetailProps) {
  const { current, history, predictions, loading, error } = useWeatherData(city);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading data: {error}</p>
      </div>
    );
  }

  if (!current || !history || !predictions) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available for {city}</p>
      </div>
    );
  }

  const latestPrediction = predictions.predictions[0];
  const riskLevel = latestPrediction ? latestPrediction.risk_level : 'low';

  return (
    <div className="space-y-6">
      {/* City Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{current.city.name}</h2>
          <p className="text-gray-600">{current.city.province}</p>
        </div>
        <RiskBadge 
          level={riskLevel} 
          score={latestPrediction?.risk_score}
        />
      </div>

      {/* Current Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Temperature</h3>
          <p className="text-2xl font-bold">{current.weather.temperature}°C</p>
          <p className="text-xs text-gray-400">
            {current.weather.condition}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Humidity</h3>
          <p className="text-2xl font-bold">{current.weather.humidity}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Wind Speed</h3>
          <p className="text-2xl font-bold">{current.weather.wind_speed} km/h</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Cloud Cover</h3>
          <p className="text-2xl font-bold">{current.weather.cloud_cover}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherChart
          history={history.history}
          predictions={predictions.predictions}
          dataType="temperature"
        />
        <WeatherChart
          history={history.history}
          predictions={predictions.predictions}
          dataType="humidity"
        />
        <WeatherChart
          history={history.history}
          predictions={predictions.predictions}
          dataType="wind_speed"
        />
        <WeatherChart
          history={history.history}
          predictions={predictions.predictions}
          dataType="cloud_cover"
        />
      </div>

      {/* Predictions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">
          24-Hour Predictions (LSTM)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Temp (°C)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Humidity (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Wind (km/h)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {predictions.predictions.map((pred, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {format(new Date(pred.timestamp), 'HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {pred.temperature.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {pred.humidity.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {pred.wind_speed.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RiskBadge 
                      level={pred.risk_level} 
                      className="scale-75"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}