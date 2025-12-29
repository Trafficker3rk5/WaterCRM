<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Address extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $timestamps = false;
    
    protected $fillable = [
        'name',
        'contact_name',
        'contact_phone',
        'full_address',
        'street',
        'number',
        'door',
        'urb',
        'postal_code',
        'city',
        'province',
        'country',
        'lat',
        'long',
        'notes',
        'principal',
        'billing',
    ];

    public function clients()
    {
        return $this->belongsToMany(Client::class);
    }
}
