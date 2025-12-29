import React, { Fragment, useContext } from "react";
import { Breadcrumbs } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import MainDataContext from '@/Template/_helper/MainData';
import { Card, CardBody, Row, Col, Badge } from "reactstrap";
import DataTable from 'react-data-table-component';
import { Eye } from "react-feather";

export default function Index({ auth, warehouses }) {
    const { handleDelete, formatPrice } = useContext(MainDataContext);

    const tableColumns = [
        {
            name: 'Código',
            selector: row => row.code,
            sortable: true,
            width: '100px',
        },
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Tipo',
            selector: row => {
                const types = {
                    'physical': 'Físico',
                    'virtual': 'Virtual',
                    'vehicle': 'Vehículo'
                };
                return <Badge color="info">{types[row.type] || row.type}</Badge>;
            },
            sortable: true,
            width: '100px',
        },
        {
            name: 'Ubicación',
            selector: row => row.location || '-',
            sortable: true,
        },
        {
            name: 'Productos',
            selector: row => row.products_count || 0,
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Stock Total',
            selector: row => row.total_stock || 0,
            sortable: true,
            center: true,
            width: '120px',
        },
        {
            name: 'Stock Bajo',
            selector: row => {
                const count = row.low_stock_count || 0;
                return count > 0
                    ? <Badge color="danger">{count}</Badge>
                    : <Badge color="success">0</Badge>;
            },
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Valor Inventario',
            selector: row => formatPrice(row.inventory_value || 0),
            sortable: true,
            right: true,
            width: '150px',
        },
        {
            name: 'Estado',
            selector: row => (
                <Badge color={row.is_active ? 'success' : 'secondary'}>
                    {row.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
            sortable: true,
            center: true,
            width: '100px',
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <Eye
                            size={16}
                            className="me-2 cursor-pointer text-info"
                            onClick={() => router.visit(route('warehouses.stock', row.id))}
                            title="Ver Stock"
                        />
                        <Edit
                            onClick={() => router.visit(route('warehouses.edit', row.id))}
                            id={'edit-' + row.id}
                        />
                        <Trash
                            onClick={() => handleDelete(route('warehouses.destroy', row.id))}
                            id={'delete-' + row.id}
                        />
                    </>
                )
            },
            sortable: false,
            center: true,
            width: '120px',
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Almacenes" />
            <Fragment>
                <Breadcrumbs mainTitle="Almacenes" title="Almacenes" />

                <Card>
                    <CardBody>
                        <DataTable
                            columns={tableColumns}
                            data={warehouses || []}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No hay almacenes registrados"
                            paginationComponentOptions={{
                                rowsPerPageText: 'Filas por página:',
                                rangeSeparatorText: 'de',
                            }}
                        />
                    </CardBody>
                </Card>

                <AddBtn onClick={() => router.visit(route('warehouses.create'))} />
            </Fragment>
        </AuthenticatedLayout>
    )
}
