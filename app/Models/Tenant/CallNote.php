<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CallNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'call_id',
        'user_id',
        'call_outcome',
        'notes',
        'called_at',
        'call_duration',
    ];

    protected $casts = [
        'called_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function call()
    {
        return $this->belongsTo(Call::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper Methods
     */
    public function getOutcomeLabel()
    {
        $labels = [
            'answered' => 'Respondió',
            'no_answer' => 'No Contesta',
            'busy' => 'Ocupado',
            'voicemail' => 'Buzón de Voz',
            'wrong_number' => 'Número Equivocado',
            'callback_requested' => 'Solicita Callback',
            'interested' => 'Interesado',
            'not_interested' => 'No Interesado',
            'other' => 'Otro',
        ];

        return $labels[$this->call_outcome] ?? $this->call_outcome;
    }

    public function getFormattedDuration()
    {
        if (!$this->call_duration) return '-';

        $minutes = floor($this->call_duration / 60);
        $seconds = $this->call_duration % 60;

        if ($minutes > 0) {
            return sprintf('%d:%02d min', $minutes, $seconds);
        }

        return sprintf('%d seg', $seconds);
    }
}
