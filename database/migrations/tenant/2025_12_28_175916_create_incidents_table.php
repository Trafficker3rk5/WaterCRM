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
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Título de la incidencia
            $table->text('description')->nullable(); // Descripción
            $table->enum('type', ['automatic', 'manual'])->default('manual'); // Tipo: automática o manual
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium'); // Prioridad
            $table->enum('status', ['pending', 'in_progress', 'resolved', 'closed'])->default('pending'); // Estado
            $table->unsignedBigInteger('assigned_to')->nullable(); // Usuario asignado
            $table->unsignedBigInteger('created_by'); // Quién creó la incidencia
            $table->unsignedBigInteger('client_id')->nullable(); // Cliente relacionado
            $table->unsignedBigInteger('budget_id')->nullable(); // Presupuesto relacionado
            $table->unsignedBigInteger('installation_id')->nullable(); // Instalación relacionada
            $table->timestamp('resolved_at')->nullable(); // Fecha de resolución
            $table->timestamps();

            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('budget_id')->references('id')->on('budgets')->onDelete('cascade');
            $table->foreign('installation_id')->references('id')->on('installations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
