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
        Schema::create('budget_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('budget_id');
            $table->boolean('installation')->default(false);
            $table->decimal('installation_cost', 10, 2)->nullable()->default(0);
            $table->decimal('init_amount', 10, 2)->nullable()->default(0);
            $table->decimal('last_amount', 10, 2)->nullable()->default(0);
            $table->tinyInteger('type')->default(0);
            $table->integer('maintenance')->default(0);
            $table->unsignedBigInteger('extra_id')->nullable();
            $table->integer('dues')->nullable()->default(1);
            $table->decimal('price', 10, 2)->nullable()->default(0);
            $table->decimal('discount', 10, 2)->nullable()->default(0);
            $table->string('notes', 500)->nullable();
            $table->boolean('iva')->default(false);
            $table->tinyInteger('status')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_details');
    }
};
