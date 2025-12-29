<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\Installation;
use App\Models\Tenant\Task;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        return Inertia::render('Tenant/Tasks/Calendar', [
            'title' => 'Agenda',
            'users' => TenantUser::select('name as label', 'id as value')->get(),
        ]);
    }

    public function list(Request $request)
    {
        $tasks = Task::where('assigned_to', $request->input('uid'))->get();
        $data = [];
        foreach ($tasks as $task) {
            $data[] = [
                'id' => $task->id,
                'title' => $task->title,
                'start' => $task->date,
                'end' => $task->date_end,
                'type' => $task->type,
            ];
        }

        $installations = Installation::where('assigned_to', $request->input('uid'))->get();
        foreach ($installations as $installation) {
            $data[] = [
                'id' => 0,
                'title' => $installation->product->name,
                'start' => $installation->installation_date,
                'end' => $installation->installation_date,
                'type' => 2,
            ];
        }

        return $data;
    }
}
