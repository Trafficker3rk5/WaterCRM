import React, { Fragment, useEffect, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import SimpleImage from '@/Template/CommonElements/SimpleImage';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col} from 'reactstrap';

export default function CompanyForm({ auth, title, company, products}) {
        const usersData = [
        {id: 1, title: 'Administradores'},
        {id: 2, title: 'Directores Comercial'},
        {id: 3, title: 'Directores Tecnicos'},
        {id: 4, title: 'Comerciales'},
        {id: 5, title: 'Técnicos'},
        {id: 6, title: 'Telemarketing'}
    ];

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        name : company.name,
        business_name : company.business_name,
        cif : company.cif,
        logo : company.logo,
        logoUrl : company.logo_url,
        email : company.email,
        address : company.address,
        fiscal_address : company.fiscal_address,
        users : company.users,
    });

    useEffect(() => {
        ///set users
        let companyUsers = [];
        try {
            let decoded = JSON.parse(company.users) ?? [];
            decoded.forEach((item, index) => {companyUsers[index] = item;});
        } catch (error) {}
        setData(data => ({...data, ['users'] : companyUsers}));
    }, []);

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({...data, [key]: value}))
    }

    const handleChangeInput = (e) => {
        const key = e.target.name;
        const file = e.target.files[0];
        setData(data => ({...data, [key]: file}));
    }

    const getUsers = (key) => {
        return data.users[key] ?? 0;
    }

    const saveForm = async () => {
        post(route('company.store'));
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
                                                label={{label : 'Dominio'}} 
                                                input={{placeholder : 'Dominio', name : 'domain', value : company.domain, readOnly : true, className : 'input-disabled'}} 
                                                errors = {errors.domain}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs='12' sm='12' md='6' lg='6'>
                                            <FloatingInput 
                                                label={{label : 'Nombre'}} 
                                                input={{placeholder : 'Nombre', onChange : handleChange, name : 'name', value : data.name}} 
                                                errors = {errors.name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='6'>
                                            <FloatingInput 
                                                label={{label : 'Razón Social'}} 
                                                input={{placeholder : 'Razón Social', onChange : handleChange, name : 'business_name', value : data.business_name }} 
                                                errors = {errors.business_name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='6'>
                                            <FloatingInput 
                                                label={{label : 'Email'}} 
                                                input={{placeholder : 'Email', onChange : handleChange, name : 'email', value : data.email}} 
                                                errors = {errors.email}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='6'>
                                            <FloatingInput 
                                                label={{label : 'CIF'}} 
                                                input={{placeholder : 'CIF', onChange : handleChange, name : 'cif', value : data.cif}} 
                                                errors = {errors.cif}
                                            />
                                        </Col>
                                        <Col xs='12'>
                                            <FloatingInput 
                                                label={{label : 'Dirección Completa'}} 
                                                input={{placeholder : 'Dirección Completa', onChange : handleChange, name : 'address', value : data.address}} 
                                                errors = {errors.address}
                                            />
                                        </Col>
                                        <Col xs='12'>
                                            <FloatingInput 
                                                label={{label : 'Dirección Fiscal Completa'}} 
                                                input={{placeholder : 'Dirección Fiscal Completa', onChange : handleChange, name : 'fiscal_address', value : data.fiscal_address}} 
                                                errors = {errors.fiscal_address}
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
                                                label={{label : 'Logo'}} 
                                                input={{onChange : handleChangeInput, name : 'logo', accept : "image/*"}}
                                                image={data.logoUrl}
                                                errors = {errors.logo}
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
                                                        label={{label : item.title}} 
                                                        input={{placeholder : item.title, name : 'users', value : getUsers(index), type : 'number', readOnly : true, className : 'input-disabled'}} 
                                                        errors = {errors.users}
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
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route('companies')) }} >Volver</Btn>
                        </CardFooter>
                    </Card>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}