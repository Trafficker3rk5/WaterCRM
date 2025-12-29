import React, { Fragment, useState, useEffect, useContext } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Form, Badge } from 'reactstrap';
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from "axios";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import MainDataContext from '@/Template/_helper/MainData';
import Switch from "@/Template/CommonElements/Switch";
import FilterTable from "@/Template/Components/FilterTable";

export default function Catalog({ auth, title, type, related }) {
    const [modal, setModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Agregar ' + title);
    const toggle = () => setModal(!modal);
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);
    
    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        type: type,
        name: '',
        description: '',
        id : 0,
        extra_1 : false
    }); 

    const handleChangeSwitch = (key) => {
        setData(key, !data[key]);
    }

    const getCatalog = async (d) => {
        const response = await axios.post(route('catalogs.list', type), d);
        setDataList(response.data);
    }

    useEffect(() => {
        getCatalog();
    }, [deleteCounter]);
    
    const tableColumns = [
        {
            name: 'Nombre',
            selector: row => row['name'],
            sortable: true,
            center: false,
            maxWidth: "300px"
        },
        {
            name: 'Descripción',
            selector: row => row['description'],
            sortable: true,
            center: false,
        },
        {
            name: 'Finaliza',
            selector: row => {
                return (
                    <Badge color={row['extra_1'] == 1 ? 'success' : 'danger'}>{row['extra_1'] == 1 ? 'Si' : 'No'}</Badge>
                )
            },
            sortable: true,
            center: false,
            omit : !(type == 2 || type == 3)
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <Edit onClick={() => handleEdit(row['id'])} id={'edit-' + row['id']}/>
                        <Trash onClick={() => handleDelete(route('catalogs.destroy', row['id']))} id={'delete-' + row['id']}/>
                    </>
                )
            },
            sortable: false,
            center: true,
            maxWidth: "100px"
        },
    ];

    const handleEdit = async (id) => {
        const response = await axios.get(route('catalogs.get', [type, id]));
        if (response.data){
            reset();
            clearErrors();
            toggle();
            setModalTitle('Editar ' + title);
            setData({
                id: response.data.id,
                name: response.data.name,
                description: response.data.description ?? '',
                extra_1: (type == 6) ? response.data.extra_1 : (response.data.extra_1 == 1 ? true : false)
            });
        }
    };

    const handleAdd = () => {
        reset();
        clearErrors();
        setModalTitle('Agregar ' + title);
        toggle();
    };

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({
            ...data,
            [key]: value,
        }))
    }

    const saveForm = async () => {
        post(
            route('catalogs.store', type),
            {
                onSuccess: (y) => {
                    getCatalog();
                    toggle();
                },
                onError: (errors) => {
                    console.log(errors);
                }
            }
        );
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
                    getList={(d) => getCatalog(d)}
                />

                <AddBtn onClick={() => handleAdd()} />

                <Modal isOpen={modal} toggle={toggle} id="addCatalogModal" className="mainModal" centered>
                    <ModalHeader toggle={toggle}>{modalTitle}</ModalHeader>
                    <ModalBody>
                        <Form className='theme-form'>
                            <FloatingInput 
                                label={{label : 'Nombre'}} 
                                input={{ 
                                    placeholder : 'Nombre', 
                                    onChange : handleChange,
                                    name : 'name',
                                    value : data.name
                                }}
                                errors = {errors.name}
                            />
                            
                            {(type == 2 || type == 3) &&
                            <Switch 
                                label={'Finaliza'} 
                                input={{onChange : () => handleChangeSwitch('extra_1'), name : 'finished', checked : data.extra_1}} 
                                errors = {errors.extra_1}
                            />
                            }

                            {
                            type == 6 &&
                            <FloatingInput 
                                label={{label : 'Color'}} 
                                input={{ 
                                    placeholder : 'Color', 
                                    onChange : handleChange,
                                    name : 'extra_1',
                                    value : data.extra_1,
                                    type : 'color'
                                }}
                                errors = {errors.extra_1}
                            />
                            }
                            
                            <FloatingInput 
                                label={{label : 'Descripción'}} 
                                input={{ 
                                    placeholder : 'Descripción', 
                                    onChange : handleChange,
                                    name : 'description',
                                    value : data.description,
                                    as : 'textarea',
                                }}
                                errors = {errors.description}
                            />
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggle }} >Cerrar</Btn>
                        <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
                    </ModalFooter>
                </Modal>
            </Fragment>
        </AuthenticatedLayout>
    )
}