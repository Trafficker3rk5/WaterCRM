import React, { Fragment, useState, useEffect, useRef, useContext } from 'react';
import { PlusSquare } from 'react-feather';
import { toast } from 'react-toastify';
import { H4, H6, LI, P, UL, Image, Btn } from '../../AbstractElements';
import { CardBody, CardHeader, Input, Media, Modal, ModalHeader, ModalBody, ModalFooter, Col, Row } from 'reactstrap';
import { useForm, router } from '@inertiajs/react';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import MainDataContext from '@/Template/_helper/MainData';

const AddDetails = (props) => {
    const [selectedOptionIns, setSelectedOptionIns] = useState(null);
    const [selectedOptionTy, setSelectedOptionTy] = useState(null);
    const [selectedOptionMt, setSelectedOptionMt] = useState(null);
    const [selectedOptionIv, setSelectedOptionIv] = useState(null);
    const [selectedOptionEx, setSelectedOptionEx] = useState(null);
    const [selectedOptionDu, setSelectedOptionDu] = useState(null);
    const [modal, setModal] = useState(props.isOpen);
    const [modalTitle, setModalTitle] = useState(props.title);
    const toggle = () => props.closeModal();
    const { formatPrice } = useContext(MainDataContext);

    const installations = [
        {label : 'Incluida', value : '1'},
        {label : 'No Incluida', value : '0'}
    ]

    const types = [
        {label : 'Venta', value : '0'},
        {label : 'Alquiler', value : '1'},
        {label : 'Renting', value : '2'}
    ]

    const maintences = [
        {label : 'No Incluido', value : '0'},
        {label : '1 mes', value : '1'},
        {label : '3 meses', value : '3'},
        {label : '6 meses', value : '6'},
        {label : '9 meses', value : '9'},
        {label : '12 meses', value : '12'},
    ]

    const ivas = [
        {label : 'Empresa', value : '0'},
        {label : 'Hogar', value : '1'},
    ]

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : '',
        installation : 0,
        installation_cost : '',
        init_amount : '',
        last_amount : '',
        type : '',
        maintenance : '',
        extra_id : '',
        dues : '',
        price : '',
        discount : '',
        notes : '',
        iva : ''
    });

    const setSelected = (selected, evt) => {
        if (evt.name == 'installation') setSelectedOptionIns(selected);
        else if (evt.name == 'type') setSelectedOptionTy(selected);
        else if (evt.name == 'maintenance') setSelectedOptionMt(selected);
        else if (evt.name == 'iva') setSelectedOptionIv(selected);
        else if (evt.name == 'extra_id') setSelectedOptionEx(selected);
        else if (evt.name == 'dues') setSelectedOptionDu(selected);
        setData(data => ({...data, [evt.name]: selected.value}))

        if (evt.name == 'iva' || evt.name == 'dues') setPrice(evt.name, selected.value);
        setTxt(evt.name, selected.value);
    }

    const setPrice = (name, v) => {
        let due = name == 'dues' ? v : data.dues;
        let iva = name == 'iva' ? v : data.iva;
        let total = 0;
        let k = (iva == 1 ? 'h-' : 'b-') + due;
        
        // Ensure products is an array
        const products = Array.isArray(props.products) ? props.products : [];
        const quantities = Array.isArray(props.quantities) ? props.quantities : [];
        
        products.forEach((product, index) => {
            let json = product.prices;
            let p = 0;
            
            // Ensure prices is an array
            if (Array.isArray(json)) {
                json.forEach((item, index2) => {
                    if (item.id == k) p = item.price;
                });
            }
            
            total += p * (parseInt(quantities[index]) ?? 1);
        });
        setData(data => ({...data, ['price'] : total}));
    }


    const setMainData = (details) => {
        // Ensure details is an object
        if (!details || typeof details !== 'object' || Array.isArray(details)) {
            details = {};
        }
        
        setData({
            id : details.id ?? '',
            installation : details.installation ?? 0,
            installation_cost : details.installation_cost ?? '',
            init_amount : details.init_amount ?? '',
            last_amount : details.last_amount ?? '',
            type : details.type ?? '',
            maintenance : details.maintenance ?? '',
            extra_id : details.extra_id ?? '',
            dues : details.dues ?? '',
            price : details.price ?? '',
            discount : details.discount ?? '',
            notes : details.notes ?? '',
            iva : details.iva ?? '',
            txt : details.txt ?? ''
        });

        setSelectedOptionIns(installations.find(inst => inst.value == details.installation));
        setSelectedOptionTy(types.find(type => type.value == details.type));
        setSelectedOptionMt(maintences.find(maint => maint.value == details.maintenance));
        setSelectedOptionIv(ivas.find(iva => iva.value == details.iva));
        setSelectedOptionEx(Array.isArray(props.extras) ? props.extras.find(extra => extra.value == details.extra_id) : null);
        setSelectedOptionDu(Array.isArray(props.dues) ? props.dues.find(due => due.value == details.dues) : null);
    }

    useEffect(() => {
        setModal(props.isOpen);
        setModalTitle(props.title);
        reset();
        setMainData(props.details);
    }, [props.isOpen]);

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({...data, [key]: value}))
        setTxt();
    }

    const setTxt = (name, v) => {
        let due = name == 'dues' ? v : data.dues;
        let txt = '';
        txt += types.find(type => type.value == data.type)?.label ?? '';
        txt += '  ' + formatPrice(data.price);
        txt += '  en ' + due + ' cuota' + (due > 1 ? 's' : '');
        setData(data => ({...data, ['txt']: txt}))
    }

    const saveForm = () => {
        post(route('budgets.details.validate'), {
            preserveScroll: true,
            onSuccess: () => {
                props.setDetails(data);
                toggle();
            }
        });
    }

    return (
        <Modal isOpen={modal} toggle={toggle} id="addDetailsModal" className="mainModal" centered size="xl">
            <ModalHeader toggle={toggle}>{modalTitle}</ModalHeader>
            <ModalBody>
                <Row>
                    <Col xs='12' sm='12' md='4' style={{ zIndex: 9999 }}>
                        <Select 
                            label={{label : 'Instalación'}} 
                            input={{ 
                                placeholder : 'Instalación', 
                                onChange : setSelected,
                                name : 'installation',
                                options : installations,
                                defaultValue : selectedOptionIns,
                            }}
                            errors = {errors.installation}
                            zIndex={1110}
                        />
                    </Col>
                    {data.installation == 0 &&
                    <Col xs='12' sm='12' md='4'>
                        <FloatingInput 
                            label={{label : 'Coste de instalacion'}} 
                            input={{placeholder : 'Coste de instalacion', name : 'installation_cost', value : data.installation_cost, onChange : handleChange}} 
                            errors = {errors.installation_cost}
                        />
                    </Col>
                    }
                    <Col xs='12' sm='12' md='4' style={{ zIndex: 10000 }}>
                        <Select 
                            label={{label : 'Tipo'}} 
                            input={{ 
                                placeholder : 'Tipo', 
                                onChange : setSelected,
                                name : 'type',
                                options : types,
                                defaultValue : selectedOptionTy,
                            }}
                            errors = {errors.type}
                            zIndex={1100}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' sm='12' md='4'>
                        <FloatingInput 
                            label={{label : 'Precio'}} 
                            input={{placeholder : 'Precio', name : 'price', value : data.price, onChange : handleChange, readOnly : true}} 
                            errors = {errors.price}
                        />
                    </Col>
                    <Col xs='12' sm='12' md='4' style={{ zIndex: 10000 }}>
                        <Select 
                            label={{label : 'Cuotas'}} 
                            input={{ 
                                placeholder : 'Cuotas', 
                                onChange : setSelected,
                                name : 'dues',
                                options : Array.isArray(props.dues) ? props.dues : [],
                                defaultValue : selectedOptionDu,
                            }}
                            errors = {errors.dues}
                            zIndex={1090}
                        />
                    </Col>
                    <Col xs='12' sm='12' md='4'>
                        <FloatingInput 
                            label={{label : 'Descuento'}} 
                            input={{placeholder : 'Descuento', name : 'discount', value : data.discount, onChange : handleChange}} 
                            errors = {errors.discount}
                        />
                    </Col>
                    <Col xs='12' sm='12' md='4'>
                        <FloatingInput 
                            label={{label : 'Coste Inicial'}} 
                            input={{placeholder : 'Coste Inicial', name : 'init_amount', value : data.init_amount, onChange : handleChange}} 
                            errors = {errors.init_amount}
                        />
                    </Col>
                    <Col xs='12' sm='12' md='4'>
                        <FloatingInput 
                            label={{label : 'Coste Final'}} 
                            input={{placeholder : 'Coste Final', name : 'last_amount', value : data.last_amount, onChange : handleChange}} 
                            errors = {errors.last_amount}
                        />
                    </Col>
                    
                    <Col xs='12' sm='12' md='4' style={{ zIndex: 9999 }}>
                        <Select 
                            label={{label : 'Mantenimiento'}} 
                            input={{ 
                                placeholder : 'Mantenimiento', 
                                onChange : setSelected,
                                name : 'maintenance',
                                options : maintences,
                                defaultValue : selectedOptionMt,
                            }}
                            errors = {errors.maintenance}
                            zIndex={1080}
                        />
                    </Col>
                    <Col xs='12' sm='12' md='4' style={{ zIndex: 9999 }}>
                        <Select 
                            label={{label : 'Extra'}} 
                            input={{ 
                                placeholder : 'Extra', 
                                onChange : setSelected,
                                name : 'extra_id',
                                options : Array.isArray(props.extras) ? props.extras : [],
                                defaultValue : selectedOptionEx,
                            }}
                            errors = {errors.extra_id}
                            zIndex={1075}
                        />
                    </Col>
                    <Col xs='12' sm='12' md='4' style={{ zIndex: 9999 }}>
                        <Select 
                            label={{label : 'IVA'}} 
                            input={{ 
                                placeholder : 'IVA', 
                                onChange : setSelected,
                                name : 'iva',
                                options : ivas,
                                defaultValue : selectedOptionIv,
                            }}
                            errors = {errors.iva}
                            zIndex={1060}
                        />
                    </Col>
                    <Col xs='12' sm='12' md='12'>
                        <FloatingInput 
                            label={{label : 'Notas'}} 
                            input={{placeholder : 'Notas', name : 'notes', value : data.notes, onChange : handleChange}} 
                            errors = {errors.notes}
                        />
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggle }} >Cerrar</Btn>
                <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled : processing}}>Guardar</Btn>
            </ModalFooter>
        </Modal>
    );
};

export default AddDetails;