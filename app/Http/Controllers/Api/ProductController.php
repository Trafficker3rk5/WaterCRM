<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Central\Product;
use App\Models\Tenant\Address;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\ExtraVariable;
use App\Models\Tenant\TenantProduct;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductController extends ApiController
{
    /**
    * @OA\Get(
    *      path="/product",
    *      tags={"Productos"},
    *      description="Listado de productos",
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
        $page = request()->input('page', 1);
        $limit = request()->input('rows', 10);

        $fams = ExtraVariable::where('name', 'WAAS_API_ENABLED')->first()->value ?? '';
        $familyIds = array_filter(explode(',', $fams));


        $data = Product::whereIn('id', ALLOWED_PRODUCTS)
            ->when(!empty($fams), function($query) use ($fams) {
                $query->whereIn('family_id', array_filter(explode(',', $fams)));
            })->where('active', 1)->skip(($page - 1) * $limit)->take($limit)->get()->map(function($pr){
            $pr->getTenantProduct();
            // Get main image URL - ensure it's a full URL
            $mainImageUrl = $pr->getMainImage();
            $pr->main_image = $mainImageUrl;
            $pr->family_name = $pr->family->name ?? '';
            $pr->name = $pr->final_name;
            $pr->model = $pr->final_model;
            $pr->active = $pr->inner_active;
            $pr->stock = $pr->inner_stock;
            $pr->stock_min = $pr->inner_stock_min;
            $pr->stock_max = $pr->inner_stock_max;
            $pr->install_type = 0;
            $pr->pdf_download = route('prs.pdf', $pr->id);

            $pr->images = $pr->images->map(function($img) use ($pr){
                // Ensure product_id is set for URL generation
                // Set it as an attribute so getUrlAttribute() can access it
                $img->setAttribute('product_id', $pr->id);
                // Generate URL before unsetting product_id
                $img->url = $img->getUrlAttribute();
                // Now unset the attributes we don't want in the response
                unset($img->product_id, $img->created_at, $img->updated_at, $img->deleted_at, $img->id, $img->image_type, $img->type, $img->product);
                return $img;
            });

            $pr->attributes = $pr->attributesActive();

            $home = $business = [];
            if ($pr->prices){
                foreach ($pr->prices as $pd) {
                    $d = str_ireplace(['h-', 'b-'], '', $pd['id']);
                    $pp = ['id' => $pd['id'], 'price' => $pd['price'], 'duties' => $d];
                    if (strpos($pd['id'], 'h-') !== false) $home[] = $pp;
                    else $business[] = $pp;
                }
            }
            

            $pr->home_prices = $home;
            $pr->business_prices = $business;

            unset($pr->inner_name, $pr->inner_prices, $pr->parts, $pr->other_parts, $pr->dismantling, $pr->inner_stock, $pr->inner_stock_min, 
                $pr->inner_stock_max, $pr->inner_model, $pr->final_name, $pr->final_model);
            return $pr;
        });
        return $data;
        $activeData = $data->filter(function($item) {
            return $item->inner_active;
        });

        return parent::returnList($activeData, $page, $limit, Product::whereIn('id', ALLOWED_PRODUCTS)->when(!empty($fams), function($query) use ($fams) {
                $query->where('family_id', explode(',', $fams));
            })->where('active', 1)->count());
    }
}
