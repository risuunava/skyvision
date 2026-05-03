<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->string('fcm_token');
            $table->boolean('is_active')->default(true);
            $table->json('notification_preferences')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'city_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};