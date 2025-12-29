import React, { Fragment, useState, useEffect } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import Switch from '@/Template/CommonElements/Switch';

export default function ContractForm({ auth, title, cid, contract, availableFields }) {
    const [contractType, setContractType] = useState(contract.type || 'text');
    const [activeTab, setActiveTab] = useState('1');
    const [fieldMappings, setFieldMappings] = useState(contract.field_mappings || {});
    const [content, setContent] = useState(contract.content || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        id: contract.id || 0,
        name: contract.name || '',
        type: contractType,
        content: content,
        pdf_file: null,
        field_mappings: fieldMappings,
        signature_fields: contract.signature_fields || [],
        is_active: contract.is_active !== undefined ? contract.is_active : true,
    });

    useEffect(() => {
        setData(data => ({ ...data, type: contractType, content: content, field_mappings: fieldMappings }));
    }, [contractType, content, fieldMappings]);

    const handleChange = (e) => {
        setData(data => ({ ...data, [e.target.name]: e.target.value }));
    }

    const handleFileChange = (e) => {
        setData(data => ({ ...data, pdf_file: e.target.files[0] }));
    }

    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);
        setData(data => ({ ...data, content: newContent }));
    }

    const insertField = (fieldKey) => {
        const fieldTag = `{{${fieldKey}}}`;
        const textarea = document.getElementById('contract-content');
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = content.substring(0, start) + fieldTag + content.substring(end);
            setContent(newContent);
            setData(data => ({ ...data, content: newContent }));
            
            // Set cursor position after inserted field
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + fieldTag.length, start + fieldTag.length);
            }, 0);
        }
    }

    const handleFieldMappingChange = (pdfField, ourField) => {
        const newMappings = { ...fieldMappings };
        if (ourField) {
            newMappings[pdfField] = ourField;
        } else {
            delete newMappings[pdfField];
        }
        setFieldMappings(newMappings);
        setData(data => ({ ...data, field_mappings: newMappings }));
    }

    const saveForm = async () => {
        const routeName = contract.id ? 'contracts.update' : 'contracts.store';
        const routeParams = contract.id ? [cid, contract.id] : [cid];
        
        post(route(routeName, routeParams), {
            forceFormData: true,
            onSuccess: () => {
                router.visit(route('contracts.index', cid));
            }
        });
    };

    // Convert availableFields object to array for select
    const fieldOptions = Object.entries(availableFields).map(([key, label]) => ({
        value: key,
        label: label
    }));

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />
                <Form className='theme-form2'>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col xs='12' md='6'>
                                    <FloatingInput
                                        label={{ label: 'Nombre del Contrato' }}
                                        input={{
                                            placeholder: 'Nombre del Contrato',
                                            onChange: handleChange,
                                            name: 'name',
                                            value: data.name,
                                        }}
                                        errors={errors.name}
                                    />
                                </Col>
                                <Col xs='12' md='6'>
                                    <div className="mb-3">
                                        <label className="form-label">Tipo de Contrato</label>
                                        <select
                                            className="form-control"
                                            value={contractType}
                                            onChange={(e) => setContractType(e.target.value)}
                                        >
                                            <option value="text">Editor de Texto</option>
                                            <option value="pdf">Subir PDF</option>
                                        </select>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <Col xs='12'>
                                    <Switch
                                        label={'Activo'}
                                        input={{
                                            onChange: (e) => setData(data => ({ ...data, is_active: e.target.checked })),
                                            name: 'is_active',
                                            checked: data.is_active
                                        }}
                                    />
                                </Col>
                            </Row>

                            {contractType === 'text' && (
                                <Row className="mt-3">
                                    <Col xs='12'>
                                        <Nav tabs>
                                            <NavItem>
                                                <NavLink 
                                                    className={activeTab === '1' ? 'active' : ''} 
                                                    onClick={() => setActiveTab('1')}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Contenido
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink 
                                                    className={activeTab === '2' ? 'active' : ''} 
                                                    onClick={() => setActiveTab('2')}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Campos Disponibles
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                        <TabContent activeTab={activeTab}>
                                            <TabPane tabId="1" className="fade show">
                                                <div className="mb-3 mt-3">
                                                    <label className="form-label">Contenido del Contrato</label>
                                                    <textarea
                                                        id="contract-content"
                                                        className="form-control"
                                                        rows="15"
                                                        value={content}
                                                        onChange={handleContentChange}
                                                        placeholder="Escribe el contenido del contrato aquí. Usa los campos disponibles para insertar datos dinámicos."
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane tabId="2" className="fade show">
                                                <div className="mb-3 mt-3">
                                                    <label className="form-label">Campos Disponibles</label>
                                                    <p className="text-muted small">Haz clic en un campo para insertarlo en el contrato</p>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {fieldOptions.map((field) => (
                                                            <button
                                                                key={field.value}
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => insertField(field.value)}
                                                            >
                                                                {field.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </TabPane>
                                        </TabContent>
                                    </Col>
                                </Row>
                            )}

                            {contractType === 'pdf' && (
                                <Row className="mt-3">
                                    <Col xs='12'>
                                        <div className="mb-3">
                                            <label className="form-label">Subir PDF</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                            />
                                            {contract.pdf_path && (
                                                <small className="text-muted d-block mt-2">
                                                    PDF actual: <a href={contract.pdf_url} target="_blank">Ver PDF</a>
                                                </small>
                                            )}
                                            <small className="text-muted d-block mt-2">
                                                Sube un PDF y luego configura los campos que deben rellenarse automáticamente.
                                            </small>
                                        </div>
                                    </Col>
                                    <Col xs='12' className="mt-3">
                                        <h5>Mapeo de Campos</h5>
                                        <p className="text-muted small">
                                            Para cada campo del PDF que quieras rellenar automáticamente, 
                                            selecciona el campo de nuestro sistema que contiene el dato.
                                        </p>
                                        <div className="border p-3 rounded">
                                            <Row>
                                                <Col md="6">
                                                    <FloatingInput
                                                        label={{ label: 'Nombre del Campo en PDF' }}
                                                        input={{
                                                            placeholder: 'Ej: nombre_cliente',
                                                            name: 'pdf_field_name',
                                                        }}
                                                    />
                                                </Col>
                                                <Col md="6">
                                                    <Select
                                                        label={{ label: 'Campo de Nuestro Sistema' }}
                                                        input={{
                                                            placeholder: 'Selecciona un campo',
                                                            options: fieldOptions,
                                                            name: 'our_field',
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                            <Btn
                                                attrBtn={{
                                                    color: 'primary btn-sm mt-2',
                                                    onClick: () => {
                                                        // This would add the mapping
                                                        // Implementation depends on PDF field extraction
                                                        alert('Función de mapeo de campos PDF - Requiere integración con librería de manipulación de PDF');
                                                    }
                                                }}
                                            >
                                                Agregar Mapeo
                                            </Btn>
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            <Row className="mt-3">
                                <Col xs='12'>
                                    <h5>Campos de Firma</h5>
                                    <p className="text-muted small">
                                        El sistema agregará automáticamente campos de firma para el instalador y el cliente.
                                    </p>
                                </Col>
                            </Row>
                        </CardBody>
                        <CardFooter className="text-end">
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled: processing }}>Guardar</Btn>
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route('contracts.index', cid)) }}>Volver</Btn>
                        </CardFooter>
                    </Card>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}

