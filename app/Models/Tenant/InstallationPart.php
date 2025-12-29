<?php

namespace App\Models\Tenant;

use App\Models\Central\SparePart;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallationPart extends Model
{
    use HasFactory;

    public $timestamps = false;
    
    protected $fillable = [
        'installation_id',
        'spare_part_id',
        'quantity'
    ];

    public function installation()
    {
        return $this->belongsTo(Installation::class);
    }

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }
}
