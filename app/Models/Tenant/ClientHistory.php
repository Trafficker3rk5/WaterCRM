<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Storage;

class ClientHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'user_id',
        'type',             ///1: Creacion; 2: Cambio de Estado; 3: Tarea; 4: Presupuesto; 5: Notas; 6: Paso de Contacto a Cliente
        'type_id',
        'extra'             ///<2>: Estado Nuevo; <3>: Estado Tarea; <4>: Estado presupuesto
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($clientHistory) {
            $clientHistory->user_id = auth()->user()->id ?? 0;
        });
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(TenantUser::class);
    }

    public function getType()
    {
        switch ($this->type) {
            case 1: return 'Creación';
            case 2: return 'Cambio de Estado';
            case 3: return 'Tarea';
            case 4: return 'Presupuesto';
            case 5: return 'Notas';
            case 6: return 'Contacto a Cliente';
            default: return 'Desconocido'; 
        }
    }

    public function getSubtitle()
    {
        switch ($this->type) {
            case 1: return 'Cliente creado';
            case 2: return 'Se cambio al estado '.  (Catalog::where('id', $this->extra)->first()->name ?? '');
            case 3: 
                $task = Task::where('id', $this->type_id)->first();
                return empty($this->extra) ? 'Se creo la tarea '. $task->title : 'Se cambio al estado '. ($this->extra == 1 ? 'Completado' : 'Cancelado');
            case 4: 
                $budget = Budget::where('id', $this->type_id)->first();
                return empty($this->extra) ? 'Se creo el presupuesto #'. ($budget->id ?? '') : 'Se cambio al estado '. ($this->extra == 1 ? 'Aprobado' : 'Rechazado');
            case 5: return CommonNote::where('id', $this->type_id)->first()->notes ?? '';
            case 6: return 'Paso de Contacto a Cliente';
        }
    }
}
