<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'payment_method',
        'concept',
        'description',
        'created_by',
        'budget_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the wallet that owns the transaction
     */
    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * Get the user who created the transaction
     */
    public function creator()
    {
        return $this->belongsTo(TenantUser::class, 'created_by');
    }

    /**
     * Get the budget related to this transaction
     */
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    /**
     * Scope to get income transactions
     */
    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    /**
     * Scope to get outcome transactions
     */
    public function scopeOutcome($query)
    {
        return $query->where('type', 'outcome');
    }

    /**
     * Scope to get deposits
     */
    public function scopeDeposits($query)
    {
        return $query->where('concept', 'deposit');
    }

    /**
     * Scope to get payments
     */
    public function scopePayments($query)
    {
        return $query->where('concept', 'payment');
    }

    /**
     * Scope to get deliveries
     */
    public function scopeDeliveries($query)
    {
        return $query->where('concept', 'delivery');
    }
}
