<?php

namespace App\Models\Central;

use App\Models\Main\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class SparePartOther extends Model
{
    use HasFactory, CentralConnection;
    public $timestamps = false;

    public $incrementing = false;

    protected $primaryKey = null;
    
    protected $fillable = [
        'spare_part_id',
        'product_id'
    ];

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
