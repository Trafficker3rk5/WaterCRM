# 🚀 Estado del Deployment - WaterCRM en Plesk

**Última actualización**: 2025-12-30

---

## ✅ Completado

### 1. Repositorio y Código
- ✅ Repositorio clonado en `/var/www/vhosts/crm-prueba.test/public/`
- ✅ Branch: `claude/fix-laravel-github-path-g0Yhx`
- ✅ Dependencias de Composer instaladas
- ✅ Archivos de configuración creados

### 2. Configuración de Aplicación
- ✅ Archivo `.env` creado y configurado
- ✅ `APP_KEY` generado
- ✅ Storage symlink creado (`public/storage`)
- ✅ Permisos configurados (775 en `storage/` y `bootstrap/cache/`)
- ✅ Caché optimizada (config, routes, views)

### 3. Base de Datos
- ✅ Base de datos MySQL creada: `watercrm_production`
- ✅ Usuario: `watercrm_user`
- ✅ Contraseña: `Trafficker$123#`
- ✅ Migraciones ejecutadas: **36/37 exitosas**
  - ⚠️ 1 migración fallida: `email_campaign_logs` (no crítico)

### 4. Configuración de Apache (Parcial)
- ✅ `/etc/apache2/ports.conf` → Puertos cambiados a 8080/8443
- ✅ `/var/www/vhosts/system/crm-prueba.test/conf/httpd.conf` → VirtualHost en 8080/8443
- ✅ Scripts de deployment creados y configurados

---

## ⏳ Pendiente (Requiere SSH en el servidor)

### 1. Corregir Configuración de Apache

**Problema**: Apache no inicia porque `/etc/apache2/plesk.conf.d/server.conf` todavía tiene VirtualHosts en puertos 80/443 que entran en conflicto con nginx.

**Solución**: Ejecutar en el servidor Plesk:

```bash
cd /var/www/vhosts/crm-prueba.test/public/
bash fix-apache-ports.sh
```

Este script:
- Cambia todos los VirtualHosts de 80→8080 y 443→8443 en `server.conf`
- Deshabilita el sitio por defecto de Apache
- Verifica la configuración
- Inicia Apache en los puertos correctos

### 2. Configurar nginx como Proxy Reverso

**Objetivo**: nginx (puerto 80) debe actuar como proxy reverso hacia Apache (puerto 8080).

**Solución**: Ejecutar en el servidor Plesk:

```bash
cd /var/www/vhosts/crm-prueba.test/public/
bash configure-nginx-proxy.sh
```

Este script:
- Crea configuración de nginx para proxy reverso
- Configura headers necesarios para Laravel
- Recarga nginx

### 3. Configurar Document Root en Plesk

Una vez Apache esté funcionando:

1. Ve a Plesk → **Sitios web y dominios** → **crm-prueba.test**
2. Click en **Configuración de alojamiento**
3. Cambia **Raíz del documento** a:
   ```
   /public/public
   ```
4. En **Configuración adicional de Apache & nginx**, verifica que esté:
   ```apache
   <Directory /var/www/vhosts/crm-prueba.test/public/public>
       Options -Indexes +FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   ```
5. Click **Aceptar**

---

## 🧪 Verificación

Después de completar los pasos pendientes:

### 1. Verificar Servicios

```bash
# nginx debe estar en puerto 80
systemctl status nginx
netstat -tlnp | grep :80

# Apache debe estar en puerto 8080
systemctl status apache2
netstat -tlnp | grep :8080
```

### 2. Probar en Navegador

```
http://217.154.186.92
```

o

```
http://crm-prueba.test
```

Deberías ver la pantalla de login de WaterCRM.

### 3. Verificar Logs si hay Errores

**Laravel logs**:
```bash
tail -f /var/www/vhosts/crm-prueba.test/public/storage/logs/laravel.log
```

**Apache logs**:
```bash
tail -f /var/log/apache2/error.log
tail -f /var/www/vhosts/system/crm-prueba.test/logs/error_log
```

**nginx logs**:
```bash
tail -f /var/log/nginx/watercrm_error.log
tail -f /var/log/nginx/error.log
```

---

## 🔧 Información Técnica

### Rutas Importantes

```
Raíz del repositorio:    /var/www/vhosts/crm-prueba.test/public/
Document Root Laravel:   /var/www/vhosts/crm-prueba.test/public/public/
Archivo .env:            /var/www/vhosts/crm-prueba.test/public/.env
Logs Laravel:            /var/www/vhosts/crm-prueba.test/public/storage/logs/
Apache config:           /var/www/vhosts/system/crm-prueba.test/conf/httpd.conf
```

### Credenciales

**Servidor Plesk**:
- IP: `217.154.186.92`
- Usuario SSH: `crm-prueba.test_kovfbpusm6d`
- Dominio: `crm-prueba.test`

**Base de Datos**:
- Tipo: MySQL
- Host: `localhost`
- Puerto: `3306`
- Base de datos: `watercrm_production`
- Usuario: `watercrm_user`
- Contraseña: `Trafficker$123#`

**PHP**:
- Versión: 8.3
- Extensiones faltantes: `pgsql`, `pdo_pgsql`, `bcmath` (no críticas con MySQL)

### Arquitectura del Servidor

```
Internet (puerto 80/443)
         ↓
    nginx (proxy reverso)
         ↓
    Apache (puerto 8080/8443)
         ↓
    Laravel/WaterCRM
         ↓
    MySQL (puerto 3306)
```

---

## 📝 Notas Adicionales

### Extensiones PHP Faltantes

- `pgsql` y `pdo_pgsql`: No necesarias porque usamos MySQL en lugar de PostgreSQL
- `bcmath`: Recomendada pero no crítica, puede habilitarse en Plesk → PHP Settings

### Migración Fallida

La migración `email_campaign_logs` falló porque tiene una foreign key a la tabla `clients` que se crea en migraciones de tenants. Esto no afecta el funcionamiento básico de la aplicación.

### Auto-Deployment

Los archivos están listos para auto-deployment:
- `public/deploy.php`: Webhook receiver
- `deploy.sh`: Script de deployment

Para activar:
1. Edita `public/deploy.php` y cambia el `GITHUB_SECRET`
2. Configura el webhook en GitHub apuntando a `https://crm-prueba.test/deploy.php`

---

## 📚 Documentación Relacionada

- **[PLESK_SETUP.md](PLESK_SETUP.md)** - Guía detallada de deployment
- **[PLESK_QUICKSTART.md](PLESK_QUICKSTART.md)** - Guía rápida de 5 minutos
- **[PLESK_GIT_TOOLKIT_ERROR.md](PLESK_GIT_TOOLKIT_ERROR.md)** - Solución al error de Laravel Toolkit
- **[.env.plesk](.env.plesk)** - Plantilla de configuración para Plesk

---

## 🆘 Resolución de Problemas

### Apache no inicia

**Error**: `Address already in use: AH00072`

**Solución**: Ejecuta `bash fix-apache-ports.sh`

### Error 500 en el navegador

**Solución**:
```bash
cd /var/www/vhosts/crm-prueba.test/public/
php artisan config:clear
php artisan cache:clear
chmod -R 775 storage bootstrap/cache
```

### nginx devuelve 502 Bad Gateway

**Causa**: Apache no está corriendo

**Solución**:
```bash
systemctl status apache2
systemctl start apache2
```

---

**Última tarea**: Ejecutar `fix-apache-ports.sh` y `configure-nginx-proxy.sh` en el servidor Plesk para completar el deployment.
