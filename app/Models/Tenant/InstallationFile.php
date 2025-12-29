<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Storage;

class InstallationFile extends Model
{
    use HasFactory;
    public $timestamps = false;
    
    protected $fillable = [
        'installation_id',
        'type',                 ///0: Instalación terminada; 1: Ubicación pegatina; 2: Enganche Grifo; 3: Fotos Adicionales 
        'file',
        'title',
    ];

    public function installation()
    {
        return $this->belongsTo(Installation::class);
    }

    public function getType()
    {
        return ['Instalación terminada', 'Ubicación pegatina', 'Enganche Grifo', 'Fotos Adicionales'][$this->type];
    }

    public function getUrlAttribute()
    {
        return !empty($this->file) ? Storage::disk('installations')->url(tenant('id').'/'.$this->installation_id.'/'.$this->file) : 'https://ui-avatars.com/api/?name=Aqua&color=7F9CF5&background=EBF4FF';
    }
}
