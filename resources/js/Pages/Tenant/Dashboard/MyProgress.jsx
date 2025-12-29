import React, { Fragment, useContext } from "react";
import { Breadcrumbs } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import MainDataContext from '@/Template/_helper/MainData';
import { Card, CardBody, CardHeader, Row, Col, Badge, Progress } from "reactstrap";
import { Target, TrendingUp, Calendar, Award, Star, DollarSign } from "react-feather";
import CountUp from 'react-countup';

export default function MyProgress({ auth, myGoals, monthSales, yearSales, averageRating }) {
    const { formatPrice } = useContext(MainDataContext);

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return 'success';
        if (percentage >= 75) return 'info';
        if (percentage >= 50) return 'warning';
        return 'danger';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mi Progreso" />
            <Fragment>
                <Breadcrumbs mainTitle="Mi Progreso" title="Dashboard Personal" />

                {/* Statistics Cards */}
                <Row className="mb-4">
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Calendar size={32} className="text-primary" />
                                </div>
                                <h6 className="text-muted mb-1">Ventas Este Mes</h6>
                                <h3 className="mb-0">
                                    <CountUp end={monthSales.total_sales || 0} duration={1} />
                                </h3>
                                <small className="text-success">
                                    {formatPrice(monthSales.total_amount || 0)}
                                </small>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <TrendingUp size={32} className="text-success" />
                                </div>
                                <h6 className="text-muted mb-1">Ventas Este Año</h6>
                                <h3 className="mb-0">
                                    <CountUp end={yearSales.total_sales || 0} duration={1} />
                                </h3>
                                <small className="text-success">
                                    {formatPrice(yearSales.total_amount || 0)}
                                </small>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Star size={32} className="text-warning" fill="currentColor" />
                                </div>
                                <h6 className="text-muted mb-1">Valoración Promedio</h6>
                                <h3 className="mb-0">
                                    {averageRating ? (
                                        <>
                                            <CountUp
                                                end={averageRating}
                                                duration={1}
                                                decimals={2}
                                                decimal=","
                                            />
                                            <small className="ms-1">/5</small>
                                        </>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </h3>
                                <small className="text-muted">
                                    {averageRating ? 'Excelente trabajo' : 'Sin valoraciones'}
                                </small>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <DollarSign size={32} className="text-info" />
                                </div>
                                <h6 className="text-muted mb-1">Ticket Promedio</h6>
                                <h3 className="mb-0">
                                    {monthSales.total_sales > 0 ? (
                                        formatPrice(monthSales.total_amount / monthSales.total_sales)
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </h3>
                                <small className="text-muted">Este mes</small>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* My Goals */}
                <Card>
                    <CardHeader className="bg-primary text-white">
                        <div className="d-flex align-items-center">
                            <Target size={20} className="me-2" />
                            <h5 className="mb-0">Mis Objetivos Activos</h5>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {myGoals && myGoals.length > 0 ? (
                            <Row>
                                {myGoals.map((goal) => (
                                    <Col md={6} lg={4} key={goal.id} className="mb-3">
                                        <Card className={`border-2 ${goal.is_achieved ? 'border-success' : 'border-primary'}`}>
                                            <CardBody>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="flex-grow-1">
                                                        <h5 className="mb-1">{goal.name}</h5>
                                                        {goal.description && (
                                                            <p className="text-muted small mb-2">{goal.description}</p>
                                                        )}
                                                        <Badge color={goal.type === 'individual' ? 'primary' : 'info'}>
                                                            {goal.type === 'individual' ? 'Individual' : `Equipo: ${goal.team_name}`}
                                                        </Badge>
                                                    </div>
                                                    {goal.is_achieved && (
                                                        <Award size={32} className="text-success" />
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <small className="fw-bold">Progreso de Ventas</small>
                                                        <small className="fw-bold text-primary">
                                                            {goal.progress_percentage?.toFixed(1)}%
                                                        </small>
                                                    </div>
                                                    <Progress
                                                        value={goal.progress_percentage || 0}
                                                        color={getProgressColor(goal.progress_percentage || 0)}
                                                        className="mb-2"
                                                        style={{ height: '12px' }}
                                                    />
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <small className="text-muted d-block">Meta</small>
                                                            <strong>{formatPrice(goal.target_amount)}</strong>
                                                        </div>
                                                        <div className="text-end">
                                                            <small className="text-muted d-block">Actual</small>
                                                            <strong className="text-success">{formatPrice(goal.current_amount || 0)}</strong>
                                                        </div>
                                                        <div className="text-end">
                                                            <small className="text-muted d-block">Restante</small>
                                                            <strong className="text-warning">{formatPrice(goal.remaining_amount || 0)}</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                {goal.target_units && (
                                                    <div className="mb-3">
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <small className="fw-bold">Progreso de Unidades</small>
                                                            <small className="fw-bold text-info">
                                                                {goal.units_progress_percentage?.toFixed(1)}%
                                                            </small>
                                                        </div>
                                                        <Progress
                                                            value={goal.units_progress_percentage || 0}
                                                            color={getProgressColor(goal.units_progress_percentage || 0)}
                                                            className="mb-2"
                                                            style={{ height: '8px' }}
                                                        />
                                                        <div className="d-flex justify-content-between">
                                                            <div>
                                                                <small className="text-muted d-block">Meta</small>
                                                                <strong>{goal.target_units} uds</strong>
                                                            </div>
                                                            <div className="text-end">
                                                                <small className="text-muted d-block">Actual</small>
                                                                <strong className="text-success">{goal.current_units || 0} uds</strong>
                                                            </div>
                                                            <div className="text-end">
                                                                <small className="text-muted d-block">Restante</small>
                                                                <strong className="text-warning">{goal.remaining_units || 0} uds</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="border-top pt-3">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <small className="text-muted">Periodo:</small>
                                                        <small>{new Date(goal.period_start).toLocaleDateString('es-ES')} - {new Date(goal.period_end).toLocaleDateString('es-ES')}</small>
                                                    </div>
                                                    {goal.reward_amount && (
                                                        <div className="d-flex justify-content-between">
                                                            <small className="text-muted">Recompensa:</small>
                                                            <small className="fw-bold text-success">{formatPrice(goal.reward_amount)}</small>
                                                        </div>
                                                    )}
                                                    {goal.reward_description && (
                                                        <div className="mt-1">
                                                            <small className="text-muted fst-italic">{goal.reward_description}</small>
                                                        </div>
                                                    )}
                                                </div>

                                                {goal.is_achieved && (
                                                    <div className="mt-3">
                                                        <Badge color="success" className="w-100 p-2">
                                                            <Award size={16} className="me-2" />
                                                            ¡Objetivo Alcanzado!
                                                        </Badge>
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="text-center py-5">
                                <Target size={64} className="text-muted mb-3 opacity-25" />
                                <h5 className="text-muted">No tienes objetivos activos</h5>
                                <p className="text-muted">Los objetivos asignados aparecerán aquí</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </Fragment>
        </AuthenticatedLayout>
    )
}
