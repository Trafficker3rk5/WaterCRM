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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Comercial o técnico que registra el gasto
            $table->enum('type', ['food', 'fuel', 'hotel', 'parts', 'other']); // Tipo de gasto
            $table->decimal('amount', 10, 2); // Cantidad
            $table->string('supplier')->nullable(); // Proveedor (OCR o manual)
            $table->text('description')->nullable(); // Descripción
            $table->string('receipt_image'); // Imagen del ticket
            $table->boolean('ocr_processed')->default(false); // Si se procesó con OCR
            $table->text('ocr_data')->nullable(); // Datos del OCR en JSON
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // Estado
            $table->unsignedBigInteger('approved_by')->nullable(); // Quién aprobó
            $table->timestamp('approved_at')->nullable(); // Fecha de aprobación
            $table->date('expense_date'); // Fecha del gasto
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
