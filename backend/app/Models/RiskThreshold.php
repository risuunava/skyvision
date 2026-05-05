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
        'low_threshold'    => 'float',
        'medium_threshold' => 'float',
        'high_threshold'   => 'float',
        'is_active'        => 'boolean',
    ];

    /**
     * Evaluate a value against this threshold and return risk level
     */
    public function evaluateRisk(float $value): string
    {
        $exceeds = $this->condition === 'greater_than'
            ? fn(float $threshold) => $value > $threshold
            : fn(float $threshold) => $value < $threshold;

        if ($exceeds($this->high_threshold)) {
            return 'extreme';
        }
        if ($exceeds($this->medium_threshold)) {
            return 'high';
        }
        if ($exceeds($this->low_threshold)) {
            return 'medium';
        }

        return 'low';
    }
}
