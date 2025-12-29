import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Progress, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import DataTable from 'react-data-table-component';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Upload, List, TrendingUp } from "react-feather";

export default function CallLists({ auth, lists }) {
    const [modalUpload, setModalUpload] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        file: null,
        assigned_to: '',
        start_date: '',
        end_date: '',
    });

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const handleFileChange = (e) => {
        setData('file', e.target.files[0]);
    }

    const uploadList = () => {
        post(route('telemarketing.lists.upload'), {
            onSuccess: () => {
                setModalUpload(false);
                reset();
            }
        });
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'secondary', text: 'Pendiente' },
            'in_progress': { color: 'info', text: 'En Progreso' },
            'completed': { color: 'success', text: 'Completado' },
            'cancelled': { color: 'danger', text: 'Cancelado' },
        };
        const config = statusConfig[status] || { color: 'secondary', text: status };
        return <Badge color={config.color}>{config.text}</Badge>;
    };

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
            name: 'Estado',
            selector: row => getStatusBadge(row.status),
            sortable: true,
            center: true,
            width: '120px',
        },
        {
            name: 'Total',
            selector: row => row.total_records || 0,
            sortable: true,
            center: true,
            width: '80px',
        },
        {
            name: 'Procesadas',
            selector: row => row.processed_records || 0,
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Progreso',
            selector: row => {
                const percentage = row.total_records > 0
                    ? Math.round((row.processed_records / row.total_records) * 100)
                    : 0;
                return (
                    <div style={{ width: '100%' }}>
                        <Progress
                            value={percentage}
                            color={getProgressColor(percentage)}
                            className="mb-1"
                        />
                        <small>{percentage}%</small>
                    </div>
                );
            },
            sortable: true,
            width: '150px',
        },
        {
            name: 'Exitosas',
            selector: row => (
                <Badge color="success">{row.successful_calls || 0}</Badge>
            ),
            sortable: true,
            center: true,
            width: '90px',
        },
        {
            name: 'Fallidas',
            selector: row => (
                <Badge color="danger">{row.failed_calls || 0}</Badge>
            ),
            sortable: true,
            center: true,
            width: '90px',
        },
        {
            name: 'Pendientes',
            selector: row => (
                <Badge color="warning">{row.pending_calls || 0}</Badge>
            ),
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Tasa Éxito',
            selector: row => {
                const rate = row.processed_records > 0
                    ? Math.round((row.successful_calls / row.processed_records) * 100)
                    : 0;
                return <strong className="text-success">{rate}%</strong>;
            },
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Creado',
            selector: row => new Date(row.created_at).toLocaleDateString('es-ES'),
            sortable: true,
            width: '110px',
        },
        {
            name: 'Creador',
            selector: row => row.creator?.name || '-',
            sortable: true,
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Listados de Llamadas" />
            <Fragment>
                <Breadcrumbs mainTitle="Listados de Llamadas" parent="Telemarketing" title="Gestión de Listados" />

                {/* Summary Cards */}
                <Row className="mb-4">
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <List size={32} className="text-primary" />
                                </div>
                                <h6 className="text-muted mb-1">Total Listados</h6>
                                <h3 className="mb-0">{lists.total || 0}</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <TrendingUp size={32} className="text-info" />
                                </div>
                                <h6 className="text-muted mb-1">En Progreso</h6>
                                <h3 className="mb-0">
                                    {lists.data?.filter(l => l.status === 'in_progress').length || 0}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Badge color="success" style={{fontSize: '2rem'}}>✓</Badge>
                                </div>
                                <h6 className="text-muted mb-1">Completados</h6>
                                <h3 className="mb-0">
                                    {lists.data?.filter(l => l.status === 'completed').length || 0}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Badge color="warning" style={{fontSize: '2rem'}}>...</Badge>
                                </div>
                                <h6 className="text-muted mb-1">Pendientes</h6>
                                <h3 className="mb-0">
                                    {lists.data?.filter(l => l.status === 'pending').length || 0}
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Listados de Llamadas</h5>
                            {[0, 1, 6].includes(auth.user.rol_id) && (
                                <Btn
                                    attrBtn={{
                                        color: 'primary',
                                        onClick: () => setModalUpload(true)
                                    }}
                                >
                                    <Upload size={16} className="me-2" />
                                    Subir Listado CSV
                                </Btn>
                            )}
                        </div>

                        <DataTable
                            columns={tableColumns}
                            data={lists.data || []}
                            pagination
                            paginationServer
                            paginationTotalRows={lists.total}
                            paginationDefaultPage={lists.current_page}
                            onChangePage={page => router.visit(route('telemarketing.lists', { page }))}
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay listados de llamadas"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                        />
                    </CardBody>
                </Card>

                {/* Upload Modal */}
                <Modal isOpen={modalUpload} toggle={() => setModalUpload(!modalUpload)} size="lg">
                    <ModalHeader toggle={() => setModalUpload(!modalUpload)}>
                        Subir Listado de Llamadas (CSV)
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs='12'>
                                <FloatingInput
                                    label={{ label: 'Nombre del Listado *' }}
                                    input={{
                                        placeholder: 'Ej: Campaña Q1 2024',
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
                                        placeholder: 'Descripción opcional del listado',
                                        onChange: handleChange,
                                        name: 'description',
                                        value: data.description,
                                        type: 'textarea'
                                    }}
                                    errors={errors.description}
                                />
                            </Col>
                            <Col xs='12'>
                                <div className="mb-3">
                                    <label className="form-label">Archivo CSV *</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".csv,.txt"
                                        onChange={handleFileChange}
                                    />
                                    {errors.file && (
                                        <small className="text-danger">{errors.file}</small>
                                    )}
                                    <small className="text-muted">
                                        Formatos aceptados: CSV, TXT. Máximo 10MB.
                                    </small>
                                </div>
                            </Col>

                            <Col xs='12'>
                                <div className="alert alert-info">
                                    <strong>Formato del CSV:</strong>
                                    <p className="mb-0 mt-2">El archivo debe contener las siguientes columnas (en español o inglés):</p>
                                    <ul className="mb-0 mt-2">
                                        <li><strong>nombre/name:</strong> Nombre del contacto (requerido)</li>
                                        <li><strong>telefono/phone:</strong> Teléfono (requerido)</li>
                                        <li><strong>email/correo:</strong> Email (opcional)</li>
                                        <li><strong>empresa/company:</strong> Empresa (opcional)</li>
                                        <li><strong>cargo/position:</strong> Cargo (opcional)</li>
                                        <li><strong>ciudad/city:</strong> Ciudad (opcional)</li>
                                        <li><strong>prioridad/priority:</strong> low/normal/high/urgent (opcional)</li>
                                    </ul>
                                    <p className="mb-0 mt-2"><em>Cualquier columna adicional se guardará como datos personalizados.</em></p>
                                </div>
                            </Col>

                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Fecha Inicio' }}
                                    input={{
                                        onChange: handleChange,
                                        name: 'start_date',
                                        value: data.start_date,
                                        type: 'date'
                                    }}
                                    errors={errors.start_date}
                                />
                            </Col>
                            <Col xs='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Fecha Fin' }}
                                    input={{
                                        onChange: handleChange,
                                        name: 'end_date',
                                        value: data.end_date,
                                        type: 'date'
                                    }}
                                    errors={errors.end_date}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: processing || !data.file,
                                onClick: uploadList
                            }}
                        >
                            {processing ? 'Subiendo...' : 'Subir y Procesar'}
                        </Btn>
                        <Btn
                            attrBtn={{
                                color: 'secondary',
                                onClick: () => setModalUpload(false)
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
