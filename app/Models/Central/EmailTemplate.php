<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'name',
        'description',
        'html_content',
        'preview_text',
        'thumbnail',
        'is_default',
        'is_active',
        'usage_count',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'usage_count' => 'integer',
    ];

    /**
     * Relationships
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function campaigns()
    {
        return $this->hasMany(EmailCampaign::class, 'template_id');
    }

    /**
     * Render template with data
     */
    public function render(array $data): string
    {
        $html = $this->html_content;

        // Replace variables like {{client_name}}, {{company_name}}, etc.
        foreach ($data as $key => $value) {
            if (is_string($value) || is_numeric($value)) {
                $html = str_replace('{{' . $key . '}}', $value, $html);
            }
        }

        return $html;
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Get available variables for templates
     */
    public static function getAvailableVariables(): array
    {
        return [
            ['key' => 'client_name', 'description' => 'Nombre del cliente'],
            ['key' => 'company_name', 'description' => 'Nombre de la empresa'],
            ['key' => 'client_email', 'description' => 'Email del cliente'],
            ['key' => 'client_phone', 'description' => 'Teléfono del cliente'],
            ['key' => 'unsubscribe_link', 'description' => 'Link para darse de baja'],
            ['key' => 'current_date', 'description' => 'Fecha actual'],
            ['key' => 'current_year', 'description' => 'Año actual'],
        ];
    }
}
