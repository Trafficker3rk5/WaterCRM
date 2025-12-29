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
        Schema::create('loading_order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('loading_order_id');
            $table->unsignedBigInteger('product_id');
            $table->integer('quantity_requested'); // Cantidad solicitada
            $table->integer('quantity_loaded')->default(0); // Cantidad cargada
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('loading_order_id')->references('id')->on('loading_orders')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loading_order_items');
    }
};
