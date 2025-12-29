import React, { Fragment, useState, useEffect, useContext } from "react";
import { Breadcrumbs } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import DataTable from 'react-data-table-component';
import axios from "axios";
import { customStyles } from "@/Template/Styles/DataTable";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import MainDataContext from '@/Template/_helper/MainData';
import { Badge } from 'reactstrap';
import FilterTable from "@/Template/Components/FilterTable";

export default function SparePartList({ auth, title }) {
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);

    const getParts = async (d) => {
        const response = await axios.post(route('parts.list'), d);
        setDataList(response.data);
    }

    useEffect(() => {
        getParts();
    }, [deleteCounter]);

    const tableColumns = [
        {
            name: 'Nombre',
            selector: row => row['name'],
            sortable: true,
            center: false,
            maxWidth: "350px"
        },
        {
            name: 'Referencia',
            selector: row => row['reference'],
            sortable: true,
            center: false,
            maxWidth: "150px"
        },
        {
            name: 'Descripción',
            selector: row => row['description'],
            sortable: true,
            center: false
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <div className="text-right">
                        <Edit onClick={() => router.visit(route('parts.edit', row['id']))} id={'edit-' + row['id']} />
                        <Trash onClick={() => handleDelete(route('parts.destroy', row['id']))} id={'delete-' + row['id']} />
                    </div>
                )
            },
            sortable: false,
            center: true,
            maxWidth: "100px"
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />

                <FilterTable
                    dataList={dataList}
                    tableColumns={tableColumns}
                    filters={[]}
                    getList={(d) => getParts(d)}
                />

                <AddBtn onClick={() => router.visit(route('parts.create'))} />
            </Fragment>
        </AuthenticatedLayout>
    )
}