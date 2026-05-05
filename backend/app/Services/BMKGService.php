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
        $cacheKey = "openmeteo_weather_{$city->id}";

        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }

        try {
            // Fetch past 2 days and next 2 days from Open-Meteo
            $url = "https://api.open-meteo.com/v1/forecast?latitude={$city->latitude}&longitude={$city->longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,cloud_cover&past_days=2&forecast_days=2&timezone=Asia%2FJakarta";
            
            $response = Http::timeout(30)->retry(3, 1000)->get($url);

            if ($response->successful()) {
                $data = $response->json();
                Cache::put($cacheKey, $data, $this->cacheTimeout);
                return $this->transformBMKGData($data);
            }

            Log::error("Weather API Error for {$city->name}: " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("Weather API Exception: " . $e->getMessage());
            return null;
        }
    }

    private function transformBMKGData(array $rawData): array
    {
        $transformed = [];
        
        if (isset($rawData['hourly'])) {
            $times = $rawData['hourly']['time'];
            $temps = $rawData['hourly']['temperature_2m'];
            $hums = $rawData['hourly']['relative_humidity_2m'];
            $winds = $rawData['hourly']['wind_speed_10m'];
            $clouds = $rawData['hourly']['cloud_cover'];

            foreach ($times as $index => $timeStr) {
                // Determine condition based on cloud cover and humidity
                $condition = 'Clear';
                $cloud = $clouds[$index];
                $hum = $hums[$index];
                
                if ($cloud > 80 && $hum > 85) $condition = 'Heavy Rain';
                elseif ($cloud > 70 && $hum > 75) $condition = 'Light Rain';
                elseif ($cloud > 60) $condition = 'Cloudy';
                elseif ($cloud > 30) $condition = 'Partly Cloudy';

                $transformed[] = [
                    'temperature' => $temps[$index],
                    'humidity' => $hums[$index],
                    'wind_speed' => $winds[$index],
                    'cloud_cover' => $clouds[$index],
                    'weather_condition' => $condition,
                    'hour' => (int) date('H', strtotime($timeStr)),
                    'day_of_week' => (int) date('w', strtotime($timeStr)),
                    'recorded_at' => $timeStr,
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
                \App\Models\WeatherData::updateOrCreate(
                    [
                        'city_id' => $city->id,
                        'recorded_at' => \Carbon\Carbon::parse($weatherItem['recorded_at'])->format('Y-m-d H:i:s'),
                    ],
                    [
                        'temperature' => $weatherItem['temperature'],
                        'humidity' => $weatherItem['humidity'],
                        'wind_speed' => $weatherItem['wind_speed'],
                        'cloud_cover' => $weatherItem['cloud_cover'],
                        'weather_condition' => $weatherItem['weather_condition'],
                        'hour' => $weatherItem['hour'],
                        'day_of_week' => $weatherItem['day_of_week'],
                        'raw_data' => json_encode($weatherItem),
                    ]
                );
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