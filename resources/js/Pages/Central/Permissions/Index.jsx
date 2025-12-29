import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';

export default function PermissionsIndex({ auth, roles, modules, permissions }) {
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        if (selectedRole !== null) {
            loadRolePermissions(selectedRole);
        }
    }, [selectedRole]);

    const loadRolePermissions = async (roleId) => {
        setLoading(true);
        try {
            const response = await fetch(`/permissions/role/${roleId}?company_id=${auth.user.company_id}`);
            const data = await response.json();

            // Convertir array de permisos a objeto indexed por módulo
            const permissionsMap = {};
            data.forEach(perm => {
                permissionsMap[perm.module] = {
                    can_view: perm.can_view,
                    can_create: perm.can_create,
                    can_edit: perm.can_edit,
                    can_delete: perm.can_delete,
                    can_approve: perm.can_approve
                };
            });

            setRolePermissions(permissionsMap);
        } catch (error) {
            console.error('Error loading permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (module, action, value) => {
        setRolePermissions(prev => ({
            ...prev,
            [module]: {
                ...(prev[module] || {}),
                [`can_${action}`]: value
            }
        }));
    };

    const handleSavePermissions = async () => {
        setLoading(true);
        setSaveStatus('saving');

        try {
            // Convertir el objeto de permisos a array para enviar
            const permissionsArray = Object.entries(rolePermissions).map(([module, perms]) => ({
                module,
                ...perms
            }));

            const response = await fetch('/permissions/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    company_id: auth.user.company_id,
                    role_id: selectedRole,
                    permissions: permissionsArray
                })
            });

            if (response.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            console.error('Error saving permissions:', error);
            setSaveStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const getPermissionValue = (module, action) => {
        return rolePermissions[module]?.[`can_${action}`] || false;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestión de Permisos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Gestión de Permisos
                            </h2>
                            <p className="text-gray-600">
                                Configure los permisos para cada rol y módulo del sistema
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Role Selector */}
                        <div className="lg:col-span-1">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Seleccionar Rol</h3>
                                    <div className="space-y-2">
                                        {Object.entries(roles).map(([id, name]) => (
                                            <button
                                                key={id}
                                                onClick={() => setSelectedRole(parseInt(id))}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                                    selectedRole === parseInt(id)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <div className="font-medium">{name}</div>
                                                <div className="text-sm opacity-75">ID: {id}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Table */}
                        <div className="lg:col-span-3">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    {selectedRole === null ? (
                                        <div className="text-center py-12">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                Selecciona un rol
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Selecciona un rol de la lista para configurar sus permisos
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        Permisos para: {roles[selectedRole]}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Configure qué puede hacer este rol en cada módulo
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleSavePermissions}
                                                    disabled={loading}
                                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                                        loading
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : saveStatus === 'success'
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : 'bg-blue-600 hover:bg-blue-700'
                                                    } text-white`}
                                                >
                                                    {loading ? 'Guardando...' : saveStatus === 'success' ? '✓ Guardado' : 'Guardar Cambios'}
                                                </button>
                                            </div>

                                            {loading && !saveStatus ? (
                                                <div className="text-center py-8">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                    <p className="mt-2 text-gray-600">Cargando permisos...</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Módulo
                                                                </th>
                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Ver
                                                                </th>
                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Crear
                                                                </th>
                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Editar
                                                                </th>
                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Eliminar
                                                                </th>
                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Aprobar
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {Object.entries(modules).map(([moduleKey, moduleName]) => (
                                                                <tr key={moduleKey} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {moduleName}
                                                                    </td>
                                                                    {['view', 'create', 'edit', 'delete', 'approve'].map(action => (
                                                                        <td key={action} className="px-6 py-4 whitespace-nowrap text-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={getPermissionValue(moduleKey, action)}
                                                                                onChange={(e) => handlePermissionChange(moduleKey, action, e.target.checked)}
                                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                            />
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Info Card */}
                            {selectedRole !== null && (
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">
                                                Información sobre permisos
                                            </h3>
                                            <div className="mt-2 text-sm text-blue-700">
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Si un permiso no está configurado, se aplicarán los valores por defecto del sistema</li>
                                                    <li>Los Super Admin (ID 0,1) siempre tienen todos los permisos</li>
                                                    <li>Los cambios se aplican inmediatamente a todos los usuarios con este rol</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
