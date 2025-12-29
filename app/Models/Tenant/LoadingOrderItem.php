<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoadingOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'loading_order_id',
        'product_id',
        'quantity_requested',
        'quantity_loaded',
        'notes',
    ];

    public function loadingOrder()
    {
        return $this->belongsTo(LoadingOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(\App\Models\Central\Product::class);
    }

    public function isFullyLoaded()
    {
        return $this->quantity_loaded >= $this->quantity_requested;
    }

    public function getPendingQuantity()
    {
        return max(0, $this->quantity_requested - $this->quantity_loaded);
    }
}
