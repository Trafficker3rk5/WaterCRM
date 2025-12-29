<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Address;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AddressController extends Controller
{

    public function validateForm(Request $request){
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'full_address' => ['required', 'string', 'max:255'],
        ],
        [],
        [
            'name' => 'nombre',
            'full_address' => 'dirección',
        ]);
        return redirect()->back()->with('message', 'Dirección guardada correctamente.');
    }

    public function store(Request $request){
        $client = Client::findOrFail($request->client_id);

        $address = $client->addresses()->create($request->only([
            'name',
            'full_address',
            'address',
            'city',
            'province',
            'postal_code',
            'country',
            'phone',
            'email',
            'is_main'
        ]));

        return $address;
    }
}
