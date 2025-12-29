<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Central\AdminCatalog;
use App\Models\Central\Company;
use App\Models\Central\Product;
use App\Models\Central\SparePart;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Storage;

class FileController extends Controller
{
    public function uploadFile(Request $request, $type){
        $added = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $name = $file->getClientOriginalName();
                $file->storeAs('', $name, 'tmp');
                $added[] = [
                    'name' => $name,
                    'size' => $file->getSize(),
                    'type' => $type,
                    'url' => Storage::disk('tmp')->url($name),
                ];
            }
        }

        return redirect()->back()->with('files', $added);
    }
}
