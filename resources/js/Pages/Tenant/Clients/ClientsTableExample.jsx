import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import ConfigurableTable from '@/Components/ConfigurableTable';

export default function ClientsTableExample({ auth, clients }) {
    // Definir columnas disponibles
    const columns = [
        {
            key: 'id',
            label: 'ID',
            visible: true,
            sortable: true,
            width: '80px'
        },
        {
            key: 'name',
            label: 'Nombre',
            visible: true,
            sortable: true
        },
        {
            key: 'email',
            label: 'Email',
            visible: true,
            sortable: true
        },
        {
            key: 'phone',
            label: 'Teléfono',
            visible: true,
            sortable: false
        },
        {
            key: 'company',
            label: 'Empresa',
            visible: true,
            sortable: true
        },
        {
            key: 'address',
            label: 'Dirección',
            visible: false, // Oculta por defecto
            sortable: false
        },
        {
            key: 'city',
            label: 'Ciudad',
            visible: true,
            sortable: true
        },
        {
            key: 'postal_code',
            label: 'Código Postal',
            visible: false, // Oculta por defecto
            sortable: false
        },
        {
            key: 'province',
            label: 'Provincia',
            visible: false, // Oculta por defecto
            sortable: true
        },
        {
            key: 'country',
            label: 'País',
            visible: false, // Oculta por defecto
            sortable: true
        },
        {
            key: 'status',
            label: 'Estado',
            visible: true,
            sortable: true
        },
        {
            key: 'source',
            label: 'Fuente',
            visible: false, // Oculta por defecto
            sortable: true
        },
        {
            key: 'budget_count',
            label: '# Presupuestos',
            visible: true,
            sortable: true,
            width: '120px'
        },
        {
            key: 'total_budgets',
            label: 'Total Facturado',
            visible: true,
            sortable: true,
            width: '150px'
        },
        {
            key: 'created_at',
            label: 'Fecha Creación',
            visible: true,
            sortable: true,
            width: '130px'
        },
        {
            key: 'updated_at',
            label: 'Última Actualización',
            visible: false, // Oculta por defecto
            sortable: true,
            width: '160px'
        }
    ];

    // Función para renderizar celdas personalizadas
    const renderCell = (row, column) => {
        switch (column.key) {
            case 'status':
                const statusColors = {
                    'lead': 'bg-info',
                    'active': 'bg-success',
                    'inactive': 'bg-secondary',
                    'opportunity': 'bg-warning'
                };
                return (
                    <span className={`badge ${statusColors[row.status] || 'bg-secondary'}`}>
                        {row.status_label || row.status}
                    </span>
                );

            case 'email':
                return (
                    <a href={`mailto:${row.email}`} className="text-primary">
                        {row.email}
                    </a>
                );

            case 'phone':
                return row.phone ? (
                    <a href={`tel:${row.phone}`} className="text-dark">
                        {row.phone}
                    </a>
                ) : '-';

            case 'total_budgets':
                return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(row.total_budgets || 0);

            case 'created_at':
            case 'updated_at':
                return row[column.key]
                    ? new Date(row[column.key]).toLocaleDateString('es-ES')
                    : '-';

            case 'name':
                return (
                    <div>
                        <div className="fw-medium">{row.name}</div>
                        {row.company && (
                            <small className="text-muted">{row.company}</small>
                        )}
                    </div>
                );

            default:
                return row[column.key] || '-';
        }
    };

    // Acciones por fila
    const actions = [
        {
            label: 'Ver',
            icon: 'fa-eye',
            className: 'btn btn-outline-primary',
            onClick: (row) => router.visit(`/clients/${row.id}`)
        },
        {
            label: 'Editar',
            icon: 'fa-edit',
            className: 'btn btn-outline-secondary',
            onClick: (row) => router.visit(`/clients/${row.id}/edit`)
        },
        {
            label: 'Presupuestos',
            icon: 'fa-file-invoice',
            className: 'btn btn-outline-info',
            onClick: (row) => router.visit(`/budgets/${row.id}`)
        }
    ];

    // Handle sorting
    const handleSort = (key, direction) => {
        // Aquí puedes implementar la lógica de ordenamiento
        // Puede ser cliente-side o hacer una petición al servidor
        console.log(`Sorting by ${key} ${direction}`);

        // Ejemplo de ordenamiento client-side:
        // const sorted = [...clients].sort((a, b) => {
        //     if (direction === 'asc') {
        //         return a[key] > b[key] ? 1 : -1;
        //     } else {
        //         return a[key] < b[key] ? 1 : -1;
        //     }
        // });
        // Actualizar estado o hacer reload con Inertia
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Clientes" />

            <div className="container-fluid">
                <div className="page-header">
                    <div className="row">
                        <div className="col-lg-6">
                            <h3>Gestión de Clientes</h3>
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="/dashboard">Dashboard</a>
                                </li>
                                <li className="breadcrumb-item active">Clientes</li>
                            </ol>
                        </div>
                        <div className="col-lg-6 text-end">
                            <button
                                className="btn btn-primary"
                                onClick={() => router.visit('/clients/create')}
                            >
                                <i className="fa fa-plus me-2"></i>
                                Nuevo Cliente
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h5>Lista de Clientes</h5>
                        <p className="text-muted mb-0">
                            Personaliza las columnas que quieres ver en la tabla
                        </p>
                    </div>
                    <div className="card-body">
                        <ConfigurableTable
                            columns={columns}
                            data={clients}
                            tableId="clients-table"
                            renderCell={renderCell}
                            actions={actions}
                            onSort={handleSort}
                            emptyMessage="No hay clientes registrados"
                        />
                    </div>
                </div>

                {/* Info Card */}
                <div className="card mt-3">
                    <div className="card-body">
                        <h6>
                            <i className="fa fa-info-circle text-info me-2"></i>
                            Información
                        </h6>
                        <ul className="mb-0 small">
                            <li>Haz clic en el botón "Columnas" para mostrar/ocultar columnas</li>
                            <li>La configuración se guarda automáticamente en tu navegador</li>
                            <li>Haz clic en los encabezados para ordenar (columnas ordenables)</li>
                            <li>Usa "Todas/Ninguna" para seleccionar todas las columnas a la vez</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
