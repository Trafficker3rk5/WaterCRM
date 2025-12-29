import React, {Fragment, useState} from 'react';
import { Plus }  from 'react-feather';
import { ToolTip } from '../../AbstractElements';

const AddBtn = (props) => {
  const [tooltip, setTooltip] = useState(false);
  const toggle = () => setTooltip(!tooltip);

  return (
    <Fragment>
      <button id={'Tooltip-add'} className={'add-btn btn-pill btn-air-primary btn btn-outline-primary btn-lg'} {...props}>
        <Plus size={30}/>
      </button>
      <ToolTip
            attrToolTip={{ placement:'left', 
            isOpen:tooltip, 
            target:'Tooltip-add', 
            toggle:toggle }} >
        Agregar
        </ToolTip>
    </Fragment>
  );
};

export default AddBtn;