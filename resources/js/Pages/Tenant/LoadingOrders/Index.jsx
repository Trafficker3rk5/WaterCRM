import React, { Fragment, useContext } from "react";
import { Breadcrumbs } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import MainDataContext from '@/Template/_helper/MainData';
import { Card, CardBody, Badge } from "reactstrap";
import DataTable from 'react-data-table-component';
import AddBtn from '@/Template/CommonElements/AddBtn';
import { Eye, CheckCircle, XCircle } from "react-feather";

export default function Index({ auth, orders, installerWarehouses, warehouses, userRole }) {
    const { formatDate } = useContext(MainDataContext);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'warning', text: 'Pendiente' },
            'validated': { color: 'info', text: 'Validada' },
            'loaded': { color: 'success', text: 'Cargada' },
            'cancelled': { color: 'danger', text: 'Cancelada' }
        };
        const config = statusConfig[status] || { color: 'secondary', text: status };
        return <Badge color={config.color}>{config.text}</Badge>;
    };

    const tableColumns = [
        {
            name: 'Nº Orden',
            selector: row => row.order_number,
            sortable: true,
            width: '140px',
        },
        {
            name: 'Instalador',
            selector: row => row.installer_warehouse?.user?.name || '-',
            sortable: true,
        },
        {
            name: 'Furgoneta',
            selector: row => row.installer_warehouse?.name || '-',
            sortable: true,
        },
        {
            name: 'Almacén Origen',
            selector: row => row.source_warehouse?.name || 'Sin asignar',
            sortable: true,
        },
        {
            name: 'Items Solicitados',
            selector: row => row.total_items || 0,
            sortable: true,
            center: true,
            width: '140px',
        },
        {
            name: 'Items Cargados',
            selector: row => row.total_loaded || 0,
            sortable: true,
            center: true,
            width: '140px',
        },
        {
            name: 'Estado',
            selector: row => getStatusBadge(row.status),
            sortable: true,
            center: true,
            width: '120px',
        },
        {
            name: 'Fecha Creación',
            selector: row => formatDate(row.created_at),
            sortable: true,
            width: '140px',
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <div className="d-flex gap-2">
                        <Eye
                            size={16}
                            className="cursor-pointer text-info"
                            onClick={() => router.visit(route('loading-orders.show', row.id))}
                            title="Ver Detalles"
                        />
                        {row.status === 'pending' && [0, 1, 3].includes(userRole) && (
                            <CheckCircle
                                size={16}
                                className="cursor-pointer text-success"
                                onClick={() => router.visit(route('loading-orders.show', row.id))}
                                title="Validar"
                            />
                        )}
                        {(row.status === 'pending' || row.status === 'validated') && (
                            <XCircle
                                size={16}
                                className="cursor-pointer text-danger"
                                onClick={() => {
                                    if (confirm('¿Está seguro de cancelar esta orden?')) {
                                        router.post(route('loading-orders.cancel', row.id));
                                    }
                                }}
                                title="Cancelar"
                            />
                        )}
                    </div>
                )
            },
            sortable: false,
            center: true,
            width: '120px',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Órdenes de Carga" />
            <Fragment>
                <Breadcrumbs mainTitle="Órdenes de Carga" title="Órdenes de Carga" />

                <Card>
                    <CardBody>
                        <DataTable
                            columns={tableColumns}
                            data={orders || []}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay órdenes de carga"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                        />
                    </CardBody>
                </Card>

                <AddBtn onClick={() => router.visit(route('loading-orders.create'))} />
            </Fragment>
        </AuthenticatedLayout>
    )
}
