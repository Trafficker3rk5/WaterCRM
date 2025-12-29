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
        Schema::table('clients', function (Blueprint $table) {
            //
            $table->unsignedBigInteger('activity_id')->nullable();
            $table->string('business_name')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            //
            $table->dropColumn('activity_id');
            $table->dropColumn('business_name');
            $table->dropColumn('assigned_to');
        });
    }
};
