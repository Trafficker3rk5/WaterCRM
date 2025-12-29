import React, { Fragment, useEffect, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import SimpleImage from '@/Template/CommonElements/SimpleImage';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col } from 'reactstrap';

export default function CompanyForm({ auth, title, company, products, statuses }) {
    const [selectedOption, setSelectedOption] = useState(() => {
        let selected = null;
        statuses.forEach((item, index) => {
            if (item.value == company.status) selected = item;
        });
        return selected;
    });
    const [selectedOptionProducts, setSelectedOptionProducts] = useState(() => {
        let selected = [];
        if (company.products) {
            let companyProducts = company.products.split(',')
            companyProducts.forEach((item, index) => {
                products.forEach((item2, index2) => {
                    if (item == item2.value) selected.push(item2);
                });
            });
        }
        return selected;
    });

    const usersData = [
        { id: 1, title: 'Administradores' },
        { id: 2, title: 'Directores Comercial' },
        { id: 3, title: 'Directores Tecnicos' },
        { id: 4, title: 'Comerciales' },
        { id: 5, title: 'Técnicos' },
        { id: 6, title: 'Telemarketing' }
    ];

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id: company.id,
        domain: company.domain,
        name: company.name,
        business_name: company.business_name,
        cif: company.cif,
        logo: company.logo,
        logoUrl: company.logo_url,
        users: [],
        email: company.email,
        password: '',
        address: company.address,
        fiscal_address: company.fiscal_address,
        price: company.price,
        products: [],
        status: company.status,
        payment_method: company.payment_method,
        bank_account: company.bank_account,
    });

    useEffect(() => {
        let products = company.products ? company.products.split(',') : [];
        setData(data => ({ ...data, ['products']: products }))

        ///set users
        let companyUsers = [];
        try {
            let decoded = JSON.parse(company.users) ?? [];
            decoded.forEach((item, index) => { companyUsers[index] = item; });
        } catch (error) { }
        setData(data => ({ ...data, ['users']: companyUsers }));
    }, []);

    const setSelected = (selected, evt) => {
        setSelectedOption(selected);
        setData(data => ({ ...data, [evt.name]: selected.value }))
    }

    const setSelectedMultiple = (selected) => {
        setSelectedOptionProducts(selected);
        let products = [];
        for (let i = 0; i < selected.length; i++) products.push(selected[i].value);
        setData(data => ({ ...data, ['products']: products }))
    }

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const handleChangeUser = (key, e) => {
        let users = data.users;
        users[key] = e.target.value;
        setData(data => ({ ...data, ['users']: users }))
    }

    const handleChangeInput = (e) => {
        const key = e.target.name;
        const file = e.target.files[0];
        setData(data => ({ ...data, [key]: file }));
    }

    const getUsers = (key) => {
        return data.users[key] ?? 0;
    }

    const saveForm = async () => {
        post(route('companies.store'));
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
                                        <Col xs='12' sm='6' md='6' lg='4'>
                                            <FloatingInput
                                                label={{ label: 'Dominio' }}
                                                input={{ placeholder: 'Dominio', onChange: handleChange, name: 'domain', value: data.domain }}
                                                errors={errors.domain}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput
                                                label={{ label: 'Nombre' }}
                                                input={{ placeholder: 'Nombre', onChange: handleChange, name: 'name', value: data.name }}
                                                errors={errors.name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput
                                                label={{ label: 'Razón Social' }}
                                                input={{ placeholder: 'Razón Social', onChange: handleChange, name: 'business_name', value: data.business_name }}
                                                errors={errors.business_name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput
                                                label={{ label: 'CIF' }}
                                                input={{ placeholder: 'CIF', onChange: handleChange, name: 'cif', value: data.cif }}
                                                errors={errors.cif}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput
                                                label={{ label: 'Precio' }}
                                                input={{ placeholder: 'Precio', onChange: handleChange, name: 'price', value: data.price, type: 'number' }}
                                                errors={errors.price}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <Select
                                                label={{ label: 'Estado' }}
                                                input={{
                                                    placeholder: 'Estado',
                                                    onChange: setSelected,
                                                    name: 'status',
                                                    options: statuses,
                                                    defaultValue: selectedOption
                                                }}
                                                errors={errors.status}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput
                                                label={{ label: 'Forma de Pago' }}
                                                input={{ placeholder: 'Forma de Pago', onChange: handleChange, name: 'payment_method', value: data.payment_method }}
                                                errors={errors.payment_method}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput
                                                label={{ label: 'N. de Cuenta' }}
                                                input={{ placeholder: 'N. de Cuenta', onChange: handleChange, name: 'bank_account', value: data.bank_account }}
                                                errors={errors.address}
                                            />
                                        </Col>
                                        <Col xs='12'>
                                            <FloatingInput
                                                label={{ label: 'Dirección Completa' }}
                                                input={{ placeholder: 'Dirección Completa', onChange: handleChange, name: 'address', value: data.address }}
                                                errors={errors.address}
                                            />
                                        </Col>
                                        <Col xs='12'>
                                            <FloatingInput
                                                label={{ label: 'Dirección Fiscal Completa' }}
                                                input={{ placeholder: 'Dirección Fiscal Completa', onChange: handleChange, name: 'fiscal_address', value: data.fiscal_address }}
                                                errors={errors.fiscal_address}
                                            />
                                        </Col>
                                        <Col xs='12'>
                                            <Select
                                                label={{ label: 'Productos Habilitados' }}
                                                input={{
                                                    placeholder: 'Productos Habilitados',
                                                    onChange: setSelectedMultiple,
                                                    name: 'products',
                                                    options: products,
                                                    defaultValue: selectedOptionProducts,
                                                    isMulti: true,
                                                    closeMenuOnSelect: false,
                                                }}
                                                errors={errors.products}
                                            />
                                        </Col>
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
                                                image={data.logoUrl}
                                                errors={errors.logo}
                                            />
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <h4>Acceso</h4>
                                    <Row>
                                        <Col xs='12' sm='12'>
                                            <FloatingInput
                                                label={{ label: 'Email' }}
                                                input={{ placeholder: 'Email', onChange: handleChange, name: 'email', value: data.email }}
                                                errors={errors.email}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12'>
                                            <FloatingInput
                                                label={{ label: 'Clave' }}
                                                input={{ placeholder: 'Clave', onChange: handleChange, name: 'password', value: data.password, type: 'password', autoComplete: 'new-password' }}
                                                errors={errors.password}
                                            />
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <h4>Usuarios</h4>
                                    <Row>
                                        {usersData.map((item, index) => {
                                            return (
                                                <Col xs='12' sm='12' md='6' lg='4' key={index}>
                                                    <FloatingInput
                                                        label={{ label: item.title }}
                                                        input={{ placeholder: item.title, onChange: (e) => handleChangeUser(index, e), name: 'users', value: getUsers(index), type: 'number' }}
                                                        errors={errors.users}
                                                    />
                                                </Col>
                                            )
                                        })
                                        }
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Card>
                        <CardFooter className="text-end">
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled: processing }}>Guardar</Btn>
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route('companies')) }} >Volver</Btn>
                        </CardFooter>
                    </Card>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}