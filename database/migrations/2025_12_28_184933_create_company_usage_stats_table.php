<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_usage_stats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->integer('month'); // 1-12
            $table->integer('year'); // 2025, 2026, etc.
            
            // Usuarios
            $table->integer('users_total')->default(0);
            $table->integer('users_active')->default(0); // Activos en el mes
            
            // Almacenamiento
            $table->bigInteger('storage_used_mb')->default(0);
            
            // API
            $table->integer('api_calls')->default(0);
            
            // Módulos activos
            $table->json('modules_active')->nullable();
            
            // Actividad
            $table->integer('installations_count')->default(0);
            $table->integer('budgets_created')->default(0);
            $table->integer('messages_sent')->default(0);
            $table->integer('expenses_processed')->default(0);
            $table->integer('incidents_created')->default(0);
            $table->integer('clients_created')->default(0);
            
            // Facturación calculada
            $table->decimal('calculated_cost', 10, 2)->default(0);
            
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique(['company_id', 'month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_usage_stats');
    }
};
