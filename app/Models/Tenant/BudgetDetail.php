<?php

namespace App\Models\Tenant;

use App\Helpers\Lerph;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Storage;

class BudgetDetail extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'budget_id',
        'installation',
        'installation_cost',
        'init_amount',
        'last_amount',
        'type',             /// 0: Venta; 1: Alquiler; 2: Renting
        'maintenance',
        'extra_id',
        'dues',
        'price',
        'discount',
        'notes',
        'iva',
        'status',            /// 0: Pendiente, 1: Aprobado,
        'horeca_data',
    ];

    protected $appends = ['txt'];

    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    public function extra()
    {
        return $this->belongsTo(Catalog::class);
    }

    public function getType()
    {
        return ['Venta', 'Alquiler', 'Renting'][$this->type];
    }

    public function getTxtAttribute($value)
    {
        if ($this->budget->is_horeca){
            $horecaData = json_decode($this->horeca_data);
            $this->type = $horecaData->extra->HORECA_TYPES[0];
            $this->price = $horecaData->allData->productCost;
            $this->dues = $horecaData->due;
        }
        return $this->getType().' por '.Lerph::showPrice($this->price).' en '.$this->dues.' cuota'.($this->dues > 1 ? 's' : '');
    }

    public function installations()
    {
        return $this->hasMany(Installation::class);
    }
}
