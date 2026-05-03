<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weather_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->decimal('temperature', 5, 2); // Celsius
            $table->decimal('humidity', 5, 2); // Percentage
            $table->decimal('wind_speed', 5, 2); // km/h
            $table->decimal('cloud_cover', 5, 2); // Percentage
            $table->decimal('rainfall', 6, 2)->nullable(); // mm
            $table->integer('hour'); // 0-23
            $table->integer('day_of_week'); // 0-6
            $table->string('weather_condition'); // sunny, cloudy, rainy, etc
            $table->timestamp('recorded_at');
            $table->json('raw_data')->nullable(); // Original BMKG data
            $table->timestamps();

            $table->index(['city_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weather_data');
    }
};