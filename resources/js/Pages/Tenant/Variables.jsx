import React, { Fragment, useEffect, useState, useContext } from "react";
import { Breadcrumbs, Btn } from "../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import MainDataContext from '@/Template/_helper/MainData';

export default function UserForm({ auth, title, extra, families }) {
    const { generateRandomString } = useContext(MainDataContext);

    const [selectedOptionFm, setSelectedOptionFm] = useState(() => {
        let selected = [];
        if (extra) {
            let parts = extra.WAAS_API_ENABLED.split(',');
            parts.forEach((item, index) => {
                families.forEach((item2, index2) => {
                    if (item == item2.value) selected.push(item2);
                });
            });
        }
        return selected;
    });

    const types = [
        { label: 'Venta', value: '0' },
        { label: 'Alquiler', value: '1' },
        { label: 'Renting', value: '2' }
    ]
    const [actualTab, setActualTab] = useState('1');
    const [calculatedData, setCalculatedData] = useState({});

    const [selectedOption, setSelectedOption] = useState(() => {
        let selected = [];
        if (extra) {
            let parts = extra.HORECA_TYPES.split(',');
            parts.forEach((item, index) => {
                types.forEach((item2, index2) => {
                    if (item == item2.value) selected.push(item2);
                });
            });
        }
        return selected;
    });

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        extra: extra
    });

    useEffect(() => {
    }, []);

    const setSelectedMultiple = (selected, index) => {
        if (index == 'WAAS_API_ENABLED') setSelectedOptionFm(selected);
        else setSelectedOption(selected);
        let others = [];
        for (let i = 0; i < selected.length; i++) others.push(selected[i].value);
        const extra = data.extra;
        extra[index] = others;
        setData(data => ({ ...data, ['extra']: extra }))
    }

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        const extra = data.extra;
        extra[key] = value;
        setData(data => ({ ...data, ['extra']: extra }))
        calculateData(data);
    }

    const calculateData = (data) => {
        let c1 = (data.extra['HORECA_KW_DISHWASHER'] / 12) + (10 * data.extra['HORECA_LTS_PRICE'] / 1000);
        let c2 = 6 * data.extra['HORECA_KW_DISPENCER'] * (data.extra['HORECA_KW_PRICE']);

        setCalculatedData({ c1: c1, c2: c2 });
    }

    const saveForm = async () => {
        post(route('variables.store'));
    };

    const regenerate = async () => {
        const token = generateRandomString(80);
        const extra = data.extra;
        extra['WAAS_API_TOKEN'] = token;
        setData(data => ({ ...data, ['extra']: extra }))
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />
                <Card>
                    <CardBody>
                        <Form className='theme-form2'>
                            <Row>
                                <Col sm='3' className='tabs-responsive-side'>
                                    <Nav className='flex-column nav-pills border-tab nav-left'>
                                        <NavItem>
                                            <NavLink href='#javascript' className={actualTab === '1' ? 'active' : ''} onClick={() => setActualTab('1')}>
                                                HORECA
                                            </NavLink>
                                            <NavLink href='#javascript' className={actualTab === '2' ? 'active' : ''} onClick={() => setActualTab('2')}>
                                                API
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                </Col>
                                <Col sm='9'>
                                    <TabContent activeTab={actualTab}>
                                        <TabPane className='fade show' tabId='1'>
                                            <Row>
                                                <Col sm="6">
                                                    <Row>
                                                        <Col sm="12">
                                                            <Select
                                                                label={{ label: 'Operaciones' }}
                                                                input={{
                                                                    placeholder: 'Operaciones',
                                                                    onChange: (e) => setSelectedMultiple(e, 'HORECA_TYPES'),
                                                                    name: 'HORECA_TYPES',
                                                                    options: types,
                                                                    defaultValue: selectedOption,
                                                                    value: selectedOption,
                                                                    isMulti: true,
                                                                    closeMenuOnSelect: false,
                                                                }}
                                                                errors={errors.parts}
                                                            />
                                                        </Col>
                                                        <Col sm="6">
                                                            <FloatingInput
                                                                label={{ label: 'Precio (Kw)' }}
                                                                input={{ placeholder: 'Precio (Kw)', name: 'HORECA_KW_PRICE', value: data.extra['HORECA_KW_PRICE'], onChange: handleChange, type: 'number' }}
                                                                errors={errors.HORECA_KW_PRICE}
                                                            />
                                                        </Col>
                                                        <Col sm="6">
                                                            <FloatingInput
                                                                label={{ label: 'Potencia dispensador (Kw)' }}
                                                                input={{ placeholder: 'Potencia (Kw)', name: 'HORECA_KW_DISPENCER', value: data.extra['HORECA_KW_DISPENCER'], onChange: handleChange, type: 'number' }}
                                                                errors={errors.HORECA_KW_DISPENCER}
                                                            />
                                                        </Col>
                                                        <Col sm="6">
                                                            <FloatingInput
                                                                label={{ label: 'Potencia lavavajilla (Kw)' }}
                                                                input={{ placeholder: 'Potencia (Kw)', name: 'HORECA_KW_DISHWASHER', value: data.extra['HORECA_KW_DISHWASHER'], onChange: handleChange, type: 'number' }}
                                                                errors={errors.HORECA_KW_DISHWASHER}
                                                            />
                                                        </Col>
                                                        <Col sm="6">
                                                            <FloatingInput
                                                                label={{ label: 'Coste de m3 de agua (€)' }}
                                                                input={{ placeholder: 'Coste', name: 'HORECA_LTS_PRICE', value: data.extra['HORECA_LTS_PRICE'], onChange: handleChange, type: 'number' }}
                                                                errors={errors.HORECA_LTS_PRICE}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col sm="6">
                                                    <Row>
                                                        <Col xs='12' md='6'>
                                                            <FloatingInput
                                                                label={{ label: 'Coste Lavado (€)' }}
                                                                input={{ placeholder: 'Coste', value: (calculatedData.c1 ?? 0) + ' €', readOnly: true, className: 'input-disabled' }}
                                                                errors={errors.name}
                                                            />
                                                        </Col>
                                                        <Col xs='12' md='6'>
                                                            <FloatingInput
                                                                label={{ label: 'Coste consumo de dispensador al día (€)' }}
                                                                input={{ placeholder: 'Coste', value: (calculatedData.c2 ?? 0) + ' €', readOnly: true, className: 'input-disabled' }}
                                                                errors={errors.name}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </TabPane>
                                        <TabPane className='fade show' tabId='2'>
                                            <Row>
                                                <Col sm="8">
                                                    <Row>
                                                        <Col sm="12">
                                                            <a target='_blank' href={route('l5-swagger.default.api')}>Ver Documentación</a>
                                                        </Col>
                                                        <Col sm="12">
                                                            <FloatingInput
                                                                label={{ label: 'Token' }}
                                                                input={{ placeholder: 'Token', name: 'WAAS_API_TOKEN', value: data.extra['WAAS_API_TOKEN'], readOnly: true, className: 'input-disabled' }}
                                                                errors={errors.WAAS_API_TOKEN}
                                                            />
                                                        </Col>
                                                        <Col sm="12" className="mt-2">
                                                            <Btn attrBtn={{ color: 'primary', onClick: regenerate, disabled: processing }}>Generar Token</Btn>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col sm="4">
                                                    <Select
                                                        label={{ label: 'Familia' }}
                                                        input={{
                                                            placeholder: 'Familia',
                                                            onChange: (e) => setSelectedMultiple(e, 'WAAS_API_ENABLED'),
                                                            name: 'WAAS_API_ENABLED',
                                                            options: families,
                                                            defaultValue: selectedOptionFm,
                                                            value: selectedOptionFm,
                                                            isMulti: true,
                                                            closeMenuOnSelect: false,
                                                        }}
                                                        errors={errors.parts}
                                                    />
                                                </Col>
                                            </Row>
                                        </TabPane>
                                    </TabContent>
                                </Col>
                            </Row>
                            <CardFooter className="text-end">
                                <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled: processing }}>Guardar</Btn>
                            </CardFooter>
                        </Form>
                    </CardBody>
                </Card>
            </Fragment>
        </AuthenticatedLayout>
    )
}