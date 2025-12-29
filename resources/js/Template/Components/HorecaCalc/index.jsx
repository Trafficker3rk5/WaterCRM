import React, { useState, useEffect, useContext } from "react";
import { Btn } from "../../../Template/AbstractElements";
import { useForm } from '@inertiajs/react';
import axios from "axios";
import { Modal, ModalBody, ModalFooter, ModalHeader, Row, Col} from "reactstrap";
import FloatingInput from "@/Template/CommonElements/FloatingInput";
import Icon from "@/Template/CommonElements/Icon";
import Select from '@/Template/CommonElements/Select';
import MainDataContext from '@/Template/_helper/MainData';
import CountUp from 'react-countup';

const HorecaCalc = (props) => {
    const { formatPrice } = useContext(MainDataContext);
    const [calcData, setCalcData] = useState({}); 
    const [hideCons2, setHideCons2] = useState(true);
    const [openedTab, setOpenedTab] = useState(1); ////0: Configuración
    const [dues, setDues] = useState([]);
    const [extras, setExtras] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState(null);
    const [selectedOptionEx, setSelectedOptionEx] = useState(null);
    const [selectedOptionCl, setSelectedOptionCl] = useState(null);
    const [modalHoreca, setModalHoreca] = useState(props.modal);
    const togglemodalHoreca = () => {
        setModalHoreca(!modalHoreca);
        if (modalHoreca) props.onClose();
    }
    const [modalCreate, setModalCreate] = useState(false);
    const togglemodalCreate = () => {
        setModalCreate(!modalCreate);
    }

    const predosingData = [
        {value: 0, label: 'Volumétrica'},
        {value: 1, label: 'Cronometrica'},
        {value: 2, label: 'Mecánica'},
    ]

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        services : 1,
        extra : [],
        totalLts : 0,
        extra_id : 0,
        client_id : 0,
        notes : '',
        product_id : 0,
        due : null
    });

    const monthDays = 365 / 12;

    /* CONFIG  */
    const types = [
        {label : 'Venta', value : '0'},
        {label : 'Alquiler', value : '1'},
        {label : 'Renting', value : '2'}
    ]
    const [selectedOption, setSelectedOption] = useState({});

    const setSelectedMultiple = (selected, index) => {
        setSelectedOption(selected);
        let others = [];
        for (let i = 0; i < selected.length; i++) others.push(selected[i].value);
        const extra = data.extra;
        extra[index] = others;
        setData(data => ({...data, ['extra']: extra}))
    }

    const handleChangeExtra = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        const extra = data.extra;
        extra[key] = value;
        setData(data => ({...data, ['extra']: extra}))
    }

    const getExtra = async () => {
        const response = await axios.get(route('horeca.variables'));
        let extra = response.data.extra;
        extra.HORECA_TYPES = extra.HORECA_TYPES.split(',')
        setData(data => ({...data, ['extra']: extra}))
        setDues(response.data.dues);
        setExtras(response.data.extras);
        setClients(response.data.clients);

        let selected = [];
        extra.HORECA_TYPES.forEach((item, index) => {
            types.forEach((item2, index2) => {
                if (item == item2.value) selected.push(item2);
            });
        });
        setSelectedOption(selected);
    }
    /* END CONFIG  */

    /* CALC  */
    const [selectedFreq1, setSelectedFreq1] = useState({});
    const [selectedFreq2, setSelectedFreq2] = useState({});
    const [selectedGas, setSelectedGas] = useState({});
    const [selectedPredo, setSelectedPredo] = useState({});
    const [selectedOptionDu, setSelectedOptionDu] = useState({});
    const freqs = [
        {label : 'Diario', value : '1'},
        {label : 'Semanal', value : '7'},
        {label : 'Quincenal', value : '14'},
        {label : 'Mensual', value : '30'},
        {label : 'Por Servicio', value : '0'},
    ];
    const yesNo = [
        {label : 'Si', value : '1'},
        {label : 'No', value : '0'},
    ];

    const processData = () => {
        console.log(data);
        if (openedTab == 0) {
            setOpenedTab(1);
        } else if (openedTab == 1) {
            calcProductData();
        } else if (openedTab == 2) {
            togglemodalCreate();
        }
    }

    const calcProductData = () => {
        post(route('horeca.calculate'), {
            preserveScroll: true,
            onSuccess: (d) => {
                console.log(d.props.flash.message);
                setProducts(d.props.flash.message.products);
                setOpenedTab(2);
            }
        });
    }

    const calculateData = (actualData) => {
        let bd1 = 0;
        let bd2 = 0;
        let monthCost = 0;
        let totalLts1 = 0;
        let totalLts2 = 0;
        if (actualData.boxes1 && actualData.bottles1 && actualData.capacity1 && actualData.freq_1) {
            bd1 = actualData.boxes1 * actualData.bottles1;
            bd1 = actualData.freq_1 != 0 ? (bd1 / actualData.freq_1) : (bd1 * parseInt(actualData.services));
            bd1 = Math.ceil(bd1);
            //totalLts1 = bd1 * actualData.capacity1;
            monthCost += bd1 * (actualData.cost1 ?? 0);
        }
        if (actualData.boxes2 && actualData.bottles2 && actualData.capacity2 && actualData.freq_2) {
            bd2 = actualData.boxes2 * actualData.bottles2;
            bd2 = actualData.freq_2 != 0 ? (bd2 / actualData.freq_2) : (bd2 * parseInt(actualData.services));
            bd2 = Math.ceil(bd2);
            //totalLts2 = bd2 * actualData.capacity2;
            monthCost += bd2 * (actualData.cost2 ?? 0);
        }
        let totalLts = totalLts1 + totalLts2;
        monthCost = monthCost * monthDays;
        setData(data => ({...data, ['totalLts']: totalLts}));
        setCalcData({...calcData, bd1, bd2, monthCost, totalLts1, totalLts2});
    }

    const setSelected = (selected, evt) => {
        if (evt.name == 'freq_1') setSelectedFreq1(selected);
        if (evt.name == 'freq_2') setSelectedFreq2(selected);
        if (evt.name == 'gas') setSelectedGas(selected);
        if (evt.name == 'predo') setSelectedPredo(selected);
        if (evt.name == 'dues') setSelectedOptionDu(selected);
        if (evt.name == 'extra_id') setSelectedOptionEx(selected);
        if (evt.name == 'client_id') setSelectedOptionCl(selected);

        setData(data => ({...data, [evt.name]: selected.value}))
        calculateData({...data, [evt.name]: selected.value});
        
        if (evt.name == 'gas' || evt.name == 'predo' || evt.name == 'due'){
            calculateFinalData({...data, [evt.name]: selected.value});
        }
    }

    const calculateFinalData = (actualData) => {
        let pr = null, productCost = 0, cost1 = 0, cost2 = 0, gasCost1 = 0, gasCost2 = 0, saving = 0, amortization = 1;
        if (products) {
            products.forEach((item, index) => {
                if (!pr && ((actualData.gas == item.gas) && (actualData.predo == item.predosing))){
                    pr = item;
                    setData(data => ({...data, ['product_id']: item.id}));
                    if (actualData.due) productCost = item.prices.filter((item2, index2) => {
                        return item2.id == 'b-' + actualData.due;
                    })[0].price;
                }
            });
        }

        if (productCost && productCost != 0){
            let b5 = Math.ceil(calcData.bd1 / 30);
            let ltPrice = data.extra['HORECA_LTS_PRICE'] / 1000;
            let washCost = (data.extra['HORECA_KW_DISHWASHER'] / 12) + (10 * ltPrice); ///OK      ////A17
            let dispCost = 6 * data.extra['HORECA_KW_DISPENCER'] * data.extra['HORECA_KW_PRICE']; ///OK                         ///A18

            let bottleCost1 = (calcData.bd1 * data.capacity1 * monthDays) + (b5 * monthDays * 10);            //(A6*A7*B1) + (roundUp(B5) * B1 * 10) ///A21      ///OK
            let waterCost1 = bottleCost1 * ltPrice; ///A21*A16                                              ///A20      ///OK
            let costEnergy1 = ((parseFloat(data.extra['HORECA_KW_DISHWASHER']) / 12) * b5 + (data.extra['HORECA_KW_DISPENCER'] * 6)) * data.extra['HORECA_KW_PRICE']; //(A15 / 12 ) * roundUp(B5) +  (A14 *B4) * A13   
            let costMonth1 = costEnergy1 * monthDays + waterCost1; //A19*B1 + A20            ///A23      ///OK
            let finalCost1 = costMonth1 / (calcData.bd1 * monthDays); //(A19*B1)/(A6*B1)     ///A22  

            let bottleCost2 = (calcData.bd2 * data.capacity2 * monthDays) + (b5 * monthDays * 10);            //(A6*A7*B1) + (roundUp(B5) * B1 * 10) ///A21      ///OK
            let waterCost2 = bottleCost2 * ltPrice; ///A21*A16                                              ///A20      ///OK
            let costEnergy2 = ((parseFloat(data.extra['HORECA_KW_DISHWASHER']) / 12) * b5 + (data.extra['HORECA_KW_DISPENCER'] * 6)) * data.extra['HORECA_KW_PRICE']; //(A15 / 12 ) * roundUp(B5) +  (A14 *B4) * A13   
            let costMonth2 = costEnergy2 * monthDays + waterCost2; //A19*B1 + A20            ///A23      ///OK
            let finalCost2 = costMonth2 / (calcData.bd2 * monthDays); //(A19*B1)/(A6*B1)     ///A22  

            cost1 = parseFloat((parseFloat(productCost) + parseFloat(costMonth1)) / (calcData.bd1 * monthDays)).toFixed(2); ///(A1+ A23) / (A6*B1)
            cost2 = parseFloat((parseFloat(productCost) + parseFloat(costMonth2)) / (calcData.bd2 * monthDays)).toFixed(2); ///(A1+ A23) / (A6*B1)
            

            if (actualData.gas){
                gasCost1 = parseFloat(cost1) + (0.03 * (data.capacity1 ?? 0));
                gasCost2 = parseFloat(cost2) + (0.03 * (data.capacity2 ?? 0));
            }
            if (isNaN(costMonth1)) costMonth1 = 0;
            if (isNaN(costMonth2)) costMonth2 = 0;

            saving = (calcData.monthCost ?? 0) - (calcData.productCost ?? 0) + costMonth1 + costMonth2;
            amortization = Math.ceil((calcData.productCost ?? 0) / (calcData.monthCost ?? 0));
            console.log(calcData, costMonth1, costMonth2, saving, amortization);
        }
        let allData = {...calcData, productCost, cost1, cost2, gasCost1, gasCost2, saving, amortization};
        delete allData['product'];
        setData(data => ({...data, ['allData']: allData}));
        setCalcData({...calcData, product : pr, productCost, cost1, cost2, gasCost1, gasCost2, saving, amortization});
    }
    
    const handleChange = (e) => {
        setData(data => ({...data, [e.target.name]: e.target.value}));
        calculateData({...data, [e.target.name]: e.target.value});
    }

    const generate = () => {
        post(route('budgets.store.horeca'), {
            onSuccess: (d) => {
                togglemodalCreate();
                togglemodalHoreca();
            },
            onError: (d) => {
                console.log(d);
            }
        });
    }

    useEffect(() => {
        if (props.modal) getExtra();
        setModalHoreca(props.modal);
    }, [props.modal]);

    return (
        <>
            <Modal isOpen={modalHoreca} size="lg" toggle={togglemodalHoreca} className="mainModal" centered>
                <ModalHeader toggle={togglemodalHoreca}>
                    <Icon icon="Settings" className="me-1 mt-1 pull-left text-light" id={'calc-config'} tooltip="Configuración" onClick={() => setOpenedTab(0)} />
                    Calculadora HORECA
                </ModalHeader>
                <ModalBody>
                    { /* CONFIG DATA  */ }
                    {openedTab == 0 &&
                    <Row>
                        <Col sm="12">
                            <Select 
                                label={{label : 'Operaciones'}} 
                                input={{ 
                                    placeholder : 'Operaciones', 
                                    onChange : (e) => setSelectedMultiple(e, 'HORECA_TYPES'),
                                    name : 'HORECA_TYPES',
                                    options : types,
                                    defaultValue : selectedOption,
                                    value : selectedOption,
                                    isMulti : true,
                                    closeMenuOnSelect : false,
                                }}
                                errors = {errors.parts}
                                zIndex={1090}
                            />
                        </Col>
                        <Col sm="6">
                            <FloatingInput 
                                label={{label : 'Precio Kw'}} 
                                input={{placeholder : 'Precio Kw', name : 'HORECA_KW_PRICE', value : data.extra['HORECA_KW_PRICE'], onChange : handleChangeExtra, type : 'number'}} 
                                errors = {errors.HORECA_KW_PRICE}
                            />
                        </Col>
                        <Col sm="6">
                            <FloatingInput 
                                label={{label : 'Potencia dispensador Kw'}} 
                                input={{placeholder : 'Potencia Kw', name : 'HORECA_KW_DISPENCER', value : data.extra['HORECA_KW_DISPENCER'], onChange : handleChangeExtra, type : 'number'}} 
                                errors = {errors.HORECA_KW_DISPENCER}
                            />
                        </Col>
                        <Col sm="6">
                            <FloatingInput 
                                label={{label : 'Potencia lavavajilla Kw'}} 
                                input={{placeholder : 'Potencia Kw', name : 'HORECA_KW_DISHWASHER', value : data.extra['HORECA_KW_DISHWASHER'], onChange : handleChangeExtra, type : 'number'}} 
                                errors = {errors.HORECA_KW_DISHWASHER}
                            />
                        </Col>
                        <Col sm="6">
                            <FloatingInput 
                                label={{label : 'Coste de m3 de agua (€)'}} 
                                input={{placeholder : 'Coste', name : 'HORECA_LTS_PRICE', value : data.extra['HORECA_LTS_PRICE'], onChange : handleChangeExtra, type : 'number'}} 
                                errors = {errors.HORECA_LTS_PRICE}
                            />
                        </Col>
                    </Row>
                    }

                    { /* CALC DATA  */ }
                    {openedTab == 1 &&
                    <Row>
                        <Col sm="8">
                            <Row>
                                <Col sm="6">
                                    <FloatingInput 
                                        label={{label : 'Servicios por día'}} 
                                        input={{placeholder : 'Cantidad', name : 'services', value : data.services, onChange : handleChange, type : 'number'}} 
                                        errors = {errors.services}
                                    />
                                </Col>
                                <Col sm="6"></Col>
                                    {[1, 2].map((item, index) => {
                                    return (
                                        <Col sm="6" className="mt-4">
                                            <Row>
                                                <Col xs="8">
                                                    <h6 className="ms-1">Consumo {item}</h6>
                                                </Col>
                                                {item == 2 &&
                                                <Col xs="4" className="d-md-none text-end" onClick={() => setHideCons2(!hideCons2)}>
                                                    <i className={hideCons2 ? 'fa fa-angle-right' : 'fa fa-angle-down'}></i>
                                                </Col>
                                                }
                                            </Row>
                                            <Row className={ item == 2 && hideCons2 ? 'd-none d-sm-block' : '' }>
                                                <Col sm="12">
                                                    <Select 
                                                        label={{label : 'Frequencia'}} 
                                                        input={{ 
                                                            placeholder : 'Frequencia', 
                                                            onChange : setSelected,
                                                            name : 'freq_' + item,
                                                            options : freqs,
                                                            defaultValue : item == 1 ? selectedFreq1 : selectedFreq2,
                                                        }}
                                                        errors = {item == 1 ? errors.freq_1 : errors.freq_2}
                                                    />
                                                </Col>
                                                <Col sm="12">
                                                    <FloatingInput 
                                                        label={{label : 'Cajas'}} 
                                                        input={{placeholder : 'Cajas', name : 'boxes' + item, value : data['boxes' + item], onChange : handleChange, type : 'number'}} 
                                                        errors = {item == 1 ? errors.boxes1 : errors.boxes2}
                                                    />
                                                </Col>
                                                <Col sm="12">
                                                    <FloatingInput 
                                                        label={{label : 'Botellas por caja'}} 
                                                        input={{placeholder : 'Botellas', name : 'bottles' + item, value : data['bottles' + item], onChange : handleChange, type : 'number'}} 
                                                        errors = {item == 1 ? errors.bottles1 : errors.bottles2}
                                                    />
                                                </Col>
                                                <Col sm="12">
                                                    <FloatingInput 
                                                        label={{label : 'Capacidad botella (L)'}} 
                                                        input={{placeholder : 'Capacidad', name : 'capacity' + item, value : data['capacity' + item], onChange : handleChange, type : 'number'}} 
                                                        errors = {item == 1 ? errors.capacity1 : errors.capacit2}
                                                    />
                                                </Col>
                                                <Col sm="12">
                                                    <FloatingInput 
                                                        label={{label : 'Coste por Botella'}} 
                                                        input={{placeholder : 'Coste', name : 'cost' + item, value : data['cost' + item], onChange : handleChange, type : 'number'}} 
                                                        errors = {item == 1 ? errors.cost1 : errors.cost2}
                                                    />
                                                </Col>
                                            </Row>
                                        </Col>
                                    )
                                    })}
                            </Row>
                        </Col>
                        <Col sm="4">
                            <Row>
                                <Col sm="12">
                                    <div className="alert alert-success outline-2x fade show shadow rounded-4">
                                        <h6 class="text-center">Botellas por día de {data.capacity1 ?? 0}L</h6>
                                        <h4 class="text-center"><span className="counter"><CountUp end={calcData.bd1 ?? 0} /></span></h4>
                                    </div>
                                </Col>
                                {data.capacity2 &&
                                <Col sm="12">
                                    <div className="alert alert-success outline-2x fade show shadow rounded-4">
                                        <h6 class="text-center">Botellas al dia de {data.capacity2 ?? 0}L</h6>
                                        <h4 class="text-center"><span className="counter"><CountUp end={calcData.bd2 ?? 0} /></span></h4>
                                    </div>
                                </Col>
                                }
                                <Col sm="12">
                                    <div className="alert alert-success outline-2x fade show shadow rounded-4">
                                        <h6 class="text-center">Coste Mensual</h6>
                                        <h4 class="text-center"><span className="counter">{}<CountUp decimals={2} end={(calcData.monthCost ?? 0)} />€</span></h4>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    }

                    { /* CALC DATA  */ }
                    {openedTab == 2 &&
                    <Row>
                        <Col sm="12">
                            <Row>
                                <Col sm="4">
                                    <Select 
                                        label={{label : 'Con Gas'}} 
                                        input={{ 
                                            placeholder : 'Si / No', 
                                            onChange : setSelected,
                                            name : 'gas',
                                            options : yesNo,
                                            defaultValue : selectedGas
                                        }}
                                        errors = {errors.freq_1}
                                        zIndex={2000}
                                    />
                                </Col>
                                <Col sm="4">
                                    <Select 
                                        label={{label : 'Predosificación'}} 
                                        input={{ 
                                            placeholder : 'Si / No', 
                                            onChange : setSelected,
                                            name : 'predo',
                                            options : predosingData,
                                            defaultValue : selectedPredo
                                        }}
                                        errors = {errors.freq_1}
                                        zIndex={1090}
                                    />
                                </Col>
                                <Col sm="4">
                                    <Select 
                                        label={{label : 'Cuotas'}} 
                                        input={{ 
                                            placeholder : 'Cuotas', 
                                            onChange : setSelected,
                                            name : 'due',
                                            options : dues,
                                            defaultValue : selectedOptionDu,
                                        }}
                                        errors = {errors.dues}
                                        zIndex={1089}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col sm="12" className="mt-2">
                            <Row>
                                {calcData.product &&
                                <Col sm="12">
                                    <div className="alert alert-success fade show shadow rounded-4">
                                        <h6>{calcData.product.final_name ?? ''}</h6>
                                    </div>
                                </Col>
                                }
                                <Col sm="8">
                                    <Row>
                                        {calcData.product &&
                                        <Col sm="6">
                                            <div className="alert alert-success outline-2x fade show shadow rounded-4 ">
                                                <h6>Cuota Mensual</h6>
                                                <h4><span className="counter"><CountUp decimals={2} end={(calcData.productCost ?? 0)} />€</span></h4>
                                            </div>
                                        </Col>
                                        }
                                        <Col sm="6">
                                            <div className="alert alert-success outline-2x fade show shadow rounded-4">
                                                <h6>Coste Mensual</h6>
                                                <h4><span className="counter"><CountUp decimals={2} end={(calcData.monthCost ?? 0)} />€</span></h4>
                                            </div>
                                        </Col>
                                        <Col sm="6">
                                            <div className="alert alert-success outline-2x fade show shadow rounded-4 ">
                                                <h6>Coste botella de {data.capacity1 ?? 0}L</h6>
                                                <h4><span className="counter"><CountUp decimals={2} end={(calcData.cost1 ?? 0)} />€</span></h4>
                                            </div>
                                        </Col>
                                        {calcData.gasCost1 != 0 &&
                                        <Col sm="6">
                                            <div className="alert alert-success outline-2x fade show shadow rounded-4">
                                                <h6>Coste botella c/ gas</h6>
                                                <h4><span className="counter"><CountUp decimals={2} end={(calcData.gasCost1 ?? 0)} />€</span></h4>
                                            </div>
                                        </Col>
                                        }
                                        {data.capacity2 &&
                                        <>
                                            <Col sm="6">
                                                <div className="alert alert-success outline-2x fade show shadow rounded-4">
                                                    <h6>Coste botella de {data.capacity2 ?? 0}L</h6>
                                                    <h4><span className="counter"><CountUp decimals={2} end={(calcData.cost2 ?? 0)} />€</span></h4>
                                                </div>
                                            </Col>
                                            {calcData.gasCost2 != 0 &&
                                            <Col sm="6">
                                                <div className="alert alert-success outline-2x fade show shadow rounded-4">
                                                    <h6>Coste botella c/ gas</h6>
                                                    <h4><span className="counter"><CountUp decimals={2} end={(calcData.gasCost2 ?? 0)} />€</span></h4>
                                                </div>
                                            </Col>
                                            }
                                        </>
                                        }
                                    </Row>
                                </Col>
                                <Col sm="4">
                                    <Row>
                                        {data.extra.HORECA_TYPES.indexOf('1') !== -1 &&
                                        <>
                                            <Col sm="12">
                                                <div className="alert bg-primary outline-2x fade show shadow rounded-4 ">
                                                    <h6>Ahorro Mensual</h6>
                                                    <h4><span className="counter"><CountUp decimals={2} end={(calcData.saving ?? 0)} />€</span></h4>
                                                </div>
                                            </Col>
                                            <Col sm="12">
                                                <div className="alert bg-primary outline-2x fade show shadow rounded-4">
                                                    <h6>Ahorro Anual</h6>
                                                    <h4><span className="counter"><CountUp decimals={2} end={(calcData.saving ?? 0) * 12} />€</span></h4>
                                                </div>
                                            </Col>
                                        </>
                                        }
                                        {(data.extra.HORECA_TYPES.indexOf('0') !== -1 || data.extra.HORECA_TYPES.indexOf('2') !== -1) &&
                                        <>
                                            <Col sm="12">
                                                <div className="alert bg-primary outline-2x fade show shadow rounded-4">
                                                    <h6>Amortización en el mes</h6>
                                                    <h4><span className="counter"><CountUp end={(calcData.amortization ?? 0)} /></span></h4>
                                                </div>
                                            </Col>
                                        </>
                                        }
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    }
                </ModalBody>
                <ModalFooter>
                    {(openedTab == 0 || openedTab == 1) &&
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: () => processData(), disabled : processing}}>
                        {openedTab == 0 ? 'Guardar' : 'Siguiente'}
                    </Btn>
                    }
                    {(openedTab == 2 && data.due && data.gas && data.predo) &&
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: () => processData(), disabled : processing}}>Generar</Btn>
                    }
                    {(openedTab == 2 || openedTab == 0) &&
                    <Btn attrBtn={{ color: 'primary', onClick: () => setOpenedTab(1), disabled : processing}}>Volver</Btn>
                    }
                </ModalFooter>
            </Modal>

            <Modal isOpen={modalCreate} toggle={togglemodalCreate} className="mainModal" centered>
                <ModalHeader toggle={togglemodalCreate}>Generar Propuesta</ModalHeader>
                <ModalBody>
                    <Select 
                        label={{label : 'Cliente'}} 
                        input={{ 
                            placeholder : 'Cliente', 
                            onChange : setSelected,
                            name : 'client_id',
                            options : clients,
                            defaultValue : selectedOptionCl,
                        }}
                        errors = {errors.client_id}
                        zIndex={1080}
                    />
                    <Select 
                        label={{label : 'Extra'}} 
                        input={{ 
                            placeholder : 'Extra', 
                            onChange : setSelected,
                            name : 'extra_id',
                            options : extras,
                            defaultValue : selectedOptionEx,
                        }}
                        errors = {errors.extra_id}
                        zIndex={1075}
                    />
                    <FloatingInput 
                        label={{label : 'Notas'}} 
                        input={{placeholder : 'Notas', name : 'notes', value : data.notes, onChange : handleChange}} 
                        errors = {errors.notes}
                    />
                </ModalBody>
                <ModalFooter>
                    {data.product_id != 0 &&
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: () => generate(), disabled : processing}}>Generar</Btn>
                    }
                    <Btn attrBtn={{ color: 'primary', onClick: () => togglemodalCreate(), disabled : processing}}>Cerrar</Btn>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default HorecaCalc;