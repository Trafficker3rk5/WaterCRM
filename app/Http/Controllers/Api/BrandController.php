<?php

namespace App\Http\Controllers\Api;

use App\Models\Central\Brands;

class BrandController extends ApiController
{
    /**
     * @OA\Get(
     *      path="/brands",
     *      tags={"Marcas"},
     *      description="Listado de marcas",
     *      @OA\Response(
     *           response=200, 
     *           description="Successful operation",
     *           @OA\JsonContent(
     *               @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/TenantProduct")),
     *               @OA\Property(property="total", type="integer"),
     *               @OA\Property(property="page", type="integer"),
     *               @OA\Property(property="rows", type="integer")
     *           )
     *      ),
     *      @OA\Response(response=400, description="Not found"),
     *      @OA\Response(response=401, description="Unauthorized"),
     * )
    
     */

    public function list()
    {
        $data = Brands::get();
        return parent::returnList($data, 200, 'Marcas', 'Listado de marcas');
    }
}
