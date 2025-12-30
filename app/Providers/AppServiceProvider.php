<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        Schema::defaultStringLength(191);

        // CORREGIDO: Solo forzar HTTPS si FORCE_HTTPS=true explícitamente
        // NO forzar automáticamente en producción porque puede causar problemas
        // en servidores sin SSL o con proxy inverso (como Plesk con nginx)
        if (env('FORCE_HTTPS', false) === true || env('FORCE_HTTPS') === 'true') {
            URL::forceScheme('https');
        }

        //if (env('APP_ENV') !== 'local') {
            //URL::forceRootUrl(config('app.url'));
        //}
    }
}
