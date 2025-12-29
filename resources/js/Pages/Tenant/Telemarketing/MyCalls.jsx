import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, ButtonGroup, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import DataTable from 'react-data-table-component';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Phone, PhoneCall, Clock, AlertCircle } from "react-feather";

export default function MyCalls({ auth, calls, currentStatus }) {
    const [selectedCall, setSelectedCall] = useState(null);
    const [modalLog, setModalLog] = useState(false);

    const outcomeOptions = [
        { value: 'answered', label: 'Respondió' },
        { value: 'no_answer', label: 'No Contesta' },
        { value: 'busy', label: 'Ocupado' },
        { value: 'voicemail', label: 'Buzón de Voz' },
        { value: 'wrong_number', label: 'Número Equivocado' },
        { value: 'callback_requested', label: 'Solicita Callback' },
        { value: 'interested', label: 'Interesado' },
        { value: 'not_interested', label: 'No Interesado' },
    ];

    const interestLevelOptions = [
        { value: 'none', label: 'Ninguno' },
        { value: 'low', label: 'Bajo' },
        { value: 'medium', label: 'Medio' },
        { value: 'high', label: 'Alto' },
        { value: 'very_high', label: 'Muy Alto' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        outcome: '',
        notes: '',
        duration: null,
        interest_level: '',
        interested_in: '',
        next_call_at: '',
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const openLogModal = (call) => {
        setSelectedCall(call);
        reset();
        setModalLog(true);
    }

    const logCall = () => {
        if (selectedCall) {
            post(route('telemarketing.call.log', selectedCall.id), {
                onSuccess: () => {
                    setModalLog(false);
                    setSelectedCall(null);
                    reset();
                }
            });
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'secondary', text: 'Pendiente' },
            'callback': { color: 'info', text: 'Callback' },
            'contacted': { color: 'success', text: 'Contactado' },
            'interested': { color: 'warning', text: 'Interesado' },
            'no_answer': { color: 'secondary', text: 'No Contesta' },
            'not_interested': { color: 'danger', text: 'No Interesado' },
        };
        const config = statusConfig[status] || { color: 'secondary', text: status };
        return <Badge color={config.color}>{config.text}</Badge>;
    };

    const getPriorityBadge = (priority) => {
        const colors = { 'low': 'secondary', 'normal': 'primary', 'high': 'warning', 'urgent': 'danger' };
        const labels = { 'low': 'Baja', 'normal': 'Normal', 'high': 'Alta', 'urgent': 'Urgente' };
        return <Badge color={colors[priority] || 'primary'}>{labels[priority] || priority}</Badge>;
    };

    const tableColumns = [
        {
            name: 'Prioridad',
            selector: row => getPriorityBadge(row.priority),
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Contacto',
            selector: row => (
                <div>
                    <strong>{row.contact_name}</strong>
                    <br />
                    <small className="text-muted">{row.contact_phone}</small>
                    {row.contact_company && (
                        <>
                            <br />
                            <small className="text-muted">{row.contact_company}</small>
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
            name: 'Intentos',
            selector: row => (
                <div className="text-center">
                    <Badge color={row.attempts > 3 ? 'danger' : 'info'}>{row.attempts}</Badge>
                </div>
            ),
            sortable: true,
            center: true,
            width: '90px',
        },
        {
            name: 'Última Llamada',
            selector: row => {
                if (!row.last_call_at) return <span className="text-muted">-</span>;
                const date = new Date(row.last_call_at);
                return (
                    <div>
                        <small>{date.toLocaleDateString('es-ES')}</small>
                        <br />
                        <small className="text-muted">{date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                );
            },
            sortable: true,
            width: '120px',
        },
        {
            name: 'Próxima Llamada',
            selector: row => {
                if (!row.next_call_at) return '-';
                const nextCall = new Date(row.next_call_at);
                const isOverdue = nextCall < new Date();
                return (
                    <div className={isOverdue ? 'text-danger' : 'text-info'}>
                        {isOverdue && <AlertCircle size={14} className="me-1" />}
                        <small>{nextCall.toLocaleDateString('es-ES')}</small>
                        <br />
                        <small>{nextCall.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                );
            },
            sortable: true,
            width: '130px',
        },
        {
            name: 'Acciones',
            selector: (row) => (
                <div className="d-flex gap-1">
                    <Button
                        color="primary"
                        size="sm"
                        onClick={() => openLogModal(row)}
                    >
                        <Phone size={14} className="me-1" />
                        Llamar
                    </Button>
                    <Button
                        color="info"
                        size="sm"
                        onClick={() => router.visit(route('telemarketing.call.show', row.id))}
                    >
                        Ver
                    </Button>
                </div>
            ),
            sortable: false,
            center: true,
            width: '180px',
        },
    ];

    const filterButtons = [
        { value: 'all', label: 'Todas', color: 'primary' },
        { value: 'pending', label: 'Pendientes', color: 'secondary' },
        { value: 'callback', label: 'Callbacks', color: 'info' },
        { value: 'interested', label: 'Interesados', color: 'warning' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Llamadas" />
            <Fragment>
                <Breadcrumbs mainTitle="Mis Llamadas" parent="Telemarketing" title="Gestión de Llamadas" />

                <Card className="mb-3">
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Filtrar por Estado</h5>
                            <ButtonGroup>
                                {filterButtons.map(btn => (
                                    <Button
                                        key={btn.value}
                                        color={currentStatus === btn.value ? btn.color : 'outline-' + btn.color}
                                        onClick={() => router.visit(route('telemarketing.my-calls', { status: btn.value }))}
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
                                {calls.total} Llamadas
                                {currentStatus !== 'all' && ` - ${filterButtons.find(b => b.value === currentStatus)?.label}`}
                            </h5>
                        </div>

                        <DataTable
                            columns={tableColumns}
                            data={calls.data || []}
                            pagination
                            paginationServer
                            paginationTotalRows={calls.total}
                            paginationDefaultPage={calls.current_page}
                            onChangePage={page => router.visit(route('telemarketing.my-calls', { status: currentStatus, page }))}
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay llamadas para mostrar"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                        />
                    </CardBody>
                </Card>

                {/* Log Call Modal */}
                <Modal isOpen={modalLog} toggle={() => setModalLog(!modalLog)} size="lg">
                    <ModalHeader toggle={() => setModalLog(!modalLog)}>
                        Registrar Llamada
                        {selectedCall && (
                            <div className="text-muted small mt-1">
                                {selectedCall.contact_name} - {selectedCall.contact_phone}
                            </div>
                        )}
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12' md='6'>
                                <Select
                                    label={{ label: 'Resultado de la Llamada *' }}
                                    input={{
                                        placeholder: 'Seleccionar resultado',
                                        onChange: (e) => setData('outcome', e ? e.value : ''),
                                        name: 'outcome',
                                        options: outcomeOptions,
                                    }}
                                    errors={errors.outcome}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Duración (segundos)' }}
                                    input={{
                                        placeholder: '0',
                                        onChange: handleChange,
                                        name: 'duration',
                                        value: data.duration || '',
                                        type: 'number',
                                        min: 0
                                    }}
                                    errors={errors.duration}
                                />
                            </Col>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Notas de la Llamada *' }}
                                    input={{
                                        placeholder: 'Describe qué ocurrió en la llamada...',
                                        onChange: handleChange,
                                        name: 'notes',
                                        value: data.notes,
                                        type: 'textarea',
                                        rows: 4
                                    }}
                                    errors={errors.notes}
                                />
                            </Col>

                            {(data.outcome === 'interested' || data.outcome === 'callback_requested') && (
                                <>
                                    <Col xs='12' md='6'>
                                        <Select
                                            label={{ label: 'Nivel de Interés' }}
                                            input={{
                                                placeholder: 'Seleccionar nivel',
                                                onChange: (e) => setData('interest_level', e ? e.value : ''),
                                                name: 'interest_level',
                                                options: interestLevelOptions,
                                            }}
                                            errors={errors.interest_level}
                                        />
                                    </Col>
                                    <Col xs='12' md='6'>
                                        <FloatingInput
                                            label={{ label: 'Interesado en' }}
                                            input={{
                                                placeholder: 'Producto/Servicio',
                                                onChange: handleChange,
                                                name: 'interested_in',
                                                value: data.interested_in
                                            }}
                                            errors={errors.interested_in}
                                        />
                                    </Col>
                                </>
                            )}

                            {data.outcome === 'callback_requested' && (
                                <Col xs='12'>
                                    <FloatingInput
                                        label={{ label: 'Próxima Llamada' }}
                                        input={{
                                            onChange: handleChange,
                                            name: 'next_call_at',
                                            value: data.next_call_at,
                                            type: 'datetime-local'
                                        }}
                                        errors={errors.next_call_at}
                                    />
                                </Col>
                            )}
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: logCall
                            }}
                        >
                            {processing ? 'Guardando...' : 'Guardar Llamada'}
                        </Btn>
                        <Btn
                            attrBtn={{
                                color: 'secondary',
                                onClick: () => setModalLog(false)
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
