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
        Schema::table('products', function (Blueprint $table) {
            //
            $table->tinyInteger('gas')->default(0);
            $table->tinyInteger('worktop')->default(0);
            $table->tinyInteger('predosing')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
            $table->dropColumn('gas');
            $table->dropColumn('worktop');
            $table->dropColumn('predosing');
        });
    }
};
