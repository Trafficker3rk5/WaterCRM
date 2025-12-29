import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Stats({ auth, campaign, stats, logs }) {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'all' || log.status === filter ||
            (filter === 'opened' && log.opened_at) ||
            (filter === 'clicked' && log.first_clicked_at);

        const matchesSearch = log.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const StatCard = ({ title, value, subtitle, icon, color }) => (
        <div className="col-md-4 mb-3">
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <p className="text-muted mb-1">{title}</p>
                            <h3 className={`mb-0 text-${color}`}>{value}</h3>
                            {subtitle && <small className="text-muted">{subtitle}</small>}
                        </div>
                        <div className={`text-${color}`} style={{ fontSize: '2rem' }}>
                            <i className={icon}></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Estadísticas - ${campaign.name}`} />

            <div className="container-fluid py-4">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="mb-1">{campaign.name}</h3>
                                <p className="text-muted mb-0">{campaign.subject}</p>
                            </div>
                            <Link href="/campaigns" className="btn btn-secondary">
                                <i className="fas fa-arrow-left me-2"></i>
                                Volver
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="row mb-4">
                    <StatCard
                        title="Total Destinatarios"
                        value={stats.total}
                        icon="fas fa-users"
                        color="primary"
                    />
                    <StatCard
                        title="Enviados"
                        value={stats.sent}
                        subtitle={`${stats.failed} fallidos`}
                        icon="fas fa-paper-plane"
                        color="success"
                    />
                    <StatCard
                        title="Tasa de Apertura"
                        value={`${stats.open_rate}%`}
                        subtitle={`${stats.opened} aperturas`}
                        icon="fas fa-envelope-open"
                        color="info"
                    />
                    <StatCard
                        title="Tasa de Click"
                        value={`${stats.click_rate}%`}
                        subtitle={`${stats.clicked} clicks`}
                        icon="fas fa-mouse-pointer"
                        color="warning"
                    />
                    <StatCard
                        title="Fallidos"
                        value={stats.failed}
                        icon="fas fa-exclamation-triangle"
                        color="danger"
                    />
                    <StatCard
                        title="Estado"
                        value={campaign.status_label}
                        subtitle={campaign.sent_at || campaign.created_at}
                        icon="fas fa-flag"
                        color="secondary"
                    />
                </div>

                {/* Progress Bar */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="mb-3">Progreso</h5>
                                <div className="progress" style={{ height: '30px' }}>
                                    <div
                                        className="progress-bar bg-success"
                                        style={{ width: `${(stats.sent / stats.total) * 100}%` }}
                                    >
                                        {stats.sent} Enviados
                                    </div>
                                    <div
                                        className="progress-bar bg-info"
                                        style={{ width: `${(stats.opened / stats.total) * 100}%` }}
                                    >
                                        {stats.opened} Abiertos
                                    </div>
                                    <div
                                        className="progress-bar bg-warning"
                                        style={{ width: `${(stats.clicked / stats.total) * 100}%` }}
                                    >
                                        {stats.clicked} Clicks
                                    </div>
                                    {stats.failed > 0 && (
                                        <div
                                            className="progress-bar bg-danger"
                                            style={{ width: `${(stats.failed / stats.total) * 100}%` }}
                                        >
                                            {stats.failed} Fallidos
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Detalle de Envíos</h5>
                            </div>
                            <div className="card-body">
                                {/* Filters */}
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Buscar por nombre o email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <select
                                            className="form-select"
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        >
                                            <option value="all">Todos</option>
                                            <option value="sent">Enviados</option>
                                            <option value="opened">Abiertos</option>
                                            <option value="clicked">Con Clicks</option>
                                            <option value="failed">Fallidos</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover">
                                        <thead>
                                            <tr>
                                                <th>Destinatario</th>
                                                <th>Email</th>
                                                <th>Estado</th>
                                                <th>Enviado</th>
                                                <th>Abierto</th>
                                                <th>Clicks</th>
                                                <th>Aperturas</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLogs.map((log) => (
                                                <tr key={log.id}>
                                                    <td>{log.recipient_name}</td>
                                                    <td>
                                                        <small className="text-muted">{log.recipient_email}</small>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${
                                                            log.status === 'sent' ? 'bg-success' :
                                                            log.status === 'failed' ? 'bg-danger' :
                                                            'bg-secondary'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                        {log.error_message && (
                                                            <i
                                                                className="fas fa-exclamation-circle text-danger ms-1"
                                                                title={log.error_message}
                                                            ></i>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <small>{log.sent_at || '-'}</small>
                                                    </td>
                                                    <td>
                                                        {log.opened_at ? (
                                                            <>
                                                                <i className="fas fa-check text-success me-1"></i>
                                                                <small>{log.opened_at}</small>
                                                            </>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {log.first_clicked_at ? (
                                                            <>
                                                                <i className="fas fa-check text-info me-1"></i>
                                                                <small>{log.first_clicked_at}</small>
                                                            </>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark">
                                                            {log.open_count} / {log.click_count}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredLogs.length === 0 && (
                                    <div className="text-center py-4">
                                        <p className="text-muted">No hay registros que coincidan con los filtros</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
