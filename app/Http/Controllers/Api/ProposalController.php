<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Central\Product;
use App\Models\Tenant\Address;
use App\Models\Tenant\Budget;
use App\Models\Tenant\BudgetDetail;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Validator;

class ProposalController extends Controller
{
    /**
    * @OA\Post(
    *    path="/proposal/create",
    *    tags={"Propuestas"},
    *    description="Crear propuesta",
    *    @OA\RequestBody(
    *        required=true,
    *        @OA\JsonContent(ref="#/components/schemas/AddProposal")
    *    ),
    *    @OA\Response(
    *      response=200,
    *      description="Successful operation",
    *        @OA\JsonContent(
    *            @OA\Property(property="data", type="object", ref="#/components/schemas/TenantProposal"),
    *            @OA\Property(property="message", type="string"),
    *            @OA\Property(property="error", type="boolean")
    *        )
    *  ),
    * @OA\Response(response=400, description="Not found"),
    * @OA\Response(response=401, description="Unauthorized")
    * )
    */
    public function create(Request $request)
    {
        $v = $this->validateForm($request);
        if (!empty($v)) return $v;
        
        $budget = new Budget($request->except(['id']));
        $budget->products = implode(',', $request->input('products', []));
        $budget->quantities = implode(',', $request->input('quantities', []));
        $budget->save();

        (new \App\Http\Controllers\Tenant\BudgetController())->upsertDetails($request, $budget);

        return $this->returnSuccess($budget);
    }

    /**
     * @OA\Post(
     *    path="/proposal/accept/{pid}/{did}",
     *    tags={"Propuestas"},
     *    description="Aceptar propuesta",
     *    @OA\Parameter(
     *        name="pid",
     *        in="path",
     *        required=true,
     *        description="Id de la propuesta",
     *        @OA\Schema(type="integer")
     *    ),
     *    @OA\Parameter(
     *        name="did",
     *        in="path",
     *        required=true,
     *        description="Id del detalle de la propuesta",
     *        @OA\Schema(type="integer")
     *    ),
     *    @OA\Response(
     *        response=200,
     *        description="Successful operation",
     *        @OA\JsonContent(
     *            @OA\Property(property="message", type="string"),
     *            @OA\Property(property="error", type="boolean")
     *        )
     *    ),
     * @OA\Response(response=400, description="Not found"),
     * @OA\Response(response=401, description="Unauthorized")
     * )
     */ 
    public function accept(Request $request, $pid, $did)
    {
        $v = $this->validateAcceptForm($request);
        if (!empty($v)) return $v;

        $budget = Budget::find($pid);
        if (!$budget) return $this->returnNotFound('Propuesta no encontrado');

        $detail = BudgetDetail::find($did);
        if ($detail && $detail->budget_id == $pid && $detail->status == 0){
            $detail->status = 1;
            $detail->save();
        }else return $this->returnNotFound('Detalle no encontrado');

        if ($budget->status == 0){
            $budget->status = 1;
            $budget->save();

            ///Generate Installations
            $quantities = explode(',', $budget->quantities);
            foreach (explode(',', $budget->products) as $key => $product) {
                $pr = Product::find($product);
                if (!$pr) continue;
                for ($i = 0; $i < $quantities[$key]; $i++){
                    $addr = $request->input('address-'.$product.'-'.$i, 0);
                    $notes = $request->input('notes-'.$product.'-'.$i, '');

                    $detail->installations()->create([
                        'address_id' => $addr,
                        'status' => 0,
                        'notes' => $notes,
                        'product_id' => $product,
                        'client_id' => $budget->client_id,
                    ]);
                }
            }

            return $this->returnSuccess(null, 'Propuesta aceptado');

        }else return $this->returnError('El Propuesta ya ha sido aceptado');
    }

    private function validateForm(Request $request){
        if (count($request->input('details', [])) == 0) return $this->returnError('Debe agregar al menos un detalle');

        $validator = Validator::make($request->all(), [
            'products' => 'required',
            'client_id' => 'required',
            'quantities' => 'required',
        ],
        [],
        [
            'products' => 'Productos',
            'client_id' => 'Cliente',
            'quantities' => 'Cantidades',
        ]);

        if ($validator->fails()) {    
            return $this->returnError($validator->errors());
        }
    }

    private function validateAcceptForm(Request $request){
        $validator = Validator::make($request->all(), [
            'detail_id' => ['required']
        ],
        [],
        [
            'detail_id' => 'Detalle'
        ]);

        if ($validator->fails()) {    
            return $this->returnError($validator->errors());
        }
    }
}
