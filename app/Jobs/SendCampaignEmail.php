<?php

namespace App\Jobs;

use App\Models\Central\EmailCampaign;
use App\Models\Central\EmailCampaignLog;
use App\Models\Tenant\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendCampaignEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $campaign;
    public $client;
    public $log;

    /**
     * Create a new job instance.
     */
    public function __construct(EmailCampaign $campaign, Client $client, EmailCampaignLog $log)
    {
        $this->campaign = $campaign;
        $this->client = $client;
        $this->log = $log;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Prepare email content
            $content = $this->prepareContent();

            // Send email
            Mail::send([], [], function ($message) use ($content) {
                $message->to($this->client->email, $this->client->company_name)
                    ->subject($this->campaign->subject)
                    ->from(
                        $this->campaign->from_email ?? config('mail.from.address'),
                        $this->campaign->from_name ?? config('mail.from.name')
                    )
                    ->replyTo($this->campaign->reply_to ?? config('mail.from.address'))
                    ->html($content);
            });

            // Mark as sent
            $this->log->markAsSent();

        } catch (\Exception $e) {
            // Mark as failed
            $this->log->markAsFailed($e->getMessage());

            // Re-throw exception to let queue handle retries
            throw $e;
        }
    }

    /**
     * Prepare email content with tracking and variables
     */
    protected function prepareContent(): string
    {
        $content = $this->campaign->content;

        // Replace variables
        $variables = [
            'client_name' => $this->client->company_name ?? $this->client->name ?? '',
            'company_name' => $this->campaign->company->name ?? '',
            'client_email' => $this->client->email ?? '',
            'client_phone' => $this->client->phone ?? '',
            'current_date' => date('d/m/Y'),
            'current_year' => date('Y'),
            'unsubscribe_link' => route('campaigns.unsubscribe', ['token' => $this->log->tracking_token]),
        ];

        foreach ($variables as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
        }

        // Add tracking pixel for opens
        if ($this->campaign->track_opens) {
            $trackingPixel = '<img src="' . route('campaigns.track.open', ['token' => $this->log->tracking_token]) . '" width="1" height="1" style="display:none;" />';
            $content .= $trackingPixel;
        }

        // Wrap links for click tracking
        if ($this->campaign->track_clicks) {
            $content = $this->wrapLinksForTracking($content);
        }

        return $content;
    }

    /**
     * Wrap links for click tracking
     */
    protected function wrapLinksForTracking(string $content): string
    {
        // Find all <a> tags and wrap their hrefs
        $content = preg_replace_callback(
            '/<a\s+href=["\']([^"\']+)["\']/i',
            function ($matches) {
                $originalUrl = $matches[1];
                // Skip if already a tracking link or anchor
                if (str_starts_with($originalUrl, '#') || str_contains($originalUrl, 'campaigns.track.click')) {
                    return $matches[0];
                }
                $trackingUrl = route('campaigns.track.click', [
                    'token' => $this->log->tracking_token,
                    'url' => base64_encode($originalUrl)
                ]);
                return '<a href="' . $trackingUrl . '"';
            },
            $content
        );

        return $content;
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception): void
    {
        $this->log->markAsFailed($exception->getMessage());
    }
}
