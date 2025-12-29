import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';

export default function ProductSeoSettings({ auth, product, categories }) {
    const [formData, setFormData] = useState({
        visible_in_web: product.visible_in_web || false,
        featured: product.featured || false,
        category_web: product.category_web || '',
        order_web: product.order_web || 0,
        seo_title: product.seo_title || '',
        seo_description: product.seo_description || '',
        seo_keywords: product.seo_keywords || '',
    });

    const [charCounts, setCharCounts] = useState({
        title: product.seo_title?.length || 0,
        description: product.seo_description?.length || 0,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Update character counts for SEO fields
        if (name === 'seo_title') {
            setCharCounts(prev => ({ ...prev, title: value.length }));
        }
        if (name === 'seo_description') {
            setCharCounts(prev => ({ ...prev, description: value.length }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(`/products/${product.id}/seo-settings`, formData, {
            onSuccess: () => {
                // Success handling
            }
        });
    };

    const getTitleStatus = () => {
        if (charCounts.title < 30) return { color: 'text-red-600', message: 'Demasiado corto' };
        if (charCounts.title > 60) return { color: 'text-orange-600', message: 'Demasiado largo' };
        return { color: 'text-green-600', message: 'Longitud óptima' };
    };

    const getDescriptionStatus = () => {
        if (charCounts.description < 120) return { color: 'text-red-600', message: 'Demasiado corta' };
        if (charCounts.description > 160) return { color: 'text-orange-600', message: 'Demasiado larga' };
        return { color: 'text-green-600', message: 'Longitud óptima' };
    };

    const titleStatus = getTitleStatus();
    const descriptionStatus = getDescriptionStatus();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`SEO - ${product.name}`} />

            <div className="container-fluid">
                <div className="page-header">
                    <div className="row">
                        <div className="col-lg-6">
                            <h3>Configuración SEO</h3>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="/products">Productos</a>
                                </li>
                                <li className="breadcrumb-item">
                                    <a href="/products/web-visibility">Visibilidad Web</a>
                                </li>
                                <li className="breadcrumb-item active">
                                    {product.name}
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* SEO Form */}
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-header">
                                <h5>Optimización para Motores de Búsqueda</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Product Info */}
                                    <div className="alert alert-info mb-4">
                                        <div className="d-flex align-items-center">
                                            <div className="me-3">
                                                <i className="fa fa-box fa-2x"></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-1">{product.name}</h6>
                                                <p className="mb-0 small text-muted">Modelo: {product.model || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visibility Settings */}
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div className="form-check form-switch">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="visible_in_web"
                                                    name="visible_in_web"
                                                    checked={formData.visible_in_web}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="visible_in_web">
                                                    Visible en web
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-check form-switch">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="featured"
                                                    name="featured"
                                                    checked={formData.featured}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="featured">
                                                    Producto destacado
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category and Order */}
                                    <div className="row mb-4">
                                        <div className="col-md-8">
                                            <label className="form-label">Categoría Web</label>
                                            <input
                                                type="text"
                                                name="category_web"
                                                className="form-control"
                                                value={formData.category_web}
                                                onChange={handleChange}
                                                list="categories"
                                                placeholder="Ej: Equipos de Osmosis"
                                            />
                                            <datalist id="categories">
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat} />
                                                ))}
                                            </datalist>
                                            <small className="text-muted">
                                                Escribe una nueva categoría o selecciona una existente
                                            </small>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Orden</label>
                                            <input
                                                type="number"
                                                name="order_web"
                                                className="form-control"
                                                value={formData.order_web}
                                                onChange={handleChange}
                                                min="0"
                                            />
                                            <small className="text-muted">Orden de aparición</small>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    {/* SEO Title */}
                                    <div className="mb-4">
                                        <label className="form-label">Meta Title *</label>
                                        <input
                                            type="text"
                                            name="seo_title"
                                            className="form-control"
                                            value={formData.seo_title}
                                            onChange={handleChange}
                                            placeholder="Título optimizado para SEO (30-60 caracteres)"
                                            maxLength="70"
                                        />
                                        <div className="d-flex justify-content-between mt-1">
                                            <small className={`${titleStatus.color}`}>
                                                {titleStatus.message}
                                            </small>
                                            <small className={`${charCounts.title > 60 ? 'text-danger' : 'text-muted'}`}>
                                                {charCounts.title}/60 caracteres
                                            </small>
                                        </div>
                                        <small className="text-muted d-block mt-2">
                                            💡 Incluye palabras clave principales al inicio
                                        </small>
                                    </div>

                                    {/* SEO Description */}
                                    <div className="mb-4">
                                        <label className="form-label">Meta Description *</label>
                                        <textarea
                                            name="seo_description"
                                            className="form-control"
                                            value={formData.seo_description}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Descripción atractiva para motores de búsqueda (120-160 caracteres)"
                                            maxLength="200"
                                        />
                                        <div className="d-flex justify-content-between mt-1">
                                            <small className={`${descriptionStatus.color}`}>
                                                {descriptionStatus.message}
                                            </small>
                                            <small className={`${charCounts.description > 160 ? 'text-danger' : 'text-muted'}`}>
                                                {charCounts.description}/160 caracteres
                                            </small>
                                        </div>
                                        <small className="text-muted d-block mt-2">
                                            💡 Describe el beneficio principal y añade una llamada a la acción
                                        </small>
                                    </div>

                                    {/* SEO Keywords */}
                                    <div className="mb-4">
                                        <label className="form-label">Keywords (Palabras Clave)</label>
                                        <input
                                            type="text"
                                            name="seo_keywords"
                                            className="form-control"
                                            value={formData.seo_keywords}
                                            onChange={handleChange}
                                            placeholder="osmosis, purificador agua, tratamiento agua, etc."
                                        />
                                        <small className="text-muted">
                                            Separa las palabras clave con comas. 5-10 keywords recomendadas.
                                        </small>
                                    </div>

                                    {/* SEO Preview */}
                                    <div className="card bg-light mb-4">
                                        <div className="card-body">
                                            <h6 className="mb-3">Vista Previa en Google</h6>
                                            <div className="seo-preview">
                                                <div className="text-primary" style={{ fontSize: '20px', fontFamily: 'Arial, sans-serif' }}>
                                                    {formData.seo_title || product.name}
                                                </div>
                                                <div className="text-success small mb-1">
                                                    www.tuempresa.com › productos › {product.id}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '14px' }}>
                                                    {formData.seo_description || 'Añade una descripción para ver cómo aparecerá en Google...'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fa fa-save me-2"></i>
                                            Guardar Configuración SEO
                                        </button>
                                        <a href="/products/web-visibility" className="btn btn-secondary">
                                            Cancelar
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* SEO Tips Sidebar */}
                    <div className="col-lg-4">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">
                                    <i className="fa fa-lightbulb me-2"></i>
                                    Consejos SEO
                                </h5>
                            </div>
                            <div className="card-body">
                                <h6>Meta Title</h6>
                                <ul className="small">
                                    <li>Longitud ideal: 50-60 caracteres</li>
                                    <li>Incluye la palabra clave principal</li>
                                    <li>Debe ser único y descriptivo</li>
                                    <li>Evita ALL CAPS y exceso de símbolos</li>
                                </ul>

                                <h6 className="mt-3">Meta Description</h6>
                                <ul className="small">
                                    <li>Longitud ideal: 120-160 caracteres</li>
                                    <li>Resume el contenido de forma atractiva</li>
                                    <li>Incluye llamada a la acción</li>
                                    <li>Usa palabras clave naturalmente</li>
                                </ul>

                                <h6 className="mt-3">Keywords</h6>
                                <ul className="small">
                                    <li>5-10 palabras clave relevantes</li>
                                    <li>Mezcla términos generales y específicos</li>
                                    <li>Incluye variaciones y sinónimos</li>
                                    <li>Evita keyword stuffing</li>
                                </ul>

                                <h6 className="mt-3">Categoría Web</h6>
                                <ul className="small">
                                    <li>Agrupa productos similares</li>
                                    <li>Usa nombres descriptivos</li>
                                    <li>Mantén consistencia en nombres</li>
                                    <li>Facilita navegación del usuario</li>
                                </ul>
                            </div>
                        </div>

                        <div className="card mt-3">
                            <div className="card-header">
                                <h6 className="mb-0">Checklist SEO</h6>
                            </div>
                            <div className="card-body">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={formData.visible_in_web}
                                        readOnly
                                    />
                                    <label className="form-check-label small">
                                        Producto visible en web
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={!!formData.category_web}
                                        readOnly
                                    />
                                    <label className="form-check-label small">
                                        Categoría asignada
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={charCounts.title >= 30 && charCounts.title <= 60}
                                        readOnly
                                    />
                                    <label className="form-check-label small">
                                        Title con longitud óptima
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={charCounts.description >= 120 && charCounts.description <= 160}
                                        readOnly
                                    />
                                    <label className="form-check-label small">
                                        Description con longitud óptima
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={!!formData.seo_keywords}
                                        readOnly
                                    />
                                    <label className="form-check-label small">
                                        Keywords definidas
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
