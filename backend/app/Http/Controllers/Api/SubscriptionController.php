<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    /**
     * Subscribe to city notifications
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'fcm_token' => 'required|string',
        ]);

        $subscription = Subscription::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'city_id' => $request->city_id,
            ],
            [
                'fcm_token' => $request->fcm_token,
                'is_active' => true,
                'notification_preferences' => $request->preferences ?? ['all' => true],
            ]
        );

        return response()->json([
            'message' => 'Subscribed successfully',
            'subscription' => $subscription,
        ]);
    }

    /**
     * Unsubscribe from city notifications
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
        ]);

        Subscription::where('user_id', $request->user()->id)
            ->where('city_id', $request->city_id)
            ->update(['is_active' => false]);

        return response()->json([
            'message' => 'Unsubscribed successfully',
        ]);
    }
}