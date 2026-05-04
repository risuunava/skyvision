'use client';

import { useState, useEffect } from 'react';

interface AdminMetrics {
  total_predictions: number;
  total_notifications: number;
  model_accuracy: number;
}

export default function AdminPanel() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockMetrics: AdminMetrics = { total_predictions: 2450, total_notifications: 156, model_accuracy: 0.89 };
    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/4" /></div>;

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">Total Predictions</p><p className="text-2xl font-bold">{metrics?.total_predictions}</p></div>
        <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">Notifications Sent</p><p className="text-2xl font-bold">{metrics?.total_notifications}</p></div>
        <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">Model Accuracy</p><p className="text-2xl font-bold">{(metrics?.model_accuracy ?? 0 * 100).toFixed(1)}%</p></div>
      </div>
    </div>
  );
}