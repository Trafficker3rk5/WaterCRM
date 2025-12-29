import React, { Fragment, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import DataTable from 'react-data-table-component';
import { customStyles } from "@/Template/Styles/DataTable";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import { Badge } from 'reactstrap';
import FilterTable from "@/Template/Components/FilterTable";
import Icon from "@/Template/CommonElements/Icon";

export default function ContractList({ auth, title, cid, contracts }) {
    const [dataList, setDataList] = useState(contracts);

    const tableColumns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            center: false,
        },
        {
            name: 'Tipo',
            selector: row => {
                return (
                    <Badge color={row.type === 'pdf' ? 'primary' : 'info'}>
                        {row.type === 'pdf' ? 'PDF' : 'Texto'}
                    </Badge>
                );
            },
            sortable: true,
            center: true,
            maxWidth: "100px"
        },
        {
            name: 'Estado',
            selector: row => {
                return (
                    <Badge color={row.is_active ? 'success' : 'secondary'}>
                        {row.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                );
            },
            sortable: true,
            center: true,
            maxWidth: "100px"
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <Edit onClick={() => router.visit(route('contracts.edit', [cid, row.id]))} id={'edit-' + row.id}/>
                        <Trash onClick={() => handleDelete(row.id)} id={'delete-' + row.id}/>
                    </>
                )
            },
            sortable: false,
            center: true,
            maxWidth: "100px"
        },
    ];

    const handleDelete = (id) => {
        if (confirm('¿Está seguro de eliminar este contrato?')) {
            router.delete(route('contracts.destroy', [cid, id]), {
                onSuccess: () => {
                    setDataList(dataList.filter(c => c.id !== id));
                }
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />

                <FilterTable
                    dataList={dataList}
                    tableColumns={tableColumns}
                    filters={[]}
                    getList={(d) => setDataList(contracts)}
                /> 

                <Btn attrBtn={{ color: 'secondary cancel-btn ms-1 mt-4', onClick: () => router.visit(route('clients')) }} >Volver</Btn>

                <AddBtn onClick={() => router.visit(route('contracts.create', cid))} />
            </Fragment>
        </AuthenticatedLayout>
    )
}

