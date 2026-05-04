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

export interface CurrentWeatherResponse {
  city: City;
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