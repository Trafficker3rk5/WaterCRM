<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesGoal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'description', 'type', 'user_id', 'team_name', 'team_user_ids',
        'period_type', 'period_start', 'period_end', 'target_amount', 'target_units',
        'current_amount', 'current_units', 'reward_amount', 'reward_description',
        'is_active', 'created_by',
    ];

    protected $casts = [
        'team_user_ids' => 'array',
        'period_start' => 'date',
        'period_end' => 'date',
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'reward_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(TenantUser::class, 'user_id');
    }

    public function creator()
    {
        return $this->belongsTo(TenantUser::class, 'created_by');
    }

    public function getProgressPercentage()
    {
        return $this->target_amount == 0 ? 0 : min(100, ($this->current_amount / $this->target_amount) * 100);
    }

    public function getUnitsProgressPercentage()
    {
        return (!$this->target_units || $this->target_units == 0) ? null : min(100, ($this->current_units / $this->target_units) * 100);
    }

    public function isAchieved()
    {
        $amountAchieved = $this->current_amount >= $this->target_amount;
        $unitsAchieved = !$this->target_units || $this->current_units >= $this->target_units;
        return $amountAchieved && $unitsAchieved;
    }

    public function getRemainingAmount()
    {
        return max(0, $this->target_amount - $this->current_amount);
    }

    public function getRemainingUnits()
    {
        return !$this->target_units ? null : max(0, $this->target_units - $this->current_units);
    }

    public function updateProgress()
    {
        if ($this->type === 'individual' && $this->user_id) {
            $sales = Budget::where('user_id', $this->user_id)
                ->where('status', 'accepted')
                ->whereBetween('created_at', [$this->period_start, $this->period_end])
                ->selectRaw('SUM(total) as total_amount, COUNT(*) as total_units')
                ->first();

            $this->update([
                'current_amount' => $sales->total_amount ?? 0,
                'current_units' => $sales->total_units ?? 0,
            ]);
        } elseif ($this->type === 'team' && $this->team_user_ids) {
            $sales = Budget::whereIn('user_id', $this->team_user_ids)
                ->where('status', 'accepted')
                ->whereBetween('created_at', [$this->period_start, $this->period_end])
                ->selectRaw('SUM(total) as total_amount, COUNT(*) as total_units')
                ->first();

            $this->update([
                'current_amount' => $sales->total_amount ?? 0,
                'current_units' => $sales->total_units ?? 0,
            ]);
        }
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        $now = now();
        return $query->where('period_start', '<=', $now)->where('period_end', '>=', $now);
    }
}
