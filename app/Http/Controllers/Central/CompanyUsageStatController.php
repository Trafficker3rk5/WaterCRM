<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\CompanyUsageStat;
use App\Models\Central\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompanyUsageStatController extends Controller
{
    /**
     * Display the usage stats and billing dashboard
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $companies = Company::where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Central/UsageStats/Index', [
            'auth' => ['user' => $user],
            'companies' => $companies,
        ]);
    }

    /**
     * Get usage stats for a specific company
     */
    public function getCompanyStats($companyId)
    {
        $stats = CompanyUsageStat::where('company_id', $companyId)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        return response()->json($stats);
    }

    /**
     * Get current month stats for a company
     */
    public function getCurrentStats($companyId)
    {
        $stat = CompanyUsageStat::where('company_id', $companyId)
            ->where('month', now()->month)
            ->where('year', now()->year)
            ->first();

        if (!$stat) {
            return response()->json([
                'message' => 'No stats recorded for current month',
                'stats' => null,
            ], 404);
        }

        return response()->json($stat);
    }

    /**
     * Record or update usage stats
     */
    public function recordUsage(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'users_total' => 'nullable|integer|min:0',
            'users_active' => 'nullable|integer|min:0',
            'storage_used_mb' => 'nullable|integer|min:0',
            'api_calls' => 'nullable|integer|min:0',
            'modules_active' => 'nullable|array',
            'installations_count' => 'nullable|integer|min:0',
            'budgets_created' => 'nullable|integer|min:0',
            'messages_sent' => 'nullable|integer|min:0',
            'expenses_processed' => 'nullable|integer|min:0',
            'incidents_created' => 'nullable|integer|min:0',
            'clients_created' => 'nullable|integer|min:0',
        ]);

        $stat = CompanyUsageStat::recordUsage($validated['company_id'], $validated);

        // Calculate cost automatically
        $stat->calculateCost();

        return response()->json([
            'message' => 'Usage recorded successfully',
            'stats' => $stat->fresh(),
        ], 201);
    }

    /**
     * Calculate and update cost for a specific month
     */
    public function calculateCost($id)
    {
        $stat = CompanyUsageStat::findOrFail($id);
        $cost = $stat->calculateCost();

        return response()->json([
            'message' => 'Cost calculated successfully',
            'calculated_cost' => $cost,
            'stats' => $stat->fresh(),
        ]);
    }

    /**
     * Get billing summary for all companies
     */
    public function getBillingSummary(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $summary = CompanyUsageStat::where('month', $month)
            ->where('year', $year)
            ->with('company')
            ->get()
            ->map(function ($stat) {
                return [
                    'company_id' => $stat->company_id,
                    'company_name' => $stat->company->name ?? 'N/A',
                    'month' => $stat->month,
                    'year' => $stat->year,
                    'users_total' => $stat->users_total,
                    'storage_used_gb' => round($stat->storage_used_mb / 1024, 2),
                    'modules_active' => count($stat->modules_active ?? []),
                    'calculated_cost' => $stat->calculated_cost,
                ];
            });

        $totalRevenue = $summary->sum('calculated_cost');

        return response()->json([
            'summary' => $summary,
            'total_revenue' => $totalRevenue,
            'month' => $month,
            'year' => $year,
        ]);
    }

    /**
     * Get usage trends for a company
     */
    public function getTrends($companyId, Request $request)
    {
        $months = $request->input('months', 6);

        $stats = CompanyUsageStat::where('company_id', $companyId)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit($months)
            ->get()
            ->reverse()
            ->values();

        $trends = [
            'labels' => [],
            'users' => [],
            'storage_gb' => [],
            'api_calls' => [],
            'cost' => [],
        ];

        foreach ($stats as $stat) {
            $trends['labels'][] = $stat->month . '/' . $stat->year;
            $trends['users'][] = $stat->users_active;
            $trends['storage_gb'][] = round($stat->storage_used_mb / 1024, 2);
            $trends['api_calls'][] = $stat->api_calls;
            $trends['cost'][] = (float) $stat->calculated_cost;
        }

        return response()->json($trends);
    }

    /**
     * Export usage data to CSV
     */
    public function exportCsv(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $stats = CompanyUsageStat::where('month', $month)
            ->where('year', $year)
            ->with('company')
            ->get();

        $csv = "Company,Month,Year,Total Users,Active Users,Storage (GB),API Calls,Modules,Cost\n";

        foreach ($stats as $stat) {
            $csv .= sprintf(
                "%s,%d,%d,%d,%d,%.2f,%d,%d,%.2f\n",
                $stat->company->name ?? 'N/A',
                $stat->month,
                $stat->year,
                $stat->users_total,
                $stat->users_active,
                $stat->storage_used_mb / 1024,
                $stat->api_calls,
                count($stat->modules_active ?? []),
                $stat->calculated_cost
            );
        }

        return response($csv, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="usage_stats_' . $month . '_' . $year . '.csv"');
    }

    /**
     * Automatically collect current usage for a company
     */
    public function collectUsage($companyId)
    {
        $company = Company::findOrFail($companyId);

        // This would be called by a scheduled task
        // Collect actual usage data from the system
        $usageData = [
            'users_total' => $this->countTotalUsers($companyId),
            'users_active' => $this->countActiveUsers($companyId),
            'storage_used_mb' => $this->calculateStorageUsed($companyId),
            'api_calls' => $this->countApiCalls($companyId),
            'modules_active' => $this->getActiveModules($companyId),
            'installations_count' => $this->countInstallations($companyId),
            'budgets_created' => $this->countBudgets($companyId),
            'messages_sent' => $this->countMessages($companyId),
            'expenses_processed' => $this->countExpenses($companyId),
            'incidents_created' => $this->countIncidents($companyId),
            'clients_created' => $this->countClients($companyId),
        ];

        $stat = CompanyUsageStat::recordUsage($companyId, $usageData);
        $stat->calculateCost();

        return response()->json([
            'message' => 'Usage collected successfully',
            'stats' => $stat->fresh(),
        ]);
    }

    // Helper methods for collecting usage data
    private function countTotalUsers($companyId)
    {
        // This would query the tenant database
        // For now, return placeholder
        return 0;
    }

    private function countActiveUsers($companyId)
    {
        // Count users active in last 30 days
        return 0;
    }

    private function calculateStorageUsed($companyId)
    {
        // Calculate total file storage in MB
        return 0;
    }

    private function countApiCalls($companyId)
    {
        // Count API calls for current month
        return 0;
    }

    private function getActiveModules($companyId)
    {
        // Get list of active modules
        return [];
    }

    private function countInstallations($companyId)
    {
        // Count installations created this month
        return 0;
    }

    private function countBudgets($companyId)
    {
        // Count budgets created this month
        return 0;
    }

    private function countMessages($companyId)
    {
        // Count messages sent this month
        return 0;
    }

    private function countExpenses($companyId)
    {
        // Count expenses processed this month
        return 0;
    }

    private function countIncidents($companyId)
    {
        // Count incidents created this month
        return 0;
    }

    private function countClients($companyId)
    {
        // Count clients created this month
        return 0;
    }
}
