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
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Usuario (comercial o técnico)
            $table->decimal('balance', 10, 2)->default(0); // Saldo actual
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wallet_id');
            $table->enum('type', ['income', 'outcome']); // Ingreso o salida
            $table->decimal('amount', 10, 2); // Cantidad
            $table->enum('payment_method', ['cash', 'card', 'transfer']); // Forma de pago
            $table->enum('concept', ['deposit', 'payment', 'delivery']); // Concepto: fianza, pago de factura, entrega a administrador
            $table->text('description')->nullable(); // Descripción adicional
            $table->unsignedBigInteger('created_by'); // Quién registró la transacción
            $table->unsignedBigInteger('budget_id')->nullable(); // Presupuesto relacionado (si aplica)
            $table->timestamps();

            $table->foreign('wallet_id')->references('id')->on('wallets')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('budget_id')->references('id')->on('budgets')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};
