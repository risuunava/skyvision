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
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800">Error: {error}</p></div>;
  }

  if (!current || !history || !predictions) {
    return <div className="text-center py-8"><p className="text-gray-500">No data available for {city}</p></div>;
  }

  const latestPrediction = predictions.predictions[0];
  const riskLevel = latestPrediction ? latestPrediction.risk_level : 'low';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{current.city.name}</h2>
          <p className="text-gray-600">{current.city.province}</p>
        </div>
        <RiskBadge level={riskLevel} score={latestPrediction?.risk_score} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Temperature</h3><p className="text-2xl font-bold">{current.weather.temperature}°C</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Humidity</h3><p className="text-2xl font-bold">{current.weather.humidity}%</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Wind Speed</h3><p className="text-2xl font-bold">{current.weather.wind_speed} km/h</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Cloud Cover</h3><p className="text-2xl font-bold">{current.weather.cloud_cover}%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherChart history={history.history} predictions={predictions.predictions} dataType="temperature" />
        <WeatherChart history={history.history} predictions={predictions.predictions} dataType="humidity" />
        <WeatherChart history={history.history} predictions={predictions.predictions} dataType="wind_speed" />
        <WeatherChart history={history.history} predictions={predictions.predictions} dataType="cloud_cover" />
      </div>
    </div>
  );
}