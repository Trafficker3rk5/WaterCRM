# Guía de Despliegue de WaterCRM en Plesk/IONOS

Esta guía documenta el proceso de despliegue de WaterCRM (aplicación Laravel multi-tenant) en un servidor Plesk/IONOS.

## Tabla de Contenidos

- [Arquitectura del Servidor](#arquitectura-del-servidor)
- [Requisitos](#requisitos)
- [Scripts de Despliegue](#scripts-de-despliegue)
- [Proceso de Instalación](#proceso-de-instalación)
- [Configuración Multi-Tenancy](#configuración-multi-tenancy)
- [Solución de Problemas](#solución-de-problemas)
- [Mantenimiento](#mantenimiento)

## Arquitectura del Servidor

### Configuración Plesk

Plesk utiliza una arquitectura de doble proxy:

```
Internet (puerto 80/443)
    ↓
nginx (proxy inverso en puertos 80/443)
    ↓
Apache (backend en puertos 7080/7443)
    ↓
PHP-FPM
    ↓
Laravel Application
```

**Importante:**
- nginx escucha en `0.0.0.0:80` y `0.0.0.0:443`
- nginx hace proxy a `127.0.0.1:7080` y `127.0.0.1:7443`
- Apache **debe** escuchar en `*:7080` (no en una IP específica) para que nginx pueda conectarse

### Directorios

- **Document Root:** `/var/www/vhosts/crm-prueba.test/public/public`
- **Application Root:** `/var/www/vhosts/crm-prueba.test/public`
- **Apache Config:** `/etc/apache2/plesk.conf.d/vhosts/crm-prueba.test.conf`
- **nginx Config:** `/etc/nginx/sites-available/crm-prueba.test`
- **PHP-FPM Socket:** `/var/www/vhosts/system/crm-prueba.test/php-fpm.sock`

## Requisitos

### Software

- PHP 8.1+
- MySQL 5.7+ o 8.0+
- Composer
- Git
- Apache 2.4+
- nginx (incluido con Plesk)

### Extensiones PHP Requeridas

```
php-cli
php-fpm
php-mysql
php-xml
php-mbstring
php-curl
php-zip
php-gd
```

### Credenciales de Base de Datos

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=watercrm_production
DB_USERNAME=watercrm_user
DB_PASSWORD=[tu_contraseña]
```

## Scripts de Despliegue

Este repositorio incluye varios scripts para facilitar el despliegue:

### 1. `deploy-watercrm.sh` - Script Principal de Despliegue

Descarga configuraciones desde GitHub, limpia cachés, verifica configuración.

```bash
chmod +x deploy-watercrm.sh
./deploy-watercrm.sh
```

**Qué hace:**
- Descarga `config/tenancy.php` actualizado
- Descarga `TenancyServiceProvider.php` actualizado
- Descarga modelo `Tenant.php` actualizado
- Configura permisos de storage y bootstrap
- Limpia y re-genera cachés de Laravel
- Verifica configuración de tenancy
- Prueba la aplicación

### 2. `create-tenant-manual.sh` - Crear Tenants Manualmente

Crea un nuevo tenant y sus dominios.

```bash
chmod +x create-tenant-manual.sh
./create-tenant-manual.sh <tenant_id> <domain1> [domain2] [domain3]
```

**Ejemplo:**
```bash
./create-tenant-manual.sh demo crm-prueba.test 217.154.186.92
```

### 3. `diagnose-laravel-error.sh` - Diagnóstico de Errores

Verifica configuración, permisos, base de datos y muestra errores.

```bash
chmod +x diagnose-laravel-error.sh
./diagnose-laravel-error.sh
```

### 4. `fix-tenancy-domains.sh` - Corregir Configuración de Tenancy

Verifica y corrige problemas con la configuración multi-tenant.

```bash
chmod +x fix-tenancy-domains.sh
./fix-tenancy-domains.sh
```

### 5. `fix-vhost-listen-all.sh` - Corregir VirtualHost de Apache

Cambia Apache para escuchar en todas las IPs (`*:7080`).

```bash
chmod +x fix-vhost-listen-all.sh
sudo ./fix-vhost-listen-all.sh
```

## Proceso de Instalación

### Paso 1: Clonar el Repositorio

```bash
cd /var/www/vhosts/crm-prueba.test
git clone https://github.com/Trafficker3rk5/WaterCRM.git public
cd public
git checkout claude/fix-laravel-github-path-g0Yhx
```

### Paso 2: Instalar Dependencias

```bash
composer install --no-dev --optimize-autoloader
```

### Paso 3: Configurar .env

```bash
cp .env.example .env
nano .env
```

Configuración mínima requerida:

```env
APP_NAME=WaterCRM
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://217.154.186.92

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=watercrm_production
DB_USERNAME=watercrm_user
DB_PASSWORD=[tu_contraseña]
```

Generar APP_KEY:

```bash
php artisan key:generate
```

### Paso 4: Configurar Apache

```bash
sudo ./fix-vhost-listen-all.sh
sudo systemctl restart apache2
```

### Paso 5: Ejecutar Migraciones

```bash
php artisan migrate --force
```

### Paso 6: Configurar Permisos

```bash
chmod -R 775 storage bootstrap/cache
chown -R crm-prueba.test_kovfbpusm6d:psacln storage bootstrap/cache
```

### Paso 7: Crear Primer Tenant

```bash
./create-tenant-manual.sh demo crm-prueba.test 217.154.186.92
```

Luego crear la base de datos del tenant en phpMyAdmin:

- Nombre: `tenantdemo`
- Usuario: `watercrm_user` (mismo que la app principal)

Ejecutar migraciones del tenant:

```bash
php artisan tenants:migrate --tenants=demo
```

### Paso 8: Optimizar para Producción

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Paso 9: Verificar

```bash
curl http://217.154.186.92
```

## Configuración Multi-Tenancy

### Estructura de Tenancy

WaterCRM usa el paquete `stancl/tenancy` para multi-tenancy con **identificación por dominio**.

#### Modelo Tenant

```php
// app/Models/Main/Tenant.php
namespace App\Models\Main;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;
}
```

#### Configuración

```php
// config/tenancy.php
return [
    'tenant_model' => \App\Models\Main\Tenant::class,

    'central_domains' => [
        'localhost',
        'localhost:8000',
        // NO incluir IPs públicas - deben ser dominios de tenant
    ],

    'database_prefix' => 'tenant_',
];
```

### Dominios Centrales vs. Dominios de Tenant

- **Dominios Centrales:** Operan en modo "central" sin tenant específico (ej: panel de admin)
- **Dominios de Tenant:** Cada request se asocia a un tenant específico

**Importante:** La IP pública `217.154.186.92` NO debe estar en `central_domains` porque debe funcionar como dominio de tenant.

### Crear Tenant Manualmente

Debido a que el usuario MySQL no tiene permisos `CREATE DATABASE`, los tenants se crean en dos pasos:

#### Paso 1: Crear registro de tenant

```bash
./create-tenant-manual.sh cliente1 cliente1.watercrm.com
```

#### Paso 2: Crear base de datos

**Opción A - phpMyAdmin:**
1. Acceder a Plesk > Bases de datos
2. Crear base de datos: `tenantcliente1`
3. Asignar usuario: `watercrm_user`

**Opción B - MySQL (requiere root):**
```bash
mysql -u root -p -e "CREATE DATABASE tenantcliente1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON tenantcliente1.* TO 'watercrm_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

#### Paso 3: Ejecutar migraciones del tenant

```bash
php artisan tenants:migrate --tenants=cliente1
```

### Limitación Importante: TenancyServiceProvider

El `TenancyServiceProvider` ha sido modificado para **NO crear bases de datos automáticamente**:

```php
Events\TenantCreated::class => [
    JobPipeline::make([
        // Jobs\CreateDatabase::class, // DESHABILITADO - sin permisos
        Jobs\MigrateDatabase::class,
        // Jobs\SeedDatabase::class, // DESHABILITADO
    ])->send(function (Events\TenantCreated $event) {
        return $event->tenant;
    })->shouldBeQueued(false),
],
```

**Razón:** El usuario MySQL no tiene permisos `CREATE DATABASE`.

**Solución:** Las bases de datos deben crearse manualmente antes de que las migraciones puedan ejecutarse.

## Solución de Problemas

### Error: "Call to undefined method...domains()"

**Causa:** `config/tenancy.php` tiene configuración incorrecta del modelo tenant.

**Solución:**
```bash
./deploy-watercrm.sh
```

O manualmente:
```bash
# Descargar config correcto desde GitHub
curl -o config/tenancy.php https://raw.githubusercontent.com/Trafficker3rk5/WaterCRM/claude/fix-laravel-github-path-g0Yhx/config/tenancy.php

# Limpiar cachés
php artisan config:clear
php artisan config:cache
```

### Error 500 sin detalles

**Solución:**
```bash
# 1. Habilitar modo debug
nano .env
# Cambiar: APP_DEBUG=true

# 2. Limpiar config cache
php artisan config:clear

# 3. Ver error detallado
curl http://217.154.186.92
```

### Apache no responde en puerto 7080

**Causa:** VirtualHost configurado solo para IP específica.

**Solución:**
```bash
sudo ./fix-vhost-listen-all.sh
sudo systemctl restart apache2
```

### nginx muestra página por defecto de Plesk

**Causa:** Redirección HTTP→HTTPS habilitada en Plesk.

**Solución:**
1. Acceder a Plesk panel
2. Ir a Hosting Settings para crm-prueba.test
3. Desmarcar "Redirect visitors from HTTP to HTTPS"
4. Guardar

### Permisos negados en storage/logs

**Solución:**
```bash
chmod -R 775 storage bootstrap/cache
chown -R crm-prueba.test_kovfbpusm6d:psacln storage bootstrap/cache
```

### Tenant creado pero error "No tenant found"

**Verificar:**
```bash
# Ver tenants y dominios
php artisan tinker --execute="
echo 'Tenants: ' . \App\Models\Main\Tenant::count() . PHP_EOL;
echo 'Domains: ' . \Stancl\Tenancy\Database\Models\Domain::count() . PHP_EOL;
\$tenants = \App\Models\Main\Tenant::with('domains')->get();
foreach (\$tenants as \$tenant) {
    echo 'Tenant: ' . \$tenant->id . ' - Dominios: ' . \$tenant->domains->pluck('domain')->implode(', ') . PHP_EOL;
}
"
```

**Solución:** Verificar que el dominio/IP está registrado en la tabla `domains`.

## Mantenimiento

### Actualizar desde GitHub

```bash
cd /var/www/vhosts/crm-prueba.test/public
git pull origin claude/fix-laravel-github-path-g0Yhx
./deploy-watercrm.sh
```

### Ver Logs

```bash
# Logs de Laravel
tail -50 storage/logs/laravel.log

# Logs de Apache
tail -50 /var/www/vhosts/system/crm-prueba.test/logs/error_log

# Logs de PHP-FPM
tail -50 /var/log/php-fpm/error.log
```

### Limpiar Cachés

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Optimizar para Producción

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --no-dev --optimize-autoloader
```

### Backup

**Base de datos:**
```bash
mysqldump -u watercrm_user -p watercrm_production > backup_$(date +%Y%m%d).sql
mysqldump -u watercrm_user -p tenantdemo > backup_tenantdemo_$(date +%Y%m%d).sql
```

**Archivos:**
```bash
tar -czf backup_storage_$(date +%Y%m%d).tar.gz storage/app
```

## Información de Contacto y Soporte

Para problemas o preguntas sobre el despliegue:

- **Repositorio:** https://github.com/Trafficker3rk5/WaterCRM
- **Rama de despliegue:** `claude/fix-laravel-github-path-g0Yhx`

---

**Última actualización:** 2025-12-30
