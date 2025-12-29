<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Central\Brands;
use App\Models\Central\Product;
use App\Services\SavingCalculatorService;
use Illuminate\Http\Request;

class SavingCalculatorController extends Controller
{
    public function __construct(private SavingCalculatorService $calculatorService)
    {
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
        ]);

        $product = Product::where('active', 1)->findOrFail($validated['product_id']);
        $product = $this->calculatorService->prepareProduct($product);
        $brands = Brands::get();

        $result = $this->calculatorService->calculate($product, $brands, $validated);

        return response()->json([
            'result' => $result,
            'product' => $product,
        ]);
    }
}

