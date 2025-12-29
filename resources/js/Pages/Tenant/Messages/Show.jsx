import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import { ArrowLeft, Reply, User, Calendar, Briefcase } from "react-feather";

export default function Show({ auth, message }) {
    const [modalReply, setModalReply] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        to_user_id: message.from_user_id,
        subject: `Re: ${message.subject}`,
        body: '',
        client_id: message.client_id || '',
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const openReplyModal = () => {
        reset({
            to_user_id: message.from_user_id,
            subject: `Re: ${message.subject}`,
            body: '',
            client_id: message.client_id || '',
        });
        setModalReply(true);
    }

    const sendReply = () => {
        post(route('messages.store'), {
            onSuccess: () => {
                setModalReply(false);
                router.visit(route('messages.index'));
            }
        });
    }

    const isReceived = message.to_user_id === auth.user.id;
    const otherUser = isReceived ? message.sender : message.recipient;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={message.subject} />
            <Fragment>
                <Breadcrumbs
                    mainTitle="Mensaje"
                    parent="Mensajes"
                    title={message.subject}
                />

                <Row className="mb-3">
                    <Col>
                        <Btn
                            attrBtn={{
                                color: 'outline-secondary',
                                size: 'sm',
                                onClick: () => router.visit(route(isReceived ? 'messages.index' : 'messages.sent'))
                            }}
                        >
                            <ArrowLeft size={14} className="me-2" />
                            Volver a {isReceived ? 'Bandeja de Entrada' : 'Enviados'}
                        </Btn>
                    </Col>
                </Row>

                <Card>
                    <CardBody>
                        {/* Message Header */}
                        <div className="border-bottom pb-3 mb-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="flex-grow-1">
                                    <h4 className="mb-2">{message.subject}</h4>
                                    <div className="d-flex flex-wrap gap-2">
                                        {isReceived ? (
                                            <Badge color="primary">Recibido</Badge>
                                        ) : (
                                            <Badge color="success">Enviado</Badge>
                                        )}
                                        {message.is_read && (
                                            <Badge color="info">Leído</Badge>
                                        )}
                                    </div>
                                </div>
                                {isReceived && (
                                    <Btn
                                        attrBtn={{
                                            color: 'primary',
                                            size: 'sm',
                                            onClick: openReplyModal
                                        }}
                                    >
                                        <Reply size={14} className="me-2" />
                                        Responder
                                    </Btn>
                                )}
                            </div>

                            {/* Message Meta */}
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="d-flex align-items-start">
                                        <User size={18} className="text-muted me-2 mt-1" />
                                        <div>
                                            <small className="text-muted d-block">
                                                {isReceived ? 'De:' : 'Para:'}
                                            </small>
                                            <strong>{otherUser?.name || '-'}</strong>
                                            {otherUser?.email && (
                                                <small className="text-muted d-block">
                                                    {otherUser.email}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="d-flex align-items-start">
                                        <Calendar size={18} className="text-muted me-2 mt-1" />
                                        <div>
                                            <small className="text-muted d-block">Fecha:</small>
                                            <strong>
                                                {new Date(message.created_at).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </strong>
                                        </div>
                                    </div>
                                </Col>
                                {message.client && (
                                    <Col md={6}>
                                        <div className="d-flex align-items-start">
                                            <Briefcase size={18} className="text-muted me-2 mt-1" />
                                            <div>
                                                <small className="text-muted d-block">Cliente:</small>
                                                <strong>{message.client.name}</strong>
                                                {message.client.email && (
                                                    <small className="text-muted d-block">
                                                        {message.client.email}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                {message.is_read && message.read_at && isReceived === false && (
                                    <Col md={6}>
                                        <div className="d-flex align-items-start">
                                            <Calendar size={18} className="text-success me-2 mt-1" />
                                            <div>
                                                <small className="text-muted d-block">Leído el:</small>
                                                <strong className="text-success">
                                                    {new Date(message.read_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </strong>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div>

                        {/* Message Body */}
                        <div className="message-body">
                            <div
                                className="p-4 bg-light rounded"
                                style={{
                                    minHeight: '200px',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.6'
                                }}
                            >
                                {message.body}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Reply Modal */}
                <Modal isOpen={modalReply} toggle={() => setModalReply(!modalReply)} size="lg">
                    <ModalHeader toggle={() => setModalReply(!modalReply)}>
                        Responder a {message.sender?.name}
                    </ModalHeader>
                    <ModalBody>
                        <Row>
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
                                        placeholder: 'Escribe tu respuesta aquí...',
                                        onChange: handleChange,
                                        name: 'body',
                                        value: data.body,
                                        type: 'textarea',
                                        rows: 8
                                    }}
                                    errors={errors.body}
                                />
                            </Col>
                            <Col xs='12'>
                                <div className="bg-light p-3 rounded mt-3">
                                    <small className="text-muted d-block mb-2">
                                        <strong>Mensaje original:</strong>
                                    </small>
                                    <div
                                        className="text-muted small"
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            maxHeight: '150px',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        {message.body}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: sendReply
                            }}
                        >
                            {processing ? 'Enviando...' : (
                                <>
                                    <Reply size={16} className="me-2" />
                                    Enviar Respuesta
                                </>
                            )}
                        </Btn>
                        <Btn
                            attrBtn={{
                                color: 'secondary',
                                onClick: () => setModalReply(false)
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
