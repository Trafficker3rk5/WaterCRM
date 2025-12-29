import React, { Fragment } from "react";
import { Breadcrumbs } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardBody, Row, Col, Badge, Table, Progress } from "reactstrap";
import { Users, Phone, TrendingUp, Clock, Award } from "react-feather";
import CountUp from 'react-countup';

export default function TeamPerformance({ auth, performance }) {
    const getPerformanceBadge = (percentage) => {
        if (percentage >= 80) return { color: 'success', text: 'Excelente' };
        if (percentage >= 60) return { color: 'info', text: 'Bueno' };
        if (percentage >= 40) return { color: 'warning', text: 'Regular' };
        return { color: 'danger', text: 'Bajo' };
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${String(secs).padStart(2, '0')} min`;
    };

    const calculatePerformanceScore = (agent) => {
        // Simple performance score based on contacted rate and conversions
        const contactRate = agent.total_calls > 0 ? (agent.contacted / agent.total_calls) * 100 : 0;
        const conversionRate = agent.contacted > 0 ? (agent.conversions / agent.contacted) * 100 : 0;
        return Math.round((contactRate * 0.6) + (conversionRate * 0.4));
    };

    // Calculate team totals
    const teamTotals = performance.reduce((acc, agent) => ({
        total_calls: acc.total_calls + agent.total_calls,
        contacted: acc.contacted + agent.contacted,
        interested: acc.interested + agent.interested,
        conversions: acc.conversions + agent.conversions,
        today_calls: acc.today_calls + agent.today_calls,
    }), { total_calls: 0, contacted: 0, interested: 0, conversions: 0, today_calls: 0 });

    const teamContactRate = teamTotals.total_calls > 0
        ? Math.round((teamTotals.contacted / teamTotals.total_calls) * 100)
        : 0;

    const teamConversionRate = teamTotals.contacted > 0
        ? Math.round((teamTotals.conversions / teamTotals.contacted) * 100)
        : 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Rendimiento del Equipo" />
            <Fragment>
                <Breadcrumbs mainTitle="Rendimiento del Equipo" parent="Telemarketing" title="Métricas del Equipo TMK" />

                {/* Team Summary Cards */}
                <Row className="mb-4">
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Users size={32} className="text-primary" />
                                </div>
                                <h6 className="text-muted mb-1">Agentes Activos</h6>
                                <h3 className="mb-0">
                                    <CountUp end={performance.length} duration={1} />
                                </h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Phone size={32} className="text-info" />
                                </div>
                                <h6 className="text-muted mb-1">Total Llamadas</h6>
                                <h3 className="mb-0">
                                    <CountUp end={teamTotals.total_calls} duration={1} />
                                </h3>
                                <small className="text-success">
                                    {teamTotals.today_calls} hoy
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
                                <h6 className="text-muted mb-1">Tasa Contacto</h6>
                                <h3 className="mb-0">{teamContactRate}%</h3>
                                <small className="text-muted">
                                    {teamTotals.contacted} contactados
                                </small>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div className="mb-2">
                                    <Award size={32} className="text-warning" />
                                </div>
                                <h6 className="text-muted mb-1">Tasa Conversión</h6>
                                <h3 className="mb-0">{teamConversionRate}%</h3>
                                <small className="text-muted">
                                    {teamTotals.conversions} conversiones
                                </small>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Individual Performance */}
                <Card>
                    <CardBody>
                        <h5 className="mb-4">Rendimiento Individual</h5>

                        {performance && performance.length > 0 ? (
                            <div className="table-responsive">
                                <Table striped hover>
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{width: '5%'}}>#</th>
                                            <th style={{width: '20%'}}>Agente</th>
                                            <th className="text-center">Total Llamadas</th>
                                            <th className="text-center">Contactados</th>
                                            <th className="text-center">Tasa Contacto</th>
                                            <th className="text-center">Interesados</th>
                                            <th className="text-center">Conversiones</th>
                                            <th className="text-center">Tasa Conversión</th>
                                            <th className="text-center">Duración Prom.</th>
                                            <th className="text-center">Hoy</th>
                                            <th className="text-center">Rendimiento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performance
                                            .sort((a, b) => calculatePerformanceScore(b) - calculatePerformanceScore(a))
                                            .map((agent, index) => {
                                                const contactRate = agent.total_calls > 0
                                                    ? Math.round((agent.contacted / agent.total_calls) * 100)
                                                    : 0;
                                                const conversionRate = agent.contacted > 0
                                                    ? Math.round((agent.conversions / agent.contacted) * 100)
                                                    : 0;
                                                const performanceScore = calculatePerformanceScore(agent);
                                                const performanceBadge = getPerformanceBadge(performanceScore);

                                                return (
                                                    <tr key={agent.user.id}>
                                                        <td className="text-center">
                                                            {index === 0 && <Award size={18} className="text-warning" />}
                                                            {index === 1 && <Award size={18} className="text-secondary" />}
                                                            {index === 2 && <Award size={18} className="text-bronze" />}
                                                            {index > 2 && <span className="text-muted">{index + 1}</span>}
                                                        </td>
                                                        <td>
                                                            <strong>{agent.user.name} {agent.user.last_name}</strong>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge color="info">{agent.total_calls}</Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge color="success">{agent.contacted}</Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <div style={{ width: '100%' }}>
                                                                <small className="d-block mb-1">{contactRate}%</small>
                                                                <Progress
                                                                    value={contactRate}
                                                                    color={contactRate >= 60 ? 'success' : contactRate >= 40 ? 'warning' : 'danger'}
                                                                    style={{ height: '6px' }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge color="warning">{agent.interested}</Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge color="primary">{agent.conversions}</Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <div style={{ width: '100%' }}>
                                                                <small className="d-block mb-1">{conversionRate}%</small>
                                                                <Progress
                                                                    value={conversionRate}
                                                                    color={conversionRate >= 20 ? 'success' : conversionRate >= 10 ? 'warning' : 'danger'}
                                                                    style={{ height: '6px' }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            <small>
                                                                <Clock size={14} className="me-1" />
                                                                {formatDuration(agent.avg_duration)}
                                                            </small>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge color={agent.today_calls > 0 ? 'success' : 'secondary'}>
                                                                {agent.today_calls}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge color={performanceBadge.color}>
                                                                {performanceScore}% - {performanceBadge.text}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                    <tfoot className="bg-light">
                                        <tr>
                                            <td colSpan="2"><strong>TOTALES</strong></td>
                                            <td className="text-center"><strong>{teamTotals.total_calls}</strong></td>
                                            <td className="text-center"><strong>{teamTotals.contacted}</strong></td>
                                            <td className="text-center"><strong>{teamContactRate}%</strong></td>
                                            <td className="text-center"><strong>{teamTotals.interested}</strong></td>
                                            <td className="text-center"><strong>{teamTotals.conversions}</strong></td>
                                            <td className="text-center"><strong>{teamConversionRate}%</strong></td>
                                            <td className="text-center">-</td>
                                            <td className="text-center"><strong>{teamTotals.today_calls}</strong></td>
                                            <td className="text-center">-</td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <Users size={64} className="text-muted mb-3 opacity-25" />
                                <h5 className="text-muted">No hay agentes en tu equipo</h5>
                                <p className="text-muted">
                                    Asigna agentes TMK como subordinados para ver sus métricas
                                </p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Performance Insights */}
                {performance && performance.length > 0 && (
                    <Row className="mt-4">
                        <Col md={6}>
                            <Card>
                                <CardBody>
                                    <h6 className="text-primary mb-3">🏆 Top 3 Performers</h6>
                                    <div className="list-group list-group-flush">
                                        {performance
                                            .sort((a, b) => calculatePerformanceScore(b) - calculatePerformanceScore(a))
                                            .slice(0, 3)
                                            .map((agent, index) => {
                                                const medals = ['🥇', '🥈', '🥉'];
                                                const score = calculatePerformanceScore(agent);
                                                return (
                                                    <div key={agent.user.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="me-2">{medals[index]}</span>
                                                            <strong>{agent.user.name} {agent.user.last_name}</strong>
                                                        </div>
                                                        <Badge color="success">{score}% rendimiento</Badge>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                                <CardBody>
                                    <h6 className="text-warning mb-3">📊 Estadísticas del Equipo</h6>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td>Promedio de llamadas por agente:</td>
                                                <td className="text-end">
                                                    <strong>
                                                        {performance.length > 0
                                                            ? Math.round(teamTotals.total_calls / performance.length)
                                                            : 0
                                                        }
                                                    </strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Promedio de conversiones por agente:</td>
                                                <td className="text-end">
                                                    <strong>
                                                        {performance.length > 0
                                                            ? Math.round(teamTotals.conversions / performance.length)
                                                            : 0
                                                        }
                                                    </strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Mejor tasa de contacto:</td>
                                                <td className="text-end">
                                                    <strong className="text-success">
                                                        {Math.max(...performance.map(a =>
                                                            a.total_calls > 0 ? Math.round((a.contacted / a.total_calls) * 100) : 0
                                                        ))}%
                                                    </strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Mejor tasa de conversión:</td>
                                                <td className="text-end">
                                                    <strong className="text-primary">
                                                        {Math.max(...performance.map(a =>
                                                            a.contacted > 0 ? Math.round((a.conversions / a.contacted) * 100) : 0
                                                        ))}%
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Fragment>
        </AuthenticatedLayout>
    )
}
