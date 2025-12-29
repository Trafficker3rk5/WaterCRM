<?php

namespace App\Http\Middleware;

use App\Models\Central\Company;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $company = null;
        $tenantId = tenant('id');
        
        // Get company for tenant subdomains
        if ($tenantId) {
            try {
                $company = Company::where('tenant_id', $tenantId)->first();
            } catch (\Exception $e) {
                // Log error if needed, but continue
            }
        }
        
        if ($user) {
            try {
                $user->rol_name = $user->rol_name ?? '';
                $user->is_tenant = !empty($tenantId);
                $user->avatar_url = $user->getImageUrl() ?? '';
                
                // Set company logo if company exists and has a logo
                if ($company && !empty($company->logo)) {
                    $user->company_logo = $company->logo_url;
                } else {
                    $user->company_logo = '';
                }
            } catch (\Exception $e) {
                
            }
            
        }
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'files' => fn () => $request->session()->get('files'),
            ]
        ];
    }
}
