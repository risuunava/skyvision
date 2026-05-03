<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\WeatherController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ──────────────────────────────────────
// PUBLIC ROUTES (No Auth)
// ──────────────────────────────────────

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Weather (public)
Route::prefix('weather')->group(function () {
    Route::get('/current/{city}', [WeatherController::class, 'current']);
    Route::get('/history/{city}', [WeatherController::class, 'history']);
    Route::get('/prediction/{city}', [WeatherController::class, 'prediction']);
    Route::get('/cities', [WeatherController::class, 'cities']);
    Route::get('/map-data', [WeatherController::class, 'mapData']);
});

// ──────────────────────────────────────
// AUTHENTICATED ROUTES (Sanctum Token)
// ──────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {
    
    // User
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user', [UserController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Subscription
    Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
    Route::post('/unsubscribe', [SubscriptionController::class, 'unsubscribe']);
    Route::get('/subscriptions', [SubscriptionController::class, 'list']);
    
    // Notifications
    Route::get('/notifications', [SubscriptionController::class, 'notifications']);
    Route::post('/notifications/{id}/read', [SubscriptionController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [SubscriptionController::class, 'markAllAsRead']);
    
    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/metrics', [AdminController::class, 'metrics']);
        Route::post('/threshold', [AdminController::class, 'updateThreshold']);
        Route::get('/thresholds', [AdminController::class, 'thresholds']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/logs', [AdminController::class, 'logs']);
    });
});