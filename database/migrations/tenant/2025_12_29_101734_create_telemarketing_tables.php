<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Telemarketing Module Tables:
     * - call_lists: CSV uploads of call lists
     * - calls: Individual call records
     * - call_notes: Notes for each call
     */
    public function up(): void
    {
        // Call Lists - Uploaded CSV lists
        Schema::create('call_lists', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->integer('total_records')->default(0);
            $table->integer('processed_records')->default(0);
            $table->integer('successful_calls')->default(0);
            $table->integer('failed_calls')->default(0);
            $table->integer('pending_calls')->default(0);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('assigned_to')->nullable(); // Jefe TMK or specific TMK
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
        });

        // Calls - Individual call records
        Schema::create('calls', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('call_list_id')->nullable();
            $table->unsignedBigInteger('assigned_to'); // TMK user

            // Contact information
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->string('contact_email')->nullable();
            $table->string('contact_company')->nullable();
            $table->string('contact_position')->nullable();
            $table->text('contact_address')->nullable();
            $table->string('contact_city')->nullable();
            $table->string('contact_province')->nullable();
            $table->string('contact_postal_code')->nullable();

            // Call status
            $table->enum('status', [
                'pending',           // Pendiente de llamar
                'in_progress',       // Llamando ahora
                'contacted',         // Contactado exitosamente
                'no_answer',         // No contesta
                'busy',              // Ocupado
                'voicemail',         // Buzón de voz
                'wrong_number',      // Número equivocado
                'not_interested',    // No interesado
                'interested',        // Interesado
                'callback',          // Volver a llamar
                'converted_contact', // Convertido a contacto
                'converted_client',  // Convertido a cliente
                'do_not_call'        // No volver a llamar
            ])->default('pending');

            // Call details
            $table->integer('attempts')->default(0);
            $table->timestamp('last_call_at')->nullable();
            $table->timestamp('next_call_at')->nullable();
            $table->integer('call_duration')->nullable(); // seconds

            // Interest level
            $table->enum('interest_level', ['none', 'low', 'medium', 'high', 'very_high'])->nullable();
            $table->string('interested_in')->nullable(); // What product/service

            // Conversion
            $table->unsignedBigInteger('converted_to_client_id')->nullable();
            $table->timestamp('converted_at')->nullable();

            // Priority
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');

            // Custom fields from CSV
            $table->json('custom_data')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('call_list_id')->references('id')->on('call_lists')->onDelete('set null');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('converted_to_client_id')->references('id')->on('clients')->onDelete('set null');

            $table->index('status');
            $table->index('assigned_to');
            $table->index('next_call_at');
        });

        // Call Notes - Notes for each call attempt
        Schema::create('call_notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('call_id');
            $table->unsignedBigInteger('user_id'); // TMK who made the note
            $table->enum('call_outcome', [
                'answered',
                'no_answer',
                'busy',
                'voicemail',
                'wrong_number',
                'callback_requested',
                'interested',
                'not_interested',
                'other'
            ]);
            $table->text('notes');
            $table->timestamp('called_at');
            $table->integer('call_duration')->nullable(); // seconds
            $table->timestamps();

            $table->foreign('call_id')->references('id')->on('calls')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Call Scripts - Pre-defined scripts for TMKs
        Schema::create('call_scripts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('opening')->nullable(); // Opening script
            $table->text('pitch')->nullable(); // Main pitch
            $table->text('objection_handling')->nullable(); // Handle objections
            $table->text('closing')->nullable(); // Closing script
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('call_notes');
        Schema::dropIfExists('calls');
        Schema::dropIfExists('call_scripts');
        Schema::dropIfExists('call_lists');
    }
};
