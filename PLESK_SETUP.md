# 🚀 Guía Completa de Despliegue en Plesk/IONOS

Esta guía te ayudará a conectar correctamente tu repositorio de GitHub con Plesk para WaterCRM.

## 📋 Requisitos Previos

- Acceso a Plesk en IONOS
- Dominio configurado: `crm-prueba.test` (o tu dominio real)
- PHP 8.2 o superior
- PostgreSQL 12 o superior
- Acceso SSH (opcional pero recomendado)
- Token de GitHub para repositorio privado

---

## 🎯 SOLUCIÓN AL ERROR: "Ruta no válida"

### El Problema
El error `fatal: Ruta no válida '/var/www/vhosts/crm-prueba.test/public'` ocurre porque:

1. ❌ Document Root mal configurado: `/public/WaterCRM-claude-new-crm-system-dro2n/public`
2. ✅ Document Root correcto debe ser: `/httpdocs/public`

### Estructura Correcta en Plesk

```
/var/www/vhosts/crm-prueba.test/
├── httpdocs/                          ← Aquí se clona el repositorio
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/                        ← Document Root apunta AQUÍ
│   │   ├── index.php
│   │   ├── .htaccess
│   │   └── ...
│   ├── resources/
│   ├── routes/
│   ├── storage/                       ← Permisos 775
│   ├── vendor/
│   ├── .env                          ← Crear desde .env.example
│   ├── artisan
│   ├── composer.json
│   └── ...
└── httpdocs.backup/                   ← Backup automático de Plesk
```

---

## 🔧 PASO 1: Limpiar y Preparar el Dominio

### Opción A: Desde el Administrador de Archivos de Plesk

1. Ve a **"Sitios web y dominios"**
2. Click en **"crm-prueba.test"**
3. Click en **"Administrador de archivos"**
4. Deberías estar en `/httpdocs/`
5. **IMPORTANTE**: Haz backup si hay algo importante
   - Selecciona todo → Click derecho → "Comprimir" → `backup-$(date +%Y%m%d).zip`
6. Borra todo el contenido de `/httpdocs/`
   - Selecciona todos los archivos/carpetas
   - Click en "Eliminar"
   - Confirma

### Opción B: Desde SSH (Más rápido)

```bash
# Conectar por SSH
ssh crm-prueba.test_kovfbpusm6d@217.154.186.92

# Ir al directorio
cd /var/www/vhosts/crm-prueba.test/httpdocs/

# Backup (opcional)
tar -czf ../httpdocs-backup-$(date +%Y%m%d).tar.gz .

# Limpiar todo
rm -rf *
rm -rf .[!.]*
```

---

## 📥 PASO 2: Clonar el Repositorio desde GitHub

### Opción A: Usando Git Toolkit de Plesk (Recomendado)

1. Ve a **"Sitios web y dominios"** → **"crm-prueba.test"**
2. Busca **"Git"** en las herramientas (puede estar en "Aplicaciones" o directamente)
3. Click en **"Repositorio Git"** o **"Git"**
4. Click en **"Agregar repositorio"** o **"Clone Repository"**

**Configuración del repositorio:**
```
URL del repositorio:  https://github.com/Trafficker3rk5/WaterCRM.git
Rama:                 claude/fix-laravel-github-path-g0Yhx
Directorio destino:   /httpdocs/
Token (si es privado): ghp_tu_token_aqui
Deployment mode:      Automatic (cada push)
```

5. Click **"OK"** o **"Clone"**
6. Espera 30-60 segundos
7. Verifica en el Administrador de archivos que ahora `/httpdocs/` contiene:
   - `app/`, `bootstrap/`, `config/`, `public/`, etc.

### Opción B: Desde SSH

```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/

# Clonar repositorio
git clone -b claude/fix-laravel-github-path-g0Yhx https://github.com/Trafficker3rk5/WaterCRM.git .

# Si es repositorio privado, usa token:
git clone -b claude/fix-laravel-github-path-g0Yhx https://TU_GITHUB_TOKEN@github.com/Trafficker3rk5/WaterCRM.git .
```

---

## ⚙️ PASO 3: Configurar Document Root CORRECTAMENTE

**MUY IMPORTANTE**: El Document Root debe apuntar a la carpeta `public/` de Laravel.

1. Ve a **"Sitios web y dominios"** → **"crm-prueba.test"**
2. Click en **"Configuración de alojamiento"** o **"Hosting Settings"**
3. Busca **"Raíz del documento"** o **"Document Root"**
4. Cambia de:
   ```
   /public/WaterCRM-claude-new-crm-system-dro2n/public
   ```
   A:
   ```
   /httpdocs/public
   ```

5. Más abajo, en **"Configuración adicional de Apache & nginx"**, pega esto:

```apache
<Directory /var/www/vhosts/crm-prueba.test/httpdocs/public>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted

    <IfModule mod_rewrite.c>
        RewriteEngine On

        # Handle Authorization Header
        RewriteCond %{HTTP:Authorization} .
        RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

        # Redirect Trailing Slashes If Not A Folder
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} (.+)/$
        RewriteRule ^ %1 [L,R=301]

        # Send Requests To Front Controller
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^ index.php [L]
    </IfModule>
</Directory>
```

6. Click **"Aceptar"** o **"OK"**

---

## 🔑 PASO 4: Configurar Variables de Entorno (.env)

### Opción A: Desde Administrador de Archivos

1. Ve a **Administrador de archivos** → `/httpdocs/`
2. Busca `.env.example`
3. Click derecho → **"Copiar"**
4. Pega como `.env`
5. Click derecho en `.env` → **"Editar"**
6. Modifica las siguientes variables:

```env
APP_NAME=WaterCRM
APP_ENV=production
APP_DEBUG=false
APP_URL=http://crm-prueba.test
APP_DOMAIN=crm-prueba.test

# Si tienes SSL configurado
FORCE_HTTPS=true
SESSION_SECURE_COOKIE=true

LOG_CHANNEL=stack
LOG_LEVEL=error

# Configuración de Base de Datos PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=watercrm_production
DB_USERNAME=watercrm_user
DB_PASSWORD=TU_PASSWORD_SEGURA_AQUI

# Configuración de Caché (si Plesk tiene Redis)
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

# Email (configura con los datos de IONOS)
MAIL_MAILER=smtp
MAIL_HOST=smtp.ionos.es
MAIL_PORT=587
MAIL_USERNAME=tu-email@tu-dominio.com
MAIL_PASSWORD=tu-password-email
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@crm-prueba.test"
MAIL_FROM_NAME="WaterCRM"
```

7. Guarda el archivo

### Opción B: Desde SSH

```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/

# Copiar .env.example a .env
cp .env.example .env

# Editar con nano
nano .env
```

---

## 🗄️ PASO 5: Crear Base de Datos PostgreSQL

1. Ve a **"Bases de datos"** en Plesk
2. Click en **"Agregar base de datos"** o **"Add Database"**

**Configuración:**
```
Tipo:             PostgreSQL
Nombre:           watercrm_production
Usuario:          watercrm_user
Contraseña:       [Genera una segura]
```

3. **IMPORTANTE**: Anota estos datos para el paso anterior (.env)
4. Click **"OK"**

---

## 📦 PASO 6: Instalar Dependencias de Composer

### Opción A: Desde Laravel Toolkit de Plesk (si está disponible)

1. Ve a **"Aplicaciones"** → **"Laravel"**
2. Busca **"Composer"**
3. Click en **"Install Dependencies"** o ejecuta comando:
   ```
   composer install --no-dev --optimize-autoloader
   ```

### Opción B: Desde SSH

```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/

# Si Plesk tiene composer global
composer install --no-dev --optimize-autoloader

# Si no hay composer, descárgalo primero
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php composer.phar install --no-dev --optimize-autoloader
```

---

## 🔐 PASO 7: Configurar Permisos y Ejecutar Comandos Artisan

### Desde SSH (Recomendado)

```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/

# Establecer permisos correctos
chmod -R 755 .
chmod -R 775 storage bootstrap/cache
chown -R crm-prueba.test_kovfbpusm6d:psaserv .

# Generar clave de aplicación
php artisan key:generate --force

# Ejecutar migraciones
php artisan migrate --force

# Crear enlace simbólico para storage
php artisan storage:link

# Optimizar aplicación
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Para multi-tenancy
php artisan tenants:migrate --force
```

### Desde Laravel Toolkit de Plesk

Si Plesk tiene Laravel Toolkit:
1. Ve a **"Laravel"** en tu dominio
2. Busca **"Artisan Console"**
3. Ejecuta uno por uno:
   - `key:generate --force`
   - `migrate --force`
   - `storage:link`
   - `config:cache`
   - `route:cache`
   - `view:cache`

---

## 🌐 PASO 8: Verificar Configuración de PHP

1. Ve a **"Sitios web y dominios"** → **"crm-prueba.test"**
2. Click en **"Configuración de PHP"**

**Requisitos mínimos:**
```
Versión PHP:              8.2 o 8.3
memory_limit:             256M (mínimo)
upload_max_filesize:      10M
post_max_size:            12M
max_execution_time:       120
```

**Extensiones requeridas (habilitar):**
- ✅ pgsql
- ✅ pdo_pgsql
- ✅ mbstring
- ✅ openssl
- ✅ tokenizer
- ✅ xml
- ✅ ctype
- ✅ json
- ✅ bcmath
- ✅ curl
- ✅ gd (para imágenes)
- ✅ zip

---

## 🔄 PASO 9: Configurar Deployment Automático (Opcional)

Para que se actualice automáticamente con cada push a GitHub:

### A. Generar Webhook en GitHub

1. Ve a tu repositorio: https://github.com/Trafficker3rk5/WaterCRM
2. Click **"Settings"** → **"Webhooks"**
3. Click **"Add webhook"**

```
Payload URL:     https://crm-prueba.test/deploy.php
Content type:    application/json
Secret:          [genera uno aleatorio]
Events:          Just the push event
```

### B. Crear Script de Deployment

Crea el archivo `/httpdocs/public/deploy.php`:

```php
<?php
// Script ejecutado por webhook de GitHub
$secret = 'TU_SECRET_AQUI'; // El mismo del webhook

// Verificar secreto de GitHub
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$payload = file_get_contents('php://input');
$hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);

if (!hash_equals($signature, $hash)) {
    http_response_code(403);
    die('Forbidden');
}

// Ejecutar deployment
$output = shell_exec('/var/www/vhosts/crm-prueba.test/deploy.sh 2>&1');

echo "Deployment ejecutado:\n";
echo $output;
```

### C. Crear Script Bash de Deployment

Crea el archivo `/var/www/vhosts/crm-prueba.test/deploy.sh`:

```bash
#!/bin/bash
cd /var/www/vhosts/crm-prueba.test/httpdocs

# Activar modo mantenimiento
php artisan down

# Pull cambios
git pull origin claude/fix-laravel-github-path-g0Yhx

# Instalar dependencias
composer install --no-dev --optimize-autoloader

# Ejecutar migraciones
php artisan migrate --force

# Limpiar y reconstruir caché
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Permisos
chmod -R 775 storage bootstrap/cache

# Desactivar modo mantenimiento
php artisan up

echo "Deployment completado: $(date)"
```

Hacer ejecutable:
```bash
chmod +x /var/www/vhosts/crm-prueba.test/deploy.sh
```

---

## ✅ PASO 10: Verificar que Todo Funciona

1. **Verificar archivos**:
   - Ve a Administrador de archivos → `/httpdocs/public/`
   - Debes ver: `index.php`, `.htaccess`

2. **Probar en navegador**:
   - Abre: `http://crm-prueba.test` o `http://217.154.186.92`
   - Deberías ver la página de login de WaterCRM

3. **Verificar logs**:
   - Si hay errores, ve a: `/httpdocs/storage/logs/laravel.log`

4. **Verificar Apache**:
   - Ve a **"Herramientas y configuración"** → **"Gestión de servicios"**
   - "Servidor web (Apache)" debe estar **"En ejecución"** (verde)

---

## 🐛 Solución de Problemas Comunes

### Error 500 - Internal Server Error

**Causas comunes:**
1. `.env` no configurado correctamente
2. `APP_KEY` no generado
3. Permisos incorrectos en `storage/`

**Solución:**
```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs
php artisan key:generate --force
chmod -R 775 storage bootstrap/cache
```

### Error 404 - Not Found en todas las rutas excepto /

**Causa:** Mod_rewrite no está habilitado o `.htaccess` no funciona

**Solución:**
1. Verifica que `.htaccess` existe en `/httpdocs/public/`
2. Verifica configuración Apache en Plesk (PASO 3)
3. Asegúrate que `AllowOverride All` está configurado

### Base de datos no conecta

**Solución:**
1. Verifica credenciales en `.env`
2. Verifica que PostgreSQL está corriendo en Plesk
3. Ejecuta:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

### Página en blanco (white screen)

**Solución:**
1. Activa modo debug temporalmente en `.env`:
   ```
   APP_DEBUG=true
   ```
2. Recarga la página y ve el error específico
3. Revisa logs: `/httpdocs/storage/logs/laravel.log`

### Apache no inicia

**Si Apache sigue sin iniciar después de todo:**
1. Contacta a soporte de IONOS inmediatamente
2. Usa el mensaje del script que te di anteriormente
3. Mientras tanto, considera usar **Railway.app** como alternativa

---

## 📊 Checklist Final

Antes de dar por terminada la configuración:

- [ ] Repositorio clonado en `/httpdocs/`
- [ ] Document Root configurado a `/httpdocs/public`
- [ ] Archivo `.env` creado y configurado
- [ ] Base de datos PostgreSQL creada
- [ ] Dependencias de Composer instaladas
- [ ] `php artisan key:generate` ejecutado
- [ ] Migraciones ejecutadas (`php artisan migrate`)
- [ ] Permisos configurados (775 en storage/)
- [ ] Extensiones PHP habilitadas (pgsql, pdo_pgsql, etc.)
- [ ] Configuración Apache aplicada
- [ ] Apache iniciado y funcionando
- [ ] Página de WaterCRM visible en el navegador
- [ ] SSL configurado (opcional)
- [ ] Webhook GitHub configurado (opcional)

---

## 🚀 Alternativa: Railway.app

Si tienes problemas persistentes con Plesk/IONOS, Railway es MUCHO más simple:

1. Ve a: https://railway.app
2. Crea cuenta con GitHub
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Selecciona: `Trafficker3rk5/WaterCRM`
5. Agrega PostgreSQL: **"+ New"** → **"Database"** → **"PostgreSQL"**
6. Railway detecta Laravel automáticamente
7. Configura variables de entorno (Railway las sugiere)
8. Deploy automático en 3-5 minutos

**Ventajas:**
- ✅ Deployment automático con cada push
- ✅ PostgreSQL incluido y configurado
- ✅ SSL automático
- ✅ $5 de crédito gratis
- ✅ Logs en tiempo real
- ✅ Rollback con un click

---

## 📞 Soporte

Si necesitas ayuda adicional:

1. **Soporte IONOS**: https://www.ionos.es/ayuda
2. **Documentación Plesk**: https://docs.plesk.com
3. **Laravel Deployment**: https://laravel.com/docs/deployment

---

**Creado para WaterCRM**
Última actualización: 2025-12-29
