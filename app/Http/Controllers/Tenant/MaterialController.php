<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Tenant\Material;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterialController extends Controller
{
    public function index()
    {
        return Inertia::render('Tenant/Materials/MaterialList', ['title' => 'Materiales']);
    }

    public function list(Request $request)
    {
        $data = Material::get()->map(function($pr){
            $pr->image_url = $pr->getImage();
            $pr->price = Lerph::showPrice($pr->price);
            return $pr;
        });
        
        return $data;
    }

    public function create()
    {
        return Inertia::render('Tenant/Materials/MaterialForm', [
            'title' => 'Agregar Material',
            'material' => new Material()
        ]);
    }

    public function edit($uid)
    {
        $material = Material::find($uid);
        $material->image_url = $material->getImage();
        return Inertia::render('Tenant/Materials/MaterialForm', [
            'title' => 'Editar Material',
            'material' => $material
        ]);
    }

    public function store(Request $request)
    {
        $id = $request->id;
        if (empty($id)) $id = 0;
        return $this->upsertData($request, $id);
    }

    public function upsertData($request, $id){
        $this->validateForm($request, $id);

        if (empty($request->id)) $material = new Material($request->except(['id']));
        else {
            $material = Material::find($request->id);
            if ($material) $material->fill($request->except(['id']));
            else $material = new Material($request->except(['id']));
        }
        $material->active = $request->active ? 1 : 0;
        $material->save();

        ///Save Logo
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $name = $file->hashName();
            $file->storeAs(tenant('id'), $name, 'materials');
            $material->image = $name;
            $material->save();
        }

        return redirect()->route('materials')->with('message', 'Datos guardados correctamente.');
    }

    public function destroy($id)
    {
        $material = Material::findOrFail($id);
        $material->delete();
        return redirect()->back()->with('message', 'Material borrado correctamente.');
    }

    private function validateForm(Request $request, $id){
        return $request->validate([
            'name' => 'required|max:255',
            'reference' => 'required|max:100',
            'description' => 'max:500'
        ],
        [],
        [
            'name' => 'nombre',
            'reference' => 'referencia',
            'description' => 'descripción'
        ]);
    }

    private function getAllRols(){
        $rols = [];
        for($i = 1; $i <= 6; $i++) $rols[] = ['value' => $i, 'label' => Lerph::getTenantRolName($i)];
        return $rols;
    }

    public function changeStatus($id){
        $material = Material::find($id);
        $material->active = $material->active ? 0 : 1;
        $material->save();
        return redirect()->back()->with('message', 'Estado cambiado correctamente.');
    }
}
