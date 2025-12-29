# 🚀 WaterCRM - Guía de Instalación Rápida

Esta guía te llevará desde cero hasta tener WaterCRM funcionando completamente.

## ⚡ Inicio Rápido (5 minutos)

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/Mario1988123/WaterCRM.git
cd WaterCRM
composer install
npm install

# 2. Instalar Chart.js (IMPORTANTE)
npm install chart.js react-chartjs-2

# 3. Configurar entorno
cp .env.example .env
php artisan key:generate

# 4. Configurar base de datos en .env
# Edita .env y configura:
# DB_CONNECTION=pgsql
# DB_DATABASE=watercrm
# DB_USERNAME=postgres
# DB_PASSWORD=tu_password

# 5. Crear base de datos y migrar
createdb watercrm
php artisan migrate
php artisan db:seed

# 6. Compilar assets
npm run build

# 7. Iniciar servidor
php artisan serve
```

**¡Listo!** Accede a `http://localhost:8000` con:
- Usuario: `Admin`
- Contraseña: `Mario.:123`

---

## 📦 Requisitos del Sistema

### Requeridos
- **PHP**: 8.1 o superior
- **PostgreSQL**: 12 o superior
- **Node.js**: 18 o superior
- **Composer**: 2.x
- **npm**: 8 o superior

### Extensiones PHP Necesarias
```bash
# Ubuntu/Debian
sudo apt-get install php8.1-pgsql php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip php8.1-gd

# macOS (con Homebrew)
brew install php@8.1
```

---

## 🔧 Instalación Detallada

### 1. Dependencias de Backend

```bash
composer install
```

**Si tienes errores**, verifica:
```bash
php -v  # Debe ser >= 8.1
composer diagnose
```

### 2. Dependencias de Frontend

```bash
# Dependencias base
npm install

# Chart.js para gráficas (CRÍTICO)
npm install chart.js react-chartjs-2
```

**Versiones recomendadas:**
- `chart.js`: ^4.4.0
- `react-chartjs-2`: ^5.2.0

### 3. Configuración de Base de Datos

**Crear base de datos PostgreSQL:**
```bash
# Opción 1: Comando directo
createdb watercrm

# Opción 2: psql
psql -U postgres
CREATE DATABASE watercrm;
\q
```

**Configurar .env:**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=watercrm
DB_USERNAME=postgres
DB_PASSWORD=tu_password_aqui
```

**Verificar conexión:**
```bash
php artisan tinker
DB::connection()->getPdo();
# Si no hay error, la conexión funciona
```

### 4. Ejecutar Migraciones

```bash
# Migrar base de datos central
php artisan migrate

# Crear usuario admin (seeder)
php artisan db:seed

# O todo junto
php artisan migrate:fresh --seed
```

**Si hay errores de conexión:**
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Iniciar PostgreSQL si está detenido
sudo systemctl start postgresql   # Linux
brew services start postgresql    # macOS
```

### 5. Compilar Assets

```bash
# Desarrollo (con watch)
npm run dev

# Producción (optimizado)
npm run build
```

**Si tienes errores de compilación:**
```bash
# Limpiar caché
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🌐 Configuración Multi-Tenancy

### Variables de Entorno

```env
# Multi-tenancy
TENANCY_DATABASE=pgsql
CENTRAL_DOMAINS=localhost,127.0.0.1,watercrm.local

# Configuración de dominio
APP_URL=http://localhost:8000
```

### Crear Primera Empresa (Tenant)

Después de instalar, crea tu primera empresa:

1. Accede como Admin: `http://localhost:8000`
2. Ve a **Empresas** → **Nueva Empresa**
3. Completa los datos (nombre, subdominio, etc.)
4. La base de datos tenant se crea automáticamente

**Acceder al tenant:**
```
http://{subdominio}.localhost:8000
```

---

## ⚙️ Configuraciones Opcionales

### Google Maps (Geolocalización)

```env
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
INSTALLATION_RADIUS=100
```

### Email (SMTP)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_password_app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@watercrm.com
MAIL_FROM_NAME="WaterCRM"
```

### Imágenes

```env
MAX_IMAGE_SIZE=2048
MAX_LOGO_SIZE=512
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp
```

---

## 🧪 Verificar Instalación

### Test de Componentes

Visita estas URLs para verificar que todo funciona:

**Central (Super Admin):**
- `http://localhost:8000/permissions` - Gestión de permisos
- `http://localhost:8000/usage-stats` - Dashboard de facturación
- `http://localhost:8000/pdf-templates` - Plantillas PDF
- `http://localhost:8000/products/web-visibility` - Visibilidad productos
- `http://localhost:8000/products/1/seo-settings` - SEO producto

**Tenant (empresas):**
- `http://{subdominio}.localhost:8000/wallet` - Monedero
- `http://{subdominio}.localhost:8000/wallet/admin` - Admin monederos

### Test de Funcionalidades

```bash
# Ejecutar tests
php artisan test

# Con cobertura
php artisan test --coverage

# Tests específicos
php artisan test --filter=WalletTest
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Class 'Inertia' not found"
```bash
composer require inertiajs/inertia-laravel
```

### Error: "npm ERR! code ELIFECYCLE"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "SQLSTATE[08006] Connection refused"
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
sudo systemctl start postgresql

# Verificar credenciales en .env
```

### Error: Chart.js not rendering
```bash
# Reinstalar Chart.js
npm uninstall chart.js react-chartjs-2
npm install chart.js@^4.4.0 react-chartjs-2@^5.2.0
npm run build
```

### Error: "Storage link not created"
```bash
php artisan storage:link
chmod -R 775 storage bootstrap/cache
```

### Página en blanco o 500
```bash
# Ver logs
tail -f storage/logs/laravel.log

# Limpiar cachés
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## 📱 Acceso por Primera Vez

### Usuario Administrador

```
URL: http://localhost:8000
Usuario: Admin
Contraseña: Mario.:123
```

### Cambiar Contraseña Admin

```bash
php artisan tinker
$user = User::where('name', 'Admin')->first();
$user->password = Hash::make('nueva_password');
$user->save();
```

---

## 🔐 Seguridad

### Cambiar Credenciales por Defecto

**Inmediatamente después de instalar:**

1. Cambia la contraseña del admin
2. Genera nueva APP_KEY:
```bash
php artisan key:generate
```

3. Configura permisos de archivos:
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## 🚀 Pasar a Producción

Ver guía completa en **DEPLOYMENT_GUIDE.md** (745 líneas).

### Quick Checklist

```bash
# 1. Optimizar composer
composer install --optimize-autoloader --no-dev

# 2. Build producción
npm run build

# 3. Cachear configuración
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Optimizar aplicación
php artisan optimize

# 5. Configurar cron para tareas programadas
# Añadir a crontab:
* * * * * cd /path/to/watercrm && php artisan schedule:run >> /dev/null 2>&1
```

---

## 📚 Documentación Adicional

- **README.md** - Descripción completa del proyecto
- **DEPLOYMENT_GUIDE.md** - Guía de deployment (745 líneas)
- **FRONTEND_COMPONENTS.md** - Documentación de componentes React
- **landing-page/README.md** - Documentación de landing page
- **wordpress-plugins/*/README.md** - Guías de plugins WordPress

---

## 💡 Siguientes Pasos

Después de la instalación:

1. **Crear tu primera empresa** (tenant)
2. **Configurar permisos** por roles
3. **Personalizar plantillas PDF**
4. **Importar productos** desde WaasCRM
5. **Configurar módulos** activos por empresa
6. **Instalar plugins WordPress** (opcional)
7. **Desplegar landing page** (opcional)

---

## 🆘 Soporte

¿Problemas durante la instalación?

1. Revisa esta guía completa
2. Consulta logs: `storage/logs/laravel.log`
3. Verifica versiones de PHP y PostgreSQL
4. Revisa issues en GitHub

---

## ✅ Checklist de Instalación

- [ ] PHP 8.1+ instalado
- [ ] PostgreSQL 12+ instalado y corriendo
- [ ] Node.js 18+ instalado
- [ ] Composer instalado
- [ ] Repositorio clonado
- [ ] `composer install` ejecutado
- [ ] `npm install` ejecutado
- [ ] **Chart.js instalado** (`npm install chart.js react-chartjs-2`)
- [ ] `.env` configurado correctamente
- [ ] Base de datos creada
- [ ] `php artisan migrate` ejecutado
- [ ] `php artisan db:seed` ejecutado
- [ ] `npm run build` ejecutado
- [ ] `php artisan serve` funcionando
- [ ] Login con Admin exitoso
- [ ] Todos los componentes accesibles

---

**¡Felicidades!** 🎉 WaterCRM está listo para usar.

Para deployment en producción, consulta **DEPLOYMENT_GUIDE.md**.
