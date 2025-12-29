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
        Schema::table('installations', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('address_id'); // Latitud
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude'); // Longitud
            $table->decimal('open_latitude', 10, 8)->nullable()->after('longitude'); // Latitud al abrir parte
            $table->decimal('open_longitude', 11, 8)->nullable()->after('open_latitude'); // Longitud al abrir parte
            $table->timestamp('opened_at')->nullable()->after('open_longitude'); // Fecha/hora de apertura
            $table->boolean('geofence_verified')->default(false)->after('opened_at'); // Si se verificó la ubicación
            $table->decimal('close_latitude', 10, 8)->nullable()->after('geofence_verified'); // Latitud al cerrar parte
            $table->decimal('close_longitude', 11, 8)->nullable()->after('close_latitude'); // Longitud al cerrar parte
            $table->timestamp('closed_at')->nullable()->after('close_longitude'); // Fecha/hora de cierre
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('installations', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'open_latitude',
                'open_longitude',
                'opened_at',
                'geofence_verified',
                'close_latitude',
                'close_longitude',
                'closed_at'
            ]);
        });
    }
};
