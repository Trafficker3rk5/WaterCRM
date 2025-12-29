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
        Schema::create('tenant_products', function (Blueprint $table) {
            $table->unsignedBigInteger('id');
            $table->string('inner_prices', 1000)->nullable();
            $table->string('inner_name', 200)->nullable();
            $table->integer('inner_stock')->nullable();
            $table->integer('inner_stock_min')->nullable();
            $table->integer('inner_stock_max')->nullable();
            $table->boolean('inner_active')->nullable()->default(1);
            $table->string('inner_model')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
