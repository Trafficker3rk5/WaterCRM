<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Central\Product;
use App\Models\Central\SparePart;
use App\Models\Tenant\Address;
use App\Models\Tenant\Client;
use App\Models\Tenant\Installation;
use App\Models\Tenant\Material;
use App\Models\Tenant\TenantProduct;
use App\Models\Tenant\TenantUser;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Storage;

class InstallationController extends Controller
{
    public function index()
    {
        $isInst = $this->isInstallationPage();
        return $this->showIndex(($isInst ? 'Instalaciones' : 'Mantenimientos'). ' pendientes', 0);
    }

    public function pending()
    {
        $isInst = $this->isInstallationPage();
        return $this->showIndex(($isInst ? 'Instalaciones' : 'Mantenimientos').' pendientes de Asignar', 1);
    }

    public function allData()
    {
        $isInst = $this->isInstallationPage();
        return $this->showIndex(($isInst ? 'Instalaciones' : 'Mantenimientos'), 2);
    }

    private function showIndex($title, $pending)
    {
        $isInst = $this->isInstallationPage();
        $st = request()->input('st');

        $tecnics = TenantUser::select('name as label', 'last_name', 'id as value')->whereIn('rol_id', [3, 5])->get()->map(function($t){
            $t->label = $t->label . ' ' . $t->last_name;
            return $t;
        });

        $clients = Client::get()->map(function($t){
            $t->label = $t->full_name;
            $t->value = $t->id;
            $t->addresses = $t->addresses->map(function($a){
                $a->label = $a->full_address;
                $a->value = $a->id;
                return $a;
            });
            return $t;
        });

        $filters = [];
        $filters[] = [
            'label' => 'Estado', 
            'options' => [
                ['value' => 0, 'label' => 'Pendiente', 'selected' => $st == 0], 
                ['value' => 1, 'label' => 'Finalizado', 'selected' => $st == 1], 
                ['value' => 2, 'label' => 'Rechazado', 'selected' => $st == 2]],
            'type' => 'select', 
            'name' => 'st'
        ];
        $filters[] = ['label' => 'Técnico', 'options' => $tecnics, 'type' => 'select', 'name' => 'tid'];
        $filters[] = ['label' => 'Cliente', 'options' => $clients, 'type' => 'select', 'name' => 'cid'];
        $filters[] = ['label' => 'Fecha Desde', 'type' => 'date', 'name' => 'from'];
        $filters[] = ['label' => 'Fecha Hasta', 'type' => 'date', 'name' => 'to'];
        $filters[] = ['label' => 'Provincia', 'options' => Address::select('province as label', 'province as value')->whereNotNull('province')->groupBy('province')->get() ,'type' => 'select', 'name' => 'pid'];
        $filters[] = ['label' => 'Ciudad', 'options' => Address::select('city as label', 'city as value')->whereNotNull('city')->groupBy('city')->get() ,'type' => 'select', 'name' => 'city'];

        $allowed = [];
        $products = Product::whereIn('id', ALLOWED_PRODUCTS)->where('active', 1)->get();
        foreach ($products as $p) {
            $p->getTenantProduct();
            if ($p->inner_active == 0) continue;
            $allowed[] = [
                'label' => $p->final_name,
                'value' => $p->id,
                'prices' => $p->inner_prices,
            ];
        }
        
        return Inertia::render('Tenant/Installations/InstallationList', [
            'title' => $title,
            'pending' => $pending,
            'tecnics' => $tecnics,
            'clients' => $clients,
            'isInstallation' => $isInst,
            'products' => $allowed,
            'filters' => $filters,
            'filtered' => [
                'st' => $st,
            ]
        ]);
    }

    public function list(Request $request)
    {
        $isInst = $this->isInstallationPage();
        $pending = $request->input('pending', 0);
        $query = Installation::where('is_maintenance', !$isInst);
        if ($pending == 1) $query->whereNull('assigned_to');
        else if ($pending == 0) $query->whereNotNull('assigned_to')->whereIn('status', [0,3]);

        if ($request->has('st') && $request->st !== null) $query->where('status', $request->st);
        if ($request->has('tid') && $request->tid !== null) $query->where('assigned_to', $request->tid);
        if ($request->has('cid') && $request->cid !== null) $query->where('client_id', $request->cid);
        if ($request->has('from') && $request->from !== null) $query->where('installation_date', '>=', $request->from);
        if ($request->has('to') && $request->to !== null) $query->where('installation_date', '<=', $request->to);
        if ($request->has('pid') && $request->pid !== null) $query->whereHas('address', function($q) use ($request){
            $q->where('province', $request->pid);
        });
        if ($request->has('city') && $request->city !== null) $query->whereHas('address', function($q) use ($request){
            $q->where('city', $request->city);
        });

        $data = $query->get()->map(function($inst){
            $inst->client_data = $inst->client;
            $inst->address;
            $inst->product;
            $inst->enabled = $inst->isEnabled();
            $inst->installation_date = Lerph::showDateTime($inst->installation_date);
            
            return $inst;
        });
        
        return $data;
    }

    public function edit($id)
    {
        
        $installation = Installation::find($id);
        $installation->client;
        $installation->address;
        $installation->product;
        // Ensure product object is present and enriched to avoid null errors in the frontend
        if ($installation->product) {
            // Enrich central product with tenant fields (final_name, final_model, etc.)
            $installation->product->getTenantProduct();
        } else {
            // Provide minimal fallback structure expected by the frontend
            $installation->product = (object) [
                'final_name' => '',
                'final_model' => ''
            ];
        }
        $installation->assigned;
        $installation->installation_date = Lerph::showDateTime($installation->installation_date);
        $installation->next_maintenance = $installation->budgetDetail && $installation->budgetDetail->maintenance ? $installation->budgetDetail->maintenance : 12;

        //if (!$installation->isEnabled()) return redirect()->route('installations')->with('error', 'No puedes editar esta instalación.');

        return Inertia::render('Tenant/Installations/InstallationForm', [
            'title' => 'Realizar Instalación',
            'installation' => $installation,
            'allMaterials' => Material::select('name as label', 'id as value')->where('active', 1)->get(),
            'materials' => $installation->materials,
            'files0' => $installation->getFilesData(0),
            'files1' => $installation->getFilesData(1),
            'files2' => $installation->getFilesData(2),
            'files3' => $installation->getFilesData(3),
            'readOnly' => false,
            'allParts' => SparePart::select('name as label', 'id as value')->get(),
            'parts' => $installation->parts,
        ]);
    }

    public function show($id)
    {
        $installation = Installation::find($id);
        $installation->client;
        $installation->address;
        $installation->product;
        // Ensure product object is present and enriched to avoid null errors in the frontend
        if ($installation->product) {
            // Enrich central product with tenant fields (final_name, final_model, etc.)
            $installation->product->getTenantProduct();
        } else {
            // Provide minimal fallback structure expected by the frontend
            $installation->product = (object) [
                'final_name' => '',
                'final_model' => ''
            ];
        }
        $installation->assigned;
        $installation->installation_date = Lerph::showDateTime($installation->installation_date);
        return Inertia::render('Tenant/Installations/InstallationForm', [
            'title' => 'Ver Instalación',
            'installation' => $installation,
            'allMaterials' => Material::select('name as label', 'id as value')->where('active', 1)->get(),
            'materials' => $installation->materials,
            'files0' => $installation->getFilesData(0),
            'files1' => $installation->getFilesData(1),
            'files2' => $installation->getFilesData(2),
            'files3' => $installation->getFilesData(3),
            'readOnly' => true,
            'parts' => SparePart::select('name as label', 'id as value')->get(),
        ]);
    }

    public function create(Request $request)
    {
        $this->validateFormCreate($request);
        $installation = new Installation($request->only([
            'client_id',
            'address_id',
            'product_id',
            'installation_date',
            'hours',
            'assigned_to',
            'is_maintenance',
            'budget_detail_id'
        ]));
        $installation->save();
        return redirect()->route('installations')->with('message', 'Instalación creada correctamente.');
    }

    public function assign(Request $request)
    {
        $this->validate($request, [
            'id' => 'required',
            'assigned_to' => 'required',
            'installation_date' => 'required|date_format:Y-m-d\TH:i|after_or_equal:now',
            'hours' => 'required',
        ]);

        $installation = Installation::find($request->id);
        $installation->assigned_to = $request->assigned_to;
        $installation->installation_date = $request->installation_date;
        $installation->hours = $request->hours;
        $installation->save();
        return redirect()->back()->with('message', 'Instalación asignada correctamente.');
    }

    public function store(Request $request)
    {
        $id = $request->id;
        $installation = Installation::find($id);
        if (empty($id) || !$installation) return redirect()->route('installations')->with('message', 'Error');
        return $this->upsertData($request, $installation);
    }

    public function upsertData($request, $installation){
        $this->validateForm($request, $installation->id);
        $installation->fill($request->only([
            'client_name',
            'client_dni',
            'serial_number',
            'observations',
            'finished',
            'next_maintenance',
            'signature'
        ]));
        if (!$installation->finished) $installation->status = 1;
        $installation->save();

        $this->upsertMaterials($request, $installation);
        $this->upsertParts($request, $installation);

        $this->upsertFiles($request, $installation, $installation->files0, 'files0', 0);
        $this->upsertFiles($request, $installation, $installation->files1, 'files1', 1);
        $this->upsertFiles($request, $installation, $installation->files2, 'files2', 2);
        $this->upsertFiles($request, $installation, $installation->files3, 'files3', 3);

        ////Creo el mantenimiento
        if ($installation->status == 1){
            if (empty($installation->next_maintenance)) $installation->next_maintenance = 12;
            $maintence = new Installation([
                'client_id' => $installation->client_id,
                'address_id' => $installation->address_id,
                'product_id' => $installation->product_id,
                'installation_date' => Carbon::parse($installation->installation_date)->addMonths($installation->next_maintenance)->format('Y-m-d H:i'),
                'hours' => 1,
                'assigned_to' => $installation->assigned_to,
                'is_maintenance' => 1,
                'status' => 0,
                'serial_number' => $installation->serial_number,
                'next_maintenance' => $installation->next_maintenance,
                'budget_detail_id' => $installation->budget_detail_id,
            ]);
            $maintence->save();

            ///Saco el stock
            $pr = $installation->product;
            if ($pr){
                $pr->inner_stock -= 1;
                $pr->save();
            }
        }

        return redirect()->route('installations')->with('message', 'Datos guardados correctamente.');        
    }

    public function destroy(Installation $installation)
    {
        $installation->delete();
        return redirect()->back()->with('message', 'Instalación borrada correctamente.');
    }

    private function validateForm(Request $request, $id){
        if ($request->input('finished') != 1){
            $files = ['files0', 'files1', 'files2', 'files3'];
            foreach ($files as $f){
                if (!$request->has($f) || count($request->input($f)) == 0){
                    throw ValidationException::withMessages(['images' => 'Por favor suba todos los archivos para poder cerrar la instalación.']);
                }
            }

            return $request->validate([
                'client_name' => 'required|string:max:100',
                'client_dni' => 'required|string:max:100',
                'serial_number' => 'required|string:max:100',
                'next_maintenance' => 'required',
            ],
            [],
            [
                'client_name' => 'Nombre del Cliente',
                'client_dni' => 'DNI del Cliente',
                'serial_number' => 'Número de Serie',
                'next_maintenance' => 'Próximo Mantenimiento',
            ]);
        }
    }

    private function validateFormCreate(Request $request){
        return $request->validate([
            'client_id' => 'required',
            'product_id' => 'required',
            'address_id' => 'required',
            'installation_date' => 'required|date_format:Y-m-d\TH:i|after_or_equal:now',
            'hours' => 'required',
            'assigned_to' => 'required',
        ],
        [],
        [
            'client_id' => 'Cliente',
            'product_id' => 'Producto',
            'address_id' => 'Dirección',
            'installation_date' => 'Fecha de Instalación',
            'hours' => 'Horas',
            'assigned_to' => 'Técnico',
        ]);
    }

    private function upsertMaterials($request, $installation)
    {
        $savedObjects = $installation->materials;
        $uploaded = $request->input('materials', []);
        foreach ($uploaded as $mat){
            $saved = false;
            foreach ($savedObjects as $so){
                if ($so->id == $mat['id']) {
                    $saved = true;
                    $so->save();
                }
            }
            if (!$saved){
                $installation->materials()->create($mat);
            }
        }
        foreach ($savedObjects as $so){
            $deleted = true;
            foreach ($uploaded as $mat){if ($mat['id'] == $so->id) $deleted = false;}
            if ($deleted) $so->delete();
        }
    }

    private function upsertParts($request, $installation)
    {
        $savedObjects = $installation->parts;
        $uploaded = $request->input('parts', []);
        foreach ($uploaded as $mat){
            $saved = false;
            foreach ($savedObjects as $so){
                if ($so->id == $mat['id']) {
                    $saved = true;
                    $so->save();
                }
            }
            if (!$saved){
                $installation->parts()->create($mat);
            }
        }
        foreach ($savedObjects as $so){
            $deleted = true;
            foreach ($uploaded as $mat){if ($mat['id'] == $so->id) $deleted = false;}
            if ($deleted) $so->delete();
        }
    }

    private function upsertFiles($request, $installation, $savedFiles, $key, $type)
    {
        $uploaded = $request->input($key, []);
        foreach ($uploaded as $n => $file){
            $saved = false;
            foreach ($savedFiles as $sf){
                if ($sf->id == $file['id']) {
                    $saved = true;
                    $sf->title = $file['title'];
                    $sf->save();
                }
            }
            if (!$saved){
                $installation->files()->create([
                    'type' => $type,
                    'file' => $file['file'],
                    'title' => $file['title'],
                    'size' => $file['size']
                ]);

                Storage::disk('installations')->put(tenant('id').'/'.$installation->id . '/' . $file['file'], Storage::disk('tmp')->get($file['file']));
                Storage::disk('tmp')->delete($file['file']);
            }
        }
        foreach ($savedFiles as $sf){
            $deleted = true;
            foreach ($uploaded as $file){if ($file['id'] == $sf->id) $deleted = false;}
            if ($deleted){
                $sf->delete();

                Storage::disk('installations')->delete(tenant('id').'/'.$installation->id . '/' . $sf->file);
            }
        }
    }

    private function isInstallationPage()
    {
        return strstr(request()->route()->uri(), 'installations') !== false;
    }
}
