import React, { Fragment, useState, useEffect, useContext } from "react";
import { Badge } from 'reactstrap';
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from "axios";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import TaskModal from '@/Template/Components/TaskModal';
import MainDataContext from '@/Template/_helper/MainData';
import Icon from "@/Template/CommonElements/Icon";
import NotesModal from "@/Template/Components/NotesModal";
import FilterTable from "@/Template/Components/FilterTable";

export default function Task({ auth, title, filters, filtered, back}) {
    const [action, setAction] = useState(-1); ///0: Add; 1: Edit; 2: View; -1: None
    const [taskId, setTaskId] = useState(0);
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);

    const [notesModal, setNotesModal] = useState(false);
    const toggleNotesModal = () => setNotesModal(!notesModal);  

    const getTasks = async (filters) => {
        const response = await axios.post(route('tasks.list', filters));
        setDataList(response.data);
    }

    useEffect(() => {
        getTasks(filtered);
    }, [deleteCounter]);

    const tableColumns = [
        {
            name: 'Fecha',
            selector: row => row['date'],
            sortable: true,
            center: false,
        },
        {
            name: 'Título',
            selector: row => row['title'],
            sortable: true,
            center: false,
        },
        {
            name: 'Descripción',
            selector: row => row['description'],
            sortable: true,
            center: false,
        },
        {
            name: 'Client',
            selector: row => row['client_full_name'],
            sortable: true,
            center: false,
        },
        {
            name: 'Estado',
            selector: row => {
                return (
                    <>
                        {row['status'] == 0 && <Badge color="primary">Pendiente</Badge>}
                        {row['status'] == 1 && <Badge color="success">Completada</Badge>}
                        {row['status'] == 2 && <Badge color="danger">Cancelada</Badge>}
                    </>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "120px"
        },
        {
            name: 'Tipo',
            selector: row => {
                return (
                    <>
                        {row['type'] &&  <span className={`badge`} style={{ backgroundColor : row['type'].extra_1 }}>{row['type'].name}</span>}
                    </>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "100px"
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <Icon icon="MessageSquare" id={'msg-' + row['id']} tooltip="Comentarios" onClick={() => {toggleNotesModal(); setTaskId(row['id'])}} className="me-1"/>
                        <Icon icon="Eye" id={'Eye-' + row['id']} tooltip="Ver" onClick={() => handleEdit(row['id'], true)} className="me-1"/>
                        <Edit onClick={() => handleEdit(row['id'], false)} id={'edit-' + row['id']}/>
                        <Trash onClick={() => handleDelete(route('tasks.destroy', row['id']))} id={'delete-' + row['id']}/>
                    </>
                )
            },
            sortable: false,
            center: true,
            maxWidth: "130px"
        },
    ];

    const handleEdit = async (id, show) => {
        setTaskId(id);
        setAction(show ? 2 : 1);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />

                <FilterTable
                    dataList={dataList}
                    tableColumns={tableColumns}
                    filters={filters}
                    getList={(d) => getTasks(d)}
                /> 
                {back &&
                <Btn attrBtn={{ color: 'secondary cancel-btn ms-1 mt-4', onClick: () => router.visit(route(back)) }} >Volver</Btn>
                }

                <AddBtn onClick={() => setAction(0)} />

                <TaskModal
                    action={action}
                    taskId={taskId}
                    getTasks={getTasks}
                    onClose={() => setAction(-1)}
                    showNotes={toggleNotesModal}
                />

                <NotesModal
                    type="2"
                    id={taskId}
                    modal={notesModal}
                    onClose={toggleNotesModal}
                />
            </Fragment>
        </AuthenticatedLayout>
    )
}