<?php

namespace App\Models\Tenant;

use App\Models\Central\ProductAttr;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantProductAttribute extends Model
{
    use HasFactory;

    public $timestamps = false;
    public $incrementing = false;

    protected $table = 'tenant_product_attrs';
    
    protected $fillable = [
        'product_id',
        'attribute_id',
    ];
}
