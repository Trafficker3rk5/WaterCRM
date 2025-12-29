<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InstallerWarehouse extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'vehicle_plate', 'vehicle_brand',
        'vehicle_model', 'max_capacity', 'notes', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    public function loadingOrders()
    {
        return $this->hasMany(LoadingOrder::class);
    }

    public function getCurrentStock()
    {
        return $this->loadingOrders()
            ->whereIn('status', ['validated', 'loaded'])
            ->with('items')
            ->get()
            ->sum(function ($order) {
                return $order->items->sum('quantity_loaded');
            });
    }

    public function getCapacityUsagePercentage()
    {
        if (!$this->max_capacity || $this->max_capacity == 0) {
            return null;
        }
        return ($this->getCurrentStock() / $this->max_capacity) * 100;
    }
}
