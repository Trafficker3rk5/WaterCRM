<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Tenant\CommonNote;
use Illuminate\Http\Request;

class CommonNoteController extends Controller
{
    public function list(Request $request, $type, $tid)
    {
        $data = CommonNote::where('type', $type)->where('type_id', $tid)->orderBy('created_at', 'desc')->get()->map(function($nt){
            $nt->created_date = Lerph::showDateTime($nt->created_at->timestamp);
            $nt->user_name = $nt->user->full_name;
            return $nt;
        });
        
        return $data;
    }

    public function store(Request $request)
    {
        $this->validateForm($request);
        $note = new CommonNote($request->only(['notes', 'type', 'type_id', 'user_id']));
        $note->save();
        return redirect()->back()->with('message', 'Nota creada correctamente.');
    }

    public function destroy(CommonNote $notes)
    {
        $notes->delete();
        return redirect()->back()->with('message', 'Notas borradas correctamente.');
    }

    private function validateForm(Request $request){
        $val = ['notes' => 'required']; 
        return $request->validate($val);
    }
}
