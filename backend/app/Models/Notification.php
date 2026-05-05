<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'city_id',
        'type',
        'title',
        'message',
        'data',
        'sent_at',
        'recipients_count',
    ];

    protected $casts = [
        'data'             => 'array',
        'sent_at'          => 'datetime',
        'recipients_count' => 'integer',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
