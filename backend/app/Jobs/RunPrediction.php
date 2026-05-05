<?php

namespace App\Jobs;

use App\Models\City;
use App\Services\MLService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RunPrediction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 600;

    public function __construct()
    {
        // Use 'default' queue so database queue worker picks it up
        $this->onQueue('default');
    }

    public function handle(MLService $mlService, NotificationService $notificationService): void
    {
        Log::info('[RunPrediction] Starting ML prediction job');

        $cities = City::where('is_active', true)->get();

        foreach ($cities as $city) {
            Log::info("[RunPrediction] Processing: {$city->name}");

            // LSTM prediction
            $lstmPredictions = $mlService->predict($city, 'lstm');

            // Prophet prediction (secondary model)
            $mlService->predict($city, 'prophet');

            // Check thresholds and notify if high/extreme risk
            if ($lstmPredictions) {
                $alerts = $mlService->checkRiskThresholds($city, $lstmPredictions);

                if (!empty($alerts)) {
                    $sent = $notificationService->sendCityAlert($city, $alerts);
                    Log::info("[RunPrediction] Sent {$sent} notifications for {$city->name}");
                }
            }
        }

        Log::info('[RunPrediction] Prediction job completed');
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('[RunPrediction] Job failed: ' . $exception->getMessage());
    }
}