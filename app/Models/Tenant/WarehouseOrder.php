<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WarehouseOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'warehouse_id', 'product_id', 'quantity', 'unit_price', 'total_price',
        'status', 'order_type', 'supplier', 'supplier_order_number', 'notes',
        'ordered_at', 'expected_at', 'received_at', 'created_by', 'received_by',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'ordered_at' => 'datetime',
        'expected_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(\App\Models\Central\Product::class);
    }

    public function creator()
    {
        return $this->belongsTo(TenantUser::class, 'created_by');
    }

    public function receiver()
    {
        return $this->belongsTo(TenantUser::class, 'received_by');
    }

    public function markAsOrdered()
    {
        $this->update(['status' => 'ordered', 'ordered_at' => now()]);
    }

    public function markAsReceived($receivedBy)
    {
        $this->update(['status' => 'received', 'received_at' => now(), 'received_by' => $receivedBy]);
        $this->warehouse->addStock($this->product_id, $this->quantity);
    }

    public function calculateTotal()
    {
        if ($this->unit_price) {
            $this->total_price = $this->quantity * $this->unit_price;
            $this->save();
        }
    }
}
