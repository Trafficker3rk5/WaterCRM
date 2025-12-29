import React, { Fragment, useState, useContext } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import MainDataContext from '@/Template/_helper/MainData';
import { Card, CardBody, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from "reactstrap";
import DataTable from 'react-data-table-component';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import Switch from '@/Template/CommonElements/Switch';
import { Truck, Edit as EditIcon } from "react-feather";

export default function Index({ auth, warehouses, installers }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const { formatPrice } = useContext(MainDataContext);

    const installerOptions = installers.map(i => ({
        value: i.id,
        label: `${i.name} ${i.last_name}`
    }));

    const { data, setData, post, processing, errors, reset } = useForm({
        id: null,
        user_id: '',
        name: '',
        vehicle_plate: '',
        vehicle_brand: '',
        vehicle_model: '',
        max_capacity: null,
        notes: '',
        is_active: true,
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const openModal = (warehouse = null) => {
        if (warehouse) {
            setData({
                id: warehouse.id,
                user_id: warehouse.user_id,
                name: warehouse.name,
                vehicle_plate: warehouse.vehicle_plate || '',
                vehicle_brand: warehouse.vehicle_brand || '',
                vehicle_model: warehouse.vehicle_model || '',
                max_capacity: warehouse.max_capacity,
                notes: warehouse.notes || '',
                is_active: warehouse.is_active,
            });
            setSelectedWarehouse(warehouse);
        } else {
            reset();
            setSelectedWarehouse(null);
        }
        setModalOpen(true);
    }

    const saveWarehouse = () => {
        if (selectedWarehouse) {
            post(route('installer-warehouses.update', selectedWarehouse.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                }
            });
        } else {
            post(route('installer-warehouses.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                }
            });
        }
    }

    const tableColumns = [
        {
            name: 'Instalador',
            selector: row => row.user ? `${row.user.name} ${row.user.last_name}` : '-',
            sortable: true,
        },
        {
            name: 'Nombre Furgoneta',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Matrícula',
            selector: row => row.vehicle_plate || '-',
            sortable: true,
            width: '120px',
        },
        {
            name: 'Marca/Modelo',
            selector: row => {
                if (row.vehicle_brand && row.vehicle_model) {
                    return `${row.vehicle_brand} ${row.vehicle_model}`;
                }
                return row.vehicle_brand || row.vehicle_model || '-';
            },
            sortable: true,
        },
        {
            name: 'Stock Actual',
            selector: row => row.current_stock || 0,
            sortable: true,
            center: true,
            width: '120px',
        },
        {
            name: 'Capacidad Máxima',
            selector: row => row.max_capacity || '-',
            sortable: true,
            center: true,
            width: '150px',
        },
        {
            name: 'Uso Capacidad',
            selector: row => {
                const percentage = row.capacity_percentage;
                if (!percentage) return '-';

                let color = 'success';
                if (percentage > 90) color = 'danger';
                else if (percentage > 75) color = 'warning';

                return <Badge color={color}>{percentage.toFixed(0)}%</Badge>;
            },
            sortable: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Órdenes',
            selector: row => row.loading_orders_count || 0,
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Estado',
            selector: row => (
                <Badge color={row.is_active ? 'success' : 'secondary'}>
                    {row.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
            ),
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Acciones',
            selector: (row) => (
                <EditIcon
                    size={16}
                    className="cursor-pointer text-primary"
                    onClick={() => openModal(row)}
                    title="Editar"
                />
            ),
            sortable: false,
            center: true,
            width: '100px',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Furgonetas de Instaladores" />
            <Fragment>
                <Breadcrumbs mainTitle="Furgonetas de Instaladores" title="Gestión de Furgonetas" />

                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between mb-3">
                            <h5>Furgonetas Registradas</h5>
                            <Btn
                                attrBtn={{
                                    color: 'primary',
                                    onClick: () => openModal()
                                }}
                            >
                                <Truck size={16} className="me-2" />
                                Registrar Furgoneta
                            </Btn>
                        </div>

                        <DataTable
                            columns={tableColumns}
                            data={warehouses || []}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay furgonetas registradas"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                        />
                    </CardBody>
                </Card>

                {/* Modal for adding/editing warehouse */}
                <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
                    <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
                        {selectedWarehouse ? 'Editar Furgoneta' : 'Registrar Furgoneta'}
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12' md='6'>
                                <Select
                                    label={{ label: 'Instalador *' }}
                                    input={{
                                        placeholder: 'Seleccionar instalador',
                                        onChange: (e) => setData('user_id', e ? e.value : ''),
                                        name: 'user_id',
                                        options: installerOptions,
                                        defaultValue: installerOptions.find(i => i.value === data.user_id),
                                    }}
                                    errors={errors.user_id}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Nombre Furgoneta *' }}
                                    input={{
                                        placeholder: 'Ej: Furgoneta 1',
                                        onChange: handleChange,
                                        name: 'name',
                                        value: data.name
                                    }}
                                    errors={errors.name}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Matrícula' }}
                                    input={{
                                        placeholder: 'Ej: ABC-1234',
                                        onChange: handleChange,
                                        name: 'vehicle_plate',
                                        value: data.vehicle_plate
                                    }}
                                    errors={errors.vehicle_plate}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Marca' }}
                                    input={{
                                        placeholder: 'Ej: Ford',
                                        onChange: handleChange,
                                        name: 'vehicle_brand',
                                        value: data.vehicle_brand
                                    }}
                                    errors={errors.vehicle_brand}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Modelo' }}
                                    input={{
                                        placeholder: 'Ej: Transit',
                                        onChange: handleChange,
                                        name: 'vehicle_model',
                                        value: data.vehicle_model
                                    }}
                                    errors={errors.vehicle_model}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Capacidad Máxima (unidades)' }}
                                    input={{
                                        placeholder: '0',
                                        onChange: handleChange,
                                        name: 'max_capacity',
                                        value: data.max_capacity || '',
                                        type: 'number',
                                        min: 1
                                    }}
                                    errors={errors.max_capacity}
                                />
                            </Col>
                            <Col xs='12' md='6' className="d-flex align-items-center">
                                <Switch
                                    label={{ label: 'Activa' }}
                                    input={{
                                        checked: data.is_active,
                                        onChange: () => setData('is_active', !data.is_active)
                                    }}
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
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: saveWarehouse
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
            </Fragment>
        </AuthenticatedLayout>
    )
}
