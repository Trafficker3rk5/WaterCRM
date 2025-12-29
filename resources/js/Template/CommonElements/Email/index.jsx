import React from 'react';

const Email = (props) => {
  let email = props.client?.email ? props.client.email : (props.email ? props.email : '');
  return (
    <>
      <a href={`mailto:${email}`}>{email}</a>
    </>
  );
};

export default Email;