'use client';

import { useWeatherData } from '../hooks/useWeather';
import WeatherChart from './WeatherChart';
import RiskBadge from './RiskBadge';
import { weatherAPI, subscriptionAPI } from '@/lib/api';
import { AuthUser } from '@/types/weather';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Thermometer, Droplets, Wind, Cloud, Bell, BellOff, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface CityDetailProps {
  city: string;
  user?: AuthUser | null;
}

export default function CityDetail({ city, user }: CityDetailProps) {
  const { current, history, predictions, loading, error, refetch } = useWeatherData(city);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [activeModel, setActiveModel] = useState<'lstm' | 'prophet'>('lstm');

  const handleSubscribe = async () => {
    if (!user || !current) return;
    setSubscribing(true);
    try {
      if (subscribed) {
        await subscriptionAPI.unsubscribe(current.city.id);
        setSubscribed(false);
      } else {
        await subscriptionAPI.subscribe(current.city.id);
        setSubscribed(true);
      }
    } catch { /* ignore */ }
    finally { setSubscribing(false); }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded-lg w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 border border-destructive/30 bg-destructive/5">
        <p className="text-destructive font-medium">⚠ Gagal memuat data: {error}</p>
        <button onClick={refetch} className="mt-3 text-sm underline text-muted-foreground">Coba lagi</button>
      </div>
    );
  }

  if (!current || !history || !predictions) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">Tidak ada data untuk <strong>{city}</strong></p>
      </div>
    );
  }

  const latestPrediction = predictions.predictions[0];
  const riskLevel = latestPrediction?.risk_level ?? 'low';

  const weatherCards = [
    { label: 'Suhu',      value: `${current.weather.temperature}°C`,     icon: Thermometer, color: 'text-orange-500' },
    { label: 'Kelembaban',value: `${current.weather.humidity}%`,           icon: Droplets,    color: 'text-blue-500'   },
    { label: 'Angin',     value: `${current.weather.wind_speed} km/h`,     icon: Wind,        color: 'text-teal-500'   },
    { label: 'Awan',      value: `${current.weather.cloud_cover}%`,        icon: Cloud,       color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">{current.city.name}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{current.city.province}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {current.weather.condition} ·{' '}
            {format(new Date(current.weather.recorded_at), 'dd MMM yyyy, HH:mm', { locale: id })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <RiskBadge level={riskLevel} score={latestPrediction?.risk_score} />
          <div className="flex gap-2">
            <button onClick={refetch} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
            {user && (
              <button onClick={handleSubscribe} disabled={subscribing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  subscribed ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                }`}>
                {subscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                {subscribed ? 'Langganan' : 'Langganan'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weather cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {weatherCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-semibold mb-4 px-2">Grafik Cuaca (48 jam historis + 24 jam prediksi)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(['temperature', 'humidity', 'wind_speed', 'cloud_cover'] as const).map(type => (
            <WeatherChart key={type} history={history.history} predictions={predictions.predictions} dataType={type} />
          ))}
        </div>
      </div>

      {/* Predictions table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Prediksi 24 Jam ke Depan</h3>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['lstm', 'prophet'] as const).map(m => (
              <button key={m} onClick={() => setActiveModel(m)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeModel === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <th className="px-4 py-3 text-left">Waktu</th>
                <th className="px-4 py-3 text-right">Suhu</th>
                <th className="px-4 py-3 text-right">Kelembaban</th>
                <th className="px-4 py-3 text-right">Angin</th>
                <th className="px-4 py-3 text-right">Keyakinan</th>
                <th className="px-4 py-3 text-center">Risiko</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {predictions.predictions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">Belum ada data prediksi. Jalankan ML service dan scheduler.</td></tr>
              ) : predictions.predictions.map((pred, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {format(new Date(pred.timestamp), 'EEE HH:mm', { locale: id })}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{Number(pred.temperature).toFixed(1)}°C</td>
                  <td className="px-4 py-3 text-right tabular-nums">{Number(pred.humidity).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-right tabular-nums">{Number(pred.wind_speed).toFixed(1)} km/h</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {(Number(pred.confidence) * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <RiskBadge level={pred.risk_level as 'low' | 'medium' | 'high' | 'extreme'} compact />
                    </div>
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