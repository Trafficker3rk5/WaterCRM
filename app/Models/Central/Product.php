<?php

namespace App\Models\Central;

use App\Models\Main\Tenant;
use App\Models\Tenant\TenantProduct;
use App\Models\Tenant\TenantProductAttribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class Product extends Model
{
    use HasFactory, CentralConnection;
    use SoftDeletes;
    
    protected $fillable = [
        'model',
        'name',
        'description',
        'active',
        'code',
        'family_id',
        'category_id',
        'parts',
        'other_parts',
        'dismantling',
        'model_en',
        'name_en',
        'description_en',
        'lts',
        'gas',
        'worktop',
        'predosing',
        'has_extras',
        'is_extra'
    ];

    protected $appends = [
        'final_name',
        'final_model',
        'prices'
    ];

    public function getFinalNameAttribute(){
        return !empty($this->inner_name) ? $this->inner_name : $this->name;
    }

    public function getFinalModelAttribute(){
        return !empty($this->inner_model) ? $this->inner_model : $this->model;
    }

    public function getPricesAttribute()
    {
        return json_decode($this->inner_prices, true);
    }
    
    public function family()
    {
        return $this->belongsTo(AdminCatalog::class, 'family_id');
    }

    public function category()
    {
        return $this->belongsTo(AdminCatalog::class, 'category_id');
    }

    public function files()
    {
        return $this->hasMany(ProductFile::class);
    }

    public function attributes()
    {
        return $this->hasMany(ProductAttr::class, 'product_id')->join('admin_catalogs', 'product_attrs.attribute_id', '=', 'admin_catalogs.id')->select('product_attrs.*', 'admin_catalogs.name as attribute_name', 'admin_catalogs.type as attribute_type')->orderBy('admin_catalogs.order');
    }

    public function attributesActive()
    {
        $attrs = $this->{'attributes'}()->get()->map(function($attr) {
            $at = TenantProductAttribute::where('product_id', $attr->product_id)->where('attribute_id', $attr->attribute_id)->first();
            $attr->inner_active = $at ? 1 : 0;
            return $attr;
        });
        return $attrs;
    }

    public function images()
    {
        return $this->hasMany(ProductFile::class, 'product_id')->where('type', 1)->orderBy('order');
    }

    public function videos()
    {
        return $this->hasMany(ProductFile::class, 'product_id')->where('type', 2)->orderBy('order');
    }

    public function documents()
    {
        return $this->hasMany(ProductFile::class, 'product_id')->where('type', 3)->orderBy('order');
    }

    public function extras()
    {
        return $this->belongsToMany(Product::class, 'product_extras', 'product_id', 'extra_id')
            ->where('is_extra', true)
            ->where('active', true);
    }

    public function productsWithThisExtra()
    {
        return $this->belongsToMany(Product::class, 'product_extras', 'extra_id', 'product_id');
    }

    public function getMainImage()
    {
        $img = ProductFile::where('product_id', $this->id)->where('type', 1)->where('image_type', 1)->orderBy('order')->first();
        return $img ? $img->getUrlAttribute() : '';
    }

    public function getFilesData($t)
    {
        $files = $t == 1 ? $this->images : ($t == 2 ? $this->videos : $this->documents);
        $data = [];
        foreach ($files as $file) {
            $data[] = [
                'id' => $file->id,
                'title' => $file->title,
                'file' => $file->file,
                'size' => $file->size,
                'order' => $file->order,
                'img' => $file->url,
                'type' => $t == 1 ? 'image' : ($t == 2 ? 'video' : 'file'),
                'image_type' => $file->image_type ?? '0'
            ];
        }
        return $data;
    }

    public function getTenantProduct()
    {
        try {
            $pt = TenantProduct::where('id', $this->id)->first();
            if (!$pt) {
                $pt = TenantProduct::create([
                    'id' => $this->id,
                    'inner_name' => $this->name,
                    'inner_model' => $this->model,
                    'inner_active' => 1,
                ]);
            }

            foreach ($pt->getAttributes() as $key => $value) $this->$key = $value;
        } catch (\Exception $e) {
            // If tenant product query fails, use default values
            \Log::warning('Failed to get tenant product for ID ' . $this->id . ': ' . $e->getMessage());
            // Set default values if tenant product query fails
            $this->inner_name = $this->name;
            $this->inner_model = $this->model;
            $this->inner_active = 1;
        }
    }
}
