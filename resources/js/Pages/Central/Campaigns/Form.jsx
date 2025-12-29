import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Form({ auth, campaign, templates, filterOptions, variables }) {
    const [formData, setFormData] = useState({
        name: campaign?.name || '',
        subject: campaign?.subject || '',
        content: campaign?.content || '',
        template_id: campaign?.template_id || '',
        filters: campaign?.filters || {},
        from_name: campaign?.from_name || '',
        from_email: campaign?.from_email || '',
        reply_to: campaign?.reply_to || '',
        track_opens: campaign?.track_opens ?? true,
        track_clicks: campaign?.track_clicks ?? true,
        notes: campaign?.notes || '',
    });

    const [recipientsPreview, setRecipientsPreview] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [errors, setErrors] = useState({});

    // Load template if selected
    const handleTemplateSelect = (templateId) => {
        const template = templates.find(t => t.id == templateId);
        if (template) {
            setFormData(prev => ({
                ...prev,
                template_id: templateId,
                content: template.html_content || prev.content
            }));
        }
    };

    // Preview recipients based on filters
    const previewRecipients = async () => {
        try {
            const response = await fetch('/campaigns/preview-recipients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ filters: formData.filters }),
            });
            const data = await response.json();
            setRecipientsPreview(data);
        } catch (error) {
            console.error('Error previewing recipients:', error);
        }
    };

    // Insert variable into content
    const insertVariable = (variable) => {
        setFormData(prev => ({
            ...prev,
            content: prev.content + ` {{${variable}}}`
        }));
    };

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();

        const url = campaign ? `/campaigns/${campaign.id}` : '/campaigns';
        const method = campaign ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                router.visit('/campaigns');
            },
            onError: (errors) => {
                setErrors(errors);
            }
        });
    };

    useEffect(() => {
        if (Object.keys(formData.filters).length > 0) {
            previewRecipients();
        }
    }, [formData.filters]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={campaign ? 'Editar Campaña' : 'Nueva Campaña'} />

            <div className="container-fluid py-4">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h4 className="mb-0">
                                        {campaign ? 'Editar Campaña' : 'Nueva Campaña de Email'}
                                    </h4>
                                </div>
                                <div className="card-body">
                                    {/* Tabs */}
                                    <ul className="nav nav-tabs mb-4">
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('basic')}
                                            >
                                                Básico
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('content')}
                                            >
                                                Contenido
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link ${activeTab === 'filters' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('filters')}
                                            >
                                                Destinatarios
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('settings')}
                                            >
                                                Configuración
                                            </button>
                                        </li>
                                    </ul>

                                    {/* Basic Tab */}
                                    {activeTab === 'basic' && (
                                        <div>
                                            <div className="mb-3">
                                                <label className="form-label">Nombre de la Campaña *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Asunto del Email *</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    required
                                                />
                                                {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Plantilla (Opcional)</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.template_id}
                                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                                >
                                                    <option value="">Sin plantilla</option>
                                                    {templates.map(template => (
                                                        <option key={template.id} value={template.id}>
                                                            {template.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content Tab */}
                                    {activeTab === 'content' && (
                                        <div>
                                            <div className="mb-3">
                                                <label className="form-label">Contenido HTML del Email *</label>
                                                <div className="mb-2">
                                                    <small className="text-muted">Variables disponibles: </small>
                                                    {variables.map(v => (
                                                        <button
                                                            key={v.key}
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary me-1 mb-1"
                                                            onClick={() => insertVariable(v.key)}
                                                            title={v.description}
                                                        >
                                                            {'{{' + v.key + '}}'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    className={`form-control font-monospace ${errors.content ? 'is-invalid' : ''}`}
                                                    rows="15"
                                                    value={formData.content}
                                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                    required
                                                />
                                                {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-info"
                                                onClick={() => setShowPreview(!showPreview)}
                                            >
                                                {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
                                            </button>

                                            {showPreview && (
                                                <div className="mt-3 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                    <h6>Vista Previa:</h6>
                                                    <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Filters Tab */}
                                    {activeTab === 'filters' && (
                                        <div>
                                            <p className="text-muted mb-3">
                                                Filtra los destinatarios de tu campaña. Si no seleccionas ningún filtro, se enviará a todos los clientes con email válido.
                                            </p>

                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Estado</label>
                                                    <select
                                                        className="form-select"
                                                        value={formData.filters.status || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            filters: { ...formData.filters, status: e.target.value }
                                                        })}
                                                    >
                                                        <option value="">Todos</option>
                                                        {filterOptions.statuses.map(status => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Fuente</label>
                                                    <select
                                                        className="form-select"
                                                        value={formData.filters.source || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            filters: { ...formData.filters, source: e.target.value }
                                                        })}
                                                    >
                                                        <option value="">Todas</option>
                                                        {filterOptions.sources.map(source => (
                                                            <option key={source} value={source}>{source}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Ciudad</label>
                                                    <select
                                                        className="form-select"
                                                        value={formData.filters.city || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            filters: { ...formData.filters, city: e.target.value }
                                                        })}
                                                    >
                                                        <option value="">Todas</option>
                                                        {filterOptions.cities.map(city => (
                                                            <option key={city} value={city}>{city}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Provincia</label>
                                                    <select
                                                        className="form-select"
                                                        value={formData.filters.province || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            filters: { ...formData.filters, province: e.target.value }
                                                        })}
                                                    >
                                                        <option value="">Todas</option>
                                                        {filterOptions.provinces.map(province => (
                                                            <option key={province} value={province}>{province}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {recipientsPreview && (
                                                <div className="alert alert-info">
                                                    <strong>
                                                        <i className="fas fa-users me-2"></i>
                                                        {recipientsPreview.total} destinatarios
                                                    </strong>
                                                    {recipientsPreview.total > 0 && (
                                                        <div className="mt-2">
                                                            <small>Primeros 5 destinatarios:</small>
                                                            <ul className="mb-0 mt-1">
                                                                {recipientsPreview.recipients.slice(0, 5).map(r => (
                                                                    <li key={r.id}>{r.name} - {r.email}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Settings Tab */}
                                    {activeTab === 'settings' && (
                                        <div>
                                            <div className="mb-3">
                                                <label className="form-label">Nombre del Remitente</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.from_name}
                                                    onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                                                    placeholder="Tu Empresa"
                                                />
                                                <small className="text-muted">Dejar vacío para usar la configuración por defecto</small>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Email del Remitente</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.from_email}
                                                    onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                                                    placeholder="noreply@tuempresa.com"
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Responder a</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.reply_to}
                                                    onChange={(e) => setFormData({ ...formData, reply_to: e.target.value })}
                                                    placeholder="contacto@tuempresa.com"
                                                />
                                            </div>

                                            <div className="form-check mb-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="track_opens"
                                                    checked={formData.track_opens}
                                                    onChange={(e) => setFormData({ ...formData, track_opens: e.target.checked })}
                                                />
                                                <label className="form-check-label" htmlFor="track_opens">
                                                    Rastrear aperturas de email
                                                </label>
                                            </div>

                                            <div className="form-check mb-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="track_clicks"
                                                    checked={formData.track_clicks}
                                                    onChange={(e) => setFormData({ ...formData, track_clicks: e.target.checked })}
                                                />
                                                <label className="form-check-label" htmlFor="track_clicks">
                                                    Rastrear clicks en enlaces
                                                </label>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Notas (Uso interno)</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-lg-4">
                            <div className="card sticky-top" style={{ top: '20px' }}>
                                <div className="card-header">
                                    <h5 className="mb-0">Acciones</h5>
                                </div>
                                <div className="card-body">
                                    <button type="submit" className="btn btn-primary w-100 mb-2">
                                        <i className="fas fa-save me-2"></i>
                                        {campaign ? 'Actualizar' : 'Guardar'} Campaña
                                    </button>

                                    <a href="/campaigns" className="btn btn-secondary w-100">
                                        <i className="fas fa-times me-2"></i>
                                        Cancelar
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
