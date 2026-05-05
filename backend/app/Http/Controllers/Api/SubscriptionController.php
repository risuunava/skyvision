<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Subscription;
use App\Models\City;
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
            'city_id'   => 'required|exists:cities,id',
            'fcm_token' => 'required|string',
        ]);

        $subscription = Subscription::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'city_id' => $request->city_id,
            ],
            [
                'fcm_token'                  => $request->fcm_token,
                'is_active'                  => true,
                'notification_preferences'   => $request->preferences ?? ['all' => true],
            ]
        );

        return response()->json([
            'message'      => 'Subscribed successfully',
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

    /**
     * List user subscriptions
     */
    public function list(Request $request): JsonResponse
    {
        $subscriptions = Subscription::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->with('city')
            ->get()
            ->map(fn($sub) => [
                'id'        => $sub->id,
                'city_id'   => $sub->city_id,
                'city_name' => $sub->city?->name,
                'province'  => $sub->city?->province,
                'is_active' => $sub->is_active,
                'created_at' => $sub->created_at,
            ]);

        return response()->json([
            'subscriptions' => $subscriptions,
        ]);
    }

    /**
     * Get notifications for subscribed cities
     */
    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get city IDs the user is subscribed to
        $cityIds = Subscription::where('user_id', $user->id)
            ->where('is_active', true)
            ->pluck('city_id');

        $notifications = Notification::whereIn('city_id', $cityIds)
            ->with('city')
            ->latest('sent_at')
            ->take(50)
            ->get()
            ->map(fn($n) => [
                'id'          => $n->id,
                'city_id'     => $n->city_id,
                'city_name'   => $n->city?->name,
                'type'        => $n->type,
                'title'       => $n->title,
                'message'     => $n->message,
                'sent_at'     => $n->sent_at,
                'created_at'  => $n->created_at,
            ]);

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $notifications->count(),
        ]);
    }

    /**
     * Mark notification as read (placeholder for frontend state)
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        // In a full implementation, you'd have a pivot table for user-notification reads
        return response()->json(['message' => 'Marked as read']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        return response()->json(['message' => 'All marked as read']);
    }
}