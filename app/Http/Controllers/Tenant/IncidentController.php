<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Incident;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IncidentController extends Controller
{
    public function index(Request $request)
    {
        $query = Incident::with(['assignedUser', 'creator', 'client', 'budget', 'installation']);

        $currentStatus = $request->get('status', 'all');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assigned_to_me')) {
            $query->where('assigned_to', auth()->id());
        }

        $incidents = $query->latest()->paginate(20);
        $users = TenantUser::all();

        return Inertia::render('Tenant/Incidents/Index', [
            'incidents' => $incidents,
            'users' => $users,
            'currentStatus' => $currentStatus,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:automatic,manual',
            'priority' => 'required|in:low,medium,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
            'client_id' => 'nullable|exists:clients,id',
            'budget_id' => 'nullable|exists:budgets,id',
            'installation_id' => 'nullable|exists:installations,id',
        ]);

        $incident = Incident::create([
            ...$validated,
            'created_by' => auth()->id(),
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Incident created successfully');
    }

    public function update(Request $request, Incident $incident)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'status' => 'sometimes|in:pending,in_progress,resolved,closed',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $incident->update($validated);

        if (isset($validated['status']) && $validated['status'] === 'resolved') {
            $incident->markAsResolved();
        }

        return redirect()->back()->with('success', 'Incident updated successfully');
    }

    public function destroy(Incident $incident)
    {
        $incident->delete();
        return redirect()->back()->with('success', 'Incident deleted successfully');
    }

    public function resolve(Request $request, $id)
    {
        $incident = Incident::findOrFail($id);

        $validated = $request->validate([
            'resolution_notes' => 'required|string',
            'status' => 'sometimes|in:resolved,closed',
        ]);

        $incident->update([
            'status' => $validated['status'] ?? 'resolved',
            'resolution_notes' => $validated['resolution_notes'],
            'resolved_at' => now(),
            'resolved_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Incidencia resuelta correctamente');
    }

    public function updateStatus(Request $request, $id)
    {
        $incident = Incident::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,resolved,closed',
        ]);

        $incident->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Estado actualizado correctamente');
    }

    public function unread()
    {
        $count = Incident::where('assigned_to', auth()->id())
            ->where('status', 'pending')
            ->count();

        return response()->json(['count' => $count]);
    }
}
