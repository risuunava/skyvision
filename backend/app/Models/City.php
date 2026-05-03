<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'name',
        'province',
        'bmkg_code',
        'latitude',
        'longitude',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function weatherData(): HasMany
    {
        return $this->hasMany(WeatherData::class);
    }

    public function predictions(): HasMany
    {
        return $this->hasMany(Prediction::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}