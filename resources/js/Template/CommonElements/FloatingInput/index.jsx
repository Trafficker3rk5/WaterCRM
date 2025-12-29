import React from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';

const FloatingInput = (props) => {
  return (
    <>
        <FloatingLabel
            {...props.label ?? ''}
            className={`m-5 ${ props.label.className ?? '' }`}>
            <Form.Control {...props.input} />
        </FloatingLabel>
        {props.errors && <span className="text-danger m-5">{props.errors}</span>}
    </>
  );
};

export default FloatingInput;