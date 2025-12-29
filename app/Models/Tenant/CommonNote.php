<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommonNote extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'type',             ///1: Clients; 2: Tasks
        'type_id',          
        'created_by',
        'notes',
        'extra_int',
        'extra_string',
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->created_by = auth()->user()->id;
        });

        static::created(function ($model) {
            if ($model->type == 1){
                $model->client->histories()->create([
                    'type' => 5,
                    'type_id' => $model->id
                ]);
            }
        });        
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'type_id');
    }

    public function user()
    {
        return $this->belongsTo(TenantUser::class, 'created_by');
    }
}
