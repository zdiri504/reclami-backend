<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Password reset routes (public)
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/verify-reset-token', [AuthController::class, 'verifyResetToken']);

// Complaints routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
    Route::post('/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
    Route::post('/complaints/{id}/assign', [ComplaintController::class, 'assignAgent']);
});

// Public tracking route (no authentication required)
Route::get('/complaints/track/{reference}', [ComplaintController::class, 'track']);

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'dashboardStats']);
    Route::get('/agents', [AdminController::class, 'getAgents']);
    Route::post('/export', [AdminController::class, 'exportComplaints']);
});
