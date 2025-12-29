import React, { Fragment, useEffect, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col, Media} from 'reactstrap';
import AddDetails from "@/Template/Components/AddDetails";
import Edit from '@/Template/CommonElements/Edit';
import Trash from '@/Template/CommonElements/Trash';

export default function BudgetForm({ auth, title, budget, cid, allDetails, products, extras, dues}) {
    const [modalDetails, setModalDetails] = useState(false);
    const toggleDetails = () => setModalDetails(!modalDetails);
    const [modalTitle, setModalTitle] = useState('Agregar Detalles');
    const [details, setDetails] = useState([]);
    const [detailsIndex, setDetailsIndex] = useState(null);
    const [detailsList, setDetailsList] = useState(allDetails);

    const [selectedOption, setSelectedOption] = useState(() => {
        let selected = [];
        let parts = budget?.products?.split(',') || [];
        if (parts){
            parts.forEach((item, index) => {
                products.forEach((item2, index2) => {
                    if (item == item2.value) selected.push(item2);
                });
            });
        }
        return selected;
    });

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : budget.id,
        products : [],
        details : allDetails,
        quantities : []
    });

    useEffect(() => {
        let products = [];
        for (let i = 0; i < selectedOption.length; i++) products.push(selectedOption[i].value);
        setData(data => ({...data, ['products']: products}))

        let quantities = [];
        let pars = budget?.quantities?.split(',') || [];
        for (let i = 0; i < selectedOption.length; i++) quantities.push(pars[i] || 1);
        setData(data => ({...data, ['quantities']: quantities}))
    }, [selectedOption]);

    const addDetails = (details) => {
        let newList = [...detailsList];
        if (detailsIndex === null) {
            newList = [...detailsList, details];
            setDetailsList(newList);
        }else {
            newList[detailsIndex] = details;
            setDetailsList(newList);
        }
        setData(data => ({...data, details : newList}));
    }

    const setSelectedMultiple = (selected, index) => {
        setSelectedOption(selected);
        let others = [];
        for (let i = 0; i < selected.length; i++) others.push(selected[i].value);
        setData(data => ({...data, [index]: others}))
    }

    const handleChangeQty = (key, e) => {
        let quantities = data.quantities;
        quantities[key] = e.target.value;
        setData(data => ({...data, ['quantities'] : quantities}))
    }

    const getQty = (key) => {
        return data.quantities[key] ?? 1;
    }

    const saveForm = async () => {
        post(route('budgets.store', cid));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />
                <Form className='theme-form2'>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col xs='12' md='6'>
                                    <Select 
                                        label={{label : 'Productos'}} 
                                        input={{ 
                                            placeholder : 'Productos', 
                                            onChange : (e) => setSelectedMultiple(e, 'products'),
                                            name : 'products',
                                            options : products,
                                            defaultValue : selectedOption,
                                            value : selectedOption,
                                            isMulti : true,
                                            closeMenuOnSelect : false,
                                        }}
                                        errors = {errors.products}
                                    />
                                </Col>
                                <Col xs='12' md='6'>
                                    <Row>
                                    {selectedOption.map((item, index) => {
                                        return (
                                        <Col xs='12' md='6' key={'product-' + index}>
                                            <FloatingInput 
                                                label={{label : 'Cantidad de ' + item.label}} 
                                                input={{ 
                                                    type : 'number', 
                                                    placeholder : 'Cantidad', 
                                                    name : 'quantity',
                                                    value : getQty(index),
                                                    onChange : (e) => handleChangeQty(index, e),
                                                    min : 1
                                                }}
                                                errors = {errors.quantity}
                                            />
                                        </Col>
                                        )
                                    })}
                                    </Row>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <Media className="mb-2">
                                <Media body>
                                    <h4>Detalles</h4>
                                </Media>
                                <Media right>
                                    <div className='btn-sm btn btn-success d-inline-flex' 
                                        onClick={() => {
                                            toggleDetails(); 
                                            setDetails([]); 
                                            setModalTitle('Agregar Detalles');
                                            setDetailsIndex(null);
                                        }}>
                                        Agregar
                                    </div>
                                </Media>
                            </Media>
                            {detailsList.map((item, index) => {
                                return (
                                    <Media className="mt-2" key={'details-' + index}>
                                        <Media body>
                                            <div><b>{item.txt}</b></div>
                                            <div>{item.notes}</div>
                                        </Media>
                                        <Media right>
                                            <Edit 
                                                onClick={() => {
                                                    toggleDetails(); 
                                                    setModalTitle('Editar Detalles'); 
                                                    setDetails(item);
                                                    setDetailsIndex(index);
                                                }}
                                                id={'edit' + index}/>
                                            <Trash 
                                                onClick={() => {
                                                    setDetailsList(detailsList.filter((det, i) => i !== index))
                                                    setData(data => ({...data, details : detailsList.filter((det, i) => i !== index)}))
                                                }} 
                                                id={'delete' + index}
                                            />
                                        </Media>
                                    </Media>
                                )
                            })}

                            <AddDetails 
                                title={modalTitle}
                                isOpen={modalDetails}
                                closeModal={toggleDetails}
                                details={details}
                                products={selectedOption}
                                quantities={data.quantities}

                                setDetails={addDetails}
                                extras={extras}
                                dues={dues}
                            />

                        </CardBody>
                        <CardFooter className="text-end">
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route('budgets.index', cid)) }} >Volver</Btn>
                        </CardFooter>
                    </Card>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}