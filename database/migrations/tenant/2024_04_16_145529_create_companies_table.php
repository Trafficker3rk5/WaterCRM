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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('domain', 255);
            $table->string('name', 255);
            $table->string('business_name', 255);
            $table->string('cif', 100);
            $table->string('logo', 100)->nullable();
            $table->string('email', 100);
            $table->string('address', 255)->nullable();
            $table->string('fiscal_address', 100)->nullable();
            $table->decimal('price', 10, 2);
            $table->tinyInteger('status')->default(1);
            $table->string('products', 1000)->nullable();
            $table->string('users', 2000)->nullable();
            $table->string('tenant_id', 191)->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
