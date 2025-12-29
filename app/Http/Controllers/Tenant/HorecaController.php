<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Central\Product;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\ExtraVariable;
use App\Models\Tenant\Task;
use App\Models\Tenant\TenantProduct;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class HorecaController extends Controller
{
    private $GAS_ID = 12;
    private $PRED_ID = 78;
    
    public function calculate(Request $request)
    {
        $request->validate([
            'freq_1' => ['required'],
            'boxes1' => ['required'],
            'bottles1' => ['required'],
            'capacity1' => ['required'],
            'cost1' => ['required']
        ], 
        [],
        [
            'freq_1' => 'Frecuencia',
            'boxes1' => 'Cajas',
            'bottles1' => 'Botellas',
            'capacity1' => 'Capacidad',
            'cost1' => 'Costo'
        ]);
        $lts = $request->input('totalLts', 0);
        
        $products = Product::where('lts', '>=', $lts)->orderBy('lts', 'desc')->get()->map(function($pr){
            $pr->getTenantProduct();
            $pr->prices = $pr->inner_prices;
            return $pr;
        });

        return redirect()->back()->with('message', [
            'products' => $products, 
            'lts' => $lts
        ]);
    }

    public function getData()
    {
        $clients = Client::get()->map(function($t){
            $t->label = $t->full_name;
            $t->value = $t->id;
            return $t;
        });
        
        return [
            'extra' => ExtraVariable::pluck('value', 'name'),
            'dues' => Lerph::getDuesSelect(),
            'clients' => $clients,
            'extras' => Catalog::select('name as label', 'id as value')->where('type', 4)->get(),
        ];
    }
}
