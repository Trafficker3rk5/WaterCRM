import React, { Fragment, useState, useEffect, useRef } from 'react';
import { PlusSquare } from 'react-feather';
import { toast } from 'react-toastify';
import { H4, H6, LI, P, UL, Image, Btn } from '../../AbstractElements';
import { CardBody, CardHeader, Input, Media, Modal, ModalHeader, ModalBody, ModalFooter, Col, Row } from 'reactstrap';
import { useForm, router } from '@inertiajs/react';
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Switch from '@/Template/CommonElements/Switch';


const AddAddress = (props) => {
    const [modal, setModal] = useState(props.isOpen);
    const [modalTitle, setModalTitle] = useState(props.title);
    const toggle = () => props.closeModal();

    const handleChangeSwitch = (key) => {
        setData(key, !data[key]);
    }

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        id: props.address.id ?? '',
        name: props.address.name ?? '',
        contact_name: props.address.contact_name ?? '',
        contact_phone: props.address.contact_phone ?? '',
        full_address: props.address.full_address ?? '',
        street: props.address.street ?? '',
        number: props.address.number ?? '',
        door: props.address.door ?? '',
        urb: props.address.urb ?? '',
        postal_code: props.address.postal_code ?? '',
        city: props.address.city ?? '',
        province: props.address.province ?? '',
        country: props.address.country ?? '',
        notes: props.address.notes ?? '',
        lat: props.address.lat ?? '',
        long: props.address.long ?? '',
        principal: props.address.principal ?? false,
        billing: props.address.billing ?? false,
    });

    const setMainData = (address) => {
        setData({
            id: address.id ?? '',
            name: address.name ?? '',
            contact_name: address.contact_name ?? '',
            contact_phone: address.contact_phone ?? '',
            full_address: address.full_address ?? '',
            street: address.street ?? '',
            number: address.number ?? '',
            door: address.door ?? '',
            urb: address.urb ?? '',
            postal_code: address.postal_code ?? '',
            city: address.city ?? '',
            province: address.province ?? '',
            country: address.country ?? '',
            notes: address.notes ?? '',
            lat: address.lat ?? '',
            long: address.long ?? '',
            principal: address.principal ?? false,
            billing: address.billing ?? false,
        });
    }

    useEffect(() => {
        setModal(props.isOpen);
        setModalTitle(props.title);
        reset();
        setMainData(props.address);

        setTimeout(function () {
            let options = {
                componentRestrictions: { country: "es" }
            };
            let addressInput = document.getElementById('full_address');
            let autocomplete = new google.maps.places.Autocomplete(addressInput, options);

            autocomplete.addListener('place_changed', function () {
                let place = autocomplete.getPlace();

                let province = '', city = '', postal_code = '', number = '', street = '', country = '';
                place.address_components.forEach((component) => {
                    if (component.types.includes('administrative_area_level_1')) {
                        province = component.long_name;
                    } else if (component.types.includes('locality')) {
                        city = component.long_name;
                    } else if (component.types.includes('postal_code')) {
                        postal_code = component.long_name;
                    } else if (component.types.includes('street_number')) {
                        number = component.long_name;
                    } else if (component.types.includes('route')) {
                        street = component.long_name;
                    } else if (component.types.includes('country')) {
                        country = component.long_name;
                    }
                });

                setData(data => ({
                    ...data,
                    full_address: place.formatted_address,
                    street: street,
                    number: number,
                    city: city,
                    province: province,
                    postal_code: postal_code,
                    country: country,
                    lat: place.geometry.location.lat(),
                    long: place.geometry.location.lng()
                }));

                marker.setVisible(false);

                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);
                }
                marker.setPosition(place.geometry.location);
                marker.setVisible(true);
            });

            var myLatlng = new google.maps.LatLng(data.lat, data.long);
            var mapOptions = { zoom: 15, center: myLatlng }
            let map = new google.maps.Map(document.getElementById("map"), mapOptions);
            const marker = new google.maps.Marker({
                map,
                anchorPoint: new google.maps.Point(0, -29),
            });
            if (data.lat && data.long) marker.setPosition(myLatlng);

            google.maps.event.addListener(map, 'click', function (event) {
                marker.setPosition(event.latLng);
                map.setCenter(event.latLng);
                setData(data => ({
                    ...data,
                    lat: event.latLng.lat(),
                    long: event.latLng.lng()
                }));
            });
        }, 2000);

    }, [props.isOpen]);

    const handleChange = (e) => {
        const key = e.target.name;
        const value = e.target.value;
        setData(data => ({ ...data, [key]: value }))
    }

    const saveForm = () => {
        post(route('address.validate'), {
            preserveScroll: true,
            onSuccess: () => {
                props.setAddress(data);
                toggle();
            }
        });
    }

    return (
        <Modal isOpen={modal} toggle={toggle} id="addAddressModal" className="mainModal" centered size="xl" zIndex={2100}>
            <ModalHeader toggle={toggle}>{modalTitle}</ModalHeader>
            <ModalBody>
                <Row>
                    <Col xs='12' sm='12' md='8'>
                        <Row>
                            <Col xs='12' sm='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Alias' }}
                                    input={{ placeholder: 'Alias', name: 'name', value: data.name, onChange: handleChange, required: true }}
                                    errors={errors.name}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Contacto' }}
                                    input={{ placeholder: 'Contacto', name: 'contact_name', value: data.contact_name, onChange: handleChange }}
                                    errors={errors.contact_name}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'Teléfono' }}
                                    input={{ placeholder: 'Teléfono', name: 'contact_phone', value: data.contact_phone, onChange: handleChange }}
                                    errors={errors.contact_phone}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='12'>
                                <div className="m-5  form-floating">
                                    <input placeholder="Dirección Completa" id="full_address" name="full_address" className="form-control" value={data.full_address} onChange={handleChange} />
                                    <label>Dirección Completa</label>
                                </div>
                            </Col>
                            <Col xs='12' sm='12' md='6'>
                                <FloatingInput
                                    label={{ label: 'Calle' }}
                                    input={{ placeholder: 'Calle', name: 'street', value: data.street, onChange: handleChange }}
                                    errors={errors.street}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='2'>
                                <FloatingInput
                                    label={{ label: 'N.' }}
                                    input={{ placeholder: 'N.', name: 'number', value: data.number, onChange: handleChange }}
                                    errors={errors.number}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='2'>
                                <FloatingInput
                                    label={{ label: 'Puerta' }}
                                    input={{ placeholder: 'Puerta', name: 'door', value: data.door, onChange: handleChange }}
                                    errors={errors.door}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='2'>
                                <FloatingInput
                                    label={{ label: 'Urb' }}
                                    input={{ placeholder: 'Urb', name: 'urb', value: data.urb, onChange: handleChange }}
                                    errors={errors.urb}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='4'>
                                <FloatingInput
                                    label={{ label: 'País' }}
                                    input={{ placeholder: 'País', name: 'country', value: data.country, onChange: handleChange }}
                                    errors={errors.country}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='3'>
                                <FloatingInput
                                    label={{ label: 'Provincia' }}
                                    input={{ placeholder: 'Provincia', name: 'province', value: data.province, onChange: handleChange }}
                                    errors={errors.province}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='3'>
                                <FloatingInput
                                    label={{ label: 'Población' }}
                                    input={{ placeholder: 'Población', name: 'city', value: data.city, onChange: handleChange }}
                                    errors={errors.city}
                                />
                            </Col>
                            <Col xs='12' sm='12' md='2'>
                                <FloatingInput
                                    label={{ label: 'CP' }}
                                    input={{ placeholder: 'CP', name: 'postal_code', value: data.postal_code, onChange: handleChange }}
                                    errors={errors.postal_code}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <Switch
                                    label={'Principal'}
                                    input={{ onChange: () => handleChangeSwitch('principal'), name: 'principal', checked: data.principal }}
                                    errors={errors.principal}
                                />
                            </Col>
                            <Col xs='12' md='4'>
                                <Switch
                                    label={'Facturación'}
                                    input={{ onChange: () => handleChangeSwitch('billing'), name: 'billing', checked: data.billing }}
                                    errors={errors.billing}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col xs='12' sm='12' md='4'>
                        <Row>
                            <Col xs='12' sm='12' md='12'>
                                <H6>Ubicación</H6>
                            </Col>
                            <Col xs='12' sm='12' md='12'>
                                <div id="map" style={{ height: '300px', width: '100%' }}></div>
                            </Col>
                            <Col xs='12' sm='12' md='12'>
                                <FloatingInput
                                    label={{ label: 'Notas' }}
                                    input={{ placeholder: 'Notas', name: 'notes', value: data.notes, onChange: handleChange, as: 'textarea' }}
                                    errors={errors.notes}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggle }} >Cerrar</Btn>
                <Btn attrBtn={{ color: 'primary save-btn', onClick: saveForm, disabled: processing }}>Guardar</Btn>
            </ModalFooter>
        </Modal>
    );
};

export default AddAddress;