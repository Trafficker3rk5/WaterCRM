import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { Link } from '@inertiajs/react';
import { X } from 'react-feather';
import waas from '../../../../assets/images/logo/waas.png';

const SidebarLogo = () => {
  const actualUser = useSelector((state) => state.auth.value);
  const hasCompanyLogo = actualUser?.is_tenant && 
                        actualUser?.company_logo && 
                        actualUser.company_logo.trim() !== '';
  const [logoSrc, setLogoSrc] = useState(
    hasCompanyLogo ? actualUser.company_logo : waas
  );
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 991);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Update logo source when user data changes
    // Check if user is tenant and has a valid company logo (non-empty string)
    const hasCompanyLogo = actualUser?.is_tenant && 
                          actualUser?.company_logo && 
                          actualUser.company_logo.trim() !== '';
    
    const newLogoSrc = hasCompanyLogo ? actualUser.company_logo : waas;
    setLogoSrc(newLogoSrc || waas);
    setHasError(false);
  }, [actualUser?.company_logo, actualUser?.is_tenant]);

  const handleLogoError = () => {
    if (!hasError && logoSrc !== waas) {
      setHasError(true);
      setLogoSrc(waas);
    }
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      document.querySelector('.page-header').className = 'page-header close_icon';
      document.querySelector('.sidebar-wrapper').className = 'sidebar-wrapper close_icon';
      if (document.querySelector('.bg-overlay')) {
        document.querySelector('.bg-overlay').classList.remove('active');
      }
      if (document.querySelector('.bg-overlay1')) {
        document.querySelector('.bg-overlay1').classList.remove('active');
      }
    }
  };

  return (
    <div className='logo-wrapper' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 15px' }}>
      <Link href={actualUser?.is_tenant ? `/` : `/central-dashboard`} style={{ flex: 1 }}>
        <img 
          className="img-fluid d-inline" 
          src={logoSrc || waas} 
          alt="Logo"
          onError={handleLogoError}
          style={{ maxHeight: '50px', maxWidth: '180px', height: 'auto', width: 'auto', objectFit: 'contain' }}
        />
      </Link>
      {isMobile && (
        <button
          onClick={handleCloseSidebar}
          className="close-sidebar-btn"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            marginLeft: '10px'
          }}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
      )}
    </div>
  );
};

export default SidebarLogo;
