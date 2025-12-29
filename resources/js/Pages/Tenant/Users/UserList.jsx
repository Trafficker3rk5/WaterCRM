import React, { Fragment, useState, useEffect, useContext } from "react";
import { Breadcrumbs, ToolTip } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from "axios";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import MainDataContext from '@/Template/_helper/MainData';
import { Image } from "react-bootstrap";
import FilterTable from "@/Template/Components/FilterTable";

export default function UserList({ auth, title}) {
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);

    const getUsers = async (d) => {
        const response = await axios.post(route('users.list'), d);
        setDataList(response.data);
    }

    useEffect(() => {
        getUsers();
    }, [deleteCounter]);

    const tableColumns = [
        {
            name: 'Avatar',
            selector: row => {
                return (
                    <Image height={50} src={row['avatar']} rounded/>
                )
            },
            sortable: true,
            center: false,
        },
        {
            name: 'Nombre Completo',
            selector: row => row['full_name'],
            sortable: true,
            center: false,
        },
        {
            name: 'Rol',
            selector: row => row['rol'],
            sortable: true,
            center: false,
        },
        {
            name: 'Email',
            selector: row => row['email'],
            sortable: true,
            center: false,
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <Edit onClick={() => router.visit(route('users.edit', row['id']))} id={'edit-' + row['id']}/>
                        <Trash onClick={() => handleDelete(route('users.destroy', row['id']))} id={'delete-' + row['id']}/>
                    </>
                )
            },
            sortable: false,
            center: true,
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
                    getList={(d) => getUsers(d)}
                />

                <AddBtn onClick={() => router.visit(route('users.create'))} />
            </Fragment>
        </AuthenticatedLayout>
    )
}