import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';

export default function AdvancedPdfEditor({ auth, template, availableVariables, products }) {
    const isEdit = !!template;

    const [formData, setFormData] = useState({
        name: template?.name || '',
        type: template?.type || 'budget',
        is_active: template?.is_active ?? true,
        is_default: template?.is_default ?? false,
        order: template?.order || 0,
        blocks: template?.blocks || [],
        colors: template?.colors || {
            primary: '#3B82F6',
            secondary: '#64748B',
            text: '#1E293B',
            background: '#FFFFFF',
            accent: '#10B981'
        },
        settings: template?.settings || {
            page_size: 'A4',
            orientation: 'portrait',
            margin_top: 20,
            margin_bottom: 20,
            margin_left: 15,
            margin_right: 15,
            show_page_numbers: true,
            header_height: 100,
            footer_height: 60
        }
    });

    const [selectedBlock, setSelectedBlock] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [draggingBlock, setDraggingBlock] = useState(null);

    // Tipos de bloques disponibles
    const blockTypes = [
        {
            type: 'header',
            icon: 'fa-heading',
            label: 'Cabecera',
            defaultContent: {
                show_logo: true,
                company_name: true,
                company_info: true,
                alignment: 'left'
            }
        },
        {
            type: 'client_info',
            icon: 'fa-user',
            label: 'Datos Cliente',
            defaultContent: {
                title: 'Cliente',
                fields: ['name', 'email', 'phone', 'address']
            }
        },
        {
            type: 'budget_info',
            icon: 'fa-file-invoice',
            label: 'Info Presupuesto',
            defaultContent: {
                show_number: true,
                show_date: true,
                show_validity: true,
                custom_fields: []
            }
        },
        {
            type: 'products_table',
            icon: 'fa-table',
            label: 'Tabla Productos',
            defaultContent: {
                columns: ['name', 'quantity', 'price', 'total'],
                show_images: false,
                show_descriptions: true
            }
        },
        {
            type: 'products_details',
            icon: 'fa-box',
            label: 'Fichas Técnicas',
            defaultContent: {
                show_images: true,
                show_attributes: true,
                show_highlights: true,
                layout: 'detailed' // detailed | compact
            }
        },
        {
            type: 'totals',
            icon: 'fa-calculator',
            label: 'Totales',
            defaultContent: {
                show_subtotal: true,
                show_tax: true,
                show_discount: false,
                tax_rate: 21
            }
        },
        {
            type: 'text',
            icon: 'fa-align-left',
            label: 'Texto Libre',
            defaultContent: {
                content: '<p>Escribe aquí...</p>',
                alignment: 'left'
            }
        },
        {
            type: 'spacer',
            icon: 'fa-arrows-alt-v',
            label: 'Espaciador',
            defaultContent: {
                height: 20
            }
        },
        {
            type: 'page_break',
            icon: 'fa-file',
            label: 'Salto de Página',
            defaultContent: {}
        }
    ];

    const handleAddBlock = (blockType) => {
        const blockDef = blockTypes.find(b => b.type === blockType.type);
        const newBlock = {
            id: Date.now(),
            type: blockType.type,
            content: { ...blockDef.defaultContent },
            styles: {
                margin_top: 10,
                margin_bottom: 10,
                padding: 15,
                background: 'transparent'
            }
        };

        setFormData(prev => ({
            ...prev,
            blocks: [...prev.blocks, newBlock]
        }));
    };

    const handleRemoveBlock = (blockId) => {
        setFormData(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== blockId)
        }));
        setSelectedBlock(null);
    };

    const handleMoveBlock = (blockId, direction) => {
        const blocks = [...formData.blocks];
        const index = blocks.findIndex(b => b.id === blockId);

        if (direction === 'up' && index > 0) {
            [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
        } else if (direction === 'down' && index < blocks.length - 1) {
            [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
        }

        setFormData(prev => ({ ...prev, blocks }));
    };

    const handleUpdateBlock = (blockId, updates) => {
        setFormData(prev => ({
            ...prev,
            blocks: prev.blocks.map(block =>
                block.id === blockId
                    ? { ...block, ...updates }
                    : block
            )
        }));
    };

    const handleDragStart = (e, block) => {
        setDraggingBlock(block);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetBlock) => {
        e.preventDefault();

        if (!draggingBlock || draggingBlock.id === targetBlock.id) return;

        const blocks = [...formData.blocks];
        const dragIndex = blocks.findIndex(b => b.id === draggingBlock.id);
        const dropIndex = blocks.findIndex(b => b.id === targetBlock.id);

        blocks.splice(dragIndex, 1);
        blocks.splice(dropIndex, 0, draggingBlock);

        setFormData(prev => ({ ...prev, blocks }));
        setDraggingBlock(null);
    };

    const handlePreview = async () => {
        try {
            const response = await fetch('/pdf-templates/preview-advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    blocks: formData.blocks,
                    colors: formData.colors,
                    settings: formData.settings
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = isEdit ? `/pdf-templates/${template.id}` : '/pdf-templates';

        router[isEdit ? 'put' : 'post'](url, {
            ...formData,
            company_id: auth.user.company_id,
        });
    };

    const getBlockIcon = (type) => {
        const blockDef = blockTypes.find(b => b.type === type);
        return blockDef?.icon || 'fa-cube';
    };

    const getBlockLabel = (type) => {
        const blockDef = blockTypes.find(b => b.type === type);
        return blockDef?.label || type;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isEdit ? 'Editar Plantilla PDF' : 'Nueva Plantilla PDF'} />

            <div className="container-fluid">
                <div className="page-header">
                    <div className="row">
                        <div className="col-lg-6">
                            <h3>
                                <i className="fa fa-magic me-2"></i>
                                Editor Avanzado de PDF
                            </h3>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="/pdf-templates">Plantillas PDF</a>
                                </li>
                                <li className="breadcrumb-item active">
                                    {isEdit ? 'Editar' : 'Crear'}
                                </li>
                            </ol>
                        </div>
                        <div className="col-lg-6 text-end">
                            <button
                                type="button"
                                className="btn btn-info me-2"
                                onClick={handlePreview}
                            >
                                <i className="fa fa-eye me-2"></i>
                                Vista Previa
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                            >
                                <i className="fa fa-save me-2"></i>
                                Guardar Plantilla
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Panel izquierdo - Bloques disponibles */}
                    <div className="col-lg-3">
                        <div className="card sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">
                                    <i className="fa fa-cubes me-2"></i>
                                    Bloques Disponibles
                                </h5>
                            </div>
                            <div className="card-body p-2">
                                <div className="list-group list-group-flush">
                                    {blockTypes.map(blockType => (
                                        <button
                                            key={blockType.type}
                                            type="button"
                                            className="list-group-item list-group-item-action d-flex align-items-center"
                                            onClick={() => handleAddBlock(blockType)}
                                        >
                                            <i className={`fa ${blockType.icon} me-3 text-primary`}></i>
                                            <div className="flex-grow-1">
                                                <div className="fw-medium">{blockType.label}</div>
                                            </div>
                                            <i className="fa fa-plus text-success"></i>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Configuración General */}
                            <div className="card-header bg-secondary text-white mt-3">
                                <h6 className="mb-0">Configuración General</h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label small">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small">Tipo</label>
                                    <select
                                        className="form-control form-control-sm"
                                        value={formData.type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="budget">Presupuesto</option>
                                        <option value="invoice">Factura</option>
                                        <option value="contract">Contrato</option>
                                        <option value="installation">Instalación</option>
                                    </select>
                                </div>

                                <div className="form-check mb-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                    />
                                    <label className="form-check-label small" htmlFor="is_active">
                                        Activa
                                    </label>
                                </div>

                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="is_default"
                                        checked={formData.is_default}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                                    />
                                    <label className="form-check-label small" htmlFor="is_default">
                                        Por defecto
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel central - Canvas de edición */}
                    <div className="col-lg-6">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="fa fa-file-pdf me-2"></i>
                                    Diseño de Plantilla
                                </h5>
                                <p className="text-muted small mb-0">
                                    Arrastra y suelta bloques para reordenar
                                </p>
                            </div>
                            <div className="card-body" style={{ minHeight: '600px', background: '#F8FAFC' }}>
                                {formData.blocks.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <i className="fa fa-cube fa-3x mb-3 d-block"></i>
                                        <p>Añade bloques desde el panel izquierdo para empezar a diseñar tu plantilla</p>
                                    </div>
                                ) : (
                                    <div className="blocks-canvas">
                                        {formData.blocks.map((block, index) => (
                                            <div
                                                key={block.id}
                                                className={`block-item mb-3 ${selectedBlock?.id === block.id ? 'selected' : ''}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, block)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, block)}
                                                onClick={() => setSelectedBlock(block)}
                                                style={{
                                                    border: selectedBlock?.id === block.id ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                                                    borderRadius: '8px',
                                                    padding: '15px',
                                                    background: 'white',
                                                    cursor: 'move'
                                                }}
                                            >
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center">
                                                        <i className={`fa ${getBlockIcon(block.type)} me-3 text-primary`}></i>
                                                        <div>
                                                            <div className="fw-medium">{getBlockLabel(block.type)}</div>
                                                            <small className="text-muted">Bloque #{index + 1}</small>
                                                        </div>
                                                    </div>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMoveBlock(block.id, 'up');
                                                            }}
                                                            disabled={index === 0}
                                                            title="Subir"
                                                        >
                                                            <i className="fa fa-arrow-up"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMoveBlock(block.id, 'down');
                                                            }}
                                                            disabled={index === formData.blocks.length - 1}
                                                            title="Bajar"
                                                        >
                                                            <i className="fa fa-arrow-down"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveBlock(block.id);
                                                            }}
                                                            title="Eliminar"
                                                        >
                                                            <i className="fa fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Panel derecho - Propiedades del bloque seleccionado */}
                    <div className="col-lg-3">
                        <div className="card sticky-top" style={{ top: '20px' }}>
                            <div className="card-header">
                                <h6 className="mb-0">
                                    <i className="fa fa-cog me-2"></i>
                                    Propiedades
                                </h6>
                            </div>
                            <div className="card-body">
                                {selectedBlock ? (
                                    <BlockEditor
                                        block={selectedBlock}
                                        onUpdate={(updates) => handleUpdateBlock(selectedBlock.id, updates)}
                                        colors={formData.colors}
                                    />
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        <i className="fa fa-hand-pointer fa-2x mb-2 d-block"></i>
                                        <small>Selecciona un bloque para editar sus propiedades</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Vista Previa de Plantilla</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowPreview(false)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '80vh' }}>
                                <div
                                    className="preview-container"
                                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                                    style={{
                                        background: 'white',
                                        padding: '40px',
                                        boxShadow: '0 0 20px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowPreview(false)}
                                >
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

// Componente para editar propiedades de un bloque
function BlockEditor({ block, onUpdate, colors }) {
    const [localContent, setLocalContent] = useState(block.content);

    useEffect(() => {
        setLocalContent(block.content);
    }, [block.id]);

    const handleChange = (field, value) => {
        const newContent = { ...localContent, [field]: value };
        setLocalContent(newContent);
        onUpdate({ content: newContent });
    };

    // Renderizar campos específicos según el tipo de bloque
    const renderFields = () => {
        switch (block.type) {
            case 'header':
                return (
                    <>
                        <div className="form-check mb-2">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="show_logo"
                                checked={localContent.show_logo || false}
                                onChange={(e) => handleChange('show_logo', e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor="show_logo">
                                Mostrar Logo
                            </label>
                        </div>
                        <div className="form-check mb-2">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="company_name"
                                checked={localContent.company_name || false}
                                onChange={(e) => handleChange('company_name', e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor="company_name">
                                Nombre Empresa
                            </label>
                        </div>
                        <div className="mb-2">
                            <label className="form-label small">Alineación</label>
                            <select
                                className="form-control form-control-sm"
                                value={localContent.alignment || 'left'}
                                onChange={(e) => handleChange('alignment', e.target.value)}
                            >
                                <option value="left">Izquierda</option>
                                <option value="center">Centro</option>
                                <option value="right">Derecha</option>
                            </select>
                        </div>
                    </>
                );

            case 'text':
                return (
                    <>
                        <div className="mb-2">
                            <label className="form-label small">Contenido</label>
                            <textarea
                                className="form-control form-control-sm"
                                rows="5"
                                value={localContent.content || ''}
                                onChange={(e) => handleChange('content', e.target.value)}
                                placeholder="Escribe el texto aquí..."
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label small">Alineación</label>
                            <select
                                className="form-control form-control-sm"
                                value={localContent.alignment || 'left'}
                                onChange={(e) => handleChange('alignment', e.target.value)}
                            >
                                <option value="left">Izquierda</option>
                                <option value="center">Centro</option>
                                <option value="right">Derecha</option>
                                <option value="justify">Justificado</option>
                            </select>
                        </div>
                    </>
                );

            case 'spacer':
                return (
                    <div className="mb-2">
                        <label className="form-label small">Altura (px)</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            value={localContent.height || 20}
                            onChange={(e) => handleChange('height', parseInt(e.target.value))}
                            min="5"
                            max="200"
                        />
                    </div>
                );

            case 'products_details':
                return (
                    <>
                        <div className="form-check mb-2">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="show_images"
                                checked={localContent.show_images || false}
                                onChange={(e) => handleChange('show_images', e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor="show_images">
                                Mostrar Imágenes
                            </label>
                        </div>
                        <div className="form-check mb-2">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="show_attributes"
                                checked={localContent.show_attributes !== false}
                                onChange={(e) => handleChange('show_attributes', e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor="show_attributes">
                                Mostrar Atributos
                            </label>
                        </div>
                        <div className="mb-2">
                            <label className="form-label small">Diseño</label>
                            <select
                                className="form-control form-control-sm"
                                value={localContent.layout || 'detailed'}
                                onChange={(e) => handleChange('layout', e.target.value)}
                            >
                                <option value="detailed">Detallado</option>
                                <option value="compact">Compacto</option>
                            </select>
                        </div>
                    </>
                );

            case 'totals':
                return (
                    <>
                        <div className="form-check mb-2">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="show_subtotal"
                                checked={localContent.show_subtotal !== false}
                                onChange={(e) => handleChange('show_subtotal', e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor="show_subtotal">
                                Mostrar Subtotal
                            </label>
                        </div>
                        <div className="form-check mb-2">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="show_tax"
                                checked={localContent.show_tax !== false}
                                onChange={(e) => handleChange('show_tax', e.target.checked)}
                            />
                            <label className="form-check-label small" htmlFor="show_tax">
                                Mostrar IVA
                            </label>
                        </div>
                        <div className="mb-2">
                            <label className="form-label small">% IVA</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={localContent.tax_rate || 21}
                                onChange={(e) => handleChange('tax_rate', parseInt(e.target.value))}
                                min="0"
                                max="100"
                            />
                        </div>
                    </>
                );

            default:
                return (
                    <div className="text-muted small">
                        No hay propiedades configurables para este tipo de bloque.
                    </div>
                );
        }
    };

    return (
        <div>
            <div className="mb-3">
                <h6 className="text-primary">
                    <i className={`fa ${block.type === 'header' ? 'fa-heading' : 'fa-cube'} me-2`}></i>
                    {block.type.replace('_', ' ').toUpperCase()}
                </h6>
            </div>
            {renderFields()}
        </div>
    );
}
