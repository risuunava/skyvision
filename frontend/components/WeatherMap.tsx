'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CityWeather {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  risk_level: string;
  temperature: number;
}

interface WeatherMapProps {
  cities: CityWeather[];
  onCitySelect: (cityName: string) => void;
}

const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'extreme': return '#DC2626';
    case 'high': return '#EA580C';
    case 'medium': return '#F59E0B';
    case 'low': return '#10B981';
    default: return '#6B7280';
  }
};

export default function WeatherMap({ cities, onCitySelect }: WeatherMapProps) {
  const center: LatLngExpression = [-2.5, 118];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '400px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <CircleMarker
            key={city.id}
            center={[city.latitude, city.longitude]}
            radius={10}
            fillColor={getRiskColor(city.risk_level)}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
            eventHandlers={{
              click: () => onCitySelect(city.name),
            }}
          >
            <Tooltip>
              <div className="text-sm">
                <strong>{city.name}</strong><br />
                Temp: {city.temperature}°C<br />
                Risk: {city.risk_level.toUpperCase()}
              </div>
            </Tooltip>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-lg mb-2">{city.name}</h3>
                <p>Temperature: {city.temperature}°C</p>
                <p>Risk Level: <span style={{ color: getRiskColor(city.risk_level) }}>
                  {city.risk_level.toUpperCase()}
                </span></p>
                <button 
                  onClick={() => onCitySelect(city.name)}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}