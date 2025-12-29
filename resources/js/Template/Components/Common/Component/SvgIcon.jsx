import React from 'react';

const SvgIcon = (props) => {
  const { iconId, ...res } = props;
  return (
    <svg {...res}>
      <use xlinkHref={'/storage/sprite.svg' + '#' + iconId}></use>
    </svg>
  );
};

export default SvgIcon;
