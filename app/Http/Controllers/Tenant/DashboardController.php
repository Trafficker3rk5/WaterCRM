<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Central\Company;
use App\Models\Central\Product;
use App\Models\Central\SparePart;
use App\Models\Tenant\Budget;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\Installation;
use App\Models\Tenant\Task;
use App\Models\Tenant\TenantUser;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Storage;

class DashboardController extends Controller
{
    public function index(){

        

        return Inertia::render('Tenant/Dashboard', [
            'users' => TenantUser::select('name as label', 'id as value')->get(),
        ]);
    }

    public function stats(Request $request)
    {
        $uid = $request->input('uid');
        $sd = $request->input('sd');
        $ed = $request->input('ed');
        $simulate = $request->input('simulate', false);

        if (empty($sd)) $sd = date('Y-m-d', strtotime("-10 day"));
        if (empty($ed)) $ed = date('Y-m-d');
        if ($sd > $ed) return ['error' => 'La fecha de inicio no puede ser mayor a la fecha final'];
        if (Lerph::diffDays($sd, $ed, 'Y-m-d') > 30) return ['error' => 'El rango de fechas no puede ser mayor a 30 días'];

        $dates = Lerph::getDatesFromRange($sd, $ed);

        $labels = $total = $accepted = $rejected = $filterStats = [];

        $budgetQuery = Budget::query();
        if (!empty($uid)) $budgetQuery->where('created_by', $uid);

        foreach ($dates as $date){
            $labels[] = Lerph::parseDate($date, 'd/m');
            if ($simulate){
                $x = rand(1, 10);
                $y = rand(1, 10);
                $t = $x + $y + rand(1, 3);
            }else {
                $x = $budgetQuery->whereDate('created_at', $date)->where('status', 1)->count();
                $y = $budgetQuery->whereDate('created_at', $date)->where('status', 2)->count();
                $t = $budgetQuery->whereDate('created_at', $date)->count();
            }
            $accepted[] = $x;
            $rejected[] = $y;
            $total[] = $t;
        }

        $chartData = [
            ['name' => 'Total Presupuestos','data' => $total],
            ['name' => 'Aceptados','data' => $accepted],
            ['name' => 'Rechazados','data' => $rejected]
        ];

        $filterStats['total'] = array_sum($total);
        $filterStats['accepted'] = array_sum($accepted);
        $filterStats['rejected'] = array_sum($rejected);
        $filterStats['convert'] = $filterStats['total'] > 0 ? round($filterStats['accepted'] * 100 / $filterStats['total'], 2) : 0;
        $filterStats['sd'] = Lerph::parseDate($sd, 'd/m');
        $filterStats['ed'] = Lerph::parseDate($ed, 'd/m');
        
        $data = [];
        if ($simulate){
            $filterStats['billed'] = rand(10000, 100000);

            $data['products'] = rand(1, 100);
            $data['clients'] = rand(1, 100);
            $data['tasks'] = rand(1, 100);
            $data['billed'] = rand(1, 100);

            $data['budgetsOk'] = rand(1, 100);
            $data['budgetsRej'] = rand(1, 100);
            $data['budgetsTotal'] = rand(1, 100);
            $data['budgetsPerc'] = $data['budgetsOk'] * 100 / $data['budgetsTotal'];
        }else {
            $budgetDetailsQuery = Budget::join('budget_details', 'budget_details.budget_id', 'budgets.id');
            if (!empty($uid)) $budgetDetailsQuery->where('budgets.created_by', $uid);

            $filterStats['billed'] = $budgetDetailsQuery->whereBetween('created_at', [$sd, $ed])->where('budget_details.status', 1)->sum('price');
        
            $data['products'] = $budgetDetailsQuery->where('budget_details.status', 1)->count();
            $data['clients'] = Client::count();
            $data['tasks'] = Task::count();
            $data['billed'] = $budgetDetailsQuery->where('budget_details.status', 1)->sum('price');

            $data['budgetsOk'] = $budgetQuery->where('status', 1)->count();
            $data['budgetsRej'] = $budgetQuery->where('status', 2)->count();
            $data['budgetsTotal'] = $budgetQuery->count();
            $data['budgetsPerc'] = $data['budgetsTotal'] > 0 ? round($data['budgetsOk'] * 100 / $data['budgetsTotal'], 2) : 0;
        }

        return ['stats' => $data, 'chartLabels' => $labels, 'chartData' => $chartData, 'filterStats' => $filterStats];
    }
}
