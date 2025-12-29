<?php

namespace App\Http\Middleware;

use App\Models\Central\Company;
use App\Models\Tenant\ExtraVariable;
use Closure;
use Illuminate\Http\Request;

class ValidateAPI
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
        $token = $request->bearerToken();
        $apiToken = ExtraVariable::where('name', 'WAAS_API_TOKEN')->first()->value ?? '';

        if ($token !== $apiToken) {
            return response()->json(['error' => true, 'message' => 'Unauthorized'], 401);
        }

        $company = Company::where('tenant_id', tenant('id'))->first();
        if (!$company || $company->status != 1) {
            return response()->json(['error' => true, 'message' => 'Unauthorized'], 401);
        }
        define('COMPANY', $company);
        define('ALLOWED_PRODUCTS', explode(',', $company->products));

        return $next($request);
    }
}
