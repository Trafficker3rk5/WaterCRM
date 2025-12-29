import React, { Fragment, useState, useEffect, useContext } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import DataTable from 'react-data-table-component';
import axios from "axios";
import { customStyles } from "@/Template/Styles/DataTable";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import MainDataContext from '@/Template/_helper/MainData';
import { Check, X }  from 'react-feather';
import Icon from "@/Template/CommonElements/Icon";
import FilterTable from "@/Template/Components/FilterTable";

export default function ProductList({ auth, title}) {
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);  

    const getProducts = async (d) => {
        const response = await axios.post(route('products.list'), d);
        setDataList(response.data);
    }

    useEffect(() => {
        getProducts();
    }, [deleteCounter]);

    const tableColumns = [
        {
            name: 'Modelo',
            selector: row => {
                return (
                    <>
                        {row['active'] ? <Check color="green" size={15} /> : <X color="red" size={15} />}
                        <span className="ms-1" style={{position: 'relative', top: '-4px'}}>{row['model']}</span>
                    </>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "150px"
        },
        {
            name: 'Nombre',
            selector: row => row['name'],
            sortable: true,
            center: false,
            maxWidth: "200px"
        },
        {
            name: 'Familia',
            selector: row => row['family_name'],
            sortable: true,
            center: false,
            maxWidth: "200px"
        },
        {
            name: 'Descripción',
            selector: row => row['description'],
            sortable: true,
            center: true,
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <a href={route('products.central.pdf', row['id'])} target="_blank" className="me-1">
                            <Icon icon="File" id={'ficha' + row['id']} tooltip="Ficha Técnica"/>
                        </a>
                        <Edit onClick={() => router.visit(route('products.edit', row['id']))} id={'edit-' + row['id']}/>
                        <Trash onClick={() => handleDelete(route('products.destroy', row['id']))} id={'delete-' + row['id']}/>
                    </>
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

                <div className="d-flex flex-row-reverse mb-2">
                    <a href={route('products.central.pdf', 0)} target="_blank" className="me-1">
                        <Btn attrBtn={{ color: 'primary', className : 'btn-sm'}}>Descargar Catalogo</Btn>
                    </a>
                </div>

                <FilterTable
                    dataList={dataList}
                    tableColumns={tableColumns}
                    filters={[]}
                    getList={(d) => getProducts(d)}
                />

                <AddBtn onClick={() => router.visit(route('products.create'))} />
            </Fragment>
        </AuthenticatedLayout>
    )
}