import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';

export default function PdfTemplateForm({ auth, template, availableVariables }) {
    const isEdit = !!template;

    const [formData, setFormData] = useState({
        name: template?.name || '',
        type: template?.type || 'budget',
        html_content: template?.html_content || '',
        is_active: template?.is_active ?? true,
        is_default: template?.is_default ?? false,
        order: template?.order || 0,
        colors: template?.colors || {
            primary: '#3B82F6',
            secondary: '#64748B',
            text: '#1E293B',
            background: '#FFFFFF',
        },
    });

    const [showPreview, setShowPreview] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [errors, setErrors] = useState({});

    const templateTypes = {
        budget: 'Presupuesto',
        invoice: 'Factura',
        contract: 'Contrato',
        installation: 'Instalación',
        maintenance: 'Mantenimiento',
        custom: 'Personalizado',
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleColorChange = (colorKey, value) => {
        setFormData(prev => ({
            ...prev,
            colors: {
                ...prev.colors,
                [colorKey]: value
            }
        }));
    };

    const handlePreview = async () => {
        try {
            const response = await fetch(isEdit ? `/pdf-templates/${template.id}/preview` : '/pdf-templates/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    html_content: formData.html_content,
                    colors: formData.colors,
                    data: getSampleData()
                })
            });

            if (response.ok) {
                const data = await response.json();
                setPreviewHtml(data.html);
                setShowPreview(true);
            }
        } catch (error) {
            console.error('Error generating preview:', error);
        }
    };

    const getSampleData = () => ({
        company_name: 'Empresa Ejemplo S.L.',
        company_address: 'Calle Principal 123, Madrid',
        company_phone: '+34 912 345 678',
        company_email: 'info@ejemplo.com',
        client_name: 'Cliente Ejemplo',
        client_address: 'Avenida Test 456, Barcelona',
        budget_number: 'PRES-2025-001',
        budget_date: new Date().toLocaleDateString('es-ES'),
        total_amount: '1.234,56 €',
    });

    const insertVariable = (variable) => {
        const textarea = document.getElementById('html_content');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.html_content;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        setFormData(prev => ({
            ...prev,
            html_content: before + `{{${variable}}}` + after
        }));

        // Restore cursor position
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + variable.length + 4;
            textarea.focus();
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const url = isEdit ? `/pdf-templates/${template.id}` : '/pdf-templates';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            router[isEdit ? 'put' : 'post'](url, {
                ...formData,
                company_id: auth.user.company_id,
            }, {
                onSuccess: () => {
                    // Redirect handled by Inertia
                },
                onError: (errors) => {
                    setErrors(errors);
                }
            });
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isEdit ? 'Editar Plantilla PDF' : 'Nueva Plantilla PDF'} />

            <div className="container-fluid">
                <div className="page-header">
                    <div className="row">
                        <div className="col-lg-6">
                            <h3>{isEdit ? 'Editar Plantilla PDF' : 'Nueva Plantilla PDF'}</h3>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="/pdf-templates">Plantillas PDF</a>
                                </li>
                                <li className="breadcrumb-item active">
                                    {isEdit ? 'Editar' : 'Nueva'}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Form Section */}
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-header">
                                <h5>Información de la Plantilla</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Nombre *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Tipo *</label>
                                            <select
                                                name="type"
                                                className={`form-control ${errors.type ? 'is-invalid' : ''}`}
                                                value={formData.type}
                                                onChange={handleChange}
                                                required
                                            >
                                                {Object.entries(templateTypes).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Orden</label>
                                            <input
                                                type="number"
                                                name="order"
                                                className="form-control"
                                                value={formData.order}
                                                onChange={handleChange}
                                                min="0"
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <div className="form-check mt-4">
                                                <input
                                                    type="checkbox"
                                                    name="is_active"
                                                    className="form-check-input"
                                                    id="is_active"
                                                    checked={formData.is_active}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="is_active">
                                                    Activa
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    name="is_default"
                                                    className="form-check-input"
                                                    id="is_default"
                                                    checked={formData.is_default}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="is_default">
                                                    Plantilla por defecto
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div className="row mb-3">
                                        <div className="col-12">
                                            <label className="form-label">Colores de la Plantilla</label>
                                        </div>
                                        {Object.entries(formData.colors).map(([key, value]) => (
                                            <div key={key} className="col-md-3 mb-2">
                                                <label className="form-label text-capitalize">{key}</label>
                                                <div className="input-group">
                                                    <input
                                                        type="color"
                                                        className="form-control form-control-color"
                                                        value={value}
                                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={value}
                                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                                        style={{ maxWidth: '100px' }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* HTML Content */}
                                    <div className="mb-3">
                                        <label className="form-label">Contenido HTML *</label>
                                        <textarea
                                            id="html_content"
                                            name="html_content"
                                            className={`form-control font-monospace ${errors.html_content ? 'is-invalid' : ''}`}
                                            value={formData.html_content}
                                            onChange={handleChange}
                                            rows="15"
                                            required
                                            placeholder="<div>...</div>"
                                        />
                                        {errors.html_content && <div className="invalid-feedback">{errors.html_content}</div>}
                                        <small className="text-muted">
                                            Usa variables como {'{{company_name}}'}, {'{{client_name}}'}, etc.
                                        </small>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fa fa-save me-2"></i>
                                            {isEdit ? 'Actualizar' : 'Crear'} Plantilla
                                        </button>
                                        <button type="button" className="btn btn-info" onClick={handlePreview}>
                                            <i className="fa fa-eye me-2"></i>
                                            Vista Previa
                                        </button>
                                        <a href="/pdf-templates" className="btn btn-secondary">
                                            Cancelar
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Variables Sidebar */}
                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header">
                                <h5>Variables Disponibles</h5>
                            </div>
                            <div className="card-body">
                                <p className="text-muted small mb-3">
                                    Haz clic en una variable para insertarla en la posición del cursor
                                </p>
                                <div className="list-group">
                                    {availableVariables && availableVariables.map((variable) => (
                                        <button
                                            key={variable.key}
                                            type="button"
                                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                                            onClick={() => insertVariable(variable.key)}
                                        >
                                            <div>
                                                <div className="fw-bold font-monospace small">
                                                    {'{{' + variable.key + '}}'}
                                                </div>
                                                <small className="text-muted">{variable.description}</small>
                                            </div>
                                            <i className="fa fa-plus text-primary"></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="card mt-3">
                            <div className="card-header">
                                <h5>💡 Consejos</h5>
                            </div>
                            <div className="card-body">
                                <ul className="small">
                                    <li>Usa {'{{color_primary}}'} para aplicar colores configurados</li>
                                    <li>Las variables se reemplazan automáticamente al generar el PDF</li>
                                    <li>Puedes usar HTML y CSS inline</li>
                                    <li>La plantilla por defecto se usa cuando no hay ninguna seleccionada</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Vista Previa de Plantilla</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPreview(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div
                                    className="border rounded p-4 bg-white"
                                    style={{ maxHeight: '70vh', overflowY: 'auto' }}
                                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPreview(false)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
