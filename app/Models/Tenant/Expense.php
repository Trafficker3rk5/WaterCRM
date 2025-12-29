<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'supplier',
        'description',
        'receipt_image',
        'ocr_processed',
        'ocr_data',
        'status',
        'approved_by',
        'approved_at',
        'expense_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'ocr_processed' => 'boolean',
        'ocr_data' => 'array',
        'approved_at' => 'datetime',
        'expense_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(TenantUser::class);
    }

    public function approver()
    {
        return $this->belongsTo(TenantUser::class, 'approved_by');
    }

    public function approve($approverId = null)
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approverId ?? auth()->id(),
            'approved_at' => now(),
        ]);
    }

    public function reject()
    {
        $this->update(['status' => 'rejected']);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}
