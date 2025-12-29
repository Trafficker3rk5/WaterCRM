<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CallList extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'file_name',
        'file_path',
        'total_records',
        'processed_records',
        'successful_calls',
        'failed_calls',
        'pending_calls',
        'status',
        'created_by',
        'assigned_to',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function calls()
    {
        return $this->hasMany(Call::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'in_progress']);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('assigned_to', $userId)
                     ->orWhereHas('calls', function($q) use ($userId) {
                         $q->where('assigned_to', $userId);
                     });
    }

    /**
     * Business Logic
     */
    public function updateStats()
    {
        $this->total_records = $this->calls()->count();
        $this->pending_calls = $this->calls()->where('status', 'pending')->count();
        $this->processed_records = $this->calls()->whereNotIn('status', ['pending'])->count();
        $this->successful_calls = $this->calls()->whereIn('status', [
            'contacted', 'interested', 'converted_contact', 'converted_client'
        ])->count();
        $this->failed_calls = $this->calls()->whereIn('status', [
            'no_answer', 'wrong_number', 'not_interested', 'do_not_call'
        ])->count();

        // Auto-update status
        if ($this->total_records > 0 && $this->processed_records >= $this->total_records) {
            $this->status = 'completed';
        } elseif ($this->processed_records > 0) {
            $this->status = 'in_progress';
        }

        $this->save();
    }

    public function getProgressPercentage()
    {
        if ($this->total_records == 0) return 0;
        return round(($this->processed_records / $this->total_records) * 100, 2);
    }

    public function getSuccessRate()
    {
        if ($this->processed_records == 0) return 0;
        return round(($this->successful_calls / $this->processed_records) * 100, 2);
    }
}
