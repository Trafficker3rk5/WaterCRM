<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Storage;

class Contract extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'client_id',
        'name',
        'type',
        'pdf_path',
        'content',
        'field_mappings',
        'signature_fields',
        'is_active',
    ];

    protected $casts = [
        'field_mappings' => 'array',
        'signature_fields' => 'array',
        'is_active' => 'boolean',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function signatures()
    {
        return $this->hasMany(ContractSignature::class);
    }

    /**
     * Get available fields that can be mapped to contracts
     */
    public static function getAvailableFields()
    {
        return [
            // Client fields
            'client.company_name' => 'Company Name',
            'client.contact_name' => 'Contact Name',
            'client.email' => 'Email',
            'client.phone' => 'Phone',
            'client.address' => 'Address',
            'client.city' => 'City',
            'client.postal_code' => 'Postal Code',
            'client.province' => 'Province',
            'client.country' => 'Country',
            'client.cif' => 'CIF/NIF',
            
            // Budget fields
            'budget.id' => 'Budget ID',
            'budget.created_at' => 'Budget Date',
            'budget.products_txt' => 'Products',
            'budget.total_price' => 'Total Price',
            'budget.details' => 'Budget Details',
            
            // Installation fields
            'installation.address' => 'Installation Address',
            'installation.date' => 'Installation Date',
            'installation.notes' => 'Installation Notes',
            
            // User fields
            'user.name' => 'Installer Name',
            'user.email' => 'Installer Email',
            'user.phone' => 'Installer Phone',
            
            // Date fields
            'date.today' => 'Today\'s Date',
            'date.formatted' => 'Formatted Date',
        ];
    }

    /**
     * Get PDF URL if PDF type
     */
    public function getPdfUrlAttribute()
    {
        if ($this->type === 'pdf' && $this->pdf_path) {
            return Storage::disk('public')->url($this->pdf_path);
        }
        return null;
    }
}

