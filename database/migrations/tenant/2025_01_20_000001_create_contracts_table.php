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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');
            $table->string('name'); // Contract template name
            $table->enum('type', ['pdf', 'text'])->default('text'); // PDF upload or text editor
            $table->string('pdf_path')->nullable(); // Path to uploaded PDF
            $table->text('content')->nullable(); // Text content for text editor
            $table->json('field_mappings')->nullable(); // Field mappings: {"field_id": "our_field_name"}
            $table->json('signature_fields')->nullable(); // Signature positions: [{"type": "installer", "x": 100, "y": 200}, ...]
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->index('client_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};

