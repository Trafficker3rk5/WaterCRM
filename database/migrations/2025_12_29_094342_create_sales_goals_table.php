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
        Schema::create('sales_goals', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre del objetivo
            $table->text('description')->nullable();
            $table->enum('type', ['individual', 'team'])->default('individual');
            $table->unsignedBigInteger('user_id')->nullable(); // Para objetivos individuales
            $table->string('team_name')->nullable(); // Para objetivos de equipo
            $table->json('team_user_ids')->nullable(); // IDs de usuarios del equipo
            $table->enum('period_type', ['monthly', 'quarterly', 'yearly'])->default('monthly');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('target_amount', 15, 2); // Objetivo en euros
            $table->integer('target_units')->nullable(); // Objetivo en unidades vendidas
            $table->decimal('current_amount', 15, 2)->default(0); // Actual en euros
            $table->integer('current_units')->default(0); // Actual en unidades
            $table->decimal('reward_amount', 10, 2)->nullable(); // Premio por cumplir objetivo
            $table->text('reward_description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('tenant_users')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('tenant_users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_goals');
    }
};
