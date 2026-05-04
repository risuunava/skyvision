<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('risk_thresholds', function (Blueprint $table) {
            $table->id();
            $table->string('parameter');
            $table->decimal('low_threshold', 8, 2);
            $table->decimal('medium_threshold', 8, 2);
            $table->decimal('high_threshold', 8, 2);
            $table->string('condition');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_thresholds');
    }
};