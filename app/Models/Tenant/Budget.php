<?php

namespace App\Models\Tenant;

use App\Models\Central\Product;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Storage;

class Budget extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'client_id',
        'created_by',
        'products',
        'quantities',
        'status',               /// 0: Pendiente, 1: Aprobado, 2: Rechazado
        'rejection_reason',
        'is_horeca'
    ];

    protected $appends = [
        'products_txt',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->created_by = auth()->user()->id ?? 0;
        });

        static::created(function ($model) {
            $model->client->histories()->create([
                'type' => 4,
                'type_id' => $model->id
            ]);
        });

        static::updated(function ($model) {
            if ($model->isDirty('status')){
                $model->client->histories()->create([
                    'type' => 4,
                    'type_id' => $model->id,
                    'extra' => $model->status
                ]);
            }
        });
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(TenantUser::class, 'created_by');
    }

    public function details()
    {
        return $this->hasMany(BudgetDetail::class);
    }

    public function contractSignatures()
    {
        return $this->hasMany(ContractSignature::class);
    }

    public function getProductsTxtAttribute()
    {
        $txt = [];
        $quantities = explode(',', $this->quantities);
        foreach (explode(',', $this->products) as $key => $product) {
            if (empty($product)) continue;
            $pr = Product::find($product);
            if (!$pr) continue;
            $pr->getTenantProduct();
            $txt[] = $pr->final_name . ' x' . $quantities[$key];
        }
        return implode(', ', $txt);
    }

    public function getStatus()
    {
        switch ($this->status) {
            case 0:
                return 'Pendiente';
            case 1:
                return 'Aprobado';
            case 2:
                return 'Rechazado';
        }
    }


}
