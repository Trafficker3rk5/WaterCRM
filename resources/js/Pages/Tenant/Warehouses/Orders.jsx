import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import DataTable from 'react-data-table-component';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Package, Plus, CheckCircle, ArrowLeft, TrendingUp, ShoppingCart } from "react-feather";

export default function Orders({ auth, warehouse, orders, products }) {
    const [modalCreate, setModalCreate] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        quantity: '',
        unit_price: '',
        supplier: '',
        expected_at: '',
        notes: '',
    });

    const productOptions = products ? products.map(product => ({
        value: product.id,
        label: `${product.name} ${product.model ? '- ' + product.model : ''}`
    })) : [];

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const openCreateModal = () => {
        reset();
        setModalCreate(true);
    }

    const createOrder = () => {
        post(route('warehouses.orders.create', warehouse.id), {
            onSuccess: () => {
                setModalCreate(false);
                reset();
            }
        });
    }

    const receiveOrder = (orderId) => {
        if (confirm('¿Confirmar recepción del pedido? Esto actualizará el stock del almacén.')) {
            router.post(route('warehouses.orders.receive', orderId));
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'warning', text: 'Pendiente' },
            'ordered': { color: 'info', text: 'Pedido' },
            'received': { color: 'success', text: 'Recibido' },
            'cancelled': { color: 'danger', text: 'Cancelado' },
        };
        const config = statusConfig[status] || { color: 'secondary', text: status };
        return <Badge color={config.color}>{config.text}</Badge>;
    }

    const getTypeBadge = (type) => {
        const colors = { 'automatic': 'info', 'manual': 'primary' };
        const labels = { 'automatic': 'Automático', 'manual': 'Manual' };
        return <Badge color={colors[type] || 'primary'}>{labels[type] || type}</Badge>;
    }

    const tableColumns = [
        {
            name: 'Tipo',
            selector: row => getTypeBadge(row.order_type),
            sortable: true,
            center: true,
            width: '110px',
        },
        {
            name: 'Producto',
            selector: row => (
                <div>
                    <strong>{row.product?.name || '-'}</strong>
                    {row.product?.model && (
                        <>
                            <br />
                            <small className="text-muted">{row.product.model}</small>
                        </>
                    )}
                </div>
            ),
            sortable: true,
            wrap: true,
        },
        {
            name: 'Cantidad',
            selector: row => (
                <div className="text-center">
                    <Badge color="info">{row.quantity}</Badge>
                </div>
            ),
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Precio Unit.',
            selector: row => row.unit_price ? `${parseFloat(row.unit_price).toFixed(2)} €` : '-',
            sortable: true,
            center: true,
            width: '110px',
        },
        {
            name: 'Total',
            selector: row => row.total_price ? (
                <strong className="text-success">{parseFloat(row.total_price).toFixed(2)} €</strong>
            ) : '-',
            sortable: true,
            center: true,
            width: '110px',
        },
        {
            name: 'Proveedor',
            selector: row => row.supplier || '-',
            sortable: true,
            width: '150px',
        },
        {
            name: 'Estado',
            selector: row => getStatusBadge(row.status),
            sortable: true,
            center: true,
            width: '110px',
        },
        {
            name: 'Fecha Esperada',
            selector: row => row.expected_at ? new Date(row.expected_at).toLocaleDateString('es-ES') : '-',
            sortable: true,
            width: '130px',
        },
        {
            name: 'Fecha Recepción',
            selector: row => row.received_at ? (
                <div>
                    <small className="text-success">
                        {new Date(row.received_at).toLocaleDateString('es-ES')}
                    </small>
                </div>
            ) : '-',
            sortable: true,
            width: '130px',
        },
        {
            name: 'Acciones',
            selector: (row) => (
                <div className="d-flex gap-1">
                    {(row.status === 'pending' || row.status === 'ordered') && (
                        <CheckCircle
                            size={18}
                            className="cursor-pointer text-success"
                            onClick={() => receiveOrder(row.id)}
                            title="Marcar como recibido"
                        />
                    )}
                </div>
            ),
            sortable: false,
            center: true,
            width: '100px',
        },
    ];

    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'ordered');
    const receivedOrders = orders.filter(o => o.status === 'received');
    const totalPendingValue = pendingOrders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Pedidos - ${warehouse.name}`} />
            <Fragment>
                <Breadcrumbs
                    mainTitle={`Pedidos de ${warehouse.name}`}
                    parent="Almacenes"
                    title="Pedidos"
                />

                <Row className="mb-3">
                    <Col>
                        <Btn
                            attrBtn={{
                                color: 'outline-secondary',
                                size: 'sm',
                                onClick: () => router.visit(route('warehouses.index'))
                            }}
                        >
                            <ArrowLeft size={14} className="me-2" />
                            Volver a Almacenes
                        </Btn>
                    </Col>
                </Row>

                {/* Summary Cards */}
                <Row className="mb-4">
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <ShoppingCart size={32} className="text-warning" />
                                </div>
                                <h6 className="text-muted mb-1">Pedidos Pendientes</h6>
                                <h3 className="mb-0 text-warning">{pendingOrders.length}</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <CheckCircle size={32} className="text-success" />
                                </div>
                                <h6 className="text-muted mb-1">Pedidos Recibidos</h6>
                                <h3 className="mb-0 text-success">{receivedOrders.length}</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <TrendingUp size={32} className="text-info" />
                                </div>
                                <h6 className="text-muted mb-1">Valor Pendiente</h6>
                                <h3 className="mb-0 text-info">{totalPendingValue.toFixed(2)} €</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Package size={32} className="text-primary" />
                                </div>
                                <h6 className="text-muted mb-1">Total Pedidos</h6>
                                <h3 className="mb-0">{orders.length}</h3>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 className="mb-1">Pedidos de Almacén</h5>
                                <p className="text-muted mb-0">
                                    <strong>{warehouse.name}</strong> - {warehouse.code}
                                </p>
                            </div>
                            {auth.user.rol_id <= 1 && (
                                <Btn
                                    attrBtn={{
                                        color: 'primary',
                                        onClick: openCreateModal
                                    }}
                                >
                                    <Plus size={16} className="me-2" />
                                    Nuevo Pedido
                                </Btn>
                            )}
                        </div>

                        {orders.length > 0 ? (
                            <DataTable
                                columns={tableColumns}
                                data={orders}
                                pagination
                                highlightOnHover
                                striped
                                responsive
                                noDataComponent="No hay pedidos"
                                paginationComponentOptions={{
                                    rowsPerPageText: 'Filas por página:',
                                    rangeSeparatorText: 'de',
                                }}
                            />
                        ) : (
                            <div className="text-center py-5">
                                <Package size={64} className="text-muted mb-3 opacity-25" />
                                <h5 className="text-muted">No hay pedidos registrados</h5>
                                <p className="text-muted">
                                    Crea pedidos para reabastecer el almacén
                                </p>
                                {auth.user.rol_id <= 1 && (
                                    <Btn
                                        attrBtn={{
                                            color: 'primary',
                                            onClick: openCreateModal
                                        }}
                                    >
                                        Crear Primer Pedido
                                    </Btn>
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Create Order Modal */}
                <Modal isOpen={modalCreate} toggle={() => setModalCreate(!modalCreate)} size="lg">
                    <ModalHeader toggle={() => setModalCreate(!modalCreate)}>
                        Nuevo Pedido
                        <div className="text-muted small mt-1">
                            {warehouse.name}
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12'>
                                <Select
                                    label={{ label: 'Producto *' }}
                                    input={{
                                        placeholder: 'Seleccionar producto',
                                        onChange: (e) => setData('product_id', e ? e.value : ''),
                                        name: 'product_id',
                                        options: productOptions,
                                    }}
                                    errors={errors.product_id}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Cantidad *' }}
                                    input={{
                                        placeholder: '0',
                                        onChange: handleChange,
                                        name: 'quantity',
                                        value: data.quantity,
                                        type: 'number',
                                        min: 1
                                    }}
                                    errors={errors.quantity}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Precio Unitario (€)' }}
                                    input={{
                                        placeholder: '0.00',
                                        onChange: handleChange,
                                        name: 'unit_price',
                                        value: data.unit_price,
                                        type: 'number',
                                        step: '0.01',
                                        min: 0
                                    }}
                                    errors={errors.unit_price}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Proveedor' }}
                                    input={{
                                        placeholder: 'Nombre del proveedor',
                                        onChange: handleChange,
                                        name: 'supplier',
                                        value: data.supplier
                                    }}
                                    errors={errors.supplier}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Fecha Esperada' }}
                                    input={{
                                        onChange: handleChange,
                                        name: 'expected_at',
                                        value: data.expected_at,
                                        type: 'date'
                                    }}
                                    errors={errors.expected_at}
                                />
                            </Col>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Notas' }}
                                    input={{
                                        placeholder: 'Información adicional sobre el pedido',
                                        onChange: handleChange,
                                        name: 'notes',
                                        value: data.notes,
                                        type: 'textarea',
                                        rows: 3
                                    }}
                                    errors={errors.notes}
                                />
                            </Col>
                            {data.quantity && data.unit_price && (
                                <Col xs='12'>
                                    <div className="alert alert-info">
                                        <strong>Total estimado:</strong> {(parseFloat(data.quantity) * parseFloat(data.unit_price)).toFixed(2)} €
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: createOrder
                            }}
                        >
                            {processing ? 'Creando...' : (
                                <>
                                    <Plus size={16} className="me-2" />
                                    Crear Pedido
                                </>
                            )}
                        </Btn>
                        <Btn
                            attrBtn={{
                                color: 'secondary',
                                onClick: () => setModalCreate(false)
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
