import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Modal, ModalHeader, ModalBody, ModalFooter, ButtonGroup, Button } from "reactstrap";
import DataTable from 'react-data-table-component';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { DollarSign, FileText, Check, X, Eye } from "react-feather";

export default function Index({ auth, expenses }) {
    const [modalCreate, setModalCreate] = useState(false);
    const [modalView, setModalView] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const typeOptions = [
        { value: 'food', label: 'Comida' },
        { value: 'fuel', label: 'Combustible' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'parts', label: 'Piezas/Materiales' },
        { value: 'other', label: 'Otros' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        type: '',
        amount: '',
        supplier: '',
        description: '',
        receipt_image: null,
        expense_date: new Date().toISOString().split('T')[0],
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const handleFileChange = (e) => {
        setData('receipt_image', e.target.files[0]);
    }

    const submitExpense = () => {
        post(route('expenses.store'), {
            onSuccess: () => {
                setModalCreate(false);
                reset();
            }
        });
    }

    const approveExpense = (expense) => {
        if (confirm('¿Aprobar este gasto?')) {
            router.post(route('expenses.approve', expense.id));
        }
    }

    const rejectExpense = (expense) => {
        if (confirm('¿Rechazar este gasto?')) {
            router.post(route('expenses.reject', expense.id));
        }
    }

    const viewExpense = (expense) => {
        setSelectedExpense(expense);
        setModalView(true);
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'warning', text: 'Pendiente' },
            'approved': { color: 'success', text: 'Aprobado' },
            'rejected': { color: 'danger', text: 'Rechazado' },
        };
        const config = statusConfig[status] || { color: 'secondary', text: status };
        return <Badge color={config.color}>{config.text}</Badge>;
    };

    const getTypeLabel = (type) => {
        const typeObj = typeOptions.find(t => t.value === type);
        return typeObj ? typeObj.label : type;
    };

    const canManage = auth.user.rol_id <= 3;

    const filteredExpenses = statusFilter === 'all'
        ? expenses.data
        : expenses.data.filter(e => e.status === statusFilter);

    const tableColumns = [
        {
            name: 'Fecha',
            selector: row => new Date(row.expense_date).toLocaleDateString('es-ES'),
            sortable: true,
            width: '110px',
        },
        {
            name: 'Usuario',
            selector: row => row.user?.name || '-',
            sortable: true,
        },
        {
            name: 'Tipo',
            selector: row => getTypeLabel(row.type),
            sortable: true,
            width: '140px',
        },
        {
            name: 'Proveedor',
            selector: row => row.supplier || '-',
            sortable: true,
        },
        {
            name: 'Monto',
            selector: row => `€${parseFloat(row.amount).toFixed(2)}`,
            sortable: true,
            right: true,
            width: '120px',
        },
        {
            name: 'Estado',
            selector: row => getStatusBadge(row.status),
            sortable: true,
            center: true,
            width: '120px',
        },
        {
            name: 'Acciones',
            selector: (row) => (
                <div className="d-flex gap-1">
                    <Eye
                        size={16}
                        className="cursor-pointer text-info"
                        onClick={() => viewExpense(row)}
                        title="Ver"
                    />
                    {canManage && row.status === 'pending' && (
                        <>
                            <Check
                                size={16}
                                className="cursor-pointer text-success"
                                onClick={() => approveExpense(row)}
                                title="Aprobar"
                            />
                            <X
                                size={16}
                                className="cursor-pointer text-danger"
                                onClick={() => rejectExpense(row)}
                                title="Rechazar"
                            />
                        </>
                    )}
                </div>
            ),
            sortable: false,
            center: true,
            width: '120px',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gastos" />
            <Fragment>
                <Breadcrumbs mainTitle="Gastos" title="Gestión de Gastos" />

                <Card className="mb-3">
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-2">Filtrar por Estado</h5>
                                <ButtonGroup>
                                    <Button
                                        color={statusFilter === 'all' ? 'primary' : 'outline-primary'}
                                        onClick={() => setStatusFilter('all')}
                                    >
                                        Todos
                                    </Button>
                                    <Button
                                        color={statusFilter === 'pending' ? 'warning' : 'outline-warning'}
                                        onClick={() => setStatusFilter('pending')}
                                    >
                                        Pendientes
                                    </Button>
                                    <Button
                                        color={statusFilter === 'approved' ? 'success' : 'outline-success'}
                                        onClick={() => setStatusFilter('approved')}
                                    >
                                        Aprobados
                                    </Button>
                                    <Button
                                        color={statusFilter === 'rejected' ? 'danger' : 'outline-danger'}
                                        onClick={() => setStatusFilter('rejected')}
                                    >
                                        Rechazados
                                    </Button>
                                </ButtonGroup>
                            </div>
                            <Btn
                                attrBtn={{
                                    color: 'primary',
                                    onClick: () => setModalCreate(true)
                                }}
                            >
                                <DollarSign size={16} className="me-2" />
                                Nuevo Gasto
                            </Btn>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <DataTable
                            columns={tableColumns}
                            data={filteredExpenses || []}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay gastos registrados"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                        />
                    </CardBody>
                </Card>

                {/* Create Modal */}
                <Modal isOpen={modalCreate} toggle={() => setModalCreate(!modalCreate)} size="lg">
                    <ModalHeader toggle={() => setModalCreate(!modalCreate)}>
                        Registrar Nuevo Gasto
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12' md='6'>
                                <Select
                                    label={{ label: 'Tipo de Gasto *' }}
                                    input={{
                                        placeholder: 'Seleccionar tipo',
                                        onChange: (e) => setData('type', e ? e.value : ''),
                                        name: 'type',
                                        options: typeOptions,
                                    }}
                                    errors={errors.type}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Fecha *' }}
                                    input={{
                                        onChange: handleChange,
                                        name: 'expense_date',
                                        value: data.expense_date,
                                        type: 'date'
                                    }}
                                    errors={errors.expense_date}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Monto *' }}
                                    input={{
                                        placeholder: '0.00',
                                        onChange: handleChange,
                                        name: 'amount',
                                        value: data.amount,
                                        type: 'number',
                                        step: '0.01',
                                        min: 0.01
                                    }}
                                    errors={errors.amount}
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
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Descripción' }}
                                    input={{
                                        placeholder: 'Descripción del gasto',
                                        onChange: handleChange,
                                        name: 'description',
                                        value: data.description,
                                        type: 'textarea',
                                        rows: 3
                                    }}
                                    errors={errors.description}
                                />
                            </Col>
                            <Col xs='12'>
                                <div className="mb-3">
                                    <label className="form-label">Imagen del Recibo *</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {errors.receipt_image && (
                                        <small className="text-danger">{errors.receipt_image}</small>
                                    )}
                                    <small className="text-muted">Formatos: JPG, PNG. Máximo 5MB.</small>
                                </div>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing,
                                onClick: submitExpense
                            }}
                        >
                            {processing ? 'Guardando...' : 'Registrar Gasto'}
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

                {/* View Modal */}
                <Modal isOpen={modalView} toggle={() => setModalView(!modalView)} size="lg">
                    <ModalHeader toggle={() => setModalView(!modalView)}>
                        Detalle del Gasto
                    </ModalHeader>
                    <ModalBody>
                        {selectedExpense && (
                            <Row>
                                <Col md={6}>
                                    <p><strong>Tipo:</strong> {getTypeLabel(selectedExpense.type)}</p>
                                    <p><strong>Monto:</strong> €{parseFloat(selectedExpense.amount).toFixed(2)}</p>
                                    <p><strong>Fecha:</strong> {new Date(selectedExpense.expense_date).toLocaleDateString('es-ES')}</p>
                                    <p><strong>Usuario:</strong> {selectedExpense.user?.name || '-'}</p>
                                    {selectedExpense.supplier && (
                                        <p><strong>Proveedor:</strong> {selectedExpense.supplier}</p>
                                    )}
                                    {selectedExpense.description && (
                                        <p><strong>Descripción:</strong> {selectedExpense.description}</p>
                                    )}
                                    <p><strong>Estado:</strong> {getStatusBadge(selectedExpense.status)}</p>
                                    {selectedExpense.approver && (
                                        <p><strong>Aprobado por:</strong> {selectedExpense.approver.name}</p>
                                    )}
                                </Col>
                                <Col md={6}>
                                    {selectedExpense.receipt_image && (
                                        <div>
                                            <strong>Recibo:</strong>
                                            <img
                                                src={`/storage/${selectedExpense.receipt_image}`}
                                                alt="Receipt"
                                                className="img-fluid mt-2 rounded"
                                            />
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'secondary',
                                onClick: () => setModalView(false)
                            }}
                        >
                            Cerrar
                        </Btn>
                    </ModalFooter>
                </Modal>
            </Fragment>
        </AuthenticatedLayout>
    )
}
