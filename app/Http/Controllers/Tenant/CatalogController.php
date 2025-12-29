<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Catalog;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index($type)
    {
        return Inertia::render('Tenant/Catalog/Catalog', ['title' => $this->getTitle($type), 'type' => $type]);
    }

    public function get($type, $Catalog)
    {
        return Catalog::find($Catalog);
    }

    public function list(Request $request, $type)
    {
        $data = Catalog::where('type', $type)->get()->map(function($catalog){
            return $catalog;
        });
        
        return $data;
    }

    public function store($type, Request $request)
    {
        $request->merge(['type' => $type]);
        
        $valid = $this->validateForm($request, $request->id);

        if ($valid){
            if (empty($request->id)) $cc = new Catalog($request->except(['id']));
            else {
                $cc = Catalog::find($request->id);
                if ($cc) $cc->fill($request->only(['name', 'type', 'extra_1', 'extra_2', 'extra_3']));
                else $cc = new Catalog($request->except(['id']));
            }
            if ($type != 6) $cc->extra_1 = isset($request->extra_1) && $request->extra_1 != false ? 1: 0;
            $cc->save();

            return redirect()->back()->with('message', 'Datos guardados correctamente.');
        }
    }

    public function destroy(Catalog $Catalog)
    {
        $Catalog->delete();
        return redirect()->back()->with('message', 'Datos guardados correctamente.');
    }

    private function getTitle($id)
    {
        switch ($id) {
            case 1:
                return 'Origen de los Leads';
            case 2:
                return 'Estado de los Clientes';
            case 3:
                return 'Estado de los Contactos';
            case 4:
                return 'Extras';
            case 5:
                return 'Actividades';
            case 6:
                return 'Tipo de Tareas';
            case 7:
                return 'Apreciaciones';
        }
    }

    private function validateForm(Request $request, $id){
        $t = $request->input('type');
        $c = $request->input('name');
        $ct = Catalog::where('name', $c)->where('type', $t)->first();
        
        if (($ct && $ct->id != $id)) throw ValidationException::withMessages(['name' => 'Ya existe un item con ese nombre']);

        return $request->validate([
            'name' => 'required|max:100',
            'type' => 'required'
        ],
        [],
        [
            'name' => 'Nombre',
            'type' => 'Tipo'
        ]);
    }

    public function getAttributes($cid)
    {
        $catalog = Catalog::findOrFail($cid);

        return $catalog ? $catalog->getExtraData() : [];
    }
}
