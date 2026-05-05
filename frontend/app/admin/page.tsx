'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';
import { adminAPI, authAPI } from '@/lib/api';
import { AuthUser } from '@/types/weather';
import { ShieldCheck, ArrowLeft, Sliders, LogOut, Moon, Sun, RefreshCw } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function AdminPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'thresholds'>('metrics');
  const [thresholds, setThresholds] = useState<Array<{
    parameter: string; low_threshold: number; medium_threshold: number; high_threshold: number; condition: string;
  }>>([]);
  const [loadingThresholds, setLoadingThresholds] = useState(false);

  // Auth guard
  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('auth_user');
    if (!stored) { router.replace('/'); return; }
    try {
      const u: AuthUser = JSON.parse(stored as string);
      if (!u.is_admin) { router.replace('/'); return; }
      setUser(u);
    } catch { router.replace('/'); }
  }, [router]);

  const fetchThresholds = async () => {
    setLoadingThresholds(true);
    try {
      const res = await adminAPI.getThresholds();
      setThresholds(res.thresholds || []);
    } catch { /* ignore */ }
    finally { setLoadingThresholds(false); }
  };

  useEffect(() => {
    if (activeTab === 'thresholds') fetchThresholds();
  }, [activeTab]);

  const handleLogout = async () => {
    await authAPI.logout();
    router.replace('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-sm">Memeriksa akses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <span className="font-bold text-sm">Admin Panel</span>
                <span className="text-muted-foreground text-xs ml-2">SkyVision</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab navigation */}
        <div className="flex gap-2 mb-8 p-1 bg-muted rounded-xl w-fit">
          {[
            { key: 'metrics',    label: 'Metrik ML',   icon: ShieldCheck },
            { key: 'thresholds', label: 'Threshold',   icon: Sliders     },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key as 'metrics' | 'thresholds')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'metrics' && <AdminPanel />}

        {activeTab === 'thresholds' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" /> Threshold Risiko
              </h2>
              <button onClick={fetchThresholds} disabled={loadingThresholds}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingThresholds ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {loadingThresholds ? (
              <div className="glass rounded-2xl p-8 text-center animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
              </div>
            ) : (
              <div className="grid gap-4">
                {thresholds.map((t, i) => (
                  <div key={i} className="glass rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold capitalize">{t.parameter.replace('_', ' ')}</h3>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{t.condition}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Rendah',  value: t.low_threshold,    color: 'text-emerald-500' },
                        { label: 'Sedang',  value: t.medium_threshold,  color: 'text-yellow-500'  },
                        { label: 'Tinggi',  value: t.high_threshold,    color: 'text-red-500'     },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className={`text-xl font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {thresholds.length === 0 && (
                  <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      Jalankan: <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">php artisan db:seed --class=RiskThresholdSeeder</code>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}