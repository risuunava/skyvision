<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Fetch weather data every hour
        $schedule->job(new \App\Jobs\FetchWeatherData)
            ->hourly()
            ->withoutOverlapping()
            ->runInBackground();

        // Run predictions every 6 hours
        $schedule->job(new \App\Jobs\RunPrediction)
            ->cron('0 */6 * * *') // Every 6 hours
            ->withoutOverlapping()
            ->runInBackground();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}