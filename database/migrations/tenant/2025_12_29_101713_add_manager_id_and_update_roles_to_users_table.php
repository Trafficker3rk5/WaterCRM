<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds manager_id for hierarchical structure (jefe -> subordinados)
     *
     * New Role Structure:
     * 0: Super Admin
     * 1: Admin
     * 2: Jefe Comercial
     * 3: Comercial
     * 4: Jefe de Instalación
     * 5: Instalador/Técnico
     * 6: Jefe TMK
     * 7: TMK (Telemarketing)
     * 8: Almacén
     * 9: Viewer
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add manager_id for hierarchical structure
            $table->unsignedBigInteger('manager_id')->nullable()->after('rol_id');
            $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');

            // Add index for better performance
            $table->index('manager_id');
            $table->index('rol_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropIndex(['manager_id']);
            $table->dropIndex(['rol_id']);
            $table->dropColumn('manager_id');
        });
    }
};
