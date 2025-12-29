<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Tenant\Address;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\TenantProduct;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Validator;

class ClientController extends ApiController
{
    
    /**
    *@OA\Get(
    *    path="/client",
    *    tags={"Clientes"},
    *    description="Listado de clientes / contactos",
    *    @OA\Response(
    *        response=200, 
    *        description="Successful operation",
    *        @OA\JsonContent(
    *            @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/TenantClient")),
    *            @OA\Property(property="total", type="integer"),
    *            @OA\Property(property="page", type="integer"),
    *            @OA\Property(property="rows", type="integer")
    *        )
    *    ),
    *    @OA\Response(response=400, description="Not found"),
    *    @OA\Response(response=401, description="Unauthorized"),
    *)
    * @OA\PathItem(path="/contact/", ref="#/paths/~1client", summary ="Contactos");
    * @OA\PathItem(path="/contact/{id}", ref="#/paths/~1client~1{id}", summary ="Contactos");
    */
    public function index()
    {
        $isClient = $this->isClientPage();
        $page = request()->input('page', 1);
        $limit = request()->input('rows', 10);

        $data = Client::where('is_client', $isClient)->skip(($page - 1) * $limit)->take($limit)->get()->map(function($cl){
            $addr = $cl->mainAddress();
            $cl->origin;
            $cl->activity;
            $cl->status;
            $cl->main_address = ($addr ? $addr->province . ', ' . $addr->city : '');
            $cl->address_complete = $addr;
            $cl->expired = $cl->isExpired();
            $cl->last_change = LerpH::showElapsedDays($cl->created_at);
            return $cl;
        });

        return $this->returnList($data, $page, $limit, Client::where('is_client', $isClient)->count());
    }

    /**
    *@OA\Get(
    *    path="/client/{id}",
    *    tags={"Clientes"},
    *    description="Obtener cliente / contacto por id",
    *    @OA\Parameter(
    *        name="id",
    *        in="path",
    *        required=true,
    *        @OA\Schema(type="integer")
    *    ),
    *    @OA\Response(
    *        response=200, 
    *        description="Successful operation",
    *        @OA\JsonContent(ref="#/components/schemas/TenantClient")
    *    ),
    *    @OA\Response(response=400, description="Not found"),
    *    @OA\Response(response=401, description="Unauthorized")
    *)
    */
    public function show($uid)
    {
        $client = Client::find($uid);
        if (!$client) {
            return $this->returnNotFound('Cliente no encontrado');
        }

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

        return $this->returnObject($client);
    }

    /**
    * @OA\Post(
    *    path="/client",
    *    tags={"Clientes"},
    *    description="Crear cliente / contacto",
    *    @OA\RequestBody(
    *        required=true,
    *        @OA\JsonContent(ref="#/components/schemas/Addclient")
    *    ),
    *    @OA\Response(
    *      response=200,
    *      description="Successful operation",
    *        @OA\JsonContent(
    *            @OA\Property(property="data", type="object", ref="#/components/schemas/TenantClient"),
    *            @OA\Property(property="message", type="string"),
    *            @OA\Property(property="error", type="boolean")
    *        )
    *  ),
    * @OA\Response(response=400, description="Not found"),
    * @OA\Response(response=401, description="Unauthorized")
    * )
    */
    public function store(Request $request)
    {
        return $this->upsertData($request, 0);
    }

    /**
    * @OA\Put(
    *   path="/client/{id}",
    *   tags={"Clientes"},
    *   description="Actualizar cliente / contacto",
    *   @OA\Parameter(
    *       name="id",
    *       in="path",
    *       required=true,
    *       @OA\Schema(type="integer")
    *   ),
    *   @OA\RequestBody(
    *       required=true,
    *       @OA\JsonContent(ref="#/components/schemas/Addclient")
    *   ),
    *   @OA\Response(
    *      response=200,
    *      description="Successful operation",
    *        @OA\JsonContent(
    *            @OA\Property(property="data", type="object", ref="#/components/schemas/TenantClient"),
    *            @OA\Property(property="message", type="string"),
    *            @OA\Property(property="error", type="boolean")
    *        )
    *  ),
    * @OA\Response(response=400, description="Not found"),
    * @OA\Response(response=401, description="Unauthorized")
    * )
    */

    public function update(Request $request, $id)
    {
        $client = Client::find($request->id);
        if (!$client) return $this->returnNotFound('Cliente no encontrado');
        return $this->upsertData($request, $id);
    }

    public function upsertData($request, $id){
        $v = $this->validateForm($request, $id);
        if (!empty($v)) return $v;

        if (empty($request->id)) $client = new Client($request->except(['id']));
        else {
            $client = Client::find($request->id);
            $client->fill($request->except(['id']));
        }
        $client->is_client = $this->isClientPage() ? 1 : 0;
        $client->save();

        (new \App\Http\Controllers\Tenant\ClientController())->upsertAddresses($request, $client);

        return $this->returnSuccess($client);
    }

    private function validateForm(Request $request, $id){
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|max:191',
            'status_id' => 'required',
            'external_id' => 'max:191|unique:clients,external_id,'.$id,
            'phone' => 'required|max:191',
            'email' => 'required|max:191',
        ], 
        [],
        [
            'company_name' => 'Nombre de la empresa',
            'status_id' => 'Estado',
            'external_id' => 'Referencia',
            'phone' => 'Teléfono',
            'email' => 'Email',
        ]);

        if ($validator->fails()) {    
            return $this->returnError($validator->errors());
        }
    }

    private function isClientPage()
    {
        return strstr(request()->route()->uri(), 'client') !== false;
    }
}
