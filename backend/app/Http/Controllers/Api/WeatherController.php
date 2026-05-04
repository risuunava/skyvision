<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Notification;
use App\Models\Subscription;
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
            ->where('recorded_at', '<=', now())
            ->latest('recorded_at')
            ->first();

        if (!$currentWeather) {
            // Return default data with zeros if no weather data available
            return response()->json([
                'city'    => $city->only(['id', 'name', 'province', 'latitude', 'longitude']),
                'weather' => [
                    'temperature'  => 28.0,
                    'humidity'     => 70.0,
                    'wind_speed'   => 10.0,
                    'cloud_cover'  => 50.0,
                    'condition'    => 'Data not available',
                    'recorded_at'  => now()->toIso8601String(),
                ],
            ]);
        }

        return response()->json([
            'city'    => $city->only(['id', 'name', 'province', 'latitude', 'longitude']),
            'weather' => [
                'temperature'  => $currentWeather->temperature,
                'humidity'     => $currentWeather->humidity,
                'wind_speed'   => $currentWeather->wind_speed,
                'cloud_cover'  => $currentWeather->cloud_cover,
                'condition'    => $currentWeather->weather_condition,
                'recorded_at'  => $currentWeather->recorded_at,
            ],
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
                    'temperature'  => $data->temperature,
                    'humidity'     => $data->humidity,
                    'wind_speed'   => $data->wind_speed,
                    'cloud_cover'  => $data->cloud_cover,
                    'condition'    => $data->weather_condition,
                    'timestamp'    => $data->recorded_at,
                ];
            });

        return response()->json([
            'city'    => $city->only(['id', 'name']),
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
                    'temperature'  => $pred->predicted_temperature,
                    'humidity'     => $pred->predicted_humidity,
                    'wind_speed'   => $pred->predicted_wind_speed,
                    'cloud_cover'  => $pred->predicted_cloud_cover,
                    'confidence'   => $pred->confidence_score,
                    'risk_level'   => $pred->risk_level,
                    'risk_score'   => $pred->risk_score,
                    'timestamp'    => $pred->prediction_time,
                ];
            });

        return response()->json([
            'city'       => $city->only(['id', 'name']),
            'model_type' => $modelType,
            'predictions' => $predictions,
        ]);
    }

    /**
     * Get list of all active cities
     */
    public function cities(): JsonResponse
    {
        $cities = City::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($city) => $city->only([
                'id', 'name', 'province', 'latitude', 'longitude', 'bmkg_code',
            ]));

        return response()->json([
            'cities' => $cities,
            'total'  => $cities->count(),
        ]);
    }

    /**
     * Get map data: each city with latest risk level and temperature
     */
    public function mapData(): JsonResponse
    {
        $cities = City::where('is_active', true)->get();

        $latestWeather = WeatherData::whereIn('id', function ($query) {
            $query->selectRaw('MAX(id)')->from('weather_data')
                  ->where('recorded_at', '<=', now())
                  ->groupBy('city_id');
        })->get()->keyBy('city_id');

        $latestPredictions = Prediction::whereIn('id', function ($query) {
            $query->selectRaw('MIN(id)')->from('predictions')
                  ->where('model_type', 'lstm')
                  ->where('prediction_time', '>', now())
                  ->groupBy('city_id');
        })->get()->keyBy('city_id');

        $mapData = $cities->map(function ($city) use ($latestWeather, $latestPredictions) {
            $weather = $latestWeather->get($city->id);
            $pred = $latestPredictions->get($city->id);

            return [
                'id'          => $city->id,
                'name'        => $city->name,
                'province'    => $city->province,
                'latitude'    => (float) $city->latitude,
                'longitude'   => (float) $city->longitude,
                'temperature' => $weather ? (float) $weather->temperature : 28.0,
                'humidity'    => $weather ? (float) $weather->humidity : 70.0,
                'condition'   => $weather ? $weather->weather_condition : 'unknown',
                'risk_level'  => $pred ? $pred->risk_level : 'low',
                'risk_score'  => $pred ? (float) $pred->risk_score : 0.0,
            ];
        });

        return response()->json([
            'cities' => $mapData,
        ]);
    }
}