import React, { Fragment, useEffect, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import SimpleImage from '@/Template/CommonElements/SimpleImage';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col, Media } from 'reactstrap';
import { PlusSquare } from 'react-feather';
import AddAddress from "@/Template/Components/AddAddress";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';
import Address from "@/Template/Components/Address";
import Phone from "@/Template/CommonElements/Phone";
import Email from "@/Template/CommonElements/Email";
import { useSelector } from 'react-redux'

export default function ClientForm({ auth, title, isClient, client, statuses, origins, addresses, activities, users, families }) {
    const actualUser = useSelector((state) => state.auth.value);
    const [assignedName, setAssignedName] = useState('');

    const [products, setProducts] = useState([]);
    const [selectedOptionSt, setSelectedOptionSt] = useState(() => {
        let selected = null;
        statuses.forEach((item, index) => {
            if (item.value == client.status_id) selected = item;
        });
        return selected;
    });
    const [selectedOptionOr, setSelectedOptionOr] = useState(() => {
        let selected = null;
        origins.forEach((item, index) => {
            if (item.value == client.origin_id) selected = item;
        });
        return selected;
    });
    const [selectedOptionAct, setSelectedOptionAct] = useState(() => {
        let selected = null;
        activities.forEach((item, index) => {
            if (item.value == client.activity_id) selected = item;
        });
        return selected;
    });
    const [selectedOptionFm, setSelectedOptionFm] = useState(() => {
        let selected = null;
        families.forEach((item, index) => {
            if (item.value == client.family_id) {
                setProducts(item.products);
                selected = item;
            }
        });
        return selected;
    });
    const [selectedOptionPr, setSelectedOptionPr] = useState(() => {
        let selected = null;
        families.forEach((item, index) => {
            item.products.forEach((item2, index2) => {
                if (item2.value == client.product_id) selected = item2;
            });
        });
        return selected;
    });

    const [modalAddress, setModalAddress] = useState(false);
    const toggleAddress = () => setModalAddress(!modalAddress);
    const [modalTitle, setModalTitle] = useState('Agregar Dirección');
    const [address, setAddress] = useState([]);
    const [addressIndex, setAddressIndex] = useState(null);
    const [addressList, setAddressList] = useState(addresses);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id: client.id,
        external_id: client.external_id,
        company_name: client.company_name,
        logo: null,
        logo_url: client.logo_url,
        contact_name: client.contact_name,
        contact_lastname: client.contact_lastname,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        origin_id: client.origin_id,
        status_id: client.status_id,
        responsible: client.responsible,
        addresses: addresses,
        assigned_to: client.assigned_to,
        activity_id: client.activity_id,
        business_name: client.business_name,
        family_id: client.family_id,
        product_id: client.product_id
    });

    const [selectedOptionUs, setSelectedOptionUs] = useState(() => {
        let selected = null;
        users.forEach((item, index) => {
            if (item.value == client.assigned_to) {
                selected = item;
                setAssignedName(item.label);
            }
        });
        return selected;
    });

    useEffect(() => {
        if (actualUser.rol_id == 4) {
            setAssignedName(actualUser.name);
            setData(data => ({ ...data, ['assigned_to']: actualUser.id }));
        }
    }, []);

    const setSelected = (selected, evt) => {
        if (evt.name == 'origin_id') setSelectedOptionOr(selected);
        else if (evt.name == 'status_id') setSelectedOptionSt(selected);
        else if (evt.name == 'assigned_to') setSelectedOptionUs(selected);
        else if (evt.name == 'activity_id') setSelectedOptionAct(selected);
        else if (evt.name == 'family_id') {
            setSelectedOptionFm(selected);
            setProducts(selected.products);
            setSelectedOptionPr(null);
        } else if (evt.name == 'product_id') setSelectedOptionPr(selected);
        setData(data => ({ ...data, [evt.name]: selected ? selected.value : null }))
    }

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const handleChangeInput = (e) => {
        const key = e.target.name;
        const file = e.target.files[0];
        setData(data => ({ ...data, [key]: file }));
    }

    const addAddress = (address) => {
        let newList = [...addressList];
        if (addressIndex === null) {
            newList = [...addressList, address];
            setAddressList(newList);
        } else {
            newList[addressIndex] = address;
            setAddressList(newList);
        }
        setData(data => ({ ...data, addresses: newList }));
    }

    const saveForm = async () => {
        post(route(isClient ? 'clients.store' : 'contacts.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />
                <Form className='theme-form2'>
                    <Row>
                        <Col xs='12' sm='12' md='8'>
                            <Card>
                                <CardBody>
                                    <Row>
                                        <Col xs='12' sm='6' md='6' lg='6'>
                                            <FloatingInput
                                                label={{ label: 'Referencia' }}
                                                input={{ placeholder: 'Referencia', name: 'external_id', value: data.external_id, onChange: handleChange, type: 'text' }}
                                                errors={errors.external_id}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='6'>
                                            <FloatingInput
                                                label={{ label: 'Nombre Empresa' }}
                                                input={{ placeholder: 'Nombre Empresa', name: 'company_name', value: data.company_name, onChange: handleChange, type: 'text' }}
                                                errors={errors.company_name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='6'>
                                            <FloatingInput
                                                label={{ label: 'Nombre Comercial' }}
                                                input={{ placeholder: 'Nombre Comercial', name: 'business_name', value: data.business_name, onChange: handleChange, type: 'text' }}
                                                errors={errors.business_name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='3'>
                                            {actualUser.rol_id != 4 ?
                                                <Select
                                                    label={{ label: 'Asignado A' }}
                                                    input={{
                                                        placeholder: 'Asignado A',
                                                        onChange: setSelected,
                                                        name: 'assigned_to',
                                                        options: users,
                                                        defaultValue: selectedOptionUs
                                                    }}
                                                    errors={errors.assigned_to}
                                                    zIndex={2000}
                                                />
                                                :
                                                <FloatingInput
                                                    label={{ label: 'Asignado A' }}
                                                    input={{ placeholder: 'Asignado A', name: 'assigned_to', value: assignedName, readOnly: true, className: 'input-disabled' }}
                                                />
                                            }
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='3'>
                                            <Select
                                                label={{ label: 'Actividad' }}
                                                input={{
                                                    placeholder: 'Actividad',
                                                    onChange: setSelected,
                                                    name: 'activity_id',
                                                    options: activities,
                                                    defaultValue: selectedOptionAct
                                                }}
                                                errors={errors.activity_id}
                                                zIndex={2000}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='6'>
                                            <FloatingInput
                                                label={{ label: 'Nombre Contacto' }}
                                                input={{ placeholder: 'Nombre Contacto', name: 'contact_name', value: data.contact_name, onChange: handleChange, type: 'text' }}
                                                errors={errors.contact_name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='6'>
                                            <FloatingInput
                                                label={{ label: 'Apellido Contacto' }}
                                                input={{ placeholder: 'Apellido Contacto', name: 'contact_lastname', value: data.contact_lastname, onChange: handleChange, type: 'text' }}
                                                errors={errors.contact_lastname}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='6'>
                                            <FloatingInput
                                                label={{ label: 'Email' }}
                                                input={{ placeholder: 'Email', name: 'email', value: data.email, onChange: handleChange, type: 'email' }}
                                                errors={errors.email}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='6'>
                                            <FloatingInput
                                                label={{ label: 'Teléfono' }}
                                                input={{ placeholder: 'Teléfono', name: 'phone', value: data.phone, onChange: handleChange, type: 'text' }}
                                                errors={errors.phone}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='6'>
                                            <FloatingInput
                                                label={{ label: 'Responsable' }}
                                                input={{ placeholder: 'Responsable', name: 'responsible', value: data.responsible, onChange: handleChange, type: 'text' }}
                                                errors={errors.responsible}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='3'>
                                            <Select
                                                label={{ label: 'Origen' }}
                                                input={{
                                                    placeholder: 'Origen',
                                                    onChange: setSelected,
                                                    name: 'origin_id',
                                                    options: origins,
                                                    defaultValue: selectedOptionOr
                                                }}
                                                errors={errors.rol_id}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='6' lg='3'>
                                            <Select
                                                label={{ label: 'Estado' }}
                                                input={{
                                                    placeholder: 'Estado',
                                                    onChange: setSelected,
                                                    name: 'status_id',
                                                    options: statuses,
                                                    defaultValue: selectedOptionSt
                                                }}
                                                errors={errors.status_id}
                                            />
                                        </Col>
                                    </Row>
                                    <Media className="mt-4 mb-2">
                                        <Media body>
                                            <h4>Direcciones</h4>
                                        </Media>
                                        <Media right>
                                            <div className='btn-sm btn btn-success d-inline-flex'
                                                onClick={() => {
                                                    toggleAddress();
                                                    setAddress([]);
                                                    setModalTitle('Agregar Dirección');
                                                    setAddressIndex(null);
                                                }}>
                                                Agregar
                                            </div>
                                        </Media>
                                    </Media>
                                    {addressList.map((item, index) => {
                                        return (
                                            <Media className="mt-2">
                                                <Media body>
                                                    <div>
                                                        <b>{item.name} </b>
                                                        ({item.contact_name} -
                                                        <Phone phone={item.contact_phone} />
                                                        )
                                                    </div>
                                                    <div>{item.full_address}</div>
                                                </Media>
                                                <Media right>
                                                    <Edit
                                                        onClick={() => {
                                                            toggleAddress();
                                                            setModalTitle('Editar Dirección');
                                                            setAddress(item);
                                                            setAddressIndex(index);
                                                        }}
                                                        id={'edit' + index} />
                                                    <Trash onClick={() => setAddressList(addressList.filter((address, i) => i !== index))} id={'delete' + index} />
                                                </Media>
                                            </Media>
                                        )
                                    })}

                                    <AddAddress
                                        title={modalTitle}
                                        isOpen={modalAddress}
                                        closeModal={toggleAddress}
                                        address={address}
                                        setAddress={addAddress}
                                    />

                                    <Row>

                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col xs='12' sm='12' md='4'>
                            <Card>
                                <CardBody>
                                    <Row>
                                        <Col xs='12'>
                                            <SimpleImage
                                                label={{ label: 'Logo' }}
                                                input={{ onChange: handleChangeInput, name: 'logo', accept: "image/*" }}
                                                image={data.logo_url}
                                                errors={errors.logo}
                                            />
                                        </Col>
                                        <Col xs='12'>
                                            <FloatingInput
                                                label={{ label: 'Notas' }}
                                                input={{ placeholder: 'Notas', name: 'notes', value: data.notes, onChange: handleChange, as: 'textarea' }}
                                                errors={errors.notes}
                                            />
                                        </Col>

                                        <Col xs='12' className="mt-4"><h6>Interesado En</h6></Col>
                                        <Col xs='12'>
                                            <Select
                                                label={{ label: 'Familia' }}
                                                input={{
                                                    placeholder: 'Familia',
                                                    onChange: setSelected,
                                                    name: 'family_id',
                                                    options: families,
                                                    defaultValue: selectedOptionFm
                                                }}
                                                errors={errors.family_id}
                                                zIndex={1100}
                                            />
                                        </Col>
                                        <Col xs='12'>
                                            <Select
                                                label={{ label: 'Producto' }}
                                                input={{
                                                    placeholder: 'Producto',
                                                    onChange: setSelected,
                                                    name: 'product_id',
                                                    options: products,
                                                    defaultValue: selectedOptionPr,
                                                    isClearable: true
                                                }}
                                                errors={errors.product_id}
                                                zIndex={1090}
                                            />
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Card>
                        <CardFooter className="text-end">
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled: processing }}>Guardar</Btn>
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route(isClient ? 'clients' : 'contacts')) }} >Volver</Btn>
                        </CardFooter>
                    </Card>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}