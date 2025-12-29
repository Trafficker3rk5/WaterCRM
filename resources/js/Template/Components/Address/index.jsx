import React, { useState, useEffect } from 'react';
import { Btn } from '../../AbstractElements';
import { Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import Icon from '@/Template/CommonElements/Icon';



const Address = (props) => {
    const [mapHref, setMapHref] = useState('');
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    const showMap = () => {
        
        let map;
        let marker;
        let lat = props.address.lat;
        let lng = props.address.long;
        let latLng = new google.maps.LatLng(lat, lng);
        map = new google.maps.Map(document.getElementById('map'), {
            center: latLng,
            zoom: 15,
            url: "http://www.google.com",
        });
        marker = new google.maps.Marker({
            position: latLng,
            map: map
        });

        
    }

    useEffect(() => {
        let lat = props.address.lat;
        let lng = props.address.long;
        setMapHref(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    }, []);

    return (
        <>
            <div> 
                <a target='_blank' href={mapHref} style={{ top : '2px', position: 'relative' }}>
                    <Icon icon="MapPin" id={'Map-' + props.address.id} tooltip="Ver" size={15} />
                </a>
                <span className='ms-1' onClick={toggle}>{props.address.full_address}</span>
            </div>
            <Modal isOpen={modal} toggle={toggle} className="mainModal" centered size="xl" onOpened={showMap}>
                <ModalHeader toggle={toggle}>{props.address.full_address}</ModalHeader>
                <ModalBody>
                    <div id="map" style={{height : '500px', width : '100%'}}></div>
                </ModalBody>
                <ModalFooter>
                    <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: toggle }} >Cerrar</Btn>
                    <a target='_blank' href={mapHref}>Ver en Maps</a>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default Address;