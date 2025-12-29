<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContractSignature extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'contract_id',
        'installer_signature',
        'client_signature',
        'installer_signed_at',
        'client_signed_at',
        'installer_signed_by',
        'client_signed_by',
        'pdf_path',
    ];

    protected $casts = [
        'installer_signed_at' => 'datetime',
        'client_signed_at' => 'datetime',
    ];

    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function installer()
    {
        return $this->belongsTo(TenantUser::class, 'installer_signed_by');
    }

    /**
     * Check if contract is fully signed
     */
    public function isFullySigned()
    {
        return !empty($this->installer_signature) && !empty($this->client_signature);
    }
}

