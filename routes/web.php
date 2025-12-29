<?php


use App\Helpers\Lerph;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;

require 'tenant.php';

Route::middleware([
    'web',
])->group(function () {


    require 'authCentral.php';

    Route::middleware('auth')->group(function () {
        Lerph::requireFolder(__DIR__.'/central');
    });
});
