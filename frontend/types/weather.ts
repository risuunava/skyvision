export interface City {
  id: number;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  bmkg_code: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  wind_speed: number;
  cloud_cover: number;
  condition: string;
  recorded_at: string;
}

export interface WeatherHistory {
  temperature: number;
  humidity: number;
  wind_speed: number;
  cloud_cover: number;
  condition: string;
  timestamp: string;
}

export interface Prediction {
  timestamp: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  cloud_cover: number;
  confidence: number;
  risk_level: 'low' | 'medium' | 'high' | 'extreme';
  risk_score: number;
}

export interface MapCity {
  id: number;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  condition: string;
  risk_level: 'low' | 'medium' | 'high' | 'extreme';
  risk_score: number;
}

// ── API Response types ────────────────────────────────────────────────────────

export interface CurrentWeatherResponse {
  city: Pick<City, 'id' | 'name' | 'province' | 'latitude' | 'longitude'>;
  weather: WeatherData;
}

export interface HistoryResponse {
  city: Pick<City, 'id' | 'name'>;
  history: WeatherHistory[];
}

export interface PredictionResponse {
  city: Pick<City, 'id' | 'name'>;
  model_type: 'lstm' | 'prophet';
  predictions: Prediction[];
}

export interface MapDataResponse {
  cities: MapCity[];
}

export interface CitiesResponse {
  cities: City[];
  total: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface Notification {
  id: number;
  city_id: number;
  city_name: string;
  type: 'warning' | 'alert' | 'info';
  title: string;
  message: string;
  sent_at: string;
  created_at: string;
}

export interface AdminMetrics {
  total_predictions: number;
  predictions_by_model: Array<{ model_type: string; count: number }>;
  predictions_by_risk: Array<{ risk_level: string; count: number }>;
  total_notifications: number;
  recent_notifications: Array<{
    id: number; city: string; title: string; type: string; sent_at: string; recipients: number;
  }>;
  model_accuracy: number;
  high_risk_cities: Array<{
    city: string; risk_level: string; risk_score: number; time: string;
  }>;
  total_users: number;
}