import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Table, Modal, ModalHeader, ModalBody, ModalFooter, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { Phone, User, Building, MapPin, Clock, TrendingUp, MessageSquare, FileText } from "react-feather";
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';

export default function CallDetail({ auth, call, scripts }) {
    const [activeTab, setActiveTab] = useState('info');
    const [modalLog, setModalLog] = useState(false);
    const [modalConvert, setModalConvert] = useState(false);
    const [selectedScript, setSelectedScript] = useState(null);

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

    const convertForm = useForm({
        type: 'contact',
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const logCall = () => {
        post(route('telemarketing.call.log', call.id), {
            onSuccess: () => {
                setModalLog(false);
                reset();
            }
        });
    }

    const convertCall = () => {
        convertForm.post(route('telemarketing.call.convert', call.id), {
            onSuccess: () => {
                setModalConvert(false);
            }
        });
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'secondary', text: 'Pendiente' },
            'contacted': { color: 'success', text: 'Contactado' },
            'interested': { color: 'warning', text: 'Interesado' },
            'no_answer': { color: 'secondary', text: 'No Contesta' },
            'callback': { color: 'info', text: 'Callback' },
            'converted_contact': { color: 'success', text: 'Convertido a Contacto' },
            'converted_client': { color: 'success', text: 'Convertido a Cliente' },
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Llamada - ${call.contact_name}`} />
            <Fragment>
                <Breadcrumbs
                    mainTitle={`Llamada - ${call.contact_name}`}
                    parent="Telemarketing"
                    title="Detalle de Llamada"
                />

                {/* Header Card */}
                <Card className="mb-3">
                    <CardBody>
                        <Row className="align-items-center">
                            <Col md={8}>
                                <div className="d-flex align-items-center gap-3">
                                    <Phone size={48} className="text-primary" />
                                    <div>
                                        <h3 className="mb-1">{call.contact_name}</h3>
                                        <div className="d-flex gap-2 align-items-center">
                                            <Badge color="info">{call.contact_phone}</Badge>
                                            {getStatusBadge(call.status)}
                                            {getPriorityBadge(call.priority)}
                                            {call.interest_level && (
                                                <Badge color="warning">
                                                    Interés: {call.interest_level}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={4} className="text-end">
                                {!['converted_contact', 'converted_client', 'do_not_call'].includes(call.status) && (
                                    <div className="d-flex gap-2 justify-content-end">
                                        <Btn
                                            attrBtn={{
                                                color: 'primary',
                                                onClick: () => setModalLog(true)
                                            }}
                                        >
                                            <Phone size={16} className="me-2" />
                                            Registrar Llamada
                                        </Btn>
                                        {call.status === 'interested' && (
                                            <Btn
                                                attrBtn={{
                                                    color: 'success',
                                                    onClick: () => setModalConvert(true)
                                                }}
                                            >
                                                Convertir
                                            </Btn>
                                        )}
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* Tabs */}
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={activeTab === 'info' ? 'active' : ''}
                            onClick={() => setActiveTab('info')}
                        >
                            <User size={16} className="me-2" />
                            Información
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={activeTab === 'notes' ? 'active' : ''}
                            onClick={() => setActiveTab('notes')}
                        >
                            <MessageSquare size={16} className="me-2" />
                            Historial ({call.notes?.length || 0})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={activeTab === 'scripts' ? 'active' : ''}
                            onClick={() => setActiveTab('scripts')}
                        >
                            <FileText size={16} className="me-2" />
                            Scripts
                        </NavLink>
                    </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                    {/* Info Tab */}
                    <TabPane tabId="info">
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col md={6}>
                                        <h5 className="mb-3">Información del Contacto</h5>
                                        <Table borderless>
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted" style={{width: '40%'}}>
                                                        <User size={16} className="me-2" />
                                                        Nombre:
                                                    </td>
                                                    <td><strong>{call.contact_name}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        <Phone size={16} className="me-2" />
                                                        Teléfono:
                                                    </td>
                                                    <td><strong>{call.contact_phone}</strong></td>
                                                </tr>
                                                {call.contact_email && (
                                                    <tr>
                                                        <td className="text-muted">Email:</td>
                                                        <td>{call.contact_email}</td>
                                                    </tr>
                                                )}
                                                {call.contact_company && (
                                                    <tr>
                                                        <td className="text-muted">
                                                            <Building size={16} className="me-2" />
                                                            Empresa:
                                                        </td>
                                                        <td>{call.contact_company}</td>
                                                    </tr>
                                                )}
                                                {call.contact_position && (
                                                    <tr>
                                                        <td className="text-muted">Cargo:</td>
                                                        <td>{call.contact_position}</td>
                                                    </tr>
                                                )}
                                                {call.contact_address && (
                                                    <tr>
                                                        <td className="text-muted">
                                                            <MapPin size={16} className="me-2" />
                                                            Dirección:
                                                        </td>
                                                        <td>{call.contact_address}</td>
                                                    </tr>
                                                )}
                                                {call.contact_city && (
                                                    <tr>
                                                        <td className="text-muted">Ciudad:</td>
                                                        <td>{call.contact_city}, {call.contact_province} {call.contact_postal_code}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Col>

                                    <Col md={6}>
                                        <h5 className="mb-3">Estado de la Llamada</h5>
                                        <Table borderless>
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted" style={{width: '40%'}}>Estado:</td>
                                                    <td>{getStatusBadge(call.status)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Prioridad:</td>
                                                    <td>{getPriorityBadge(call.priority)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        <Clock size={16} className="me-2" />
                                                        Intentos:
                                                    </td>
                                                    <td><Badge color="info">{call.attempts || 0}</Badge></td>
                                                </tr>
                                                {call.last_call_at && (
                                                    <tr>
                                                        <td className="text-muted">Última Llamada:</td>
                                                        <td>{new Date(call.last_call_at).toLocaleString('es-ES')}</td>
                                                    </tr>
                                                )}
                                                {call.next_call_at && (
                                                    <tr>
                                                        <td className="text-muted">Próxima Llamada:</td>
                                                        <td className={new Date(call.next_call_at) < new Date() ? 'text-danger' : 'text-info'}>
                                                            <strong>{new Date(call.next_call_at).toLocaleString('es-ES')}</strong>
                                                        </td>
                                                    </tr>
                                                )}
                                                {call.interest_level && (
                                                    <tr>
                                                        <td className="text-muted">
                                                            <TrendingUp size={16} className="me-2" />
                                                            Nivel de Interés:
                                                        </td>
                                                        <td><Badge color="warning">{call.interest_level}</Badge></td>
                                                    </tr>
                                                )}
                                                {call.interested_in && (
                                                    <tr>
                                                        <td className="text-muted">Interesado en:</td>
                                                        <td>{call.interested_in}</td>
                                                    </tr>
                                                )}
                                                {call.call_list && (
                                                    <tr>
                                                        <td className="text-muted">Listado:</td>
                                                        <td>{call.call_list.name}</td>
                                                    </tr>
                                                )}
                                                {call.converted_client && (
                                                    <tr>
                                                        <td className="text-muted">Convertido a:</td>
                                                        <td>
                                                            <Badge color="success">
                                                                Cliente #{call.converted_client.id}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </TabPane>

                    {/* Notes Tab */}
                    <TabPane tabId="notes">
                        <Card>
                            <CardBody>
                                <h5 className="mb-3">Historial de Llamadas</h5>
                                {call.notes && call.notes.length > 0 ? (
                                    <div className="timeline">
                                        {call.notes.map((note, index) => (
                                            <div key={note.id} className="timeline-item mb-4">
                                                <div className="d-flex">
                                                    <div className="timeline-badge">
                                                        <MessageSquare size={20} />
                                                    </div>
                                                    <Card className="w-100 ms-3">
                                                        <CardBody>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <div>
                                                                    <strong>{note.user?.name || 'Usuario'}</strong>
                                                                    <Badge color="info" className="ms-2">
                                                                        {note.call_outcome}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-muted">
                                                                    <small>
                                                                        {new Date(note.called_at).toLocaleString('es-ES')}
                                                                    </small>
                                                                    {note.call_duration && (
                                                                        <Badge color="secondary" className="ms-2">
                                                                            <Clock size={12} className="me-1" />
                                                                            {Math.floor(note.call_duration / 60)}:{String(note.call_duration % 60).padStart(2, '0')}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="mb-0">{note.notes}</p>
                                                        </CardBody>
                                                    </Card>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-5">
                                        <MessageSquare size={48} className="mb-3 opacity-25" />
                                        <p>No hay historial de llamadas</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </TabPane>

                    {/* Scripts Tab */}
                    <TabPane tabId="scripts">
                        <Row>
                            <Col md={4}>
                                <Card>
                                    <CardBody>
                                        <h6 className="mb-3">Scripts Disponibles</h6>
                                        {scripts && scripts.length > 0 ? (
                                            <div className="list-group">
                                                {scripts.map(script => (
                                                    <button
                                                        key={script.id}
                                                        className={`list-group-item list-group-item-action ${selectedScript?.id === script.id ? 'active' : ''}`}
                                                        onClick={() => setSelectedScript(script)}
                                                    >
                                                        {script.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted">No hay scripts disponibles</p>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md={8}>
                                {selectedScript ? (
                                    <Card>
                                        <CardBody>
                                            <h5 className="mb-3">{selectedScript.name}</h5>
                                            {selectedScript.description && (
                                                <p className="text-muted">{selectedScript.description}</p>
                                            )}

                                            {selectedScript.opening && (
                                                <div className="mb-4">
                                                    <h6 className="text-primary">Apertura:</h6>
                                                    <p className="bg-light p-3 rounded">{selectedScript.opening}</p>
                                                </div>
                                            )}

                                            {selectedScript.pitch && (
                                                <div className="mb-4">
                                                    <h6 className="text-success">Pitch:</h6>
                                                    <p className="bg-light p-3 rounded">{selectedScript.pitch}</p>
                                                </div>
                                            )}

                                            {selectedScript.objection_handling && (
                                                <div className="mb-4">
                                                    <h6 className="text-warning">Manejo de Objeciones:</h6>
                                                    <p className="bg-light p-3 rounded">{selectedScript.objection_handling}</p>
                                                </div>
                                            )}

                                            {selectedScript.closing && (
                                                <div className="mb-4">
                                                    <h6 className="text-danger">Cierre:</h6>
                                                    <p className="bg-light p-3 rounded">{selectedScript.closing}</p>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardBody className="text-center text-muted py-5">
                                            <FileText size={48} className="mb-3 opacity-25" />
                                            <p>Selecciona un script para ver su contenido</p>
                                        </CardBody>
                                    </Card>
                                )}
                            </Col>
                        </Row>
                    </TabPane>
                </TabContent>

                {/* Log Call Modal - same as MyCalls */}
                <Modal isOpen={modalLog} toggle={() => setModalLog(!modalLog)} size="lg">
                    <ModalHeader toggle={() => setModalLog(!modalLog)}>
                        Registrar Llamada
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

                {/* Convert Modal */}
                <Modal isOpen={modalConvert} toggle={() => setModalConvert(!modalConvert)}>
                    <ModalHeader toggle={() => setModalConvert(!modalConvert)}>
                        Convertir Llamada
                    </ModalHeader>
                    <ModalBody>
                        <p>¿A qué tipo deseas convertir esta llamada?</p>
                        <div className="d-flex gap-2 justify-content-center">
                            <Btn
                                attrBtn={{
                                    color: convertForm.data.type === 'contact' ? 'primary' : 'outline-primary',
                                    onClick: () => convertForm.setData('type', 'contact')
                                }}
                            >
                                Contacto
                            </Btn>
                            <Btn
                                attrBtn={{
                                    color: convertForm.data.type === 'client' ? 'success' : 'outline-success',
                                    onClick: () => convertForm.setData('type', 'client')
                                }}
                            >
                                Cliente
                            </Btn>
                        </div>
                        <p className="text-muted mt-3 small">
                            Se creará un registro de {convertForm.data.type === 'contact' ? 'contacto' : 'cliente'} con la información de esta llamada.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'success',
                                disabled: convertForm.processing,
                                onClick: convertCall
                            }}
                        >
                            {convertForm.processing ? 'Convirtiendo...' : 'Convertir'}
                        </Btn>
                        <Btn
                            attrBtn={{
                                color: 'secondary',
                                onClick: () => setModalConvert(false)
                            }}
                        >
                            Cancelar
                        </Btn>
                    </ModalFooter>
                </Modal>

                <Btn
                    attrBtn={{
                        color: 'secondary',
                        className: 'mt-3',
                        onClick: () => router.visit(route('telemarketing.my-calls'))
                    }}
                >
                    Volver a Mis Llamadas
                </Btn>
            </Fragment>
        </AuthenticatedLayout>
    )
}
