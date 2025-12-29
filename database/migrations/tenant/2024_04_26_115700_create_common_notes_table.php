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
        Schema::create('common_notes', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('type')->default(0);
            $table->unsignedBigInteger('type_id');
            $table->unsignedBigInteger('created_by');
            $table->string('notes', 1000);
            $table->unsignedBigInteger('extra_int')->nullable();
            $table->string('extra_string', 500)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('common_notes');
    }
};
