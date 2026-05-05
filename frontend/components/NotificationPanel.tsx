'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, RefreshCw, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { subscriptionAPI, authAPI } from '@/lib/api';
import { Notification } from '@/types/weather';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const typeConfig = {
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  alert:   { icon: AlertCircle,   color: 'text-red-500',    bg: 'bg-red-500/10'    },
  info:    { icon: Info,          color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
};

export default function NotificationPanel() {
  const [isOpen, setIsOpen]             = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]           = useState(false);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
  }, []);

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const res = await subscriptionAPI.getNotifications();
      setNotifications(res.notifications || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && isOpen) fetchNotifications();
  }, [isOpen, isLoggedIn]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isLoggedIn) return null;

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        title="Notifikasi"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 glass rounded-2xl shadow-2xl border border-border/50 z-50 animate-fade-in-up overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifikasi Cuaca</h3>
            <div className="flex items-center gap-2">
              <button onClick={fetchNotifications} disabled={loading} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
                <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Subscribe ke kota untuk mendapatkan peringatan</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map(n => {
                  const cfg = typeConfig[n.type] ?? typeConfig.info;
                  const Icon = cfg.icon;
                  return (
                    <div key={n.id} className={`px-4 py-3 hover:bg-muted/30 transition-colors ${cfg.bg}`}>
                      <div className="flex gap-3">
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-primary font-medium">{n.city_name}</span>
                            <span className="text-[10px] text-muted-foreground/60">
                              {formatDistanceToNow(new Date(n.sent_at || n.created_at), { addSuffix: true, locale: id })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border">
              <button onClick={() => subscriptionAPI.markAllRead().then(() => setNotifications([]))}
                className="text-xs text-primary hover:underline">Tandai semua sudah dibaca</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}