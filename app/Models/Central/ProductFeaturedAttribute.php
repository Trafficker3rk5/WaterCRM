<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductFeaturedAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'title',
        'icon_image',
        'order',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
