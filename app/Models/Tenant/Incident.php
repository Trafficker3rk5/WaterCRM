<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'type',
        'priority',
        'status',
        'assigned_to',
        'created_by',
        'client_id',
        'budget_id',
        'installation_id',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the user assigned to this incident
     */
    public function assignedUser()
    {
        return $this->belongsTo(TenantUser::class, 'assigned_to');
    }

    /**
     * Get the user who created this incident
     */
    public function creator()
    {
        return $this->belongsTo(TenantUser::class, 'created_by');
    }

    /**
     * Get the client related to this incident
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the budget related to this incident
     */
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    /**
     * Get the installation related to this incident
     */
    public function installation()
    {
        return $this->belongsTo(Installation::class);
    }

    /**
     * Scope for pending incidents
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for in progress incidents
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope for resolved incidents
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    /**
     * Scope for automatic incidents
     */
    public function scopeAutomatic($query)
    {
        return $query->where('type', 'automatic');
    }

    /**
     * Scope for manual incidents
     */
    public function scopeManual($query)
    {
        return $query->where('type', 'manual');
    }

    /**
     * Mark incident as resolved
     */
    public function markAsResolved()
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }
}
