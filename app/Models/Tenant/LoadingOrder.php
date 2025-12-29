<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoadingOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number', 'installer_warehouse_id', 'source_warehouse_id',
        'created_by', 'validated_by', 'status', 'notes',
        'validated_at', 'loaded_at', 'validation_comments',
    ];

    protected $casts = [
        'validated_at' => 'datetime',
        'loaded_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });
    }

    public static function generateOrderNumber()
    {
        $year = date('Y');
        $lastOrder = self::where('order_number', 'like', "LO-{$year}-%")->orderBy('id', 'desc')->first();
        $newNumber = $lastOrder ? str_pad(intval(substr($lastOrder->order_number, -4)) + 1, 4, '0', STR_PAD_LEFT) : '0001';
        return "LO-{$year}-{$newNumber}";
    }

    public function installerWarehouse()
    {
        return $this->belongsTo(InstallerWarehouse::class);
    }

    public function sourceWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'source_warehouse_id');
    }

    public function creator()
    {
        return $this->belongsTo(TenantUser::class, 'created_by');
    }

    public function validator()
    {
        return $this->belongsTo(TenantUser::class, 'validated_by');
    }

    public function items()
    {
        return $this->hasMany(LoadingOrderItem::class);
    }

    public function validate($validatedBy, $comments = null)
    {
        $this->update([
            'status' => 'validated',
            'validated_by' => $validatedBy,
            'validated_at' => now(),
            'validation_comments' => $comments,
        ]);
    }

    public function markAsLoaded()
    {
        if ($this->sourceWarehouse) {
            foreach ($this->items as $item) {
                $this->sourceWarehouse->removeStock($item->product_id, $item->quantity_loaded);
            }
        }
        $this->update(['status' => 'loaded', 'loaded_at' => now()]);
    }

    public function cancel()
    {
        $this->update(['status' => 'cancelled']);
    }

    public function getTotalItems()
    {
        return $this->items()->sum('quantity_requested');
    }

    public function getTotalLoadedItems()
    {
        return $this->items()->sum('quantity_loaded');
    }
}
