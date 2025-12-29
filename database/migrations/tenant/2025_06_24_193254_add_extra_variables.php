<?php

use App\Models\Tenant\ExtraVariable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
        ExtraVariable::create([
            'name' => 'WAAS_API_ENABLED',
            'value' => '',
            'module' => 2,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        ExtraVariable::where('name', 'WAAS_API_ENABLED')->delete();
    }
};
