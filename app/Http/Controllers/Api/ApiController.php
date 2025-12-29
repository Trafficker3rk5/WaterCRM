<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class ApiController extends Controller
{

    /**
    * @OA\Info(
    *     title="Documentación API WaaS",
    *     description="Documentación de la API de WaaS. Es necesario contar con un token de autenticación para poder acceder a los recursos de la API. 
    *       Para ello se debe enviar el token en el header de la petición con el nombre 'Authorization Bearer'.<br>Para obtener la clave de autenticación,
    *       ingresar al penel, sección de Configuración -> Sistema y luego en API.",
    *     version="1.0"
    * )
    *
    * @OA\PathItem(path="/api")
    * @OA\OpenApi(
    *   security={{"bearerAuth": {}}}
    * )
    *
    * @OA\SecurityScheme(
    *   securityScheme="bearerAuth",
    *   type="http",
    *   scheme="bearer"
    * )
    *
    * @OA\Schema(
    *   schema="TenantProduct",
    *   title="Schema de Productos",
    *   @OA\Property(
    *       property="id",
    *       type="integer"
    *   ),
    *   @OA\Property(
    *       property="name",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="model",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="active",
    *       type="boolean"
    *   ),
    *   @OA\Property(
    *       property="stock",
    *       type="integer"
    *   ),
    *   @OA\Property(
    *       property="stock_min",
    *       type="integer"
    *   ),
    *   @OA\Property(
    *       property="stock_max",
    *       type="integer"
    *   ),
    *   @OA\Property(
    *       property="images",
    *       type="array",
    *       @OA\Items(
    *           @OA\Property(
    *               property="url",
    *               type="string"
    *           )
    *       )
    *   ),
    *   @OA\Property(
    *       property="attributes",
    *       type="array",
    *       @OA\Items(
    *           @OA\Property(
    *               property="id",
    *               type="integer"
    *           ),
    *           @OA\Property(
    *               property="name",
    *               type="string"
    *           ),
    *           @OA\Property(
    *               property="value",
    *               type="string"
    *           )
    *       )
    *   ),
    *   @OA\Property(
    *       property="home_prices",
    *       type="array",
    *       @OA\Items(
    *           @OA\Property(
    *               property="id",
    *               type="string"
    *           ),
    *           @OA\Property(
    *               property="price",
    *               type="number"
    *           ),
    *           @OA\Property(
    *               property="duties",
    *               type="string"
    *           )
    *       )
    *   ),
    *   @OA\Property(
    *       property="business_prices",
    *       type="array",
    *       @OA\Items(
    *           @OA\Property(
    *               property="id",
    *               type="string"
    *           ),
    *           @OA\Property(
    *               property="price",
    *               type="number"
    *           ),
    *           @OA\Property(
    *               property="duties",
    *               type="string"
    *           )
    *       )
    *   )
    * )
    * @OA\Schema(
    *   schema="TenantClient",
    *   title="Schema de Clientes",
    *   @OA\Property(
    *       property="id",
    *       type="integer"
    *   ),
    *   @OA\Property(
    *       property="name",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="external_id",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="company_name",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="logo",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="contact_name",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="contact_lastname",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="email",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="phone",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="notes",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="origin",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="status",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="responsible",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="activity",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="business_name",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="main_address",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="address_complete",
    *       type="object"
    *   ),
    *   @OA\Property(
    *       property="expired",
    *       type="boolean"
    *   ),
    *   @OA\Property(
    *       property="last_change",
    *       type="string"
    *   )
    * )
    * @OA\Schema(
    *   schema="Addclient",
    *   title="Schema de Alta de Clientes",
    *   @OA\Property(
    *       property="external_id",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="company_name",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="contact_name",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="contact_lastname",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="email",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="phone",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="notes",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="responsible",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="data", 
    *       type="array", 
    *       @OA\Items(ref="#/components/schemas/Address")
    *   ),
    *)
    * @OA\Schema(
    *   schema="AddProposal",
    *   title="Schema de Alta de Propuestas",
    *   @OA\Property(
    *       property="products", 
    *       type="array", 
    *       @OA\Items()
    *   ),
    *   @OA\Property(
    *       property="quantities", 
    *       type="array", 
    *       @OA\Items()
    *   ),
    *   @OA\Property(
    *       property="details", 
    *       type="array", 
    *       @OA\Items(
    *           @OA\Property(property="discount", type="string"),
    *           @OA\Property(property="dues", type="string"),
    *           @OA\Property(property="extra_id", type="string"),
    *           @OA\Property(property="id", type="string"),
    *           @OA\Property(property="init_amount", type="string"),
    *           @OA\Property(property="installation", type="string"),
    *           @OA\Property(property="installation_cost", type="string"),
    *           @OA\Property(property="iva", type="string"),
    *           @OA\Property(property="last_amount", type="string"),
    *           @OA\Property(property="maintenance", type="string"),
    *           @OA\Property(property="notes", type="string"),
    *           @OA\Property(property="price", type="string"),
    *           @OA\Property(property="type", type="string")
    *       )
    *   ),
    *   @OA\Property(
    *       property="client_id",
    *       type="string"
    *   ),
    *)
    * @OA\Schema(
    *   schema="TenantProposal",
    *   title="Schema de Propuesta",
    *   @OA\Property(property="id", type="integer"),
    *   @OA\Property(property="client_id", type="string"),
    *   @OA\Property(property="created_by", type="string"),
    *   @OA\Property(property="products", type="string"),
    *   @OA\Property(property="quantities", type="string"),
    *   @OA\Property(property="status", type="string"),
    *   @OA\Property(property="rejection_reason", type="string"),
    *   @OA\Property(property="is_horeca", type="string"),
    *)
    * @OA\Schema(
    *   schema="Address",
    *   title="Schema de Direcciones",
    *   @OA\Property(
    *       property="id",
    *       type="integer"
    *   ),
    *   @OA\Property(
    *       property="name",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="contact_name",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="contact_phone",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="full_address",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="street",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="number",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="door",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="urb",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="postal_code",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="city",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="province",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="country",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="lat",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="long",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="notes",
    *       type="string"
    *   ),
    *   @OA\Property(
    *       property="principal",
    *       type="boolean"
    *   ),
    *   @OA\Property(
    *       property="billing",
    *       type="boolean"
    *   )
    *)
    */

    public function returnList($data, $page, $limit, $total)
    {
        return response()->json([
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'rows' => $limit
        ]);
    }

    public function returnObject($object)
    {
        return response()->json([$object]);
    }

    public function returnNotFound($message)
    {
        return response()->json(['message' => $message, 'error' => true], 400);
    }

    public function returnError($errors)
    {
        return response()->json(['errors' => $errors, 'error' => true]);
    }

    public function returnSuccess($object = null, $message = 'Success')
    {
        $d = ['message' => $message, 'error' => false];
        if ($object) $d['data'] = $object;
        return response()->json($d);
    }
}
