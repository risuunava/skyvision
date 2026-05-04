<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskThreshold extends Model
{
    protected $fillable = [
        'parameter',
        'low_threshold',
        'medium_threshold',
        'high_threshold',
        'condition',
        'is_active',
    ];

    protected $casts = [
        'low_threshold' => 'decimal:2',
        'medium_threshold' => 'decimal:2',
        'high_threshold' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}