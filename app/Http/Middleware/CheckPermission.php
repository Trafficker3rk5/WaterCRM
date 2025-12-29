<?php

namespace App\Http\Middleware;

use App\Models\Activity;
use App\Models\Central\Company;
use App\Models\Module;
use App\Models\Rol;
use App\Models\StudentActivity;
use App\Models\StudentSubject;
use App\Models\Webinar;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        ///valido que pueda entrar a la ruta
        if (!in_array(auth()->user()->rol_id, $roles)) {
            abort(403, 'Access denied');
        } 

        $company = Company::where('tenant_id', tenant('id'))->first();
        if (!$company || $company->status != 1) {
            abort(403, 'Access denied');
        }
        define('COMPANY', $company);
        define('ALLOWED_PRODUCTS', explode(',', $company->products));

        return $next($request);
    }
}
