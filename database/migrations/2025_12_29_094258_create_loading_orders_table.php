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
        Schema::create('loading_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // Número de orden (ej: LO-2025-0001)
            $table->unsignedBigInteger('installer_warehouse_id'); // Furgoneta destino
            $table->unsignedBigInteger('source_warehouse_id')->nullable(); // Almacén de origen
            $table->unsignedBigInteger('created_by'); // Usuario que crea la orden
            $table->unsignedBigInteger('validated_by')->nullable(); // Jefe que valida
            $table->enum('status', ['pending', 'validated', 'loaded', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('loaded_at')->nullable();
            $table->string('validation_comments')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('installer_warehouse_id')->references('id')->on('installer_warehouses')->onDelete('cascade');
            $table->foreign('source_warehouse_id')->references('id')->on('warehouses')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('tenant_users')->onDelete('cascade');
            $table->foreign('validated_by')->references('id')->on('tenant_users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loading_orders');
    }
};
