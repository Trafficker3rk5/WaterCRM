<?php

namespace App\Models\Tenant;

use App\Helpers\Lerph;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Storage;

class TenantUser extends User
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'users';
    
    protected $fillable = [
        'last_name',
        'phone',
        'full_address',
        'rol_id',
        'name',
        'email',
        'password',
        'picture'
    ];

    protected $appends = ['full_name', 'avatar_url'];

    public function getFullNameAttribute()
    {
        return $this->name . ' ' . $this->last_name;
    }

    public function rolTenant()
    {
        return Lerph::getTenantRolName($this->rol_id);
    }

    public function getAvatarUrlAttribute()
    {
        return !empty($this->picture) ? Storage::disk('users')->url($this->picture) : 'https://ui-avatars.com/api/?name='.$this->full_name.'&color=7F9CF5&background=EBF4FF';
    }
}
