# WaterCRM - Sistema de Gestión CRM Avanzado

Sistema CRM profesional basado en Laravel 10 con React + Inertia.js, diseñado para la gestión integral de empresas de tratamiento de agua con arquitectura multi-tenant.

## 🚀 Características Principales

### Sistema Base
- **Multi-tenancy**: Sistema de subdominios para múltiples empresas independientes
- **Autenticación Robusta**: Sistema de usuarios con roles jerárquicos y recuperación de contraseñas
- **Arquitectura API-First**: REST API completa con autenticación Sanctum
- **Usuario Admin Predefinido**:
  - Usuario: `Admin`
  - Contraseña: `Mario.:123`

### 🆕 Nuevos Módulos Implementados

#### 🔐 Sistema de Permisos Granular
- Gestión de permisos por rol y módulo
- 5 acciones configurables: view, create, edit, delete, approve
- Interfaz visual para Super Admin
- Permisos por defecto con sistema de fallback

#### 💳 Facturación y Usage Stats
- Dashboard de facturación para Super Admin
- Tracking automático de uso por empresa
- Cálculo de costos basado en:
  - Usuarios activos (€9.99/usuario adicional)
  - Almacenamiento (€5/GB adicional)
  - Módulos activos (€14.99/módulo adicional)
- Gráficas de tendencias con Chart.js
- Exportación a CSV

#### 📄 Sistema de Plantillas PDF
- Plantillas configurables por tipo (budget, invoice, contract, custom)
- Sistema de variables dinámicas ({{variable}})
- Preview en tiempo real
- Duplicación de plantillas
- Establecer plantillas por defecto
- Más de 25 variables predefinidas

#### 🌐 Visibilidad Web de Productos
- Control de visibilidad de productos en web
- Productos destacados (featured)
- Categorización web independiente
- Ordenamiento personalizado
- SEO por producto (meta title, description, keywords)
- Acciones en bulk (mostrar/ocultar múltiples)

### Módulos Principales

#### 💰 Módulo de Monedero Mejorado
- Gestión de efectivo para comerciales e instaladores
- Tipos de transacciones: ingresos y gastos
- Métodos de pago: efectivo, tarjeta, transferencia
- Conceptos: depósito, pago, entrega
- Interfaz visual con gradientes
- Vinculación con presupuestos
- Vista administrativa para supervisión

#### 📍 Geolocalización Avanzada
- Integración con Google Maps API
- Geofencing en instalaciones (radio configurable)
- Validación de ubicación al abrir/cerrar partes de trabajo
- Autocompletado de direcciones

#### 📄 Contratos Configurables
- Carga de PDFs personalizados por cliente
- Selección de campos dinámicos
- Firma digital de instalador y cliente
- Generación automática de contratos

#### 📧 Sistema de Emails
- Emails internos entre usuarios
- Interacciones con clientes
- Notificaciones automáticas

#### 📱 Diseño Responsive
- Optimizado para tablets (horizontal)
- Interfaz táctil mejorada
- Adaptación automática a diferentes dispositivos

#### 🔔 Módulo de Incidencias
- Sistema de notificaciones (campanita)
- Incidencias automáticas y manuales
- Asignación a trabajadores
- Panel de control de avisos

#### 📊 Dashboard con KPIs Configurables
- Leads creados por mes
- Contratos realizados
- Propuestas aceptadas/rechazadas
- Dinero facturado
- Máquinas vendidas
- KPIs personalizables por empresa

#### 🛍️ Gestión de Productos Mejorada
- Selección por familias
- Activación masiva de productos
- Fichas técnicas con iconos de atributos (máx 6)
- Gestión de imágenes con validación automática
- Sincronización con tenants
- Control de visibilidad web

#### 💵 Sistema de Gastos Comerciales
- Registro de gastos (comida, gasolina, hoteles, piezas)
- Subida de fotos de tickets
- OCR para reconocimiento de texto (proveedor y cantidad)
- Sumatorio automático
- Sistema de aprobación/rechazo

#### 🔐 Precios Bloqueados
- Sistema de autorización para cambios de precio
- Notificaciones a responsables
- Registro de modificaciones

#### 📁 Gestión Documental
- Almacenamiento de documentos por cliente
- DNI, contratos, albaranes
- Presupuestos e imágenes
- Historial completo

#### 🔧 Activación Modular
- Módulos activables por empresa
- Configuración personalizada
- Sistema de licencias

### 🔌 Integraciones WordPress

#### Plugin de Catálogo de Productos
- Auto-instalable (.zip)
- Sincronización automática con API
- 4 shortcodes disponibles:
  - `[watercrm_products]` - Grid de productos
  - `[watercrm_featured_products]` - Solo destacados
  - `[watercrm_product_categories]` - Listado por categorías
  - `[watercrm_product id="X"]` - Producto individual
- Caché inteligente de 15 minutos
- Responsive design
- Configuración de API desde admin

#### Plugin de Captura de Leads
- Formularios configurables
- Almacenamiento local en WordPress
- Envío automático al CRM
- Protección anti-spam (honeypot)
- Múltiples formularios por página
- Shortcodes:
  - `[watercrm_lead_form]` - Formulario completo
  - `[watercrm_quick_contact]` - Contacto rápido
  - `[watercrm_product_inquiry id="X"]` - Consulta de producto
- Panel de administración de leads

### 🌐 Landing Page Profesional

- Diseño inspirado en seelight.site
- 8 secciones completas:
  - Hero con gradientes animados
  - Características destacadas
  - Screenshots con tabs
  - Módulos del sistema
  - Integraciones
  - Planes de precios
  - Call-to-action
  - Footer completo
- Vanilla JavaScript (sin dependencias)
- Animaciones con Intersection Observer
- Responsive design
- Preparado para capturas del CRM

## 📋 Tecnologías

### Backend
- Laravel 10.10
- PostgreSQL 12+
- Stancl/Tenancy v3.9 (Multi-tenancy)
- Laravel Sanctum (API)
- DomPDF (Generación de PDFs)

### Frontend
- React 18.2
- Inertia.js v1.0
- Redux Toolkit
- TailwindCSS + Bootstrap
- Chart.js 4.x (gráficas)
- FullCalendar
- React Toastify

### APIs Externas
- Google Maps API (Geolocalización)
- OCR Service (Reconocimiento de tickets)
- WordPress REST API

### Deployment
- Nginx (servidor web)
- PM2 (process manager)
- Certbot (SSL)
- Git (control de versiones)

## 🔮 Funcionalidades Futuras

### IA en WhatsApp
- Contestación automática de preguntas a clientes
- Integración con WhatsApp Business API
- (Presupuesto aparte)

### Facturación API
- Integración con FACTUSOL
- Generación automática de facturas
- Sincronización contable
- (Desarrollo a largo plazo)

## 🚀 Instalación

### Requisitos Previos
- PHP 8.1+
- PostgreSQL 12+
- Node.js 18+
- Composer 2+
- npm 8+

### Pasos de Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/Mario1988123/WaterCRM.git
cd WaterCRM

# 2. Instalar dependencias de PHP
composer install

# 3. Instalar dependencias de JavaScript
npm install

# 4. Instalar Chart.js para gráficas
npm install chart.js react-chartjs-2

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 6. Generar application key
php artisan key:generate

# 7. Crear la base de datos
createdb watercrm

# 8. Ejecutar migraciones
php artisan migrate

# 9. Crear usuario admin
php artisan db:seed

# 10. Compilar assets
npm run build

# 11. Iniciar servidor de desarrollo
php artisan serve
```

### Configuración Adicional

#### Base de Datos (.env)
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=watercrm
DB_USERNAME=postgres
DB_PASSWORD=tu_password
```

#### Multi-tenancy (.env)
```env
TENANCY_DATABASE=pgsql
CENTRAL_DOMAINS=watercrm.local,localhost
```

#### Google Maps API
```env
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
INSTALLATION_RADIUS=100
```

#### Configuración de Imágenes
```env
MAX_IMAGE_SIZE=2048
MAX_LOGO_SIZE=512
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp
```

#### Configuración de Email
```env
MAIL_MAILER=smtp
MAIL_HOST=tu_servidor_smtp
MAIL_PORT=587
MAIL_USERNAME=tu_usuario
MAIL_PASSWORD=tu_contraseña
INTERNAL_EMAIL_ENABLED=true
```

## 👤 Usuario Admin por Defecto

```
Usuario: Admin
Contraseña: Mario.:123
```

## 📝 Roles de Usuario

- **Super Admin (0)**: Acceso total al sistema, facturación
- **Admin (1)**: Administrador de empresa
- **Commercial (2)**: Gestión comercial y ventas
- **Installer (3)**: Instaladores y técnicos
- **Technician (4)**: Soporte técnico
- **Warehouse (5)**: Gestión de almacén
- **Viewer (6)**: Solo lectura

## 🎯 Endpoints API Disponibles

### Central (Super Admin)

#### Permisos
- `GET /permissions` - Panel de gestión de permisos
- `GET /permissions/role/{roleId}` - Permisos por rol
- `POST /permissions/bulk` - Actualización masiva
- `POST /permissions/check` - Verificar permiso
- `GET /permissions/modules` - Módulos disponibles
- `GET /permissions/roles` - Lista de roles

#### Usage Stats & Billing
- `GET /usage-stats` - Dashboard de facturación
- `GET /usage-stats/company/{id}` - Stats de empresa
- `GET /usage-stats/company/{id}/current` - Stats actuales
- `GET /usage-stats/company/{id}/trends` - Tendencias
- `GET /usage-stats/billing/summary` - Resumen de facturación
- `GET /usage-stats/export` - Exportar a CSV
- `POST /usage-stats/record` - Registrar uso
- `POST /usage-stats/{id}/calculate` - Calcular costo

#### PDF Templates
- `GET /pdf-templates` - Panel de gestión
- `GET /pdf-templates/{id}` - Obtener plantilla
- `POST /pdf-templates` - Crear plantilla
- `PUT /pdf-templates/{id}` - Actualizar plantilla
- `DELETE /pdf-templates/{id}` - Eliminar plantilla
- `POST /pdf-templates/{id}/duplicate` - Duplicar
- `POST /pdf-templates/{id}/preview` - Preview HTML
- `POST /pdf-templates/{id}/generate` - Generar PDF
- `GET /pdf-templates/default/{type}` - Plantilla por defecto
- `GET /pdf-templates/variables/list` - Variables disponibles

#### Products Web Visibility
- `GET /products/web-visibility` - Panel de gestión
- `POST /products/{id}/web-visibility` - Actualizar visibilidad
- `POST /products/{id}/toggle-visibility` - Toggle visible
- `POST /products/{id}/toggle-featured` - Toggle destacado
- `POST /products/bulk-visibility` - Actualización masiva
- `GET /products/web/list` - Productos visibles
- `GET /products/web/categories` - Categorías web
- `POST /products/web/reorder` - Reordenar productos

### Tenant (Empresas)

#### Wallet
- `GET /wallet` - Panel de monedero
- `POST /wallet/transaction` - Nueva transacción
- `GET /wallet/transactions` - Historial de transacciones
- `GET /wallet/admin` - Vista administrativa

#### Incidents
- `GET /incidents` - Listar incidencias
- `POST /incidents` - Crear incidencia
- `PUT /incidents/{id}` - Actualizar
- `DELETE /incidents/{id}` - Eliminar
- `GET /incidents/unread/count` - Contador de no leídas

#### Internal Messages
- `GET /messages` - Bandeja de entrada
- `GET /messages/sent` - Mensajes enviados
- `POST /messages` - Enviar mensaje
- `GET /messages/{id}` - Ver mensaje
- `POST /messages/{id}/read` - Marcar como leído
- `GET /messages/unread/count` - Contador de no leídos

#### Expenses
- `GET /expenses` - Listar gastos
- `POST /expenses` - Crear gasto (con imagen OCR)
- `POST /expenses/{id}/approve` - Aprobar gasto
- `POST /expenses/{id}/reject` - Rechazar gasto
- `GET /expenses/summary` - Resumen de gastos

#### Clients
- `GET /clients` - Listar clientes
- `POST /clients` - Crear cliente
- `GET /clients/{id}` - Ver cliente
- `PUT /clients/{id}` - Actualizar cliente
- `DELETE /clients/{id}` - Eliminar cliente
- `GET /clients/opportunities` - Oportunidades

#### Budgets
- `GET /budgets/{clientId}` - Presupuestos de cliente
- `POST /budgets/{clientId}/store` - Crear presupuesto
- `GET /budgets/pdf/download/{id}` - Descargar PDF
- `POST /budgets/accept/{id}` - Aceptar presupuesto
- `POST /budgets/reject/{id}` - Rechazar presupuesto

#### Installations
- `GET /installations` - Listar instalaciones
- `POST /installations` - Crear instalación
- `POST /installations/assign` - Asignar técnico
- `GET /installations/pending` - Instalaciones pendientes

## 📚 Documentación Adicional

### Deployment y Configuración
- **DEPLOYMENT_GUIDE.md** - Guía completa de deployment (745 líneas)
- **PLESK_SETUP.md** - Guía detallada para deployment en Plesk/IONOS
- **PLESK_QUICKSTART.md** - Inicio rápido en Plesk (5 minutos)
- **PLESK_GIT_TOOLKIT_ERROR.md** - Solución al error de Laravel Toolkit
- **DEPLOYMENT_STATUS.md** - Estado actual del deployment en Plesk
- **NEXT_STEPS.md** - Próximos pasos para completar deployment
- **SSL-SETUP-COMPLETE.md** - Configuración SSL
- **WILDCARD-SSL-SETUP.md** - SSL con wildcards

### Documentación Técnica
- **IMPLEMENTATION_STATUS.md** - Estado detallado de implementación
- **FRONTEND_COMPONENTS.md** - Guía de componentes React
- **CONTRACT_IMPLEMENTATION.md** - Guía de contratos
- **EXECUTIVE_SUMMARY.md** - Resumen ejecutivo del proyecto
- **landing-page/README.md** - Documentación de landing page
- **wordpress-plugins/*/README.md** - Guías de plugins

## 📦 Estructura del Proyecto

```
WaterCRM/
├── app/
│   ├── Http/Controllers/
│   │   ├── Central/              # Controllers Super Admin
│   │   │   ├── RoleModulePermissionController.php
│   │   │   ├── CompanyUsageStatController.php
│   │   │   ├── PdfTemplateController.php
│   │   │   └── ProductsController.php
│   │   └── Tenant/               # Controllers Tenant
│   │       ├── WalletController.php
│   │       ├── IncidentController.php
│   │       ├── InternalMessageController.php
│   │       └── ExpenseController.php
│   ├── Models/
│   │   ├── Central/              # Models Central DB
│   │   │   ├── RoleModulePermission.php
│   │   │   ├── CompanyUsageStat.php
│   │   │   └── PdfTemplate.php
│   │   └── Tenant/               # Models Tenant DB
│   │       ├── Wallet.php
│   │       ├── WalletTransaction.php
│   │       ├── Incident.php
│   │       ├── InternalMessage.php
│   │       └── Expense.php
│   └── Services/
│       └── ImageProcessingService.php
├── database/migrations/
│   ├── central/                  # Migraciones Central
│   └── tenant/                   # Migraciones Tenant
├── resources/
│   └── js/
│       ├── Pages/
│       │   ├── Central/          # Componentes React Central
│       │   │   ├── Permissions/Index.jsx
│       │   │   ├── UsageStats/Index.jsx
│       │   │   ├── PdfTemplates/Index.jsx
│       │   │   └── Products/WebVisibility.jsx
│       │   └── Tenant/           # Componentes React Tenant
│       │       └── Wallet/Index.jsx
│       └── Template/             # Layout base
├── routes/
│   ├── central/main.php          # Rutas Central
│   └── tenant/main.php           # Rutas Tenant
├── landing-page/                 # Landing page standalone
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js
│   └── screenshots/              # Capturas del CRM
├── wordpress-plugins/            # Plugins WordPress
│   ├── watercrm-catalog/         # Plugin catálogo
│   └── watercrm-leads/           # Plugin leads
└── docs/                         # Documentación

```

## 📈 Estado Actual de Implementación

### ✅ BACKEND COMPLETADO AL 100%

El backend está completamente funcional con:
- 11 nuevas migraciones implementadas (4 central + 7 tenant)
- 11 modelos con relaciones completas
- 8 controladores REST completos (4 central + 4 tenant)
- Servicio de procesamiento de imágenes
- Todas las rutas configuradas y testeadas
- Validaciones y seguridad implementada
- Sistema de permisos granular

### ✅ FRONTEND COMPLETADO AL 100%

Los componentes React están implementados:
- 5 componentes Inertia.js completados
- Integración completa con backend
- Tailwind CSS para estilos
- Chart.js para gráficas
- Estados de carga y manejo de errores
- Responsive design

### ✅ INTEGRACIONES COMPLETADAS

- 2 plugins WordPress auto-instalables
- Landing page profesional
- Guía de deployment completa
- Documentación exhaustiva

## 🔐 Seguridad

- Autenticación robusta con Laravel Breeze
- Recuperación de contraseñas
- Tokens API con Sanctum
- Validación de permisos por rol y módulo
- Middleware de seguridad
- Protección CSRF
- Validación de inputs
- Sanitización de datos

## 🐛 Testing

```bash
# Ejecutar tests
php artisan test

# Con cobertura
php artisan test --coverage

# Tests específicos
php artisan test --filter=WalletTest
```

## 📦 Deployment

### Deployment en Plesk/IONOS

**¿Desplegando en Plesk?** Tenemos guías específicas para ti:

1. **[NEXT_STEPS.md](NEXT_STEPS.md)** - Guía rápida de próximos pasos
2. **[PLESK_QUICKSTART.md](PLESK_QUICKSTART.md)** - Inicio rápido (5 minutos)
3. **[PLESK_SETUP.md](PLESK_SETUP.md)** - Guía completa paso a paso
4. **[PLESK_GIT_TOOLKIT_ERROR.md](PLESK_GIT_TOOLKIT_ERROR.md)** - Solución a errores comunes

Scripts incluidos:
- `setup-plesk.sh` - Configuración inicial automática
- `deploy.sh` - Script de deployment automático
- `fix-apache-ports.sh` - Corrige conflictos de puertos Apache/nginx
- `configure-nginx-proxy.sh` - Configura nginx como proxy reverso

### Production Build

```bash
# Optimizar dependencias
composer install --optimize-autoloader --no-dev

# Build de assets
npm run build

# Cache de configuración
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Permisos
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Otros Servidores (VPS, Railway, etc.)

Ver `DEPLOYMENT_GUIDE.md` para configuración completa de Nginx, SSL, PM2, y más.

## 🤝 Contribución

Ver `IMPLEMENTATION_STATUS.md` para lista de mejoras futuras.

## 📝 Changelog

### v2.0.0 (2025-12-28)
- ✅ Sistema de permisos granular implementado
- ✅ Dashboard de facturación y usage stats
- ✅ Sistema de plantillas PDF configurables
- ✅ Control de visibilidad web de productos
- ✅ Módulo de monedero mejorado con UI
- ✅ 5 componentes React/Inertia implementados
- ✅ 2 plugins WordPress auto-instalables
- ✅ Landing page profesional
- ✅ Guía de deployment completa (745 líneas)
- ✅ Frontend completamente integrado con backend

### v1.0.0 (2025-12-28)
- ✅ Backend completo implementado
- ✅ Sistema de monedero funcional
- ✅ Módulo de incidencias
- ✅ Mensajes internos
- ✅ Gastos comerciales con procesamiento de imágenes
- ✅ Servicio de optimización de imágenes

## 🌟 Características Destacadas

- **Multi-tenancy real**: Cada empresa tiene su propia base de datos aislada
- **Facturación automática**: Cálculo de costos basado en uso real
- **Permisos granulares**: Control total sobre quién puede hacer qué
- **Plantillas dinámicas**: Sistema flexible de variables para PDFs
- **Integración WordPress**: Plugins listos para instalar
- **Landing profesional**: Página de marketing lista para usar
- **Deployment completo**: Documentación paso a paso para producción

## 🔒 Licencia

Propietario - Todos los derechos reservados

---

**Desarrollado con ❤️ para una gestión CRM eficiente y moderna**

Para soporte, consultar la documentación en `/docs` o contactar al equipo de desarrollo.
