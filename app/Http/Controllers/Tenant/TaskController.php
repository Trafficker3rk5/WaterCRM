<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Tenant\Catalog;
use App\Models\Tenant\Client;
use App\Models\Tenant\Task;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        $cl = request()->input('cid');
        $st = request()->input('st');
        $back = request()->input('back');
        
        $clients = Client::get()->map(function($t) use ($cl){
            $t->label = $t->full_name;
            $t->value = $t->id;
            $t->selected = $t->id == $cl;
            return $t;
        });
        
        $filters = [];
        $filters[] = ['label' => 'Buscar', 'type' => 'text', 'name' => 'q'];
        $filters[] = [
            'label' => 'Estado', 
            'options' => [
                ['value' => 0, 'label' => 'Pendiente', 'selected' => $st == 0], 
                ['value' => 1, 'label' => 'Completada', 'selected' => $st == 1], 
                ['value' => 2, 'label' => 'Cancelada', 'selected' => $st == 2]],
            'type' => 'select', 
            'name' => 'st'
        ];
        $filters[] = ['label' => 'Tipo', 'options' => Catalog::select('name as label', 'id as value')->where('type', 6)->get(), 'type' => 'select', 'name' => 'type'];
        $filters[] = ['label' => 'Cliente', 'options' => $clients, 'type' => 'select', 'name' => 'cid'];
        $filters[] = ['label' => 'Fecha Desde', 'type' => 'date', 'name' => 'from'];
        $filters[] = ['label' => 'Fecha Hasta', 'type' => 'date', 'name' => 'to'];

        return Inertia::render('Tenant/Tasks/Task', [
            'title' => 'Tareas',
            'filters' => $filters,
            'filtered' => [
                'cl' => $cl,
                'st' => $st,
            ],
            'back' => $back
        ]);
    }

    public function edit($task)
    {
        $clients = Client::get()->map(function($t){
            $t->label = $t->full_name;
            $t->value = $t->id;
            $t->addresses = $t->addresses->map(function($a){
                $a->label = $a->full_address;
                $a->value = $a->id;
                return $a;
            });
            return $t;
        });

        $users = TenantUser::select('name as label', 'last_name', 'id as value')->get()->map(function($t){
            $t->label = $t->label . ' ' . $t->last_name;
            return $t;
        });

        $task = Task::find($task);
        return [
            'task' => $task ? $task : new Task(), 
            'types' => Catalog::select('name as label', 'id as value')->where('type', 6)->get(),
            'clients' => $clients,
            'users' => $users,
            'appreciations' => Catalog::select('name as label', 'id as value')->where('type', 7)->get()
        ];
    }

    public function list(Request $request)
    {
        $tasks = Task::query();
        if ($request->has('q') && $request->q !== null){
            $tasks->where(function ($query) use ($request){
                $query->where('title', 'ilike', '%'. $request->q .'%')
                    ->orWhere('description', 'ilike', '%'. $request->q .'%');
            });
        }
        if ($request->has('st') && $request->st !== null) $tasks->where('status', $request->st);
        if ($request->has('type') && $request->type !== null) $tasks->where('type_id', $request->type);
        if ($request->has('cid') && $request->cid !== null) $tasks->where('client_id', $request->cid);
        if ($request->has('from') && $request->from !== null) $tasks->where('date', '>=', $request->from);
        if ($request->has('to') && $request->to !== null) $tasks->where('date', '<=', $request->to);
        
        $data = $tasks->get()->map(function($t){
            $t->date = Lerph::showDateTime($t->date).' - '.Lerph::showDateTime($t->date_end);
            $t->client_full_name = $t->client->full_name ?? '';
            $t->type;
            return $t;
        });
        
        return $data;
    }

    public function store(Request $request)
    {
       $valid = $this->validateForm($request, $request->id);

        if ($valid){
            if (empty($request->id)) $task = new Task($request->except(['id']));
            else {
                $task = Task::find($request->id);
                if ($task) $task->fill($request->only([
                    'title',
                    'description',
                    'type_id',
                    'client_id',
                    'address_id',
                    'assigned_to',
                    'date',
                    'date_end',
                    'status',
                    'appreciation_id'
                ]));
                else $task = new Task($request->except(['id']));
            }
            $task->save();

            return redirect()->back()->with('message', 'Datos guardados correctamente.');
        }
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->back()->with('message', 'Datos guardados correctamente.');
    }

    public function changeStatus(Request $request, $tid)
    {
        $task = Task::find($tid);
        $task->status = $request->status;
        $task->appreciation_id = $request->input('appreciation_id', null);
        $task->save();
        return redirect()->back()->with('message', 'Datos guardados correctamente.');
    }

    private function validateForm(Request $request, $id){

        return $request->validate([
            'assigned_to' => 'required',
            //'date' => 'required|after_or_equal:now',
            'date_end' => 'required|after_or_equal:date',
            'title' => 'required|string|max:190',
            'description' => 'nullable|string|max:500',
        ],
        [],
        [
            'assigned_to' => 'asignado a',
            //'date' => 'fecha',
            'date_end' => 'fecha de finalización',
            'title' => 'título',
            'description' => 'descripción',
        ]);
    }
}
