<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Contract;
use App\Models\Tenant\ContractSignature;
use App\Models\Tenant\Budget;
use App\Models\Tenant\Client;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ContractController extends Controller
{
    /**
     * Display contract configuration for a client
     */
    public function index($cid)
    {
        $client = Client::findOrFail($cid);
        $contracts = Contract::where('client_id', $cid)->get();
        
        return Inertia::render('Tenant/Contracts/ContractList', [
            'title' => 'Contratos de ' . $client->company_name,
            'cid' => $cid,
            'contracts' => $contracts,
            'availableFields' => Contract::getAvailableFields(),
        ]);
    }

    /**
     * Show contract creation form
     */
    public function create($cid)
    {
        $client = Client::findOrFail($cid);
        
        return Inertia::render('Tenant/Contracts/ContractForm', [
            'title' => 'Crear Contrato',
            'cid' => $cid,
            'contract' => new Contract(),
            'availableFields' => Contract::getAvailableFields(),
        ]);
    }

    /**
     * Show contract editing form
     */
    public function edit($cid, $id)
    {
        $contract = Contract::findOrFail($id);
        
        return Inertia::render('Tenant/Contracts/ContractForm', [
            'title' => 'Editar Contrato',
            'cid' => $cid,
            'contract' => $contract,
            'availableFields' => Contract::getAvailableFields(),
        ]);
    }

    /**
     * Store contract
     */
    public function store(Request $request, $cid)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:pdf,text',
            'content' => 'required_if:type,text',
            'pdf_file' => 'required_if:type,pdf|file|mimes:pdf|max:10240',
            'field_mappings' => 'nullable|array',
            'signature_fields' => 'nullable|array',
        ]);

        $contract = new Contract();
        $contract->client_id = $cid;
        $contract->name = $request->name;
        $contract->type = $request->type;
        $contract->content = $request->content;
        $contract->field_mappings = $request->field_mappings ?? [];
        $contract->signature_fields = $request->signature_fields ?? [];
        $contract->is_active = $request->is_active ?? true;

        // Handle PDF upload
        if ($request->type === 'pdf' && $request->hasFile('pdf_file')) {
            $path = $request->file('pdf_file')->store('contracts/pdfs', 'public');
            $contract->pdf_path = $path;
        }

        $contract->save();

        return redirect()->route('contracts.index', $cid)
            ->with('message', 'Contrato creado correctamente.');
    }

    /**
     * Update contract
     */
    public function update(Request $request, $cid, $id)
    {
        $contract = Contract::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:pdf,text',
            'content' => 'required_if:type,text',
            'pdf_file' => 'nullable|file|mimes:pdf|max:10240',
            'field_mappings' => 'nullable|array',
            'signature_fields' => 'nullable|array',
        ]);

        $contract->name = $request->name;
        $contract->type = $request->type;
        $contract->content = $request->content;
        $contract->field_mappings = $request->field_mappings ?? [];
        $contract->signature_fields = $request->signature_fields ?? [];
        $contract->is_active = $request->is_active ?? true;

        // Handle PDF upload
        if ($request->hasFile('pdf_file')) {
            // Delete old PDF
            if ($contract->pdf_path) {
                Storage::disk('public')->delete($contract->pdf_path);
            }
            $path = $request->file('pdf_file')->store('contracts/pdfs', 'public');
            $contract->pdf_path = $path;
        }

        $contract->save();

        return redirect()->route('contracts.index', $cid)
            ->with('message', 'Contrato actualizado correctamente.');
    }

    /**
     * Delete contract
     */
    public function destroy($cid, $id)
    {
        $contract = Contract::findOrFail($id);
        
        // Delete PDF if exists
        if ($contract->pdf_path) {
            Storage::disk('public')->delete($contract->pdf_path);
        }
        
        $contract->delete();

        return redirect()->route('contracts.index', $cid)
            ->with('message', 'Contrato eliminado correctamente.');
    }

    /**
     * Show contract for budget signing
     */
    public function showForBudget($cid, $bid)
    {
        $budget = Budget::findOrFail($bid);
        $contract = Contract::where('client_id', $budget->client_id)
            ->where('is_active', true)
            ->first();

        if (!$contract) {
            return redirect()->route('budgets.index', $cid)
                ->with('error', 'No hay contrato configurado para este cliente.');
        }

        $signature = ContractSignature::where('budget_id', $bid)
            ->where('contract_id', $contract->id)
            ->first();

        return Inertia::render('Tenant/Contracts/ContractSign', [
            'title' => 'Firmar Contrato',
            'cid' => $cid,
            'budget' => $budget,
            'contract' => $contract,
            'signature' => $signature,
            'availableFields' => Contract::getAvailableFields(),
        ]);
    }

    /**
     * Save signatures
     */
    public function saveSignatures(Request $request, $cid, $bid)
    {
        $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'installer_signature' => 'nullable|string',
            'client_signature' => 'nullable|string',
        ]);

        $signature = ContractSignature::firstOrNew([
            'budget_id' => $bid,
            'contract_id' => $request->contract_id,
        ]);

        if ($request->installer_signature) {
            $signature->installer_signature = $request->installer_signature;
            $signature->installer_signed_at = now();
            $signature->installer_signed_by = auth()->user()->id;
        }

        if ($request->client_signature) {
            $signature->client_signature = $request->client_signature;
            $signature->client_signed_at = now();
        }

        $signature->save();

        // Generate PDF if both signatures are present
        if ($signature->isFullySigned()) {
            $this->generateContractPdf($signature);
        }

        return redirect()->back()
            ->with('message', 'Firmas guardadas correctamente.');
    }

    /**
     * Generate contract PDF with signatures
     */
    private function generateContractPdf($signature)
    {
        $contract = $signature->contract;
        $budget = $signature->budget;
        $client = $budget->client;

        // Prepare data for contract
        $data = $this->prepareContractData($budget, $contract);

        // Generate PDF based on contract type
        if ($contract->type === 'pdf') {
            // For PDF type, we would need to use a PDF manipulation library
            // like setasign/fpdi to fill form fields and add signatures
            // This is a simplified version
            $pdf = Pdf::loadView('contracts.pdf', [
                'contract' => $contract,
                'data' => $data,
                'signature' => $signature,
            ]);
        } else {
            // For text type, render the content with replaced fields
            $content = $this->replaceFields($contract->content, $data);
            
            $pdf = Pdf::loadView('contracts.text', [
                'content' => $content,
                'signature' => $signature,
                'contract' => $contract,
            ]);
        }

        // Save PDF
        $pdfPath = 'contracts/signed/' . $signature->id . '.pdf';
        Storage::disk('public')->put($pdfPath, $pdf->output());
        
        $signature->pdf_path = $pdfPath;
        $signature->save();
    }

    /**
     * Prepare contract data from budget
     */
    private function prepareContractData($budget, $contract)
    {
        $budget->load('client');
        $client = $budget->client;
        
        // Get main address if available
        $mainAddress = $client->mainAddress();
        
        return [
            'client.company_name' => $client->company_name ?? '',
            'client.contact_name' => ($client->contact_name ?? '') . ' ' . ($client->contact_lastname ?? ''),
            'client.email' => $client->email ?? '',
            'client.phone' => $client->phone ?? '',
            'client.address' => $mainAddress ? $mainAddress->address : ($client->address ?? ''),
            'client.city' => $mainAddress ? $mainAddress->city : ($client->city ?? ''),
            'client.postal_code' => $mainAddress ? $mainAddress->postal_code : ($client->postal_code ?? ''),
            'client.province' => $mainAddress ? $mainAddress->province : ($client->province ?? ''),
            'client.country' => $mainAddress ? $mainAddress->country : ($client->country ?? ''),
            'client.cif' => $client->cif ?? '',
            'budget.id' => $budget->id,
            'budget.created_at' => $budget->created_at ? $budget->created_at->format('d/m/Y') : now()->format('d/m/Y'),
            'budget.products_txt' => $budget->products_txt ?? '',
            'date.today' => now()->format('d/m/Y'),
            'date.formatted' => now()->format('d \d\e F \d\e Y'),
        ];
    }

    /**
     * Replace fields in contract content
     */
    private function replaceFields($content, $data)
    {
        foreach ($data as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
        }
        return $content;
    }

    /**
     * Download signed contract PDF
     */
    public function download($cid, $bid, $id)
    {
        $signature = ContractSignature::findOrFail($id);
        
        if (!$signature->pdf_path || !Storage::disk('public')->exists($signature->pdf_path)) {
            return redirect()->back()->with('error', 'El PDF del contrato no está disponible.');
        }

        return Storage::disk('public')->download($signature->pdf_path);
    }
}

