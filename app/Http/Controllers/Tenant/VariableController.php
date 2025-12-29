<?php

namespace App\Http\Controllers\Tenant;
use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Tenant\ExtraVariable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class VariableController extends Controller
{
    public function index()
    {
        return Inertia::render('Tenant/Variables', [
            'title' => 'Variables', 
            'extra' => ExtraVariable::pluck('value', 'name'),
            'families' => AdminCatalog::select('name as label', 'id as value')->where('type', 5)->get()
        ]);
    }

    public function save(Request $request){
        $extra = $request->input('extra', []);
        foreach ($extra as $key => $value) ExtraVariable::where('name', $key)->update(['value' => is_array($value) ? implode(',', $value) : $value]);

        return redirect()->back()->with('message', 'Datos guardados correctamente.');
    }
}
