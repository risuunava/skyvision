<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeatherData extends Model
{
    protected $fillable = [
        'city_id',
        'temperature',
        'humidity',
        'wind_speed',
        'cloud_cover',
        'rainfall',
        'hour',
        'day_of_week',
        'weather_condition',
        'recorded_at',
        'raw_data'
    ];

    protected $casts = [
        'temperature' => 'decimal:2',
        'humidity' => 'decimal:2',
        'wind_speed' => 'decimal:2',
        'cloud_cover' => 'decimal:2',
        'rainfall' => 'decimal:2',
        'recorded_at' => 'datetime',
        'raw_data' => 'array',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}