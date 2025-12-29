import React, {Fragment, useState} from 'react';
import { Edit as EditBtn }  from 'react-feather';
import { ToolTip } from '../../AbstractElements';

const Edit = (props) => {
  const [tooltip, setTooltip] = useState(false);
  const toggle = () => setTooltip(!tooltip);

  return (
    <Fragment>
      <EditBtn {...props} className="text-primary" size={20}/>
      <ToolTip attrToolTip={{ placement:'left', isOpen:tooltip, target: props.id, toggle:toggle }}>
        Editar
      </ToolTip>
    </Fragment>
  );
};

export default Edit;