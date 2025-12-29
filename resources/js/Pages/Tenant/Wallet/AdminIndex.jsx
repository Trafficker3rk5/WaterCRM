import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';

export default function WalletAdminIndex({ auth, wallets }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('balance'); // balance, total_income, user
    const [sortDirection, setSortDirection] = useState('desc');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount || 0);
    };

    const filteredWallets = wallets.filter(wallet => {
        const userName = wallet.user?.name?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return userName.includes(search);
    });

    const sortedWallets = [...filteredWallets].sort((a, b) => {
        let aVal, bVal;

        switch (sortBy) {
            case 'balance':
                aVal = parseFloat(a.balance || 0);
                bVal = parseFloat(b.balance || 0);
                break;
            case 'total_income':
                aVal = parseFloat(a.total_income || 0);
                bVal = parseFloat(b.total_income || 0);
                break;
            case 'user':
                aVal = a.user?.name || '';
                bVal = b.user?.name || '';
                break;
            default:
                return 0;
        }

        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('desc');
        }
    };

    const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);
    const totalIncome = wallets.reduce((sum, w) => sum + parseFloat(w.total_income || 0), 0);
    const totalOutcome = wallets.reduce((sum, w) => sum + parseFloat(w.total_outcome || 0), 0);

    const getSortIcon = (field) => {
        if (sortBy !== field) return <i className="fa fa-sort text-muted"></i>;
        return sortDirection === 'asc'
            ? <i className="fa fa-sort-up text-primary"></i>
            : <i className="fa fa-sort-down text-primary"></i>;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Administración de Monederos" />

            <div className="container-fluid">
                <div className="page-header">
                    <div className="row">
                        <div className="col-lg-6">
                            <h3>Administración de Monederos</h3>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="/dashboard">Dashboard</a>
                                </li>
                                <li className="breadcrumb-item active">
                                    Monederos
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-primary bg-opacity-10 p-3 rounded">
                                            <i className="fa fa-wallet fa-2x text-primary"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h6 className="text-muted mb-1">Balance Total</h6>
                                        <h4 className="mb-0">{formatCurrency(totalBalance)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-success bg-opacity-10 p-3 rounded">
                                            <i className="fa fa-arrow-down fa-2x text-success"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h6 className="text-muted mb-1">Total Ingresos</h6>
                                        <h4 className="mb-0 text-success">{formatCurrency(totalIncome)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-danger bg-opacity-10 p-3 rounded">
                                            <i className="fa fa-arrow-up fa-2x text-danger"></i>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h6 className="text-muted mb-1">Total Gastos</h6>
                                        <h4 className="mb-0 text-danger">{formatCurrency(totalOutcome)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wallets Table */}
                <div className="card">
                    <div className="card-header">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <h5 className="mb-0">Monederos de Usuarios</h5>
                            </div>
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fa fa-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar por nombre de usuario..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('user')}>
                                            Usuario {getSortIcon('user')}
                                        </th>
                                        <th>Rol</th>
                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('balance')}>
                                            Balance {getSortIcon('balance')}
                                        </th>
                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('total_income')}>
                                            Total Ingresos {getSortIcon('total_income')}
                                        </th>
                                        <th>Total Gastos</th>
                                        <th>Transacciones</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedWallets.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                {searchTerm ? 'No se encontraron monederos' : 'No hay monederos registrados'}
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedWallets.map(wallet => (
                                            <tr key={wallet.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm bg-primary text-white rounded-circle me-2">
                                                            {wallet.user?.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="fw-medium">{wallet.user?.name || 'Usuario Desconocido'}</div>
                                                            <small className="text-muted">{wallet.user?.email || ''}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-secondary">
                                                        {wallet.user?.role_label || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`fw-bold ${parseFloat(wallet.balance || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                        {formatCurrency(wallet.balance)}
                                                    </span>
                                                </td>
                                                <td className="text-success">
                                                    {formatCurrency(wallet.total_income)}
                                                </td>
                                                <td className="text-danger">
                                                    {formatCurrency(wallet.total_outcome)}
                                                </td>
                                                <td>
                                                    <span className="badge bg-info">
                                                        {wallet.transactions_count || 0} transacciones
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => window.location.href = `/wallet?user_id=${wallet.user_id}`}
                                                            title="Ver detalles"
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-info"
                                                            onClick={() => window.location.href = `/wallet/transactions?user_id=${wallet.user_id}`}
                                                            title="Ver transacciones"
                                                        >
                                                            <i className="fa fa-list"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <td colSpan="2" className="fw-bold">TOTALES</td>
                                        <td className="fw-bold text-primary">{formatCurrency(totalBalance)}</td>
                                        <td className="fw-bold text-success">{formatCurrency(totalIncome)}</td>
                                        <td className="fw-bold text-danger">{formatCurrency(totalOutcome)}</td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="card mt-3">
                    <div className="card-body">
                        <h6 className="card-title">
                            <i className="fa fa-info-circle text-info me-2"></i>
                            Información
                        </h6>
                        <ul className="mb-0 small">
                            <li>El balance muestra el saldo actual de cada monedero</li>
                            <li>Los ingresos incluyen depósitos, pagos recibidos y entregas</li>
                            <li>Los gastos incluyen retiros y pagos realizados</li>
                            <li>Haz clic en "Ver detalles" para acceder al monedero del usuario</li>
                            <li>Los monederos se actualizan en tiempo real con cada transacción</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
