<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Central\PdfTemplate;
use App\Models\Central\Product;
use App\Models\Central\ProductAttr;
use App\Models\Central\SparePart;
use App\Models\Tenant\Budget;
use App\Models\Tenant\BudgetDetail;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\TenantProduct;
use App\Models\Tenant\TenantUser;
use App\Services\BlockRendererService;
use App\Services\PdfGeneratorService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Database\Eloquent\Collection;

class BudgetController extends Controller
{
    public function index($cid)
    {
        $client = Client::findOrFail($cid);
        return Inertia::render('Tenant/Budgets/BudgetList', [
            'title' => 'Propuestas de '.$client->company_name,
            'cid' => $cid,
            'st'=> request()->input('st'),
        ]);
    }

    public function list(Request $request, $cid)
    {
        $budgets = Budget::where('client_id', $cid);
        $st = $request->input('st');
        if ($st !== null && $st !== 'null') $budgets = $budgets->where('status', $request->st);
        $data = $budgets->get()->map(function($pr){
            $pr->status_name = $pr->getStatus();
            return $pr;
        });
        
        return $data;
    }

    public function get($cid, $bid){
        $budget = Budget::find($bid);

        ///Products
        $products = [];
        $quantities = explode(',', $budget->quantities);
        foreach (explode(',', $budget->products) as $key => $product) {
            $pr = Product::find($product);
            if (!$pr) continue;
            $pr->getTenantProduct();
            for ($i = 0; $i < $quantities[$key]; $i++) $products[] = $pr;
        }

        ///Details
        $details = [];
        foreach ($budget->details as $det)$details[] = ['label' => $det->txt, 'value' => $det->id];

        ///Addresses
        $addresses = [];
        foreach ($budget->client->addresses as $add) $addresses[] = ['label' => $add->full_address, 'value' => $add->id];        

        return ['products' => $products, 'budget' => $budget, 'details' => $details, 'addresses' => $addresses];
    }

    public function create($cid)
    {
        $products = Product::whereIn('id', ALLOWED_PRODUCTS)->where('active', 1)->get();
        $allowed = [];
        foreach ($products as $p) {
            $p->getTenantProduct();
            if ($p->inner_active == 0) continue;
            $allowed[] = [
                'label' => $p->final_name,
                'value' => $p->id,
                'prices' => $p->inner_prices,
            ];
        }
        
        return Inertia::render('Tenant/Budgets/BudgetForm', [
            'title' => 'Agregar Propuesta',
            'budget' => new Budget(),
            'cid' => $cid,
            'allDetails' => [],
            'products' => $allowed,
            'extras' => Catalog::select('name as label', 'id as value')->where('type', 4)->get(),
            'dues' => Lerph::getDuesSelect(),
        ]);
    }

    public function edit($cid, $bid)
    {
        $budget = Budget::find($bid);
        
        $allowed = [];
        $products = Product::whereIn('id', ALLOWED_PRODUCTS)->where('active', 1)->get();
        foreach ($products as $p) {
            $p->getTenantProduct();
            if ($p->inner_active == 0) continue;
            $allowed[] = [
                'label' => $p->final_name,
                'value' => $p->id,
                'prices' => $p->inner_prices,
            ];
        }

        return Inertia::render('Tenant/Budgets/BudgetForm', [
            'title' => 'Editar Presupuesto',
            'budget' => $budget,
            'cid' => $cid,
            'allDetails' => $budget->details,
            'products' => $allowed,
            'extras' => Catalog::select('name as label', 'id as value')->where('type', 4)->get(),
            'dues' => Lerph::getDuesSelect(),
        ]);
    }

    public function store(Request $request, $cid)
    {
        $id = $request->id;
        if (empty($id)) $id = 0;
        return $this->upsertData($request, $id, $cid);
    }

    public function upsertData($request, $id, $cid){
        $this->validateForm($request, $id);

        if (empty($request->id)) $budget = new Budget($request->except(['id']));
        else {
            $budget = Budget::find($request->id);
            if ($budget) $budget->fill($request->except(['id']));
            else $budget = new Budget($request->except(['id']));
        }
        $budget->client_id = $cid;
        $budget->products = implode(',', $request->input('products', []));
        $budget->quantities = implode(',', $request->input('quantities', []));
        $budget->save();

        $this->upsertDetails($request, $budget);

        return redirect()->route('budgets.index', $cid)->with('message', 'Datos guardados correctamente.');
    }

    public function destroy($bid)
    {
        $budget = Budget::findOrFail($bid);
        $budget->delete();
        return redirect()->back()->with('message', 'Presupuesto borrado correctamente.');
    }

    private function upsertDetails($request, $budget)
    {
        $savedDetails = $budget->details;
        $uploaded = $request->input('details', []);
        foreach ($uploaded as $det){
            $saved = false;
            foreach ($savedDetails as $sf){
                if ($sf->id == $det['id']) {
                    $saved = true;
                    $sf->fill($det);
                    $sf->save();
                }
            }
            if (!$saved){
                $budget->details()->create([
                    'installation' => $det['installation'],
                    'installation_cost' => $det['installation_cost'],
                    'init_amount' => $det['init_amount'],
                    'last_amount' => $det['last_amount'],
                    'type' => $det['type'],
                    'maintenance' => $det['maintenance'],
                    'extra_id' => $det['extra_id'],
                    'dues' => $det['dues'],
                    'price' => $det['price'],
                    'discount' => $det['discount'],
                    'notes' => $det['notes'],
                    'iva' => $det['iva'],
                ]);
            }
        }
        foreach ($savedDetails as $sa){
            $deleted = true;
            foreach ($uploaded as $det){if ($det['id'] == $sa->id) $deleted = false;}
            if ($deleted) $sa->delete();
        }
    }

    private function validateForm(Request $request, $id){

        return $request->validate([
            'products' => 'required',
        ],
        [],
        [
            'products' => 'Productos',
        ]);
    }

    public function validateDetailsForm(Request $request){
        $request->validate([
            'price' => ['required'],
            'installation' => ['required'],
            'type' => ['required'],
            'maintenance' => ['required'],
            'dues' => ['required'],
            'iva' => ['required']
        ], 
        [],
        [
            'price' => 'Precio',
            'installation' => 'Instalación',
            'type' => 'Tipo',
            'maintenance' => 'Mantenimiento',
            'dues' => 'Plazos',
            'iva' => 'IVA'
        ]
        );
        return redirect()->back()->with('message', 'Detalles guardados correctamente.');
    }

    ///Actions
    public function reject(Request $request, $bid){
        $budget = Budget::findOrFail($bid);
        if ($budget->status == 0){
            $budget->status = 2;
            $budget->rejection_reason = $request->reason;
            $budget->save();
        }
        
        return redirect()->back()->with('message', 'Presupuesto rechazado correctamente.');
    }

    public function accept(Request $request, $bid){
        $this->validateAcceptForm($request);

        $budget = Budget::findOrFail($bid);

        if ($budget->status == 0){
            $budget->status = 1;
            $budget->save();

            $detail = BudgetDetail::find($request->detail_id);
            if ($detail){
                $detail->status = 1;
                $detail->save();
            }

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
        }

        return redirect()->back()->with('message', 'Presupuesto aprobado correctamente.');
    }

    private function validateAcceptForm(Request $request){
        return $request->validate([
            'detail_id' => ['required']
        ],
        [],
        [
            'detail_id' => 'Detalle'
        ]);
    }

    public function downloadBudget($bid){
        set_time_limit(180);
        $budget = Budget::find($bid);
        $budgets = BudgetDetail::where('budget_id', $bid)->get();
        $products = [];
        $quantities = explode(',', $budget->quantities);

        foreach (explode(',', $budget->products) as $key => $product) {
            $pr = Product::find($product);
            if (!$pr) continue;
            $pr->getProduct();
            for ($i = 0; $i < $quantities[$key]; $i++) $products[] = $pr;
        }

        ///FECHA DE CREACIÓN DE PROPUESTA
        $date = (new Carbon($budget->created_at))->format('d-m-Y');

        $signature = Storage::disk('public')->url('pdf/firma.jpg');

        $data = [];
        foreach ($products as $product) $data[] = Lerph::getTechPdf($product);
        
        $pdf = Pdf::loadView('pdfs.pdf2', [
            'data' => $data,
            'budgets' => $budgets,
            'date' => $date,
            'signature' => $signature,
            'budget' => $budget,
        ]);

        return $pdf->stream('pdf2.pdf');

    }

    /**
     * Download budget using advanced PDF template system
     * This uses block-based templates and auto-generates product tech sheets
     */
    public function downloadBudgetAdvanced($bid, Request $request)
    {
        set_time_limit(180);

        $budget = Budget::find($bid);
        if (!$budget) {
            abort(404, 'Budget not found');
        }

        $user = auth()->user();

        // Get the default budget template for the company or use provided template ID
        $templateId = $request->input('template_id');

        if ($templateId) {
            $template = PdfTemplate::where('id', $templateId)
                ->where('company_id', $user->company_id)
                ->where('is_active', true)
                ->first();
        } else {
            $template = PdfTemplate::where('company_id', $user->company_id)
                ->where('type', 'budget')
                ->where('is_default', true)
                ->where('is_active', true)
                ->first();
        }

        // If no template found, fall back to old method
        if (!$template) {
            return $this->downloadBudget($bid);
        }

        // Get budget products
        $products = [];
        $productsData = [];
        $quantities = explode(',', $budget->quantities);

        foreach (explode(',', $budget->products) as $key => $productId) {
            $product = Product::find($productId);
            if (!$product) continue;

            $product->getProduct();
            $quantity = $quantities[$key] ?? 1;

            // Add to products array for rendering
            $productsData[] = [
                'id' => $product->id,
                'name' => $product->final_name ?? $product->name,
                'ref' => $product->reference ?? 'N/A',
                'description' => $product->description ?? '',
                'quantity' => $quantity,
                'price' => $product->price ?? 0,
                'image' => $product->getMainImage(),
                'attributes' => $product->attributes ?? [],
            ];

            // Store product for tech sheet generation
            for ($i = 0; $i < $quantity; $i++) {
                $products[] = $product;
            }
        }

        // Calculate totals
        $subtotal = 0;
        foreach ($productsData as $prod) {
            $subtotal += $prod['quantity'] * $prod['price'];
        }

        $budgetDetails = BudgetDetail::where('budget_id', $bid)->get();
        $taxRate = 21; // Default tax rate, can be customized
        $taxAmount = $subtotal * ($taxRate / 100);
        $total = $subtotal + $taxAmount;

        // Generate product tech sheets HTML
        $techSheets = [];
        foreach ($products as $product) {
            $techSheets[] = PdfGeneratorService::getProductTechSheet($product);
        }

        // Prepare data for template
        $data = [
            'company_name' => $user->company->name ?? 'Empresa',
            'company_logo' => $user->company->logo ?? '',
            'company_address' => $user->company->address ?? '',
            'company_phone' => $user->company->phone ?? '',
            'company_email' => $user->company->email ?? '',
            'company_cif' => $user->company->cif ?? '',

            'client_name' => $budget->client->company_name ?? '',
            'client_email' => $budget->client->email ?? '',
            'client_phone' => $budget->client->phone ?? '',
            'client_address' => $budget->client->getFullAddress() ?? '',
            'client_dni' => $budget->client->dni ?? '',

            'budget_number' => 'PRE-' . str_pad($budget->id, 6, '0', STR_PAD_LEFT),
            'budget_date' => (new Carbon($budget->created_at))->format('d/m/Y'),
            'budget_valid_until' => (new Carbon($budget->created_at))->addDays(30)->format('d/m/Y'),

            'installation_address' => $budget->client->getFullAddress() ?? '',

            'products' => $productsData,
            'product_tech_sheets' => $techSheets,

            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'tax_percent' => $taxRate,
            'total_amount' => $total,
            'discount' => 0,

            'current_date' => date('d/m/Y'),
        ];

        // Check if template uses blocks (advanced template)
        if (isset($template->variables) && is_array($template->variables)) {
            // Use block renderer
            $html = BlockRendererService::render(
                $template->variables,
                $data,
                $template->styles ?? []
            );
        } else {
            // Use old template rendering
            $html = $template->render($data);
        }

        // Generate PDF
        $pdf = Pdf::loadHTML($html);
        $filename = 'presupuesto_' . $budget->id . '_' . time() . '.pdf';

        return $pdf->stream($filename);
    }

    public function horecaStore(Request $request)
    {
        $request->validate([
            'client_id' => 'required',
            'product_id' => 'required',
        ],
        [],
        [
            'client_id' => 'Cliente',
            'product_id' => 'Producto',
        ]);

        
        $budget = new Budget($request->except(['id']));
        $budget->products = $request->input('product_id');
        $budget->quantities = 1;
        $budget->is_horeca = 1;
        $budget->save();

        $budget->details()->create([
            'installation' => 0,
            'installation_cost' => 0,
            'init_amount' => 0,
            'last_amount' => 0,
            'type' => 0,
            'maintenance' => 0,
            'extra_id' => 0,
            'dues' => 0,
            'price' => 0,
            'discount' => 0,
            'notes' => '',
            'iva' => 0,
            'status' => 1,
            'horeca_data' => json_encode($request->except(['id', 'product_id', 'client_id']))
        ]);

        return redirect()->back()->with('message', 'Propuesta genedara correctamente.');
    }
}
