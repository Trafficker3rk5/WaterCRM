import React, { Fragment, useState, useContext } from "react";
import { Breadcrumbs } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import MainDataContext from '@/Template/_helper/MainData';
import { Card, CardBody, CardHeader, Row, Col, Badge, Progress, Table } from "reactstrap";
import Select from '@/Template/CommonElements/Select';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import { Award, TrendingUp, Star, Target } from "react-feather";

export default function Rankings({
    auth,
    salesRanking,
    ratingsRanking,
    currentGoals,
    period,
    date,
    startDate,
    endDate
}) {
    const { formatPrice } = useContext(MainDataContext);
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const [selectedDate, setSelectedDate] = useState(date);

    const periodOptions = [
        { value: 'monthly', label: 'Mensual' },
        { value: 'yearly', label: 'Anual' }
    ];

    const handleFilter = () => {
        router.get(route('sales-rankings'), {
            period: selectedPeriod,
            date: selectedDate
        });
    };

    const getRankMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return 'success';
        if (percentage >= 75) return 'info';
        if (percentage >= 50) return 'warning';
        return 'danger';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Rankings de Ventas" />
            <Fragment>
                <Breadcrumbs mainTitle="Rankings de Ventas" title="Dashboard de Rendimiento" />

                {/* Filters */}
                <Card className="mb-3">
                    <CardBody>
                        <Row className="align-items-end">
                            <Col md={3}>
                                <Select
                                    label={{ label: 'Periodo' }}
                                    input={{
                                        placeholder: 'Seleccionar periodo',
                                        onChange: (e) => setSelectedPeriod(e ? e.value : 'monthly'),
                                        name: 'period',
                                        options: periodOptions,
                                        defaultValue: periodOptions.find(p => p.value === selectedPeriod),
                                    }}
                                />
                            </Col>
                            <Col md={3}>
                                <FloatingInput
                                    label={{ label: selectedPeriod === 'monthly' ? 'Mes' : 'Año' }}
                                    input={{
                                        onChange: (e) => setSelectedDate(e.target.value),
                                        name: 'date',
                                        value: selectedDate,
                                        type: selectedPeriod === 'monthly' ? 'month' : 'number'
                                    }}
                                />
                            </Col>
                            <Col md={2}>
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={handleFilter}
                                >
                                    Filtrar
                                </button>
                            </Col>
                            <Col md={4} className="text-end">
                                <small className="text-muted">
                                    Periodo: {new Date(startDate).toLocaleDateString('es-ES')} - {new Date(endDate).toLocaleDateString('es-ES')}
                                </small>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <Row>
                    {/* Sales Ranking */}
                    <Col md={6} className="mb-3">
                        <Card className="h-100">
                            <CardHeader className="bg-primary text-white">
                                <div className="d-flex align-items-center">
                                    <TrendingUp size={20} className="me-2" />
                                    <h5 className="mb-0">Ranking de Ventas</h5>
                                </div>
                            </CardHeader>
                            <CardBody>
                                {salesRanking && salesRanking.length > 0 ? (
                                    <Table responsive className="table-hover">
                                        <thead>
                                            <tr>
                                                <th className="text-center" style={{width: '60px'}}>Pos</th>
                                                <th>Comercial</th>
                                                <th className="text-center">Ventas</th>
                                                <th className="text-end">Total €</th>
                                                <th className="text-end">Promedio €</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesRanking.map((item, index) => (
                                                <tr key={index} className={index < 3 ? 'table-light' : ''}>
                                                    <td className="text-center">
                                                        <span className="fs-5">{getRankMedal(item.rank)}</span>
                                                    </td>
                                                    <td>
                                                        <strong>{item.user_name}</strong>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge color="info">{item.total_sales}</Badge>
                                                    </td>
                                                    <td className="text-end">
                                                        <strong className="text-success">{formatPrice(item.total_amount)}</strong>
                                                    </td>
                                                    <td className="text-end text-muted">
                                                        {formatPrice(item.average_sale)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="text-center text-muted py-5">
                                        <TrendingUp size={48} className="mb-2 opacity-25" />
                                        <p>No hay datos de ventas para este periodo</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Ratings Ranking */}
                    <Col md={6} className="mb-3">
                        <Card className="h-100">
                            <CardHeader className="bg-warning text-dark">
                                <div className="d-flex align-items-center">
                                    <Star size={20} className="me-2" />
                                    <h5 className="mb-0">Ranking de Valoraciones</h5>
                                </div>
                            </CardHeader>
                            <CardBody>
                                {ratingsRanking && ratingsRanking.length > 0 ? (
                                    <Table responsive className="table-hover">
                                        <thead>
                                            <tr>
                                                <th className="text-center" style={{width: '60px'}}>Pos</th>
                                                <th>Comercial</th>
                                                <th className="text-center">Valoraciones</th>
                                                <th className="text-center">Promedio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ratingsRanking.map((item, index) => (
                                                <tr key={index} className={index < 3 ? 'table-light' : ''}>
                                                    <td className="text-center">
                                                        <span className="fs-5">{getRankMedal(item.rank)}</span>
                                                    </td>
                                                    <td>
                                                        <strong>{item.user_name}</strong>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge color="info">{item.total_ratings}</Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex align-items-center justify-content-center">
                                                            <Star size={16} className="text-warning me-1" fill="currentColor" />
                                                            <strong className="text-warning">{item.average_rating}</strong>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="text-center text-muted py-5">
                                        <Star size={48} className="mb-2 opacity-25" />
                                        <p>No hay valoraciones para este periodo</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Current Goals */}
                {currentGoals && currentGoals.length > 0 && (
                    <Card>
                        <CardHeader className="bg-success text-white">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <Target size={20} className="me-2" />
                                    <h5 className="mb-0">Objetivos Activos</h5>
                                </div>
                                <Badge color="light" className="text-dark">
                                    {currentGoals.length} objetivo(s)
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                {currentGoals.map((goal, index) => (
                                    <Col md={6} lg={4} key={goal.id} className="mb-3">
                                        <Card className="border">
                                            <CardBody>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="mb-1">{goal.name}</h6>
                                                        <small className="text-muted">
                                                            {goal.type === 'individual'
                                                                ? `${goal.user?.name} ${goal.user?.last_name}`
                                                                : goal.team_name
                                                            }
                                                        </small>
                                                    </div>
                                                    <Badge color={goal.type === 'individual' ? 'primary' : 'info'}>
                                                        {goal.type === 'individual' ? 'Individual' : 'Equipo'}
                                                    </Badge>
                                                </div>

                                                <div className="mb-2">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <small>Progreso</small>
                                                        <small className="fw-bold">{goal.progress_percentage?.toFixed(1)}%</small>
                                                    </div>
                                                    <Progress
                                                        value={goal.progress_percentage || 0}
                                                        color={getProgressColor(goal.progress_percentage || 0)}
                                                    />
                                                </div>

                                                <div className="d-flex justify-content-between text-sm">
                                                    <div>
                                                        <small className="text-muted">Meta:</small>
                                                        <div className="fw-bold">{formatPrice(goal.target_amount)}</div>
                                                    </div>
                                                    <div className="text-end">
                                                        <small className="text-muted">Actual:</small>
                                                        <div className="fw-bold text-success">{formatPrice(goal.current_amount || 0)}</div>
                                                    </div>
                                                </div>

                                                {goal.is_achieved && (
                                                    <Badge color="success" className="mt-2 w-100">
                                                        <Award size={14} className="me-1" />
                                                        ¡Objetivo Alcanzado!
                                                    </Badge>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </CardBody>
                    </Card>
                )}
            </Fragment>
        </AuthenticatedLayout>
    )
}
