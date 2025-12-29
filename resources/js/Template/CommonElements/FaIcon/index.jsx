import React, {Fragment, useState} from 'react';
import { ToolTip } from '../../AbstractElements';

const FaIcon = (props) => {
  const [tooltip, setTooltip] = useState(false);
  const toggle = () => setTooltip(!tooltip);

  return (
    <Fragment>
      <i {...props} className={`text-primary ${ props.icon } ${ props.className }`} style={{fontSize : 20}}></i>
      {props.tooltip &&
      <ToolTip attrToolTip={{ placement:'left', isOpen:tooltip, target: props.id, toggle:toggle }}>
        {props.tooltip}
      </ToolTip>
      }
    </Fragment>
  );
};

export default FaIcon;