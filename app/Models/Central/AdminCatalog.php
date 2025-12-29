<?php

namespace App\Models\Central;

use App\Models\Main\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class AdminCatalog extends Model
{
    use HasFactory, CentralConnection;
    use SoftDeletes;

    public $timestamps = false;
    
    protected $fillable = [
        'type',
        'name',
        'description',
        'extra_1',
        'name_en',
        'order',
    ];

    public function getExtraData()
    {
        $data = [];
        foreach(explode(',', $this->extra_1) as $e1){
            if (!empty($e1)){
                if ($this->type == 2) $x = Product::find($e1);
                else $x = AdminCatalog::find($e1);
                if ($x) $data[] = $x;
            }
        }

        usort($data, function($x1, $x2){
            return $x1->order - $x2->order;
        });

        return $data;
    }
}
