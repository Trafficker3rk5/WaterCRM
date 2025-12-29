import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Modal, ModalHeader, ModalBody, ModalFooter, ButtonGroup, Button } from "reactstrap";
import DataTable from 'react-data-table-component';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import Trash from '@/Template/CommonElements/Trash';
import { AlertTriangle, Eye, CheckCircle, XCircle } from "react-feather";
import MainDataContext from '@/Template/_helper/MainData';
import { useContext } from "react";

export default function Incidents({ auth, incidents, users, currentStatus }) {
    const [modalForm, setModalForm] = useState(false);
    const [modalView, setModalView] = useState(false);
    const [modalResolve, setModalResolve] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const { handleDelete } = useContext(MainDataContext);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        priority: 'normal',
        assigned_to: '',
        budget_id: '',
    });

    const { data: resolveData, setData: setResolveData, post: postResolve, processing: processingResolve, errors: resolveErrors, reset: resetResolve } = useForm({
        resolution_notes: '',
        status: 'resolved',
    });

    const priorityOptions = [
        { value: 'low', label: 'Baja' },
        { value: 'normal', label: 'Normal' },
        { value: 'medium', label: 'Media' },
        { value: 'high', label: 'Alta' },
        { value: 'urgent', label: 'Urgente' },
    ];

    const userOptions = users.map(user => ({
        value: user.id,
        label: `${user.name} ${user.last_name || ''}`
    }));

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const openCreateModal = () => {
        reset();
        setModalForm(true);
    }

    const saveIncident = () => {
        post(route('incidents.store'), {
            onSuccess: () => {
                setModalForm(false);
                reset();
            }
        });
    }

    const openViewModal = (incident) => {
        setSelectedIncident(incident);
        setModalView(true);
    }

    const openResolveModal = (incident) => {
        setSelectedIncident(incident);
        resetResolve();
        setModalResolve(true);
    }

    const resolveIncident = () => {
        if (selectedIncident) {
            postResolve(route('incidents.resolve', selectedIncident.id), {
                onSuccess: () => {
                    setModalResolve(false);
                    setSelectedIncident(null);
                    resetResolve();
                }
            });
        }
    }

    const updateStatus = (incidentId, status) => {
        router.post(route('incidents.update-status', incidentId), { status });
    }

    const getPriorityBadge = (priority) => {
        const colors = {
            'low': 'secondary',
            'normal': 'primary',
            'medium': 'info',
            'high': 'warning',
            'urgent': 'danger'
        };
        const labels = {
            'low': 'Baja',
            'normal': 'Normal',
            'medium': 'Media',
            'high': 'Alta',
            'urgent': 'Urgente'
        };
        return <Badge color={colors[priority] || 'primary'}>{labels[priority] || priority}</Badge>;
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'warning', text: 'Pendiente' },
            'in_progress': { color: 'info', text: 'En Progreso' },
            'resolved': { color: 'success', text: 'Resuelto' },
            'closed': { color: 'secondary', text: 'Cerrado' },
        };
        const config = statusConfig[status] || { color: 'secondary', text: status };
        return <Badge color={config.color}>{config.text}</Badge>;
    }

    const getTypeBadge = (type) => {
        const colors = { 'automatic': 'danger', 'manual': 'primary' };
        const labels = { 'automatic': 'Automática', 'manual': 'Manual' };
        return <Badge color={colors[type] || 'primary'}>{labels[type] || type}</Badge>;
    }

    const tableColumns = [
        {
            name: 'Tipo',
            selector: row => getTypeBadge(row.type),
            sortable: true,
            center: true,
            width: '110px',
        },
        {
            name: 'Prioridad',
            selector: row => getPriorityBadge(row.priority),
            sortable: true,
            center: true,
            width: '110px',
        },
        {
            name: 'Título',
            selector: row => (
                <div>
                    <strong>{row.title}</strong>
                    {row.budget && (
                        <>
                            <br />
                            <small className="text-muted">
                                Presupuesto: {row.budget.internal_id || `#${row.budget.id}`}
                            </small>
                        </>
                    )}
                </div>
            ),
            sortable: true,
            wrap: true,
        },
        {
            name: 'Estado',
            selector: row => getStatusBadge(row.status),
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Asignado a',
            selector: row => row.assigned?.name || '-',
            sortable: true,
            width: '150px',
        },
        {
            name: 'Creado por',
            selector: row => row.creator?.name || 'Sistema',
            sortable: true,
            width: '150px',
        },
        {
            name: 'Fecha',
            selector: row => new Date(row.created_at).toLocaleDateString('es-ES'),
            sortable: true,
            width: '110px',
        },
        {
            name: 'Acciones',
            selector: (row) => (
                <div className="d-flex gap-1">
                    <Eye
                        size={18}
                        className="cursor-pointer text-info"
                        onClick={() => openViewModal(row)}
                        title="Ver detalles"
                    />
                    {row.status === 'pending' && (
                        <CheckCircle
                            size={18}
                            className="cursor-pointer text-primary"
                            onClick={() => updateStatus(row.id, 'in_progress')}
                            title="Marcar en progreso"
                        />
                    )}
                    {(row.status === 'pending' || row.status === 'in_progress') && (
                        <CheckCircle
                            size={18}
                            className="cursor-pointer text-success"
                            onClick={() => openResolveModal(row)}
                            title="Resolver"
                        />
                    )}
                    {row.status === 'resolved' && (
                        <XCircle
                            size={18}
                            className="cursor-pointer text-secondary"
                            onClick={() => updateStatus(row.id, 'closed')}
                            title="Cerrar"
                        />
                    )}
                    {row.type === 'manual' && row.status !== 'closed' && (
                        <Trash
                            onClick={() => handleDelete(route('incidents.destroy', row.id))}
                            id={'delete-' + row.id}
                        />
                    )}
                </div>
            ),
            sortable: false,
            center: true,
            width: '150px',
        },
    ];

    const filterButtons = [
        { value: 'all', label: 'Todas', color: 'primary' },
        { value: 'pending', label: 'Pendientes', color: 'warning' },
        { value: 'in_progress', label: 'En Progreso', color: 'info' },
        { value: 'resolved', label: 'Resueltas', color: 'success' },
    ];

    const canCreate = auth.user.rol_id <= 6; // Admin, Commercial managers, Install managers, TMK managers

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Incidencias" />
            <Fragment>
                <Breadcrumbs mainTitle="Incidencias" parent="Sistema" title="Gestión de Incidencias" />

                {/* Summary Cards */}
                <Row className="mb-4">
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <AlertTriangle size={32} className="text-warning" />
                                </div>
                                <h6 className="text-muted mb-1">Pendientes</h6>
                                <h3 className="mb-0">
                                    {incidents.data?.filter(i => i.status === 'pending').length || 0}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Badge color="info" style={{fontSize: '2rem'}}>⏳</Badge>
                                </div>
                                <h6 className="text-muted mb-1">En Progreso</h6>
                                <h3 className="mb-0">
                                    {incidents.data?.filter(i => i.status === 'in_progress').length || 0}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <CheckCircle size={32} className="text-success" />
                                </div>
                                <h6 className="text-muted mb-1">Resueltas</h6>
                                <h3 className="mb-0">
                                    {incidents.data?.filter(i => i.status === 'resolved').length || 0}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Badge color="danger" style={{fontSize: '2rem'}}>!</Badge>
                                </div>
                                <h6 className="text-muted mb-1">Urgentes</h6>
                                <h3 className="mb-0">
                                    {incidents.data?.filter(i => i.priority === 'urgent' && i.status !== 'closed').length || 0}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Filter Buttons */}
                <Card className="mb-3">
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Filtrar por Estado</h5>
                            <ButtonGroup>
                                {filterButtons.map(btn => (
                                    <Button
                                        key={btn.value}
                                        color={currentStatus === btn.value ? btn.color : 'outline-' + btn.color}
                                        onClick={() => router.visit(route('incidents.index', { status: btn.value }))}
                                    >
                                        {btn.label}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">
                                {incidents.total} Incidencias
                                {currentStatus !== 'all' && ` - ${filterButtons.find(b => b.value === currentStatus)?.label}`}
                            </h5>
                            {canCreate && (
                                <Btn
                                    attrBtn={{
                                        color: 'primary',
                                        onClick: openCreateModal
                                    }}
                                >
                                    <AlertTriangle size={16} className="me-2" />
                                    Nueva Incidencia
                                </Btn>
                            )}
                        </div>

                        <DataTable
                            columns={tableColumns}
                            data={incidents.data || []}
                            pagination
                            paginationServer
                            paginationTotalRows={incidents.total}
                            paginationDefaultPage={incidents.current_page}
                            onChangePage={page => router.visit(route('incidents.index', { status: currentStatus, page }))}
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay incidencias"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                        />
                    </CardBody>
                </Card>

                {/* Create Modal */}
                <Modal isOpen={modalForm} toggle={() => setModalForm(!modalForm)} size="lg">
                    <ModalHeader toggle={() => setModalForm(!modalForm)}>
                        Nueva Incidencia Manual
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Título *' }}
                                    input={{
                                        placeholder: 'Breve descripción del problema',
                                        onChange: handleChange,
                                        name: 'title',
                                        value: data.title
                                    }}
                                    errors={errors.title}
                                />
                            </Col>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Descripción *' }}
                                    input={{
                                        placeholder: 'Describe la incidencia en detalle',
                                        onChange: handleChange,
                                        name: 'description',
                                        value: data.description,
                                        type: 'textarea',
                                        rows: 4
                                    }}
                                    errors={errors.description}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <Select
                                    label={{ label: 'Prioridad *' }}
                                    input={{
                                        placeholder: 'Seleccionar prioridad',
                                        onChange: (e) => setData('priority', e ? e.value : 'normal'),
                                        name: 'priority',
                                        options: priorityOptions,
                                        value: priorityOptions.find(o => o.value === data.priority)
                                    }}
                                    errors={errors.priority}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <Select
                                    label={{ label: 'Asignar a' }}
                                    input={{
                                        placeholder: 'Seleccionar usuario',
                                        onChange: (e) => setData('assigned_to', e ? e.value : ''),
                                        name: 'assigned_to',
                                        options: userOptions,
                                    }}
                                    errors={errors.assigned_to}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: saveIncident
                            }}
                        >
                            {processing ? 'Guardando...' : 'Crear Incidencia'}
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

                {/* View Modal */}
                {selectedIncident && (
                    <Modal isOpen={modalView} toggle={() => setModalView(!modalView)} size="lg">
                        <ModalHeader toggle={() => setModalView(!modalView)}>
                            Detalles de la Incidencia
                        </ModalHeader>
                        <ModalBody>
                            <Row>
                                <Col xs='12' className="mb-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h5>{selectedIncident.title}</h5>
                                            <div className="d-flex gap-2 mt-2">
                                                {getTypeBadge(selectedIncident.type)}
                                                {getPriorityBadge(selectedIncident.priority)}
                                                {getStatusBadge(selectedIncident.status)}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs='12' className="mb-3">
                                    <h6 className="text-muted">Descripción:</h6>
                                    <p style={{whiteSpace: 'pre-wrap'}}>{selectedIncident.description}</p>
                                </Col>
                                <Col xs='12' md='6' className="mb-2">
                                    <strong>Creado por:</strong> {selectedIncident.creator?.name || 'Sistema'}
                                </Col>
                                <Col xs='12' md='6' className="mb-2">
                                    <strong>Asignado a:</strong> {selectedIncident.assigned?.name || '-'}
                                </Col>
                                <Col xs='12' md='6' className="mb-2">
                                    <strong>Fecha creación:</strong> {new Date(selectedIncident.created_at).toLocaleString('es-ES')}
                                </Col>
                                {selectedIncident.budget && (
                                    <Col xs='12' md='6' className="mb-2">
                                        <strong>Presupuesto:</strong> {selectedIncident.budget.internal_id || `#${selectedIncident.budget.id}`}
                                    </Col>
                                )}
                                {selectedIncident.resolution_notes && (
                                    <Col xs='12' className="mt-3">
                                        <h6 className="text-success">Notas de Resolución:</h6>
                                        <div className="bg-light p-3 rounded">
                                            <p className="mb-0" style={{whiteSpace: 'pre-wrap'}}>
                                                {selectedIncident.resolution_notes}
                                            </p>
                                        </div>
                                    </Col>
                                )}
                                {selectedIncident.resolved_at && (
                                    <Col xs='12' className="mt-2">
                                        <small className="text-muted">
                                            Resuelto el: {new Date(selectedIncident.resolved_at).toLocaleString('es-ES')}
                                            {selectedIncident.resolved_by_user && ` por ${selectedIncident.resolved_by_user.name}`}
                                        </small>
                                    </Col>
                                )}
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Btn
                                attrBtn={{
                                    color: 'secondary',
                                    onClick: () => setModalView(false)
                                }}
                            >
                                Cerrar
                            </Btn>
                        </ModalFooter>
                    </Modal>
                )}

                {/* Resolve Modal */}
                {selectedIncident && (
                    <Modal isOpen={modalResolve} toggle={() => setModalResolve(!modalResolve)} size="lg">
                        <ModalHeader toggle={() => setModalResolve(!modalResolve)}>
                            Resolver Incidencia
                            <div className="text-muted small mt-1">
                                {selectedIncident.title}
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <Row>
                                <Col xs='12'>
                                    <FloatingInput
                                        label={{ label: 'Notas de Resolución *' }}
                                        input={{
                                            placeholder: 'Describe cómo se resolvió la incidencia...',
                                            onChange: (e) => setResolveData('resolution_notes', e.target.value),
                                            name: 'resolution_notes',
                                            value: resolveData.resolution_notes,
                                            type: 'textarea',
                                            rows: 5
                                        }}
                                        errors={resolveErrors.resolution_notes}
                                    />
                                </Col>
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Btn
                                attrBtn={{
                                    color: 'success',
                                    disabled: processingResolve,
                                    onClick: resolveIncident
                                }}
                            >
                                {processingResolve ? 'Guardando...' : 'Marcar como Resuelto'}
                            </Btn>
                            <Btn
                                attrBtn={{
                                    color: 'secondary',
                                    onClick: () => setModalResolve(false)
                                }}
                            >
                                Cancelar
                            </Btn>
                        </ModalFooter>
                    </Modal>
                )}
            </Fragment>
        </AuthenticatedLayout>
    )
}
