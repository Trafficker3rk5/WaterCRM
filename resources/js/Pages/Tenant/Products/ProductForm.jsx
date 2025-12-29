import React, { Fragment, useEffect, useState } from "react";
import { Breadcrumbs, Btn } from "./../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 }  from 'react-feather';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import FileManager from '@/Template/Components/FileManager';
import Select from '@/Template/CommonElements/Select';
import Switch from '@/Template/CommonElements/Switch';
import { Form, Card, CardBody, CardFooter, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, CardHeader } from 'reactstrap';

export default function ProductForm({ auth, title, product, familyName, dues, attributes}) {

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : product.id,
        inner_name : product.inner_name,
        inner_prices : [],
        inner_stock : product.inner_stock,
        inner_stock_min : product.inner_stock_min,
        inner_stock_max : product.inner_stock_max,
        inner_active : product.inner_active,
        inner_model : product.inner_model,
        attributes : [],
    });

    useEffect(() => {
        ///set prices
        let prices = [];
        try {
            let decoded = JSON.parse(product.inner_prices) ?? [];
            decoded.forEach((item, index) => {
                prices.push({id : item.id, price : item.price});
            });
        } catch (error) {}
        setData(data => ({...data, ['inner_prices'] : prices}));

        ///set attributes
        let attrs = [];
        attributes.forEach((item, index) => {
            if (item.inner_active) attrs.push(item.attribute_id);
        });
        setData(data => ({...data, ['attributes'] : attrs}));
    }, []);

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({
            ...data,
            [key]: value,
        }))
    }

    const getPrice = (key) => {
        let prices = data.inner_prices;
        let price = 0;
        prices.forEach((item, index) => {
            if (item.id == key) price = item.price;
        });
        return price;
    }

    const handleChangePrice = (key, e) => {
        let prices = data.inner_prices;
        let found = false;
        prices.forEach((item, index) => {
            if (item.id == key) {
                prices[index].price = e.target.value;
                found = true;
            }
        });

        if (!found) prices.push({id : key, price : e.target.value});
        setData(data => ({...data, ['inner_prices'] : prices}))
    }

    const handleChangeSwitch = (key) => {
        setData(key, !data[key]);
    }

    const handleChangeSwitchAttr = (key) => {
        let attrs = data.attributes;
        let index = attrs.indexOf(key);
        if (index === -1) attrs.push(key);
        else attrs.splice(index, 1);
        
        setData(data => ({...data, ['attributes'] : attrs}))
    }

    const saveForm = async () => {
        post(route('prs.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Form className='theme-form'>
                    <Breadcrumbs mainTitle={title} title={title} />
                    <Card>
                        <CardBody>
                            <Row>
                                <Col xs='12' md='3'>
                                    <FloatingInput 
                                        label={{label : 'Referencia Proveedor'}} 
                                        input={{placeholder : 'Referencia Proveedor', value : product.model, readOnly : true, className : 'input-disabled'}} 
                                        errors = {errors.model}
                                    />
                                </Col>
                                <Col xs='12' md='3'>
                                    <FloatingInput 
                                        label={{label : 'Nombre Proveedor'}} 
                                        input={{placeholder : 'Nombre', value : product.name, readOnly : true, className : 'input-disabled'}} 
                                        errors = {errors.name}
                                    />
                                </Col>
                                <Col xs='12' md='3'>
                                    <FloatingInput 
                                        label={{label : 'Familia'}} 
                                        input={{placeholder : 'Familia', value : familyName, readOnly : true, className : 'input-disabled'}} 
                                        errors = {errors.name}
                                    />
                                </Col>
                                {product.lts &&
                                <Col xs='12' md='2'>
                                    <FloatingInput 
                                        label={{label : 'Capacidad'}} 
                                        input={{placeholder : 'Capacidad', value : 'Hasta ' + product.lts + ' lts', readOnly : true, className : 'input-disabled'}} 
                                        errors = {errors.name}
                                    />
                                </Col>
                                }
                                {product.family_id == 7 &&
                                <>
                                    <Col xs='12' md='2'>
                                        <FloatingInput 
                                            label={{label : 'Con Gas'}} 
                                            input={{placeholder : 'Con Gas', value : product.gas ? 'Si' : 'No', readOnly : true, className : 'input-disabled'}} 
                                            errors = {errors.name}
                                        />
                                    </Col>
                                    <Col xs='12' md='2'>
                                        <FloatingInput 
                                            label={{label : 'Encimera'}} 
                                            input={{placeholder : 'Encimera', value : (product.worktop ? 'Bajo' : 'Sobre') + ' Encimera', readOnly : true, className : 'input-disabled'}} 
                                            errors = {errors.name}
                                        />
                                    </Col>
                                    <Col xs='12' md='2'>
                                        <FloatingInput 
                                            label={{label : 'Predosificación'}} 
                                            input={{placeholder : 'Predosificación', value : product.predosing == 0 ? 'Volumétrica' : (product.predosing == 1 ? 'Cronometrica' : 'Mecánica'), readOnly : true, className : 'input-disabled'}} 
                                            errors = {errors.name}
                                        />
                                    </Col>
                                </>
                                }
                            </Row>
                        </CardBody>
                        
                    </Card>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col xs='12' md='4'>
                                    <FloatingInput 
                                        label={{label : 'Nombre'}} 
                                        input={{placeholder : 'Nombre', onChange : handleChange, name : 'inner_name', value : data.inner_name}} 
                                        errors = {errors.name}
                                    />
                                </Col>
                                <Col xs='12' md='2'>
                                    <FloatingInput 
                                        label={{label : 'Rerefencia'}} 
                                        input={{placeholder : 'Rerefencia', onChange : handleChange, name : 'inner_model', value : data.inner_model}} 
                                        errors = {errors.inner_model}
                                    />
                                </Col>
                                <Col xs='12' md='2'>
                                    <FloatingInput 
                                        label={{label : 'Stock'}} 
                                        input={{placeholder : 'Stock', onChange : handleChange, name : 'inner_stock', value : data.inner_stock, type : 'number'}} 
                                        errors = {errors.inner_stock}
                                    />
                                </Col>
                                <Col xs='12' md='2'>
                                    <FloatingInput 
                                        label={{label : 'Stock Mínimo'}} 
                                        input={{placeholder : 'Stock', onChange : handleChange, name : 'inner_stock_min', value : data.inner_stock_min, type : 'number'}} 
                                        errors = {errors.inner_stock_min}
                                    />
                                </Col>
                                <Col xs='12' md='2'>
                                    <FloatingInput 
                                        label={{label : 'Stock Máximo'}} 
                                        input={{placeholder : 'Stock', onChange : handleChange, name : 'inner_stock_max', value : data.inner_stock_max, type : 'number'}} 
                                        errors = {errors.inner_stock_max}
                                    />
                                </Col>
                                <Col xs='12' md='2'>
                                    <Switch 
                                        label={'Activo'} 
                                        input={{onChange : () => handleChangeSwitch('inner_active'), name : 'inner_active', checked : data.inner_active}} 
                                        errors = {errors.inner_active}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col xs='12' md='6'>
                                    <h6 className="mt-4 ms-1">Precios Hogar</h6>
                                    <Row>
                                        {
                                        dues.map((element, index) => {
                                            return (
                                            <Col xs='12' md='2' key={'kh-'+ index}>
                                                <FloatingInput 
                                                    label={{label : element}} 
                                                    input={{placeholder : element, onChange : (e) => handleChangePrice('h-' + element, e), name : 'users', value : getPrice('h-' + element), type : 'number'}} 
                                                    errors = {errors.users}
                                                />
                                            </Col>
                                            )
                                        })
                                        }
                                    </Row>
                                </Col>
                                <Col xs='12' md='6'>
                                    <h6 className="mt-4 ms-1">Precios Empresa</h6>
                                    <Row>
                                        {
                                        dues.map((element, index) => {
                                            return (
                                            <Col xs='12' md='2' key={'kb-'+ index}>
                                                <FloatingInput 
                                                    label={{label : element}} 
                                                    input={{placeholder : element, onChange : (e) => handleChangePrice('b-' + element, e), name : 'users', value : getPrice('b-' + element), type : 'number'}} 
                                                    errors = {errors.users}
                                                />
                                            </Col>
                                            )
                                        })
                                        }
                                    </Row>
                                </Col>
                            </Row>

                            <h6 className="mt-4 ms-1">Atributos</h6>
                            <Row>
                                {
                                    attributes.map((element, index) => {
                                        return (
                                            <Col xs='12' md='4' key={'atr-' + index}>
                                                <Switch 
                                                    label={element.attr_name} 
                                                    input={{onChange : () => handleChangeSwitchAttr(element.attribute_id), checked : data.attributes.includes(element.attribute_id)}} 
                                                    errors = {errors.inner_active}
                                                />
                                            </Col>
                                        )
                                    })
                                }
                            </Row>
                                    

                        </CardBody>
                        <CardFooter className="text-end">
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route('prs')) }} >Volver</Btn>
                        </CardFooter>
                    </Card>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}