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
        Schema::create('product_featured_attributes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id'); // Producto
            $table->string('title'); // Título del atributo (texto corto)
            $table->string('icon_image')->nullable(); // Imagen/icono del atributo
            $table->integer('order')->default(0); // Orden de visualización (máx 6)
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_featured_attributes');
    }
};
