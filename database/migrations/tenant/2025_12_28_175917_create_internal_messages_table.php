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
        Schema::create('internal_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('from_user_id'); // Remitente
            $table->unsignedBigInteger('to_user_id'); // Destinatario
            $table->string('subject'); // Asunto
            $table->text('body'); // Cuerpo del mensaje
            $table->boolean('is_read')->default(false); // Leído
            $table->timestamp('read_at')->nullable(); // Fecha de lectura
            $table->unsignedBigInteger('client_id')->nullable(); // Cliente relacionado (si aplica)
            $table->timestamps();

            $table->foreign('from_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('to_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internal_messages');
    }
};
