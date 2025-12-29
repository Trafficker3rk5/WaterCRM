import React, { useState, useEffect } from 'react';

/**
 * Configurable Table Component
 *
 * Permite mostrar/ocultar columnas dinámicamente y guarda la configuración en localStorage
 *
 * @param {Array} columns - Definición de columnas: [{ key: 'name', label: 'Nombre', visible: true, sortable: true }]
 * @param {Array} data - Datos a mostrar
 * @param {String} tableId - ID único para guardar configuración en localStorage
 * @param {Function} renderCell - Función para renderizar celdas: (row, column) => JSX
 * @param {Object} actions - Acciones por fila: { label, onClick, icon, className }
 */
export default function ConfigurableTable({
    columns,
    data,
    tableId,
    renderCell,
    actions = null,
    onSort = null,
    emptyMessage = 'No hay datos disponibles'
}) {
    const [visibleColumns, setVisibleColumns] = useState({});
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Load saved column configuration from localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem(`table_config_${tableId}`);
        if (savedConfig) {
            setVisibleColumns(JSON.parse(savedConfig));
        } else {
            // Initialize with default visibility
            const initialConfig = {};
            columns.forEach(col => {
                initialConfig[col.key] = col.visible !== false;
            });
            setVisibleColumns(initialConfig);
        }
    }, [tableId, columns]);

    // Save column configuration to localStorage
    const saveColumnConfig = (newConfig) => {
        setVisibleColumns(newConfig);
        localStorage.setItem(`table_config_${tableId}`, JSON.stringify(newConfig));
    };

    // Toggle column visibility
    const toggleColumn = (columnKey) => {
        const newConfig = {
            ...visibleColumns,
            [columnKey]: !visibleColumns[columnKey]
        };
        saveColumnConfig(newConfig);
    };

    // Select/Deselect all columns
    const toggleAllColumns = (visible) => {
        const newConfig = {};
        columns.forEach(col => {
            newConfig[col.key] = visible;
        });
        saveColumnConfig(newConfig);
    };

    // Handle sorting
    const handleSort = (columnKey) => {
        if (!onSort) return;

        const direction = sortConfig.key === columnKey && sortConfig.direction === 'asc'
            ? 'desc'
            : 'asc';

        setSortConfig({ key: columnKey, direction });
        onSort(columnKey, direction);
    };

    // Get visible columns
    const getVisibleColumns = () => {
        return columns.filter(col => visibleColumns[col.key]);
    };

    // Count visible columns
    const visibleCount = getVisibleColumns().length;
    const totalCount = columns.length;

    return (
        <div className="configurable-table">
            {/* Table Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted small">
                    Mostrando {visibleCount} de {totalCount} columnas
                </div>
                <div className="btn-group">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        onClick={() => setShowColumnSelector(!showColumnSelector)}
                    >
                        <i className="fa fa-columns me-1"></i>
                        Columnas
                    </button>
                </div>
            </div>

            {/* Column Selector Dropdown */}
            {showColumnSelector && (
                <div className="card mb-3 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Seleccionar Columnas</h6>
                            <div className="btn-group btn-group-sm">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => toggleAllColumns(true)}
                                >
                                    Todas
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => toggleAllColumns(false)}
                                >
                                    Ninguna
                                </button>
                            </div>
                        </div>
                        <div className="row">
                            {columns.map(column => (
                                <div key={column.key} className="col-md-4 col-sm-6 mb-2">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`col_${column.key}`}
                                            checked={visibleColumns[column.key] || false}
                                            onChange={() => toggleColumn(column.key)}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor={`col_${column.key}`}
                                        >
                                            {column.label}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-light">
                        <tr>
                            {getVisibleColumns().map(column => (
                                <th
                                    key={column.key}
                                    style={{
                                        cursor: column.sortable ? 'pointer' : 'default',
                                        width: column.width || 'auto'
                                    }}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span>{column.label}</span>
                                        {column.sortable && (
                                            <i className={`fa fa-sort${
                                                sortConfig.key === column.key
                                                    ? (sortConfig.direction === 'asc' ? '-up' : '-down')
                                                    : ''
                                            } ms-1 text-muted`}></i>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="text-end">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleCount + (actions ? 1 : 0)}
                                    className="text-center text-muted py-4"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr key={row.id || index}>
                                    {getVisibleColumns().map(column => (
                                        <td key={column.key}>
                                            {renderCell ? renderCell(row, column) : row[column.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="text-end">
                                            <div className="btn-group btn-group-sm">
                                                {Array.isArray(actions) ? (
                                                    actions.map((action, idx) => (
                                                        <button
                                                            key={idx}
                                                            className={action.className || 'btn btn-outline-primary'}
                                                            onClick={() => action.onClick(row)}
                                                            title={action.label}
                                                        >
                                                            {action.icon && <i className={`fa ${action.icon}`}></i>}
                                                            {!action.icon && action.label}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <button
                                                        className={actions.className || 'btn btn-outline-primary'}
                                                        onClick={() => actions.onClick(row)}
                                                    >
                                                        {actions.icon && <i className={`fa ${actions.icon}`}></i>}
                                                        {!actions.icon && actions.label}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Info */}
            {data.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="text-muted small">
                        Mostrando {data.length} registro{data.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-muted small">
                        {visibleCount} columna{visibleCount !== 1 ? 's' : ''} visible{visibleCount !== 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
}
