import React, { Fragment, useEffect, useState, useRef } from "react";
import { Breadcrumbs, Btn } from "./../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 }  from 'react-feather';

import FloatingInput from '@/Template/CommonElements/FloatingInput';
import FileManager from '@/Template/Components/FileManager';
import Select from '@/Template/CommonElements/Select';
import Switch from '@/Template/CommonElements/Switch';
import { Form, Card, CardBody, CardFooter, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

export default function ProductForm({ auth, title, product, families, categories, allParts, attributes, images, videos, documents, attrs, parts, otherParts, dismantling, extras = [], selectedExtras = []}) {
    console.log(extras);
    const [activeTab, setActiveTab] = useState('1');
    const [extrasModal, setExtrasModal] = useState(false);
    const modalRef = useRef(null);
    const backUrl = route('products');
    
    // Filter out current product from extras list
    const availableExtras = extras.filter(extra => extra.value !== product.id);
    const [selectedOption, setSelectedOption] = useState(() => {
        let selected = null;
        if (product.family_id){
            families.forEach((item, index) => {
                if (item.value == product.family_id) selected = item;
            });
        }
        return selected;
    });
    const [selectedOptionCat, setSelectedOptionCat] = useState(() => {
        let selected = null;
        if (product.category_id){
            categories.forEach((item, index) => {
                if (item.value == product.category_id) selected = item;
            });
        }
        return selected;
    });
    const [selectedOptionOthers, setSelectedOptionOthers] = useState(() => {
        let selected = [];
        if (otherParts){
            otherParts.forEach((item, index) => {
                allParts.forEach((item2, index2) => {
                    if (item == item2.value) selected.push(item2);
                });
            });
        }
        return selected;
    });
    const [selectedOptionParts, setSelectedOptionParts] = useState(() => {
        let selected = [];
        if (parts){
            parts.forEach((item, index) => {
                allParts.forEach((item2, index2) => {
                    if (item == item2.value) selected.push(item2);
                });
            });
        }
        return selected;
    });
    const [catAttributes, setCatAttributes] = useState([]);

    const worktopData = [
        {value: 0, label: 'Bajo Encimera'},
        {value: 1, label: 'Sobre Encimera'},
    ]

    const predosingData = [
        {value: 0, label: 'Volumétrica'},
        {value: 1, label: 'Cronometrica'},
        {value: 2, label: 'Mecánica'},
    ]

    const [selectedOptionWorktop, setSelectedOptionWorktop] = useState(() => worktopData.find(wk => wk.value == product.worktop));
    const [selectedOptionPredosing, setSelectedOptionPredosing] = useState(() => predosingData.find(pd => pd.value == product.predosing));
    
    const [selectedOptionExtras, setSelectedOptionExtras] = useState(() => {
        let selected = [];
        if (selectedExtras && selectedExtras.length > 0 && extras && extras.length > 0) {
            selectedExtras.forEach((extraId) => {
                extras.forEach((extra) => {
                    if (extra.value == extraId) selected.push(extra);
                });
            });
        }
        return selected;
    });
    
    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : product.id,
        model : product.model,
        name : product.name,
        model_en : product.model_en,
        name_en : product.name_en,
        code : product.code,
        active : product.active,
        family_id : product.family_id,
        description : product.description,
        description_en : product.description_en,
        category_id : product.category_id,
        has_extras : product.has_extras ?? false,
        is_extra : product.is_extra ?? false,
        extras : [],
        attributes : [],
        images : images,
        videos : videos,
        documents : documents,
        parts : [],
        others : [],
        dismantling : dismantling !== null ? dismantling : [{reference : '', description : ''}],
        lts : product.lts,
        gas : product.gas,
        worktop : product.worktop,
        predosing : product.predosing
    });

    const menuData = [
        {id: 1, title: 'Producto', icon: ''},
        {id: 5, title: 'Atributos', icon: ''},
        {id: 6, title: 'Despiece', icon: ''},
        {id: 2, title: 'Imágenes', icon: ''},
        {id: 3, title: 'Videos', icon: ''},
        {id: 4, title: 'Documentos', icon: ''}
    ]

    

    useEffect(() => {
        if (attrs.length > 0) setCatAttributes(attrs);

        if (attributes.length > 0){
            let attr = [];
            attributes.forEach((item, index) => {
                attr.push({id : item.attribute_id, text : item.text, text_en : item.text_en});
            });
            setData('attributes', attr);
        }

        let others = [];
        for (let i = 0; i < selectedOptionOthers.length; i++) others.push(selectedOptionOthers[i].value);
        setData(data => ({...data, ['others']: others}))

        let parts = [];
        for (let i = 0; i < selectedOptionParts.length; i++) parts.push(selectedOptionParts[i].value);
        setData(data => ({...data, ['parts']: parts}))

        let extrasList = [];
        for (let i = 0; i < selectedOptionExtras.length; i++) extrasList.push(selectedOptionExtras[i].value);
        setData(data => ({...data, ['extras']: extrasList}))
    }, [selectedOptionOthers, selectedOptionParts, selectedOptionExtras]);

    const setSelected = (selected, evt) => {
        if (evt.name == 'family_id') setSelectedOption(selected);
        else if (evt.name == 'worktop') setSelectedOptionWorktop(selected);
        else if (evt.name == 'predosing') setSelectedOptionPredosing(selected);
        else setSelectedOptionCat(selected);
        setData(data => ({
            ...data,
            [evt.name]: selected.value,
        }))
        if (evt.name == 'category_id') handleChangeCategory(selected.value);
    }

    const handleChangeCategory = async (v) => {
        const response = await axios.get(route('catalog.attributes', v));
        if (response.data){
            setCatAttributes(response.data);
        }
    }

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({
            ...data,
            [key]: value,
        }))
    }

    const handleChangeSwitch = (key) => {
        setData(key, !data[key]);
    }

    const handleChangeAttr = (key, e) => {
        let attr = data.attributes;
        
        if (e.target.checked) attr.push({id : key});
        else {
            let aux = [];
            attr.forEach((item, index) => {
                if (item.id != key) aux.push(item);
            });
            attr = aux;
        }
        setData('attributes', attr);
    }

    const handleChangeAttrTxt = (key, e, k2) => {
        key = key.toString();
        let attr = data.attributes;
        attr.forEach((item, index) => {
            if (item.id == key) item[k2] = e.target.value;
        });
        setData('attributes', attr);
    }

    const isAttrChecked = (key) => {
        let attr = data.attributes;
        let checked = false;
        attr.forEach((item, index) => {
            if (item.id == key) checked = true;
        });
        return checked;
    }

    const getAttrTxt = (key, k2) => {
        let attr = data.attributes;
        let txt = '';
        attr.forEach((item, index) => {
            if (item.id == key) txt = item[k2];
        });
        return txt;
    }

    const setFiles = (w, key) => {
        setData(key, w);
    }

    const setSelectedMultiple = (selected, index) => {
        if (index == 'parts') {
            setSelectedOptionParts(selected);
        } else if (index == 'extras') {
            setSelectedOptionExtras(selected);
        } else {
            setSelectedOptionOthers(selected);
        }
        let items = [];
        for (let i = 0; i < selected.length; i++) items.push(selected[i].value);
        setData(data => ({...data, [index]: items}))
    }

    const toggleExtra = (extra) => {
        let currentSelected = [...selectedOptionExtras];
        const index = currentSelected.findIndex(item => item.value === extra.value);
        
        if (index >= 0) {
            // Remove if already selected
            currentSelected.splice(index, 1);
        } else {
            // Add if not selected
            currentSelected.push(extra);
        }
        
        setSelectedOptionExtras(currentSelected);
        let items = [];
        for (let i = 0; i < currentSelected.length; i++) items.push(currentSelected[i].value);
        setData('extras', items);
    }

    const isExtraSelected = (extra) => {
        return selectedOptionExtras.some(item => item.value === extra.value);
    }

    const toggleExtrasModal = () => {
        setExtrasModal(!extrasModal);
    }

    const handleHasExtrasChange = () => {
        handleChangeSwitch('has_extras');
        if (!data.has_extras) {
            // Open modal when enabling has_extras
            setExtrasModal(true);
        }
    }

    const adDismantling = () => {
        let dis = data.dismantling;
        dis.push({reference : '', description : ''});
        setData('dismantling', dis);
    }

    const handleChangeDismantlingTxt = (key, e, f) => {
        key = key.toString();
        let attr = data.dismantling;
        attr.forEach((item, index) => {
            if (index == key) item[f] = e.target.value;
        });
        setData('dismantling', attr);
    }

    const saveForm = async () => {
        post(route('products.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />
                <Card>
                    <Form className='theme-form'>
                        <CardBody>
                            <Nav className='border-tab nav-primary nav nav-tabs' tabs>
                                {
                                    menuData.map((item, index) => {
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
                                        <Col xs='12' md='4'>
                                            <FloatingInput 
                                                label={{label : 'Referencia Proveedor'}} 
                                                input={{placeholder : 'Referencia Proveedor', onChange : handleChange, name : 'model', value : data.model, required : true}} 
                                                errors = {errors.model}
                                            />
                                        </Col>
                                        <Col xs='12' md='4'>
                                            <FloatingInput 
                                                label={{label : 'Nombre Proveedor'}} 
                                                input={{placeholder : 'Nombre Proveedor', onChange : handleChange, name : 'name', value : data.name, required : true}} 
                                                errors = {errors.name}
                                            />
                                        </Col>
                                        <Col xs='12' md='4'>
                                            <FloatingInput 
                                                label={{label : 'Nombre Proveedor Inglés'}} 
                                                input={{placeholder : 'Nombre Proveedor Inglés', onChange : handleChange, name : 'name_en', value : data.name_en, required : true}} 
                                                errors = {errors.name_en}
                                            />
                                        </Col>
                                        <Col xs='12' md='2'>
                                            <Select
                                                label={{label : 'Familia'}} 
                                                input={{ 
                                                    placeholder : 'Familia', 
                                                    onChange : setSelected,
                                                    name : 'family_id',
                                                    options : families,
                                                    defaultValue : selectedOption,
                                                }}
                                                errors = {errors.family_id}
                                                zIndex={1100}
                                            />
                                        </Col>
                                        {data.family_id == 7 &&
                                        <>
                                            <Col xs='12' md='2'>
                                                <FloatingInput 
                                                    label={{label : 'Capacidad en L'}} 
                                                    input={{placeholder : '', onChange : handleChange, name : 'lts', value : data.lts, required : true, type : 'number'}} 
                                                    errors = {errors.lts}
                                                />
                                            </Col>
                                            <Col xs='12' md='2'>
                                                <Switch 
                                                    label={'Con Gas'} 
                                                    input={{onChange : () => handleChangeSwitch('gas'), name : 'gas', checked : data.gas}} 
                                                    errors = {errors.gas}
                                                />
                                            </Col>
                                            <Col xs='12' md='2'>
                                                <Select
                                                    label={{label : 'Encimera'}} 
                                                    input={{ 
                                                        placeholder : 'Encimera', 
                                                        onChange : setSelected,
                                                        name : 'worktop',
                                                        options : worktopData,
                                                        defaultValue : selectedOptionWorktop,
                                                    }}
                                                    errors = {errors.worktop}
                                                    zIndex={1100}
                                                />
                                            </Col>
                                            <Col xs='12' md='2'>
                                                <Select
                                                    label={{label : 'Predosificación'}} 
                                                    input={{ 
                                                        placeholder : 'Predosificación', 
                                                        onChange : setSelected,
                                                        name : 'predosing',
                                                        options : predosingData,
                                                        defaultValue : selectedOptionPredosing,
                                                    }}
                                                    errors = {errors.predosing}
                                                    zIndex={1100}
                                                />
                                            </Col>
                                        </>
                                        }
                                        <Col xs='12' md='2'>
                                            <Switch 
                                                label={'Activo'} 
                                                input={{onChange : () => handleChangeSwitch('active'), name : 'active', checked : data.active}} 
                                                errors = {errors.active}
                                            />
                                        </Col>
                                        <Col xs='12' md='2'>
                                            <Switch 
                                                label={'Es Extra'} 
                                                input={{onChange : () => handleChangeSwitch('is_extra'), name : 'is_extra', checked : data.is_extra}} 
                                                errors = {errors.is_extra}
                                            />
                                        </Col>
                                        <Col xs='12' md='2'>
                                            <Switch 
                                                label={'Tiene Extras'} 
                                                input={{onChange : handleHasExtrasChange, name : 'has_extras', checked : data.has_extras}} 
                                                errors = {errors.has_extras}
                                            />
                                        </Col>
                                        {data.has_extras && (
                                            <Col xs='12' md='2'>
                                                <Btn attrBtn={{ color: 'info', onClick: toggleExtrasModal, type: 'button' }}>
                                                    {selectedOptionExtras.length > 0 ? `Extras (${selectedOptionExtras.length})` : 'Seleccionar Extras'}
                                                </Btn>
                                            </Col>
                                        )}
                                    </Row>
                                    <Row>
                                        <Col xs='12' md='4'>
                                            <Select 
                                                label={{label : 'Recambios'}} 
                                                input={{ 
                                                    placeholder : 'Recambios', 
                                                    onChange : (e) => setSelectedMultiple(e, 'parts'),
                                                    name : 'parts',
                                                    options : allParts,
                                                    defaultValue : selectedOptionParts,
                                                    value : selectedOptionParts,
                                                    isMulti : true,
                                                    closeMenuOnSelect : false,
                                                }}
                                                errors = {errors.parts}
                                                zIndex={1090}
                                            />
                                        </Col>
                                        <Col xs='12' md='6'>
                                            <Select 
                                                label={{label : 'Otras Compatibilidades'}} 
                                                input={{ 
                                                    placeholder : 'Otras Compatibilidades', 
                                                    onChange : (e) => setSelectedMultiple(e, 'others'),
                                                    name : 'others',
                                                    options : allParts,
                                                    defaultValue : selectedOptionOthers,
                                                    value : selectedOptionOthers,
                                                    isMulti : true,
                                                    closeMenuOnSelect : false,
                                                }}
                                                errors = {errors.others}
                                                zIndex={1080}
                                            />
                                        </Col>
                                        <Col xs='12'>
                                            <FloatingInput 
                                                label={{label : 'Descripción'}} 
                                                input={{
                                                    placeholder : 'Descripción', 
                                                    onChange : handleChange, 
                                                    name : 'description', 
                                                    value : data.description,
                                                    as : 'textarea'
                                                }} 
                                                errors = {errors.description}
                                            />
                                        </Col>
                                        <Col xs='12'>
                                            <FloatingInput 
                                                label={{label : 'Descripción Ingles'}} 
                                                input={{
                                                    placeholder : 'Descripción', 
                                                    onChange : handleChange, 
                                                    name : 'description_en', 
                                                    value : data.description_en,
                                                    as : 'textarea'
                                                }} 
                                                errors = {errors.description_en}
                                            />
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId='2'>
                                    <FileManager 
                                        title="Imágenes" 
                                        uploadUrl={route('upload.tmp', 'image')} 
                                        files={data.images} 
                                        accept="image/*" 
                                        id="images"
                                        setFiles={(files) => setFiles(files, 'images')}/>
                                </TabPane>
                                <TabPane tabId='3'>
                                    <FileManager 
                                        title="Videos" 
                                        uploadUrl={route('upload.tmp', 'video')} 
                                        files={data.videos} 
                                        accept="video/*" 
                                        id="videos"
                                        setFiles={(files) => setFiles(files, 'videos')}/>
                                </TabPane>
                                <TabPane tabId='4'>
                                    <FileManager 
                                        title="Documentos" 
                                        uploadUrl={route('upload.tmp', 'file')} 
                                        files={data.documents} 
                                        accept="*" 
                                        id="docs"
                                        setFiles={(files) => setFiles(files, 'documents')}/>
                                </TabPane>
                                <TabPane tabId='5'>
                                    <Row>
                                        <Col xs='12'>
                                            <Select
                                                label={{label : 'Categoría'}} 
                                                input={{ 
                                                    placeholder : 'Categoría', 
                                                    onChange : setSelected,
                                                    name : 'category_id',
                                                    options : categories,
                                                    defaultValue : selectedOptionCat
                                                }}
                                                errors = {errors.category_id}
                                            />
                                        </Col>
                                    </Row>
                                    {
                                        catAttributes.map((item, index) => {
                                            return (
                                                <Row key={index}>
                                                    <Col xs='4'>
                                                        <Switch
                                                            label={item.name}
                                                            helpText={item.description}
                                                            input={{onChange : (e) => handleChangeAttr(item.id, e), name : 'active' + item.id, checked : isAttrChecked(item.id)}} 
                                                            errors = {errors.active}
                                                        />
                                                    </Col>
                                                    <Col xs='4'>
                                                        <FloatingInput 
                                                            label={{label : item.name}} 
                                                            input={{
                                                                placeholder : item.name, 
                                                                onChange : (e) => handleChangeAttrTxt(item.id, e, 'text'), 
                                                                name : 'active2' + item.id, 
                                                                value : getAttrTxt(item.id, 'text'),
                                                                disabled : !isAttrChecked(item.id)
                                                            }} 
                                                            errors = {errors[item.name]}
                                                        />
                                                    </Col>
                                                    <Col xs='4'>
                                                        <FloatingInput 
                                                            label={{label : 'Texto Inglés'}} 
                                                            input={{
                                                                placeholder : 'Texto Inglés', 
                                                                onChange : (e) => handleChangeAttrTxt(item.id, e, 'text_en'), 
                                                                name : 'active3' + item.id, 
                                                                value : getAttrTxt(item.id, 'text_en'),
                                                                disabled : !isAttrChecked(item.id)
                                                            }} 
                                                            errors = {errors[item.name]}
                                                        />
                                                    </Col>
                                                </Row>
                                            )
                                        })
                                    }
                                </TabPane>
                                <TabPane tabId='6'>
                                    <Row>
                                        <Col xs='10'>
                                            {
                                                data['dismantling'].map((item, index) => {
                                                    return (
                                                        <Row key={index}>
                                                            <Col xs='3'>
                                                                <FloatingInput 
                                                                    label={{label : 'Referencia'}} 
                                                                    input={{placeholder : 'Referencia', onChange : (e) => handleChangeDismantlingTxt(index, e, 'reference'), name : 'reference' + index, value : item.reference, required : true}} 
                                                                    errors = {errors.reference}
                                                                />
                                                            </Col>
                                                            <Col xs='7'>
                                                                <FloatingInput 
                                                                    label={{label : 'Descripción'}} 
                                                                    input={{placeholder : 'Descripción', onChange : (e) => handleChangeDismantlingTxt(index, e, 'description'), name : 'description' + index, value : item.description, required : true}} 
                                                                    errors = {errors.description}
                                                                />
                                                            </Col>
                                                            <Col xs='2'>
                                                                <Trash2 
                                                                    className="text-danger mt-4" 
                                                                    size={20}
                                                                    onClick = {() => {
                                                                        let dis = data.dismantling;
                                                                        dis.splice(index, 1);
                                                                        setData('dismantling', dis);
                                                                    }}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    )
                                                })
                                            }
                                        </Col>
                                        <Col xs='2'>
                                            <Btn attrBtn={{ color: 'primary', onClick: () => adDismantling()}}>Agregar</Btn>
                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>
                        </CardBody>
                        <CardFooter className="text-end">
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
                            <Btn attrBtn={{ color: 'secondary cancel-btn ms-2', onClick: () => router.visit(backUrl) }} >Volver</Btn>
                        </CardFooter>
                    </Form>
                </Card>

                {/* Extras Selection Modal */}
                <Modal 
                    isOpen={extrasModal} 
                    toggle={toggleExtrasModal} 
                    id="extrasModal" 
                    className="mainModal extras-selection-modal" 
                    centered 
                    size="lg"
                    backdrop={true}
                    contentClassName="border-0 shadow-lg"
                >
                    <ModalHeader toggle={toggleExtrasModal} className="border-bottom bg-light">
                        <h4 className="mb-0 text-dark">Seleccionar Extras</h4>
                    </ModalHeader>
                    <ModalBody className="p-4">
                        <Form className='theme-form'>
                            <Row>
                                <Col xs='12'>
                                    {availableExtras && Array.isArray(availableExtras) && availableExtras.length > 0 ? (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-3">
                                                    Extras Disponibles ({availableExtras.length} disponibles)
                                                </label>
                                                <div className="border rounded p-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                                    <Row>
                                                        {availableExtras.map((extra) => (
                                                            <Col xs='12' key={extra.value} className="mb-3">
                                                                <div className="d-flex align-items-center justify-content-between p-2 rounded border" style={{ 
                                                                    backgroundColor: isExtraSelected(extra) ? '#e7f1ff' : '#fff',
                                                                    transition: 'background-color 0.2s'
                                                                }}>
                                                                    <div className="flex-grow-1">
                                                                        <label className="form-label mb-0 fw-medium" style={{ fontSize: '15px', cursor: 'pointer' }}>
                                                                            {extra.label}
                                                                        </label>
                                                                    </div>
                                                                    <Switch 
                                                                        label={''}
                                                                        input={{
                                                                            onChange: () => toggleExtra(extra),
                                                                            name: `extra_${extra.value}`,
                                                                            checked: isExtraSelected(extra)
                                                                        }}
                                                                    />
                                                                </div>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </div>
                                            </div>
                                            <div className="mt-3 p-3 bg-light rounded border">
                                                <p className="text-muted mb-2">
                                                    <i className="me-2">ℹ️</i>
                                                    Selecciona los productos extra que pueden asociarse con este producto.
                                                </p>
                                                <p className="text-muted mb-0 small">
                                                    Solo se muestran productos marcados como "Es Extra" y que están activos.
                                                    {selectedOptionExtras.length > 0 && (
                                                        <span className="d-block mt-2 text-primary fw-semibold">
                                                            <strong>{selectedOptionExtras.length}</strong> {selectedOptionExtras.length === 1 ? 'extra seleccionado' : 'extras seleccionados'}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="alert alert-warning mb-0 border">
                                            <i className="me-2">⚠️</i>
                                            No hay productos extra disponibles. Marca algunos productos como "Es Extra" primero.
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Form>
                    </ModalBody>
                    <ModalFooter className="p-3 border-top bg-light d-flex justify-content-center gap-2">
                        <Btn attrBtn={{ 
                            color: 'secondary', 
                            className: 'cancel-btn px-4',
                            onClick: toggleExtrasModal 
                        }}>
                            Cerrar
                        </Btn>
                        <Btn attrBtn={{ 
                            color: 'primary', 
                            className: 'save-btn px-4',
                            onClick: toggleExtrasModal
                        }}>
                            Aceptar
                        </Btn>
                    </ModalFooter>
                </Modal>
            </Fragment>
        </AuthenticatedLayout>
    )
}