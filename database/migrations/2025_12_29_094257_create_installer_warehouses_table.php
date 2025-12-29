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
        Schema::create('installer_warehouses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Instalador
            $table->string('name'); // Nombre descriptivo (ej: "Furgoneta Principal - Juan")
            $table->string('vehicle_plate')->nullable(); // Matrícula del vehículo
            $table->string('vehicle_brand')->nullable(); // Marca del vehículo
            $table->string('vehicle_model')->nullable(); // Modelo del vehículo
            $table->integer('max_capacity')->nullable(); // Capacidad máxima en unidades
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('tenant_users')->onDelete('cascade');
            $table->unique(['user_id', 'vehicle_plate']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installer_warehouses');
    }
};
