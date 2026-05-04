'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import CityDetail from '@/components/CityDetail';

const WeatherMap = dynamic(
  () => import('@/components/WeatherMap'),
  { ssr: false }
);

// Sample data - replace with API call
const sampleCities = [
  { id: 1, name: 'Jakarta', latitude: -6.2088, longitude: 106.8456, risk_level: 'medium', temperature: 28 },
  { id: 2, name: 'Surabaya', latitude: -7.2575, longitude: 112.7521, risk_level: 'low', temperature: 30 },
  { id: 3, name: 'Bandung', latitude: -6.9175, longitude: 107.6191, risk_level: 'low', temperature: 22 },
  { id: 4, name: 'Medan', latitude: 3.5952, longitude: 98.6722, risk_level: 'high', temperature: 31 },
  { id: 5, name: 'Makassar', latitude: -5.1477, longitude: 119.4327, risk_level: 'medium', temperature: 29 },
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              🌤️ SkyVision
            </h1>
            <p className="text-sm text-gray-600">
              Weather Prediction & Early Warning System
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Map Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Weather Map</h2>
          <WeatherMap 
            cities={sampleCities}
            onCitySelect={setSelectedCity}
          />
        </section>

        {/* City Detail */}
        {selectedCity && (
          <section>
            <CityDetail city={selectedCity} />
          </section>
        )}

        {/* Default State */}
        {!selectedCity && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Select a City
            </h2>
            <p className="text-gray-500">
              Click on a city marker on the map to view detailed weather information
            </p>
          </div>
        )}
      </main>
    </div>
  );
}