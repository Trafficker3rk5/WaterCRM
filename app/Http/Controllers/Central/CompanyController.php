<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Central\Company;
use App\Models\Central\Product;
use App\Models\Central\SparePart;
use App\Models\Main\Tenant;
use App\Models\Tenant\TenantUser;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        return Inertia::render('Central/Companies/CompanyList', ['title' => 'Empresas']);
    }

    public function list(Request $request)
    {
        $data = Company::get()->map(function($pr){
            $pr->logo_url = $pr->logo_url;
            $pr->products = $pr->getProducts();
            return $pr;
        });
        
        return $data;
    }

    public function create()
    {
        $statuses = [];
        for ($i = 0; $i <= Company::MAX_STATUS; $i++) $statuses[] = ['value' => $i, 'label' => Company::decodeStatus($i)];
        return Inertia::render('Central/Companies/CompanyForm', [
            'title' => 'Agregar Empresa',
            'company' => new Company(),
            'products' => Product::select('name as label', 'id as value')->get(),
            'statuses' => $statuses,
        ]);
    }

    public function edit(Company $company)
    {
        $statuses = [];
        for ($i = 0; $i <= Company::MAX_STATUS; $i++) $statuses[] = ['value' => $i, 'label' => Company::decodeStatus($i)];
        $company->logo_url = $company->logo_url;
        return Inertia::render('Central/Companies/CompanyForm', [
            'title' => 'Editar Empresa',
            'company' => $company,
            'products' => Product::select('name as label', 'id as value')->get(),
            'statuses' => $statuses,
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

        if (empty($request->id)) $company = new Company($request->except(['id']));
        else {
            $company = Company::find($request->id);
            if ($company) $company->fill($request->only([
                'domain',
                'name',
                'business_name',
                'cif',
                'email',
                'address',
                'fiscal_address',
                'price',
                'status',
                'phone',
                'city',
                'province',
                'postal_code',
                'country'
            ]));
            else $company = new Company($request->except(['id']));
        }
        $company->users = json_encode($request->users);
        $company->products = implode(',', $request->input('products', []));
        $add = empty($company->id);
        $company->save();

        ///Create user and password
        $passwod = $request->input('password', 'password');
        $company = Company::find($company->id);
        $tenant = Tenant::find($company->tenant_id);
        if ($add){
            $tenant->run(function () use ($company, $passwod) {
                TenantUser::create([
                    'name' => 'Admin',
                    'email' => $company->email,
                    'password' => Hash::make($passwod),
                    'rol_id' => 0
                ]);
            });
        }else {
            $tenant->run(function () use ($company, $passwod) {
                $user = TenantUser::find(1);
                $user->email = $company->email;
                if (!empty($passwod)) $user->password = Hash::make($passwod);
                $user->save();
            });
        }

        ///Save Logo
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $name = $file->hashName();
            $file->storeAs('', $name, 'companies');
            $company->logo = $name;
            $company->save();
        }

        return redirect()->route('companies')->with('message', 'Datos guardados correctamente.');
    }

    public function destroy($cid)
    {
        $company = Company::findOrFail($cid);
        $company->delete();
        return redirect()->back()->with('message', 'Empresa borrada correctamente.');
    }

    private function validateForm(Request $request, $id){
        return $request->validate([
            'domain' => 'required|max:100|unique:companies,domain,'.$id.',id,deleted_at,NULL',
            'name' => 'required|max:255',
            'business_name' => 'required|max:255',
            'cif' => 'required|max:100',
            'email' => 'required|email|max:100|unique:companies,email,'.$id.',id,deleted_at,NULL',
            'address' => 'required|max:255',
            'fiscal_address' => 'max:255',
            'price' => 'required|numeric'
        ],
        [],
        [
            'domain' => 'Dominio',
            'name' => 'Nombre',
            'business_name' => 'Razón Social',
            'cif' => 'CIF',
            'email' => 'Email',
            'address' => 'Dirección',
            'fiscal_address' => 'Dirección Fiscal',
            'price' => 'Precio',
        ]);
    }

    public function changeStatus(Request $request, $cid)
    {
        $company = Company::findOrFail($cid);
        $company->status = !$company->status;
        $company->save();
        return redirect()->back()->with('message', 'Empresa '.($company->status ? 'Activada' : 'Desactivada').' correctamente.');
    }
}
