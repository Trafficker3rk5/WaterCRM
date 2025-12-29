<?php

namespace App\Services;

use App\Models\Central\Brands;
use App\Models\Central\Product;
use Illuminate\Support\Collection;

class SavingCalculatorService
{
    /**
     * Prepare product entity with pricing information used by the calculator.
     */
    public function prepareProduct(Product $product): Product
    {
        $product->getTenantProduct();
        $product->main_image = $product->getMainImage();

        $home = [];
        $business = [];

        if ($product->prices) {
            foreach ($product->prices as $entry) {
                $duties = (int) str_ireplace(['h-', 'b-'], '', $entry['id']);
                $priceData = [
                    'id' => $entry['id'],
                    'price' => $entry['price'],
                    'duties' => $duties,
                ];

                if (strpos($entry['id'], 'h-') !== false) {
                    $home[] = $priceData;
                } else {
                    $business[] = $priceData;
                }
            }
        }

        $product->home_prices = $home;
        $product->business_prices = $business;

        // Prepare extras with name, description, and price
        $extras = [];
        if ($product->has_extras && $product->extras) {
            foreach ($product->extras as $extra) {
                $extra->getTenantProduct();
                
                // Get the first available price (prefer home price, fallback to business price)
                $extraPrice = 0;
                if ($extra->prices && is_array($extra->prices) && !empty($extra->prices)) {
                    // Try to find home price first
                    foreach ($extra->prices as $priceEntry) {
                        if (strpos($priceEntry['id'] ?? '', 'h-') !== false) {
                            $extraPrice = (float) ($priceEntry['price'] ?? 0);
                            break;
                        }
                    }
                    // If no home price found, use first business price
                    if ($extraPrice === 0) {
                        foreach ($extra->prices as $priceEntry) {
                            if (strpos($priceEntry['id'] ?? '', 'b-') !== false) {
                                $extraPrice = (float) ($priceEntry['price'] ?? 0);
                                break;
                            }
                        }
                    }
                    // If still no price, use the first price available
                    if ($extraPrice === 0 && !empty($extra->prices[0])) {
                        $extraPrice = (float) ($extra->prices[0]['price'] ?? 0);
                    }
                }
                
                $extras[] = [
                    'id' => $extra->id,
                    'name' => $extra->final_name ?? $extra->name ?? $extra->inner_name ?? $extra->inner_model ?? $extra->model ?? '',
                    'label' => $extra->final_name ?? $extra->name ?? $extra->inner_name ?? $extra->inner_model ?? $extra->model ?? '',
                    'description' => $extra->description ?? $extra->description_en ?? '',
                    'desc' => $extra->description ?? $extra->description_en ?? '',
                    'price' => $extraPrice,
                ];
            }
        }
        $product->extras = $extras;

        return $product;
    }

    /**
     * Compute saving result based on payload.
     */
    public function calculate(Product $product, Collection $brands, array $data): array
    {
        $isHome = ($data['home'] ?? 'home') === 'home';
        $case = (int) ($data['case'] ?? 0);
        $due = (int) ($data['due'] ?? 0);

        $productPrices = $isHome ? $product->home_prices : $product->business_prices;
        $aquaPrice = $this->getPriceForDue($productPrices, $due);
        $extraPrice = $this->calculateExtras($product, $data['extras'] ?? []);

        $bottles = 0;
        $price = 0;
        $bottleType = 0; // 0 => 1.5L bottles, 1 => 20L garrafas

        switch ($case) {
            case 1:
                $bottles = (float) ($data['bottles'] ?? 0);
                $price = (float) ($data['monthly_expense'] ?? 0);
                break;
            case 2:
                $bottles = 1;
                $price = (float) ($data['monthly_expense'] ?? 0);
                break;
            case 3:
                $liters = max(1, (int) ($data['liters'] ?? 1));
                $people = max(1, (int) ($data['people'] ?? 1));
                $brandId = $data['brand'] ?? null;
                $brandPrice = $this->getBrandPrice($brands, $brandId);
                $bottles = ($liters * $people / 1.5) * 30;
                $price = $brandPrice * $bottles;
                break;
            case 4:
                $bottleType = 1;
                $plan = (int) ($data['aquaservice_plan'] ?? 0);
                $bottles = $plan;
                $price = $this->getAquaservicePrice($brands, $plan, $isHome);
                break;
            case 5:
                $bottleType = 1;
                $monthly = (float) ($data['monthly_expense'] ?? 0);
                $dispensers = max(1, (int) ($data['dispensers'] ?? 1));
                $bottles = $dispensers > 0 ? intval($monthly / 5.5 / $dispensers) : 0;
                $price = $monthly;
                break;
            case 6:
                $bottleType = 1;
                $bottles = (int) ($data['plan'] ?? 0);
                $price = 0;
                break;
            case 7:
                $bottleType = 1;
                $monthly = (float) ($data['monthly_expense'] ?? 0);
                $dispensers = max(1, (int) ($data['dispensers'] ?? 1));
                $bottles = $dispensers > 0 ? intval($monthly / 5.5 / $dispensers) : 0;
                $price = $monthly;
                break;
            default:
                $bottles = 0;
                $price = 0;
                break;
        }

        $kg = $bottles * ($bottleType === 0 ? 0.06 : 0.4);
        $co2 = $kg * 0.828;
        $savingPrice = ($price * 12 * 5) - ($aquaPrice * $due) - $extraPrice;

        return [
            'bottles' => (int) $bottles,
            'due' => $due,
            'kg' => number_format($kg, 2, '.', ''),
            'co2' => number_format($co2, 2, '.', ''),
            'price' => number_format($price, 2, ',', ' ') . ' €',
            'aqua_price' => number_format($aquaPrice, 2, ',', ' ') . ' €',
            'saving_price' => number_format($savingPrice, 2, ',', ' ') . ' €',
        ];
    }

    private function getPriceForDue(array $prices, int $due): float
    {
        if (empty($prices)) {
            return 0;
        }

        foreach ($prices as $price) {
            if ((int) ($price['duties'] ?? 0) === $due) {
                return (float) ($price['price'] ?? 0);
            }
        }

        $first = $prices[0] ?? null;
        return $first ? (float) ($first['price'] ?? 0) : 0;
    }

    private function calculateExtras(Product $product, $extras): float
    {
        if (empty($extras) || empty($product->extras)) {
            return 0;
        }

        $items = is_array($extras) ? $extras : explode(',', (string) $extras);
        $total = 0;

        foreach ($items as $index) {
            if (isset($product->extras[$index])) {
                $total += (float) ($product->extras[$index]['price'] ?? 0);
            }
        }

        return $total;
    }

    private function getBrandPrice(Collection $brands, $brandId): float
    {
        if (!$brandId) {
            return 0;
        }

        $brand = $brands->firstWhere('id', (int) $brandId);
        if (!$brand || empty($brand->prices)) {
            return 0;
        }

        $first = $brand->prices[0];
        return (float) ($first['price'] ?? 0);
    }

    private function getAquaservicePrice(Collection $brands, int $plan, bool $isHome): float
    {
        $brand = $brands->firstWhere('type', 1);
        if (!$brand || empty($brand->prices)) {
            return 0;
        }

        foreach ($brand->prices as $price) {
            $matchPlan = (int) ($price['num'] ?? 0) === $plan;
            $matchScope = ($price['home'] ?? 'home') === ($isHome ? 'home' : 'company');
            if ($matchPlan && $matchScope) {
                return (float) ($price['price'] ?? 0);
            }
        }

        return 0;
    }
}

