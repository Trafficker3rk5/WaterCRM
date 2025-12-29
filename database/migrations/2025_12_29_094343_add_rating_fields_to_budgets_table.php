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
        Schema::table('budgets', function (Blueprint $table) {
            $table->integer('client_rating')->nullable()->after('status'); // Valoración del cliente (1-5)
            $table->text('client_feedback')->nullable()->after('client_rating'); // Comentarios del cliente
            $table->timestamp('rated_at')->nullable()->after('client_feedback');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropColumn(['client_rating', 'client_feedback', 'rated_at']);
        });
    }
};
