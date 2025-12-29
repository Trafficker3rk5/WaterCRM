import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Table, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import FloatingInput from '@/Template/CommonElements/FloatingInput';

export default function Show({ auth, order, userRole }) {
    const [modalValidate, setModalValidate] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        validation_comments: '',
        items: order.items.map(item => ({
            id: item.id,
            quantity_loaded: item.quantity_loaded || item.quantity_requested
        }))
    });

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'warning', text: 'Pendiente' },
            'validated': { color: 'info', text: 'Validada' },
            'loaded': { color: 'success', text: 'Cargada' },
            'cancelled': { color: 'danger', text: 'Cancelada' }
        };
        const config = statusConfig[status] || { color: 'secondary', text: status };
        return <Badge color={config.color}>{config.text}</Badge>;
    };

    const handleItemChange = (index, value) => {
        const newItems = [...data.items];
        newItems[index].quantity_loaded = parseInt(value) || 0;
        setData('items', newItems);
    };

    const handleValidate = () => {
        post(route('loading-orders.validate', order.id), {
            onSuccess: () => setModalValidate(false)
        });
    };

    const handleMarkAsLoaded = () => {
        if (confirm('¿Confirmar que la orden ha sido cargada? Esto actualizará el stock del almacén.')) {
            router.post(route('loading-orders.mark-loaded', order.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Orden ${order.order_number}`} />
            <Fragment>
                <Breadcrumbs
                    mainTitle={`Orden ${order.order_number}`}
                    parent="Órdenes de Carga"
                    title={`Orden ${order.order_number}`}
                />

                <Row>
                    <Col md={6}>
                        <Card>
                            <CardBody>
                                <h5>Información de la Orden</h5>
                                <p><strong>Número:</strong> {order.order_number}</p>
                                <p><strong>Estado:</strong> {getStatusBadge(order.status)}</p>
                                <p><strong>Instalador:</strong> {order.installer_warehouse?.user?.name || '-'}</p>
                                <p><strong>Furgoneta:</strong> {order.installer_warehouse?.name || '-'}</p>
                                {order.installer_warehouse?.vehicle_plate && (
                                    <p><strong>Matrícula:</strong> {order.installer_warehouse.vehicle_plate}</p>
                                )}
                                <p><strong>Almacén Origen:</strong> {order.source_warehouse?.name || 'Sin asignar'}</p>
                                <p><strong>Creado por:</strong> {order.creator?.name || '-'}</p>
                                <p><strong>Fecha Creación:</strong> {new Date(order.created_at).toLocaleString('es-ES')}</p>
                                {order.notes && (
                                    <>
                                        <strong>Notas:</strong>
                                        <p className="text-muted">{order.notes}</p>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card>
                            <CardBody>
                                <h5>Estado de Validación</h5>
                                {order.status === 'pending' && (
                                    <Badge color="warning" className="mb-2">Pendiente de Validación</Badge>
                                )}
                                {order.validated_at && (
                                    <>
                                        <p><strong>Validado por:</strong> {order.validator?.name || '-'}</p>
                                        <p><strong>Fecha Validación:</strong> {new Date(order.validated_at).toLocaleString('es-ES')}</p>
                                    </>
                                )}
                                {order.validation_comments && (
                                    <>
                                        <strong>Comentarios de Validación:</strong>
                                        <p className="text-muted">{order.validation_comments}</p>
                                    </>
                                )}
                                {order.loaded_at && (
                                    <p><strong>Fecha Carga:</strong> {new Date(order.loaded_at).toLocaleString('es-ES')}</p>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <CardBody>
                        <h5 className="mb-3">Productos</h5>
                        <Table responsive striped>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th className="text-center">Cantidad Solicitada</th>
                                    <th className="text-center">Cantidad Cargada</th>
                                    <th>Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{item.product?.name || '-'}</td>
                                        <td className="text-center">{item.quantity_requested}</td>
                                        <td className="text-center">
                                            {order.status === 'loaded' || order.status === 'cancelled'
                                                ? item.quantity_loaded || 0
                                                : <Badge color="info">{item.quantity_loaded || 0}</Badge>
                                            }
                                        </td>
                                        <td>{item.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>Total</th>
                                    <th className="text-center">{order.total_items || 0}</th>
                                    <th className="text-center">{order.total_loaded || 0}</th>
                                    <th></th>
                                </tr>
                            </tfoot>
                        </Table>
                    </CardBody>
                </Card>

                <div className="d-flex gap-2 mt-3">
                    {order.status === 'pending' && [0, 1, 3].includes(userRole) && (
                        <Btn
                            attrBtn={{
                                color: 'success',
                                onClick: () => setModalValidate(true)
                            }}
                        >
                            Validar Orden
                        </Btn>
                    )}

                    {order.status === 'validated' && [0, 1, 3].includes(userRole) && (
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                onClick: handleMarkAsLoaded
                            }}
                        >
                            Marcar como Cargada
                        </Btn>
                    )}

                    <Btn
                        attrBtn={{
                            color: 'secondary',
                            onClick: () => router.visit(route('loading-orders.index'))
                        }}
                    >
                        Volver
                    </Btn>
                </div>

                {/* Validation Modal */}
                <Modal isOpen={modalValidate} toggle={() => setModalValidate(!modalValidate)} size="lg">
                    <ModalHeader toggle={() => setModalValidate(!modalValidate)}>
                        Validar Orden de Carga
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="mb-3">Ajustar Cantidades Cargadas</h6>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th className="text-center">Solicitada</th>
                                    <th className="text-center">Cantidad Cargada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{item.product?.name || '-'}</td>
                                        <td className="text-center">{item.quantity_requested}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="0"
                                                max={item.quantity_requested}
                                                value={data.items[index].quantity_loaded}
                                                onChange={(e) => handleItemChange(index, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <FloatingInput
                            label={{ label: 'Comentarios de Validación' }}
                            input={{
                                placeholder: 'Comentarios opcionales',
                                onChange: (e) => setData('validation_comments', e.target.value),
                                name: 'validation_comments',
                                value: data.validation_comments,
                                type: 'textarea'
                            }}
                            errors={errors.validation_comments}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'success',
                                disabled: processing,
                                onClick: handleValidate
                            }}
                        >
                            {processing ? 'Validando...' : 'Validar Orden'}
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
            </Fragment>
        </AuthenticatedLayout>
    )
}
