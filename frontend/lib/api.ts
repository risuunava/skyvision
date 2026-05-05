import axios, { AxiosInstance } from 'axios';
import {
  CurrentWeatherResponse,
  HistoryResponse,
  PredictionResponse,
  MapDataResponse,
  CitiesResponse,
} from '@/types/weather';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ── Axios instance ────────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    const { data } = await api.post('/register', { name, email, password, password_confirmation });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await api.post('/login', { email, password });
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    return data;
  },
  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  },
  getUser: async () => {
    const { data } = await api.get('/user');
    return data;
  },
};

// ── Weather API ───────────────────────────────────────────────────────────────
export const weatherAPI = {
  getCities: async (): Promise<CitiesResponse> => {
    const { data } = await api.get('/weather/cities');
    return data;
  },

  getMapData: async (): Promise<MapDataResponse> => {
    const { data } = await api.get('/weather/map-data');
    return data;
  },

  getCurrentWeather: async (city: string): Promise<CurrentWeatherResponse> => {
    const { data } = await api.get(`/weather/current/${encodeURIComponent(city)}`);
    return data;
  },

  getHistory: async (city: string, hours = 48): Promise<HistoryResponse> => {
    const { data } = await api.get(`/weather/history/${encodeURIComponent(city)}`, { params: { hours } });
    return data;
  },

  getPredictions: async (city: string, model: 'lstm' | 'prophet' = 'lstm'): Promise<PredictionResponse> => {
    const { data } = await api.get(`/weather/prediction/${encodeURIComponent(city)}`, { params: { model } });
    return data;
  },
};

// ── Subscription API ──────────────────────────────────────────────────────────
export const subscriptionAPI = {
  subscribe: async (cityId: number, fcmToken = 'local-dev-token') => {
    const { data } = await api.post('/subscribe', { city_id: cityId, fcm_token: fcmToken });
    return data;
  },

  unsubscribe: async (cityId: number) => {
    const { data } = await api.post('/unsubscribe', { city_id: cityId });
    return data;
  },

  list: async () => {
    const { data } = await api.get('/subscriptions');
    return data;
  },

  getNotifications: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },

  markAllRead: async () => {
    await api.post('/notifications/read-all');
  },
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getMetrics: async () => {
    const { data } = await api.get('/admin/metrics');
    return data;
  },

  getThresholds: async () => {
    const { data } = await api.get('/admin/thresholds');
    return data;
  },

  updateThreshold: async (payload: {
    parameter: string;
    low_threshold: number;
    medium_threshold: number;
    high_threshold: number;
    condition: 'greater_than' | 'less_than';
  }) => {
    const { data } = await api.post('/admin/threshold', payload);
    return data;
  },

  getUsers: async () => {
    const { data } = await api.get('/admin/users');
    return data;
  },

  getLogs: async () => {
    const { data } = await api.get('/admin/logs');
    return data;
  },
};

export default api;