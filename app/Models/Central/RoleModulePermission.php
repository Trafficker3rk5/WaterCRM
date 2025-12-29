<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;

class RoleModulePermission extends Model
{
    protected $fillable = [
        'company_id',
        'role_id',
        'module',
        'can_view',
        'can_create',
        'can_edit',
        'can_delete',
        'can_approve',
        'custom_config',
    ];

    protected $casts = [
        'can_view' => 'boolean',
        'can_create' => 'boolean',
        'can_edit' => 'boolean',
        'can_delete' => 'boolean',
        'can_approve' => 'boolean',
        'custom_config' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public static function hasPermission($companyId, $roleId, $module, $action = 'view')
    {
        $permission = self::where('company_id', $companyId)
            ->where('role_id', $roleId)
            ->where('module', $module)
            ->first();

        if (!$permission) {
            return self::getDefaultPermission($roleId, $module, $action);
        }

        return $permission->{"can_$action"} ?? false;
    }

    private static function getDefaultPermission($roleId, $module, $action)
    {
        // Admin (0,1) puede todo
        if (in_array($roleId, [0, 1])) {
            return true;
        }

        // Permisos por defecto según rol
        $defaults = [
            2 => ['wallet' => ['view', 'approve'], 'incidents' => ['view', 'create', 'edit']],
            3 => ['expenses' => ['view', 'approve'], 'incidents' => ['view', 'create', 'edit']],
            4 => ['wallet' => ['view', 'create'], 'messages' => ['view', 'create']],
            5 => ['expenses' => ['view', 'create'], 'incidents' => ['view', 'create']],
        ];

        return in_array($action, $defaults[$roleId][$module] ?? []);
    }
}
