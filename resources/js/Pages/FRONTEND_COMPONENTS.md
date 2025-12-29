# WaterCRM Frontend Components

Componentes React creados para las nuevas funcionalidades del CRM.

## Componentes Implementados

### 1. Central/Permissions/Index.jsx

**Ruta:** `/permissions`

Gestión completa de permisos por rol y módulo.

**Características:**
- Selector de roles (Super Admin, Admin, Commercial, etc.)
- Tabla de permisos con 5 acciones: view, create, edit, delete, approve
- Guardado en bulk de permisos
- Estados de carga y éxito
- Info cards con explicaciones
- Responsive design

**Props esperados:**
```javascript
{
    auth: { user: {...} },
    roles: { 0: 'Super Admin', 1: 'Admin', ... },
    modules: { 'wallet': 'Wallet Management', ... },
    permissions: [...]
}
```

**Endpoints utilizados:**
- `GET /permissions/role/{roleId}`
- `POST /permissions/bulk`

---

### 2. Central/UsageStats/Index.jsx

**Ruta:** `/usage-stats`

Dashboard de estadísticas de uso y facturación para Super Admin.

**Características:**
- Tarjetas resumen con empresas activas e ingresos totales
- Selector de empresas
- Estadísticas actuales (usuarios, almacenamiento, módulos, costo)
- Gráficas de tendencias (Line chart y Bar chart)
- Exportación a CSV
- Integración con Chart.js

**Props esperados:**
```javascript
{
    auth: { user: {...} },
    companies: [{ id, name }, ...]
}
```

**Endpoints utilizados:**
- `GET /usage-stats/billing/summary`
- `GET /usage-stats/company/{companyId}`
- `GET /usage-stats/company/{companyId}/current`
- `GET /usage-stats/company/{companyId}/trends`
- `GET /usage-stats/export`

**Dependencias:**
```bash
npm install chart.js react-chartjs-2
```

---

### 3. Central/PdfTemplates/Index.jsx

**Ruta:** `/pdf-templates`

Gestión de plantillas PDF configurables.

**Características:**
- Grid de plantillas con badges de tipo y estado
- Preview de plantillas con datos de ejemplo
- Duplicación de plantillas
- Establecer plantilla por defecto
- Eliminación con confirmación
- Info card con variables disponibles
- Modal de preview

**Props esperados:**
```javascript
{
    auth: { user: {...} },
    templates: [{
        id,
        name,
        type, // 'budget', 'invoice', 'contract', 'custom'
        is_default,
        is_active,
        variables
    }, ...]
}
```

**Endpoints utilizados:**
- `POST /pdf-templates/{id}/preview`
- `DELETE /pdf-templates/{id}`
- `POST /pdf-templates/{id}/duplicate`
- `PUT /pdf-templates/{id}` (para set default)

---

### 4. Central/Products/WebVisibility.jsx

**Ruta:** `/products/web-visibility`

Control de visibilidad web de productos.

**Características:**
- Filtros: Todos, Visibles, Ocultos, Destacados
- Selección múltiple con checkboxes
- Toggle individual de visibilidad y destacado
- Acciones en bulk (mostrar/ocultar)
- Tabla responsive con información clara
- Estados visuales con badges

**Props esperados:**
```javascript
{
    auth: { user: {...} },
    products: [{
        id,
        name,
        model,
        visible_in_web,
        featured,
        category_web,
        order_web
    }, ...],
    categories: [...]
}
```

**Endpoints utilizados:**
- `POST /products/{id}/toggle-visibility`
- `POST /products/{id}/toggle-featured`
- `POST /products/bulk-visibility`

---

### 5. Tenant/Wallet/Index.jsx

**Ruta:** `/wallet`

Gestión de cartera digital para usuarios.

**Características:**
- Card de saldo con gradiente atractivo
- Resumen de ingresos y gastos totales
- Modal para nueva transacción
- Lista de transacciones con iconos y colores
- Formato de moneda en euros
- Estados vacíos informativos

**Props esperados:**
```javascript
{
    auth: { user: {...} },
    wallet: {
        balance,
        total_income,
        total_outcome
    },
    transactions: [{
        id,
        type, // 'income' | 'outcome'
        amount,
        payment_method, // 'cash' | 'card' | 'transfer'
        concept, // 'deposit' | 'payment' | 'delivery'
        description,
        created_at
    }, ...]
}
```

**Endpoints utilizados:**
- `POST /wallet/transaction`

---

## Estructura de Archivos

```
resources/js/Pages/
├── Central/
│   ├── Permissions/
│   │   └── Index.jsx
│   ├── UsageStats/
│   │   └── Index.jsx
│   ├── PdfTemplates/
│   │   └── Index.jsx
│   └── Products/
│       └── WebVisibility.jsx
└── Tenant/
    └── Wallet/
        └── Index.jsx
```

## Instalación de Dependencias

Para los componentes con gráficas (UsageStats):

```bash
npm install chart.js react-chartjs-2
```

Asegúrate de que las dependencias base están instaladas:

```bash
npm install react react-dom @inertiajs/react
```

## Estilos

Todos los componentes utilizan **Tailwind CSS** para los estilos.

Asegúrate de que tu `tailwind.config.js` incluye:

```javascript
module.exports = {
  content: [
    './resources/js/**/*.jsx',
    './resources/views/**/*.blade.php',
  ],
  // ...
}
```

## Layouts

Todos los componentes utilizan `AuthenticatedLayout`:

```javascript
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
```

Asegúrate de que este layout existe y está correctamente configurado.

## Rutas en Laravel

Necesitas crear las rutas correspondientes en tus archivos de rutas:

### routes/central/main.php

```php
use App\Http\Controllers\Central\RoleModulePermissionController;
use App\Http\Controllers\Central\CompanyUsageStatController;
use App\Http\Controllers\Central\PdfTemplateController;
use App\Http\Controllers\Central\ProductsController;

// Permissions
Route::get('/permissions', [RoleModulePermissionController::class, 'index'])->name('permissions.index');

// Usage Stats
Route::get('/usage-stats', [CompanyUsageStatController::class, 'index'])->name('usage.stats.index');

// PDF Templates
Route::get('/pdf-templates', [PdfTemplateController::class, 'index'])->name('pdf.templates.index');

// Product Web Visibility
Route::get('/products/web-visibility', [ProductsController::class, 'webVisibility'])->name('products.web.visibility');
```

### routes/tenant/main.php

```php
use App\Http\Controllers\Tenant\WalletController;

// Wallet
Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
```

## Controllers

Los controllers deben devolver los componentes con Inertia:

```php
use Inertia\Inertia;

public function index()
{
    return Inertia::render('Central/Permissions/Index', [
        'auth' => ['user' => auth()->user()],
        'roles' => $this->getRoles(),
        'modules' => $this->getModules(),
        'permissions' => $this->getPermissions()
    ]);
}
```

## Personalización

### Colores

Los componentes utilizan la paleta de colores de Tailwind. Para personalizar:

```javascript
// En tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {...}, // Personaliza los colores
      },
    },
  },
}
```

### Traducciones

Los textos están en español por defecto. Para internacionalización, considera usar:

```bash
npm install react-i18next
```

## Testing

Para testing de componentes React:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

## Componentes Pendientes

Componentes que aún faltan por implementar:

- [ ] Permissions/Create.jsx (crear nuevo permiso)
- [ ] PdfTemplates/Create.jsx (crear plantilla con editor)
- [ ] PdfTemplates/Edit.jsx (editar plantilla)
- [ ] Products/WebSettings.jsx (configurar SEO individual)
- [ ] Wallet/Admin.jsx (vista admin para ver todas las carteras)
- [ ] UsageStats/BillingReport.jsx (reporte detallado de facturación)

## Mejoras Futuras

- [ ] Añadir paginación a las listas largas
- [ ] Implementar búsqueda/filtros avanzados
- [ ] Añadir drag & drop para reordenar plantillas
- [ ] Editor WYSIWYG para plantillas PDF (tipo Elementor)
- [ ] Gráficas más interactivas con drill-down
- [ ] Exportación a Excel además de CSV
- [ ] Notificaciones toast para acciones
- [ ] Dark mode support

## Soporte

Para dudas o problemas con los componentes:
- Revisa la documentación de Inertia.js: https://inertiajs.com/
- Revisa la documentación de React: https://react.dev/
- Contacta al equipo de desarrollo
