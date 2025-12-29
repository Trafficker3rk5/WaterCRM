import React, { Fragment } from "react";
import { Breadcrumbs } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge } from "reactstrap";
import { Phone, PhoneCall, PhoneMissed, UserCheck, Users, TrendingUp, Calendar } from "react-feather";
import CountUp from 'react-countup';
import DataTable from 'react-data-table-component';

export default function Dashboard({ auth, stats, recentCalls, callsByStatus }) {
    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'secondary', text: 'Pendiente' },
            'in_progress': { color: 'info', text: 'Llamando' },
            'contacted': { color: 'success', text: 'Contactado' },
            'no_answer': { color: 'warning', text: 'No Contesta' },
            'interested': { color: 'primary', text: 'Interesado' },
            'callback': { color: 'info', text: 'Callback' },
            'converted_contact': { color: 'success', text: 'Convertido Contacto' },
            'converted_client': { color: 'success', text: 'Convertido Cliente' },
            'not_interested': { color: 'danger', text: 'No Interesado' },
        };
        const config = statusConfig[status] || { color: 'secondary', text: status };
        return <Badge color={config.color}>{config.text}</Badge>;
    };

    const statsCards = [
        {
            icon: Phone,
            color: 'primary',
            title: 'Total Llamadas',
            value: stats.total_calls || 0,
            subtitle: 'En sistema'
        },
        {
            icon: Calendar,
            color: 'info',
            title: 'Pendientes',
            value: stats.pending_calls || 0,
            subtitle: 'Por llamar'
        },
        {
            icon: PhoneCall,
            color: 'success',
            title: 'Hoy',
            value: stats.today_calls || 0,
            subtitle: `${stats.contacted_today || 0} contactados`
        },
        {
            icon: UserCheck,
            color: 'warning',
            title: 'Interesados',
            value: stats.interested || 0,
            subtitle: 'Leads calientes'
        },
        {
            icon: PhoneMissed,
            color: 'danger',
            title: 'Callbacks Hoy',
            value: stats.callbacks_today || 0,
            subtitle: 'Programados'
        },
        {
            icon: TrendingUp,
            color: 'success',
            title: 'Conversiones Mes',
            value: stats.conversions_this_month || 0,
            subtitle: 'Contactos/Clientes'
        },
    ];

    const tableColumns = [
        {
            name: 'Contacto',
            selector: row => row.contact_name,
            sortable: true,
        },
        {
            name: 'Teléfono',
            selector: row => row.contact_phone,
            sortable: true,
            width: '130px',
        },
        {
            name: 'Asignado a',
            selector: row => row.assigned_user?.name || '-',
            sortable: true,
        },
        {
            name: 'Estado',
            selector: row => getStatusBadge(row.status),
            sortable: true,
            center: true,
            width: '150px',
        },
        {
            name: 'Intentos',
            selector: row => row.attempts || 0,
            sortable: true,
            center: true,
            width: '80px',
        },
        {
            name: 'Última Llamada',
            selector: row => row.last_call_at ? new Date(row.last_call_at).toLocaleDateString('es-ES') : '-',
            sortable: true,
            width: '130px',
        },
        {
            name: 'Acciones',
            selector: (row) => (
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => router.visit(route('telemarketing.call.show', row.id))}
                >
                    Ver
                </button>
            ),
            sortable: false,
            center: true,
            width: '100px',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Telemarketing" />
            <Fragment>
                <Breadcrumbs mainTitle="Telemarketing" title="Dashboard TMK" />

                {/* Statistics Cards */}
                <Row className="mb-4">
                    {statsCards.map((stat, index) => (
                        <Col key={index} md={4} lg={2} className="mb-3">
                            <Card className="border-0 shadow-sm">
                                <CardBody className="text-center">
                                    <div className="mb-2">
                                        <stat.icon size={32} className={`text-${stat.color}`} />
                                    </div>
                                    <h6 className="text-muted mb-1">{stat.title}</h6>
                                    <h3 className="mb-0">
                                        <CountUp end={stat.value} duration={1} />
                                    </h3>
                                    <small className={`text-${stat.color}`}>{stat.subtitle}</small>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Quick Actions */}
                <Row className="mb-4">
                    <Col md={12}>
                        <Card>
                            <CardBody>
                                <h5 className="mb-3">Acciones Rápidas</h5>
                                <div className="d-flex gap-2 flex-wrap">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => router.visit(route('telemarketing.my-calls'))}
                                    >
                                        <Phone size={16} className="me-2" />
                                        Mis Llamadas
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => router.visit(route('telemarketing.my-calls', { status: 'callback' }))}
                                    >
                                        <PhoneCall size={16} className="me-2" />
                                        Callbacks Pendientes
                                    </button>
                                    <button
                                        className="btn btn-info"
                                        onClick={() => router.visit(route('telemarketing.lists'))}
                                    >
                                        <Users size={16} className="me-2" />
                                        Listados
                                    </button>
                                    {[0, 1, 6].includes(auth.user.rol_id) && (
                                        <>
                                            <button
                                                className="btn btn-warning"
                                                onClick={() => router.visit(route('telemarketing.team-performance'))}
                                            >
                                                <TrendingUp size={16} className="me-2" />
                                                Rendimiento Equipo
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => router.visit(route('telemarketing.scripts'))}
                                            >
                                                Scripts
                                            </button>
                                        </>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Distribution by Status */}
                {callsByStatus && Object.keys(callsByStatus).length > 0 && (
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card>
                                <CardBody>
                                    <h5 className="mb-3">Distribución por Estado</h5>
                                    <Row>
                                        {Object.entries(callsByStatus).map(([status, count]) => (
                                            <Col key={status} md={3} sm={6} className="mb-3">
                                                <div className="text-center p-3 border rounded">
                                                    {getStatusBadge(status)}
                                                    <h4 className="mt-2 mb-0">{count}</h4>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Recent Calls */}
                <Card>
                    <CardBody>
                        <h5 className="mb-3">Últimas Llamadas</h5>
                        <DataTable
                            columns={tableColumns}
                            data={recentCalls || []}
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay llamadas recientes"
                        />
                    </CardBody>
                </Card>
            </Fragment>
        </AuthenticatedLayout>
    )
}
