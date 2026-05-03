<?php

namespace App\Services;

use App\Models\City;
use App\Models\Notification;
use App\Models\Subscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    private string $fcmUrl = 'https://fcm.googleapis.com/fcm/send';
    private string $serverKey;

    public function __construct()
    {
        $this->serverKey = config('services.fcm.server_key');
    }

    /**
     * Send notification to subscribers of a city
     */
    public function sendCityAlert(City $city, array $alertData): int
    {
        $subscriptions = Subscription::where('city_id', $city->id)
            ->where('is_active', true)
            ->get();

        if ($subscriptions->isEmpty()) {
            return 0;
        }

        // Create notification record
        $notification = Notification::create([
            'city_id' => $city->id,
            'type' => 'warning',
            'title' => "⚠️ Weather Alert: {$city->name}",
            'message' => $this->buildAlertMessage($alertData),
            'data' => $alertData,
            'sent_at' => now(),
            'recipients_count' => $subscriptions->count(),
        ]);

        // Send FCM notifications
        $tokens = $subscriptions->pluck('fcm_token')->toArray();
        $this->sendFCM($tokens, $notification);

        return $subscriptions->count();
    }

    /**
     * Build alert message from data
     */
    private function buildAlertMessage(array $alertData): string
    {
        $messages = [];
        
        foreach ($alertData as $alert) {
            $parameter = ucfirst($alert['parameter']);
            $value = $alert['value'];
            $threshold = $alert['threshold'];
            $messages[] = "{$parameter}: {$value} (threshold: {$threshold})";
        }

        return implode("\n", $messages);
    }

    /**
     * Send FCM messages
     */
    private function sendFCM(array $tokens, Notification $notification): void
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $this->serverKey,
                'Content-Type' => 'application/json',
            ])->post($this->fcmUrl, [
                'registration_ids' => $tokens,
                'notification' => [
                    'title' => $notification->title,
                    'body' => $notification->message,
                    'sound' => 'default',
                    'badge' => 1,
                ],
                'data' => [
                    'type' => 'weather_alert',
                    'notification_id' => $notification->id,
                    'city_id' => $notification->city_id,
                ],
            ]);

            if (!$response->successful()) {
                Log::error("FCM Error: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("FCM Exception: " . $e->getMessage());
        }
    }
}