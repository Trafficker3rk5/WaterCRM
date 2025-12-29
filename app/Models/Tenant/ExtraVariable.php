<?php

namespace App\Models\Tenant;

use App\Helpers\Lerph;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Storage;

class ExtraVariable extends User
{
    use HasFactory;

    public $timestamps = false;
    
    protected $fillable = [
        'name', 
        'value', 
        'module'
    ];
}
