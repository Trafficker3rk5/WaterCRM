<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Call;
use App\Models\Tenant\CallList;
use App\Models\Tenant\CallScript;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use League\Csv\Reader;

class TelemarketingController extends Controller
{
    /**
     * Dashboard TMK - Overview of calls and lists
     */
    public function dashboard()
    {
        $user = auth()->user();

        // Get calls assigned to user or their subordinates
        $query = Call::query();

        if ($user->isTMKManager()) {
            // Jefe TMK sees their subordinates' calls
            $subordinateIds = $user->subordinates()->pluck('id');
            $query->whereIn('assigned_to', $subordinateIds->push($user->id));
        } elseif ($user->isTMK()) {
            // TMK only sees their own calls
            $query->where('assigned_to', $user->id);
        }

        $stats = [
            'total_calls' => $query->count(),
            'pending_calls' => (clone $query)->where('status', 'pending')->count(),
            'today_calls' => (clone $query)->whereDate('created_at', today())->count(),
            'contacted_today' => (clone $query)->where('status', 'contacted')->whereDate('last_call_at', today())->count(),
            'interested' => (clone $query)->where('status', 'interested')->count(),
            'callbacks_today' => (clone $query)->dueToday()->count(),
            'conversions_this_month' => (clone $query)->whereIn('status', ['converted_contact', 'converted_client'])->whereMonth('converted_at', now()->month)->count(),
        ];

        $recentCalls = (clone $query)->with(['assignedUser', 'callList'])
            ->latest('last_call_at')
            ->limit(10)
            ->get();

        $callsByStatus = (clone $query)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return Inertia::render('Tenant/Telemarketing/Dashboard', [
            'stats' => $stats,
            'recentCalls' => $recentCalls,
            'callsByStatus' => $callsByStatus,
        ]);
    }

    /**
     * My Calls - Active calls for TMK agent
     */
    public function myCalls(Request $request)
    {
        $user = auth()->user();
        $status = $request->input('status', 'all');

        $query = Call::where('assigned_to', $user->id)
            ->with(['callList', 'notes']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Priority: callbacks due, then pending, then others
        $calls = $query->orderByRaw("
            CASE
                WHEN status = 'callback' AND next_call_at <= NOW() THEN 1
                WHEN status = 'pending' THEN 2
                WHEN status = 'callback' THEN 3
                ELSE 4
            END
        ")
        ->orderBy('priority', 'desc')
        ->orderBy('created_at', 'asc')
        ->paginate(50);

        return Inertia::render('Tenant/Telemarketing/MyCalls', [
            'calls' => $calls,
            'currentStatus' => $status,
        ]);
    }

    /**
     * Call Detail - Make call and log outcome
     */
    public function showCall($id)
    {
        $call = Call::with(['callList', 'notes.user', 'convertedClient'])
            ->findOrFail($id);

        // Check permission
        $user = auth()->user();
        if (!$user->isAdmin() && !$user->isTMKManager() && $call->assigned_to != $user->id) {
            abort(403, 'No tienes permiso para ver esta llamada');
        }

        $scripts = CallScript::active()->get();

        return Inertia::render('Tenant/Telemarketing/CallDetail', [
            'call' => $call,
            'scripts' => $scripts,
        ]);
    }

    /**
     * Log Call Outcome
     */
    public function logCall(Request $request, $id)
    {
        $validated = $request->validate([
            'outcome' => 'required|in:answered,no_answer,busy,voicemail,wrong_number,callback_requested,interested,not_interested',
            'notes' => 'required|string',
            'duration' => 'nullable|integer|min:0',
            'interest_level' => 'nullable|in:none,low,medium,high,very_high',
            'interested_in' => 'nullable|string',
            'next_call_at' => 'nullable|date',
        ]);

        $call = Call::findOrFail($id);

        // Update call
        $call->markAsCalled(
            $validated['outcome'],
            $validated['notes'],
            $validated['duration'] ?? null
        );

        if (isset($validated['interest_level'])) {
            $call->interest_level = $validated['interest_level'];
        }

        if (isset($validated['interested_in'])) {
            $call->interested_in = $validated['interested_in'];
        }

        if ($validated['outcome'] === 'callback_requested' && isset($validated['next_call_at'])) {
            $call->scheduleCallback($validated['next_call_at'], $validated['notes']);
        }

        $call->save();

        return redirect()->back()->with('message', 'Llamada registrada correctamente');
    }

    /**
     * Convert Call to Contact/Client
     */
    public function convertCall(Request $request, $id)
    {
        $validated = $request->validate([
            'type' => 'required|in:contact,client',
        ]);

        $call = Call::findOrFail($id);

        if ($validated['type'] === 'contact') {
            $client = $call->convertToContact();
            $message = 'Convertido a contacto correctamente';
        } else {
            $client = $call->convertToClient();
            $message = 'Convertido a cliente correctamente';
        }

        return redirect()->back()->with('message', $message);
    }

    /**
     * Call Lists Management
     */
    public function callLists()
    {
        $user = auth()->user();

        $query = CallList::with(['creator', 'assignedTo']);

        if ($user->isTMKManager()) {
            $query->where(function($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhere('assigned_to', $user->id);
            });
        } elseif ($user->isTMK()) {
            $query->whereHas('calls', function($q) use ($user) {
                $q->where('assigned_to', $user->id);
            });
        }

        $lists = $query->latest()->paginate(20);

        return Inertia::render('Tenant/Telemarketing/CallLists', [
            'lists' => $lists,
        ]);
    }

    /**
     * Upload CSV Call List
     */
    public function uploadList(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:csv,txt|max:10240',
            'assigned_to' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('call-lists', $fileName, 'local');

        // Create call list
        $callList = CallList::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'created_by' => auth()->id(),
            'assigned_to' => $validated['assigned_to'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'status' => 'pending',
        ]);

        // Process CSV file
        $this->processCsvFile($callList, storage_path('app/' . $filePath));

        return redirect()->route('telemarketing.lists')->with('message', 'Listado subido y procesado correctamente');
    }

    /**
     * Process CSV file and create calls
     */
    protected function processCsvFile($callList, $filePath)
    {
        $csv = Reader::createFromPath($filePath, 'r');
        $csv->setHeaderOffset(0);

        $records = $csv->getRecords();
        $assignedTo = $callList->assigned_to ?? auth()->id();

        foreach ($records as $record) {
            // Map CSV columns (flexible mapping)
            $callData = [
                'call_list_id' => $callList->id,
                'assigned_to' => $assignedTo,
                'contact_name' => $record['nombre'] ?? $record['name'] ?? $record['Nombre'] ?? '',
                'contact_phone' => $record['telefono'] ?? $record['phone'] ?? $record['Teléfono'] ?? '',
                'contact_email' => $record['email'] ?? $record['correo'] ?? null,
                'contact_company' => $record['empresa'] ?? $record['company'] ?? null,
                'contact_position' => $record['cargo'] ?? $record['position'] ?? null,
                'contact_address' => $record['direccion'] ?? $record['address'] ?? null,
                'contact_city' => $record['ciudad'] ?? $record['city'] ?? null,
                'contact_province' => $record['provincia'] ?? $record['province'] ?? null,
                'contact_postal_code' => $record['cp'] ?? $record['postal_code'] ?? null,
                'status' => 'pending',
                'priority' => $record['prioridad'] ?? $record['priority'] ?? 'normal',
                'custom_data' => $record, // Store all CSV data
            ];

            Call::create($callData);
        }

        // Update call list stats
        $callList->updateStats();
    }

    /**
     * Call Scripts Management
     */
    public function scripts()
    {
        $scripts = CallScript::with('creator')->latest()->get();

        return Inertia::render('Tenant/Telemarketing/Scripts', [
            'scripts' => $scripts,
        ]);
    }

    /**
     * Store Call Script
     */
    public function storeScript(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'opening' => 'nullable|string',
            'pitch' => 'nullable|string',
            'objection_handling' => 'nullable|string',
            'closing' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();

        CallScript::create($validated);

        return redirect()->back()->with('message', 'Script creado correctamente');
    }

    /**
     * Update Call Script
     */
    public function updateScript(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'opening' => 'nullable|string',
            'pitch' => 'nullable|string',
            'objection_handling' => 'nullable|string',
            'closing' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $script = CallScript::findOrFail($id);
        $script->update($validated);

        return redirect()->back()->with('message', 'Script actualizado correctamente');
    }

    /**
     * Delete Call Script
     */
    public function destroyScript($id)
    {
        $script = CallScript::findOrFail($id);
        $script->delete();

        return redirect()->back()->with('message', 'Script eliminado correctamente');
    }

    /**
     * Team Performance (for TMK Managers)
     */
    public function teamPerformance()
    {
        $user = auth()->user();

        if (!$user->isTMKManager() && !$user->isAdmin()) {
            abort(403, 'No tienes permiso para ver esta página');
        }

        $subordinateIds = $user->subordinates()->pluck('id');

        $performance = [];
        foreach ($user->subordinates as $subordinate) {
            $calls = Call::where('assigned_to', $subordinate->id);

            $performance[] = [
                'user' => $subordinate,
                'total_calls' => $calls->count(),
                'contacted' => (clone $calls)->where('status', 'contacted')->count(),
                'interested' => (clone $calls)->where('status', 'interested')->count(),
                'conversions' => (clone $calls)->whereIn('status', ['converted_contact', 'converted_client'])->count(),
                'avg_duration' => (clone $calls)->whereNotNull('call_duration')->avg('call_duration'),
                'today_calls' => (clone $calls)->whereDate('last_call_at', today())->count(),
            ];
        }

        return Inertia::render('Tenant/Telemarketing/TeamPerformance', [
            'performance' => $performance,
        ]);
    }
}
