<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Call extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'call_list_id',
        'assigned_to',
        'contact_name',
        'contact_phone',
        'contact_email',
        'contact_company',
        'contact_position',
        'contact_address',
        'contact_city',
        'contact_province',
        'contact_postal_code',
        'status',
        'attempts',
        'last_call_at',
        'next_call_at',
        'call_duration',
        'interest_level',
        'interested_in',
        'converted_to_client_id',
        'converted_at',
        'priority',
        'custom_data',
    ];

    protected $casts = [
        'last_call_at' => 'datetime',
        'next_call_at' => 'datetime',
        'converted_at' => 'datetime',
        'custom_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function callList()
    {
        return $this->belongsTo(CallList::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function notes()
    {
        return $this->hasMany(CallNote::class)->orderBy('called_at', 'desc');
    }

    public function convertedClient()
    {
        return $this->belongsTo(Client::class, 'converted_to_client_id');
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCallback($query)
    {
        return $query->where('status', 'callback')
                     ->whereNotNull('next_call_at')
                     ->where('next_call_at', '<=', now());
    }

    public function scopeInterested($query)
    {
        return $query->whereIn('status', ['interested', 'callback']);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeDueToday($query)
    {
        return $query->where(function($q) {
                $q->where('status', 'pending')
                  ->orWhere(function($q2) {
                      $q2->where('status', 'callback')
                         ->where('next_call_at', '<=', now()->endOfDay());
                  });
            });
    }

    /**
     * Business Logic
     */
    public function markAsCalled($outcome, $notes, $duration = null)
    {
        $this->increment('attempts');
        $this->last_call_at = now();
        $this->call_duration = $duration;

        // Update status based on outcome
        $statusMap = [
            'answered' => 'contacted',
            'no_answer' => 'no_answer',
            'busy' => 'busy',
            'voicemail' => 'voicemail',
            'wrong_number' => 'wrong_number',
            'callback_requested' => 'callback',
            'interested' => 'interested',
            'not_interested' => 'not_interested',
        ];

        if (isset($statusMap[$outcome])) {
            $this->status = $statusMap[$outcome];
        }

        $this->save();

        // Create note
        $this->notes()->create([
            'user_id' => auth()->id(),
            'call_outcome' => $outcome,
            'notes' => $notes,
            'called_at' => now(),
            'call_duration' => $duration,
        ]);

        // Update call list stats
        if ($this->callList) {
            $this->callList->updateStats();
        }

        return $this;
    }

    public function scheduleCallback($dateTime, $notes = null)
    {
        $this->status = 'callback';
        $this->next_call_at = $dateTime;
        $this->save();

        if ($notes) {
            $this->notes()->create([
                'user_id' => auth()->id(),
                'call_outcome' => 'callback_requested',
                'notes' => $notes,
                'called_at' => now(),
            ]);
        }

        return $this;
    }

    public function convertToContact()
    {
        $client = Client::create([
            'name' => $this->contact_name,
            'email' => $this->contact_email,
            'phone' => $this->contact_phone,
            'company' => $this->contact_company,
            'position' => $this->contact_position,
            'full_address' => $this->contact_address,
            'city' => $this->contact_city,
            'province' => $this->contact_province,
            'cp' => $this->contact_postal_code,
            'state' => 0, // Contact state
            'user_id' => $this->assigned_to,
        ]);

        $this->status = 'converted_contact';
        $this->converted_to_client_id = $client->id;
        $this->converted_at = now();
        $this->save();

        if ($this->callList) {
            $this->callList->updateStats();
        }

        return $client;
    }

    public function convertToClient()
    {
        if ($this->convertedClient && $this->convertedClient->state == 0) {
            // Update existing contact to client
            $this->convertedClient->update(['state' => 1]);
            $this->status = 'converted_client';
        } else {
            // Create new client
            $client = Client::create([
                'name' => $this->contact_name,
                'email' => $this->contact_email,
                'phone' => $this->contact_phone,
                'company' => $this->contact_company,
                'position' => $this->contact_position,
                'full_address' => $this->contact_address,
                'city' => $this->contact_city,
                'province' => $this->contact_province,
                'cp' => $this->contact_postal_code,
                'state' => 1, // Client state
                'user_id' => $this->assigned_to,
            ]);

            $this->status = 'converted_client';
            $this->converted_to_client_id = $client->id;
        }

        $this->converted_at = now();
        $this->save();

        if ($this->callList) {
            $this->callList->updateStats();
        }

        return $this->convertedClient;
    }

    public function getPriorityBadgeColor()
    {
        return [
            'low' => 'secondary',
            'normal' => 'primary',
            'high' => 'warning',
            'urgent' => 'danger',
        ][$this->priority] ?? 'primary';
    }

    public function getStatusBadgeColor()
    {
        return [
            'pending' => 'secondary',
            'in_progress' => 'info',
            'contacted' => 'success',
            'interested' => 'warning',
            'converted_contact' => 'primary',
            'converted_client' => 'success',
            'no_answer' => 'secondary',
            'not_interested' => 'danger',
            'callback' => 'info',
            'do_not_call' => 'dark',
        ][$this->status] ?? 'secondary';
    }
}
