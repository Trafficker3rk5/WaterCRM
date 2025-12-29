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
        Schema::create('email_campaign_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campaign_id');
            $table->unsignedBigInteger('client_id');
            $table->string('recipient_email');
            $table->string('recipient_name')->nullable();

            // Status tracking
            $table->enum('status', ['queued', 'sent', 'failed', 'bounced'])->default('queued');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('first_clicked_at')->nullable();

            // Error handling
            $table->text('error_message')->nullable();

            // Tracking
            $table->integer('open_count')->default(0); // Multiple opens
            $table->integer('click_count')->default(0); // Multiple clicks
            $table->string('tracking_token')->unique(); // For pixel tracking

            // Device/Location info (optional, captured on open)
            $table->string('user_agent')->nullable();
            $table->string('ip_address')->nullable();

            $table->timestamps();

            // Foreign keys
            $table->foreign('campaign_id')->references('id')->on('email_campaigns')->onDelete('cascade');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');

            // Indexes for performance
            $table->index('tracking_token');
            $table->index(['campaign_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_campaign_logs');
    }
};
