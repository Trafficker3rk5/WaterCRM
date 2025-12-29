<?php

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
        DB::table('extra_variables')->insert([
            ['name' => 'WAAS_API_TOKEN', 'value' => '', 'module' => 2]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        DB::table('extra_variables')->where('name', 'WAAS_API_TOKEN')->delete();
    }
};
