<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\RoleModulePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleModulePermissionController extends Controller
{
    /**
     * Display the permissions management page
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $roles = [
            0 => 'Super Admin',
            1 => 'Admin',
            2 => 'Commercial',
            3 => 'Installer',
            4 => 'Technician',
            5 => 'Warehouse',
            6 => 'Viewer',
        ];

        $modules = [
            'wallet' => 'Wallet Management',
            'incidents' => 'Incident Management',
            'messages' => 'Internal Messages',
            'expenses' => 'Expense Management',
            'budgets' => 'Budget Management',
            'installations' => 'Installation Management',
            'clients' => 'Client Management',
            'products' => 'Product Management',
            'contracts' => 'Contract Management',
            'documents' => 'Document Management',
            'kpi_dashboard' => 'KPI Dashboard',
            'reports' => 'Reports',
        ];

        $permissions = RoleModulePermission::where('company_id', $user->company_id)
            ->orderBy('role_id')
            ->orderBy('module')
            ->get();

        return Inertia::render('Central/Permissions/Index', [
            'auth' => ['user' => $user],
            'roles' => $roles,
            'modules' => $modules,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Get permissions for a specific role
     */
    public function getRolePermissions(Request $request, $roleId)
    {
        $companyId = $request->input('company_id');

        $permissions = RoleModulePermission::where('company_id', $companyId)
            ->where('role_id', $roleId)
            ->get();

        return response()->json($permissions);
    }

    /**
     * Update or create permission
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'role_id' => 'required|integer|min:0|max:6',
            'module' => 'required|string',
            'can_view' => 'boolean',
            'can_create' => 'boolean',
            'can_edit' => 'boolean',
            'can_delete' => 'boolean',
            'can_approve' => 'boolean',
            'custom_config' => 'nullable|array',
        ]);

        $permission = RoleModulePermission::updateOrCreate(
            [
                'company_id' => $validated['company_id'],
                'role_id' => $validated['role_id'],
                'module' => $validated['module'],
            ],
            $validated
        );

        return response()->json([
            'message' => 'Permission updated successfully',
            'permission' => $permission,
        ], 201);
    }

    /**
     * Bulk update permissions for a role
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'role_id' => 'required|integer|min:0|max:6',
            'permissions' => 'required|array',
            'permissions.*.module' => 'required|string',
            'permissions.*.can_view' => 'boolean',
            'permissions.*.can_create' => 'boolean',
            'permissions.*.can_edit' => 'boolean',
            'permissions.*.can_delete' => 'boolean',
            'permissions.*.can_approve' => 'boolean',
            'permissions.*.custom_config' => 'nullable|array',
        ]);

        $updated = [];

        foreach ($validated['permissions'] as $permData) {
            $permission = RoleModulePermission::updateOrCreate(
                [
                    'company_id' => $validated['company_id'],
                    'role_id' => $validated['role_id'],
                    'module' => $permData['module'],
                ],
                array_merge($permData, [
                    'company_id' => $validated['company_id'],
                    'role_id' => $validated['role_id'],
                ])
            );

            $updated[] = $permission;
        }

        return response()->json([
            'message' => 'Permissions updated successfully',
            'permissions' => $updated,
        ]);
    }

    /**
     * Check if a role has permission for a specific action
     */
    public function checkPermission(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'role_id' => 'required|integer',
            'module' => 'required|string',
            'action' => 'required|in:view,create,edit,delete,approve',
        ]);

        $hasPermission = RoleModulePermission::hasPermission(
            $validated['company_id'],
            $validated['role_id'],
            $validated['module'],
            $validated['action']
        );

        return response()->json([
            'has_permission' => $hasPermission,
        ]);
    }

    /**
     * Delete a permission (revert to defaults)
     */
    public function destroy(Request $request, $id)
    {
        $permission = RoleModulePermission::findOrFail($id);

        // Verify company ownership
        if ($request->input('company_id') != $permission->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $permission->delete();

        return response()->json([
            'message' => 'Permission deleted, defaults will apply',
        ]);
    }

    /**
     * Get available modules list
     */
    public function getAvailableModules()
    {
        return response()->json([
            'modules' => [
                'wallet' => 'Wallet Management',
                'incidents' => 'Incident Management',
                'messages' => 'Internal Messages',
                'expenses' => 'Expense Management',
                'budgets' => 'Budget Management',
                'installations' => 'Installation Management',
                'clients' => 'Client Management',
                'products' => 'Product Management',
                'contracts' => 'Contract Management',
                'documents' => 'Document Management',
                'kpi_dashboard' => 'KPI Dashboard',
                'reports' => 'Reports',
            ],
        ]);
    }

    /**
     * Get role names
     */
    public function getRoles()
    {
        return response()->json([
            'roles' => [
                0 => 'Super Admin',
                1 => 'Admin',
                2 => 'Commercial',
                3 => 'Installer',
                4 => 'Technician',
                5 => 'Warehouse',
                6 => 'Viewer',
            ],
        ]);
    }
}
