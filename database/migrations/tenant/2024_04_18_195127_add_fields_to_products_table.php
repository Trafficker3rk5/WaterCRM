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
            $table->string('inner_prices', 1000)->nullable();
            $table->string('inner_name', 200)->nullable();
            $table->integer('inner_stock')->nullable();
            $table->integer('inner_stock_min')->nullable();
            $table->integer('inner_stock_max')->nullable();
            $table->boolean('inner_active')->nullable()->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
            $table->dropColumn('inner_prices');
            $table->dropColumn('inner_name');
            $table->dropColumn('inner_stock');
            $table->dropColumn('inner_stock_min');
            $table->dropColumn('inner_stock_max');
            $table->dropColumn('inner_active');
        });
    }
};
