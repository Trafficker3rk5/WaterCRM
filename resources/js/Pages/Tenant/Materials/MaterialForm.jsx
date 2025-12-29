import React, { Fragment, useEffect, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import SimpleImage from '@/Template/CommonElements/SimpleImage';
import { Form, Card, CardBody, CardFooter, Row, Col} from 'reactstrap';
import Switch from "@/Template/CommonElements/Switch";

export default function MaterialForm({ auth, title, material}) {

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : material.id,
        name : material.name,
        reference : material.reference,
        stock : material.stock,
        price : material.price,
        description : material.description,
        image : material.image,
        image_url : material.image_url,
        stock_min : material.stock_min,
        stock_max : material.stock_max,
        active : material.active ?? 0
    });

    useEffect(() => {

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

    const handleChangeSwitch = (key) => {
        setData(key, !data[key]);
    }

    const saveForm = async () => {
        post(route('materials.store'));
    }

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
                                        <Col xs='12' sm='12' md='6'>
                                            <FloatingInput 
                                                label={{label : 'Nombre'}} 
                                                input={{onChange : handleChange, name : 'name', value : data.name}}
                                                errors = {errors.name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='4'>
                                            <FloatingInput 
                                                label={{label : 'Referencia'}} 
                                                input={{onChange : handleChange, name : 'reference', value : data.reference}}
                                                errors = {errors.reference}
                                            />
                                        </Col>
                                        <Col xs='12' md='2'>
                                            <Switch  
                                                label={'Activo'} 
                                                input={{onChange : () => handleChangeSwitch('active'), name : 'active', checked : data.active}} 
                                                errors = {errors.active}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='3'>
                                            <FloatingInput 
                                                label={{label : 'Stock'}} 
                                                input={{onChange : handleChange, name : 'stock', value : data.stock}}
                                                errors = {errors.stock}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='3'>
                                            <FloatingInput 
                                                label={{label : 'Precio'}} 
                                                input={{onChange : handleChange, name : 'price', value : data.price}}
                                                errors = {errors.price}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='3'>
                                            <FloatingInput 
                                                label={{label : 'Stock Mínimo'}} 
                                                input={{onChange : handleChange, name : 'stock_min', value : data.stock_min}}
                                                errors = {errors.stock_min}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='3'>
                                            <FloatingInput 
                                                label={{label : 'Stock Máximo'}} 
                                                input={{onChange : handleChange, name : 'stock_max', value : data.stock_max}}
                                                errors = {errors.stock_max}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='12'>
                                            <FloatingInput 
                                                label={{label : 'Descripción'}} 
                                                input={{onChange : handleChange, name : 'description', value : data.description, as : 'textarea'}}
                                                errors = {errors.description}
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
                                                label={{label : 'Imagen'}} 
                                                input={{onChange : handleChangeInput, name : 'image', accept : "image/*"}}
                                                image={data.image_url}
                                                errors = {errors.image}
                                            />
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Card>
                        <CardFooter className="text-end">
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route('materials')) }} >Volver</Btn>
                        </CardFooter>
                    </Card>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}