<?php

namespace App\Models\Central;

use App\Models\Main\Tenant;
use App\Models\Tenant\TenantUser;
use App\Models\User;
use Hash;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stancl\Tenancy\Database\Concerns\CentralConnection;
use Stancl\Tenancy\Exceptions\DomainOccupiedByOtherTenantException;
use Storage;

class Company extends Model
{
    use HasFactory, CentralConnection;
    use SoftDeletes;

    public $timestamps = false;

    const MAX_STATUS = 1;
    
    protected $fillable = [
        'domain',
        'name',
        'business_name',
        'cif',
        'logo',
        'users',
        'email',
        'address',
        'fiscal_address',
        'price',
        'status',
        'products',
        'tenant_id',
        'payment_method',
        'bank_account',
    ];

    protected static function boot()
    {
        parent::boot();

        static::deleted(function ($company) {
            if (!empty(tenant('id'))) return;
            $tenant = Tenant::find($company->tenant_id);
            if (!$tenant) return;
            Company::where('id', $company->id)->delete();
        });

        static::created(function ($company) {
            if (!empty($company->tenant_id)) return;

            ////Create Tenant
            $tenant = Tenant::create();
            $company->tenant_id = $tenant->id;
            $company->save();

            ///Add Domain
            $tenant->createDomain(['domain' => $company->domain.'.'.env('APP_DOMAIN')]);
        });

        static::updated(function ($company) {
            // Only update domain if it was actually changed
            if (!$company->wasChanged('domain')) {
                return;
            }

            $tenant = Tenant::find($company->tenant_id);
            if (!$tenant) return;

            $newDomain = $company->domain.'.'.env('APP_DOMAIN');
            
            // Get all domains for this tenant
            $domains = $tenant->domains()->get();
            
            // Check if the new domain already exists for this tenant
            $domainExists = $domains->contains(function ($domain) use ($newDomain) {
                return $domain->domain === $newDomain;
            });
            
            // If domain already exists for this tenant, no need to update
            if ($domainExists) {
                return;
            }
            
            // Update the first domain, or create a new one if none exist
            $firstDomain = $domains->first();
            if ($firstDomain) {
                // Only update if the domain is different
                if ($firstDomain->domain !== $newDomain) {
                    try {
                        $firstDomain->update(['domain' => $newDomain]);
                    } catch (DomainOccupiedByOtherTenantException $e) {
                        // If domain is occupied by another tenant, log and skip
                        Log::warning("Domain {$newDomain} is occupied by another tenant, cannot update domain ID {$firstDomain->id}");
                    }
                }
            } else {
                // No domain exists, create a new one
                try {
                    $tenant->createDomain(['domain' => $newDomain]);
                } catch (DomainOccupiedByOtherTenantException $e) {
                    Log::warning("Domain {$newDomain} is occupied by another tenant, cannot create domain");
                }
            }
        });

        static::deleted(function ($company) {
            if (!empty(tenant('id'))) return;
            $tenant = Tenant::find($company->tenant_id);
            if (!$tenant) return;
            $tenant->domains()->delete();
            $tenant->delete();
        });
    }

    public function getTenant()
    {
        return Tenant::find($this->tenant_id);
    }

    public function getLogoUrlAttribute()
    {
        if (empty($this->logo)) {
            return 'https://ui-avatars.com/api/?name='.$this->name.'&color=7F9CF5&background=EBF4FF';
        }
        
        // Use current request domain if available, otherwise fall back to APP_URL
        try {
            $baseUrl = request()->getSchemeAndHttpHost();
        } catch (\Exception $e) {
            $baseUrl = env('APP_URL', 'https://waascrm.com');
        }
        
        // Construct the URL using the current request domain
        return rtrim($baseUrl, '/') . '/storage/companies/' . $this->logo;
    }

    public function getProducts()
    {
        $data = [];
        foreach(explode(',', $this->products) as $e1){
            if (!empty($e1)){
                $x = Product::find($e1);
                if ($x) $data[] = $x;
            }
        }
        return $data;
    }

    public static function decodeStatus($x)
    {
        switch($x){
            case 0: return 'Inactivo';
            case 1: return 'Activo';
            default: return 'Desconocido';
        }
    }
}
