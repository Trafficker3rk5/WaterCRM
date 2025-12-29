<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;

class CompanyUsageStat extends Model
{
    protected $fillable = [
        'company_id',
        'month',
        'year',
        'users_total',
        'users_active',
        'storage_used_mb',
        'api_calls',
        'modules_active',
        'installations_count',
        'budgets_created',
        'messages_sent',
        'expenses_processed',
        'incidents_created',
        'clients_created',
        'calculated_cost',
    ];

    protected $casts = [
        'modules_active' => 'array',
        'calculated_cost' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public static function recordUsage($companyId, array $data)
    {
        $month = now()->month;
        $year = now()->year;

        return self::updateOrCreate(
            [
                'company_id' => $companyId,
                'month' => $month,
                'year' => $year,
            ],
            $data
        );
    }

    public function calculateCost()
    {
        $baseCost = 29.99; // Precio base
        $costPerUser = 9.99; // Por usuario adicional
        $costPerGb = 5.00; // Por GB de almacenamiento
        $costPerModule = 14.99; // Por módulo adicional

        $additionalUsers = max(0, $this->users_total - 5); // Primeros 5 incluidos
        $additionalGb = max(0, ($this->storage_used_mb / 1024) - 10); // Primeros 10GB incluidos
        $additionalModules = max(0, count($this->modules_active ?? []) - 3); // Primeros 3 incluidos

        $total = $baseCost 
            + ($additionalUsers * $costPerUser)
            + ($additionalGb * $costPerGb)
            + ($additionalModules * $costPerModule);

        $this->update(['calculated_cost' => $total]);

        return $total;
    }
}
