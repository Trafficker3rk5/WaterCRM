<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Central\Product;
use App\Models\Central\SparePart;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SparePartsController extends Controller
{
    public function index()
    {
        return Inertia::render('Central/SpareParts/SparePartList', ['title' => 'Recambios']);
    }

    public function list(Request $request)
    {
        $data = SparePart::get()->map(function($pr){
            return $pr;
        });
        
        return $data;
    }

    public function create()
    {
        return Inertia::render('Central/SpareParts/SparePartForm', [
            'title' => 'Agregar Recambio',
            'part' => new SparePart(),
            'products' => Product::select('name as label', 'id as value')->get(),
            'others' => [],
            'types' => AdminCatalog::where('type', 6)->select('name as label', 'id as value')->get(),
        ]);
    }

    public function edit($part)
    {
        $part = SparePart::find($part);
        $part->used_in = $part->getUsedIn();
        return Inertia::render('Central/SpareParts/SparePartForm', [
            'title' => 'Editar Recambio',
            'part' => $part,
            'products' => Product::select('name as label', 'id as value')->get(),
            'others' => $part->others,
            'types' => AdminCatalog::where('type', 6)->select('name as label', 'id as value')->get(),
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

        if (empty($request->id)) $part = new SparePart($request->except(['id']));
        else {
            $part = SparePart::find($request->id);
            if ($part) $part->fill($request->only(['name', 'description', 'stock', 'reference', 'type_id', 'price']));
            else $part = new SparePart($request->except(['id']));
        }
        $part->save();

        $this->updateOthers($request, $part);

        ///Update image
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $name = $file->hashName();
            $file->storeAs('', $name, 'parts');
            $part->image = $name;
            $part->save();
        }

        return redirect()->route('parts')->with('message', 'Datos guardados correctamente.');
    }

    public function destroy($part)
    {
        $part = SparePart::findOrFail($part);
        $part->delete();
        return redirect()->back()->with('message', 'Recambio borrado correctamente.');
    }

    private function validateForm(Request $request, $id){
        return $request->validate([
            'name' => 'required|max:100|unique:spare_parts,name,'.$id,
            'description' => 'max:500',
            //'stock' => 'required|numeric',
            'reference' => 'max:100',
        ],
        [],
        [
            'name' => 'nombre',
            'description' => 'descripción',
            'stock' => 'stock',
            'reference' => 'referencia',
        ]);
    }

    private function updateOthers($request, $part)
    {
        $part->others()->delete();
        if ($request->input('others')) {
            foreach ($request->input('others') as $pid) $part->others()->create(['product_id' => $pid]);
        }
    }
}
