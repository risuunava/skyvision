<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            [
                'name' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'bmkg_code' => '5013975', // Example code
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'is_active' => true,
            ],
            [
                'name' => 'Surabaya',
                'province' => 'Jawa Timur',
                'bmkg_code' => '5013980',
                'latitude' => -7.2575,
                'longitude' => 112.7521,
                'is_active' => true,
            ],
            [
                'name' => 'Bandung',
                'province' => 'Jawa Barat',
                'bmkg_code' => '5013981',
                'latitude' => -6.9175,
                'longitude' => 107.6191,
                'is_active' => true,
            ],
            // Add more cities as needed
        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}