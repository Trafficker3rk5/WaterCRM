<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Central\Product;
use App\Models\Tenant\Address;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\TenantProduct;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $isClient = $this->isClientPage();
        $st = request()->input('st');
        
        $filters = [];
        $filters[] = ['label' => 'Buscar', 'type' => 'text', 'name' => 'q'];
        $filters[] = ['label' => 'Actividad', 'options' => Catalog::select('name as label', 'id as value')->where('type', 5)->get(), 'type' => 'select', 'name' => 'aid'];
        $filters[] = ['label' => 'Origen', 'options' => Catalog::select('name as label', 'id as value')->where('type', 1)->get(), 'type' => 'select', 'name' => 'oid'];
        $filters[] = ['label' => 'Estado', 'options' => Catalog::select('name as label', 'id as value')->where('type', $isClient ? 2 : 3)->get(), 'type' => 'select', 'name' => 'st'];
        $filters[] = ['label' => 'Asignado A', 'options' => TenantUser::select('name as label', 'id as value')->get(), 'type' => 'select', 'name' => 'user'];
        $filters[] = ['label' => 'Provincia', 'options' => Address::select('province as label', 'province as value')->whereNotNull('province')->groupBy('province')->get() ,'type' => 'select', 'name' => 'pid'];
        $filters[] = ['label' => 'Ciudad', 'options' => Address::select('city as label', 'city as value')->whereNotNull('city')->groupBy('city')->get() ,'type' => 'select', 'name' => 'cid'];

        return Inertia::render('Tenant/Clients/ClientList', [
            'title' => $isClient ? 'Clientes' : 'Contactos', 
            'isClient' => $isClient,
            'filters' => $filters,
            'filtered' => [
                'st' => $st,
            ]
        ]);
    }

    public function list(Request $request)
    {
        $clients = Client::where('is_client', $this->isClientPage());
        if ($request->has('q') && $request->q !== null) $clients->where('company_name', 'like', '%'.$request->q.'%');
        if ($request->has('aid') && $request->aid !== null) $clients->where('activity_id', $request->aid);
        if ($request->has('oid') && $request->oid !== null) $clients->where('origin_id', $request->oid);
        if ($request->has('st') && $request->st !== null) $clients->where('status_id', $request->st);
        if ($request->has('user') && $request->user !== null) $clients->where('assigned_to', $request->user);
        if ($request->has('pid') && $request->pid !== null) $clients->whereHas('addresses', function($q) use ($request){
            $q->where('province', $request->pid);
        });
        if ($request->has('cid') && $request->cid !== null) $clients->whereHas('addresses', function($q) use ($request){
            $q->where('city', $request->cid);
        });
        
        $data = $clients->get()->map(function($cl){
            $addr = $cl->mainAddress();
            $cl->total_comments = $cl->comments->count();
            $cl->origin;
            $cl->activity;
            $cl->status;
            $cl->main_address = ($addr ? $addr->province . ', ' . $addr->city : '');
            $cl->address_complete = $addr;
            $cl->budgetsLigths = $cl->budgetsLigths();
            $cl->tasksLights = $cl->tasksLights();
            $cl->expired = $cl->isExpired();
            $cl->last_change = LerpH::showElapsedDays($cl->created_at);
            return $cl;
        });
        
        return $data;
    }

    public function create()
    {
        $isClient = $this->isClientPage();
        $famlies = AdminCatalog::where('type', 5)->get()->map(function($fm){
            $fm->products = Product::where('family_id', $fm->id)->get()->map(function($pr){
                $pr->getTenantProduct();
                $pr->label = $pr->final_name;
                $pr->value = $pr->id;
                return $pr;
            });
            $fm->label = $fm->name;
            $fm->value = $fm->id;
            return $fm;
        });

        return Inertia::render('Tenant/Clients/ClientForm', [
            'title' => 'Agregar '. ($isClient ? 'Cliente' : 'Contacto'),
            'isClient' => $isClient,
            'client' => new Client(),
            'statuses' => Catalog::select('name as label', 'id as value')->where('type', $isClient ? 2 : 3)->get(),
            'origins' => Catalog::select('name as label', 'id as value')->where('type', 1)->get(),
            'activities' => Catalog::select('name as label', 'id as value')->where('type', 5)->get(),
            'users' => TenantUser::select('name as label', 'id as value')->get(),
            'addresses' => [],
            'families' => $famlies
        ]);
    }

    public function edit($uid)
    {
        $client = Client::find($uid);
        $isClient = $this->isClientPage();

        $famlies = AdminCatalog::where('type', 5)->get()->map(function($fm){
            $fm->products = Product::where('family_id', $fm->id)->get()->map(function($pr){
                $pr->label = $pr->final_name;
                $pr->value = $pr->id;
                return $pr;
            });
            $fm->label = $fm->name;
            $fm->value = $fm->id;
            return $fm;
        });

        return Inertia::render('Tenant/Clients/ClientForm', [
            'title' => 'Editar '.($isClient ? 'Cliente' : 'Contacto'),
            'isClient' => $isClient,
            'client' => $client,
            'statuses' => Catalog::select('name as label', 'id as value')->where('type', $isClient ? 2 : 3)->get(),
            'origins' => Catalog::select('name as label', 'id as value')->where('type', 1)->get(),
            'activities' => Catalog::select('name as label', 'id as value')->where('type', 5)->get(),
            'users' => TenantUser::select('name as label', 'id as value')->get(),
            'addresses' => $client->addresses,
            'families' => $famlies
        ]);
    }

    public function show($uid)
    {
        $client = Client::find($uid);
        $isClient = $this->isClientPage();
        $client->comments->map(function($c){
            $c->user;
            $c->date = Lerph::showDateTime($c->created_at);
            return $c;
        });
        $client->budgets->map(function($b){
            $b->date = Lerph::showDateTime($b->created_at);
            $b->status;
            $b->status_name = $b->getStatus();
            $b->details;
            return $b;
        });
        $client->tasks->map(function($t){
            $t->date = Lerph::showDateTime($t->date);
            $t->date_end = Lerph::showDateTime($t->date_end);
            $t->user;
            return $t;
        });

        $client->origin;
        $client->status;
        $client->budgetsLigths = $client->budgetsLigths();
        $client->tasksLights = $client->tasksLights();
    
        ///Timeline
        $timeline = [];
        $client->histories->map(function($h) use (&$timeline){
            $h->user;
            $h->type;
            $timeline[] = [
                'title' => Lerph::showDateTime($h->created_at),
                'cardTitle' => $h->getType(),
                'cardDetailedText' => $h->getSubtitle(),
            ];
        });
        $client->timeline = $timeline;

        return Inertia::render('Tenant/Clients/ClientView', [
            'title' => 'Ver '.($isClient ? 'Cliente' : 'Contacto'),
            'isClient' => $isClient,
            'client' => $client,
            'addresses' => $client->addresses
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

        if (empty($request->id)) $client = new Client($request->except(['id']));
        else {
            $client = Client::find($request->id);
            if ($client) $client->fill($request->except(['id', 'logo']));
            else $client = new Client($request->except(['id']));
        }
        if (empty($client->company_name)) $client->company_name = '';
        $client->is_client = $this->isClientPage() ? 1 : 0;
        $client->save();

        ///Save Logo
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $name = $file->hashName();
            $file->storeAs(tenant('id'), $name, 'clients');
            $client->logo = $name;
            $client->save();
        }

        $this->upsertAddresses($request, $client);

        return redirect()->route($this->isClientPage() ? 'clients' : 'contacts')->with('message', 'Datos guardados correctamente.');
    }

    public function destroy($part)
    {
        $client = Client::findOrFail($part);
        $client->delete();
        return redirect()->back()->with('message', 'Cliente borrado correctamente.');
    }

    public function upsertAddresses($request, $client)
    {
        $savedAddresses = $client->addresses;
        $uploaded = $request->input('addresses', []);
        foreach ($uploaded as $addr){
            $saved = false;
            foreach ($savedAddresses as $sf){
                if ($sf->id == $addr['id']) {
                    $saved = true;
                    $sf->name = $addr['name'];
                    $sf->contact_name = $addr['contact_name'];
                    $sf->contact_phone = $addr['contact_phone'];
                    $sf->full_address = $addr['full_address'];
                    $sf->street = $addr['street'];
                    $sf->number = $addr['number'];
                    $sf->door = $addr['door'];
                    $sf->urb = $addr['urb'];
                    $sf->postal_code = $addr['postal_code'];
                    $sf->city = $addr['city'];
                    $sf->province = $addr['province'];
                    $sf->country = $addr['country'];
                    $sf->lat = $addr['lat'];
                    $sf->long = $addr['long'];
                    $sf->notes = $addr['notes'];
                    $sf->principal = $addr['principal'] ? 1 : 0;
                    $sf->billing = $addr['billing'] ? 1 : 0;
                    $sf->save();
                }
            }
            if (!$saved){
                $client->addresses()->create([
                    'name' => $addr['name'],
                    'contact_name' => $addr['contact_name'],
                    'contact_phone' => $addr['contact_phone'],
                    'full_address' => $addr['full_address'],
                    'street' => $addr['street'],
                    'number' => $addr['number'],
                    'door' => $addr['door'],
                    'urb' => $addr['urb'],
                    'postal_code' => $addr['postal_code'],
                    'city' => $addr['city'],
                    'province' => $addr['province'],
                    'country' => $addr['country'],
                    'lat' => $addr['lat'],
                    'long' => $addr['long'],
                    'notes' => $addr['notes'],
                    'principal' => $addr['principal'] ? 1 : 0,
                    'billing' => $addr['billing'] ? 1 : 0,
                ]);
            }
        }
        foreach ($savedAddresses as $sa){
            $deleted = true;
            foreach ($uploaded as $addr){if ($addr['id'] == $sa->id) $deleted = false;}
            if ($deleted) $sa->delete();
        }
    }

    private function validateForm(Request $request, $id){
        if (empty($request->input('phone')) && empty($request->input('email'))) throw ValidationException::withMessages(['phone' => 'Por favor ingrese el email o teléfono.']);

        return $request->validate([
            'company_name' => 'max:191',
            'status_id' => 'required',
            'external_id' => 'max:191|unique:clients,external_id,'.$id,
        ], 
        [],
        [
            'company_name' => 'Nombre de la empresa',
            'status_id' => 'Estado',
            'external_id' => 'Referencia',
        ]
        );
    }

    private function isClientPage()
    {
        return strstr(request()->route()->uri(), 'clients') !== false;
    }

    public function convertClient(Request $request, $cid)
    {
        $client = Client::findOrFail($cid);
        $client->is_client = 1;
        $client->save();
        return redirect()->back()->with('message', 'Cliente generado correctamente.');
    }

    public function getAddresses($cid)
    {
        $client = Client::findOrFail($cid);
        return $client->addresses;
    }

    public function opportunities()
    {
        $isClient = $this->isClientPage();
        $statuses = Catalog::where('type', $isClient ? 2 : 3)->where('extra_1', '!=', 1)->get();
        return Inertia::render('Tenant/Clients/Opportunities', [
            'title' =>  $isClient ? 'Clientes' : 'Contactos', 
            'isClient' => $isClient,
            'statuses' => $statuses
        ]);
    }

    public function updateStatus(Request $request, $cid)
    {
        $client = Client::findOrFail($cid);
        $client->status_id = $request->status;
        $client->save();
        return redirect()->back()->with('message', 'Datos guardados correctamente.');
    }
}
