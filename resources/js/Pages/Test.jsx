import React, { Fragment } from "react";
import { Btn, H4 } from "./../Template/AbstractElements";
import { useForm } from "react-hook-form";
import { Row, Col, CardHeader, CardBody, CardFooter, Form, FormGroup, Label, Input } from 'reactstrap'
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Breadcrumbs } from '../Template/AbstractElements';

export default function Test({ auth }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const onEditSubmit = (data) => {
        alert(data)
    }
    return (
        <AuthenticatedLayout user={auth.user}>
            <Fragment>
                <Breadcrumbs mainTitle='Email Compose' parent='Apps' title='Email Compose' />
                <Form className="card" onSubmit={handleSubmit(onEditSubmit)}>
                    <CardHeader>
                        <H4 attrH4={{ className: "card-title mb-0" }}>EditProfile</H4>
                        <div className="card-options">
                            <a className="card-options-collapse" href="#javascript">
                                <i className="fe fe-chevron-up"></i>
                            </a>
                            <a className="card-options-remove" href="#javascript">
                                <i className="fe fe-x"></i>
                            </a>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col md="5">
                                <FormGroup className="mb-3"> <Label className="form-label">Company</Label>
                                    <Input className="form-control" type="text" placeholder="Company" {...register("company", { required: true })} /><span style={{ color: "red" }}>{errors.company && 'Company is required'} </span>
                                </FormGroup>
                            </Col>
                            <Col sm="6" md="3">
                                <FormGroup> <Label className="form-label">Username</Label>
                                    <Input className="form-control" type="text" placeholder="Username" {...register("Username", { required: true })} /><span style={{ color: "red" }}>{errors.Username && 'Username is required'} </span>
                                </FormGroup>
                            </Col>
                            <Col sm="6" md="4">
                                <FormGroup> <Label className="form-label">EmailAddress</Label>
                                    <Input className="form-control" type="email" placeholder="Email" {...register("EmailAddress", { required: true })} /><span style={{ color: "red" }}>{errors.EmailAddress && 'EmailAddress is required'} </span>
                                </FormGroup>
                            </Col>
                            <Col sm="6" md="6">
                                <FormGroup><Label className="form-label">FirstName</Label>
                                    <Input className="form-control" type="text" placeholder="Company" {...register("FirstName", { required: true })} /><span style={{ color: "red" }}>{errors.FirstName && 'FirstName is required'} </span>
                                </FormGroup>
                            </Col>
                            <Col sm="6" md="6">
                                <FormGroup><Label className="form-label">LastName</Label>
                                    <Input className="form-control" type="text" placeholder="Last Name" {...register("LastName", { required: true })} /><span style={{ color: "red" }}>{errors.LastName && 'LastName is required'} </span>
                                </FormGroup>
                            </Col>
                            <Col md="12">
                                <FormGroup><Label className="form-label">Address</Label>
                                    <Input className="form-control" type="text" placeholder="Home Address" {...register("Address", { required: true })} /><span style={{ color: "red" }}>{errors.Address && 'Address is required'} </span>
                                </FormGroup>
                            </Col>
                            <Col sm="6" md="4">
                                <FormGroup> <Label className="form-label">City</Label>
                                    <Input className="form-control" type="text" placeholder="City" {...register("City", { required: true })} /><span style={{ color: "red" }}>{errors.City && 'City is required'} </span>
                                </FormGroup>
                            </Col>
                            <Col sm="6" md="3">
                                <FormGroup><Label className="form-label">PostalCode</Label>
                                    <Input className="form-control" type="number" placeholder="ZIP Code" />
                                </FormGroup>
                            </Col>
                            <Col md="5">
                                <FormGroup><Label className="form-label">Country</Label>
                                    <Input type="select" name="select" className="form-control btn-square">
                                        
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md="12">
                                <div> <Label className="form-label">AboutMe</Label>
                                    <Input type="textarea" className="form-control" rows="5" placeholder="Enter About your description" />
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                    <CardFooter className="text-end">
                        <Btn attrBtn={{ color: "primary", type: "submit" }} >UpdateProfile</Btn>
                    </CardFooter>
                </Form>
            </Fragment>
        </AuthenticatedLayout>
    )
}