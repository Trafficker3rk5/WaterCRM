import React, {Fragment, useState} from 'react';
import * as IconFeather from "react-feather";
import { ToolTip } from '../../AbstractElements';

const Icon = (props) => {
  const [tooltip, setTooltip] = useState(false);
  const toggle = () => setTooltip(!tooltip);

  const MyIcon = IconFeather[props.icon];

  return (
    <Fragment>
      <MyIcon {...props} className={`text-primary ${ props.className }`}  size={props.size ? props.size : 20} />
      {props.tooltip &&
      <ToolTip attrToolTip={{ placement:'left', isOpen:tooltip, target: props.id, toggle:toggle }}>
        {props.tooltip}
      </ToolTip>
      }
    </Fragment>
  );
};

export default Icon;