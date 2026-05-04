<?php

namespace Database\Seeders;

use App\Models\RiskThreshold;
use Illuminate\Database\Seeder;

class RiskThresholdSeeder extends Seeder
{
    public function run(): void
    {
        $thresholds = [
            [
                'parameter' => 'temperature',
                'low_threshold' => 25.0,
                'medium_threshold' => 30.0,
                'high_threshold' => 35.0,
                'condition' => 'greater_than',
                'is_active' => true,
            ],
            [
                'parameter' => 'wind_speed',
                'low_threshold' => 10.0,
                'medium_threshold' => 20.0,
                'high_threshold' => 40.0,
                'condition' => 'greater_than',
                'is_active' => true,
            ],
            [
                'parameter' => 'humidity',
                'low_threshold' => 80.0,
                'medium_threshold' => 90.0,
                'high_threshold' => 95.0,
                'condition' => 'greater_than',
                'is_active' => true,
            ],
            [
                'parameter' => 'cloud_cover',
                'low_threshold' => 50.0,
                'medium_threshold' => 70.0,
                'high_threshold' => 90.0,
                'condition' => 'greater_than',
                'is_active' => true,
            ],
        ];

        foreach ($thresholds as $threshold) {
            RiskThreshold::create($threshold);
        }
    }
}