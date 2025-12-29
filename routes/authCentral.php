<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get("/", function () {
        return redirect()->to('/central-login');
    })->name('central.redirect');

    Route::get('central-register', [RegisteredUserController::class, 'create'])
                ->name('central.register');

    Route::post('central-register', [RegisteredUserController::class, 'store']);

    Route::get('central-login', [AuthenticatedSessionController::class, 'create'])
                ->name('central.login');

    Route::post('central-login', [AuthenticatedSessionController::class, 'store']);

    Route::get('central-forgot-password', [PasswordResetLinkController::class, 'create'])
                ->name('central.password.request');

    Route::post('central-forgot-password', [PasswordResetLinkController::class, 'store'])
                ->name('central.password.email');

    Route::get('central-reset-password/{token}', [NewPasswordController::class, 'create'])
                ->name('central.password.reset');

    Route::post('central-reset-password', [NewPasswordController::class, 'store'])
                ->name('central.password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('central-verify-email', EmailVerificationPromptController::class)
                ->name('central.verification.notice');

    Route::get('central-verify-email/{id}/{hash}', VerifyEmailController::class)
                ->middleware(['signed', 'throttle:6,1'])
                ->name('verification.verify');

    Route::post('central-email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
                ->middleware('throttle:6,1')
                ->name('verification.send');

    Route::get('central-confirm-password', [ConfirmablePasswordController::class, 'show'])
                ->name('password.confirm');

    Route::post('central-confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('central-password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('central-logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('logout');
});
