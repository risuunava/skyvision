import { useState, useEffect } from 'react';
import { weatherAPI } from '@/lib/api';
import { 
  CurrentWeatherResponse, 
  HistoryResponse, 
  PredictionResponse 
} from '@/types/weather';

export function useWeatherData(city: string) {
  const [current, setCurrent] = useState<CurrentWeatherResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [currentData, historyData, predictionData] = await Promise.all([
          weatherAPI.getCurrentWeather(city),
          weatherAPI.getHistory(city),
          weatherAPI.getPredictions(city),
        ]);

        setCurrent(currentData);
        setHistory(historyData);
        setPredictions(predictionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  return { current, history, predictions, loading, error };
}