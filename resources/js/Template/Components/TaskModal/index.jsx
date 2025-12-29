import React, { Fragment, useState, useEffect, useContext } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Form, Badge, Row, Col } from 'reactstrap';
import { Breadcrumbs, Btn } from "../../../Template/AbstractElements";
import { Head, router, useForm } from '@inertiajs/react';
import axios from "axios";
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';
import { useSelector } from 'react-redux'

const TaskModal = (props) => {
    const actualUser = useSelector((state) => state.auth.value);
    const [assignedName, setAssignedName] = useState('');

    const [types, setTypes] = useState([]);
    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [appreciations, setAppreciations] = useState([]);
    const [showData, setShowData] = useState(false);
    const [fixedClient, setFixedClient] = useState(0);
    const [modal, setModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Agregar Tarea');
    const toggle = () => {
        setModal(!modal);
        if (modal) props.onClose();
    }

    const [modalEnd, setModalEnd] = useState(false);
    const toggleEnd = () => setModalEnd(!modalEnd);

    const { getTasks, onClose } = props;

    const [selectedOptionUs, setSelectedOptionUs] = useState(null);
    const [selectedOptionCl, setSelectedOptionCl] = useState(null);
    const [selectedOptionTy, setSelectedOptionCTy] = useState(null);
    const [selectedOptionAp, setSelectedOptionApp] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id: 0,
        assigned_to: '',
        date: '',
        date_end: '',
        title: '',
        description: '',
        client_id: '',
        type_id: '',
        appreciation_id: '',
    });

    const handleEdit = async (id, show) => {
        const response = await axios.get(route('tasks.edit', id));
        if (response.data) {
            setShowData(show);
            reset();
            clearErrors();
            toggle();
            setModalTitle((show ? 'Ver' : 'Editar') + ' Tarea');
            setData({
                id: response.data.task.id,
                assigned_to: response.data.task.assigned_to,
                date: response.data.task.date,
                date_end: response.data.task.date_end,
                title: response.data.task.title,
                description: response.data.task.description,
                client_id: response.data.task.client_id,
                type_id: response.data.task.type_id,
                appreciation_id: response.data.task.appreciation_id
            });
            setTypes(response.data.types);
            setUsers(response.data.users);
            setClients(response.data.clients);
            setAppreciations(response.data.appreciations);


            setSelectedOptionUs(users.find(user => user.value == response.data.task.assigned_to));
            setSelectedOptionCl(clients.find(client => client.value == response.data.task.client_id));
            setSelectedOptionCTy(types.find(type => type.value == response.data.task.type_id));
        }
    };

    const handleAdd = async () => {
        setShowData(false);
        reset();
        clearErrors();
        setModalTitle('Agregar Tarea');
        toggle();
        const response = await axios.get(route('tasks.edit', 0));
        if (response.data) {
            setTypes(response.data.types);
            setUsers(response.data.users);
            setClients(response.data.clients);
            setAppreciations(response.data.appreciations);
        }
    };

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    const setSelected = (selected, evt) => {

        if (evt.name == 'client_id') setSelectedOptionCl(selected);
        if (evt.name == 'assigned_to') setSelectedOptionUs(selected);
        if (evt.name == 'type_id') setSelectedOptionCTy(selected);
        if (evt.name == 'appreciation_id') setSelectedOptionApp(selected);
        setData(data => ({ ...data, [evt.name]: selected.value }))
    }

    const saveForm = async () => {
        post(
            route('tasks.store'),
            {
                onSuccess: (y) => {
                    getTasks();
                    toggle();
                },
                onError: (errors) => {
                    console.log(errors);
                }
            }
        );
    };

    const setStatus = async (status) => {
        setData({ ...data, status: status });
        router.post(route('tasks.status', data.id), { status: status },
            {
                onSuccess: (y) => {
                    getTasks();
                    if (modalEnd) toggleEnd();
                    toggle();
                },
                onError: (errors) => {
                    console.log(errors);
                }
            }
        );
    };

    useEffect(() => {
        if (props.action == 0) handleAdd();
        if (props.action == 1) handleEdit(props.taskId, false);
        if (props.action == 2) handleEdit(props.taskId, true);
        if (props.fixedClient) {
            setFixedClient(props.fixedClient);
            setData({ ...data, client_id: props.fixedClient });
        }

        if (actualUser.rol_id == 4) {
            setAssignedName(actualUser.name);
            setData(data => ({ ...data, ['assigned_to']: actualUser.id }));
        }
    }, [props.action]);



    return (
        <>
            <Modal isOpen={modal} toggle={toggle} id="addTaskModal" className="mainModal" centered>
                <ModalHeader toggle={toggle}>{modalTitle}</ModalHeader>
                <ModalBody>
                    <Form className='theme-form'>
                        <Row>
                            <Col md={12}>
                                <FloatingInput
                                    label={{ label: 'Título' }}
                                    input={{
                                        placeholder: 'Título',
                                        onChange: handleChange,
                                        name: 'title',
                                        value: data.title,
                                        readOnly: showData,
                                        className: showData ? 'input-disabled' : ''
                                    }}
                                    errors={errors.title}
                                />
                            </Col>
                            <Col md={6}>
                                <Select
                                    label={{ label: 'Tipo de Tarea' }}
                                    input={{
                                        placeholder: 'Tipo',
                                        onChange: setSelected,
                                        name: 'type_id',
                                        options: types,
                                        defaultValue: selectedOptionTy,
                                    }}
                                    errors={errors.type_id}
                                    readOnly={showData}
                                    zIndex={1010}
                                />
                            </Col>
                            <Col md={6}>
                                {actualUser.rol_id != 4 ?
                                    <Select
                                        label={{ label: 'Asignado a' }}
                                        input={{
                                            placeholder: 'Asignado a',
                                            onChange: setSelected,
                                            name: 'assigned_to',
                                            options: users,
                                            defaultValue: selectedOptionUs,
                                        }}
                                        errors={errors.assigned_to}
                                        readOnly={showData}
                                        zIndex={1010}
                                    />
                                    :
                                    <FloatingInput
                                        label={{ label: 'Asignado A' }}
                                        input={{ placeholder: 'Asignado A', name: 'assigned_to', value: assignedName, readOnly: true, className: 'input-disabled' }}
                                    />
                                }

                            </Col>
                            {fixedClient == 0 &&
                                <Col md={12}>
                                    <Select
                                        label={{ label: 'Cliente' }}
                                        input={{
                                            placeholder: 'Cliente',
                                            onChange: setSelected,
                                            name: 'client_id',
                                            options: clients,
                                            defaultValue: selectedOptionCl,
                                        }}
                                        errors={errors.client_id}
                                        readOnly={showData}
                                    />
                                </Col>
                            }
                            <Col md={6}>
                                <FloatingInput
                                    label={{ label: 'Fecha y Hora' }}
                                    input={{
                                        placeholder: 'Fecha y Hora',
                                        onChange: handleChange,
                                        name: 'date',
                                        value: data.date,
                                        type: 'datetime-local',
                                        readOnly: showData,
                                        className: showData ? 'input-disabled' : ''
                                    }}
                                    errors={errors.date}
                                />
                            </Col>
                            <Col md={6}>
                                <FloatingInput
                                    label={{ label: 'Fecha y Hora Finalización' }}
                                    input={{
                                        placeholder: 'Fecha y Hora',
                                        onChange: handleChange,
                                        name: 'date_end',
                                        value: data.date_end,
                                        type: 'datetime-local',
                                        readOnly: showData,
                                        className: showData ? 'input-disabled' : ''
                                    }}
                                    errors={errors.date_end}
                                />
                            </Col>
                            <Col md={12}>
                                <FloatingInput
                                    label={{ label: 'Descripción' }}
                                    input={{
                                        placeholder: 'Descripción',
                                        onChange: handleChange,
                                        name: 'description',
                                        value: data.description,
                                        as: 'textarea',
                                        readOnly: showData,
                                        className: showData ? 'input-disabled' : ''
                                    }}
                                    errors={errors.description}
                                />
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    {!showData ?
                        <>
                            <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggle }} >Cerrar</Btn>
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled: processing }}>Guardar</Btn>
                        </>
                        :
                        <>
                            <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: () => setStatus(2), disabled: processing }}>Cancelar Tarea</Btn>
                            <Btn attrBtn={{ color: 'primary save-btn', onClick: () => toggleEnd(), disabled: processing }}>Finalizar Tarea</Btn>
                            <Btn attrBtn={{ color: 'primary', onClick: () => props.showNotes(), disabled: processing }}>Notas</Btn>
                        </>
                    }
                </ModalFooter>
            </Modal>

            <Modal isOpen={modalEnd} toggle={toggleEnd} id="addTaskModalEnd" className="mainModal" centered>
                <ModalHeader toggle={toggleEnd}>Finalizar Tarea</ModalHeader>
                <ModalBody>
                    <Form className='theme-form'>
                        <Row>
                            <Col md={12}>
                                <Select
                                    label={{ label: 'Apreciación' }}
                                    input={{
                                        placeholder: 'Apreciación',
                                        onChange: setSelected,
                                        name: 'appreciation_id',
                                        options: appreciations,
                                        defaultValue: selectedOptionAp,
                                    }}
                                    errors={errors.appreciation_id}
                                    zIndex={1030}
                                />
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggleEnd }} >Cerrar</Btn>
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: () => setStatus(1), disabled: processing }}>Finalizar Tarea</Btn>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default TaskModal;