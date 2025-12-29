<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\PdfTemplate;
use App\Services\BlockRendererService;
use App\Services\PdfGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class PdfTemplateController extends Controller
{
    /**
     * Display the PDF templates management page
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $templates = PdfTemplate::where('company_id', $user->company_id)
            ->orderBy('order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Central/PdfTemplates/Index', [
            'auth' => ['user' => $user],
            'templates' => $templates,
        ]);
    }

    /**
     * Show the form for creating a new template
     */
    public function create()
    {
        $user = auth()->user();

        return Inertia::render('Central/PdfTemplates/Form', [
            'auth' => ['user' => $user],
            'template' => null,
            'availableVariables' => $this->getVariables(),
        ]);
    }

    /**
     * Show the form for editing a template
     */
    public function edit($id)
    {
        $user = auth()->user();
        $template = PdfTemplate::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        return Inertia::render('Central/PdfTemplates/Form', [
            'auth' => ['user' => $user],
            'template' => $template,
            'availableVariables' => $this->getVariables(),
        ]);
    }

    /**
     * Get a specific template
     */
    public function show($id)
    {
        $template = PdfTemplate::findOrFail($id);
        return response()->json($template);
    }

    /**
     * Get available variables for templates
     */
    private function getVariables()
    {
        return [
            ['key' => 'company_name', 'description' => 'Nombre de la empresa'],
            ['key' => 'company_address', 'description' => 'Dirección de la empresa'],
            ['key' => 'company_phone', 'description' => 'Teléfono de la empresa'],
            ['key' => 'company_email', 'description' => 'Email de la empresa'],
            ['key' => 'company_cif', 'description' => 'CIF de la empresa'],
            ['key' => 'client_name', 'description' => 'Nombre del cliente'],
            ['key' => 'client_address', 'description' => 'Dirección del cliente'],
            ['key' => 'client_phone', 'description' => 'Teléfono del cliente'],
            ['key' => 'client_email', 'description' => 'Email del cliente'],
            ['key' => 'client_dni', 'description' => 'DNI/CIF del cliente'],
            ['key' => 'budget_number', 'description' => 'Número de presupuesto'],
            ['key' => 'budget_date', 'description' => 'Fecha del presupuesto'],
            ['key' => 'budget_valid_until', 'description' => 'Válido hasta'],
            ['key' => 'installation_address', 'description' => 'Dirección de instalación'],
            ['key' => 'installation_date', 'description' => 'Fecha de instalación'],
            ['key' => 'technician_name', 'description' => 'Nombre del técnico'],
            ['key' => 'items_table', 'description' => 'Tabla de productos/servicios'],
            ['key' => 'subtotal', 'description' => 'Subtotal'],
            ['key' => 'tax_amount', 'description' => 'Importe de impuestos'],
            ['key' => 'tax_percent', 'description' => 'Porcentaje de IVA'],
            ['key' => 'total_amount', 'description' => 'Total'],
            ['key' => 'payment_method', 'description' => 'Método de pago'],
            ['key' => 'notes', 'description' => 'Notas adicionales'],
            ['key' => 'current_date', 'description' => 'Fecha actual'],
            ['key' => 'contract_number', 'description' => 'Número de contrato'],
            ['key' => 'color_primary', 'description' => 'Color primario configurado'],
            ['key' => 'color_secondary', 'description' => 'Color secundario configurado'],
            ['key' => 'color_text', 'description' => 'Color de texto configurado'],
            ['key' => 'color_background', 'description' => 'Color de fondo configurado'],
        ];
    }

    /**
     * Create a new template
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:budget,invoice,contract,custom',
            'html_content' => 'required|string',
            'variables' => 'nullable|array',
            'logo' => 'nullable|image|max:2048',
            'colors' => 'nullable|array',
            'styles' => 'nullable|array',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('pdf_logos', 'public');
            $validated['logo'] = $logoPath;
        }

        // If setting as default, unset other defaults of same type
        if ($validated['is_default'] ?? false) {
            PdfTemplate::where('company_id', $validated['company_id'])
                ->where('type', $validated['type'])
                ->update(['is_default' => false]);
        }

        $template = PdfTemplate::create($validated);

        return response()->json([
            'message' => 'Template created successfully',
            'template' => $template,
        ], 201);
    }

    /**
     * Update a template
     */
    public function update(Request $request, $id)
    {
        $template = PdfTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:budget,invoice,contract,custom',
            'html_content' => 'sometimes|string',
            'variables' => 'nullable|array',
            'logo' => 'nullable|image|max:2048',
            'colors' => 'nullable|array',
            'styles' => 'nullable|array',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($template->logo) {
                Storage::disk('public')->delete($template->logo);
            }
            $logoPath = $request->file('logo')->store('pdf_logos', 'public');
            $validated['logo'] = $logoPath;
        }

        // If setting as default, unset other defaults of same type
        if (($validated['is_default'] ?? false) && !$template->is_default) {
            PdfTemplate::where('company_id', $template->company_id)
                ->where('type', $validated['type'] ?? $template->type)
                ->where('id', '!=', $template->id)
                ->update(['is_default' => false]);
        }

        $template->update($validated);

        return response()->json([
            'message' => 'Template updated successfully',
            'template' => $template->fresh(),
        ]);
    }

    /**
     * Delete a template
     */
    public function destroy($id)
    {
        $template = PdfTemplate::findOrFail($id);

        // Delete associated logo
        if ($template->logo) {
            Storage::disk('public')->delete($template->logo);
        }

        $template->delete();

        return response()->json([
            'message' => 'Template deleted successfully',
        ]);
    }

    /**
     * Duplicate a template
     */
    public function duplicate($id)
    {
        $original = PdfTemplate::findOrFail($id);

        $duplicate = $original->replicate();
        $duplicate->name = $original->name . ' (Copy)';
        $duplicate->is_default = false;
        $duplicate->save();

        return response()->json([
            'message' => 'Template duplicated successfully',
            'template' => $duplicate,
        ], 201);
    }

    /**
     * Preview template with sample data
     */
    public function preview(Request $request, $id)
    {
        $template = PdfTemplate::findOrFail($id);

        $validated = $request->validate([
            'data' => 'nullable|array',
        ]);

        // Use provided data or sample data
        $data = $validated['data'] ?? $this->getSampleData();

        $html = $template->render($data);

        return response()->json([
            'html' => $html,
        ]);
    }

    /**
     * Generate PDF from template
     */
    public function generatePdf(Request $request, $id)
    {
        $template = PdfTemplate::findOrFail($id);

        $validated = $request->validate([
            'data' => 'required|array',
            'filename' => 'nullable|string',
        ]);

        $html = $template->render($validated['data']);

        $pdf = Pdf::loadHTML($html);

        $filename = $validated['filename'] ?? 'document_' . time() . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Save rendered PDF to storage
     */
    public function savePdf(Request $request, $id)
    {
        $template = PdfTemplate::findOrFail($id);

        $validated = $request->validate([
            'data' => 'required|array',
            'path' => 'nullable|string',
        ]);

        $html = $template->render($validated['data']);

        $pdf = Pdf::loadHTML($html);

        $path = $validated['path'] ?? 'pdfs/' . uniqid() . '.pdf';
        Storage::disk('public')->put($path, $pdf->output());

        return response()->json([
            'message' => 'PDF saved successfully',
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }

    /**
     * Get default template for a type
     */
    public function getDefault(Request $request, $type)
    {
        $companyId = $request->input('company_id');

        $template = PdfTemplate::where('company_id', $companyId)
            ->where('type', $type)
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();

        if (!$template) {
            return response()->json([
                'message' => 'No default template found for this type',
            ], 404);
        }

        return response()->json($template);
    }

    /**
     * Get available variables for templates
     */
    public function getAvailableVariables()
    {
        return response()->json([
            'variables' => PdfTemplate::getAvailableVariables(),
        ]);
    }

    /**
     * Reorder templates
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'templates' => 'required|array',
            'templates.*.id' => 'required|exists:pdf_templates,id',
            'templates.*.order' => 'required|integer',
        ]);

        foreach ($validated['templates'] as $item) {
            PdfTemplate::where('id', $item['id'])
                ->update(['order' => $item['order']]);
        }

        return response()->json([
            'message' => 'Templates reordered successfully',
        ]);
    }

    /**
     * Get sample data for template preview
     */
    private function getSampleData()
    {
        return [
            'empresa_nombre' => 'WaterCRM Solutions',
            'empresa_logo' => '',
            'empresa_direccion' => 'Calle Ejemplo 123, Madrid',
            'empresa_telefono' => '+34 912 345 678',
            'empresa_email' => 'info@watercrm.com',
            'empresa_web' => 'www.watercrm.com',
            'cliente_nombre' => 'Juan Pérez',
            'cliente_empresa' => 'Empresa Demo S.L.',
            'cliente_email' => 'juan@demo.com',
            'cliente_telefono' => '+34 600 123 456',
            'cliente_direccion' => 'Av. Cliente 456, Barcelona',
            'fecha' => date('d/m/Y'),
            'numero_presupuesto' => 'PRE-2025-001',
            'numero_factura' => 'FAC-2025-001',
            'productos_tabla' => '<table><tr><td>Producto 1</td><td>100€</td></tr></table>',
            'subtotal' => '100.00€',
            'iva' => '21.00€',
            'total' => '121.00€',
            'descuento' => '0.00€',
            'condiciones_pago' => '50% adelantado, 50% a la entrega',
            'validez' => '30 días',
            'firma_comercial' => '',
            'firma_cliente' => '',
            'observaciones' => 'Gracias por su confianza',
        ];
    }

    // ==================== ADVANCED EDITOR METHODS ====================

    /**
     * Show advanced editor for creating new template
     */
    public function advancedCreate()
    {
        $user = auth()->user();

        return Inertia::render('Central/PdfTemplates/AdvancedEditor', [
            'auth' => ['user' => $user],
            'template' => null,
            'mode' => 'create',
        ]);
    }

    /**
     * Show advanced editor for editing existing template
     */
    public function advancedEdit($id)
    {
        $user = auth()->user();
        $template = PdfTemplate::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        return Inertia::render('Central/PdfTemplates/AdvancedEditor', [
            'auth' => ['user' => $user],
            'template' => $template,
            'mode' => 'edit',
        ]);
    }

    /**
     * Store advanced template with blocks
     */
    public function storeAdvanced(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:budget,invoice,contract,custom',
            'blocks' => 'required|array',
            'blocks.*.type' => 'required|string',
            'blocks.*.content' => 'nullable|array',
            'settings' => 'nullable|array',
            'colors' => 'nullable|array',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        // If setting as default, unset other defaults of same type
        if ($validated['is_default'] ?? false) {
            PdfTemplate::where('company_id', $validated['company_id'])
                ->where('type', $validated['type'])
                ->update(['is_default' => false]);
        }

        // Store blocks as JSON in a new column or use existing structure
        // For now, we'll generate HTML from blocks and store it
        $html = BlockRendererService::render(
            $validated['blocks'],
            $this->getSampleData(),
            $validated['settings'] ?? []
        );

        $template = PdfTemplate::create([
            'company_id' => $validated['company_id'],
            'name' => $validated['name'],
            'type' => $validated['type'],
            'html_content' => $html,
            'variables' => $validated['blocks'], // Store blocks in variables field
            'colors' => $validated['colors'] ?? null,
            'styles' => $validated['settings'] ?? null,
            'is_default' => $validated['is_default'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Template created successfully',
            'template' => $template,
        ], 201);
    }

    /**
     * Update advanced template with blocks
     */
    public function updateAdvanced(Request $request, $id)
    {
        $template = PdfTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:budget,invoice,contract,custom',
            'blocks' => 'sometimes|array',
            'blocks.*.type' => 'required_with:blocks|string',
            'blocks.*.content' => 'nullable|array',
            'settings' => 'nullable|array',
            'colors' => 'nullable|array',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        // If setting as default, unset other defaults of same type
        if (($validated['is_default'] ?? false) && !$template->is_default) {
            PdfTemplate::where('company_id', $template->company_id)
                ->where('type', $validated['type'] ?? $template->type)
                ->where('id', '!=', $template->id)
                ->update(['is_default' => false]);
        }

        // Regenerate HTML from blocks if blocks were updated
        if (isset($validated['blocks'])) {
            $html = BlockRendererService::render(
                $validated['blocks'],
                $this->getSampleData(),
                $validated['settings'] ?? $template->styles ?? []
            );
            $validated['html_content'] = $html;
            $validated['variables'] = $validated['blocks'];
        }

        if (isset($validated['settings'])) {
            $validated['styles'] = $validated['settings'];
        }

        $template->update($validated);

        return response()->json([
            'message' => 'Template updated successfully',
            'template' => $template->fresh(),
        ]);
    }

    /**
     * Preview template from blocks
     */
    public function previewFromBlocks(Request $request)
    {
        $validated = $request->validate([
            'blocks' => 'required|array',
            'blocks.*.type' => 'required|string',
            'blocks.*.content' => 'nullable|array',
            'settings' => 'nullable|array',
            'data' => 'nullable|array',
        ]);

        // Get sample data or use provided data
        $data = $validated['data'] ?? $this->getSampleData();

        // Add sample products if not provided
        if (!isset($data['products'])) {
            $data['products'] = [
                [
                    'name' => 'Producto Demo 1',
                    'ref' => 'PROD-001',
                    'description' => 'Descripción del producto demo',
                    'quantity' => 2,
                    'price' => 150.00,
                    'image' => '',
                    'attributes' => [
                        'Material' => 'Acero inoxidable',
                        'Dimensiones' => '100x50x30 cm',
                        'Peso' => '15 kg',
                    ],
                ],
                [
                    'name' => 'Producto Demo 2',
                    'ref' => 'PROD-002',
                    'description' => 'Otro producto de ejemplo',
                    'quantity' => 1,
                    'price' => 250.00,
                    'image' => '',
                ],
            ];
        }

        // Calculate totals if not provided
        if (!isset($data['subtotal'])) {
            $subtotal = 0;
            foreach ($data['products'] as $product) {
                $subtotal += ($product['quantity'] ?? 1) * ($product['price'] ?? 0);
            }
            $data['subtotal'] = $subtotal;
            $data['tax_amount'] = $subtotal * 0.21;
            $data['total_amount'] = $subtotal + $data['tax_amount'];
        }

        $html = BlockRendererService::render(
            $validated['blocks'],
            $data,
            $validated['settings'] ?? []
        );

        return response()->json([
            'html' => $html,
        ]);
    }

    /**
     * Generate PDF from blocks
     */
    public function generatePdfFromBlocks(Request $request)
    {
        $validated = $request->validate([
            'blocks' => 'required|array',
            'blocks.*.type' => 'required|string',
            'blocks.*.content' => 'nullable|array',
            'settings' => 'nullable|array',
            'data' => 'required|array',
            'filename' => 'nullable|string',
        ]);

        $html = BlockRendererService::render(
            $validated['blocks'],
            $validated['data'],
            $validated['settings'] ?? []
        );

        $pdf = Pdf::loadHTML($html);

        $filename = $validated['filename'] ?? 'document_' . time() . '.pdf';

        return $pdf->download($filename);
    }
}
