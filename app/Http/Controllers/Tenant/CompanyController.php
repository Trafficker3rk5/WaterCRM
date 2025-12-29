<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Central\Company;
use App\Models\Central\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        $company = Company::where('tenant_id', tenant('id'))->first();
        if (!$company) abort(404);
        $company->logo_url = $company->logo_url;
        return Inertia::render('Tenant/Companies/CompanyForm', [
            'title' => 'Editar datos de la Empresa',
            'company' => $company
        ]);
    }

    public function store(Request $request)
    {
        $company = Company::where('tenant_id', tenant('id'))->first();
        return $this->upsertData($request, $company->id);
    }

    public function upsertData($request, $id){
        $this->validateForm($request, $id);

        $company = Company::find($id);
        $company->fill($request->except(['users', 'domain']));
        $company->save();

        ///Save Logo
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $name = $file->hashName();
            $file->storeAs('', $name, 'companies');
            $company->logo = $name;
            $company->save();
        }

        return redirect()->route('company')->with('message', 'Datos guardados correctamente.');
    }

    private function validateForm(Request $request, $id){
        return $request->validate([
            'name' => 'required|max:255',
            'business_name' => 'required|max:255',
            'cif' => 'required|max:100',
            'email' => 'required|email|max:100|unique:companies,email,'.$id,
            'address' => 'required|max:255',
            'fiscal_address' => 'max:255'
        ],
        [],
        [
            'name' => 'nombre',
            'business_name' => 'razón social',
            'cif' => 'CIF',
            'email' => 'correo electrónico',
            'address' => 'dirección',
            'fiscal_address' => 'dirección fiscal'
        ]);
    }
}
