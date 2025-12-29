import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import { CheckCircle, XCircle, Eye, Package, Truck, User } from "react-feather";
import DataTable from 'react-data-table-component';

export default function PendingValidation({ auth, orders }) {
    const [modalValidate, setModalValidate] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        validation_comments: '',
        items: [],
    });

    const openValidateModal = (order) => {
        setSelectedOrder(order);
        // Initialize items with requested quantities
        const items = order.items.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product?.name || '-',
            quantity_requested: item.quantity_requested,
            quantity_loaded: item.quantity_requested, // Default to requested
        }));
        setData({
            validation_comments: '',
            items: items,
        });
        setModalValidate(true);
    }

    const updateItemQuantity = (itemId, quantity) => {
        setData('items', data.items.map(item =>
            item.id === itemId ? { ...item, quantity_loaded: parseInt(quantity) || 0 } : item
        ));
    }

    const validateOrder = () => {
        if (selectedOrder) {
            post(route('loading-orders.validate', selectedOrder.id), {
                onSuccess: () => {
                    setModalValidate(false);
                    setSelectedOrder(null);
                    reset();
                }
            });
        }
    }

    const cancelOrder = (orderId) => {
        if (confirm('¿Estás seguro de cancelar esta orden?')) {
            router.post(route('loading-orders.cancel', orderId));
        }
    }

    const tableColumns = [
        {
            name: 'Orden',
            selector: row => (
                <div>
                    <strong>{row.order_number}</strong>
                    <br />
                    <small className="text-muted">
                        {new Date(row.created_at).toLocaleDateString('es-ES')}
                    </small>
                </div>
            ),
            sortable: true,
            width: '130px',
        },
        {
            name: 'Instalador',
            selector: row => (
                <div>
                    <strong>{row.installer_warehouse?.user?.name || '-'}</strong>
                    <br />
                    <small className="text-muted">
                        {row.installer_warehouse?.name || '-'}
                    </small>
                    {row.installer_warehouse?.vehicle_plate && (
                        <>
                            <br />
                            <small className="text-muted">
                                {row.installer_warehouse.vehicle_plate}
                            </small>
                        </>
                    )}
                </div>
            ),
            sortable: true,
            wrap: true,
        },
        {
            name: 'Almacén Origen',
            selector: row => row.source_warehouse?.name || 'Principal',
            sortable: true,
            width: '150px',
        },
        {
            name: 'Items',
            selector: row => (
                <div className="text-center">
                    <Badge color="info">{row.total_items || row.items?.length || 0}</Badge>
                </div>
            ),
            sortable: true,
            center: true,
            width: '80px',
        },
        {
            name: 'Creado por',
            selector: row => row.creator?.name || '-',
            sortable: true,
            width: '150px',
        },
        {
            name: 'Días Pendiente',
            selector: row => {
                const days = Math.floor((new Date() - new Date(row.created_at)) / (1000 * 60 * 60 * 24));
                return (
                    <Badge color={days > 2 ? 'danger' : days > 1 ? 'warning' : 'secondary'}>
                        {days} {days === 1 ? 'día' : 'días'}
                    </Badge>
                );
            },
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Acciones',
            selector: (row) => (
                <div className="d-flex gap-1">
                    <CheckCircle
                        size={18}
                        className="cursor-pointer text-success"
                        onClick={() => openValidateModal(row)}
                        title="Validar orden"
                    />
                    <Eye
                        size={18}
                        className="cursor-pointer text-info"
                        onClick={() => router.visit(route('loading-orders.show', row.id))}
                        title="Ver detalles"
                    />
                    <XCircle
                        size={18}
                        className="cursor-pointer text-danger"
                        onClick={() => cancelOrder(row.id)}
                        title="Cancelar orden"
                    />
                </div>
            ),
            sortable: false,
            center: true,
            width: '130px',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Órdenes Pendientes de Validación" />
            <Fragment>
                <Breadcrumbs
                    mainTitle="Órdenes Pendientes"
                    parent="Órdenes de Carga"
                    title="Validación Pendiente"
                />

                {/* Summary Cards */}
                <Row className="mb-4">
                    <Col md={4} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Package size={32} className="text-warning" />
                                </div>
                                <h6 className="text-muted mb-1">Órdenes Pendientes</h6>
                                <h3 className="mb-0 text-warning">{orders.length}</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Badge color="danger" style={{fontSize: '2rem'}}>!</Badge>
                                </div>
                                <h6 className="text-muted mb-1">Urgentes (&gt;2 días)</h6>
                                <h3 className="mb-0 text-danger">
                                    {orders.filter(o => {
                                        const days = Math.floor((new Date() - new Date(o.created_at)) / (1000 * 60 * 60 * 24));
                                        return days > 2;
                                    }).length}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Truck size={32} className="text-info" />
                                </div>
                                <h6 className="text-muted mb-1">Total Items</h6>
                                <h3 className="mb-0">
                                    {orders.reduce((sum, o) => sum + (o.total_items || 0), 0)}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Órdenes de Carga Pendientes de Validación</h5>
                            <Btn
                                attrBtn={{
                                    color: 'outline-secondary',
                                    size: 'sm',
                                    onClick: () => router.visit(route('loading-orders.index'))
                                }}
                            >
                                Ver Todas las Órdenes
                            </Btn>
                        </div>

                        {orders.length > 0 ? (
                            <DataTable
                                columns={tableColumns}
                                data={orders}
                                pagination
                                highlightOnHover
                                striped
                                responsive
                                noDataComponent="No hay órdenes pendientes de validación"
                                paginationComponentOptions={{
                                    rowsPerPageText: 'Filas por página:',
                                    rangeSeparatorText: 'de',
                                }}
                            />
                        ) : (
                            <div className="text-center py-5">
                                <CheckCircle size={64} className="text-success mb-3 opacity-25" />
                                <h5 className="text-muted">No hay órdenes pendientes</h5>
                                <p className="text-muted">
                                    Todas las órdenes han sido validadas
                                </p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Validate Modal */}
                {selectedOrder && (
                    <Modal isOpen={modalValidate} toggle={() => setModalValidate(!modalValidate)} size="xl">
                        <ModalHeader toggle={() => setModalValidate(!modalValidate)}>
                            Validar Orden de Carga
                            <div className="text-muted small mt-1">
                                {selectedOrder.order_number} - {selectedOrder.installer_warehouse?.user?.name}
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <div className="d-flex align-items-start mb-3">
                                        <User size={18} className="text-muted me-2 mt-1" />
                                        <div>
                                            <small className="text-muted d-block">Instalador:</small>
                                            <strong>{selectedOrder.installer_warehouse?.user?.name}</strong>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="d-flex align-items-start mb-3">
                                        <Truck size={18} className="text-muted me-2 mt-1" />
                                        <div>
                                            <small className="text-muted d-block">Vehículo:</small>
                                            <strong>{selectedOrder.installer_warehouse?.name}</strong>
                                            {selectedOrder.installer_warehouse?.vehicle_plate && (
                                                <small className="text-muted d-block">
                                                    {selectedOrder.installer_warehouse.vehicle_plate}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {selectedOrder.notes && (
                                <Row className="mb-3">
                                    <Col xs='12'>
                                        <div className="alert alert-info">
                                            <strong>Notas de la orden:</strong>
                                            <p className="mb-0 mt-2">{selectedOrder.notes}</p>
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            <Row className="mb-3">
                                <Col xs='12'>
                                    <h6 className="mb-3">Productos Solicitados</h6>
                                    <div className="table-responsive">
                                        <Table bordered hover size="sm">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Producto</th>
                                                    <th className="text-center" style={{width: '150px'}}>
                                                        Solicitado
                                                    </th>
                                                    <th className="text-center" style={{width: '200px'}}>
                                                        Cantidad a Cargar *
                                                    </th>
                                                    <th style={{width: '150px'}}>Notas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.items.map((item, index) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <strong>{item.product_name}</strong>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge color="info">{item.quantity_requested}</Badge>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm text-center"
                                                                value={item.quantity_loaded}
                                                                onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                                                                min="0"
                                                                max={item.quantity_requested}
                                                            />
                                                        </td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {selectedOrder.items.find(i => i.id === item.id)?.notes || '-'}
                                                            </small>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-light">
                                                <tr>
                                                    <td><strong>TOTALES</strong></td>
                                                    <td className="text-center">
                                                        <strong>{data.items.reduce((sum, i) => sum + i.quantity_requested, 0)}</strong>
                                                    </td>
                                                    <td className="text-center">
                                                        <strong>{data.items.reduce((sum, i) => sum + i.quantity_loaded, 0)}</strong>
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs='12'>
                                    <FloatingInput
                                        label={{ label: 'Comentarios de Validación' }}
                                        input={{
                                            placeholder: 'Añade comentarios sobre la validación (opcional)',
                                            onChange: (e) => setData('validation_comments', e.target.value),
                                            name: 'validation_comments',
                                            value: data.validation_comments,
                                            type: 'textarea',
                                            rows: 3
                                        }}
                                        errors={errors.validation_comments}
                                    />
                                </Col>
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Btn
                                attrBtn={{
                                    color: 'success',
                                    disabled: processing,
                                    onClick: validateOrder
                                }}
                            >
                                {processing ? 'Validando...' : (
                                    <>
                                        <CheckCircle size={16} className="me-2" />
                                        Validar Orden
                                    </>
                                )}
                            </Btn>
                            <Btn
                                attrBtn={{
                                    color: 'secondary',
                                    onClick: () => setModalValidate(false)
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
