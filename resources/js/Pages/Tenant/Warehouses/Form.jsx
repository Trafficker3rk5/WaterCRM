import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import Switch from '@/Template/CommonElements/Switch';
import { Form, Card, CardBody, CardFooter, Row, Col } from 'reactstrap';

export default function WarehouseForm({ auth, warehouse }) {
    const isEdit = warehouse && warehouse.id;

    const typeOptions = [
        { value: 'physical', label: 'Físico' },
        { value: 'virtual', label: 'Virtual' },
        { value: 'vehicle', label: 'Vehículo' }
    ];

    const { data, setData, post, processing, errors } = useForm({
        id: warehouse?.id || null,
        name: warehouse?.name || '',
        code: warehouse?.code || '',
        type: warehouse?.type || 'physical',
        location: warehouse?.location || '',
        description: warehouse?.description || '',
        manager_name: warehouse?.manager_name || '',
        manager_phone: warehouse?.manager_phone || '',
        manager_email: warehouse?.manager_email || '',
        address: warehouse?.address || '',
        city: warehouse?.city || '',
        province: warehouse?.province || '',
        postal_code: warehouse?.postal_code || '',
        is_active: warehouse?.is_active ?? true,
        is_main: warehouse?.is_main ?? false,
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const handleSwitch = (key) => {
        setData(key, !data[key]);
    }

    const saveForm = async () => {
        if (isEdit) {
            post(route('warehouses.update', warehouse.id));
        } else {
            post(route('warehouses.store'));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isEdit ? "Editar Almacén" : "Crear Almacén"} />
            <Fragment>
                <Breadcrumbs
                    mainTitle={isEdit ? "Editar Almacén" : "Crear Almacén"}
                    title={isEdit ? "Editar Almacén" : "Crear Almacén"}
                />
                <Form className='theme-form'>
                    <Card>
                        <CardBody>
                            <h5 className="mb-3">Información General</h5>
                            <Row>
                                <Col xs='12' sm='6' md='4'>
                                    <FloatingInput
                                        label={{ label: 'Nombre *' }}
                                        input={{ placeholder: 'Nombre', onChange: handleChange, name: 'name', value: data.name }}
                                        errors={errors.name}
                                    />
                                </Col>
                                <Col xs='12' sm='6' md='4'>
                                    <FloatingInput
                                        label={{ label: 'Código *' }}
                                        input={{ placeholder: 'Código', onChange: handleChange, name: 'code', value: data.code }}
                                        errors={errors.code}
                                    />
                                </Col>
                                <Col xs='12' sm='6' md='4'>
                                    <Select
                                        label={{ label: 'Tipo *' }}
                                        input={{
                                            placeholder: 'Tipo',
                                            onChange: (e) => setData('type', e ? e.value : 'physical'),
                                            name: 'type',
                                            options: typeOptions,
                                            defaultValue: typeOptions.find(option => option.value === data.type),
                                        }}
                                        errors={errors.type}
                                    />
                                </Col>
                                <Col xs='12' sm='6' md='4'>
                                    <FloatingInput
                                        label={{ label: 'Ubicación' }}
                                        input={{ placeholder: 'Ubicación', onChange: handleChange, name: 'location', value: data.location }}
                                        errors={errors.location}
                                    />
                                </Col>
                                <Col xs='12' sm='12' md='8'>
                                    <FloatingInput
                                        label={{ label: 'Descripción' }}
                                        input={{ placeholder: 'Descripción', onChange: handleChange, name: 'description', value: data.description, type: 'textarea' }}
                                        errors={errors.description}
                                    />
                                </Col>
                            </Row>

                            <h5 className="mb-3 mt-4">Información del Responsable</h5>
                            <Row>
                                <Col xs='12' sm='6' md='4'>
                                    <FloatingInput
                                        label={{ label: 'Nombre Responsable' }}
                                        input={{ placeholder: 'Nombre', onChange: handleChange, name: 'manager_name', value: data.manager_name }}
                                        errors={errors.manager_name}
                                    />
                                </Col>
                                <Col xs='12' sm='6' md='4'>
                                    <FloatingInput
                                        label={{ label: 'Teléfono Responsable' }}
                                        input={{ placeholder: 'Teléfono', onChange: handleChange, name: 'manager_phone', value: data.manager_phone }}
                                        errors={errors.manager_phone}
                                    />
                                </Col>
                                <Col xs='12' sm='6' md='4'>
                                    <FloatingInput
                                        label={{ label: 'Email Responsable' }}
                                        input={{ placeholder: 'Email', onChange: handleChange, name: 'manager_email', value: data.manager_email, type: 'email' }}
                                        errors={errors.manager_email}
                                    />
                                </Col>
                            </Row>

                            <h5 className="mb-3 mt-4">Dirección</h5>
                            <Row>
                                <Col xs='12' sm='12' md='6'>
                                    <FloatingInput
                                        label={{ label: 'Dirección' }}
                                        input={{ placeholder: 'Dirección', onChange: handleChange, name: 'address', value: data.address }}
                                        errors={errors.address}
                                    />
                                </Col>
                                <Col xs='12' sm='6' md='2'>
                                    <FloatingInput
                                        label={{ label: 'Ciudad' }}
                                        input={{ placeholder: 'Ciudad', onChange: handleChange, name: 'city', value: data.city }}
                                        errors={errors.city}
                                    />
                                </Col>
                                <Col xs='12' sm='6' md='2'>
                                    <FloatingInput
                                        label={{ label: 'Provincia' }}
                                        input={{ placeholder: 'Provincia', onChange: handleChange, name: 'province', value: data.province }}
                                        errors={errors.province}
                                    />
                                </Col>
                                <Col xs='12' sm='6' md='2'>
                                    <FloatingInput
                                        label={{ label: 'Código Postal' }}
                                        input={{ placeholder: 'CP', onChange: handleChange, name: 'postal_code', value: data.postal_code }}
                                        errors={errors.postal_code}
                                    />
                                </Col>
                            </Row>

                            <h5 className="mb-3 mt-4">Configuración</h5>
                            <Row>
                                <Col xs='12' sm='6' md='3'>
                                    <Switch
                                        label={{ label: 'Activo' }}
                                        input={{ checked: data.is_active, onChange: () => handleSwitch('is_active') }}
                                    />
                                </Col>
                                <Col xs='12' sm='6' md='3'>
                                    <Switch
                                        label={{ label: 'Almacén Principal' }}
                                        input={{ checked: data.is_main, onChange: () => handleSwitch('is_main') }}
                                    />
                                </Col>
                            </Row>
                        </CardBody>
                        <CardFooter>
                            <Btn
                                attrBtn={{ color: 'primary', disabled: processing, onClick: saveForm }}
                            >
                                {processing ? 'Guardando...' : 'Guardar'}
                            </Btn>
                            <Btn
                                attrBtn={{ color: 'secondary', className: 'ms-2', onClick: () => router.visit(route('warehouses.index')) }}
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
