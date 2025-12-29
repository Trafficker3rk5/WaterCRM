import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import waas from "../../../../assets/images/logo/waas.png"
import CustomizerContext from '../../_helper/Customizer';

const SidebarIcon = () => {
  const { layoutURL } = useContext(CustomizerContext);
  return (
    <div className="logo-icon-wrapper">
      <Link to={`/dashboard/default/${layoutURL}`}>
        <img
          className="img-fluid"
          src={waas}
          alt=""
        />
      </Link>
    </div>
  );
};

export default SidebarIcon;