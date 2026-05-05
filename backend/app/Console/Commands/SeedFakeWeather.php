<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SeedFakeWeather extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:seed-fake-weather';

    protected $description = 'Seed the database with realistic fake weather data to bypass BMKG 404 error';

    public function handle()
    {
        $this->info("Clearing old data...");
        \App\Models\WeatherData::truncate();
        \App\Models\Prediction::truncate();

        $cities = \App\Models\City::where('is_active', true)->get();
        $conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorm'];
        $risks = ['low', 'low', 'medium', 'medium', 'high', 'extreme'];

        $this->info("Generating data for {$cities->count()} cities...");

        foreach ($cities as $city) {
            // Generate 48 hours of history
            $baseTemp = rand(24, 32);
            for ($i = 48; $i >= 0; $i--) {
                $time = now()->subHours($i);
                $temp = $baseTemp + sin($time->hour) * 4 + (rand(-10, 10)/10);
                
                \App\Models\WeatherData::create([
                    'city_id' => $city->id,
                    'temperature' => $temp,
                    'humidity' => rand(60, 95),
                    'wind_speed' => rand(5, 25),
                    'cloud_cover' => rand(10, 100),
                    'weather_condition' => $conditions[rand(0, 5)],
                    'hour' => $time->hour,
                    'day_of_week' => $time->dayOfWeek,
                    'recorded_at' => $time,
                    'raw_data' => []
                ]);
            }

            // Generate 24 hours of predictions
            for ($i = 1; $i <= 24; $i++) {
                $time = now()->addHours($i);
                $temp = $baseTemp + sin($time->hour) * 4 + (rand(-10, 10)/10);
                $riskIndex = rand(0, 5);

                \App\Models\Prediction::create([
                    'city_id' => $city->id,
                    'model_type' => 'lstm',
                    'prediction_time' => $time,
                    'predicted_temperature' => $temp,
                    'predicted_humidity' => rand(60, 95),
                    'predicted_wind_speed' => rand(5, 25),
                    'predicted_cloud_cover' => rand(10, 100),
                    'confidence_score' => rand(75, 98) / 100,
                    'risk_level' => $risks[$riskIndex],
                    'risk_score' => ($riskIndex * 20 + rand(0, 19)) / 100
                ]);
            }
        }

        $this->info("Done! Database successfully populated with realistic diverse data.");
    }
}
