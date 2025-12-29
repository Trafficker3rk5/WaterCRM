<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallationNote extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'installation_id',
        'user_id',
        'notes',
        'status',       /// 2: Canceled; 3: Posposed
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->user_id = auth()->user()->id;
        });
    }

    public function installation()
    {
        return $this->belongsTo(Installation::class);
    }

    public function user()
    {
        return $this->belongsTo(TenantUser::class);
    }

    public function getStatus()
    {
        return ['Pendiente', 'Realizado', 'Cancelado', 'Pospuesto'][$this->status];
    }
}
