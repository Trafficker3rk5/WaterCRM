import React, { Fragment, useState } from 'react';
import UserHeader from './UserHeader';
import { UL } from '../../../AbstractElements';
import { Col } from 'reactstrap';
import HorecaCalc from '@/Template/Components/HorecaCalc';
import SvgIcon from '@/Template/Components/Common/Component/SvgIcon';
import { Link } from '@inertiajs/react';
import { useSelector } from 'react-redux'

const RightHeader = () => {
  const actualUser = useSelector((state) => state.auth.value);
  const [modalHoreca, setModalHoreca] = useState(false);
  const toggleModalHoreca = () => setModalHoreca(!modalHoreca);

  return (
    <Fragment>
      <Col xxl='7' xl='6' md='7' className='nav-right pull-right right-header col-8 p-0 ms-auto'>
        {/* <Col md="8"> */}
        <UL attrUL={{ className: 'simple-list nav-menus flex-row' }}>
          {/*}
          <Searchbar />
          <Notificationbar />
          */}
          {actualUser && actualUser.is_tenant &&
          <li className='profile-nav white'>
            <SvgIcon iconId='calculator' style={{ stroke : 'none', width : '25px', height : '25px' }} tooltip="Calculadora HORECA" onClick={toggleModalHoreca} />
          </li>
          }
          {actualUser && actualUser.is_tenant && actualUser.rol_id !== undefined && [0,1,2,3,4,5,6].includes(actualUser.rol_id) &&
          <li className='profile-nav white'>
            <Link href="/calculator" title="Calculadora Ahorro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                <line x1="8" y1="6" x2="16" y2="6"/>
                <line x1="8" y1="10" x2="16" y2="10"/>
                <line x1="8" y1="14" x2="16" y2="14"/>
                <line x1="8" y1="18" x2="16" y2="18"/>
              </svg>
            </Link>
          </li>
          }
          <UserHeader />
        </UL>
        {/* </Col> */}
      </Col>

      {actualUser && actualUser.is_tenant &&
      <HorecaCalc modal={modalHoreca} onClose={toggleModalHoreca} />
      }

    </Fragment>
  );
};

export default RightHeader;
