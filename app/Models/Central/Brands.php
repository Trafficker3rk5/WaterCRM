<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Main\Tenant;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brands extends Model
{
    use HasFactory;
    use SoftDeletes;


    protected $fillable = [
        'brand',
        'prices',
        'type'
    ];

    protected $casts = [
        'prices' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::deleted(function ($brand) {
            if (!empty(tenant('id'))) return;
            $tenants = Tenant::all();
            foreach ($tenants as $tenant) {
                $tenant->run(function () use ($brand) {
                    Brands::where('id', $brand->id)->delete();
                });
            }
        });

        static::created(function ($brand) {
            if (!empty(tenant('id'))) return;
            $tenants = Tenant::all();
            foreach ($tenants as $tenant) {
                $tenant->run(function () use ($brand) {
                    $data = $brand->toArray();
                    unset($data['deleted_at']);
                    unset($data['created_at']);
                    unset($data['updated_at']);
                    Brands::create($data);
                });
            }
        });

        static::updated(function ($brand) {
            if (!empty(tenant('id'))) return;
            $tenants = Tenant::all();
            foreach ($tenants as $tenant) {
                $tenant->run(function () use ($brand) {
                    $data = $brand->toArray();
                    unset($data['deleted_at']);
                    unset($data['created_at']);
                    unset($data['updated_at']);
                    Brands::where('id', $brand->id)->update($data);
                });
            }
        });
    }
}
