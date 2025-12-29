<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductWarehouse extends Model
{
    use HasFactory;

    protected $table = 'product_warehouse';

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'stock',
        'min_stock',
        'max_stock',
        'reorder_point',
        'reorder_quantity',
        'location_code',
        'cost_price',
        'last_restock_date',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'last_restock_date' => 'date',
    ];

    public function product()
    {
        return $this->belongsTo(\App\Models\Central\Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function needsReorder()
    {
        return $this->stock <= $this->reorder_point;
    }

    public function isLowStock()
    {
        return $this->stock <= $this->min_stock;
    }

    public function getStockPercentage()
    {
        if (!$this->max_stock || $this->max_stock == 0) {
            return null;
        }

        return ($this->stock / $this->max_stock) * 100;
    }
}
