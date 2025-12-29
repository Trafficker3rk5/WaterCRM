import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col, Table, Badge } from 'reactstrap';
import { Plus, Trash2 } from "react-feather";

export default function LoadingOrderForm({ auth, installerWarehouses, warehouses, products, userRole }) {
    const [items, setItems] = useState([{
        product_id: '',
        quantity_requested: 1,
        notes: ''
    }]);

    const { data, setData, post, processing, errors } = useForm({
        installer_warehouse_id: '',
        source_warehouse_id: '',
        notes: '',
        items: items
    });

    const installerWarehouseOptions = installerWarehouses.map(iw => ({
        value: iw.id,
        label: `${iw.name} - ${iw.user?.name || ''} ${iw.vehicle_plate ? `(${iw.vehicle_plate})` : ''}`
    }));

    const warehouseOptions = warehouses.map(w => ({
        value: w.id,
        label: `${w.name} (${w.code})`
    }));

    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} - ${p.model}`
    }));

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
        setData('items', newItems);
    };

    const addItem = () => {
        const newItems = [...items, {
            product_id: '',
            quantity_requested: 1,
            notes: ''
        }];
        setItems(newItems);
        setData('items', newItems);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
            setData('items', newItems);
        }
    };

    const saveForm = async () => {
        post(route('loading-orders.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nueva Orden de Carga" />
            <Fragment>
                <Breadcrumbs
                    mainTitle="Nueva Orden de Carga"
                    parent="Órdenes de Carga"
                    title="Crear Orden"
                />
                <Form className='theme-form'>
                    <Card>
                        <CardBody>
                            <h5 className="mb-3">Información de la Orden</h5>
                            <Row>
                                <Col xs='12' md='6'>
                                    <Select
                                        label={{ label: 'Furgoneta de Instalador *' }}
                                        input={{
                                            placeholder: 'Seleccionar furgoneta',
                                            onChange: (e) => setData('installer_warehouse_id', e ? e.value : ''),
                                            name: 'installer_warehouse_id',
                                            options: installerWarehouseOptions,
                                        }}
                                        errors={errors.installer_warehouse_id}
                                    />
                                </Col>
                                <Col xs='12' md='6'>
                                    <Select
                                        label={{ label: 'Almacén Origen' }}
                                        input={{
                                            placeholder: 'Seleccionar almacén (opcional)',
                                            onChange: (e) => setData('source_warehouse_id', e ? e.value : ''),
                                            name: 'source_warehouse_id',
                                            options: warehouseOptions,
                                            isClearable: true,
                                        }}
                                        errors={errors.source_warehouse_id}
                                    />
                                </Col>
                                <Col xs='12'>
                                    <FloatingInput
                                        label={{ label: 'Notas' }}
                                        input={{
                                            placeholder: 'Notas adicionales',
                                            onChange: handleChange,
                                            name: 'notes',
                                            value: data.notes,
                                            type: 'textarea'
                                        }}
                                        errors={errors.notes}
                                    />
                                </Col>
                            </Row>

                            <h5 className="mb-3 mt-4">Productos a Cargar</h5>
                            <div className="table-responsive">
                                <Table bordered>
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: '45%' }}>Producto *</th>
                                            <th style={{ width: '15%' }} className="text-center">Cantidad *</th>
                                            <th style={{ width: '30%' }}>Notas</th>
                                            <th style={{ width: '10%' }} className="text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <Select
                                                        input={{
                                                            placeholder: 'Seleccionar producto',
                                                            onChange: (e) => handleItemChange(index, 'product_id', e ? e.value : ''),
                                                            name: `items.${index}.product_id`,
                                                            options: productOptions,
                                                            defaultValue: productOptions.find(p => p.value === item.product_id),
                                                        }}
                                                        errors={errors[`items.${index}.product_id`]}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        min="1"
                                                        value={item.quantity_requested}
                                                        onChange={(e) => handleItemChange(index, 'quantity_requested', parseInt(e.target.value) || 1)}
                                                    />
                                                    {errors[`items.${index}.quantity_requested`] && (
                                                        <small className="text-danger">{errors[`items.${index}.quantity_requested`]}</small>
                                                    )}
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Notas opcionales"
                                                        value={item.notes}
                                                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    {items.length > 1 && (
                                                        <Trash2
                                                            size={18}
                                                            className="cursor-pointer text-danger"
                                                            onClick={() => removeItem(index)}
                                                            title="Eliminar"
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="4">
                                                <Btn
                                                    attrBtn={{
                                                        color: 'secondary',
                                                        size: 'sm',
                                                        onClick: addItem,
                                                        type: 'button'
                                                    }}
                                                >
                                                    <Plus size={16} className="me-1" />
                                                    Añadir Producto
                                                </Btn>
                                            </td>
                                        </tr>
                                        <tr className="table-light">
                                            <td colSpan="1" className="text-end fw-bold">Total Items:</td>
                                            <td className="text-center fw-bold">
                                                <Badge color="primary">
                                                    {items.reduce((sum, item) => sum + (parseInt(item.quantity_requested) || 0), 0)}
                                                </Badge>
                                            </td>
                                            <td colSpan="2"></td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </div>

                            {errors.items && (
                                <div className="alert alert-danger mt-2">
                                    {errors.items}
                                </div>
                            )}
                        </CardBody>
                        <CardFooter>
                            <Btn
                                attrBtn={{
                                    color: 'primary',
                                    disabled: processing,
                                    onClick: saveForm
                                }}
                            >
                                {processing ? 'Creando...' : 'Crear Orden de Carga'}
                            </Btn>
                            <Btn
                                attrBtn={{
                                    color: 'secondary',
                                    className: 'ms-2',
                                    onClick: () => router.visit(route('loading-orders.index'))
                                }}
                            >
                                Cancelar
                            </Btn>
                        </CardFooter>
                    </Card>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}
