import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Mail, MailOpen, Send, Eye } from "react-feather";
import DataTable from 'react-data-table-component';

export default function Messages({ auth, messages, unreadCount, users }) {
    const [modalCompose, setModalCompose] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        to_user_id: '',
        subject: '',
        body: '',
        client_id: '',
    });

    const userOptions = users ? users.map(user => ({
        value: user.id,
        label: `${user.name} ${user.last_name || ''}`
    })) : [];

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const openComposeModal = () => {
        reset();
        setModalCompose(true);
    }

    const sendMessage = () => {
        post(route('messages.store'), {
            onSuccess: () => {
                setModalCompose(false);
                reset();
            }
        });
    }

    const viewMessage = (message) => {
        router.visit(route('messages.show', message.id));
    }

    const tableColumns = [
        {
            name: '',
            selector: row => (
                <div className="text-center">
                    {row.is_read ? (
                        <MailOpen size={18} className="text-muted" />
                    ) : (
                        <Mail size={18} className="text-primary" />
                    )}
                </div>
            ),
            sortable: false,
            width: '50px',
        },
        {
            name: 'De',
            selector: row => (
                <div>
                    <strong className={!row.is_read ? 'fw-bold' : ''}>
                        {row.sender?.name || '-'}
                    </strong>
                </div>
            ),
            sortable: true,
            width: '200px',
        },
        {
            name: 'Asunto',
            selector: row => (
                <div>
                    <span className={!row.is_read ? 'fw-bold' : ''}>
                        {row.subject}
                    </span>
                    {row.client && (
                        <>
                            <br />
                            <small className="text-muted">
                                Cliente: {row.client.name}
                            </small>
                        </>
                    )}
                </div>
            ),
            sortable: true,
            wrap: true,
        },
        {
            name: 'Fecha',
            selector: row => {
                const date = new Date(row.created_at);
                return (
                    <div>
                        <small>{date.toLocaleDateString('es-ES')}</small>
                        <br />
                        <small className="text-muted">
                            {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </small>
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
                    <Eye
                        size={18}
                        className="cursor-pointer text-primary"
                        onClick={() => viewMessage(row)}
                        title="Ver mensaje"
                    />
                </div>
            ),
            sortable: false,
            center: true,
            width: '100px',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mensajes" />
            <Fragment>
                <Breadcrumbs mainTitle="Mensajes" parent="Sistema" title="Bandeja de Entrada" />

                {/* Summary Cards */}
                <Row className="mb-4">
                    <Col md={4} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Mail size={32} className="text-primary" />
                                </div>
                                <h6 className="text-muted mb-1">Mensajes No Leídos</h6>
                                <h3 className="mb-0 text-primary">{unreadCount}</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <MailOpen size={32} className="text-success" />
                                </div>
                                <h6 className="text-muted mb-1">Total Mensajes</h6>
                                <h3 className="mb-0">{messages.total || 0}</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <Btn
                                    attrBtn={{
                                        color: 'primary',
                                        size: 'lg',
                                        onClick: openComposeModal,
                                        className: 'w-100'
                                    }}
                                >
                                    <Send size={20} className="me-2" />
                                    Nuevo Mensaje
                                </Btn>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Bandeja de Entrada</h5>
                            <div className="d-flex gap-2">
                                <Btn
                                    attrBtn={{
                                        color: 'outline-secondary',
                                        size: 'sm',
                                        onClick: () => router.visit(route('messages.sent'))
                                    }}
                                >
                                    <Send size={14} className="me-1" />
                                    Enviados
                                </Btn>
                            </div>
                        </div>

                        <DataTable
                            columns={tableColumns}
                            data={messages.data || []}
                            pagination
                            paginationServer
                            paginationTotalRows={messages.total}
                            paginationDefaultPage={messages.current_page}
                            onChangePage={page => router.visit(route('messages.index', { page }))}
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay mensajes"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                            onRowClicked={viewMessage}
                            pointerOnHover
                        />
                    </CardBody>
                </Card>

                {/* Compose Modal */}
                <Modal isOpen={modalCompose} toggle={() => setModalCompose(!modalCompose)} size="lg">
                    <ModalHeader toggle={() => setModalCompose(!modalCompose)}>
                        Nuevo Mensaje
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12'>
                                <Select
                                    label={{ label: 'Para *' }}
                                    input={{
                                        placeholder: 'Seleccionar destinatario',
                                        onChange: (e) => setData('to_user_id', e ? e.value : ''),
                                        name: 'to_user_id',
                                        options: userOptions,
                                    }}
                                    errors={errors.to_user_id}
                                />
                            </Col>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Asunto *' }}
                                    input={{
                                        placeholder: 'Asunto del mensaje',
                                        onChange: handleChange,
                                        name: 'subject',
                                        value: data.subject
                                    }}
                                    errors={errors.subject}
                                />
                            </Col>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Mensaje *' }}
                                    input={{
                                        placeholder: 'Escribe tu mensaje aquí...',
                                        onChange: handleChange,
                                        name: 'body',
                                        value: data.body,
                                        type: 'textarea',
                                        rows: 8
                                    }}
                                    errors={errors.body}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: sendMessage
                            }}
                        >
                            {processing ? 'Enviando...' : (
                                <>
                                    <Send size={16} className="me-2" />
                                    Enviar Mensaje
                                </>
                            )}
                        </Btn>
                        <Btn
                            attrBtn={{
                                color: 'secondary',
                                onClick: () => setModalCompose(false)
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
