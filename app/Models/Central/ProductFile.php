<?php

namespace App\Models\Central;

use App\Models\Main\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\CentralConnection;
use Storage;

class ProductFile extends Model
{
    use HasFactory, CentralConnection;

    public $timestamps = false;
    
    protected $fillable = [
        'product_id',
        'type',
        'file',
        'title',
        'order',
        'size',
        'image_type'
    ];
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getUrlAttribute()
    {
        if (empty($this->file)) {
            return 'https://ui-avatars.com/api/?name=Aqua&color=7F9CF5&background=EBF4FF';
        }
        
        // Use current request domain to support tenant subdomains (e.g., aquaam.waascrm.com)
        // This ensures images are accessible from the correct tenant domain
        try {
            $baseUrl = request()->getSchemeAndHttpHost();
        } catch (\Exception $e) {
            // Fallback to APP_URL if request context is not available
            $baseUrl = env('APP_URL', 'https://waascrm.com');
        }
        
        // Ensure product_id is available
        $productId = $this->product_id ?? ($this->product->id ?? null);
        if (empty($productId)) {
            return 'https://ui-avatars.com/api/?name=Aqua&color=7F9CF5&background=EBF4FF';
        }
        
        // URL-encode the filename to handle spaces and special characters
        // This is critical for filenames like "RO1123 cOMPACT 600.jpg"
        $encodedFile = rawurlencode($this->file);
        
        // Construct the full URL with proper encoding
        $url = rtrim($baseUrl, '/') . '/storage/products/' . $productId . '/' . $encodedFile;
        
        return $url;
    }
}
