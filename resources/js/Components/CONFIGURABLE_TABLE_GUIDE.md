# 📊 Guía del Componente ConfigurableTable

## Descripción

`ConfigurableTable` es un componente React reutilizable que permite crear tablas con columnas configurables. Los usuarios pueden mostrar/ocultar columnas según sus preferencias y la configuración se guarda automáticamente en localStorage.

## Características

✅ **Columnas configurables** - Mostrar/ocultar columnas dinámicamente
✅ **Persistencia** - Configuración guardada en localStorage
✅ **Ordenamiento** - Soporte para columnas ordenables
✅ **Renderizado personalizado** - Función custom para renderizar celdas
✅ **Acciones por fila** - Botones de acción personalizables
✅ **Responsive** - Diseño adaptable
✅ **Estado vacío** - Mensaje personalizable cuando no hay datos

---

## Uso Básico

```jsx
import ConfigurableTable from '@/Components/ConfigurableTable';

function MyComponent({ data }) {
    const columns = [
        { key: 'id', label: 'ID', visible: true, sortable: true },
        { key: 'name', label: 'Nombre', visible: true, sortable: true },
        { key: 'email', label: 'Email', visible: true, sortable: false },
    ];

    return (
        <ConfigurableTable
            columns={columns}
            data={data}
            tableId="my-table"
            renderCell={(row, column) => row[column.key]}
        />
    );
}
```

---

## Props

### `columns` (Array) - Requerido

Define las columnas de la tabla.

```javascript
[
    {
        key: 'name',           // Clave única de la columna
        label: 'Nombre',       // Texto del encabezado
        visible: true,         // Visible por defecto (opcional, default: true)
        sortable: true,        // Permite ordenar (opcional, default: false)
        width: '200px'         // Ancho de la columna (opcional)
    }
]
```

### `data` (Array) - Requerido

Array de objetos con los datos a mostrar.

```javascript
[
    { id: 1, name: 'Juan', email: 'juan@example.com' },
    { id: 2, name: 'María', email: 'maria@example.com' }
]
```

### `tableId` (String) - Requerido

ID único para guardar la configuración en localStorage. Usa un nombre descriptivo.

```javascript
tableId="clients-table"
tableId="products-list"
tableId="invoices-2025"
```

### `renderCell` (Function) - Opcional

Función para renderizar celdas personalizadas. Recibe `(row, column)` y devuelve JSX.

```javascript
renderCell={(row, column) => {
    switch(column.key) {
        case 'status':
            return <span className={`badge ${row.status}`}>{row.status}</span>;
        case 'price':
            return `€${row.price.toFixed(2)}`;
        default:
            return row[column.key];
    }
}}
```

### `actions` (Object | Array) - Opcional

Botones de acción para cada fila.

**Una sola acción:**
```javascript
actions={{
    label: 'Ver',
    icon: 'fa-eye',
    className: 'btn btn-primary',
    onClick: (row) => router.visit(`/items/${row.id}`)
}}
```

**Múltiples acciones:**
```javascript
actions={[
    {
        label: 'Editar',
        icon: 'fa-edit',
        className: 'btn btn-outline-primary',
        onClick: (row) => editItem(row)
    },
    {
        label: 'Eliminar',
        icon: 'fa-trash',
        className: 'btn btn-outline-danger',
        onClick: (row) => deleteItem(row)
    }
]}
```

### `onSort` (Function) - Opcional

Callback cuando se ordena una columna. Recibe `(columnKey, direction)`.

```javascript
onSort={(key, direction) => {
    console.log(`Sorting ${key} ${direction}`);
    // Implementar lógica de ordenamiento
}}
```

### `emptyMessage` (String) - Opcional

Mensaje cuando no hay datos. Default: "No hay datos disponibles"

```javascript
emptyMessage="No se encontraron clientes"
```

---

## Ejemplos Completos

### Ejemplo 1: Tabla Simple

```jsx
import ConfigurableTable from '@/Components/ConfigurableTable';

export default function SimpleTable({ users }) {
    const columns = [
        { key: 'id', label: 'ID', visible: true, sortable: true },
        { key: 'name', label: 'Nombre', visible: true, sortable: true },
        { key: 'email', label: 'Email', visible: true, sortable: true },
        { key: 'role', label: 'Rol', visible: true, sortable: false },
    ];

    return (
        <ConfigurableTable
            columns={columns}
            data={users}
            tableId="users-table"
        />
    );
}
```

### Ejemplo 2: Con Renderizado Personalizado

```jsx
const renderCell = (row, column) => {
    switch (column.key) {
        case 'avatar':
            return (
                <img
                    src={row.avatar}
                    alt={row.name}
                    className="rounded-circle"
                    width="40"
                />
            );

        case 'status':
            const colors = {
                active: 'success',
                pending: 'warning',
                inactive: 'danger'
            };
            return (
                <span className={`badge bg-${colors[row.status]}`}>
                    {row.status}
                </span>
            );

        case 'price':
            return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR'
            }).format(row.price);

        case 'date':
            return new Date(row.date).toLocaleDateString('es-ES');

        default:
            return row[column.key] || '-';
    }
};

<ConfigurableTable
    columns={columns}
    data={products}
    tableId="products-table"
    renderCell={renderCell}
/>
```

### Ejemplo 3: Con Acciones y Ordenamiento

```jsx
const actions = [
    {
        label: 'Ver',
        icon: 'fa-eye',
        className: 'btn btn-sm btn-outline-primary',
        onClick: (row) => router.visit(`/clients/${row.id}`)
    },
    {
        label: 'Editar',
        icon: 'fa-edit',
        className: 'btn btn-sm btn-outline-secondary',
        onClick: (row) => setEditing(row)
    },
    {
        label: 'Eliminar',
        icon: 'fa-trash',
        className: 'btn btn-sm btn-outline-danger',
        onClick: (row) => handleDelete(row)
    }
];

const handleSort = (columnKey, direction) => {
    // Client-side sorting
    const sorted = [...data].sort((a, b) => {
        if (direction === 'asc') {
            return a[columnKey] > b[columnKey] ? 1 : -1;
        } else {
            return a[columnKey] < b[columnKey] ? 1 : -1;
        }
    });
    setData(sorted);

    // O Server-side sorting
    // router.visit(`/clients?sort=${columnKey}&direction=${direction}`);
};

<ConfigurableTable
    columns={columns}
    data={data}
    tableId="clients-table"
    renderCell={renderCell}
    actions={actions}
    onSort={handleSort}
    emptyMessage="No hay clientes disponibles"
/>
```

---

## Características Avanzadas

### Guardar Configuración por Usuario

Si quieres guardar la configuración por usuario (en backend):

```jsx
// Al cambiar configuración
const saveColumnConfig = async (newConfig) => {
    await fetch('/api/user/table-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            table_id: tableId,
            config: newConfig
        })
    });
};
```

### Exportar a CSV/Excel

```jsx
const exportTable = () => {
    const visibleData = data.map(row => {
        const filtered = {};
        getVisibleColumns().forEach(col => {
            filtered[col.label] = row[col.key];
        });
        return filtered;
    });

    // Convertir a CSV
    const csv = convertToCSV(visibleData);
    downloadCSV(csv, 'export.csv');
};
```

### Filtros Avanzados

```jsx
const [filteredData, setFilteredData] = useState(data);

const applyFilter = (filters) => {
    const filtered = data.filter(row => {
        return Object.keys(filters).every(key => {
            if (!filters[key]) return true;
            return row[key]?.toString().toLowerCase().includes(
                filters[key].toLowerCase()
            );
        });
    });
    setFilteredData(filtered);
};

<ConfigurableTable
    data={filteredData}
    // ... other props
/>
```

---

## Estilos Personalizados

El componente usa clases de Bootstrap por defecto, pero puedes personalizarlas:

```css
/* Personalizar selector de columnas */
.configurable-table .form-check {
    padding: 0.5rem;
}

.configurable-table .form-check:hover {
    background-color: #f8f9fa;
}

/* Personalizar tabla */
.configurable-table table {
    font-size: 0.9rem;
}

.configurable-table thead th {
    background-color: #f1f3f5;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
}

/* Personalizar acciones */
.configurable-table .btn-group {
    gap: 0.25rem;
}
```

---

## Tips y Mejores Prácticas

### 1. Nombra tableId de forma única
```javascript
// ❌ Mal
tableId="table"

// ✅ Bien
tableId="clients-main-table-2025"
```

### 2. Marca columnas importantes como visibles por defecto
```javascript
{ key: 'name', label: 'Nombre', visible: true },  // ✅ Siempre visible
{ key: 'notes', label: 'Notas', visible: false }, // Opcional
```

### 3. Limita columnas ordenables a datos simples
```javascript
// ✅ Bien - datos simples
{ key: 'price', sortable: true }

// ❌ Evitar - objetos complejos
{ key: 'user_full_data', sortable: true }
```

### 4. Usa renderCell para formateo consistente
```javascript
// ✅ Centralizar formateo de fechas
case 'created_at':
    return formatDate(row.created_at);

// ✅ Centralizar formateo de moneda
case 'price':
    return formatCurrency(row.price);
```

### 5. Proporciona acciones claras
```javascript
// ✅ Acciones claras y específicas
{ label: 'Ver Detalles', icon: 'fa-eye', ... }
{ label: 'Editar Cliente', icon: 'fa-edit', ... }

// ❌ Acciones genéricas
{ label: 'Acción', icon: 'fa-cog', ... }
```

---

## Solución de Problemas

### La configuración no se guarda
- Verifica que `tableId` sea único
- Comprueba que localStorage esté habilitado
- Revisa la consola por errores de JSON

### Las columnas no se ordenan
- Asegúrate de pasar `onSort` como prop
- Marca las columnas con `sortable: true`
- Implementa la lógica en el callback

### Los datos no se muestran
- Verifica que `data` sea un array
- Comprueba que las keys coincidan con los datos
- Usa `renderCell` para debugging

---

## Changelog

### v1.0.0
- ✅ Componente inicial
- ✅ Configuración de columnas
- ✅ Persistencia en localStorage
- ✅ Ordenamiento
- ✅ Acciones por fila
- ✅ Renderizado personalizado

---

¡Listo! Con este componente puedes crear tablas configurables en cualquier parte de tu aplicación.
