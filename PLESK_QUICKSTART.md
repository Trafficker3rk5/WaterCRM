# 🚀 Inicio Rápido - WaterCRM en Plesk/IONOS

Guía rápida de 5 minutos para conectar tu repositorio GitHub con Plesk.

---

## ⚡ TL;DR - Solución Inmediata

### El Problema que Tienes Ahora

```
Error: fatal: Ruta no válida '/var/www/vhosts/crm-prueba.test/public'
```

### La Causa

❌ **Document Root configurado mal**: `/public/WaterCRM-claude-new-crm-system-dro2n/public`
✅ **Document Root correcto**: `/httpdocs/public`

### La Solución en 3 Pasos

#### 1️⃣ Limpiar httpdocs

En Plesk → Administrador de archivos → `/httpdocs/`:
- Borra TODO el contenido actual
- Debe quedar vacío

#### 2️⃣ Clonar desde GitHub

**Opción A: Git Toolkit de Plesk** (Recomendado)

```
Sitios web y dominios → crm-prueba.test → Git
├─ URL: https://github.com/Trafficker3rk5/WaterCRM.git
├─ Rama: claude/fix-laravel-github-path-g0Yhx
└─ Directorio: /httpdocs/
```

**Opción B: SSH**

```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/
git clone -b claude/fix-laravel-github-path-g0Yhx \
  https://github.com/Trafficker3rk5/WaterCRM.git .
```

#### 3️⃣ Configurar Document Root

Plesk → Configuración de alojamiento:

```
Raíz del documento: /httpdocs/public
```

En "Configuración adicional de Apache":

```apache
<Directory /var/www/vhosts/crm-prueba.test/httpdocs/public>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

✅ **LISTO** - Ya puedes usar la herramienta de Laravel de Plesk.

---

## 🔧 Configuración Completa (Después del Clone)

### 1. Ejecutar Script de Configuración

SSH:
```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/
bash setup-plesk.sh
```

Este script automáticamente:
- ✓ Instala dependencias (Composer)
- ✓ Crea .env desde .env.example
- ✓ Genera APP_KEY
- ✓ Configura permisos (storage, bootstrap/cache)
- ✓ Crea enlace simbólico de storage
- ✓ Optimiza para producción

### 2. Configurar Base de Datos

Plesk → Bases de datos → Agregar:
```
Tipo:       PostgreSQL
Nombre:     watercrm_production
Usuario:    watercrm_user
Password:   [genera una segura]
```

Editar `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=watercrm_production
DB_USERNAME=watercrm_user
DB_PASSWORD=tu_password_aqui
```

### 3. Ejecutar Migraciones

```bash
php artisan migrate --force
php artisan tenants:migrate --force
```

### 4. Optimizar

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 🤖 Auto-Deployment (Opcional)

### Configurar Webhook de GitHub

1. **Editar el secret** en `public/deploy.php`:
   ```php
   define('GITHUB_SECRET', 'tu-secret-super-seguro-aqui');
   ```

2. **GitHub** → Settings → Webhooks → Add webhook:
   ```
   Payload URL:   https://crm-prueba.test/deploy.php
   Content type:  application/json
   Secret:        [el mismo de arriba]
   Events:        Just the push event
   ```

3. **Hacer ejecutable** el script:
   ```bash
   chmod +x /var/www/vhosts/crm-prueba.test/deploy.sh
   ```

Ahora cada push a GitHub desplegará automáticamente.

---

## 📋 Checklist de Verificación

Antes de dar por terminado, verifica:

- [ ] Repositorio clonado en `/httpdocs/`
- [ ] Document Root apunta a `/httpdocs/public`
- [ ] Archivo `.env` creado y configurado
- [ ] Base de datos PostgreSQL creada
- [ ] Migraciones ejecutadas sin errores
- [ ] Permisos: `storage/` y `bootstrap/cache/` en 775
- [ ] PHP 8.2+ seleccionado en Plesk
- [ ] Extensiones PHP habilitadas (pgsql, pdo_pgsql, mbstring, etc.)
- [ ] Apache corriendo (verde en Gestión de servicios)
- [ ] Sitio accesible en http://crm-prueba.test

---

## 🐛 Errores Comunes

### Error 500 - Internal Server Error

**Causa**: `.env` mal configurado o permisos incorrectos

**Solución**:
```bash
php artisan key:generate --force
chmod -R 775 storage bootstrap/cache
```

### Error 404 en todas las rutas excepto /

**Causa**: `.htaccess` no funciona o mod_rewrite deshabilitado

**Solución**: Verificar configuración Apache en PASO 3 arriba

### Base de datos no conecta

**Solución**:
```bash
php artisan config:clear
php artisan config:cache
```

Verifica credenciales en `.env`

### Apache no inicia

**Solución**: Contacta soporte de IONOS inmediatamente

---

## 📚 Documentación Completa

Para una guía detallada paso a paso, consulta:

- **[PLESK_SETUP.md](PLESK_SETUP.md)** - Guía completa de deployment
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guía general de deployment
- **[INSTALLATION.md](INSTALLATION.md)** - Instalación y requisitos

---

## 🆘 Soporte

¿Problemas? Revisa:

1. **Logs de Laravel**: `/httpdocs/storage/logs/laravel.log`
2. **Logs de Apache**: Plesk → Logs
3. **Logs de PHP**: Plesk → PHP Settings → Error log

¿Apache no inicia?
- Contacta soporte de IONOS
- O considera Railway.app como alternativa más simple

---

## ✅ Estructura Final Correcta

```
/var/www/vhosts/crm-prueba.test/
├── httpdocs/                       ← Raíz del repositorio
│   ├── app/
│   ├── bootstrap/
│   │   └── cache/                  ← 775
│   ├── config/
│   ├── database/
│   ├── public/                     ← Document Root apunta AQUÍ
│   │   ├── .htaccess               ← Optimizado para Plesk
│   │   ├── index.php
│   │   ├── deploy.php              ← Webhook GitHub
│   │   └── storage/                ← Symlink
│   ├── resources/
│   ├── routes/
│   ├── storage/                    ← 775
│   │   ├── app/
│   │   ├── framework/
│   │   └── logs/
│   ├── vendor/
│   ├── .env                        ← Configuración (NO en Git)
│   ├── .env.plesk                  ← Plantilla para Plesk
│   ├── artisan
│   ├── composer.json
│   ├── deploy.sh                   ← Script deployment (755)
│   └── setup-plesk.sh              ← Script inicial (755)
└── deploy.sh                       ← Script raíz (opcional)
```

---

**¡Listo para producción en minutos! 🎉**
