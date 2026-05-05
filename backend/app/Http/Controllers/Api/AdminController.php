<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Prediction;
use App\Models\RiskThreshold;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

        $recentNotifications = Notification::with('city')
            ->latest('sent_at')
            ->take(10)
            ->get()
            ->map(fn($n) => [
                'id'        => $n->id,
                'city'      => $n->city?->name,
                'title'     => $n->title,
                'type'      => $n->type,
                'sent_at'   => $n->sent_at,
                'recipients' => $n->recipients_count,
            ]);

        $accuracy = Prediction::where('is_verified', true)->avg('confidence_score');

        // Recent predictions with risk extremes
        $highRiskCities = Prediction::where('risk_level', 'high')
            ->orWhere('risk_level', 'extreme')
            ->with('city')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($p) => [
                'city'       => $p->city?->name,
                'risk_level' => $p->risk_level,
                'risk_score' => $p->risk_score,
                'time'       => $p->prediction_time,
            ]);

        return response()->json([
            'total_predictions'    => $totalPredictions,
            'predictions_by_model' => $predictionsByModel,
            'predictions_by_risk'  => $predictionsByRisk,
            'total_notifications'  => $totalNotifications,
            'recent_notifications' => $recentNotifications,
            'model_accuracy'       => round($accuracy ?? 0, 4),
            'high_risk_cities'     => $highRiskCities,
            'total_users'          => User::count(),
        ]);
    }

    /**
     * Update or create a risk threshold
     */
    public function updateThreshold(Request $request): JsonResponse
    {
        $request->validate([
            'parameter'        => 'required|string',
            'low_threshold'    => 'required|numeric',
            'medium_threshold' => 'required|numeric',
            'high_threshold'   => 'required|numeric',
            'condition'        => 'required|in:greater_than,less_than',
        ]);

        $threshold = RiskThreshold::updateOrCreate(
            ['parameter' => $request->parameter],
            [
                'low_threshold'    => $request->low_threshold,
                'medium_threshold' => $request->medium_threshold,
                'high_threshold'   => $request->high_threshold,
                'condition'        => $request->condition,
                'is_active'        => true,
            ]
        );

        return response()->json([
            'message'   => 'Threshold updated successfully',
            'threshold' => $threshold,
        ]);
    }

    /**
     * Get all risk thresholds
     */
    public function thresholds(): JsonResponse
    {
        $thresholds = RiskThreshold::where('is_active', true)->get();

        return response()->json([
            'thresholds' => $thresholds,
        ]);
    }

    /**
     * Get all users (admin view)
     */
    public function users(): JsonResponse
    {
        $users = User::withCount('subscriptions')
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * Get recent application logs (last 100 lines)
     */
    public function logs(): JsonResponse
    {
        $logPath = storage_path('logs/laravel.log');

        if (!file_exists($logPath)) {
            return response()->json(['logs' => []]);
        }

        $lines = [];
        $file = new \SplFileObject($logPath, 'r');
        $file->seek(PHP_INT_MAX);
        $total = $file->key();
        $start = max(0, $total - 100);

        $file->seek($start);
        while (!$file->eof()) {
            $line = trim($file->current());
            if ($line) {
                $lines[] = $line;
            }
            $file->next();
        }

        return response()->json([
            'logs'  => array_slice($lines, -100),
            'total' => $total,
        ]);
    }
}