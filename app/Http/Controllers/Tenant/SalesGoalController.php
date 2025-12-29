<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\SalesGoal;
use App\Models\Tenant\Budget;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SalesGoalController extends Controller
{
    public function index()
    {
        $goals = SalesGoal::with(['user', 'creator'])
            ->orderBy('period_start', 'desc')
            ->get()
            ->map(function($goal) {
                $goal->progress_percentage = $goal->getProgressPercentage();
                $goal->units_progress_percentage = $goal->getUnitsProgressPercentage();
                $goal->is_achieved = $goal->isAchieved();
                $goal->remaining_amount = $goal->getRemainingAmount();
                $goal->remaining_units = $goal->getRemainingUnits();
                return $goal;
            });

        $users = TenantUser::whereIn('rol_id', [1, 2, 4])
            ->select('id', 'name', 'last_name', 'email')
            ->get();

        return Inertia::render('Tenant/SalesGoals/Index', [
            'goals' => $goals,
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:individual,team',
            'user_id' => 'required_if:type,individual|nullable|exists:tenant_users,id',
            'team_name' => 'required_if:type,team|nullable|string|max:255',
            'team_user_ids' => 'required_if:type,team|nullable|array',
            'team_user_ids.*' => 'exists:tenant_users,id',
            'period_type' => 'required|in:monthly,quarterly,yearly',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'target_amount' => 'required|numeric|min:0',
            'target_units' => 'nullable|integer|min:0',
            'reward_amount' => 'nullable|numeric|min:0',
            'reward_description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $goal = SalesGoal::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        $goal->updateProgress();

        return redirect()->route('sales-goals.index')->with('message', 'Objetivo creado correctamente');
    }

    public function update(Request $request, $id)
    {
        $goal = SalesGoal::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:individual,team',
            'user_id' => 'required_if:type,individual|nullable|exists:tenant_users,id',
            'team_name' => 'required_if:type,team|nullable|string|max:255',
            'team_user_ids' => 'required_if:type,team|nullable|array',
            'team_user_ids.*' => 'exists:tenant_users,id',
            'period_type' => 'required|in:monthly,quarterly,yearly',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'target_amount' => 'required|numeric|min:0',
            'target_units' => 'nullable|integer|min:0',
            'reward_amount' => 'nullable|numeric|min:0',
            'reward_description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $goal->update($validated);
        $goal->updateProgress();

        return redirect()->route('sales-goals.index')->with('message', 'Objetivo actualizado correctamente');
    }

    public function destroy($id)
    {
        $goal = SalesGoal::findOrFail($id);
        $goal->delete();

        return redirect()->route('sales-goals.index')->with('message', 'Objetivo eliminado correctamente');
    }

    public function updateProgress($id)
    {
        $goal = SalesGoal::findOrFail($id);
        $goal->updateProgress();

        return redirect()->back()->with('message', 'Progreso actualizado correctamente');
    }

    public function updateAllProgress()
    {
        $goals = SalesGoal::active()->current()->get();

        foreach ($goals as $goal) {
            $goal->updateProgress();
        }

        return redirect()->back()->with('message', 'Todos los objetivos actualizados correctamente');
    }

    // Rankings y estadísticas para dashboard
    public function salesRankings(Request $request)
    {
        $period = $request->input('period', 'monthly'); // monthly, yearly
        $date = $request->input('date', now()->format('Y-m'));

        if ($period === 'monthly') {
            $startDate = Carbon::createFromFormat('Y-m', $date)->startOfMonth();
            $endDate = Carbon::createFromFormat('Y-m', $date)->endOfMonth();
        } else {
            $year = $request->input('date', now()->year);
            $startDate = Carbon::createFromDate($year)->startOfYear();
            $endDate = Carbon::createFromDate($year)->endOfYear();
        }

        // Ranking de ventas por comercial
        $salesRanking = Budget::selectRaw('user_id, COUNT(*) as total_sales, SUM(total) as total_amount')
            ->where('status', 'accepted')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('user_id')
            ->with('user:id,name,last_name')
            ->orderByDesc('total_amount')
            ->get()
            ->map(function($item, $index) {
                return [
                    'rank' => $index + 1,
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name . ' ' . $item->user->last_name,
                    'total_sales' => $item->total_sales,
                    'total_amount' => $item->total_amount,
                    'average_sale' => $item->total_sales > 0 ? round($item->total_amount / $item->total_sales, 2) : 0,
                ];
            });

        // Ranking de mejor valorados
        $ratingsRanking = Budget::selectRaw('user_id, COUNT(*) as total_ratings, AVG(client_rating) as average_rating')
            ->where('status', 'accepted')
            ->whereNotNull('client_rating')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('user_id')
            ->with('user:id,name,last_name')
            ->orderByDesc('average_rating')
            ->get()
            ->map(function($item, $index) {
                return [
                    'rank' => $index + 1,
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name . ' ' . $item->user->last_name,
                    'total_ratings' => $item->total_ratings,
                    'average_rating' => round($item->average_rating, 2),
                ];
            });

        // Objetivos actuales
        $currentGoals = SalesGoal::active()
            ->current()
            ->with(['user', 'creator'])
            ->get()
            ->map(function($goal) {
                $goal->progress_percentage = $goal->getProgressPercentage();
                $goal->units_progress_percentage = $goal->getUnitsProgressPercentage();
                $goal->is_achieved = $goal->isAchieved();
                return $goal;
            });

        return Inertia::render('Tenant/Dashboard/Rankings', [
            'salesRanking' => $salesRanking,
            'ratingsRanking' => $ratingsRanking,
            'currentGoals' => $currentGoals,
            'period' => $period,
            'date' => $date,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
        ]);
    }

    // Dashboard de progreso individual
    public function myProgress()
    {
        $user = auth()->user();

        // Objetivos individuales del usuario
        $myGoals = SalesGoal::where('user_id', $user->id)
            ->orWhereRaw("? = ANY(team_user_ids::int[])", [$user->id])
            ->active()
            ->current()
            ->get()
            ->map(function($goal) {
                $goal->progress_percentage = $goal->getProgressPercentage();
                $goal->units_progress_percentage = $goal->getUnitsProgressPercentage();
                $goal->is_achieved = $goal->isAchieved();
                $goal->remaining_amount = $goal->getRemainingAmount();
                $goal->remaining_units = $goal->getRemainingUnits();
                return $goal;
            });

        // Estadísticas del mes actual
        $currentMonth = now();
        $monthSales = Budget::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->whereBetween('created_at', [$currentMonth->copy()->startOfMonth(), $currentMonth->copy()->endOfMonth()])
            ->selectRaw('COUNT(*) as total_sales, SUM(total) as total_amount')
            ->first();

        // Estadísticas del año actual
        $currentYear = now()->year;
        $yearSales = Budget::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->whereYear('created_at', $currentYear)
            ->selectRaw('COUNT(*) as total_sales, SUM(total) as total_amount')
            ->first();

        // Valoración promedio
        $averageRating = Budget::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->whereNotNull('client_rating')
            ->avg('client_rating');

        return Inertia::render('Tenant/Dashboard/MyProgress', [
            'myGoals' => $myGoals,
            'monthSales' => [
                'total_sales' => $monthSales->total_sales ?? 0,
                'total_amount' => $monthSales->total_amount ?? 0,
            ],
            'yearSales' => [
                'total_sales' => $yearSales->total_sales ?? 0,
                'total_amount' => $yearSales->total_amount ?? 0,
            ],
            'averageRating' => $averageRating ? round($averageRating, 2) : null,
        ]);
    }
}
