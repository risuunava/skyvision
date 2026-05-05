<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get authenticated user profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('subscriptions.city');

        return response()->json([
            'user' => [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'is_admin'      => $user->is_admin ?? false,
                'subscriptions' => $user->subscriptions->map(fn($sub) => [
                    'city_id'   => $sub->city_id,
                    'city_name' => $sub->city?->name,
                    'is_active' => $sub->is_active,
                ]),
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name'         => 'sometimes|string|max:255',
            'email'        => 'sometimes|email|unique:users,email,' . $user->id,
            'password'     => 'sometimes|string|min:8|confirmed',
            'current_password' => 'required_with:password|string',
        ]);

        if ($request->has('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['error' => 'Current password is incorrect'], 422);
            }
        }

        $user->update(array_filter([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->has('password') ? Hash::make($request->password) : null,
        ]));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user->only(['id', 'name', 'email', 'is_admin']),
        ]);
    }
}
