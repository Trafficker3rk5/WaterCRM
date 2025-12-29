import React, { Fragment, useEffect, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import SimpleImage from '@/Template/CommonElements/SimpleImage';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col} from 'reactstrap';

export default function UserForm({ auth, title, user, rols}) {
    const [selectedOption, setSelectedOption] = useState(() => {
        let selected = null;
        rols.forEach((item, index) => {
            if (item.value == user.rol_id) selected = item;
        });
        return selected;
    });
    
    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : user.id,
        name : user.name,
        last_name : user.last_name,
        email : user.email,
        rol_id : user.rol_id,
        password : '',
        phone : user.phone,
        full_address : user.full_address,
        picture : user.picture,
        avatarUrl : user.avatar,
    });

    useEffect(() => {

    }, []);

    const setSelected = (selected, evt) => {
        setSelectedOption(selected);
        setData(data => ({...data, [evt.name]: selected.value}))
    }

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

    const saveForm = async () => {
        post(route('users.store'));
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
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput 
                                                label={{label : 'Nombre'}} 
                                                input={{placeholder : 'Nombre', onChange : handleChange, name : 'name', value : data.name}} 
                                                errors = {errors.name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput 
                                                label={{label : 'Apellido'}} 
                                                input={{placeholder : 'Apellido', onChange : handleChange, name : 'last_name', value : data.last_name}} 
                                                errors = {errors.last_name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput 
                                                label={{label : 'Telefono'}} 
                                                input={{placeholder : 'Telefono', onChange : handleChange, name : 'phone', value : data.phone}} 
                                                errors = {errors.phone}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput 
                                                label={{label : 'Email'}} 
                                                input={{placeholder : 'Email', onChange : handleChange, name : 'email', value : data.email}} 
                                                errors = {errors.email}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <FloatingInput 
                                                label={{label : 'Clave'}} 
                                                input={{placeholder : 'Clave', onChange : handleChange, name : 'password', value : data.password, type : 'password', autoComplete : "new-password"}} 
                                                errors = {errors.email}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='6' lg='4'>
                                            <Select 
                                                label={{label : 'Rol'}} 
                                                input={{ 
                                                    placeholder : 'Rol', 
                                                    onChange : setSelected,
                                                    name : 'rol_id',
                                                    options : rols,
                                                    defaultValue : selectedOption
                                                }}
                                                errors = {errors.rol_id}
                                            />
                                        </Col>
                                        
                                        <Col xs='12' sm='12' md='6' lg='12'>
                                            <FloatingInput 
                                                label={{label : 'Dirección Completa'}} 
                                                input={{placeholder : 'Dirección', onChange : handleChange, name : 'full_address', value : data.full_address}} 
                                                errors = {errors.full_address}
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
                                                label={{label : 'Avatar'}} 
                                                input={{onChange : handleChangeInput, name : 'picture', accept : "image/*"}}
                                                image={data.avatarUrl}
                                                errors = {errors.picture}
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
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route('users')) }} >Volver</Btn>
                        </CardFooter>
                    </Card>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}