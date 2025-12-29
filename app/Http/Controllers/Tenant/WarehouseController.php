<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Warehouse;
use App\Models\Tenant\ProductWarehouse;
use App\Models\Tenant\WarehouseOrder;
use App\Models\Central\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index()
    {
        $warehouses = Warehouse::withCount('products')
            ->with(['productWarehouses' => function($q) {
                $q->whereRaw('stock <= min_stock');
            }])
            ->get()
            ->map(function($warehouse) {
                $warehouse->total_stock = $warehouse->getTotalStock();
                $warehouse->low_stock_count = $warehouse->productWarehouses->count();
                $warehouse->inventory_value = $warehouse->getValueInventory();
                return $warehouse;
            });

        return Inertia::render('Tenant/Warehouses/Index', [
            'warehouses' => $warehouses
        ]);
    }

    public function create()
    {
        return Inertia::render('Tenant/Warehouses/Form', [
            'warehouse' => new Warehouse()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:warehouses,code',
            'type' => 'required|in:physical,virtual,vehicle',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'manager_name' => 'nullable|string|max:255',
            'manager_phone' => 'nullable|string|max:50',
            'manager_email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'is_main' => 'boolean',
        ]);

        Warehouse::create($validated);

        return redirect()->route('warehouses.index')->with('message', 'Almacén creado correctamente');
    }

    public function edit($id)
    {
        $warehouse = Warehouse::findOrFail($id);

        return Inertia::render('Tenant/Warehouses/Form', [
            'warehouse' => $warehouse
        ]);
    }

    public function update(Request $request, $id)
    {
        $warehouse = Warehouse::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:warehouses,code,' . $id,
            'type' => 'required|in:physical,virtual,vehicle',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'manager_name' => 'nullable|string|max:255',
            'manager_phone' => 'nullable|string|max:50',
            'manager_email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'is_main' => 'boolean',
        ]);

        $warehouse->update($validated);

        return redirect()->route('warehouses.index')->with('message', 'Almacén actualizado correctamente');
    }

    public function destroy($id)
    {
        $warehouse = Warehouse::findOrFail($id);
        $warehouse->delete();

        return redirect()->route('warehouses.index')->with('message', 'Almacén eliminado correctamente');
    }

    public function stock($id)
    {
        $warehouse = Warehouse::with(['productWarehouses.product'])->findOrFail($id);
        $products = Product::where('active', 1)->select('id', 'name', 'model')->get();

        $stockData = $warehouse->productWarehouses->map(function($pw) {
            return [
                'id' => $pw->id,
                'product_id' => $pw->product_id,
                'product_name' => $pw->product->name,
                'product_model' => $pw->product->model,
                'stock' => $pw->stock,
                'min_stock' => $pw->min_stock,
                'max_stock' => $pw->max_stock,
                'reorder_point' => $pw->reorder_point,
                'reorder_quantity' => $pw->reorder_quantity,
                'location_code' => $pw->location_code,
                'cost_price' => $pw->cost_price,
                'last_restock_date' => $pw->last_restock_date,
                'is_low_stock' => $pw->isLowStock(),
                'needs_reorder' => $pw->needsReorder(),
                'stock_percentage' => $pw->getStockPercentage(),
            ];
        });

        return Inertia::render('Tenant/Warehouses/Stock', [
            'warehouse' => $warehouse,
            'stockData' => $stockData,
            'availableProducts' => $products
        ]);
    }

    public function updateStock(Request $request, $id)
    {
        $warehouse = Warehouse::findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'max_stock' => 'nullable|integer|min:0',
            'reorder_point' => 'required|integer|min:0',
            'reorder_quantity' => 'required|integer|min:0',
            'location_code' => 'nullable|string|max:50',
            'cost_price' => 'nullable|numeric|min:0',
        ]);

        ProductWarehouse::updateOrCreate(
            [
                'warehouse_id' => $id,
                'product_id' => $validated['product_id']
            ],
            $validated
        );

        return redirect()->back()->with('message', 'Stock actualizado correctamente');
    }

    public function checkAutomaticOrders($id)
    {
        $warehouse = Warehouse::findOrFail($id);
        $warehouse->checkAndCreateAutomaticOrders();

        return redirect()->back()->with('message', 'Órdenes automáticas verificadas');
    }

    public function orders($id)
    {
        $warehouse = Warehouse::findOrFail($id);
        $orders = WarehouseOrder::where('warehouse_id', $id)
            ->with(['product', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();

        $products = Product::where('active', 1)
            ->select('id', 'name', 'model')
            ->get();

        return Inertia::render('Tenant/Warehouses/Orders', [
            'warehouse' => $warehouse,
            'orders' => $orders,
            'products' => $products,
        ]);
    }

    public function createOrder(Request $request, $id)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'expected_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $order = WarehouseOrder::create([
            'warehouse_id' => $id,
            'product_id' => $validated['product_id'],
            'quantity' => $validated['quantity'],
            'unit_price' => $validated['unit_price'] ?? null,
            'supplier' => $validated['supplier'] ?? null,
            'expected_at' => $validated['expected_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
            'order_type' => 'manual',
            'created_by' => auth()->id(),
        ]);

        if ($order->unit_price) {
            $order->calculateTotal();
        }

        return redirect()->back()->with('message', 'Pedido creado correctamente');
    }

    public function receiveOrder(Request $request, $orderId)
    {
        $order = WarehouseOrder::findOrFail($orderId);
        $order->markAsReceived(auth()->id());

        return redirect()->back()->with('message', 'Pedido recibido y stock actualizado');
    }
}
