import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';


const SimpleImage = (props) => {
    const [file, setFile] = useState(props.image ?? '');

    const handleChange = (e) => {
        setFile(URL.createObjectURL(e.target.files[0]));
        props.input.onChange(e);
    }

    return (
        <>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>{...props.label.label ?? ''}</Form.Label>
                <br />
                <Image width={200} src={file} rounded fluid />
                <Form.Control type="file" {...props.input} onChange={handleChange}/>
            </Form.Group>            
            {props.errors && <span className="text-danger m-5">{props.errors}</span>}
        </>
    );
};

export default SimpleImage;