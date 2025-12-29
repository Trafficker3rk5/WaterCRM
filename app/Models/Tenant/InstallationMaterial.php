<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InstallationMaterial extends Model
{
    use HasFactory;

    public $timestamps = false;
    
    protected $fillable = [
        'installation_id',
        'material_id',
        'quantity'
    ];

    public function installation()
    {
        return $this->belongsTo(Installation::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
