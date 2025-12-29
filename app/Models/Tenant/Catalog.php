<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Catalog extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $timestamps = false;
    
    protected $fillable = [
        'type',
        'name',
        'description',
        'extra_1',
    ];
}
