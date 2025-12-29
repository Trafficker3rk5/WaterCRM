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
        Schema::create('extra_variables', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('value')->nullable();
            $table->tinyInteger('module')->default(1);
        });

        DB::table('extra_variables')->insert([
            ['name' => 'HORECA_TYPES', 'value' => '1', 'module' => 1],
            ['name' => 'HORECA_KW_PRICE', 'value' => '0.17', 'module' => 1],
            ['name' => 'HORECA_KW_DISPENCER', 'value' => '0.3', 'module' => 1],
            ['name' => 'HORECA_KW_DISHWASHER', 'value' => '2.8', 'module' => 1],
            ['name' => 'HORECA_LTS_PRICE', 'value' => '0.975', 'module' => 1],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('extra_variables');
    }
};
