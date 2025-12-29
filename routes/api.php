<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public API routes (no tenancy middleware for central domain)
Route::post('/login', [AuthController::class, 'login'])->name('api.login');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('api.logout');

// Protected API routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/products/sync-all', [\App\Http\Controllers\Central\ProductsController::class, 'syncAllProductsToTenants'])->name('api.products.sync.all');
});

/*
Route::middleware([
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {

    Route::get('/product/list', [ProductController::class, 'list']);

    Route::middleware('validate-api')->group(function () {
        ///PRODUCTS
        //Route::get('/product/list', [ProductController::class, 'list']);
    });
});*/
