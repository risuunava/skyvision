<?php

namespace App\Jobs;

use App\Services\BMKGService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchWeatherData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 300; // 5 minutes

    public function __construct()
    {
        $this->onQueue('weather-fetch');
    }

    public function handle(BMKGService $bmkgService): void
    {
        Log::info('Starting weather data fetch job');
        
        $results = $bmkgService->fetchAllCities();
        
        Log::info('Weather data fetch completed', $results);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Weather fetch job failed: ' . $exception->getMessage());
    }
}