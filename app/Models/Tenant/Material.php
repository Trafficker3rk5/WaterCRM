<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Storage;

class Material extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'reference',
        'description',
        'stock',
        'stock_min',
        'stock_max',
        'image',
        'price',
        'active',
    ];

    public function getImage()
    {
        return !empty($this->image) ? Storage::disk('materials')->url(tenant('id').'/'.$this->image) : 'https://ui-avatars.com/api/?name='.$this->name.'&color=7F9CF5&background=EBF4FF';
    }
}
