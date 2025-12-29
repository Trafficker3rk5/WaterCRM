import React, { Fragment, useState, useEffect, useContext } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from "axios";
import Edit from '@/Template/CommonElements/Edit';
import { Check, X }  from 'react-feather';
import { Image } from "react-bootstrap";
import Icon from '@/Template/CommonElements/Icon';
import FilterTable from "@/Template/Components/FilterTable";

export default function ProductList({ auth, title, filters}) {
    const [dataList, setDataList] = useState([]);
    const [extraCatalogData, setExtraCatalogData] = useState([]);

    const getProducts = async (d) => {
        let extraData = [];
        if (d) {
            for (const [key, value] of Object.entries(d)) extraData.push(key + '=' + value);
            setExtraCatalogData(extraData);
        }

        const response = await axios.post(route('prs.list'), d);
        setDataList(response.data);
    }

    const enableDisable = async (id) => {
        const response = await axios.post(route('prs.change.status', id));
        getProducts();
    }

    useEffect(() => {
        getProducts();
    }, []);

    const tableColumns = [
        {
            name: '',
            selector: row => {
                return (
                    <Image height={50} src={row['main_image']} rounded/>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "100px"
        },
        {
            name: 'Referencia',
            selector: row => {
                return (
                    <>
                        {row['inner_active'] ? <Check color="green" size={15} /> : <X color="red" size={15} />}
                        <span className="ms-1" style={{position: 'relative', top: '-4px'}}>{row['final_model']}</span>
                    </>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "140px"
        },
        {
            name: 'Nombre',
            selector: row => row['final_name'],
            sortable: true,
            center: false,
            maxWidth: "300px"
        },
        {
            name: 'Familia',
            selector: row => row['family_name'],
            sortable: true,
            center: false,
            maxWidth: "150px"
        },
        {
            name: 'Descripción',
            selector: row => row['description'],
            sortable: true,
            center: false,
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <a href={route('prs.pdf', row['id'])} target="_blank">
                            <Icon icon="File" id={'ficha' + row['id']} tooltip="Ficha Técnica"/>
                        </a>
                        {row['inner_active'] != 1 ? 
                            <Icon icon="Check" id={'activate-' + row['id']} tooltip="Activar" onClick={() => enableDisable(row['id'])} className="text-success"/> :
                            <Icon icon="X" id={'de-' + row['id']} tooltip="Desactivar" onClick={() => enableDisable(row['id'])} className="text-danger"/>
                        }
                        <Edit onClick={() => router.visit(route('prs.edit', row['id']))} id={'edit-' + row['id']}/>
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
                    <a href={route('prs.pdf', 0) + '?' + extraCatalogData.join('&')} target="_blank" className="me-1">
                        <Btn attrBtn={{ color: 'primary', className : 'btn-sm'}}>Descargar Catalogo</Btn>
                    </a>
                </div>

                <FilterTable
                    dataList={dataList}
                    tableColumns={tableColumns}
                    filters={filters}
                    getList={(d) => getProducts(d)}
                />
            </Fragment>
        </AuthenticatedLayout>
    )
}