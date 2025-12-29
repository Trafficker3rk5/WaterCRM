import React, { Fragment, useState, useEffect, useContext } from "react";
import { Breadcrumbs, Btn, ToolTip } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import DataTable from 'react-data-table-component';
import axios from "axios";
import { customStyles } from "@/Template/Styles/DataTable";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import AddBtn from '@/Template/CommonElements/AddBtn';
import MainDataContext from '@/Template/_helper/MainData';
import { FileText, User, X, Check }  from 'react-feather';
import { Modal, ModalBody, ModalFooter, ModalHeader, Form, Badge, Row, Col } from "reactstrap";
import FloatingInput from "@/Template/CommonElements/FloatingInput";
import Select from '@/Template/CommonElements/Select';
import AddAddress from "@/Template/Components/AddAddress";
import Icon from "@/Template/CommonElements/Icon";
import FilterTable from "@/Template/Components/FilterTable";

export default function BudgetList({ auth, title, cid, st}) {
    const [dataList, setDataList] = useState([]);
    const [detailList, setDetailList] = useState([]);
    const [addressList, setAddressList] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);

    const [selectedOptionDet, setSelectedOptionDet] = useState(null);
    const [selectedOptionAddr, setSelectedOptionAddr] = useState(null);

    const [modal, setModal] = useState(false);
    const toggleModal = () => setModal(!modal);
    const [modalAccept, setModalAccept] = useState(false);
    const toggleModalAccept = () => setModalAccept(!modalAccept);
    const [modalAddress, setModalAddress] = useState(false);
    const toggleAddress = () => setModalAddress(!modalAddress);


    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : 0,
        reason : '',
        detail_id : '',
        addresses : [],
    }); 

    const handleChange = (e) => {
        setData(data => ({...data, [e.target.name]: e.target.value}));
    }

    const getBudgets = async (d) => {
        const response = await axios.post(route('budgets.list', cid) + '?st=' + st, d); 
        setDataList(response.data);
    }

    const rejectBudget = async (id) => {
        setData(data => ({...data, ['id']: id, ['reason']: ''}));
        toggleModal();
    }

    const acceptBudget = (id) => {
        setData(data => ({...data, ['id']: id}));
        getBudgetData(id);
    }

    const getBudgetData = async (id) => {
        const response = await axios.get(route('budgets.get', [cid, id]));
        if (response.data){
            setDetailList(response.data.details);
            setProductsList(response.data.products);
            setAddressList(response.data.addresses);
            setSelectedOptionAddr(response.data.addresses[0] ?? null);
            toggleModalAccept();

            response.data.products.forEach((product, index) => {
                setData(data => ({...data, ['address-' + product.id + '-' + index]: response.data.addresses[0].value}));
            })
        }
    }

    const addAddress = async (address) => {
        address['client_id'] = cid;
        const response = await axios.post(route('address.store'), address);
        if (response.data){
            let addresses = addressList
            addresses.push({value: response.data.id, label: response.data.full_address});
            setAddressList(addresses);
            toggleAddress();
        }
        
    }

    const saveForm = async () => {
        post(
            route('budgets.reject', data.id),
            {
                onSuccess: (y) => {
                    getBudgets();
                    toggleModal();
                },
                onError: (errors) => {
                    console.log(errors);
                }
            }
        );
    };

    const saveFormAccept = async () => {
        post(
            route('budgets.accept', data.id),
            {
                onSuccess: (y) => {
                    getBudgets();
                    toggleModalAccept();
                },
                onError: (errors) => {
                    console.log(errors);
                }
            }
        );
    };

    const setSelected = (selected, evt) => {
        setSelectedOptionDet(selected);
        setData(data => ({...data, [evt.name]: selected.value}))
    }

    const setSelectedAddr = (selected, evt) => {
        setSelectedOptionAddr(selected);
        setData(data => ({...data, [evt.name]: selected.value}))
    }

    useEffect(() => {
        getBudgets();
    }, [deleteCounter]);

    const tableColumns = [
        {
            name: 'Productos',
            selector: row => row['products_txt'],
            sortable: true,
            center: false,
        },
        {
            name: 'Estado',
            selector: row => {
                return (
                    <>
                    <Badge color={ row['status'] == 2 ? 'danger' : (row['status'] == 1 ? 'success' : 'info') }>{row['status_name']}</Badge>
                    {row['status'] == 2 && <small className="mt-1 d-block">Motivo: {row['rejection_reason']}</small>}
                    </>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "140px"
        },
        {
            name: 'Acciones',
            selector: (row) => {
                return (
                    <>
                        <a href={route('budgets.pdf', row['id'])} target="_blank">
                            <Icon icon="File" id={'ficha' + row['id']} tooltip="Descargar"/>
                        </a>
                        {row['status'] == 0 &&
                        <>
                            <Check color="green" size={20} id={'acecept-' + row['id']} onClick={() => acceptBudget(row['id'])}/>
                            <X color="red" size={20} id={'reject-' + row['id']} onClick={() => rejectBudget(row['id'])}/>
                        </>
                        }
                        {row['status'] == 1 &&
                        <a href={route('contracts.show.budget', [cid, row['id']])} title="Firmar Contrato">
                            <Icon icon="Edit" id={'contract-' + row['id']} tooltip="Firmar Contrato"/>
                        </a>
                        }
                        {row['is_horeca'] == 0 &&
                        <Edit onClick={() => router.visit(route('budgets.edit', [cid, row['id']]))} id={'edit-' + row['id']}/>
                        }
                        <Trash onClick={() => handleDelete(route('budgets.destroy', row['id']))} id={'delete-' + row['id']}/>
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
                    getList={(d) => getBudgets(d)}
                /> 

                <Btn attrBtn={{ color: 'secondary cancel-btn ms-1 mt-4', onClick: () => router.visit(route('clients')) }} >Volver</Btn>

                <AddBtn onClick={() => router.visit(route('budgets.create', cid))} />

                <Modal isOpen={modal} toggle={toggleModal} className="mainModal" centered>
                    <ModalHeader toggle={toggleModal}>Rechazar Propuesta</ModalHeader>
                    <ModalBody>
                        <Form className='theme-form'>
                            <FloatingInput 
                                label={{label : 'Motivo'}} 
                                input={{ 
                                    placeholder : 'Motivo', 
                                    onChange : handleChange,
                                    name : 'reason',
                                    value : data.reason,
                                    as : 'textarea',
                                }}
                                errors = {errors.reason}
                            />
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggleModal }} >Cerrar</Btn>
                        <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={modalAccept} toggle={toggleModalAccept} className="mainModal" size="lg" centered>
                    <ModalHeader toggle={toggleModalAccept}>Aceptar Presupuesto</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md="8">
                                <Select 
                                    label={{label : 'Detalles'}} 
                                    input={{ 
                                        placeholder : 'Detalles', 
                                        onChange : setSelected,
                                        name : 'detail_id',
                                        options : detailList,
                                        defaultValue : selectedOptionDet,
                                    }}
                                    errors = {errors.detail_id}
                                    zIndex={2000}
                                />
                            </Col>
                            <Col md="4">
                                <Btn attrBtn={{ color: 'primary save-btn btn-sm px-2 mt-4', onClick: toggleAddress}}>Nueva Dirección</Btn>
                            </Col>
                        </Row>
                        {productsList.map((product, index) => {
                            return (
                                <Row key={index}>
                                    <Col md="3" className="mt-4">
                                        <b>{product.final_name}</b>
                                    </Col>
                                    <Col md="5">
                                        <Select 
                                            label={{label : 'Dirección de Instalación'}} 
                                            input={{ 
                                                placeholder : 'Dirección', 
                                                onChange : setSelectedAddr,
                                                name : 'address-' + product.id + '-' + index,
                                                options : addressList,
                                                defaultValue : selectedOptionAddr,
                                            }}
                                            errors = {errors.product_id}
                                            zIndex={2000 - index - 1}
                                        />
                                    </Col>
                                    <Col md="4">
                                        <FloatingInput 
                                            label={{label : 'Notas'}} 
                                            input={{ 
                                                placeholder : 'Notas', 
                                                name : 'notes-' + product.id + '-' + index,
                                                value : data['notes-' + product.id + '-' + index],
                                                onChange : handleChange
                                            }}
                                            errors = {errors.notes}
                                        />
                                    </Col>
                                </Row>
                            )
                        })}
                    </ModalBody>
                    <ModalFooter>
                        <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggleModalAccept }} >Cerrar</Btn>
                        <Btn attrBtn={{ color: 'primary save-btn', onClick: saveFormAccept, disabled : processing}}>Guardar</Btn>
                    </ModalFooter>
                </Modal>

                <AddAddress 
                    title={'Agregar Dirección'}
                    isOpen={modalAddress}
                    closeModal={toggleAddress}
                    address={[]}
                    setAddress={addAddress}
                />
            </Fragment>
        </AuthenticatedLayout>
    )
}