import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import DataTable from 'react-data-table-component';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { AlertCircle, Package } from "react-feather";

export default function Stock({ auth, warehouse, stockData, availableProducts }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        stock: 0,
        min_stock: 0,
        max_stock: null,
        reorder_point: 0,
        reorder_quantity: 0,
        location_code: '',
        cost_price: null,
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const openModal = (product = null) => {
        if (product) {
            setData({
                product_id: product.product_id,
                stock: product.stock,
                min_stock: product.min_stock,
                max_stock: product.max_stock,
                reorder_point: product.reorder_point,
                reorder_quantity: product.reorder_quantity,
                location_code: product.location_code || '',
                cost_price: product.cost_price,
            });
            setSelectedProduct(product);
        } else {
            reset();
            setSelectedProduct(null);
        }
        setModalOpen(true);
    }

    const saveStock = () => {
        post(route('warehouses.stock.update', warehouse.id), {
            onSuccess: () => {
                setModalOpen(false);
                reset();
            }
        });
    }

    const productOptions = availableProducts.map(p => ({
        value: p.id,
        label: `${p.name} - ${p.model}`
    }));

    const tableColumns = [
        {
            name: 'Producto',
            selector: row => `${row.product_name} - ${row.product_model}`,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Stock Actual',
            selector: row => {
                const percentage = row.stock_percentage;
                let color = 'success';
                if (percentage < 25) color = 'danger';
                else if (percentage < 50) color = 'warning';

                return (
                    <div className="d-flex align-items-center">
                        <Badge color={color} className="me-2">{row.stock}</Badge>
                        {row.is_low_stock && <AlertCircle size={16} className="text-danger" title="Stock bajo" />}
                    </div>
                );
            },
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Stock Mín/Máx',
            selector: row => `${row.min_stock} / ${row.max_stock || '-'}`,
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Punto Reorden',
            selector: row => row.reorder_point,
            sortable: true,
            center: true,
            width: '120px',
        },
        {
            name: 'Cantidad Reorden',
            selector: row => row.reorder_quantity,
            sortable: true,
            center: true,
            width: '140px',
        },
        {
            name: 'Ubicación',
            selector: row => row.location_code || '-',
            sortable: true,
            width: '100px',
        },
        {
            name: 'Precio Coste',
            selector: row => row.cost_price ? `€${parseFloat(row.cost_price).toFixed(2)}` : '-',
            sortable: true,
            right: true,
            width: '120px',
        },
        {
            name: 'Estado',
            selector: row => {
                if (row.needs_reorder) {
                    return <Badge color="danger">Necesita Reorden</Badge>;
                } else if (row.is_low_stock) {
                    return <Badge color="warning">Stock Bajo</Badge>;
                }
                return <Badge color="success">OK</Badge>;
            },
            sortable: true,
            center: true,
            width: '150px',
        },
        {
            name: 'Acciones',
            selector: (row) => (
                <Btn
                    attrBtn={{
                        color: 'primary',
                        size: 'sm',
                        onClick: () => openModal(row)
                    }}
                >
                    Editar
                </Btn>
            ),
            sortable: false,
            center: true,
            width: '100px',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Stock - ${warehouse.name}`} />
            <Fragment>
                <Breadcrumbs
                    mainTitle={`Stock - ${warehouse.name}`}
                    parent="Almacenes"
                    title={`Stock - ${warehouse.name}`}
                />

                <Row className="mb-3">
                    <Col>
                        <Card>
                            <CardBody>
                                <h5>{warehouse.name}</h5>
                                <p className="mb-0"><strong>Código:</strong> {warehouse.code}</p>
                                <p className="mb-0"><strong>Ubicación:</strong> {warehouse.location || '-'}</p>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between mb-3">
                            <h5>Productos en Stock</h5>
                            <Btn
                                attrBtn={{
                                    color: 'primary',
                                    onClick: () => openModal()
                                }}
                            >
                                <Package size={16} className="me-2" />
                                Añadir Producto
                            </Btn>
                        </div>

                        <DataTable
                            columns={tableColumns}
                            data={stockData || []}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay productos en este almacén"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                        />
                    </CardBody>
                </Card>

                {/* Modal for adding/editing stock */}
                <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
                    <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
                        {selectedProduct ? 'Editar Stock' : 'Añadir Producto'}
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12' md='6'>
                                <Select
                                    label={{ label: 'Producto *' }}
                                    input={{
                                        placeholder: 'Seleccionar producto',
                                        onChange: (e) => setData('product_id', e ? e.value : ''),
                                        name: 'product_id',
                                        options: productOptions,
                                        defaultValue: productOptions.find(p => p.value === data.product_id),
                                        isDisabled: !!selectedProduct,
                                    }}
                                    errors={errors.product_id}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Código de Ubicación' }}
                                    input={{
                                        placeholder: 'Ej: A-12-3',
                                        onChange: handleChange,
                                        name: 'location_code',
                                        value: data.location_code
                                    }}
                                    errors={errors.location_code}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Stock Actual *' }}
                                    input={{
                                        placeholder: '0',
                                        onChange: handleChange,
                                        name: 'stock',
                                        value: data.stock,
                                        type: 'number',
                                        min: 0
                                    }}
                                    errors={errors.stock}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Stock Mínimo *' }}
                                    input={{
                                        placeholder: '0',
                                        onChange: handleChange,
                                        name: 'min_stock',
                                        value: data.min_stock,
                                        type: 'number',
                                        min: 0
                                    }}
                                    errors={errors.min_stock}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Stock Máximo' }}
                                    input={{
                                        placeholder: '0',
                                        onChange: handleChange,
                                        name: 'max_stock',
                                        value: data.max_stock || '',
                                        type: 'number',
                                        min: 0
                                    }}
                                    errors={errors.max_stock}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Punto de Reorden *' }}
                                    input={{
                                        placeholder: '0',
                                        onChange: handleChange,
                                        name: 'reorder_point',
                                        value: data.reorder_point,
                                        type: 'number',
                                        min: 0
                                    }}
                                    errors={errors.reorder_point}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Cantidad de Reorden *' }}
                                    input={{
                                        placeholder: '0',
                                        onChange: handleChange,
                                        name: 'reorder_quantity',
                                        value: data.reorder_quantity,
                                        type: 'number',
                                        min: 0
                                    }}
                                    errors={errors.reorder_quantity}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Precio de Coste' }}
                                    input={{
                                        placeholder: '0.00',
                                        onChange: handleChange,
                                        name: 'cost_price',
                                        value: data.cost_price || '',
                                        type: 'number',
                                        step: '0.01',
                                        min: 0
                                    }}
                                    errors={errors.cost_price}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: saveStock
                            }}
                        >
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Btn>
                        <Btn
                            attrBtn={{
                                color: 'secondary',
                                onClick: () => setModalOpen(false)
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
                        onClick: () => router.visit(route('warehouses.index'))
                    }}
                >
                    Volver a Almacenes
                </Btn>
            </Fragment>
        </AuthenticatedLayout>
    )
}
