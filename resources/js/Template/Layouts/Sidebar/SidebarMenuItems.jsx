import React, { Fragment, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react'
import SvgIcon from '../../Components/Common/Component/SvgIcon';
import CustomizerContext from '../../_helper/Customizer';
import { MENUITEMS, MENUITEMS_TENANT } from '../Sidebar/Menu';
import { useSelector } from 'react-redux'

const SidebarMenuItems = ({ setMainMenu, sidebartoogle, setNavActive, activeClass }) => {
  const { layout } = useContext(CustomizerContext);
  const [isHidden, setIsHidden] = useState(false);
  const layout1 = localStorage.getItem('sidebar_layout') || layout;

  const id = window.location.pathname.split('/').pop();
  const layoutId = id;
  const CurrentPath = window.location.pathname;
  const actualUser = useSelector((state) => state.auth.value);
  const ITEMS = actualUser.is_tenant ? MENUITEMS_TENANT : MENUITEMS;
  

  useEffect(() => {}, [layoutId, ITEMS, setNavActive]);

  const { t } = useTranslation();
  const toggletNavActive = (item) => {
    if (window.innerWidth <= 991) {
      document.querySelector('.page-header').className = 'page-header close_icon';
      document.querySelector('.sidebar-wrapper').className = 'sidebar-wrapper close_icon ';
      document.querySelector('.mega-menu-container').classList.remove('d-block');
      if (item.type === 'sub') {
        document.querySelector('.page-header').className = 'page-header';
        document.querySelector('.sidebar-wrapper').className = 'sidebar-wrapper';
      }
    }
    if (!item.active) {
      ITEMS.map((a) => {
        a.Items.filter((Items) => {
          if (a.Items.includes(item)) Items.active = false;
          if (!Items.children) return false;
          Items.children.forEach((b) => {
            if (Items.children.includes(item)) {
              b.active = false;
            }
            if (!b.children) return false;
            b.children.forEach((c) => {
              if (b.children.includes(item)) {
                c.active = false;
              }
            });
          });
          return Items;
        });
        return a;
      });
    }
    item.active = !item.active;
    setMainMenu({ mainmenu: ITEMS });
  };

  return (
    <>
      {ITEMS.map((Item, i) => (
        <Fragment key={i}>
          {Item.rols.indexOf(actualUser.rol_id) !== -1 &&
          <li className='sidebar-main-title'>
            <div>
              
              {Item.according ? 
              <>
                <h6 className='lan-1' onClick={() => setIsHidden(!isHidden)}>{t(Item.menutitle)}</h6>
                <div className='according-menu'>{isHidden ? <i className='fa fa-angle-down mt-2 pt-1'></i> : <i className='fa fa-angle-right mt-2 pt-1'></i>}</div>
              </>
              :
              <h6 className='lan-1'>{t(Item.menutitle)}</h6>
              }
            </div>
          </li>
          }
          {Item.Items.map((menuItem, i) => (
              <li className={`sidebar-list ${Item.according && !isHidden ? 'd-none' : ''}`} key={i}>
              {menuItem.type === 'sub' && menuItem.rols.indexOf(actualUser.rol_id) !== -1 ? (
                <Link 
                  href={menuItem.path} 
                  className={`sidebar-link sidebar-title ${CurrentPath.includes(menuItem.title.toLowerCase()) ? 'active' : ''} ${menuItem.active && 'active'}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setNavActive(menuItem);
                    activeClass(menuItem.active);
                  }}>
                  {menuItem.icon === 'activity' ? (
                    <>
                      <svg className='stroke-icon' width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <svg className='fill-icon' width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      <SvgIcon className='stroke-icon' iconId={`stroke-${menuItem.icon}`} />
                      <SvgIcon className='fill-icon' iconId={`fill-${menuItem.icon}`} />
                    </>
                  )}
                  <span>{t(menuItem.title)}</span>
                  {menuItem.badge ? <label className={menuItem.badge}>{menuItem.badgetxt}</label> : ''}
                  <div className='according-menu'>{menuItem.active ? <i className='fa fa-angle-down'></i> : <i className='fa fa-angle-right'></i>}</div>
                </Link>
              ) : (
                ''
              )}

              {menuItem.type === 'link' && menuItem.rols.indexOf(actualUser.rol_id) !== -1 ? (
                <Link href={menuItem.path} className={`sidebar-link sidebar-title link-nav  ${CurrentPath.includes(menuItem.title.toLowerCase()) ? 'active' : ''}`} onClick={() => toggletNavActive(menuItem)}>
                  {menuItem.icon === 'activity' ? (
                    <>
                      <svg className='stroke-icon' width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <svg className='fill-icon' width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : menuItem.icon === 'calculator' ? (
                    <>
                      <svg className='stroke-icon' width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                        <line x1="8" y1="6" x2="16" y2="6"/>
                        <line x1="8" y1="10" x2="16" y2="10"/>
                        <line x1="8" y1="14" x2="16" y2="14"/>
                        <line x1="8" y1="18" x2="16" y2="18"/>
                      </svg>
                      <svg className='fill-icon' width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                        <line x1="8" y1="6" x2="16" y2="6"/>
                        <line x1="8" y1="10" x2="16" y2="10"/>
                        <line x1="8" y1="14" x2="16" y2="14"/>
                        <line x1="8" y1="18" x2="16" y2="18"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      <SvgIcon className='stroke-icon' iconId={`stroke-${menuItem.icon}`} />
                      <SvgIcon className='fill-icon' iconId={`fill-${menuItem.icon}`} />
                    </>
                  )}
                  <span>{t(menuItem.title)}</span>
                  {menuItem.badge ? <label className={menuItem.badge}>{menuItem.badgetxt}</label> : ''}
                </Link>
              ) : (
                ''
              )}

              {menuItem.children ? (
                <ul className='sidebar-submenu' style={layout1 !== 'compact-sidebar compact-small' ? (menuItem?.active || CurrentPath.includes(menuItem?.title?.toLowerCase()) ? (sidebartoogle ? { opacity: 1, transition: 'opacity 500ms ease-in' } : { display: 'block' }) : { display: 'none' }) : { display: 'none' }}>
                  {menuItem.children.map((childrenItem, index) => {
                    return (
                      <li key={index}>
                        {childrenItem.type === 'sub' && childrenItem.rols.indexOf(actualUser.rol_id) !== -1 ? (
                          <Link 
                            href={menuItem.path} 
                            className={`${CurrentPath.includes(childrenItem?.title?.toLowerCase()) ? 'active' : ''}`}
                            // className={`${childrenItem.active ? 'active' : ''}`}
                            onClick={(event) => {
                              event.preventDefault();
                              toggletNavActive(childrenItem);
                            }}>
                            {t(childrenItem.title)}
                            <span className='sub-arrow'>
                              <i className='fa fa-chevron-right'></i>
                            </span>
                            <div className='according-menu'>{childrenItem.active ? <i className='fa fa-angle-down'></i> : <i className='fa fa-angle-right'></i>}</div>
                          </Link>
                        ) : (
                          ''
                        )}

                        {childrenItem.type === 'link' && childrenItem.rols.indexOf(actualUser.rol_id) !== -1 ? (
                          <Link
                            href={childrenItem.path}
                            className={`${CurrentPath.includes(childrenItem?.title?.toLowerCase()) ? 'active' : ''}`}
                            // className={`${childrenItem.active ? 'active' : ''}`} bonusui
                            onClick={() => toggletNavActive(childrenItem)}>
                            {t(childrenItem.title)}
                          </Link>
                        ) : (
                          ''
                        )}

                        {childrenItem.children ? (
                          <ul className='nav-sub-childmenu submenu-content' style={CurrentPath.includes(childrenItem?.title?.toLowerCase()) || childrenItem.active ? { display: 'block' } : { display: 'none' }}>
                            {childrenItem.children.map((childrenSubItem, key) => (
                              <li key={key}>
                                {childrenSubItem.type === 'link' && childrenSubItem.rols.indexOf(actualUser.rol_id) !== -1 ? (
                                  <Link
                                    href={childrenSubItem.path}
                                    className={`${CurrentPath.includes(childrenSubItem?.title?.toLowerCase()) ? 'active' : ''}`}
                                    // className={`${childrenSubItem.active ? 'active' : ''}`}
                                    onClick={() => toggletNavActive(childrenSubItem)}>
                                    {t(childrenSubItem.title)}
                                  </Link>
                                ) : (
                                  ''
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          ''
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                ''
              )}
            </li>
          ))}
        </Fragment>
      ))}
    </>
  );
};

export default SidebarMenuItems;
