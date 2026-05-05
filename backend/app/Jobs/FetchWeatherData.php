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

    public int $tries   = 3;
    public int $timeout = 300;

    public function __construct()
    {
        // Use 'default' queue so database queue worker picks it up
        $this->onQueue('default');
    }

    public function handle(BMKGService $bmkgService): void
    {
        Log::info('[FetchWeatherData] Starting BMKG fetch job');

        $results = $bmkgService->fetchAllCities();

        $success = array_filter($results, fn($v) => $v === 'success');
        $failed  = array_filter($results, fn($v) => $v !== 'success');

        Log::info('[FetchWeatherData] Completed', [
            'success' => count($success),
            'failed'  => count($failed),
            'details' => $results,
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('[FetchWeatherData] Job failed: ' . $exception->getMessage());
    }
}