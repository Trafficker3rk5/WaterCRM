import React, { Fragment, useEffect, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col} from 'reactstrap';
import SimpleImage from "@/Template/CommonElements/SimpleImage";

export default function SparePartForm({ auth, title, part, products, others, types}) {
    console.log(part);
    const [selectedOption, setSelectedOption] = useState(() => types.filter(type => type.value == part.type_id)[0]);

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : part.id,
        name : part.name,
        name_en : part.name_en,
        description : part.description,
        stock : part.stock,
        reference : part.reference,
        compatibility_id : part.compatibility_id,
        others : [],
        type_id : part.type_id,
        image : part.image,
        imageUrl : part.image_url,
    });

    useEffect(() => {
    }, []);

    const handleChangeInput = (e) => {
        const key = e.target.name;
        const file = e.target.files[0];
        setData(data => ({...data, [key]: file}));
    }

    const setSelected = (selected, evt) => {
        setSelectedOption(selected);
        setData(data => ({...data, [evt.name]: selected.value}))
    }

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({...data, [key]: value}))
    }

    const saveForm = async () => {
        post(route('parts.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />
                <Card>
                    <Form className='theme-form'>
                        <CardBody>
                            <Row>
                                <Col xs='12' sm='12' md='8'>

                                    <Row>
                                        <Col xs='12' sm='12' md='4'>
                                            <FloatingInput 
                                                label={{label : 'Nombre'}} 
                                                input={{placeholder : 'Nombre', onChange : handleChange, name : 'name', value : data.name, required : true}} 
                                                errors = {errors.name}
                                            />
                                        </Col>
                                        <Col xs='12' sm='12' md='4'>
                                            <FloatingInput 
                                                label={{label : 'Nombre Inglés'}} 
                                                input={{placeholder : 'Nombre', onChange : handleChange, name : 'name_en', value : data.name_en, required : true}} 
                                                errors = {errors.name_en}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='2'>
                                            <Select
                                                label={{label : 'Tipo'}} 
                                                input={{ 
                                                    placeholder : 'Tipo', 
                                                    onChange : setSelected,
                                                    name : 'type_id',
                                                    options : types,
                                                    defaultValue : selectedOption
                                                }}
                                                errors = {errors.category_id}
                                            />
                                        </Col>
                                        <Col xs='12' sm='6' md='2'>
                                            <FloatingInput 
                                                label={{label : 'Referencia Proveedor'}} 
                                                input={{placeholder : 'Referencia Proveedor', onChange : handleChange, name : 'reference', value : data.reference , required : true}} 
                                                errors = {errors.reference}
                                            />
                                        </Col>                               
                                        <Col xs='12'>
                                            <FloatingInput 
                                                label={{label : 'Descripción'}} 
                                                input={{placeholder : 'Descripción', onChange : handleChange, name : 'description', value : data.description, as : 'textarea',}} 
                                                errors = {errors.description}
                                            />
                                        </Col>
                                        {part.used_in && part.used_in.length > 0 && (
                                        <Col xs='12'>
                                            <h6 className="mt-4">Usado en</h6>
                                            <ul>
                                                {part.used_in.map((product, index) => (
                                                    <li key={index}>{product}</li>
                                                ))}
                                            </ul>
                                        </Col>
                                        )}
                                    </Row>
                                </Col>
                                <Col xs='12' sm='12' md='4'>
                                    <SimpleImage 
                                        label={{label : 'Imagen'}} 
                                        input={{onChange : handleChangeInput, name : 'image', accept : "image/*"}}
                                        image={data.imageUrl}
                                        errors = {errors.image}
                                    />
                                </Col>
                            </Row>
                        </CardBody>
                        <CardFooter className="text-end">
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route('parts')) }} >Volver</Btn>
                        </CardFooter>
                    </Form>
                </Card>
            </Fragment>
        </AuthenticatedLayout>
    )
}