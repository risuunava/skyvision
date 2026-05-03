<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prediction extends Model
{
    protected $fillable = [
        'city_id',
        'model_type',
        'prediction_time',
        'predicted_temperature',
        'predicted_humidity',
        'predicted_wind_speed',
        'predicted_cloud_cover',
        'confidence_score',
        'risk_level',
        'risk_score',
        'is_verified'
    ];

    protected $casts = [
        'prediction_time' => 'datetime',
        'predicted_temperature' => 'decimal:2',
        'predicted_humidity' => 'decimal:2',
        'predicted_wind_speed' => 'decimal:2',
        'predicted_cloud_cover' => 'decimal:2',
        'confidence_score' => 'decimal:4',
        'risk_score' => 'decimal:4',
        'is_verified' => 'boolean',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}