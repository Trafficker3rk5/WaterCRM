import React, { Fragment, useState, useEffect, useContext } from "react";
import { Breadcrumbs, ToolTip } from "../../../Template/AbstractElements";
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
import { Badge } from 'reactstrap';
import { Image } from "react-bootstrap";
import FilterTable from "@/Template/Components/FilterTable";

export default function CompanyList({ auth, title}) {
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);
    const [tooltip, setTooltip] = useState(false);
    const toggle = () => setTooltip(!tooltip);

    const getCompanies = async (d) => {
        const response = await axios.post(route('companies.list'), d);
        setDataList(response.data);
    }

    const enableDisableCompany = async (id) => {
        const response = await axios.post(route('companies.change.status', id));
        getCompanies();
    }

    useEffect(() => {
        getCompanies();
    }, [deleteCounter]);

    const tableColumns = [
        {
            name: 'Logo',
            selector: row => {
                return (
                    <Image height={50} src={row['logo_url']} rounded/>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "100px"
        },
        {
            name: 'Dominio',
            selector: row => {
                return (
                    <>
                        {row['status'] == 1 ? <Check color="green" size={15} /> : <X color="red" size={15} />}
                        <span style={{position: 'relative', top: '-2px'}}>{row['domain']}</span>
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
        },
        {
            name: 'Email',
            selector: row => row['email'],
            sortable: true,
            center: false,
        },
        {
            name: 'Productos',
            selector: row => {
                return (
                    <>
                        {row['products'] ? row['products'].map((item, index) => {
                            return <Badge key={index} color="primary">{item['name']}</Badge>
                        }) : null}
                    </>
                )
            },
            sortable: true,
            center: false,
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <Fragment>
                            {row['status'] !== 1 ? 
                                <Check color="green" size={20} id={'change-' + row['id']} onClick={() => enableDisableCompany(row['id'])}/> : 
                                <X color="red" size={20} id={'change-' + row['id']} onClick={() => enableDisableCompany(row['id'])}/>
                            }
                            <ToolTip attrToolTip={{ placement:'left', isOpen:tooltip, target: 'change-' + row['id'], toggle:toggle }}>
                                {row['status'] === 1 ? 'Desactivar' : 'Activar'}
                            </ToolTip>
                        </Fragment>
                        <Edit onClick={() => router.visit(route('companies.edit', row['id']))} id={'edit-' + row['id']}/>
                        <Trash onClick={() => handleDelete(route('companies.destroy', row['id']))} id={'delete-' + row['id']}/>
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
                    getList={(d) => getCompanies(d)}
                />
                
                <AddBtn onClick={() => router.visit(route('companies.create'))} />
            </Fragment>
        </AuthenticatedLayout>
    )
}