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
        Schema::create('installations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('budget_detail_id');
            $table->unsignedBigInteger('address_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->dateTime('installation_date')->nullable();
            $table->tinyInteger('hours')->nullable();
            $table->string('notes', 1000)->nullable();
            $table->string('installation_notes', 1000)->nullable();
            $table->string('client_name')->nullable();
            $table->string('client_dni')->nullable();
            $table->string('client_sign')->nullable();
            $table->string('serial_number')->nullable();
            $table->boolean('finished')->nullable()->default(false);
            $table->string('finished_reason')->nullable();
            $table->tinyInteger('next_maintenance')->nullable();

            $table->boolean('is_maintenance')->nullable()->default(false);
            $table->tinyInteger('status')->default(0); /// 0: Pendiente, 1: Realizado; 2: Canceled
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installations');
    }
};
