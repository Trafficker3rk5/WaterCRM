import React from 'react';

const Phone = (props) => {
  let phone = props.client?.phone ? props.client.phone : (props.phone ? props.phone : '');
  return (
    <>
      <a href={`tel:${phone}`}>{phone}</a>
    </>
  );
};

export default Phone;