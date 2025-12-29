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
        Schema::create('contract_signatures', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('budget_id');
            $table->unsignedBigInteger('contract_id');
            $table->string('installer_signature')->nullable(); // Base64 encoded signature image
            $table->string('client_signature')->nullable(); // Base64 encoded signature image
            $table->timestamp('installer_signed_at')->nullable();
            $table->timestamp('client_signed_at')->nullable();
            $table->unsignedBigInteger('installer_signed_by')->nullable(); // User ID
            $table->unsignedBigInteger('client_signed_by')->nullable(); // Client user ID (if applicable)
            $table->string('pdf_path')->nullable(); // Generated contract PDF path
            $table->timestamps();

            $table->foreign('budget_id')->references('id')->on('budgets')->onDelete('cascade');
            $table->foreign('contract_id')->references('id')->on('contracts')->onDelete('cascade');
            $table->index('budget_id');
            $table->index('contract_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_signatures');
    }
};

