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

    public $tries = 2;
    public $timeout = 600; // 10 minutes

    public function __construct()
    {
        $this->onQueue('ml-prediction');
    }

    public function handle(MLService $mlService, NotificationService $notificationService): void
    {
        Log::info('Starting prediction job');
        
        $cities = City::where('is_active', true)->get();
        
        foreach ($cities as $city) {
            Log::info("Running prediction for {$city->name}");
            
            // Run LSTM prediction
            $lstmPredictions = $mlService->predict($city, 'lstm');
            
            // Run Prophet prediction
            $prophetPredictions = $mlService->predict($city, 'prophet');
            
            // Check risk thresholds
            if ($lstmPredictions) {
                $alerts = $mlService->checkRiskThresholds($city, $lstmPredictions);
                
                if (!empty($alerts)) {
                    $sent = $notificationService->sendCityAlert($city, $alerts);
                    Log::info("Sent {$sent} notifications for {$city->name}");
                }
            }
        }
        
        Log::info('Prediction job completed');
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Prediction job failed: ' . $exception->getMessage());
    }
}