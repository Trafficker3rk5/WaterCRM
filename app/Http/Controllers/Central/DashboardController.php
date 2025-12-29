<?php

namespace App\Http\Controllers\Central;

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
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Mail;
use Storage;

class DashboardController extends Controller
{
    public function index(){

        return Inertia::render('Dashboard');
    }

    public function testMail(){
        Mail::raw('Hello World!', function($msg) {$msg->to('test@test.com')->subject('Test Email'); });
        echo 'OK';
    }
}
