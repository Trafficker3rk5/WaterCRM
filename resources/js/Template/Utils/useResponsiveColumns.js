import { useState, useEffect, useRef } from 'react';

/**
 * Hook to filter table columns based on screen size
 * @param {Array} columns - Array of column definitions
 * @param {Object} options - Configuration options
 * @param {Array} options.hideOnTablet - Array of column names to hide on tablet (768px - 1499px)
 * @param {Array} options.hideOnMobile - Array of column names to hide on mobile (< 768px)
 * @param {Array} options.hideOnDesktop - Array of column names to hide on desktop (> 1024px)
 * @returns {Array} Filtered columns array
 */
export const useResponsiveColumns = (columns, options = {}) => {
    const { hideOnTablet = [], hideOnMobile = [], hideOnDesktop = [] } = options;
    
    // Store options in ref to avoid dependency issues
    const optionsRef = useRef({ hideOnTablet, hideOnMobile, hideOnDesktop });
    optionsRef.current = { hideOnTablet, hideOnMobile, hideOnDesktop };
    
    // Ensure columns is always an array
    const safeColumns = Array.isArray(columns) ? columns : [];
    
    // Get initial screen size
    const getInitialScreenSize = () => {
        if (typeof window === 'undefined') return 'desktop';
        try {
            const width = window.innerWidth;
            if (width < 768) return 'mobile';
            if (width >= 768 && width < 1500) return 'tablet';
            return 'desktop';
        } catch (e) {
            return 'desktop';
        }
    };
    
    const initialScreenSize = getInitialScreenSize();
    const [screenSize, setScreenSize] = useState(initialScreenSize);
    
    // Helper function to filter columns based on screen size
    const filterColumnsBySize = (cols, size, opts) => {
        if (!Array.isArray(cols) || cols.length === 0) {
            return cols;
        }
        
        let columnsToHide = [];
        
        switch (size) {
            case 'mobile':
                columnsToHide = opts.hideOnMobile || [];
                break;
            case 'tablet':
                columnsToHide = opts.hideOnTablet || [];
                break;
            case 'desktop':
                columnsToHide = opts.hideOnDesktop || [];
                break;
            default:
                columnsToHide = [];
        }
        
        if (columnsToHide.length === 0) {
            return cols;
        }
        
        return cols.filter(column => {
            if (!column) return false;
            if (column.name && columnsToHide.includes(column.name)) {
                return false;
            }
            if (column.id && columnsToHide.includes(column.id)) {
                return false;
            }
            return true;
        });
    };
    
    // Initialize with filtered columns - ensure we always return an array
    const [filteredColumns, setFilteredColumns] = useState(() => {
        try {
            const filtered = filterColumnsBySize(safeColumns, initialScreenSize, optionsRef.current);
            return Array.isArray(filtered) ? filtered : safeColumns;
        } catch (e) {
            return safeColumns;
        }
    });

    // Update screen size on resize
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const updateScreenSize = () => {
            try {
                const width = window.innerWidth;
                let newSize = 'desktop';
                if (width < 768) {
                    newSize = 'mobile';
                } else if (width >= 768 && width < 1500) {
                    newSize = 'tablet';
                }
                setScreenSize(prevSize => {
                    if (prevSize !== newSize) {
                        return newSize;
                    }
                    return prevSize;
                });
            } catch (e) {
                // Ignore errors
            }
        };

        // Set initial screen size
        updateScreenSize();

        // Add event listener with debounce
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(updateScreenSize, 100);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    // Update filtered columns when screen size or columns change
    useEffect(() => {
        try {
            const filtered = filterColumnsBySize(safeColumns, screenSize, optionsRef.current);
            setFilteredColumns(Array.isArray(filtered) ? filtered : safeColumns);
        } catch (e) {
            // On error, return original columns
            setFilteredColumns(safeColumns);
        }
    }, [safeColumns, screenSize]); // Simplified dependencies - options are accessed via ref

    // Always return an array
    return Array.isArray(filteredColumns) ? filteredColumns : safeColumns;
};

/**
 * Utility function to filter columns (non-hook version for use outside components)
 * @param {Array} columns - Array of column definitions
 * @param {Object} options - Configuration options
 * @returns {Array} Filtered columns array
 */
export const filterColumnsByScreenSize = (columns, options = {}) => {
    const { hideOnTablet = [], hideOnMobile = [], hideOnDesktop = [] } = options;
    
    if (typeof window === 'undefined') {
        return columns; // SSR fallback
    }

    const width = window.innerWidth;
    let columnsToHide = [];

    if (width < 768) {
        columnsToHide = hideOnMobile;
    } else if (width >= 768 && width < 1500) {
        columnsToHide = hideOnTablet;
    } else {
        columnsToHide = hideOnDesktop;
    }

    return columns.filter(column => {
        if (column.name && columnsToHide.includes(column.name)) {
            return false;
        }
        if (column.id && columnsToHide.includes(column.id)) {
            return false;
        }
        return true;
    });
};

export default useResponsiveColumns;

