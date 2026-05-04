import axios from 'axios';
import { 
  CurrentWeatherResponse, 
  HistoryResponse, 
  PredictionResponse 
} from '@/types/weather';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const weatherAPI = {
  getCurrentWeather: async (city: string): Promise<CurrentWeatherResponse> => {
    const { data } = await api.get(`/weather/current/${city}`);
    return data;
  },

  getHistory: async (city: string, hours: number = 48): Promise<HistoryResponse> => {
    const { data } = await api.get(`/weather/history/${city}`, {
      params: { hours }
    });
    return data;
  },

  getPredictions: async (
    city: string, 
    model: 'lstm' | 'prophet' = 'lstm'
  ): Promise<PredictionResponse> => {
    const { data } = await api.get(`/weather/prediction/${city}`, {
      params: { model }
    });
    return data;
  },

  subscribe: async (cityId: number, fcmToken: string) => {
    const { data } = await api.post('/subscribe', {
      city_id: cityId,
      fcm_token: fcmToken,
    });
    return data;
  },

  unsubscribe: async (cityId: number) => {
    const { data } = await api.post('/unsubscribe', {
      city_id: cityId,
    });
    return data;
  },
};