import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, campaigns }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
            router.delete(`/campaigns/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleDuplicate = (id) => {
        router.post(`/campaigns/${id}/duplicate`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Campaña duplicada correctamente');
            }
        });
    };

    const handleSend = (id) => {
        if (confirm('¿Estás seguro de que quieres enviar esta campaña? Esta acción no se puede deshacer.')) {
            router.post(`/campaigns/${id}/send`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    alert('Campaña enviada a la cola. Los emails se enviarán en breve.');
                }
            });
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-secondary',
            scheduled: 'bg-info',
            sending: 'bg-warning',
            sent: 'bg-success',
            paused: 'bg-warning',
            cancelled: 'bg-danger'
        };
        return badges[status] || 'bg-secondary';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Campañas de Email" />

            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">
                                    <i className="fas fa-envelope me-2"></i>
                                    Campañas de Email Marketing
                                </h4>
                                <Link href="/campaigns/create" className="btn btn-primary">
                                    <i className="fas fa-plus me-2"></i>
                                    Nueva Campaña
                                </Link>
                            </div>
                            <div className="card-body">
                                {/* Filters */}
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Buscar campañas..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <select
                                            className="form-select"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="all">Todos los estados</option>
                                            <option value="draft">Borrador</option>
                                            <option value="scheduled">Programada</option>
                                            <option value="sending">Enviando</option>
                                            <option value="sent">Enviada</option>
                                            <option value="paused">Pausada</option>
                                            <option value="cancelled">Cancelada</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Campaigns Table */}
                                {filteredCampaigns.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-envelope fa-3x text-muted mb-3"></i>
                                        <p className="text-muted">No hay campañas disponibles</p>
                                        <Link href="/campaigns/create" className="btn btn-primary">
                                            Crear primera campaña
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Campaña</th>
                                                    <th>Estado</th>
                                                    <th>Destinatarios</th>
                                                    <th>Enviados</th>
                                                    <th>Abiertos</th>
                                                    <th>Clicks</th>
                                                    <th>Fecha</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCampaigns.map((campaign) => (
                                                    <tr key={campaign.id}>
                                                        <td>
                                                            <div>
                                                                <strong>{campaign.name}</strong>
                                                                <br />
                                                                <small className="text-muted">{campaign.subject}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadge(campaign.status)}`}>
                                                                {campaign.status_label}
                                                            </span>
                                                        </td>
                                                        <td>{campaign.total_recipients}</td>
                                                        <td>
                                                            {campaign.emails_sent}
                                                            {campaign.emails_failed > 0 && (
                                                                <span className="text-danger ms-1">
                                                                    ({campaign.emails_failed} fallidos)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {campaign.emails_opened}
                                                            <span className="text-muted ms-1">
                                                                ({campaign.open_rate}%)
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {campaign.links_clicked}
                                                            <span className="text-muted ms-1">
                                                                ({campaign.click_rate}%)
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {campaign.sent_at || campaign.created_at}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div className="btn-group btn-group-sm">
                                                                {campaign.status === 'sent' && (
                                                                    <Link
                                                                        href={`/campaigns/${campaign.id}/stats`}
                                                                        className="btn btn-info"
                                                                        title="Ver estadísticas"
                                                                    >
                                                                        <i className="fas fa-chart-bar"></i>
                                                                    </Link>
                                                                )}
                                                                {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                                                                    <>
                                                                        <Link
                                                                            href={`/campaigns/${campaign.id}/edit`}
                                                                            className="btn btn-warning"
                                                                            title="Editar"
                                                                        >
                                                                            <i className="fas fa-edit"></i>
                                                                        </Link>
                                                                        <button
                                                                            onClick={() => handleSend(campaign.id)}
                                                                            className="btn btn-success"
                                                                            title="Enviar ahora"
                                                                        >
                                                                            <i className="fas fa-paper-plane"></i>
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDuplicate(campaign.id)}
                                                                    className="btn btn-secondary"
                                                                    title="Duplicar"
                                                                >
                                                                    <i className="fas fa-copy"></i>
                                                                </button>
                                                                {campaign.status === 'draft' && (
                                                                    <button
                                                                        onClick={() => handleDelete(campaign.id)}
                                                                        className="btn btn-danger"
                                                                        title="Eliminar"
                                                                    >
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
