<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Central\Brands;
use App\Models\Central\Product;
use App\Services\SavingCalculatorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SavingCalculatorController extends Controller
{
    public function __construct(private SavingCalculatorService $calculatorService)
    {
    }

    public function index(Request $request)
    {
        try {
            // Set max execution time for this request
            set_time_limit(120);
            
            $products = Product::whereIn('id', ALLOWED_PRODUCTS)
                ->where('active', 1)
                ->with('extras')
                ->get()
                ->map(fn ($product) => $this->calculatorService->prepareProduct($product))
                ->values();

            $brands = Brands::get();

            return Inertia::render('Tenant/CalcSaving', [
                'products' => $products,
                'brands' => $brands,
            ]);
        } catch (\Exception $e) {
            \Log::error('SavingCalculatorController@index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer'],
            'home' => ['required', 'in:home,company'],
            'case' => ['required', 'integer', 'between:0,7'],
            'due' => ['nullable', 'integer'],
            'bottles' => ['nullable', 'numeric'],
            'monthly_expense' => ['nullable', 'numeric'],
            'liters' => ['nullable', 'numeric'],
            'brand' => ['nullable', 'integer'],
            'people' => ['nullable', 'numeric'],
            'aquaservice_plan' => ['nullable', 'numeric'],
            'plan' => ['nullable', 'numeric'],
            'dispensers' => ['nullable', 'numeric'],
            'extras' => ['nullable'],
            'price_per_delivery' => ['nullable', 'numeric'],
        ]);

        $product = Product::whereIn('id', ALLOWED_PRODUCTS)
            ->where('active', 1)
            ->with('extras')
            ->findOrFail($validated['product_id']);

        $product = $this->calculatorService->prepareProduct($product);
        $brands = Brands::get();

        $result = $this->calculatorService->calculate($product, $brands, $validated);

        return response()->json([
            'result' => $result,
            'product' => $product,
        ]);
    }
}

