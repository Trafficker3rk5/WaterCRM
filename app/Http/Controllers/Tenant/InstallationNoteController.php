<?php

namespace App\Http\Controllers\Tenant;

use App\Helpers\Lerph;
use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Central\Product;
use App\Models\Central\SparePart;
use App\Models\Tenant\Installation;
use App\Models\Tenant\InstallationNote;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Storage;

class InstallationNoteController extends Controller
{
    public function list(Request $request, $iid)
    {
        $data = InstallationNote::where('installation_id', $iid)->orderBy('created_at', 'desc')->get()->map(function($nt){
            $nt->created_date = Lerph::showDateTime($nt->created_at->timestamp);
            $nt->user_name = $nt->user->full_name;
            return $nt;
        });
        
        return $data;
    }

    public function store(Request $request, $iid)
    {
        $this->validateForm($request);
        $installation = Installation::find($iid);
        $notes = $installation->notes()->create($request->only([
            'notes',
            'status',
            'new_date',
            'user_id'
        ]));

        ///Change status of installation
        if ($notes->status == 2 || $notes->status == 3) {
            $installation->status = $notes->status;
            if ($installation->status == 3) $installation->installation_date = $request->new_date;
            $installation->save();

            return redirect()->back()->with('message', 'Instalación actualizada correctamente.');
        }else return redirect()->back()->with('message', 'Nota creada correctamente.');
    }

    public function destroy(InstallationNote $notes)
    {
        $notes->delete();
        return redirect()->back()->with('message', 'Notas borradas correctamente.');
    }

    private function validateForm(Request $request){
        $val = ['notes' => 'required']; 
        if ($request->status == 3) $val['new_date'] = 'required|date_format:Y-m-d\TH:i|after_or_equal:now';

        return $request->validate($val);
    }
}
