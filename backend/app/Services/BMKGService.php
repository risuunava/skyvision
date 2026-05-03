<?php

namespace App\Services;

use App\Models\City;
use App\Models\WeatherData;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BMKGService
{
    private string $baseUrl;
    private int $cacheTimeout = 3600; // 1 hour

    public function __construct()
    {
        $this->baseUrl = config('services.bmkg.url', 'https://api.bmkg.go.id/publik/prakiraan-cuaca');
    }

    /**
     * Fetch weather data from BMKG API for a specific city
     */
    public function fetchWeatherData(City $city): ?array
    {
        $cacheKey = "bmkg_weather_{$city->bmkg_code}";

        // Try to get from cache first
        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }

        try {
            $response = Http::timeout(30)
                ->retry(3, 1000)
                ->get("{$this->baseUrl}?adm4={$city->bmkg_code}");

            if ($response->successful()) {
                $data = $response->json();
                
                // Cache the response
                Cache::put($cacheKey, $data, $this->cacheTimeout);
                
                return $this->transformBMKGData($data);
            }

            Log::error("BMKG API Error for {$city->name}: " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("BMKG API Exception: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Transform BMKG API response to our standard format
     */
    private function transformBMKGData(array $rawData): array
    {
        // BMKG API response structure varies, adjust accordingly
        $transformed = [];
        
        // Example transformation - adjust based on actual BMKG API response
        if (isset($rawData['data'])) {
            foreach ($rawData['data'] as $item) {
                $transformed[] = [
                    'temperature' => $item['t'] ?? null,
                    'humidity' => $item['hu'] ?? null,
                    'wind_speed' => $item['ws'] ?? null,
                    'cloud_cover' => $item['tcc'] ?? null,
                    'weather_condition' => $item['weather_desc'] ?? 'unknown',
                    'hour' => (int) date('H', strtotime($item['local_datetime'] ?? 'now')),
                    'day_of_week' => (int) date('w', strtotime($item['local_datetime'] ?? 'now')),
                ];
            }
        }

        return $transformed;
    }

    /**
     * Store weather data in database
     */
    public function storeWeatherData(City $city, array $data): bool
    {
        try {
            foreach ($data as $weatherItem) {
                WeatherData::create([
                    'city_id' => $city->id,
                    'temperature' => $weatherItem['temperature'],
                    'humidity' => $weatherItem['humidity'],
                    'wind_speed' => $weatherItem['wind_speed'],
                    'cloud_cover' => $weatherItem['cloud_cover'],
                    'weather_condition' => $weatherItem['weather_condition'],
                    'hour' => $weatherItem['hour'],
                    'day_of_week' => $weatherItem['day_of_week'],
                    'recorded_at' => now(),
                    'raw_data' => $weatherItem,
                ]);
            }
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to store weather data: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Fetch and store weather for all active cities
     */
    public function fetchAllCities(): array
    {
        $results = [];
        $cities = City::where('is_active', true)->get();

        foreach ($cities as $city) {
            $data = $this->fetchWeatherData($city);
            
            if ($data) {
                $stored = $this->storeWeatherData($city, $data);
                $results[$city->name] = $stored ? 'success' : 'storage_failed';
            } else {
                $results[$city->name] = 'fetch_failed';
            }

            // Small delay to avoid rate limiting
            usleep(500000); // 0.5 seconds
        }

        return $results;
    }
}