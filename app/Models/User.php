<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Helpers\Lerph;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Storage;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'rol_id',
        'manager_id',
        'last_name',
        'phone',
        'full_address',
        'picture',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    
    public function getRolNameAttribute()
    {
        return Lerph::getTenantRolName($this->rol_id);
    }

    public function getFullNameAttribute()
    {
        return $this->name;
    }

    public function getImageUrl()
    {
        return !empty($this->picture) ? Storage::disk('users')->url($this->picture) : 'https://ui-avatars.com/api/?name='.$this->full_name.'&color=7F9CF5&background=EBF4FF';
    }

    /**
     * Hierarchical Relationships
     */
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function subordinates()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /**
     * Role Helper Methods
     */
    public function isManager()
    {
        // Roles: 2 (Jefe Comercial), 4 (Jefe Instalación), 6 (Jefe TMK)
        return in_array($this->rol_id, [2, 4, 6]);
    }

    public function isSalesManager()
    {
        return $this->rol_id == 2;
    }

    public function isInstallationManager()
    {
        return $this->rol_id == 4;
    }

    public function isTMKManager()
    {
        return $this->rol_id == 6;
    }

    public function isSales()
    {
        return in_array($this->rol_id, [2, 3]); // Jefe Comercial y Comercial
    }

    public function isInstaller()
    {
        return in_array($this->rol_id, [4, 5]); // Jefe Instalación e Instalador
    }

    public function isTMK()
    {
        return in_array($this->rol_id, [6, 7]); // Jefe TMK y TMK
    }

    public function isWarehouse()
    {
        return $this->rol_id == 8;
    }

    public function isAdmin()
    {
        return in_array($this->rol_id, [0, 1]); // Super Admin y Admin
    }
}
