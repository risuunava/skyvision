<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->enum('model_type', ['lstm', 'prophet']);
            $table->timestamp('prediction_time');
            $table->decimal('predicted_temperature', 5, 2);
            $table->decimal('predicted_humidity', 5, 2);
            $table->decimal('predicted_wind_speed', 5, 2);
            $table->decimal('predicted_cloud_cover', 5, 2);
            $table->decimal('confidence_score', 5, 4);
            $table->enum('risk_level', ['low', 'medium', 'high', 'extreme']);
            $table->decimal('risk_score', 5, 4)->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->index(['city_id', 'prediction_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};