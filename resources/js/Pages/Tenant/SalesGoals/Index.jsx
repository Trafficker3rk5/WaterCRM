import React, { Fragment, useState, useContext } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import MainDataContext from '@/Template/_helper/MainData';
import { Card, CardBody, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Progress } from "reactstrap";
import DataTable from 'react-data-table-component';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import Switch from '@/Template/CommonElements/Switch';
import Trash from '@/Template/CommonElements/Trash';
import { Target, Edit as EditIcon, TrendingUp } from "react-feather";

export default function Index({ auth, goals, users }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const { handleDelete, formatPrice, formatDate } = useContext(MainDataContext);

    const userOptions = users.map(u => ({
        value: u.id,
        label: `${u.name} ${u.last_name}`
    }));

    const periodTypeOptions = [
        { value: 'monthly', label: 'Mensual' },
        { value: 'quarterly', label: 'Trimestral' },
        { value: 'yearly', label: 'Anual' }
    ];

    const typeOptions = [
        { value: 'individual', label: 'Individual' },
        { value: 'team', label: 'Equipo' }
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        id: null,
        name: '',
        description: '',
        type: 'individual',
        user_id: '',
        team_name: '',
        team_user_ids: [],
        period_type: 'monthly',
        period_start: '',
        period_end: '',
        target_amount: 0,
        target_units: null,
        reward_amount: null,
        reward_description: '',
        is_active: true,
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const openModal = (goal = null) => {
        if (goal) {
            setData({
                id: goal.id,
                name: goal.name,
                description: goal.description || '',
                type: goal.type,
                user_id: goal.user_id || '',
                team_name: goal.team_name || '',
                team_user_ids: goal.team_user_ids || [],
                period_type: goal.period_type,
                period_start: goal.period_start,
                period_end: goal.period_end,
                target_amount: goal.target_amount,
                target_units: goal.target_units,
                reward_amount: goal.reward_amount,
                reward_description: goal.reward_description || '',
                is_active: goal.is_active,
            });
            setSelectedGoal(goal);
        } else {
            reset();
            setSelectedGoal(null);
        }
        setModalOpen(true);
    }

    const saveGoal = () => {
        if (selectedGoal) {
            post(route('sales-goals.update', selectedGoal.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                }
            });
        } else {
            post(route('sales-goals.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                }
            });
        }
    }

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return 'success';
        if (percentage >= 75) return 'info';
        if (percentage >= 50) return 'warning';
        return 'danger';
    };

    const tableColumns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            wrap: true,
        },
        {
            name: 'Tipo',
            selector: row => {
                const typeLabels = { 'individual': 'Individual', 'team': 'Equipo' };
                return <Badge color={row.type === 'individual' ? 'primary' : 'info'}>
                    {typeLabels[row.type]}
                </Badge>;
            },
            sortable: true,
            width: '100px',
        },
        {
            name: 'Asignado a',
            selector: row => {
                if (row.type === 'individual' && row.user) {
                    return `${row.user.name} ${row.user.last_name}`;
                }
                return row.team_name || '-';
            },
            sortable: true,
        },
        {
            name: 'Periodo',
            selector: row => {
                const types = { 'monthly': 'Mensual', 'quarterly': 'Trimestral', 'yearly': 'Anual' };
                return types[row.period_type] || row.period_type;
            },
            sortable: true,
            width: '100px',
        },
        {
            name: 'Fechas',
            selector: row => `${formatDate(row.period_start)} - ${formatDate(row.period_end)}`,
            sortable: true,
            wrap: true,
            width: '180px',
        },
        {
            name: 'Meta €',
            selector: row => formatPrice(row.target_amount),
            sortable: true,
            right: true,
            width: '120px',
        },
        {
            name: 'Actual €',
            selector: row => formatPrice(row.current_amount || 0),
            sortable: true,
            right: true,
            width: '120px',
        },
        {
            name: 'Progreso',
            selector: row => {
                const percentage = row.progress_percentage || 0;
                return (
                    <div style={{ width: '100%' }}>
                        <Progress
                            value={percentage}
                            color={getProgressColor(percentage)}
                            className="mb-1"
                        />
                        <small>{percentage.toFixed(1)}%</small>
                    </div>
                );
            },
            sortable: true,
            width: '150px',
        },
        {
            name: 'Estado',
            selector: row => {
                if (row.is_achieved) {
                    return <Badge color="success">Alcanzado</Badge>;
                }
                return row.is_active
                    ? <Badge color="primary">Activo</Badge>
                    : <Badge color="secondary">Inactivo</Badge>;
            },
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Acciones',
            selector: (row) => (
                <div className="d-flex gap-2">
                    <EditIcon
                        size={16}
                        className="cursor-pointer text-primary"
                        onClick={() => openModal(row)}
                        title="Editar"
                    />
                    <TrendingUp
                        size={16}
                        className="cursor-pointer text-info"
                        onClick={() => router.post(route('sales-goals.update-progress', row.id))}
                        title="Actualizar Progreso"
                    />
                    <Trash
                        onClick={() => handleDelete(route('sales-goals.destroy', row.id))}
                        id={'delete-' + row.id}
                    />
                </div>
            ),
            sortable: false,
            center: true,
            width: '120px',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Objetivos de Ventas" />
            <Fragment>
                <Breadcrumbs mainTitle="Objetivos de Ventas" title="Gestión de Objetivos" />

                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between mb-3">
                            <h5>Objetivos Configurados</h5>
                            <div className="d-flex gap-2">
                                <Btn
                                    attrBtn={{
                                        color: 'info',
                                        onClick: () => router.post(route('sales-goals.update-all-progress'))
                                    }}
                                >
                                    Actualizar Todos
                                </Btn>
                                <Btn
                                    attrBtn={{
                                        color: 'primary',
                                        onClick: () => openModal()
                                    }}
                                >
                                    <Target size={16} className="me-2" />
                                    Nuevo Objetivo
                                </Btn>
                            </div>
                        </div>

                        <DataTable
                            columns={tableColumns}
                            data={goals || []}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay objetivos configurados"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                        />
                    </CardBody>
                </Card>

                {/* Modal for adding/editing goal */}
                <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
                    <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
                        {selectedGoal ? 'Editar Objetivo' : 'Nuevo Objetivo'}
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Nombre del Objetivo *' }}
                                    input={{
                                        placeholder: 'Ej: Objetivo Q1 2024',
                                        onChange: handleChange,
                                        name: 'name',
                                        value: data.name
                                    }}
                                    errors={errors.name}
                                />
                            </Col>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Descripción' }}
                                    input={{
                                        placeholder: 'Descripción del objetivo',
                                        onChange: handleChange,
                                        name: 'description',
                                        value: data.description,
                                        type: 'textarea'
                                    }}
                                    errors={errors.description}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <Select
                                    label={{ label: 'Tipo *' }}
                                    input={{
                                        placeholder: 'Tipo de objetivo',
                                        onChange: (e) => setData('type', e ? e.value : 'individual'),
                                        name: 'type',
                                        options: typeOptions,
                                        defaultValue: typeOptions.find(t => t.value === data.type),
                                    }}
                                    errors={errors.type}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <Select
                                    label={{ label: 'Periodo *' }}
                                    input={{
                                        placeholder: 'Tipo de periodo',
                                        onChange: (e) => setData('period_type', e ? e.value : 'monthly'),
                                        name: 'period_type',
                                        options: periodTypeOptions,
                                        defaultValue: periodTypeOptions.find(p => p.value === data.period_type),
                                    }}
                                    errors={errors.period_type}
                                />
                            </Col>

                            {data.type === 'individual' ? (
                                <Col xs='12' md='6'>
                                    <Select
                                        label={{ label: 'Usuario *' }}
                                        input={{
                                            placeholder: 'Seleccionar usuario',
                                            onChange: (e) => setData('user_id', e ? e.value : ''),
                                            name: 'user_id',
                                            options: userOptions,
                                            defaultValue: userOptions.find(u => u.value === data.user_id),
                                        }}
                                        errors={errors.user_id}
                                    />
                                </Col>
                            ) : (
                                <>
                                    <Col xs='12' md='6'>
                                        <FloatingInput
                                            label={{ label: 'Nombre del Equipo *' }}
                                            input={{
                                                placeholder: 'Ej: Equipo Norte',
                                                onChange: handleChange,
                                                name: 'team_name',
                                                value: data.team_name
                                            }}
                                            errors={errors.team_name}
                                        />
                                    </Col>
                                    <Col xs='12'>
                                        <Select
                                            label={{ label: 'Miembros del Equipo *' }}
                                            input={{
                                                placeholder: 'Seleccionar miembros',
                                                onChange: (selected) => setData('team_user_ids', selected ? selected.map(s => s.value) : []),
                                                name: 'team_user_ids',
                                                options: userOptions,
                                                defaultValue: userOptions.filter(u => data.team_user_ids.includes(u.value)),
                                                isMulti: true,
                                            }}
                                            errors={errors.team_user_ids}
                                        />
                                    </Col>
                                </>
                            )}

                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Fecha Inicio *' }}
                                    input={{
                                        onChange: handleChange,
                                        name: 'period_start',
                                        value: data.period_start,
                                        type: 'date'
                                    }}
                                    errors={errors.period_start}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Fecha Fin *' }}
                                    input={{
                                        onChange: handleChange,
                                        name: 'period_end',
                                        value: data.period_end,
                                        type: 'date'
                                    }}
                                    errors={errors.period_end}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Meta de Ventas (€) *' }}
                                    input={{
                                        placeholder: '0.00',
                                        onChange: handleChange,
                                        name: 'target_amount',
                                        value: data.target_amount,
                                        type: 'number',
                                        step: '0.01',
                                        min: 0
                                    }}
                                    errors={errors.target_amount}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Meta de Unidades (opcional)' }}
                                    input={{
                                        placeholder: '0',
                                        onChange: handleChange,
                                        name: 'target_units',
                                        value: data.target_units || '',
                                        type: 'number',
                                        min: 0
                                    }}
                                    errors={errors.target_units}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Recompensa (€)' }}
                                    input={{
                                        placeholder: '0.00',
                                        onChange: handleChange,
                                        name: 'reward_amount',
                                        value: data.reward_amount || '',
                                        type: 'number',
                                        step: '0.01',
                                        min: 0
                                    }}
                                    errors={errors.reward_amount}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Descripción Recompensa' }}
                                    input={{
                                        placeholder: 'Ej: Bonus 500€',
                                        onChange: handleChange,
                                        name: 'reward_description',
                                        value: data.reward_description
                                    }}
                                    errors={errors.reward_description}
                                />
                            </Col>
                            <Col xs='12' className="d-flex align-items-center">
                                <Switch
                                    label={{ label: 'Activo' }}
                                    input={{
                                        checked: data.is_active,
                                        onChange: () => setData('is_active', !data.is_active)
                                    }}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: saveGoal
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
