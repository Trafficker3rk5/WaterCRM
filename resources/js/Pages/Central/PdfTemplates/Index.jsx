import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';

export default function PdfTemplatesIndex({ auth, templates }) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [previewHtml, setPreviewHtml] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const typeLabels = {
        budget: 'Presupuesto',
        invoice: 'Factura',
        contract: 'Contrato',
        custom: 'Personalizado'
    };

    const typeBadgeColors = {
        budget: 'bg-blue-100 text-blue-800',
        invoice: 'bg-green-100 text-green-800',
        contract: 'bg-purple-100 text-purple-800',
        custom: 'bg-gray-100 text-gray-800'
    };

    const handlePreview = async (templateId) => {
        try {
            const response = await fetch(`/pdf-templates/${templateId}/preview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    data: getSampleData()
                })
            });

            const data = await response.json();
            setPreviewHtml(data.html);
            setShowPreview(true);
        } catch (error) {
            console.error('Error loading preview:', error);
        }
    };

    const handleDelete = async (templateId) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
            return;
        }

        router.delete(`/pdf-templates/${templateId}`, {
            onSuccess: () => {
                alert('Plantilla eliminada correctamente');
            }
        });
    };

    const handleDuplicate = async (templateId) => {
        try {
            const response = await fetch(`/pdf-templates/${templateId}/duplicate`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error('Error duplicating template:', error);
        }
    };

    const handleSetDefault = async (templateId) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        try {
            const response = await fetch(`/pdf-templates/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    is_default: true,
                    type: template.type
                })
            });

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error('Error setting default:', error);
        }
    };

    const getSampleData = () => {
        return {
            empresa_nombre: 'WaterCRM Solutions',
            empresa_direccion: 'Calle Ejemplo 123, Madrid',
            empresa_telefono: '+34 912 345 678',
            empresa_email: 'info@watercrm.com',
            cliente_nombre: 'Juan Pérez',
            cliente_empresa: 'Empresa Demo S.L.',
            fecha: new Date().toLocaleDateString(),
            numero_presupuesto: 'PRE-2025-001',
            total: '1,234.56€'
        };
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Plantillas PDF" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Plantillas PDF
                                    </h2>
                                    <p className="text-gray-600">
                                        Gestiona plantillas personalizables para presupuestos, facturas y contratos
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.visit('/pdf-templates/create')}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    + Nueva Plantilla
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <div
                                key={template.id}
                                className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow"
                            >
                                <div className="p-6">
                                    {/* Template Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {template.name}
                                            </h3>
                                            <div className="flex gap-2 flex-wrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadgeColors[template.type]}`}>
                                                    {typeLabels[template.type]}
                                                </span>
                                                {template.is_default && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        ⭐ Por defecto
                                                    </span>
                                                )}
                                                {!template.is_active && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Template Preview Thumbnail */}
                                    <div className="mb-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">Plantilla PDF</p>
                                    </div>

                                    {/* Variables Count */}
                                    <div className="mb-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            {template.variables?.length || 0} variables disponibles
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePreview(template.id)}
                                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                            👁️ Preview
                                        </button>
                                        <button
                                            onClick={() => router.visit(`/pdf-templates/${template.id}/edit`)}
                                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                        >
                                            ✏️ Editar
                                        </button>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleDuplicate(template.id)}
                                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                            📋 Duplicar
                                        </button>
                                        {!template.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(template.id)}
                                                className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                                            >
                                                ⭐ Por Defecto
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="w-full mt-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Empty State */}
                        {templates.length === 0 && (
                            <div className="col-span-full">
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-12 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay plantillas</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Comienza creando tu primera plantilla PDF
                                        </p>
                                        <div className="mt-6">
                                            <button
                                                onClick={() => router.visit('/pdf-templates/create')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                + Nueva Plantilla
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Card */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Variables disponibles
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p className="mb-2">Usa estas variables en tus plantillas:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <code className="text-xs">{'{{empresa_nombre}}'}</code>
                                        <code className="text-xs">{'{{cliente_nombre}}'}</code>
                                        <code className="text-xs">{'{{fecha}}'}</code>
                                        <code className="text-xs">{'{{total}}'}</code>
                                        <code className="text-xs">{'{{numero_presupuesto}}'}</code>
                                        <code className="text-xs">{'{{empresa_email}}'}</code>
                                        <code className="text-xs">{'{{cliente_email}}'}</code>
                                        <code className="text-xs">{'{{iva}}'}</code>
                                    </div>
                                    <p className="mt-2 text-xs">...y muchas más. Ver documentación completa.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowPreview(false)}>
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Preview de Plantilla</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="border rounded p-4 bg-white max-h-96 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
