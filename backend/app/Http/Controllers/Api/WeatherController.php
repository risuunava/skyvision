<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\WeatherData;
use App\Models\Prediction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    /**
     * Get current weather for a city
     */
    public function current(Request $request, string $cityName): JsonResponse
    {
        $city = City::where('name', 'like', "%{$cityName}%")->first();
        
        if (!$city) {
            return response()->json(['error' => 'City not found'], 404);
        }

        $currentWeather = WeatherData::where('city_id', $city->id)
            ->latest('recorded_at')
            ->first();

        if (!$currentWeather) {
            return response()->json(['error' => 'No weather data available'], 404);
        }

        return response()->json([
            'city' => $city->only(['id', 'name', 'province', 'latitude', 'longitude']),
            'weather' => [
                'temperature' => $currentWeather->temperature,
                'humidity' => $currentWeather->humidity,
                'wind_speed' => $currentWeather->wind_speed,
                'cloud_cover' => $currentWeather->cloud_cover,
                'condition' => $currentWeather->weather_condition,
                'recorded_at' => $currentWeather->recorded_at,
            ]
        ]);
    }

    /**
     * Get weather history for a city
     */
    public function history(Request $request, string $cityName): JsonResponse
    {
        $city = City::where('name', 'like', "%{$cityName}%")->first();
        
        if (!$city) {
            return response()->json(['error' => 'City not found'], 404);
        }

        $hours = $request->get('hours', 48);
        
        $history = WeatherData::where('city_id', $city->id)
            ->where('recorded_at', '>=', now()->subHours($hours))
            ->orderBy('recorded_at', 'asc')
            ->get()
            ->map(function ($data) {
                return [
                    'temperature' => $data->temperature,
                    'humidity' => $data->humidity,
                    'wind_speed' => $data->wind_speed,
                    'cloud_cover' => $data->cloud_cover,
                    'condition' => $data->weather_condition,
                    'timestamp' => $data->recorded_at,
                ];
            });

        return response()->json([
            'city' => $city->only(['id', 'name']),
            'history' => $history,
        ]);
    }

    /**
     * Get predictions for a city
     */
    public function prediction(Request $request, string $cityName): JsonResponse
    {
        $city = City::where('name', 'like', "%{$cityName}%")->first();
        
        if (!$city) {
            return response()->json(['error' => 'City not found'], 404);
        }

        $modelType = $request->get('model', 'lstm');

        $predictions = Prediction::where('city_id', $city->id)
            ->where('model_type', $modelType)
            ->where('prediction_time', '>', now())
            ->orderBy('prediction_time', 'asc')
            ->get()
            ->map(function ($pred) {
                return [
                    'temperature' => $pred->predicted_temperature,
                    'humidity' => $pred->predicted_humidity,
                    'wind_speed' => $pred->predicted_wind_speed,
                    'cloud_cover' => $pred->predicted_cloud_cover,
                    'confidence' => $pred->confidence_score,
                    'risk_level' => $pred->risk_level,
                    'risk_score' => $pred->risk_score,
                    'timestamp' => $pred->prediction_time,
                ];
            });

        return response()->json([
            'city' => $city->only(['id', 'name']),
            'model_type' => $modelType,
            'predictions' => $predictions,
        ]);
    }
}