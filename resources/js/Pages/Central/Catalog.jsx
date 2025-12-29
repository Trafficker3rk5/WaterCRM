import React, { Fragment, useState, useEffect, useContext } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Form, Badge } from 'reactstrap';
import { Breadcrumbs, Btn } from "./../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import DataTable from 'react-data-table-component';
import axios from "axios";
import { customStyles } from "@/Template/Styles/DataTable";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import MainDataContext from '@/Template/_helper/MainData';
import Select from '@/Template/CommonElements/Select';
import Icon from "@/Template/CommonElements/Icon";
import FilterTable from "@/Template/Components/FilterTable";

export default function Catalog({ auth, title, type, related }) {
    const [modal, setModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Agregar ' + title);
    const toggle = () => setModal(!modal);
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);
    const [selectedOption, setSelectedOption] = useState(null);
    const [orderInited, setOrderInited] = useState(false);
    
    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        type: type,
        name: '',
        name_en: '',
        description: '',
        id : 0,
        extra_1 : []
    });    

    const getCatalog = async (d) => {
        const response = await axios.post(route('catalog.list', type), d);
        setDataList(response.data);
        if (!orderInited) initOrder();
    }

    const initOrder = () => {
        setOrderInited(true);

        dragula([document.getElementById('sortable-table')]).on('drop', function (el, x) {
            let ids = [];
            document.querySelectorAll('#sortable-table tr').forEach((el) => {
                ids.push(el.dataset.id);
            });
            axios.post(route('catalog.updateOrder', type), { ids: ids });
        });
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
        },
        {
            name: 'Descripción',
            selector: row => row['description'],
            sortable: true,
            center: false,
        },
        {
            name: type == 2 ? 'Productos' : 'Caracteristicas',
            selector: (row) => {
                console.log(row);
                return (
                    <>
                    {
                        row['extra_array'].map((item, index) => {
                            return (
                                <Badge color="primary mb-1">{item.name}</Badge>
                            )
                        })
                    }
                    </>
                )
            },
            wrap : true,
            sortable: false,
            center: false,
            omit : (type == 2 || type == 4) ? false : true
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <Edit onClick={() => handleEdit(row['id'])} id={'edit-' + row['id']}/>
                        <Trash onClick={() => handleDelete(route('catalog.destroy', row['id']))} id={'delete-' + row['id']}/>
                    </>
                )
            },
            sortable: false,
            center: true,
        },
    ];

    const handleEdit = async (id) => {
        const response = await axios.get(route('catalog.get', [type, id]));
        if (response.data){
            reset();
            clearErrors();
            toggle();
            setModalTitle('Editar ' + title);
            setData({
                id: response.data.id,
                name: response.data.name,
                description: response.data.description ?? '',
                name_en: response.data.name_en ?? '',
            });

            let extras = response.data.extra_1.split(',');
            let ausxSelected = [];
            for (let i = 0; i < extras.length; i++) {
                let obj = related.find(o => o.value == extras[i]);
                ausxSelected.push(obj);
            }
            setSelected(ausxSelected);
        }
    };

    const handleAdd = () => {
        reset();
        clearErrors();
        setModalTitle('Agregar ' + title);
        toggle();
        setSelected(null);
    };

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({
            ...data,
            [key]: value,
        }))
    }

    const setSelected = (selected) => {
        setSelectedOption(selected);
        let sss = [];
        for (let i = 0; i < selected.length; i++) sss.push(selected[i].value);
        setData(data => ({
            ...data,
            ['extra_1']: sss,
        }))
    }

    const saveForm = async () => {
        post(
            route('catalog.store', type),
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
                {type != 3 ?

                <FilterTable
                    dataList={dataList}
                    tableColumns={tableColumns}
                    filters={[]}
                    getList={(d) => getCatalog(d)}
                />
                :
                <div className="shadow-sm">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="sortable-table">
                            {dataList.map((item, index) => {
                                return (
                                    <tr key={index} data-id={item.id}>
                                        <td><Icon icon="Menu" id={'move' + item.id} className="text-black"/></td>
                                        <td>{item.name}</td>
                                        <td>{item.description}</td>
                                        <td>
                                            <Edit onClick={() => handleEdit(item.id)} id={'edit-' + item.id}/>
                                            <Trash onClick={() => handleDelete(route('catalog.destroy', item.id))} id={'delete-' + item.id}/>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                }   

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

                            {type == 1 || type == 3 || type == 5 ?
                            <FloatingInput 
                                label={{label : 'Nombre Inglés'}} 
                                input={{ 
                                    placeholder : 'Nombre Inglés', 
                                    onChange : handleChange,
                                    name : 'name_en',
                                    value : data.name_en
                                }}
                                errors = {errors.name_en}
                            />
                            :
                            null
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

                            { type == 2 || type == 4 ?
                            <Select
                                label={{label : type == 2 ? 'Productos' : 'Caracteristicas', 'className' : 'mt-5'}} 
                                input={{ 
                                    placeholder : '', 
                                    onChange : setSelected,
                                    name : 'extra_1',
                                    options : related,
                                    isMulti : true,
                                    closeMenuOnSelect : false,
                                    defaultValue : selectedOption
                                }}
                                errors = {errors.extra_1}
                            />
                            :
                            null
                            }
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