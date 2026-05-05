'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon for Next.js (no .src access on static imports)
import L from 'leaflet';

// Delete the broken _getIconUrl then provide CDN urls
function fixLeafletIcon() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

import { MapCity } from '@/types/weather';

interface WeatherMapProps {
  cities: MapCity[];
  onCitySelect: (cityName: string) => void;
  selectedCity?: string | null;
}

const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'extreme': return '#DC2626';
    case 'high':    return '#EA580C';
    case 'medium':  return '#F59E0B';
    case 'low':     return '#10B981';
    default:        return '#6B7280';
  }
};

const getRiskLabel = (riskLevel: string) => riskLevel.toUpperCase();

export default function WeatherMap({ cities, onCitySelect, selectedCity }: WeatherMapProps) {
  const center: LatLngExpression = [-2.5, 118];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcon();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[460px] rounded-xl bg-muted animate-shimmer flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50 relative">
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '460px', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {cities.map((city) => {
          const color = getRiskColor(city.risk_level);
          const isSelected = selectedCity === city.name;

          return (
            <CircleMarker
              key={city.id}
              center={[city.latitude, city.longitude]}
              radius={isSelected ? 14 : 10}
              fillColor={color}
              color={isSelected ? '#fff' : color}
              weight={isSelected ? 3 : 1.5}
              opacity={1}
              fillOpacity={0.85}
              eventHandlers={{ click: () => onCitySelect(city.name) }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-xs font-medium space-y-0.5" style={{ minWidth: 110 }}>
                  <p className="font-bold text-sm">{city.name}</p>
                  <p>🌡 {city.temperature.toFixed(1)}°C · 💧 {city.humidity.toFixed(0)}%</p>
                  <p style={{ color }}>⚠ {getRiskLabel(city.risk_level)}</p>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm space-y-1 p-1" style={{ minWidth: 150 }}>
                  <h3 className="font-bold text-base">{city.name}</h3>
                  <p className="text-gray-500 text-xs">{city.province}</p>
                  <div className="grid grid-cols-2 gap-x-2 text-xs mt-2">
                    <span>🌡 Temp</span>
                    <span className="font-medium">{city.temperature.toFixed(1)}°C</span>
                    <span>💧 Humidity</span>
                    <span className="font-medium">{city.humidity.toFixed(0)}%</span>
                    <span>⚠ Risk</span>
                    <span className="font-bold" style={{ color }}>{getRiskLabel(city.risk_level)}</span>
                  </div>
                  <button
                    onClick={() => onCitySelect(city.name)}
                    className="mt-2 w-full py-1 px-3 rounded text-white text-xs font-medium"
                    style={{ background: color }}
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass rounded-lg px-3 py-2 flex gap-3 text-xs font-medium">
        {[
          { label: 'Low',     color: '#10B981' },
          { label: 'Medium',  color: '#F59E0B' },
          { label: 'High',    color: '#EA580C' },
          { label: 'Extreme', color: '#DC2626' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}