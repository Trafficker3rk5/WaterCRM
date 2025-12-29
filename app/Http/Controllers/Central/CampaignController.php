<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Jobs\SendCampaignEmail;
use App\Models\Central\EmailCampaign;
use App\Models\Central\EmailCampaignLog;
use App\Models\Central\EmailTemplate;
use App\Models\Tenant\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampaignController extends Controller
{
    /**
     * Display campaigns list
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $campaigns = EmailCampaign::where('company_id', $user->company_id)
            ->with(['template', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'subject' => $campaign->subject,
                    'status' => $campaign->status,
                    'status_label' => $campaign->getStatusLabel(),
                    'total_recipients' => $campaign->total_recipients,
                    'emails_sent' => $campaign->emails_sent,
                    'emails_failed' => $campaign->emails_failed,
                    'emails_opened' => $campaign->emails_opened,
                    'links_clicked' => $campaign->links_clicked,
                    'open_rate' => $campaign->emails_sent > 0 ? round(($campaign->emails_opened / $campaign->emails_sent) * 100, 2) : 0,
                    'click_rate' => $campaign->emails_sent > 0 ? round(($campaign->links_clicked / $campaign->emails_sent) * 100, 2) : 0,
                    'scheduled_at' => $campaign->scheduled_at?->format('d/m/Y H:i'),
                    'sent_at' => $campaign->sent_at?->format('d/m/Y H:i'),
                    'created_at' => $campaign->created_at->format('d/m/Y'),
                    'template_name' => $campaign->template?->name,
                ];
            });

        return Inertia::render('Central/Campaigns/Index', [
            'auth' => ['user' => $user],
            'campaigns' => $campaigns,
        ]);
    }

    /**
     * Show form to create campaign
     */
    public function create()
    {
        $user = auth()->user();

        $templates = EmailTemplate::where('company_id', $user->company_id)
            ->where('is_active', true)
            ->select('id', 'name', 'description', 'preview_text')
            ->get();

        // Get filter options (optimized - direct queries instead of loading all clients)
        $statuses = Client::where('company_id', $user->company_id)
            ->distinct()
            ->whereNotNull('status')
            ->pluck('status');

        $cities = Client::where('company_id', $user->company_id)
            ->distinct()
            ->whereNotNull('city')
            ->where('city', '!=', '')
            ->pluck('city');

        $provinces = Client::where('company_id', $user->company_id)
            ->distinct()
            ->whereNotNull('province')
            ->where('province', '!=', '')
            ->pluck('province');

        $sources = Client::where('company_id', $user->company_id)
            ->distinct()
            ->whereNotNull('source')
            ->where('source', '!=', '')
            ->pluck('source');

        return Inertia::render('Central/Campaigns/Form', [
            'auth' => ['user' => $user],
            'campaign' => null,
            'templates' => $templates,
            'filterOptions' => [
                'statuses' => $statuses,
                'cities' => $cities,
                'provinces' => $provinces,
                'sources' => $sources,
            ],
            'variables' => EmailTemplate::getAvailableVariables(),
        ]);
    }

    /**
     * Show form to edit campaign
     */
    public function edit($id)
    {
        $user = auth()->user();

        $campaign = EmailCampaign::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        // Can only edit draft or scheduled campaigns
        if (!in_array($campaign->status, ['draft', 'scheduled'])) {
            return redirect()->route('campaigns.index')
                ->with('error', 'Solo puedes editar campañas en borrador o programadas');
        }

        $templates = EmailTemplate::where('company_id', $user->company_id)
            ->where('is_active', true)
            ->select('id', 'name', 'description', 'preview_text')
            ->get();

        // Get filter options (optimized - direct queries instead of loading all clients)
        $statuses = Client::where('company_id', $user->company_id)
            ->distinct()
            ->whereNotNull('status')
            ->pluck('status');

        $cities = Client::where('company_id', $user->company_id)
            ->distinct()
            ->whereNotNull('city')
            ->where('city', '!=', '')
            ->pluck('city');

        $provinces = Client::where('company_id', $user->company_id)
            ->distinct()
            ->whereNotNull('province')
            ->where('province', '!=', '')
            ->pluck('province');

        $sources = Client::where('company_id', $user->company_id)
            ->distinct()
            ->whereNotNull('source')
            ->where('source', '!=', '')
            ->pluck('source');

        return Inertia::render('Central/Campaigns/Form', [
            'auth' => ['user' => $user],
            'campaign' => $campaign,
            'templates' => $templates,
            'filterOptions' => [
                'statuses' => $statuses,
                'cities' => $cities,
                'provinces' => $provinces,
                'sources' => $sources,
            ],
            'variables' => EmailTemplate::getAvailableVariables(),
        ]);
    }

    /**
     * Store new campaign
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'template_id' => 'nullable|exists:email_templates,id',
            'filters' => 'nullable|array',
            'from_name' => 'nullable|string|max:255',
            'from_email' => 'nullable|email',
            'reply_to' => 'nullable|email',
            'track_opens' => 'boolean',
            'track_clicks' => 'boolean',
            'notes' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
        ]);

        $validated['company_id'] = $user->company_id;
        $validated['created_by'] = $user->id;
        $validated['status'] = 'draft';
        $validated['track_opens'] = $validated['track_opens'] ?? true;
        $validated['track_clicks'] = $validated['track_clicks'] ?? true;

        $campaign = EmailCampaign::create($validated);

        return response()->json([
            'message' => 'Campaña creada correctamente',
            'campaign' => $campaign,
        ], 201);
    }

    /**
     * Update campaign
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();

        $campaign = EmailCampaign::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        // Can only edit draft or scheduled campaigns
        if (!in_array($campaign->status, ['draft', 'scheduled'])) {
            return response()->json([
                'message' => 'Solo puedes editar campañas en borrador o programadas',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'subject' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'template_id' => 'nullable|exists:email_templates,id',
            'filters' => 'nullable|array',
            'from_name' => 'nullable|string|max:255',
            'from_email' => 'nullable|email',
            'reply_to' => 'nullable|email',
            'track_opens' => 'boolean',
            'track_clicks' => 'boolean',
            'notes' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
        ]);

        $campaign->update($validated);

        return response()->json([
            'message' => 'Campaña actualizada correctamente',
            'campaign' => $campaign->fresh(),
        ]);
    }

    /**
     * Delete campaign
     */
    public function destroy($id)
    {
        $user = auth()->user();

        $campaign = EmailCampaign::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        // Can only delete draft campaigns
        if ($campaign->status !== 'draft') {
            return response()->json([
                'message' => 'Solo puedes eliminar campañas en borrador',
            ], 403);
        }

        $campaign->delete();

        return response()->json([
            'message' => 'Campaña eliminada correctamente',
        ]);
    }

    /**
     * Preview campaign recipients
     */
    public function previewRecipients(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'filters' => 'nullable|array',
        ]);

        // Create a temporary campaign to use getRecipients method
        $tempCampaign = new EmailCampaign([
            'company_id' => $user->company_id,
            'filters' => $validated['filters'] ?? null,
        ]);

        $recipients = $tempCampaign->getRecipients();

        return response()->json([
            'total' => $recipients->count(),
            'recipients' => $recipients->map(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->company_name ?? $client->name,
                    'email' => $client->email,
                    'status' => $client->status,
                    'city' => $client->city,
                ];
            }),
        ]);
    }

    /**
     * Send campaign
     */
    public function send($id)
    {
        $user = auth()->user();

        $campaign = EmailCampaign::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        if (!$campaign->canBeSent()) {
            return response()->json([
                'message' => 'Esta campaña no puede ser enviada',
            ], 403);
        }

        // Get recipients
        $recipients = $campaign->getRecipients();

        if ($recipients->count() === 0) {
            return response()->json([
                'message' => 'No hay destinatarios para esta campaña',
            ], 400);
        }

        // Update campaign status
        $campaign->update([
            'status' => 'sending',
            'total_recipients' => $recipients->count(),
        ]);

        // Create logs and dispatch jobs
        foreach ($recipients as $client) {
            $log = EmailCampaignLog::create([
                'campaign_id' => $campaign->id,
                'client_id' => $client->id,
                'recipient_email' => $client->email,
                'recipient_name' => $client->company_name ?? $client->name,
                'status' => 'queued',
            ]);

            // Dispatch job to queue
            SendCampaignEmail::dispatch($campaign, $client, $log);
        }

        // Mark campaign as sent (jobs will update stats)
        $campaign->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return response()->json([
            'message' => 'Campaña en cola de envío. Se enviarán ' . $recipients->count() . ' emails.',
            'total_recipients' => $recipients->count(),
        ]);
    }

    /**
     * Get campaign statistics
     */
    public function stats($id)
    {
        $user = auth()->user();

        $campaign = EmailCampaign::where('id', $id)
            ->where('company_id', $user->company_id)
            ->with('logs')
            ->firstOrFail();

        $stats = $campaign->calculateStats();

        // Get detailed logs
        $logs = $campaign->logs()
            ->with('client')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'recipient_name' => $log->recipient_name,
                    'recipient_email' => $log->recipient_email,
                    'status' => $log->status,
                    'sent_at' => $log->sent_at?->format('d/m/Y H:i'),
                    'opened_at' => $log->opened_at?->format('d/m/Y H:i'),
                    'first_clicked_at' => $log->first_clicked_at?->format('d/m/Y H:i'),
                    'open_count' => $log->open_count,
                    'click_count' => $log->click_count,
                    'error_message' => $log->error_message,
                ];
            });

        return Inertia::render('Central/Campaigns/Stats', [
            'auth' => ['user' => $user],
            'campaign' => $campaign,
            'stats' => $stats,
            'logs' => $logs,
        ]);
    }

    /**
     * Track email open
     */
    public function trackOpen($token)
    {
        $log = EmailCampaignLog::where('tracking_token', $token)->first();

        if ($log) {
            $log->trackOpen(
                request()->header('User-Agent'),
                request()->ip()
            );
        }

        // Return transparent 1x1 pixel
        return response(base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'))
            ->header('Content-Type', 'image/gif')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * Track link click and redirect
     */
    public function trackClick($token, Request $request)
    {
        $log = EmailCampaignLog::where('tracking_token', $token)->first();

        if ($log) {
            $log->trackClick();
        }

        // Decode and redirect to original URL
        $url = base64_decode($request->input('url', ''));

        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return redirect($url);
        }

        return redirect('/');
    }

    /**
     * Unsubscribe from emails
     */
    public function unsubscribe($token)
    {
        $log = EmailCampaignLog::where('tracking_token', $token)->first();

        if ($log && $log->client) {
            // Mark client as unsubscribed (you can add a field to Client model)
            // For now, just show a message
            return view('emails.unsubscribed', [
                'client' => $log->client,
            ]);
        }

        return redirect('/');
    }

    /**
     * Duplicate campaign
     */
    public function duplicate($id)
    {
        $user = auth()->user();

        $original = EmailCampaign::where('id', $id)
            ->where('company_id', $user->company_id)
            ->firstOrFail();

        $duplicate = $original->replicate();
        $duplicate->name = $original->name . ' (Copia)';
        $duplicate->status = 'draft';
        $duplicate->scheduled_at = null;
        $duplicate->sent_at = null;
        $duplicate->total_recipients = 0;
        $duplicate->emails_sent = 0;
        $duplicate->emails_failed = 0;
        $duplicate->emails_opened = 0;
        $duplicate->links_clicked = 0;
        $duplicate->created_by = $user->id;
        $duplicate->save();

        return response()->json([
            'message' => 'Campaña duplicada correctamente',
            'campaign' => $duplicate,
        ], 201);
    }
}
