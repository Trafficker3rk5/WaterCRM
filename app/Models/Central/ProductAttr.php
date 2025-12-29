<?php

namespace App\Models\Central;

use App\Models\Main\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class ProductAttr extends Model
{
    use HasFactory, CentralConnection;

    public $timestamps = false;

    public $incrementing = false;

    protected $primaryKey = null;
    
    protected $fillable = [
        'product_id',
        'attribute_id',
        'text',
        'text_en',
    ];

    protected $appends = [
        'attr_name'
    ];

    public function attribute()
    {
        return $this->belongsTo(AdminCatalog::class, 'attribute_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getAttrNameAttribute()
    {
        return $this->attribute->name ?? '';
    }
}
