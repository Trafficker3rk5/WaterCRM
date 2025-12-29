<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'created_by',
        'assigned_to',
        'date',
        'date_end',
        'title',
        'description',
        'client_id',
        'status',                   ///0: Pendinte, 1: Completado, 2: Cancelado
        'type_id',
        'appreciation_id'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->created_by = auth()->user()->id;
        });

        static::created(function ($model) {
            if (!empty($model->client)){
                $model->client->histories()->create([
                    'type' => 3,
                    'type_id' => $model->id
                ]);
            }
        });

        static::updated(function ($model) {
            if ($model->isDirty('status') && !empty($model->client)){
                $model->client->histories()->create([
                    'type' => 3,
                    'type_id' => $model->id,
                    'extra' => $model->status
                ]);
            }
        });
    }

    public function createdBy()
    {
        return $this->belongsTo(TenantUser::class, 'created_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(TenantUser::class, 'assigned_to');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function type()
    {
        return $this->belongsTo(Catalog::class);
    }

    public function appreciation()
    {
        return $this->belongsTo(Catalog::class);
    }
}
