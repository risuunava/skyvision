<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin user ──────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@skyvision.id'],
            [
                'name'     => 'Admin SkyVision',
                'password' => Hash::make('password123'),
                'is_admin' => true,
            ]
        );

        // ── Demo user ───────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'demo@skyvision.id'],
            [
                'name'     => 'Demo User',
                'password' => Hash::make('password123'),
                'is_admin' => false,
            ]
        );

        // ── Seeders ─────────────────────────────────────────────────────────
        $this->call([
            CitySeeder::class,
            RiskThresholdSeeder::class,
        ]);
    }
}
