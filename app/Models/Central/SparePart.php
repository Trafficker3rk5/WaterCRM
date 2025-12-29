<?php

namespace App\Models\Central;

use App\Models\Main\Tenant;
use App\Models\Tenant\Catalog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\CentralConnection;
use Storage;

class SparePart extends Model
{
    use HasFactory, CentralConnection;
    use SoftDeletes;

    public $timestamps = false;
    
    protected $fillable = [
        'name',
        'description',
        'stock',
        'reference',
        'compatibility_id',
        'name_en',
        'image',
        'type_id',
    ];

    protected $appends = [
        'image_url'
    ];

    public function compatibility()
    {
        return $this->belongsTo(Product::class, 'compatibility_id');
    }

    public function others()
    {
        return $this->hasMany(SparePartOther::class);
    }

    public function type()
    {
        return $this->belongsTo(AdminCatalog::class);
    }

    public function getImageUrlAttribute()
    {
        return !empty($this->image) ? Storage::disk('parts')->url($this->image) : 'https://ui-avatars.com/api/?name='.$this->name.'&color=7F9CF5&background=EBF4FF';
    }

    public function getUsedIn()
    {
        $usedIn = [];
        $products = Product::all();
        foreach ($products as $product){
            $parts = explode(',', $product->parts);
            $others = explode(',', $product->others);
            if (in_array($this->id, $parts) || in_array($this->id, $others)) $usedIn[] = $product->name;
        }
        return $usedIn;
    }
}
