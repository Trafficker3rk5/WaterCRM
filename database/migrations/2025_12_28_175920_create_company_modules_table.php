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
        Schema::create('company_modules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id'); // Empresa
            $table->enum('module', [
                'wallet',              // Módulo monedero
                'geolocation',         // Geolocalización
                'contracts',           // Contratos configurables
                'internal_messages',   // Mensajes internos
                'incidents',           // Incidencias
                'expenses',            // Gastos comerciales
                'documents',           // Gestión documental
                'kpi_dashboard',       // Dashboard KPIs
                'wordpress_plugin',    // Plugin WordPress
                'price_locking'        // Precios bloqueados
            ]); // Módulo
            $table->boolean('is_active')->default(true); // Activo
            $table->json('config')->nullable(); // Configuración específica del módulo
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique(['company_id', 'module']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_modules');
    }
};
