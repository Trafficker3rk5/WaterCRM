import React, { useState, useEffect } from 'react';
import wass from '../../../assets/images/logo/waas.png';

export default function ApplicationLogo({ src, className, ...props }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError && imgSrc !== wass) {
            setHasError(true);
            setImgSrc(wass);
        }
    };

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    return (
        <img 
            {...props}
            src={imgSrc || wass}
            className={className}
            style={{maxWidth: '100px'}}
            onError={handleError}
            alt="Logo"
        />
    );
}
