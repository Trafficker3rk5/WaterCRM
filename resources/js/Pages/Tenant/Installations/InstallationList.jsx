import React, { Fragment, useState, useEffect, useContext } from "react";
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import axios from "axios";
import AddBtn from '@/Template/CommonElements/AddBtn';
import MainDataContext from '@/Template/_helper/MainData';
import Icon from '@/Template/CommonElements/Icon';
import { Modal, ModalBody, ModalFooter, ModalHeader, Form, Badge, Row, Col } from "reactstrap";
import FloatingInput from "@/Template/CommonElements/FloatingInput";
import Select from '@/Template/CommonElements/Select';
import Trash from "@/Template/CommonElements/Trash";
import Address from "@/Template/Components/Address";
import Phone from "@/Template/CommonElements/Phone";
import Email from "@/Template/CommonElements/Email";
import FilterTable from "@/Template/Components/FilterTable";

export default function InstallationList({ auth, title, pending, tecnics, clients, products, isInstallation, filters, filtered }) {
    const [dataList, setDataList] = useState([]);
    const { handleDelete, deleteCounter } = useContext(MainDataContext);
    const [selectedOptionTc, setSelectedOptionTc] = useState(null);
    const [selectedOptionCl, setSelectedOptionCl] = useState(null);
    const [selectedOptionAd, setSelectedOptionAd] = useState(null);
    const [selectedOptionPr, setSelectedOptionPr] = useState(null);
    const [addressList, setAddressList] = useState([]);
    const [hideTecnic, setHideTecnic] = useState(false);
    const [modal, setModal] = useState(false);
    const toggleModal = () => setModal(!modal);
    const [modalAction, setmodalAction] = useState(false);
    const [modalActionTitle, setModalActionTitle] = useState('');
    const toggleModalAction = () => setmodalAction(!modalAction);
    const [modalHistory, setModalHistory] = useState(false);
    const toggleModalHistory = () => setModalHistory(!modalHistory);
    const [historyList, setHistoryList] = useState([]);

    console.log('🔍 InstallationList - Pending value:', pending);
    console.log('🔍 InstallationList - Title:', title);
    console.log('🔍 InstallationList - Is Installation:', isInstallation);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id: 0
    });

    const handleChange = (e) => {
        setData(data => ({ ...data, [e.target.name]: e.target.value }));
    }

    const setSelected = (selected, evt) => {
        if (!selected) return; // Add null check
        
        if (evt.name == 'client_id') {
            setSelectedOptionCl(selected);
            setAddressList(selected.addresses || []);
            setSelectedOptionAd(null);
            setData(data => ({ ...data, address_id: null, [evt.name]: selected.value }));
        } else {
            if (evt.name == 'assigned_to') setSelectedOptionTc(selected);
            if (evt.name == 'address_id') setSelectedOptionAd(selected);
            if (evt.name == 'product_id') setSelectedOptionPr(selected);
            setData(data => ({ ...data, [evt.name]: selected.value }))
        }
    }

    const getInstallations = async (d = {}) => {
        try {
            const params = {
                pending: pending,
                ...d
            };
            
            console.log('🔄 Fetching installations with params:', params);
            
            const response = await axios.post(
                isInstallation ? route('installations.list') : route('maintenances.list'), 
                params
            );
            
            // Add null checks for the data
            const safeData = Array.isArray(response.data) ? response.data : [];
            setDataList(safeData);
            
            console.log('✅ Received installations:', safeData.length);
        } catch (error) {
            console.error('❌ Error fetching installations:', error);
            setDataList([]); // Set empty array on error
        }
    }

    const getHistory = async (id) => {
        try {
            const response = await axios.get(route('installations.notes', id));
            setHistoryList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching history:', error);
            setHistoryList([]);
        }
    }

    const addNotes = async () => {
        let id = data.id;
        toggleModalAction();
        clearErrors();
        reset();
        setData(data => ({ ...data, id: id, status: 0 }));
        setModalActionTitle('Agregar Notas a la ');
    }

    const assignForm = async () => {
        post(route(data.id == 0 ? 'installations.create' : 'installations.assign'), {
            onSuccess: (y) => {
                getInstallations();
                toggleModal();
            }
        });
    }

    const actionForm = async () => {
        post(route('installations.notes.store', data.id), {
            onSuccess: (y) => {
                if (data.status != 0) getInstallations();
                else getHistory(data.id);
                toggleModalAction();
            },
            onError: (y) => {
                console.log(y);
            }
        });
    }

    useEffect(() => {
        console.log('🎯 useEffect triggered - Pending:', pending, 'Filtered:', filtered);
        getInstallations(filtered);
        if (modalHistory) getHistory(data.id);
    }, [deleteCounter, pending]);

    useEffect(() => {
        console.log('🔄 Pending value changed to:', pending);
        getInstallations(filtered);
    }, [pending]);

    const tableColumns = [
        {
            name: 'Cliente',
            selector: (row) => {
                // Add null checks for client data
                const clientData = row?.['client_data'] || {};
                return (
                    <>
                        <div>{clientData?.company_name || 'N/A'}</div>
                        <div className="small text-muted">
                            <Phone client={clientData} /><br />
                            <Email client={clientData} />
                        </div>
                    </>
                )
            },
            sortable: true,
            center: false,
        },
        {
            name: 'Dirección',
            selector: (row) => {
                // Add null check for address
                const address = row?.['address'] || {};
                return <Address address={address} />
            },
            sortable: true,
            center: false,
        },
        {
            name: 'Producto',
            selector: row => {
                // Add comprehensive null checks for product data
                const product = row?.['product'] || {};
                const productName = product?.final_name || 'Producto no disponible';
                const innerStock = product?.inner_stock ?? 0;
                const innerStockMin = product?.inner_stock_min ?? 0;
                const status = row?.['status'] ?? -1;
                
                return (
                    <>
                        {innerStock == 0 && <Badge color="danger" className="me-1">Sin Stock</Badge>}
                        {(isInstallation && status == 0) &&
                            <>
                                {(innerStock > 0) &&
                                    <Badge color={innerStockMin <= innerStock ? 'success' : 'warning'} className="me-1">{innerStock}</Badge>}
                            </>
                        }
                        {productName}
                    </>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "250px"
        },
        {
            name: 'Fecha',
            selector: row => row?.['installation_date'] || 'N/A',
            sortable: true,
            center: false,
            maxWidth: "150px"
        },
        {
            name: 'Estado',
            selector: (row) => {
                const status = row?.['status'] ?? -1;
                return (
                    <>
                        {status == 0 && <Badge color="warning">Pendiente</Badge>}
                        {status == 1 && <Badge color="success">Finalizado</Badge>}
                        {status == 2 && <Badge color="danger">Rechazado</Badge>}
                        {status == 3 && <Badge color="info">Pospuesto</Badge>}
                        {status == -1 && <Badge color="secondary">Desconocido</Badge>}
                    </>
                )
            },
            sortable: true,
            center: false,
            maxWidth: "120px"
        },
        {
            name: 'Acciones',
            selector: (row) => {
                // Add null checks for row data
                if (!row) return null;
                
                const rowId = row?.id;
                const assignedTo = row?.['assigned_to'];
                const installationDate = row?.['installation_date'];
                const status = row?.['status'] ?? -1;
                const enabled = row?.['enabled'] ?? false;
                
                if (!rowId) return null;

                return (
                    <>
                        {!assignedTo || !installationDate ?
                            <Icon
                                icon={!assignedTo ? 'UserPlus' : 'Clock'}
                                id={'accept-' + rowId}
                                tooltip="Asignar"
                                onClick={() => {
                                    toggleModal();
                                    clearErrors();
                                    reset();
                                    if (assignedTo) {
                                        setData(data => ({ ...data, assigned_to: assignedTo, id: rowId }));
                                        setHideTecnic(true);
                                    } else {
                                        setHideTecnic(false);
                                        setData(data => ({ ...data, id: rowId }));
                                    }
                                }}
                                className="text-success"
                            />
                            :
                            <>
                                <Icon
                                    icon="MessageSquare"
                                    id={'message-' + rowId}
                                    tooltip="Mensajes"
                                    className="me-1"
                                    onClick={() => {
                                        toggleModalHistory();
                                        clearErrors();
                                        reset();
                                        setData(data => ({ ...data, id: rowId }));
                                        getHistory(rowId);
                                    }}
                                />
                                {status != 2 && status != 1 &&
                                    <>
                                        <Icon
                                            icon="Clock"
                                            id={'clock-' + rowId}
                                            tooltip="Posponer"
                                            onClick={() => {
                                                toggleModalAction();
                                                clearErrors();
                                                reset();
                                                setData(data => ({ ...data, id: rowId, status: 3 }));
                                                setModalActionTitle('Posponer');
                                            }}
                                        />
                                        <Icon
                                            icon="X" id={'reject-' + rowId}
                                            tooltip="Rechazar"
                                            className="text-danger"
                                            onClick={() => {
                                                toggleModalAction();
                                                clearErrors();
                                                reset();
                                                setData(data => ({ ...data, id: rowId, status: 2 }));
                                                setModalActionTitle('Rechazar');
                                            }}
                                        />
                                        {enabled &&
                                            <Icon icon="Tool"
                                                id={'accept-' + rowId}
                                                tooltip="Instalar"
                                                className="text-success"
                                                onClick={() => router.visit(route(isInstallation ? 'installations.edit' : 'maintenances.edit', [rowId]))}
                                            />
                                        }
                                    </>
                                }
                                {status == 1 &&
                                    <Icon
                                        icon="Eye"
                                        id={'see-' + rowId}
                                        tooltip="Ver Detalles"
                                        className="text-success"
                                        onClick={() => router.visit(route(isInstallation ? 'installations.show' : 'maintenances.edit', [rowId]))}
                                    />
                                }
                            </>
                        }
                    </>
                )
            },
            sortable: false,
            center: true,
            maxWidth: "140px"
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />
            <Fragment>
                <Breadcrumbs mainTitle={title} title={title} />

                <FilterTable
                    dataList={dataList}
                    tableColumns={tableColumns}
                    filters={filters}
                    getList={(d) => getInstallations(d)}
                />

                {isInstallation &&
                    <AddBtn
                        onClick={() => {
                            toggleModal();
                            clearErrors();
                            reset();
                            setHideTecnic(false);
                            setData(data => ({ ...data, id: 0 }));
                        }}
                    />
                }
            </Fragment>

            <Modal isOpen={modal} toggle={toggleModal} className="mainModal" centered>
                <ModalHeader toggle={toggleModal}>{data.id == 0 ? 'Agregar Instalación' : 'Asignar Instalador'}</ModalHeader>
                <ModalBody>
                    <Form className='theme-form'>
                        <Row>
                            {data.id == 0 &&
                                <>
                                    <Col md={12}>
                                        <Select
                                            label={{ label: 'Producto' }}
                                            input={{
                                                placeholder: 'Producto',
                                                onChange: setSelected,
                                                name: 'product_id',
                                                options: products || [],
                                                defaultValue: selectedOptionPr,
                                            }}
                                            errors={errors.product_id}
                                            zIndex={1006}
                                        />
                                    </Col>
                                    <Col md={12}>
                                        <Select
                                            label={{ label: 'Cliente' }}
                                            input={{
                                                placeholder: 'Cliente',
                                                onChange: setSelected,
                                                name: 'client_id',
                                                options: clients || [],
                                                defaultValue: selectedOptionCl,
                                            }}
                                            errors={errors.client_id}
                                            zIndex={1005}
                                        />
                                    </Col>
                                    <Col md={12}>
                                        <Select
                                            label={{ label: 'Direción' }}
                                            input={{
                                                placeholder: 'Direción',
                                                onChange: setSelected,
                                                name: 'address_id',
                                                options: addressList,
                                                defaultValue: selectedOptionAd,
                                            }}
                                            errors={errors.client_id}
                                            zIndex={1004}
                                        />
                                    </Col>
                                </>
                            }
                            {!hideTecnic &&
                                <Col md={12}>
                                    <Select
                                        label={{ label: 'Técnico Asignado' }}
                                        input={{
                                            placeholder: 'Técnico',
                                            onChange: setSelected,
                                            name: 'assigned_to',
                                            options: tecnics || [],
                                            defaultValue: selectedOptionTc,
                                        }}
                                        errors={errors.assigned_to}
                                        zIndex={1003}
                                    />
                                </Col>
                            }
                            <Col md={6}>
                                <FloatingInput
                                    label={{ label: 'Fecha y Hora' }}
                                    input={{
                                        placeholder: 'Fecha y Hora',
                                        onChange: handleChange,
                                        name: 'installation_date',
                                        value: data.installation_date,
                                        type: 'datetime-local'
                                    }}
                                    errors={errors.installation_date}
                                />
                            </Col>
                            <Col md={6}>
                                <FloatingInput
                                    label={{ label: 'Horas' }}
                                    input={{
                                        placeholder: 'Horas',
                                        onChange: handleChange,
                                        name: 'hours',
                                        value: data.hours,
                                        type: 'number'
                                    }}
                                    errors={errors.hours}
                                />
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggleModal }} >Cerrar</Btn>
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: assignForm, disabled: processing }}>Guardar</Btn>
                </ModalFooter>
            </Modal>

            <Modal isOpen={modalAction} toggle={toggleModalAction} className="mainModal" centered>
                <ModalHeader toggle={toggleModalAction}>{modalActionTitle} Instalación</ModalHeader>
                <ModalBody>
                    <Form className='theme-form'>
                        {data.status == 3 &&
                            <FloatingInput
                                label={{ label: 'Nueva Fecha y Hora' }}
                                input={{
                                    placeholder: 'Motivo',
                                    onChange: handleChange,
                                    name: 'new_date',
                                    value: data.new_date,
                                    type: 'datetime-local'
                                }}
                                errors={errors.new_date}
                            />
                        }
                        <FloatingInput
                            label={{ label: 'Motivo' }}
                            input={{
                                placeholder: 'Motivo',
                                onChange: handleChange,
                                name: 'notes',
                                value: data.notes,
                                as: 'textarea'
                            }}
                            errors={errors.notes}
                        />
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggleModalAction }} >Cerrar</Btn>
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: actionForm, disabled: processing }}>Guardar</Btn>
                </ModalFooter>
            </Modal>

            <Modal isOpen={modalHistory} toggle={toggleModalHistory} className="mainModal" centered size="lg">
                <ModalHeader toggle={toggleModalHistory}>Notas de la Instalación</ModalHeader>
                <ModalBody>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Usuario</th>
                                <th>Notas</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(historyList) && historyList.map((item, index) => (
                                <tr key={index}>
                                    <td>{item?.created_date || 'N/A'}</td>
                                    <td>
                                        {item?.status == 2 && <Badge color="danger">Rechazado</Badge>}
                                        {item?.status == 3 && <Badge color="info">Pospuesto</Badge>}
                                        {(!item?.status || (item.status !== 2 && item.status !== 3)) && <Badge color="secondary">Nota</Badge>}
                                    </td>
                                    <td>{item?.user_name || 'N/A'}</td>
                                    <td>{item?.notes || 'Sin notas'}</td>
                                    <td>
                                        {item?.status == 0 &&
                                            <Trash onClick={() => handleDelete(route('installations.notes.destroy', item.id))} id={'delete-' + item.id} />
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ModalBody>
                <ModalFooter>
                    <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggleModalHistory }} >Cerrar</Btn>
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: addNotes, disabled: processing }}>Agregar Notas</Btn>
                </ModalFooter>
            </Modal>

        </AuthenticatedLayout>
    )
}