import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Collapse } from "reactstrap";
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Switch from '@/Template/CommonElements/Switch';
import Trash from '@/Template/CommonElements/Trash';
import { FileText, Edit as EditIcon, ChevronDown, ChevronRight } from "react-feather";
import MainDataContext from '@/Template/_helper/MainData';
import { useContext } from "react";

export default function Scripts({ auth, scripts }) {
    const [modalForm, setModalForm] = useState(false);
    const [selectedScript, setSelectedScript] = useState(null);
    const [expandedScripts, setExpandedScripts] = useState({});
    const { handleDelete } = useContext(MainDataContext);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: null,
        name: '',
        description: '',
        opening: '',
        pitch: '',
        objection_handling: '',
        closing: '',
        is_active: true,
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const openModal = (script = null) => {
        if (script) {
            setData({
                id: script.id,
                name: script.name,
                description: script.description || '',
                opening: script.opening || '',
                pitch: script.pitch || '',
                objection_handling: script.objection_handling || '',
                closing: script.closing || '',
                is_active: script.is_active,
            });
            setSelectedScript(script);
        } else {
            reset();
            setSelectedScript(null);
        }
        setModalForm(true);
    }

    const saveScript = () => {
        if (selectedScript) {
            post(route('telemarketing.scripts.update', selectedScript.id), {
                onSuccess: () => {
                    setModalForm(false);
                    reset();
                }
            });
        } else {
            post(route('telemarketing.scripts.store'), {
                onSuccess: () => {
                    setModalForm(false);
                    reset();
                }
            });
        }
    }

    const toggleExpand = (scriptId) => {
        setExpandedScripts(prev => ({
            ...prev,
            [scriptId]: !prev[scriptId]
        }));
    }

    const canManage = [0, 1, 6].includes(auth.user.rol_id);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Scripts de Llamadas" />
            <Fragment>
                <Breadcrumbs mainTitle="Scripts de Llamadas" parent="Telemarketing" title="Biblioteca de Scripts" />

                <Row className="mb-3">
                    <Col>
                        <Card>
                            <CardBody>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-1">Biblioteca de Scripts</h5>
                                        <p className="text-muted mb-0">
                                            Scripts predefinidos para guiar las llamadas de los agentes TMK
                                        </p>
                                    </div>
                                    {canManage && (
                                        <Btn
                                            attrBtn={{
                                                color: 'primary',
                                                onClick: () => openModal()
                                            }}
                                        >
                                            <FileText size={16} className="me-2" />
                                            Nuevo Script
                                        </Btn>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {scripts && scripts.length > 0 ? (
                    <Row>
                        {scripts.map(script => (
                            <Col key={script.id} md={12} className="mb-3">
                                <Card className={`border-2 ${script.is_active ? 'border-primary' : 'border-secondary'}`}>
                                    <CardBody>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <button
                                                        className="btn btn-sm btn-link p-0 text-decoration-none"
                                                        onClick={() => toggleExpand(script.id)}
                                                    >
                                                        {expandedScripts[script.id] ? (
                                                            <ChevronDown size={20} />
                                                        ) : (
                                                            <ChevronRight size={20} />
                                                        )}
                                                    </button>
                                                    <h5 className="mb-0">{script.name}</h5>
                                                    <Badge color={script.is_active ? 'success' : 'secondary'}>
                                                        {script.is_active ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </div>
                                                {script.description && (
                                                    <p className="text-muted mb-0 ms-4">{script.description}</p>
                                                )}
                                                <small className="text-muted ms-4">
                                                    Creado por: {script.creator?.name || '-'}
                                                </small>
                                            </div>
                                            {canManage && (
                                                <div className="d-flex gap-2">
                                                    <EditIcon
                                                        size={18}
                                                        className="cursor-pointer text-primary"
                                                        onClick={() => openModal(script)}
                                                        title="Editar"
                                                    />
                                                    <Trash
                                                        onClick={() => handleDelete(route('telemarketing.scripts.destroy', script.id))}
                                                        id={'delete-' + script.id}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <Collapse isOpen={expandedScripts[script.id]}>
                                            <hr />
                                            <Row>
                                                {script.opening && (
                                                    <Col md={6} className="mb-3">
                                                        <h6 className="text-primary mb-2">
                                                            <FileText size={16} className="me-2" />
                                                            Apertura
                                                        </h6>
                                                        <div className="bg-light p-3 rounded">
                                                            <p className="mb-0" style={{whiteSpace: 'pre-wrap'}}>
                                                                {script.opening}
                                                            </p>
                                                        </div>
                                                    </Col>
                                                )}

                                                {script.pitch && (
                                                    <Col md={6} className="mb-3">
                                                        <h6 className="text-success mb-2">
                                                            <FileText size={16} className="me-2" />
                                                            Pitch / Presentación
                                                        </h6>
                                                        <div className="bg-light p-3 rounded">
                                                            <p className="mb-0" style={{whiteSpace: 'pre-wrap'}}>
                                                                {script.pitch}
                                                            </p>
                                                        </div>
                                                    </Col>
                                                )}

                                                {script.objection_handling && (
                                                    <Col md={6} className="mb-3">
                                                        <h6 className="text-warning mb-2">
                                                            <FileText size={16} className="me-2" />
                                                            Manejo de Objeciones
                                                        </h6>
                                                        <div className="bg-light p-3 rounded">
                                                            <p className="mb-0" style={{whiteSpace: 'pre-wrap'}}>
                                                                {script.objection_handling}
                                                            </p>
                                                        </div>
                                                    </Col>
                                                )}

                                                {script.closing && (
                                                    <Col md={6} className="mb-3">
                                                        <h6 className="text-danger mb-2">
                                                            <FileText size={16} className="me-2" />
                                                            Cierre
                                                        </h6>
                                                        <div className="bg-light p-3 rounded">
                                                            <p className="mb-0" style={{whiteSpace: 'pre-wrap'}}>
                                                                {script.closing}
                                                            </p>
                                                        </div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Collapse>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Card>
                        <CardBody className="text-center py-5">
                            <FileText size={64} className="text-muted mb-3 opacity-25" />
                            <h5 className="text-muted">No hay scripts creados</h5>
                            <p className="text-muted">
                                Los scripts ayudan a los agentes TMK a seguir una estructura en sus llamadas
                            </p>
                            {canManage && (
                                <Btn
                                    attrBtn={{
                                        color: 'primary',
                                        onClick: () => openModal()
                                    }}
                                >
                                    Crear Primer Script
                                </Btn>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* Form Modal */}
                <Modal isOpen={modalForm} toggle={() => setModalForm(!modalForm)} size="xl">
                    <ModalHeader toggle={() => setModalForm(!modalForm)}>
                        {selectedScript ? 'Editar Script' : 'Nuevo Script'}
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12' md='8'>
                                <FloatingInput
                                    label={{ label: 'Nombre del Script *' }}
                                    input={{
                                        placeholder: 'Ej: Script Principal de Ventas',
                                        onChange: handleChange,
                                        name: 'name',
                                        value: data.name
                                    }}
                                    errors={errors.name}
                                />
                            </Col>
                            <Col xs='12' md='4' className="d-flex align-items-center">
                                <Switch
                                    label={{ label: 'Activo' }}
                                    input={{
                                        checked: data.is_active,
                                        onChange: () => setData('is_active', !data.is_active)
                                    }}
                                />
                            </Col>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Descripción' }}
                                    input={{
                                        placeholder: 'Breve descripción del script',
                                        onChange: handleChange,
                                        name: 'description',
                                        value: data.description,
                                        type: 'textarea',
                                        rows: 2
                                    }}
                                    errors={errors.description}
                                />
                            </Col>

                            <Col xs='12' className="mt-3">
                                <h6 className="text-primary">1. Apertura / Saludo Inicial</h6>
                                <FloatingInput
                                    input={{
                                        placeholder: 'Buenos días/tardes, mi nombre es... llamo de la empresa... ¿podría hablar con...?',
                                        onChange: handleChange,
                                        name: 'opening',
                                        value: data.opening,
                                        type: 'textarea',
                                        rows: 3
                                    }}
                                    errors={errors.opening}
                                />
                            </Col>

                            <Col xs='12' className="mt-3">
                                <h6 className="text-success">2. Pitch / Presentación del Producto/Servicio</h6>
                                <FloatingInput
                                    input={{
                                        placeholder: 'Le llamo para presentarle nuestra solución... que permite... los beneficios son...',
                                        onChange: handleChange,
                                        name: 'pitch',
                                        value: data.pitch,
                                        type: 'textarea',
                                        rows: 4
                                    }}
                                    errors={errors.pitch}
                                />
                            </Col>

                            <Col xs='12' className="mt-3">
                                <h6 className="text-warning">3. Manejo de Objeciones</h6>
                                <FloatingInput
                                    input={{
                                        placeholder: 'Si dice "no tengo tiempo": Entiendo perfectamente, solo necesitamos 5 minutos...\nSi dice "es muy caro": Comprendo su preocupación, pero si lo comparamos con...',
                                        onChange: handleChange,
                                        name: 'objection_handling',
                                        value: data.objection_handling,
                                        type: 'textarea',
                                        rows: 4
                                    }}
                                    errors={errors.objection_handling}
                                />
                            </Col>

                            <Col xs='12' className="mt-3">
                                <h6 className="text-danger">4. Cierre / Llamada a la Acción</h6>
                                <FloatingInput
                                    input={{
                                        placeholder: '¿Le parece bien que agendemos una reunión para...? ¿Prefiere mañana por la mañana o por la tarde?',
                                        onChange: handleChange,
                                        name: 'closing',
                                        value: data.closing,
                                        type: 'textarea',
                                        rows: 3
                                    }}
                                    errors={errors.closing}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: saveScript
                            }}
                        >
                            {processing ? 'Guardando...' : 'Guardar Script'}
                        </Btn>
                        <Btn
                            attrBtn={{
                                color: 'secondary',
                                onClick: () => setModalForm(false)
                            }}
                        >
                            Cancelar
                        </Btn>
                    </ModalFooter>
                </Modal>
            </Fragment>
        </AuthenticatedLayout>
    )
}
