import React, { Fragment } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardBody, Row, Col } from "reactstrap";
import { Send, Eye, Inbox } from "react-feather";
import DataTable from 'react-data-table-component';

export default function Sent({ auth, messages }) {
    const viewMessage = (message) => {
        router.visit(route('messages.show', message.id));
    }

    const tableColumns = [
        {
            name: '',
            selector: row => (
                <div className="text-center">
                    <Send size={18} className="text-success" />
                </div>
            ),
            sortable: false,
            width: '50px',
        },
        {
            name: 'Para',
            selector: row => (
                <div>
                    <strong>{row.recipient?.name || '-'}</strong>
                </div>
            ),
            sortable: true,
            width: '200px',
        },
        {
            name: 'Asunto',
            selector: row => (
                <div>
                    <span>{row.subject}</span>
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
            name: 'Leído',
            selector: row => (
                <div className="text-center">
                    {row.is_read ? (
                        <span className="text-success">✓ Leído</span>
                    ) : (
                        <span className="text-muted">No leído</span>
                    )}
                    {row.read_at && (
                        <>
                            <br />
                            <small className="text-muted">
                                {new Date(row.read_at).toLocaleDateString('es-ES')}
                            </small>
                        </>
                    )}
                </div>
            ),
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Fecha Envío',
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
            <Head title="Mensajes Enviados" />
            <Fragment>
                <Breadcrumbs mainTitle="Mensajes Enviados" parent="Sistema" title="Mensajes" />

                {/* Summary Cards */}
                <Row className="mb-4">
                    <Col md={4} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Send size={32} className="text-success" />
                                </div>
                                <h6 className="text-muted mb-1">Mensajes Enviados</h6>
                                <h3 className="mb-0">{messages.total || 0}</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <span style={{fontSize: '2rem'}}>✓</span>
                                </div>
                                <h6 className="text-muted mb-1">Leídos</h6>
                                <h3 className="mb-0 text-success">
                                    {messages.data?.filter(m => m.is_read).length || 0}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <Btn
                                    attrBtn={{
                                        color: 'outline-primary',
                                        size: 'lg',
                                        onClick: () => router.visit(route('messages.index')),
                                        className: 'w-100'
                                    }}
                                >
                                    <Inbox size={20} className="me-2" />
                                    Ir a Bandeja de Entrada
                                </Btn>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Mensajes Enviados</h5>
                        </div>

                        <DataTable
                            columns={tableColumns}
                            data={messages.data || []}
                            pagination
                            paginationServer
                            paginationTotalRows={messages.total}
                            paginationDefaultPage={messages.current_page}
                            onChangePage={page => router.visit(route('messages.sent', { page }))}
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No has enviado mensajes"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                            onRowClicked={viewMessage}
                            pointerOnHover
                        />
                    </CardBody>
                </Card>
            </Fragment>
        </AuthenticatedLayout>
    )
}
