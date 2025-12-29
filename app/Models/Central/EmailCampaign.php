<?php

namespace App\Models\Central;

use App\Models\Tenant\Client;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailCampaign extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'name',
        'subject',
        'content',
        'template_id',
        'filters',
        'status',
        'scheduled_at',
        'sent_at',
        'total_recipients',
        'emails_sent',
        'emails_failed',
        'emails_opened',
        'links_clicked',
        'from_name',
        'from_email',
        'reply_to',
        'track_opens',
        'track_clicks',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'filters' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'track_opens' => 'boolean',
        'track_clicks' => 'boolean',
        'total_recipients' => 'integer',
        'emails_sent' => 'integer',
        'emails_failed' => 'integer',
        'emails_opened' => 'integer',
        'links_clicked' => 'integer',
    ];

    /**
     * Relationships
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function template()
    {
        return $this->belongsTo(EmailTemplate::class, 'template_id');
    }

    public function logs()
    {
        return $this->hasMany(EmailCampaignLog::class, 'campaign_id');
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get recipients based on filters
     */
    public function getRecipients()
    {
        $query = Client::where('company_id', $this->company_id);

        if ($this->filters) {
            // Apply filters
            foreach ($this->filters as $key => $value) {
                if (empty($value)) continue;

                switch ($key) {
                    case 'status':
                        $query->where('status', $value);
                        break;
                    case 'source':
                        $query->where('source', $value);
                        break;
                    case 'city':
                        $query->where('city', $value);
                        break;
                    case 'province':
                        $query->where('province', $value);
                        break;
                    case 'created_from':
                        $query->where('created_at', '>=', $value);
                        break;
                    case 'created_to':
                        $query->where('created_at', '<=', $value);
                        break;
                }
            }
        }

        // Only clients with valid email
        $query->whereNotNull('email')->where('email', '!=', '');

        return $query->get();
    }

    /**
     * Calculate statistics
     */
    public function calculateStats(): array
    {
        $total = $this->logs()->count();
        $sent = $this->logs()->where('status', 'sent')->count();
        $failed = $this->logs()->where('status', 'failed')->count();
        $opened = $this->logs()->whereNotNull('opened_at')->count();
        $clicked = $this->logs()->whereNotNull('first_clicked_at')->count();

        return [
            'total' => $total,
            'sent' => $sent,
            'failed' => $failed,
            'opened' => $opened,
            'clicked' => $clicked,
            'open_rate' => $sent > 0 ? round(($opened / $sent) * 100, 2) : 0,
            'click_rate' => $sent > 0 ? round(($clicked / $sent) * 100, 2) : 0,
        ];
    }

    /**
     * Update campaign statistics
     */
    public function updateStats(): void
    {
        $stats = $this->calculateStats();

        $this->update([
            'total_recipients' => $stats['total'],
            'emails_sent' => $stats['sent'],
            'emails_failed' => $stats['failed'],
            'emails_opened' => $stats['opened'],
            'links_clicked' => $stats['clicked'],
        ]);
    }

    /**
     * Check if campaign can be sent
     */
    public function canBeSent(): bool
    {
        return in_array($this->status, ['draft', 'scheduled', 'paused']);
    }

    /**
     * Check if campaign is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'sent';
    }

    /**
     * Get status label
     */
    public function getStatusLabel(): string
    {
        return match($this->status) {
            'draft' => 'Borrador',
            'scheduled' => 'Programada',
            'sending' => 'Enviando',
            'sent' => 'Enviada',
            'paused' => 'Pausada',
            'cancelled' => 'Cancelada',
            default => $this->status,
        };
    }
}
