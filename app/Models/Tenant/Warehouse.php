<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'location',
        'description',
        'manager_name',
        'manager_phone',
        'manager_email',
        'address',
        'city',
        'province',
        'postal_code',
        'is_active',
        'is_main',
        'type',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_main' => 'boolean',
    ];

    // Relaciones
    public function products()
    {
        return $this->belongsToMany(
            \App\Models\Central\Product::class,
            'product_warehouse',
            'warehouse_id',
            'product_id'
        )->withPivot([
            'stock',
            'min_stock',
            'max_stock',
            'reorder_point',
            'reorder_quantity',
            'location_code',
            'cost_price',
            'last_restock_date'
        ])->withTimestamps();
    }

    public function productWarehouses()
    {
        return $this->hasMany(ProductWarehouse::class);
    }

    public function orders()
    {
        return $this->hasMany(WarehouseOrder::class);
    }

    public function loadingOrders()
    {
        return $this->hasMany(LoadingOrder::class, 'source_warehouse_id');
    }

    // Métodos
    public function getTotalStock()
    {
        return $this->productWarehouses()->sum('stock');
    }

    public function getLowStockProducts()
    {
        return $this->productWarehouses()
            ->whereRaw('stock <= min_stock')
            ->with('product')
            ->get();
    }

    public function getProductStock($productId)
    {
        $pw = $this->productWarehouses()
            ->where('product_id', $productId)
            ->first();

        return $pw ? $pw->stock : 0;
    }

    public function addStock($productId, $quantity, $locationCode = null)
    {
        $pw = ProductWarehouse::firstOrCreate(
            [
                'product_id' => $productId,
                'warehouse_id' => $this->id,
            ],
            [
                'stock' => 0,
                'min_stock' => 0,
                'reorder_point' => 0,
                'reorder_quantity' => 0,
            ]
        );

        $pw->stock += $quantity;
        if ($locationCode) {
            $pw->location_code = $locationCode;
        }
        $pw->last_restock_date = now();
        $pw->save();

        return $pw;
    }

    public function removeStock($productId, $quantity)
    {
        $pw = $this->productWarehouses()
            ->where('product_id', $productId)
            ->first();

        if (!$pw || $pw->stock < $quantity) {
            return false;
        }

        $pw->stock -= $quantity;
        $pw->save();

        return true;
    }

    public function checkAndCreateAutomaticOrders()
    {
        $lowStockProducts = $this->productWarehouses()
            ->whereRaw('stock <= reorder_point')
            ->where('reorder_quantity', '>', 0)
            ->get();

        foreach ($lowStockProducts as $pw) {
            // Verificar si ya existe una orden pendiente
            $existingOrder = WarehouseOrder::where('warehouse_id', $this->id)
                ->where('product_id', $pw->product_id)
                ->whereIn('status', ['pending', 'ordered'])
                ->first();

            if (!$existingOrder) {
                WarehouseOrder::create([
                    'warehouse_id' => $this->id,
                    'product_id' => $pw->product_id,
                    'quantity' => $pw->reorder_quantity,
                    'status' => 'pending',
                    'order_type' => 'automatic',
                ]);
            }
        }
    }

    public function getValueInventory()
    {
        return $this->productWarehouses()
            ->whereNotNull('cost_price')
            ->get()
            ->sum(function ($pw) {
                return $pw->stock * $pw->cost_price;
            });
    }
}
