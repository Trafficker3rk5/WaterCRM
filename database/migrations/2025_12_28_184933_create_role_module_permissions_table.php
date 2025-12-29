<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_module_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id'); // Empresa
            $table->integer('role_id'); // Rol (0-6)
            $table->string('module'); // Módulo (wallet, incidents, etc.)
            $table->boolean('can_view')->default(true);
            $table->boolean('can_create')->default(false);
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->boolean('can_approve')->default(false); // Para gastos, etc.
            $table->json('custom_config')->nullable(); // Configuración específica
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique(['company_id', 'role_id', 'module']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_module_permissions');
    }
};
