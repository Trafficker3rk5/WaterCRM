<?php

namespace App\Models\Central;

use App\Models\Tenant\Client;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EmailCampaignLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'client_id',
        'recipient_email',
        'recipient_name',
        'status',
        'sent_at',
        'opened_at',
        'first_clicked_at',
        'error_message',
        'open_count',
        'click_count',
        'tracking_token',
        'user_agent',
        'ip_address',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'first_clicked_at' => 'datetime',
        'open_count' => 'integer',
        'click_count' => 'integer',
    ];

    /**
     * Boot method to generate tracking token
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($log) {
            if (empty($log->tracking_token)) {
                $log->tracking_token = Str::random(32);
            }
        });
    }

    /**
     * Relationships
     */
    public function campaign()
    {
        return $this->belongsTo(EmailCampaign::class, 'campaign_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Mark as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark as failed
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Track email open
     */
    public function trackOpen(?string $userAgent = null, ?string $ipAddress = null): void
    {
        $data = [
            'open_count' => $this->open_count + 1,
        ];

        if (is_null($this->opened_at)) {
            $data['opened_at'] = now();
            $data['user_agent'] = $userAgent;
            $data['ip_address'] = $ipAddress;
        }

        $this->update($data);

        // Update campaign stats
        $this->campaign->updateStats();
    }

    /**
     * Track link click
     */
    public function trackClick(): void
    {
        $data = [
            'click_count' => $this->click_count + 1,
        ];

        if (is_null($this->first_clicked_at)) {
            $data['first_clicked_at'] = now();
        }

        $this->update($data);

        // Update campaign stats
        $this->campaign->updateStats();
    }

    /**
     * Check if email was opened
     */
    public function wasOpened(): bool
    {
        return !is_null($this->opened_at);
    }

    /**
     * Check if links were clicked
     */
    public function hadClicks(): bool
    {
        return !is_null($this->first_clicked_at);
    }
}
