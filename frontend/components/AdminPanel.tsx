'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { AdminMetrics } from '@/types/weather';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Brain, Bell, Users, Activity, TrendingUp, AlertTriangle,
  RefreshCw, ChevronRight, CheckCircle
} from 'lucide-react';

const RISK_COLORS: Record<string, string> = {
  low: '#10B981', medium: '#F59E0B', high: '#EA580C', extreme: '#DC2626',
};

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="glass rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg bg-primary/10`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-extrabold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getMetrics();
      setMetrics(data);
      setError('');
    } catch {
      setError('Gagal memuat metrik. Pastikan sudah login sebagai admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded-lg w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center border border-destructive/30">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <p className="text-destructive font-medium">{error}</p>
        <button onClick={fetchMetrics} className="mt-3 text-sm underline text-muted-foreground">Coba lagi</button>
      </div>
    );
  }

  if (!metrics) return null;

  const riskData = metrics.predictions_by_risk.map(r => ({
    name: r.risk_level.charAt(0).toUpperCase() + r.risk_level.slice(1),
    value: r.count,
    color: RISK_COLORS[r.risk_level] ?? '#6B7280',
  }));

  const modelData = metrics.predictions_by_model.map(m => ({
    name: m.model_type.toUpperCase(),
    value: m.count,
  }));

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" /> Metrik Sistem ML
          </h2>
          <button onClick={fetchMetrics} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Brain}      label="Total Prediksi"    value={metrics.total_predictions.toLocaleString()} color="text-blue-500" />
          <StatCard icon={Bell}       label="Notifikasi Dikirim" value={metrics.total_notifications.toLocaleString()} color="text-yellow-500" />
          <StatCard icon={CheckCircle} label="Akurasi Model"     value={`${(metrics.model_accuracy * 100).toFixed(1)}%`} color="text-emerald-500" />
          <StatCard icon={Users}      label="Total Pengguna"    value={metrics.total_users.toLocaleString()} color="text-purple-500" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk distribution */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Distribusi Risiko Prediksi
          </h3>
          {riskData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data prediksi</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" name="Prediksi" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Model usage */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Penggunaan Model ML
          </h3>
          {modelData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data prediksi</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modelData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" name="Prediksi" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* High risk cities */}
      {metrics.high_risk_cities.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Kota Risiko Tinggi
          </h3>
          <div className="space-y-2">
            {metrics.high_risk_cities.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: RISK_COLORS[c.risk_level] ?? '#6B7280' }}>
                    {i + 1}
                  </span>
                  <span className="font-medium text-sm">{c.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: RISK_COLORS[c.risk_level] + '22', color: RISK_COLORS[c.risk_level] }}>
                    {c.risk_level.toUpperCase()}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent notifications */}
      {metrics.recent_notifications.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-500" /> Notifikasi Terbaru
          </h3>
          <div className="space-y-2">
            {metrics.recent_notifications.map((n, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.city} · {n.type}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{n.recipients} penerima</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}