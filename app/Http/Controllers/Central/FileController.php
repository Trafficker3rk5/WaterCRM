<?php

namespace App\Http\Controllers\Central;

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
                $stored = $file->storeAs('', $name, 'tmp');
                
                if ($stored) {
                    // Use current request domain if available, otherwise fall back to APP_URL
                    try {
                        $baseUrl = $request->getSchemeAndHttpHost();
                    } catch (\Exception $e) {
                        $baseUrl = env('APP_URL', 'https://waascrm.com');
                    }
                    
                    $added[] = [
                        'name' => $name,
                        'size' => $file->getSize(),
                        'type' => $type,
                        'url' => rtrim($baseUrl, '/') . '/storage/tmp/' . $name,
                    ];
                }
            }
        }

        return redirect()->back()->with('files', $added);
    }
}
