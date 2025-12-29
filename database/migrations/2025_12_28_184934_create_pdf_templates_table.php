<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pdf_templates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('name'); // Nombre de la plantilla
            $table->enum('type', ['budget', 'invoice', 'contract', 'custom'])->default('budget');
            $table->longText('html_content'); // HTML de la plantilla
            $table->json('variables')->nullable(); // Variables disponibles
            $table->string('logo')->nullable(); // Logo de la empresa
            $table->json('colors')->nullable(); // Colores personalizados
            $table->json('styles')->nullable(); // Estilos CSS adicionales
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pdf_templates');
    }
};
