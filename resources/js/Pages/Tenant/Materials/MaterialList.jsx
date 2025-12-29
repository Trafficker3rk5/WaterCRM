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
import { Check, X }  from 'react-feather';
import Icon from '@/Template/CommonElements/Icon';
import FilterTable from "@/Template/Components/FilterTable";

export default function MaterialList({ auth, title}) {
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);
    const [tooltip, setTooltip] = useState(false);
    const toggle = () => setTooltip(!tooltip);

    const getMaterials = async (d) => {
        const response = await axios.post(route('materials.list'), d);
        setDataList(response.data);
    }

    const enableDisableMaterial = async (id) => {
        const response = await axios.post(route('materials.change.status', id));
        getMaterials();
    }

    useEffect(() => {
        getMaterials();
    }, [deleteCounter]);

    const tableColumns = [
        {
            name: 'Imagen',
            selector: row => {
                return (
                    <Image height={50} src={row['image_url']} rounded/>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "100px"
        },
        {
            name: 'Activo',
            selector: row => {
                return (
                    row['active'] == 1 ? <Check color="green" size={15} /> : <X color="red" size={15} />
                )
            },
            sortable: true,
            center: true,
            maxWidth: "100px"
        },
        {
            name: 'Nombre',
            selector: row => row['name'],
            sortable: true,
            center: false,
        },
        {
            name: 'Referencia',
            selector: row => row['reference'],
            sortable: true,
            center: false,
            maxWidth: "150px"
        },
        {
            name: 'Stock',
            selector: row => row['stock'],
            sortable: true,
            center: false,
            maxWidth: "100px"
        },
        {
            name: 'Precio',
            selector: row => row['price'],
            sortable: true,
            center: false,
            maxWidth: "100px"
        },
        {
            name: 'Acciones',
            selector: (row) => {
                console.log(row)  ;
                return (
                    <>
                        
                        {row['active'] != 1 ? 
                            <Icon icon="Check" id={'activate-' + row['id']} tooltip="Activar" onClick={() => enableDisableMaterial(row['id'])} className="text-success"/> :
                            <Icon icon="X" id={'de-' + row['id']} tooltip="Desactivar" onClick={() => enableDisableMaterial(row['id'])} className="text-danger"/>
                        }
                        <Edit onClick={() => router.visit(route('materials.edit', row['id']))} id={'edit-' + row['id']}/>
                        <Trash onClick={() => handleDelete(route('materials.destroy', row['id']))} id={'delete-' + row['id']}/>
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

                <FilterTable
                    dataList={dataList}
                    tableColumns={tableColumns}
                    filters={[]}
                    getList={(d) => getMaterials(d)}
                />

                <AddBtn onClick={() => router.visit(route('materials.create'))} />
            </Fragment>
        </AuthenticatedLayout>
    )
}