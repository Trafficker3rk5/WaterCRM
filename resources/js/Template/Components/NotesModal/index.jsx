import React, { useState, useEffect } from "react";
import { Btn } from "../../../Template/AbstractElements";
import { useForm } from '@inertiajs/react';
import axios from "axios";
import { Modal, ModalBody, ModalFooter, ModalHeader, Form} from "reactstrap";
import FloatingInput from "@/Template/CommonElements/FloatingInput";
import Trash from "@/Template/CommonElements/Trash";

const NotesModal = (props) => {
    const [modalHistory, setModalHistory] = useState(props.modal);
    const toggleModalHistory = () => {
        setModalHistory(!modalHistory);
        if (modalHistory) props.onClose();
    }
    const [historyList, setHistoryList] = useState([]);

    const [modalAction, setmodalAction] = useState(false);
    const toggleModalAction = () => setmodalAction(!modalAction);

    const { data, setData, post, processing, errors, reset, clearErrors} = useForm({
        id : 0,
        type : 0,
        type_id : 0,
        notes : '',
        extra_int : 0,
        extra_string : '',
    }); 

    const handleChange = (e) => {
        setData(data => ({...data, [e.target.name]: e.target.value}));
    }

    const getHistory = async () => {
        const response = await axios.get(route('notes.list', [props.type, props.id]));
        setHistoryList(response.data);
    }

    const addNotes = async () => {
        toggleModalAction(); 
        clearErrors();
        reset();
        setData(data => ({...data, type: props.type, type_id: props.id}));
    }

    const actionForm = async () => {
        post(route('notes.store'),{
                onSuccess: (y) => {
                    getHistory();
                    toggleModalAction();
                },
                onError: (y) => {
                    console.log(y);
                }
            }
        );
    }

    useEffect(() => {
        getHistory();
        setData(data => ({...data, type: props.type, type_id: props.id}));
        setModalHistory(props.modal);
    }, [props.modal]);

    return (
        <>
            <Modal isOpen={modalHistory} toggle={toggleModalHistory} className="mainModal" centered size="lg">
                <ModalHeader toggle={toggleModalHistory}>Notas</ModalHeader>
                <ModalBody>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Usuario</th>
                                <th>Notas</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyList.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.created_date}</td>
                                    <td>{item.user_name}</td>
                                    <td>{item.notes}</td>
                                    <td>
                                        {item.status == 0 &&
                                        <Trash onClick={() => handleDelete(route('notes.destroy', item.id))} id={'delete-notes-' + item.id}/>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ModalBody>
                <ModalFooter>
                    <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggleModalHistory }} >Cerrar</Btn>
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: addNotes, disabled : processing}}>Agregar Notas</Btn>
                </ModalFooter>
            </Modal>

            <Modal isOpen={modalAction} toggle={toggleModalAction} className="mainModal" centered>
                <ModalHeader toggle={toggleModalAction}>Agregar Notas</ModalHeader>
                <ModalBody>
                    <Form className='theme-form'>
                        <FloatingInput 
                            label={{label : 'Notas'}} 
                            input={{ 
                                placeholder : 'Notas', 
                                onChange : handleChange,
                                name : 'notes',
                                value : data.notes,
                                as : 'textarea'
                            }}
                            errors = {errors.notes}
                        />
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggleModalAction }} >Cerrar</Btn>
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: actionForm, disabled : processing}}>Guardar</Btn>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default NotesModal;