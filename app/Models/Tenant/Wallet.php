<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    /**
     * Get the user that owns the wallet
     */
    public function user()
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    /**
     * Get all transactions for this wallet
     */
    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class)->orderBy('created_at', 'desc');
    }

    /**
     * Add funds to the wallet
     */
    public function addFunds($amount, $paymentMethod, $concept, $description = null, $createdBy = null, $budgetId = null)
    {
        $transaction = $this->transactions()->create([
            'type' => 'income',
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'concept' => $concept,
            'description' => $description,
            'created_by' => $createdBy ?? auth()->id(),
            'budget_id' => $budgetId,
        ]);

        $this->increment('balance', $amount);

        return $transaction;
    }

    /**
     * Withdraw funds from the wallet
     */
    public function withdrawFunds($amount, $paymentMethod, $concept, $description = null, $createdBy = null, $budgetId = null)
    {
        if ($this->balance < $amount) {
            throw new \Exception('Insufficient funds in wallet');
        }

        $transaction = $this->transactions()->create([
            'type' => 'outcome',
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'concept' => $concept,
            'description' => $description,
            'created_by' => $createdBy ?? auth()->id(),
            'budget_id' => $budgetId,
        ]);

        $this->decrement('balance', $amount);

        return $transaction;
    }

    /**
     * Get total income
     */
    public function getTotalIncomeAttribute()
    {
        return $this->transactions()->where('type', 'income')->sum('amount');
    }

    /**
     * Get total outcome
     */
    public function getTotalOutcomeAttribute()
    {
        return $this->transactions()->where('type', 'outcome')->sum('amount');
    }
}
