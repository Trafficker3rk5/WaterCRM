import React, { Fragment, useEffect, useState } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { Form, Card, CardBody, CardFooter, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, CardHeader } from 'reactstrap';
import Switch from "@/Template/CommonElements/Switch";
import Phone from "@/Template/CommonElements/Phone";
import FileManager from "@/Template/Components/FileManager";
import { Trash2 }  from 'react-feather';
import Email from "@/Template/CommonElements/Email";
import Address from "@/Template/Components/Address";
import CollapseCard from "@/Template/Components/CollapseCard";
import SignatureCanvas from 'react-signature-canvas'

export default function InstallationForm({ auth, title, installation, allMaterials, materials, files0, files1, files2, files3, readOnly, parts, allParts}) {
    const [activeTab, setActiveTab] = useState('1');
    const [selectedOption, setSelectedOption] = useState([]);
    const [sigPad, setSigPad] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : installation.id,
        installation_notes : installation.installation_notes,
        client_name : installation.client_name ? installation.client_name : installation.client.company_name,
        client_dni : installation.client_dni,
        client_sign : installation.client_sign,
        serial_number : installation.serial_number,
        finished : installation.finished,
        finished_reason : installation.finished_reason,
        next_maintenance : installation.next_maintenance,
        files0 : files0,
        files1 : files1,
        files2 : files2,
        files3 : files3,
        materials : materials !== null ? materials : [],
        parts : parts !== null ? parts : [],
    });

    console.log(installation);
    
    const menuData = [
        {id: 1, title: 'Instalación', icon: '', hide : false},
        {id: 2, title: 'Materiales', icon: '', hide : installation.is_maintenance},
        {id: 4, title: 'Recambios', icon: '', hide : !installation.is_maintenance},
        {id: 3, title: 'Imagenes', icon: '', hide : false},
    ]

    useEffect(() => {
        
        if (installation.is_maintenance){
            let selected = [];
            parts.forEach((item, index) => {
                selected[index] = allParts.find(x => x.value == item.material_id);
            });
            setSelectedOption(selected);
        }else {
            let selected = [];
            materials.forEach((item, index) => {
                selected[index] = allMaterials.find(x => x.value == item.material_id);
            });
            setSelectedOption(selected);
        }
        
    }, []);

    useEffect(() => {
        if (sigPad) sigPad.fromDataURL(data.client_sign);
    }, [sigPad]);

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({...data, [key]: value}))
    }

    const handleChangeSwitch = (key) => {
        setData(key, !data[key]);
    }

    const setFiles = (w, key) => {
        setData(key, w);
    }

    const addMaterial = () => {
        let dis = data.materials;
        dis.push({material_id : '', quantity : '', id : ''});
        setData('materials', dis);
    }

    const handleChangeMaterial = (key, e, f) => {
        key = key.toString();
        let attr = data.materials;
        attr.forEach((item, index) => {
            if (index == key) item[f] = f == 'material_id' ? e.value : e.target.value;
        });
        if (f == 'material_id') setSelectedOption({...selectedOption, [key]: e});
        setData('materials', attr);
    }

    const addPart = () => {
        let dis = data.parts;
        dis.push({spare_part_id : '', quantity : '', id : ''});
        setData('parts', dis);
    }

    const handleChangePart = (key, e, f) => {
        key = key.toString();
        let attr = data.parts;
        attr.forEach((item, index) => {
            if (index == key) item[f] = f == 'spare_part_id' ? e.value : e.target.value;
        });
        if (f == 'spare_part_id') setSelectedOption({...selectedOption, [key]: e});
        setData('parts', attr);
    }

    const saveForm = async () => {
        post(route('installations.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />
                <Row>
                    <Col xs='12' md='4'>
                        <CollapseCard title="Datos de la Instalación">
                            <div><b>Producto: </b>{ installation?.product?.final_name || 'N/A' }</div>
                            <div><b>Fecha y Hora: </b>{ installation?.installation_date || 'N/A' }</div>
                            <div><b>Instalador: </b>{ installation?.assigned?.full_name || 'N/A' }</div>
                            <div><b>Notas: </b>{ installation?.notes || '—' }</div>
                        </CollapseCard> 
                    </Col>
                    <Col xs='12' md='4'>
                        <CollapseCard title="Datos del Cliente">
                            <div><b>Cliente: </b>{ installation?.client?.company_name || 'N/A' }</div>
                            <div><b>Contacto: </b>{ installation?.client?.full_name || 'N/A' }</div>
                            <div><b>Telefóno: </b> <Phone client={installation?.client || {}} /></div>
                            <div><b>Email: </b> <Email client={installation?.client || {}} /></div>
                        </CollapseCard>
                    </Col>
                    <Col xs='12' md='4'>
                        <CollapseCard title="Dirección">
                            <div><Address address={installation?.address || {}} /></div>
                        </CollapseCard>
                    </Col>
                </Row>

                {errors.images && <div className="alert alert-danger">{errors.images}</div>}
                
                <Card>
                    <Form className='theme-form'>
                        <CardBody>
                            <Nav className='border-tab nav-primary nav nav-tabs' tabs>
                                {
                                menuData.map((item, index) => {
                                    if (item.hide) return null;
                                    return (
                                        <NavItem key={index}>
                                            <NavLink className={activeTab === item.id.toString() ? 'active' : ''} onClick={() => setActiveTab(item.id.toString())}>
                                                <i className={item.icon}></i>
                                                {item.title}
                                            </NavLink>
                                        </NavItem>
                                    )
                                })
                                }
                            </Nav>
                            <TabContent activeTab={activeTab}>
                                <TabPane className='fade show' tabId='1'>
                                    <Row>
                                        <Col xs='12' md='8'>
                                            <Row>
                                                <Col xs='12' md='6'>
                                                    <FloatingInput 
                                                        label={{label : 'Nombre del Cliente'}} 
                                                        input={{placeholder : 'Nombre del Cliente', onChange : handleChange, name : 'client_name', value : data.client_name, readOnly : readOnly}} 
                                                        errors = {errors.client_name}
                                                    />
                                                </Col>
                                                <Col xs='12' md='6'>
                                                    <FloatingInput 
                                                        label={{label : 'DNI del Cliente'}} 
                                                        input={{placeholder : 'DNI del Cliente', onChange : handleChange, name : 'client_dni', value : data.client_dni, readOnly : readOnly}} 
                                                        errors = {errors.client_dni}
                                                    />
                                                </Col>
                                                <Col xs='12' md='6'>
                                                    <FloatingInput 
                                                        label={{label : 'Número de Serie'}} 
                                                        input={{placeholder : 'Número de Serie', onChange : handleChange, name : 'serial_number', value : data.serial_number, readOnly : readOnly}} 
                                                        errors = {errors.serial_number}
                                                    />
                                                </Col>
                                                <Col xs='12' md='6'>
                                                    <FloatingInput 
                                                        label={{label : 'Notas de Instalación'}} 
                                                        input={{placeholder : 'Notas de Instalación', onChange : handleChange, name : 'installation_notes', value : data.installation_notes, readOnly : readOnly}} 
                                                        errors = {errors.installation_notes}
                                                    />
                                                </Col>
                                                <Col xs='12' md='4'>
                                                    <FloatingInput 
                                                        label={{label : 'Próximo Mantenimiento (meses)'}} 
                                                        input={{placeholder : '', onChange : handleChange, name : 'next_maintenance', value : data.next_maintenance, type : 'number', readOnly : true}} 
                                                        errors = {errors.next_maintenance}
                                                    />
                                                </Col>
                                                <Col xs='12' md='2'>
                                                    <Switch 
                                                        label={'No Finalizada'} 
                                                        input={{onChange : () => handleChangeSwitch('finished'), name : 'finished', checked : data.finished, readOnly : readOnly}} 
                                                        errors = {errors.finished}
                                                    />
                                                </Col>
                                                {data.finished &&
                                                <Col xs='12' md='6'>
                                                    <FloatingInput 
                                                        label={{label : 'Motivo de No Finalización'}} 
                                                        input={{placeholder : 'Motivo de No Finalización', onChange : handleChange, name : 'finished_reason', value : data.finished_reason, readOnly : readOnly}} 
                                                        errors = {errors.finished_reason}
                                                    />
                                                </Col>
                                                }
                                            </Row>
                                        </Col>
                                        <Col xs='12' md='4'>
                                            <Row>
                                                <Col xs='12'>
                                                    <label>Firma del Cliente</label><br></br>
                                                    <SignatureCanvas 
                                                        penColor='black' 
                                                        ref={(ref) => { setSigPad(ref) }} 
                                                        canvasProps={{width: 500, height: 200, className: 'sigCanvas'}} 
                                                        onEnd = {() => setData(data => ({...data, ['client_sign']: sigPad.toDataURL()}))}
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane className='fade show' tabId='2'>
                                    <Row>
                                        <Col xs='10'>
                                            {
                                                data['materials'].map((item, index) => {
                                                    return (
                                                        <Row key={index}>
                                                            <Col xs='7'>
                                                                <Select 
                                                                    label={{label : 'Material'}} 
                                                                    input={{ 
                                                                        placeholder : 'Material', 
                                                                        onChange : (e) => handleChangeMaterial(index, e, 'material_id'),
                                                                        name : 'material' + index,
                                                                        options : allMaterials,
                                                                        defaultValue : selectedOption[index] ?? null,
                                                                        disabled : readOnly
                                                                    }}
                                                                    errors = {errors.product_id}
                                                                />
                                                            </Col>
                                                            <Col xs='3'>
                                                                <FloatingInput 
                                                                    label={{label : 'Cantidad'}} 
                                                                    input={{
                                                                        placeholder : '', 
                                                                        onChange : (e) => handleChangeMaterial(index, e, 'quantity'), 
                                                                        name : 'qty' + index, 
                                                                        value : item.quantity, 
                                                                        type : 'number',
                                                                        readOnly : readOnly
                                                                    }} 
                                                                    errors = {errors.qty}
                                                                />
                                                            </Col>
                                                            <Col xs='2'>
                                                                {!readOnly &&
                                                                <Trash2 
                                                                    className="text-danger mt-4" 
                                                                    size={20}
                                                                    onClick = {() => {
                                                                        let dis = data.materials;
                                                                        dis.splice(index, 1);
                                                                        setData('materials', dis);
                                                                    }}
                                                                />
                                                                }
                                                            </Col>
                                                        </Row>
                                                    )
                                                })
                                            }
                                        </Col>
                                        {!readOnly &&
                                        <Col xs='2'>
                                            <Btn attrBtn={{ color: 'primary', onClick: () => addMaterial()}}>Agregar</Btn>
                                        </Col>
                                        }
                                    </Row>
                                </TabPane>
                                <TabPane className='fade show' tabId='4'>
                                    <Row>
                                        <Col xs='10'>
                                            {
                                                data['parts'].map((item, index) => {
                                                    return (
                                                        <Row key={index}>
                                                            <Col xs='7'>
                                                                <Select 
                                                                    label={{label : 'Recambio'}} 
                                                                    input={{ 
                                                                        placeholder : 'Recambio', 
                                                                        onChange : (e) => handleChangePart(index, e, 'spare_part_id'),
                                                                        name : 'part' + index,
                                                                        options : allParts,
                                                                        defaultValue : selectedOption[index] ?? null,
                                                                        disabled : readOnly
                                                                    }}
                                                                    errors = {errors.product_id}
                                                                />
                                                            </Col>
                                                            <Col xs='3'>
                                                                <FloatingInput 
                                                                    label={{label : 'Cantidad'}} 
                                                                    input={{
                                                                        placeholder : '', 
                                                                        onChange : (e) => handleChangePart(index, e, 'quantity'), 
                                                                        name : 'qty' + index, 
                                                                        value : item.quantity, 
                                                                        type : 'number',
                                                                        readOnly : readOnly
                                                                    }} 
                                                                    errors = {errors.qty}
                                                                />
                                                            </Col>
                                                            <Col xs='2'>
                                                                {!readOnly &&
                                                                <Trash2 
                                                                    className="text-danger mt-4" 
                                                                    size={20}
                                                                    onClick = {() => {
                                                                        let dis = data.parts;
                                                                        dis.splice(index, 1);
                                                                        setData('parts', dis);
                                                                    }}
                                                                />
                                                                }
                                                            </Col>
                                                        </Row>
                                                    )
                                                })
                                            }
                                        </Col>
                                        {!readOnly &&
                                        <Col xs='2'>
                                            <Btn attrBtn={{ color: 'primary', onClick: () => addPart()}}>Agregar</Btn>
                                        </Col>
                                        }
                                    </Row>
                                </TabPane>
                                <TabPane className='fade show' tabId='3'>
                                    <Row>
                                        <FileManager 
                                            title="Instalación terminada"
                                            search="hide"
                                            uploadUrl={route('tenant.upload.tmp', 'image')} 
                                            files={data.files0} 
                                            accept="image/*" 
                                            id="files0"
                                            readOnly={readOnly}
                                            setFiles={(files) => setFiles(files, 'files0')}
                                        />
                                        <hr className="mt-2 mb-5"></hr>
                                        <FileManager 
                                            title="Ubicación pegatina"
                                            search="hide"
                                            uploadUrl={route('tenant.upload.tmp', 'image')} 
                                            files={data.files1} 
                                            accept="image/*" 
                                            id="files1"
                                            readOnly={readOnly}
                                            setFiles={(files) => setFiles(files, 'files1')}
                                        />
                                        <hr className="mt-2 mb-5"></hr>
                                        <FileManager 
                                            title="Enganche Grifo"
                                            search="hide"
                                            uploadUrl={route('tenant.upload.tmp', 'image')} 
                                            files={data.files2} 
                                            accept="image/*" 
                                            id="files2"
                                            readOnly={readOnly}
                                            setFiles={(files) => setFiles(files, 'files2')}
                                        />
                                        <hr className="mt-2 mb-5"></hr>
                                        <FileManager 
                                            title="Fotos Adicionales"
                                            search="hide"
                                            uploadUrl={route('tenant.upload.tmp', 'image')} 
                                            files={data.files3} 
                                            accept="image/*" 
                                            id="files3"
                                            readOnly={readOnly}
                                            setFiles={(files) => setFiles(files, 'files3')}
                                        />
                                    </Row>
                                </TabPane>
                            </TabContent>
                        </CardBody>
                        <CardFooter className="text-end">
                            {!readOnly &&
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
                            }
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(route('installations')) }} >Volver</Btn>
                        </CardFooter>
                    </Form>
                </Card>
            </Fragment>
        </AuthenticatedLayout>
    )
}