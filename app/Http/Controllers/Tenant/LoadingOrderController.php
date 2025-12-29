<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\LoadingOrder;
use App\Models\Tenant\LoadingOrderItem;
use App\Models\Tenant\InstallerWarehouse;
use App\Models\Tenant\Warehouse;
use App\Models\Central\Product;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoadingOrderController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = LoadingOrder::with(['installerWarehouse.user', 'sourceWarehouse', 'creator', 'validator', 'items']);

        // Filtrar por estado si se proporciona
        if ($request->has('status') && $request->status !== null) {
            $query->where('status', $request->status);
        }

        // Si el usuario es instalador, mostrar solo sus órdenes
        if ($user->rol_id == 3 || $user->rol_id == 5) {
            $query->whereHas('installerWarehouse', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->get()->map(function($order) {
            $order->total_items = $order->getTotalItems();
            $order->total_loaded = $order->getTotalLoadedItems();
            return $order;
        });

        $installerWarehouses = InstallerWarehouse::with('user')->where('is_active', true)->get();
        $warehouses = Warehouse::where('is_active', true)->get();

        return Inertia::render('Tenant/LoadingOrders/Index', [
            'orders' => $orders,
            'installerWarehouses' => $installerWarehouses,
            'warehouses' => $warehouses,
            'userRole' => $user->rol_id
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $installerWarehouses = InstallerWarehouse::with('user')->where('is_active', true)->get();
        $warehouses = Warehouse::where('is_active', true)->get();
        $products = Product::where('active', 1)->select('id', 'name', 'model')->get();

        return Inertia::render('Tenant/LoadingOrders/Form', [
            'installerWarehouses' => $installerWarehouses,
            'warehouses' => $warehouses,
            'products' => $products,
            'userRole' => $user->rol_id
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'installer_warehouse_id' => 'required|exists:installer_warehouses,id',
            'source_warehouse_id' => 'nullable|exists:warehouses,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity_requested' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
        ]);

        $order = LoadingOrder::create([
            'installer_warehouse_id' => $validated['installer_warehouse_id'],
            'source_warehouse_id' => $validated['source_warehouse_id'] ?? null,
            'created_by' => auth()->id(),
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        foreach ($validated['items'] as $item) {
            LoadingOrderItem::create([
                'loading_order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity_requested' => $item['quantity_requested'],
                'notes' => $item['notes'] ?? null,
            ]);
        }

        return redirect()->route('loading-orders.index')->with('message', 'Orden de carga creada correctamente');
    }

    public function show($id)
    {
        $order = LoadingOrder::with([
            'installerWarehouse.user',
            'sourceWarehouse',
            'creator',
            'validator',
            'items.product'
        ])->findOrFail($id);

        $order->total_items = $order->getTotalItems();
        $order->total_loaded = $order->getTotalLoadedItems();

        return Inertia::render('Tenant/LoadingOrders/Show', [
            'order' => $order,
            'userRole' => auth()->user()->rol_id
        ]);
    }

    public function validateOrder(Request $request, $id)
    {
        $order = LoadingOrder::findOrFail($id);

        if ($order->status !== 'pending') {
            return redirect()->back()->with('error', 'Solo se pueden validar órdenes pendientes');
        }

        $validated = $request->validate([
            'validation_comments' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.id' => 'required|exists:loading_order_items,id',
            'items.*.quantity_loaded' => 'required|integer|min:0',
        ]);

        // Actualizar cantidades cargadas si se proporcionan
        if (isset($validated['items'])) {
            foreach ($validated['items'] as $itemData) {
                $item = LoadingOrderItem::find($itemData['id']);
                $item->update(['quantity_loaded' => $itemData['quantity_loaded']]);
            }
        }

        $order->validate(auth()->id(), $validated['validation_comments'] ?? null);

        return redirect()->route('loading-orders.index')->with('message', 'Orden validada correctamente');
    }

    public function markAsLoaded($id)
    {
        $order = LoadingOrder::findOrFail($id);

        if ($order->status !== 'validated') {
            return redirect()->back()->with('error', 'Solo se pueden cargar órdenes validadas');
        }

        $order->markAsLoaded();

        return redirect()->route('loading-orders.index')->with('message', 'Orden marcada como cargada y stock actualizado');
    }

    public function cancel($id)
    {
        $order = LoadingOrder::findOrFail($id);

        if (!in_array($order->status, ['pending', 'validated'])) {
            return redirect()->back()->with('error', 'No se puede cancelar esta orden');
        }

        $order->cancel();

        return redirect()->route('loading-orders.index')->with('message', 'Orden cancelada correctamente');
    }

    public function pendingValidation()
    {
        $orders = LoadingOrder::with([
            'installerWarehouse.user',
            'sourceWarehouse',
            'creator',
            'items.product'
        ])
        ->where('status', 'pending')
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function($order) {
            $order->total_items = $order->getTotalItems();
            return $order;
        });

        return Inertia::render('Tenant/LoadingOrders/PendingValidation', [
            'orders' => $orders
        ]);
    }

    // Gestión de furgonetas de instaladores
    public function installerWarehouses()
    {
        $warehouses = InstallerWarehouse::with('user')
            ->withCount('loadingOrders')
            ->get()
            ->map(function($warehouse) {
                $warehouse->current_stock = $warehouse->getCurrentStock();
                $warehouse->capacity_percentage = $warehouse->getCapacityUsagePercentage();
                return $warehouse;
            });

        $installers = TenantUser::whereIn('rol_id', [3, 5])
            ->select('id', 'name', 'last_name', 'email')
            ->get();

        return Inertia::render('Tenant/InstallerWarehouses/Index', [
            'warehouses' => $warehouses,
            'installers' => $installers
        ]);
    }

    public function storeInstallerWarehouse(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:tenant_users,id',
            'name' => 'required|string|max:255',
            'vehicle_plate' => 'nullable|string|max:50',
            'vehicle_brand' => 'nullable|string|max:100',
            'vehicle_model' => 'nullable|string|max:100',
            'max_capacity' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        InstallerWarehouse::create($validated);

        return redirect()->back()->with('message', 'Furgoneta registrada correctamente');
    }

    public function updateInstallerWarehouse(Request $request, $id)
    {
        $warehouse = InstallerWarehouse::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:tenant_users,id',
            'name' => 'required|string|max:255',
            'vehicle_plate' => 'nullable|string|max:50',
            'vehicle_brand' => 'nullable|string|max:100',
            'vehicle_model' => 'nullable|string|max:100',
            'max_capacity' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $warehouse->update($validated);

        return redirect()->back()->with('message', 'Furgoneta actualizada correctamente');
    }
}
