<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['name' => 'Jakarta',    'province' => 'DKI Jakarta',          'bmkg_code' => '5013975', 'latitude' => -6.2088,  'longitude' => 106.8456],
            ['name' => 'Surabaya',   'province' => 'Jawa Timur',           'bmkg_code' => '5013980', 'latitude' => -7.2575,  'longitude' => 112.7521],
            ['name' => 'Bandung',    'province' => 'Jawa Barat',           'bmkg_code' => '5013981', 'latitude' => -6.9175,  'longitude' => 107.6191],
            ['name' => 'Medan',      'province' => 'Sumatera Utara',       'bmkg_code' => '1275011', 'latitude' =>  3.5952,  'longitude' =>  98.6722],
            ['name' => 'Makassar',   'province' => 'Sulawesi Selatan',     'bmkg_code' => '7371011', 'latitude' => -5.1477,  'longitude' => 119.4327],
            ['name' => 'Semarang',   'province' => 'Jawa Tengah',          'bmkg_code' => '3374011', 'latitude' => -6.9667,  'longitude' => 110.4167],
            ['name' => 'Palembang',  'province' => 'Sumatera Selatan',     'bmkg_code' => '1671011', 'latitude' => -2.9167,  'longitude' => 104.7458],
            ['name' => 'Yogyakarta', 'province' => 'DI Yogyakarta',        'bmkg_code' => '3471011', 'latitude' => -7.8014,  'longitude' => 110.3647],
            ['name' => 'Denpasar',   'province' => 'Bali',                 'bmkg_code' => '5171011', 'latitude' => -8.6705,  'longitude' => 115.2126],
            ['name' => 'Balikpapan', 'province' => 'Kalimantan Timur',     'bmkg_code' => '6471011', 'latitude' => -1.2675,  'longitude' => 116.8285],
            ['name' => 'Manado',     'province' => 'Sulawesi Utara',       'bmkg_code' => '7171011', 'latitude' =>  1.4748,  'longitude' => 124.8421],
            ['name' => 'Padang',     'province' => 'Sumatera Barat',       'bmkg_code' => '1371011', 'latitude' => -0.9471,  'longitude' => 100.4172],
            ['name' => 'Pontianak',  'province' => 'Kalimantan Barat',     'bmkg_code' => '6171011', 'latitude' => -0.0263,  'longitude' => 109.3425],
            ['name' => 'Banjarmasin','province' => 'Kalimantan Selatan',   'bmkg_code' => '6371011', 'latitude' => -3.3194,  'longitude' => 114.5908],
            ['name' => 'Pekanbaru',  'province' => 'Riau',                 'bmkg_code' => '1471011', 'latitude' =>  0.5333,  'longitude' => 101.4500],
            ['name' => 'Jayapura',   'province' => 'Papua',                'bmkg_code' => '9471011', 'latitude' => -2.5337,  'longitude' => 140.7181],
            ['name' => 'Ambon',      'province' => 'Maluku',               'bmkg_code' => '8171011', 'latitude' => -3.6954,  'longitude' => 128.1814],
            ['name' => 'Kupang',     'province' => 'Nusa Tenggara Timur',  'bmkg_code' => '5371011', 'latitude' => -10.1772, 'longitude' => 123.6070],
            ['name' => 'Mataram',    'province' => 'Nusa Tenggara Barat',  'bmkg_code' => '5271011', 'latitude' => -8.5833,  'longitude' => 116.1167],
            ['name' => 'Bengkulu',   'province' => 'Bengkulu',             'bmkg_code' => '1771011', 'latitude' => -3.8004,  'longitude' => 102.2655],
        ];

        foreach ($cities as $city) {
            City::updateOrCreate(
                ['name' => $city['name']],
                array_merge($city, ['is_active' => true])
            );
        }
    }
}