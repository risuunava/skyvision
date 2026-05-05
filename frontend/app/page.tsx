'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';
import { weatherAPI, authAPI, subscriptionAPI } from '@/lib/api';
import { MapCity, AuthUser } from '@/types/weather';
import NotificationPanel from '@/components/NotificationPanel';
import CityDetail from '@/components/CityDetail';
import RiskBadge from '@/components/RiskBadge';
import { Sun, Moon, Cloud, MapPin, LogIn, LogOut, User, ShieldCheck, RefreshCw, Menu, X } from 'lucide-react';
import Link from 'next/link';

const WeatherMap = dynamic(() => import('@/components/WeatherMap'), { ssr: false });

// ── Fallback cities while API loads ──────────────────────────────────────────
const FALLBACK_CITIES: MapCity[] = [
  { id: 1, name: 'Jakarta',   province: 'DKI Jakarta',   latitude: -6.2088,  longitude: 106.8456, temperature: 28, humidity: 75, condition: 'Partly Cloudy', risk_level: 'medium',  risk_score: 0.35 },
  { id: 2, name: 'Surabaya',  province: 'Jawa Timur',    latitude: -7.2575,  longitude: 112.7521, temperature: 30, humidity: 70, condition: 'Clear',         risk_level: 'low',     risk_score: 0.1  },
  { id: 3, name: 'Bandung',   province: 'Jawa Barat',    latitude: -6.9175,  longitude: 107.6191, temperature: 22, humidity: 80, condition: 'Cloudy',        risk_level: 'low',     risk_score: 0.15 },
  { id: 4, name: 'Medan',     province: 'Sumatera Utara', latitude: 3.5952,  longitude: 98.6722,  temperature: 31, humidity: 85, condition: 'Heavy Rain',    risk_level: 'high',    risk_score: 0.6  },
  { id: 5, name: 'Makassar',  province: 'Sulawesi Selatan', latitude: -5.1477, longitude: 119.4327, temperature: 29, humidity: 78, condition: 'Clear',      risk_level: 'medium',  risk_score: 0.3  },
  { id: 6, name: 'Semarang',  province: 'Jawa Tengah',   latitude: -6.9667,  longitude: 110.4167, temperature: 27, humidity: 82, condition: 'Light Rain',   risk_level: 'medium',  risk_score: 0.4  },
  { id: 7, name: 'Palembang', province: 'Sumatera Selatan', latitude: -2.9167, longitude: 104.7458, temperature: 32, humidity: 90, condition: 'Thunderstorm', risk_level: 'extreme', risk_score: 0.85 },
  { id: 8, name: 'Yogyakarta',province: 'DI Yogyakarta', latitude: -7.8014,  longitude: 110.3647, temperature: 25, humidity: 77, condition: 'Partly Cloudy', risk_level: 'low',    risk_score: 0.2  },
];

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (user: AuthUser, token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (mode === 'login') {
        res = await authAPI.login(form.email, form.password);
      } else {
        res = await authAPI.register(form.name, form.email, form.password, form.password_confirmation);
      }
      onSuccess(res.user, res.token);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl p-8 w-full max-w-md mx-4 animate-fade-in-up shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{mode === 'login' ? 'Masuk' : 'Daftar'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors"><X size={20} /></button>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === m ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
              {m === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <input type="text" placeholder="Nama Lengkap" value={form.name} required
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          )}
          <input type="email" placeholder="Email" value={form.email} required
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="password" placeholder="Password" value={form.password} required
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          {mode === 'register' && (
            <input type="password" placeholder="Konfirmasi Password" value={form.password_confirmation} required
              onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          )}
          {error && <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [cities, setCities] = useState<MapCity[]>(FALLBACK_CITIES);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load auth user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
    }
  }, []);

  const fetchMapData = useCallback(async () => {
    setLoadingMap(true);
    try {
      const res = await weatherAPI.getMapData();
      if (res.cities && res.cities.length > 0) {
        setCities(res.cities);
        setLastUpdated(new Date());
      }
    } catch {
      // Keep fallback data
    } finally {
      setLoadingMap(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchMapData]);

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const handleAuthSuccess = (u: AuthUser) => {
    setUser(u);
    setShowAuth(false);
  };

  // Risk summary counts
  const riskSummary = cities.reduce((acc, c) => {
    acc[c.risk_level] = (acc[c.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">SkyVision</span>
              <span className="hidden sm:inline text-muted-foreground text-xs ml-2">Early Warning System</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={fetchMapData} title="Refresh data"
              className="p-2 rounded-lg hover:bg-muted transition-colors" disabled={loadingMap}>
              <RefreshCw className={`w-4 h-4 ${loadingMap ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            </button>
            {user && <NotificationPanel />}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                {user.is_admin && (
                  <Link href="/admin" className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <LogIn className="w-4 h-4" /> Masuk
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileMenuOpen(o => !o)} className="p-2 rounded-lg hover:bg-muted">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 px-4 py-3 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm font-medium"><User className="w-4 h-4" />{user.name}</div>
                {user.is_admin && <Link href="/admin" className="text-sm text-amber-500">Admin Panel</Link>}
                <button onClick={handleLogout} className="text-sm text-left text-muted-foreground">Logout</button>
              </>
            ) : (
              <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                className="text-sm font-medium text-primary text-left">Masuk / Daftar</button>
            )}
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 dark:from-blue-900 dark:via-blue-800 dark:to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
            🌤 Prediksi Cuaca Indonesia
          </h1>
          <p className="text-blue-100 text-base mb-6 max-w-xl">
            Pantau cuaca real-time &amp; prediksi 24 jam berbasis LSTM + Prophet ML. Klik kota untuk detail.
          </p>

          {/* Risk summary */}
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'low',     label: 'Rendah',  color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' },
              { key: 'medium',  label: 'Sedang',  color: 'bg-yellow-500/20  text-yellow-200  border-yellow-400/30'  },
              { key: 'high',    label: 'Tinggi',  color: 'bg-orange-500/20  text-orange-200  border-orange-400/30'  },
              { key: 'extreme', label: 'Ekstrem', color: 'bg-red-500/20     text-red-200     border-red-400/30'     },
            ].map(({ key, label, color }) => (
              <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${color}`}>
                <MapPin className="w-3.5 h-3.5" />
                {riskSummary[key] || 0} {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Map */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Peta Risiko Cuaca
            </h2>
            {loadingMap && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Memuat data…
              </span>
            )}
          </div>
          <WeatherMap cities={cities} onCitySelect={setSelectedCity} selectedCity={selectedCity} />
        </section>

        {/* City detail or empty state */}
        {selectedCity ? (
          <section className="animate-fade-in-up">
            <CityDetail city={selectedCity} user={user} />
          </section>
        ) : (
          <section>
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-xl font-semibold mb-2">Pilih Kota di Peta</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Klik marker pada peta untuk melihat data cuaca lengkap, prediksi 24 jam, dan grafik historis.
              </p>
              {cities.some(c => c.risk_level === 'extreme' || c.risk_level === 'high') && (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {cities.filter(c => c.risk_level === 'extreme' || c.risk_level === 'high').map(c => (
                    <button key={c.id} onClick={() => setSelectedCity(c.name)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
                      ⚠ {c.name} — {c.risk_level.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>SkyVision © 2026 — Data cuaca dari BMKG. Prediksi menggunakan LSTM &amp; Prophet ML.</p>
        </div>
      </footer>

      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
    </div>
  );
}