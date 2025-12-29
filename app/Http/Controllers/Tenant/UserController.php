<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Central\Product;
use App\Models\Central\SparePart;
use App\Models\Tenant\TenantUser;
use Exception;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Tenant/Users/UserList', ['title' => 'Usuarios']);
    }

    public function list(Request $request)
    {
        $data = TenantUser::get()->map(function($pr){
            $pr->full_name = $pr->full_name;
            $pr->rol = $pr->rolTenant();
            $pr->avatar = $pr->avatar_url;
            return $pr;
        });
        
        return $data;
    }

    public function create()
    {
        return Inertia::render('Tenant/Users/UserForm', [
            'title' => 'Agregar Usuario',
            'user' => new TenantUser(),
            'rols' => $this->getAllRols()
        ]);
    }

    public function edit($uid)
    {
        $user = TenantUser::find($uid);
        $user->avatar = $user->avatar_url;
        return Inertia::render('Tenant/Users/UserForm', [
            'title' => 'Editar Usuario',
            'user' => $user,
            'rols' => $this->getAllRols()
        ]);
    }

    public function store(Request $request)
    {
        $id = $request->id;
        if (empty($id)) $id = 0;
        return $this->upsertData($request, $id);
    }

    public function upsertData($request, $id, $profile = false){
        $this->validateForm($request, $id, $profile);

        if (empty($request->id)) $user = new TenantUser($request->except(['id']));
        else {
            $user = TenantUser::find($request->id);
            if ($user) $user->fill($request->except(['id', 'password']));
            else {
                $user = new TenantUser($request->except(['id',]));
                $user->password = Hash::make($user->password);
            }
        }
        $user->save();

        ///Save Logo
        if ($request->hasFile('picture')) {
            $file = $request->file('picture');
            $name = $file->hashName();
            $file->storeAs('', $name, 'users');
            $user->picture = $name;
            $user->save();
        }

        ////UPDATE PASSWORD
        $pass = $request->input('password');
        if (!empty($pass)){
            $user->password = Hash::make($pass);
            $user->save();
        }

        return redirect()->route(!$profile ? 'users' : 'users.profile')->with('message', 'Datos guardados correctamente.');
    }

    public function destroy($part)
    {
        $user = TenantUser::findOrFail($part);
        $user->delete();
        return redirect()->back()->with('message', 'Usuario borrado correctamente.');
    }

    private function validateForm(Request $request, $id, $profile){
        $uu = TenantUser::find($id);
        $rol = $request->input('rol_id');
        $maxs = json_decode(COMPANY->users, true);
        $actual = TenantUser::where('rol_id', $rol)->count() + 1; ///TODO revisar
        $m = isset($maxs[$rol - 1]) && !empty($maxs[$rol - 1]) ? $maxs[$rol - 1] : 0;
        if (($uu && $uu->rol_id != $rol || !$uu) && $m < $actual && !$profile) throw ValidationException::withMessages(['rol_id' => 'Ha alcanzado el máximo de usuarios para este rol.']);

        return $request->validate([
            'name' => 'required|max:100',
            'last_name' => 'required|max:100',
            'email' => 'required|email|max:100|unique:users,email,'.$id,
            'phone' => 'max:100',
            'full_address' => 'max:500',
            'rol_id' => !$profile ? 'required' : '',
        ],
        [],
        [
            'name' => 'Nombre',
            'last_name' => 'Apellidos',
            'email' => 'Correo',
            'phone' => 'Teléfono',
            'full_address' => 'Dirección',
            'rol_id' => 'Rol'
        ]);
    }

    private function getAllRols(){
        
        $rols = [];
        for($i = 1; $i <= 6; $i++) $rols[] = ['value' => $i, 'label' => Lerph::getTenantRolName($i)];
        return $rols;
    }

    public function profile()
    {
        $user = auth()->user();
        $user->avatar = $user->avatar_url;
        return Inertia::render('Tenant/Users/UserProfile', [
            'title' => 'Perfil de Usuario',
            'user' => $user,
            'rols' => $this->getAllRols()
        ]);
    }

    public function profileStore(Request $request)
    {
        $id = auth()->id();
        return $this->upsertData($request, $id, true);
    }
}
