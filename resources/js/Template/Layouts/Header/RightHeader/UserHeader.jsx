import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User } from 'react-feather';
import man from '../../../../../assets/images/dashboard/profile.png';
import { Link, router } from '@inertiajs/react'

import { LI, UL, Image, P } from '../../../AbstractElements';
import CustomizerContext from '../../../_helper/Customizer';
import { useSelector } from 'react-redux'

const UserHeader = () => {
  const actualUser = useSelector((state) => state.auth.value);
  const history = useNavigate();
  const [profile, setProfile] = useState('');
  const [name, setName] = useState('Emay Walter');
  const { layoutURL } = useContext(CustomizerContext);
  const authenticated = JSON.parse(localStorage.getItem('authenticated'));
  const auth0_profile = actualUser.avatar_url ?? profile;

  useEffect(() => {
    setProfile(localStorage.getItem('profileURL') || man);
    setName(localStorage.getItem('Name') ? localStorage.getItem('Name') : name);
  }, []);

  const Logout = () => {
    console.log('Logout===========');
    router.post(route('logout'));
  };

  const UserMenuRedirect = (redirect) => {
    history(redirect);
  };

  return (
    <li className='profile-nav onhover-dropdown pe-0 py-0'>
      <div className='media profile-media'>
        <Image
          attrImage={{
            className: 'b-r-10 m-0',
            src: `${auth0_profile}`,
            style: {height: '35px' }, 
            alt: '',
          }}
        />
        <div className='media-body'>
          <span>{actualUser.name}</span>
          <P attrPara={{ className: 'mb-0 font-roboto' }}>
          {actualUser.rol_name} <i className='middle fa fa-angle-down'></i>
          </P>
        </div>
      </div>
      <UL attrUL={{ className: 'simple-list profile-dropdown onhover-show-div' }}>
        <LI>
          <User />
          <Link href={route('users.profile')}>
            <span>Mis Datos </span>
          </Link> 
        </LI>
        <LI attrLI={{ onClick: Logout }}>
          <LogIn />
          <span>Salir</span>
        </LI>
      </UL>
    </li>
  );
};

export default UserHeader;
