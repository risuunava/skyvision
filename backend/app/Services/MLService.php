<?php

namespace App\Services;

use App\Models\City;
use App\Models\Prediction;
use App\Models\WeatherData;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MLService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.ml.url', 'http://127.0.0.1:8001');
    }

    /**
     * Get last 24 hours of weather data for prediction
     */
    public function preparePredictionData(City $city): array
    {
        $weatherData = WeatherData::where('city_id', $city->id)
            ->where('recorded_at', '>=', now()->subHours(24))
            ->orderBy('recorded_at', 'asc')
            ->get();

        if ($weatherData->count() < 24) {
            // Pad with historical average if not enough data
            $avgData = $this->getHistoricalAverage($city);
            while ($weatherData->count() < 24) {
                $weatherData->prepend($avgData);
            }
        }

        return $weatherData->map(function ($data) {
            return [
                'temperature' => (float) $data->temperature,
                'humidity' => (float) $data->humidity,
                'wind_speed' => (float) $data->wind_speed,
                'cloud_cover' => (float) $data->cloud_cover,
                'hour' => (int) $data->hour,
                'day_of_week' => (int) $data->day_of_week,
                'timestamp' => $data->recorded_at->toIso8601String(),
            ];
        })->toArray();
    }

    /**
     * Get historical average for padding missing data
     */
    private function getHistoricalAverage(City $city): object
    {
        $avg = WeatherData::where('city_id', $city->id)
            ->selectRaw('
                AVG(temperature) as temperature,
                AVG(humidity) as humidity,
                AVG(wind_speed) as wind_speed,
                AVG(cloud_cover) as cloud_cover
            ')
            ->first();

        return (object) [
            'temperature' => $avg->temperature ?? 25.0,
            'humidity' => $avg->humidity ?? 70.0,
            'wind_speed' => $avg->wind_speed ?? 10.0,
            'cloud_cover' => $avg->cloud_cover ?? 50.0,
            'hour' => (int) date('H'),
            'day_of_week' => (int) date('w'),
            'recorded_at' => now()->subHour(),
        ];
    }

    /**
     * Send prediction request to ML service
     */
    public function predict(City $city, string $modelType = 'lstm'): ?array
    {
        try {
            $weatherData = $this->preparePredictionData($city);

            $response = Http::timeout(60)
                ->post("{$this->baseUrl}/predict", [
                    'city_id' => $city->id,
                    'city_name' => $city->name,
                    'model_type' => $modelType,
                    'weather_data' => $weatherData,
                ]);

            if ($response->successful()) {
                $predictions = $response->json();
                $this->storePredictions($city, $modelType, $predictions);
                return $predictions;
            }

            Log::error("ML Service Prediction Error: " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("ML Service Exception: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Store predictions in database
     */
    private function storePredictions(City $city, string $modelType, array $predictions): void
    {
        foreach ($predictions['predictions'] as $prediction) {
            Prediction::create([
                'city_id' => $city->id,
                'model_type' => $modelType,
                'prediction_time' => $prediction['timestamp'],
                'predicted_temperature' => $prediction['temperature'],
                'predicted_humidity' => $prediction['humidity'],
                'predicted_wind_speed' => $prediction['wind_speed'],
                'predicted_cloud_cover' => $prediction['cloud_cover'],
                'confidence_score' => $prediction['confidence'] ?? 0.85,
                'risk_level' => $prediction['risk_level'] ?? 'low',
                'risk_score' => $prediction['risk_score'] ?? 0.0,
            ]);
        }
    }

    /**
     * Check risk thresholds and trigger alerts
     */
    public function checkRiskThresholds(City $city, array $predictions): array
    {
        $alerts = [];
        $thresholds = \App\Models\RiskThreshold::where('is_active', true)->get();

        foreach ($predictions['predictions'] as $prediction) {
            foreach ($thresholds as $threshold) {
                $value = $prediction[$threshold->parameter] ?? null;
                
                if ($value === null) continue;

                $isHighRisk = false;
                if ($threshold->condition === 'greater_than') {
                    $isHighRisk = $value > $threshold->high_threshold;
                } else {
                    $isHighRisk = $value < $threshold->high_threshold;
                }

                if ($isHighRisk) {
                    $alerts[] = [
                        'city_id' => $city->id,
                        'parameter' => $threshold->parameter,
                        'value' => $value,
                        'threshold' => $threshold->high_threshold,
                        'timestamp' => $prediction['timestamp'],
                    ];
                }
            }
        }

        return $alerts;
    }
}