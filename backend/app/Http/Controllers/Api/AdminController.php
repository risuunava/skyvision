<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prediction;
use App\Models\Notification;
use App\Models\RiskThreshold;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Get admin metrics
     */
    public function metrics(): JsonResponse
    {
        $totalPredictions = Prediction::count();
        $predictionsByModel = Prediction::groupBy('model_type')
            ->selectRaw('model_type, count(*) as count')
            ->get();
        
        $predictionsByRisk = Prediction::groupBy('risk_level')
            ->selectRaw('risk_level, count(*) as count')
            ->get();
        
        $totalNotifications = Notification::count();
        $recentNotifications = Notification::latest()
            ->take(10)
            ->get();

        $accuracy = Prediction::where('is_verified', true)
            ->avg('confidence_score');

        return response()->json([
            'total_predictions' => $totalPredictions,
            'predictions_by_model' => $predictionsByModel,
            'predictions_by_risk' => $predictionsByRisk,
            'total_notifications' => $totalNotifications,
            'recent_notifications' => $recentNotifications,
            'model_accuracy' => $accuracy ?? 0,
        ]);
    }

    /**
     * Update risk thresholds
     */
    public function updateThreshold(Request $request): JsonResponse
    {
        $request->validate([
            'parameter' => 'required|string',
            'low_threshold' => 'required|numeric',
            'medium_threshold' => 'required|numeric',
            'high_threshold' => 'required|numeric',
            'condition' => 'required|in:greater_than,less_than',
        ]);

        $threshold = RiskThreshold::updateOrCreate(
            ['parameter' => $request->parameter],
            [
                'low_threshold' => $request->low_threshold,
                'medium_threshold' => $request->medium_threshold,
                'high_threshold' => $request->high_threshold,
                'condition' => $request->condition,
            ]
        );

        return response()->json([
            'message' => 'Threshold updated successfully',
            'threshold' => $threshold,
        ]);
    }
}