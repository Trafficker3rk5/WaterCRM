import React, {Fragment, useState} from 'react';
import { ToolTip } from '../../AbstractElements';
import { Trash2 as TrashBtn }  from 'react-feather';

const Trash = (props) => {
  const [tooltip, setTooltip] = useState(false);
  const toggle = () => setTooltip(!tooltip);
  return (
    <Fragment>
      <TrashBtn {...props} className="text-danger" size={20}/>
      <ToolTip attrToolTip={{ placement:'left', isOpen:tooltip, target: props.id, toggle:toggle }}>
        Eliminar
      </ToolTip>
    </Fragment>
  );
};

export default Trash;