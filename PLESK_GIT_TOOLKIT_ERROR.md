# 🚨 SOLUCIÓN AL ERROR: Laravel Toolkit en Plesk

## El Problema

```
fatal: Ruta no válida '/var/www/vhosts/crm-prueba.test/public': No existe el archivo o directorio
```

## ¿Por qué ocurre?

**Estás usando la herramienta EQUIVOCADA en Plesk.**

- ❌ **Laravel Toolkit** → Para GESTIONAR Laravel ya instalado
- ✅ **Git Toolkit** → Para CLONAR repositorios desde GitHub

Laravel Toolkit espera que la aplicación ya exista en `/var/www/vhosts/crm-prueba.test/public`, pero como aún no has clonado el repositorio, esa carpeta no existe.

---

## ✅ SOLUCIÓN: Usar Git Toolkit (NO Laravel Toolkit)

### Paso 1: Acceder a Git Toolkit en Plesk

1. Ve a **"Sitios web y dominios"**
2. Click en **"crm-prueba.test"** (tu dominio)
3. Busca en el panel lateral izquierdo o en las herramientas:
   - **"Git"** o **"Repositorio Git"**
   - NO busques "Laravel"
   - NO uses "Aplicaciones"

**¿No encuentras "Git"?** → Salta a la Opción 2 (SSH)

---

### Paso 2: Agregar Repositorio Git

Una vez en **Git Toolkit**:

1. Click en **"Agregar repositorio"** o **"Add Repository"**

2. Rellena el formulario:

```
┌─────────────────────────────────────────────────┐
│ Agregar repositorio Git                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ URL del repositorio:                            │
│ https://github.com/Trafficker3rk5/WaterCRM.git │
│                                                 │
│ Rama (branch):                                  │
│ claude/fix-laravel-github-path-g0Yhx           │
│                                                 │
│ Ruta de destino:                                │
│ /httpdocs                                       │
│                                                 │
│ Token de acceso (si es privado):                │
│ [deja vacío si es público]                     │
│                                                 │
│ Modo de deployment:                             │
│ ☑ Automático (en cada push)                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

3. Click **"OK"** o **"Agregar"**

4. **Espera 30-60 segundos** mientras Plesk clona el repositorio

---

### Paso 3: Verificar que se clonó correctamente

1. Ve a **"Administrador de archivos"**
2. Navega a `/httpdocs/`
3. Deberías ver:
   ```
   httpdocs/
   ├── app/
   ├── bootstrap/
   ├── config/
   ├── database/
   ├── public/
   ├── resources/
   ├── routes/
   ├── storage/
   ├── vendor/
   ├── .env.example
   ├── artisan
   ├── composer.json
   ├── deploy.sh
   └── setup-plesk.sh
   ```

Si ves esta estructura → **¡Éxito!** Continúa al Paso 4.

---

### Paso 4: Configurar Document Root

1. Ve a **"Sitios web y dominios"** → **"crm-prueba.test"**
2. Click en **"Configuración de alojamiento"**
3. Busca **"Raíz del documento"**
4. Cámbialo a:
   ```
   /httpdocs/public
   ```
   (NO `/public/WaterCRM.../public`)

5. En **"Configuración adicional de Apache & nginx"**, pega:

```apache
<Directory /var/www/vhosts/crm-prueba.test/httpdocs/public>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

6. Click **"Aceptar"**

---

### Paso 5: Ejecutar Configuración Inicial

Tienes 2 opciones:

#### A. Si tienes acceso SSH:

```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/
bash setup-plesk.sh
```

El script te guiará interactivamente.

#### B. Si NO tienes SSH, hazlo manualmente:

1. **Copiar .env**
   - Administrador de archivos → `/httpdocs/`
   - Click derecho en `.env.example` → Copiar
   - Pegar como `.env`

2. **Editar .env**
   - Click derecho en `.env` → Editar
   - Configura la base de datos (ver abajo)
   - Guardar

3. **Instalar Composer** (si Laravel Toolkit está disponible)
   - Ve a Laravel Toolkit (ahora sí puedes usarlo)
   - Click en "Composer" → "Install dependencies"

4. **Configurar permisos** (vía SSH o contacta soporte)

---

## 🗄️ Configuración de Base de Datos

### Crear Base de Datos en Plesk

1. Ve a **"Bases de datos"**
2. Click **"Agregar base de datos"**
3. Configura:
   ```
   Tipo:       PostgreSQL
   Nombre:     watercrm_production
   Usuario:    watercrm_user
   Contraseña: [genera una segura]
   ```
4. Click **"OK"**
5. **Anota las credenciales**

### Editar .env

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=watercrm_production
DB_USERNAME=watercrm_user
DB_PASSWORD=tu_password_aqui
```

---

## 🎉 Verificar que Funciona

1. Abre navegador
2. Ve a: `http://crm-prueba.test`
3. Deberías ver el login de WaterCRM

Si ves un error 500 → Lee la sección de errores abajo.

---

# 📋 OPCIÓN 2: Clonar Manualmente via SSH

Si Git Toolkit no está disponible en tu Plesk:

### 1. Conectar por SSH

Según tu configuración de Plesk, el acceso SSH puede estar deshabilitado. Para habilitarlo:

1. Ve a **"Sitios web y dominios"** → **"crm-prueba.test"**
2. Busca **"Configuración del espacio web"** o **"Hosting Settings"**
3. En **"Acceso SSH"**, cambia a:
   ```
   /bin/bash
   ```
4. Guarda
5. Genera una contraseña si no la tienes

### 2. Conectar

```bash
ssh crm-prueba.test_kovfbpusm6d@217.154.186.92
```

Contraseña: [la que configuraste en Plesk]

### 3. Limpiar httpdocs

```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/

# Backup (por si acaso)
cd ..
tar -czf httpdocs-backup-$(date +%Y%m%d).tar.gz httpdocs/

# Limpiar
cd httpdocs/
rm -rf *
rm -rf .[!.]*
```

### 4. Clonar Repositorio

```bash
git clone -b claude/fix-laravel-github-path-g0Yhx \
  https://github.com/Trafficker3rk5/WaterCRM.git .
```

**Si el repositorio es privado:**

```bash
git clone -b claude/fix-laravel-github-path-g0Yhx \
  https://TU_GITHUB_TOKEN@github.com/Trafficker3rk5/WaterCRM.git .
```

Obtén un token en: https://github.com/settings/tokens

### 5. Ejecutar Setup

```bash
bash setup-plesk.sh
```

---

# 🐛 Errores Comunes

## Error: "No se puede crear .env"

**Solución:**
```bash
chmod 775 /var/www/vhosts/crm-prueba.test/httpdocs/
```

## Error 500 al abrir el sitio

**Solución:**
```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/
php artisan key:generate --force
chmod -R 775 storage bootstrap/cache
```

## Error: "Composer not found"

**Descargar Composer:**
```bash
cd /var/www/vhosts/crm-prueba.test/httpdocs/
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php composer.phar install --no-dev --optimize-autoloader
```

---

# ✅ Checklist Final

- [ ] Repositorio clonado en `/httpdocs/` usando Git Toolkit (NO Laravel Toolkit)
- [ ] Document Root cambiado a `/httpdocs/public`
- [ ] Archivo `.env` creado y configurado
- [ ] Base de datos PostgreSQL creada en Plesk
- [ ] Permisos configurados (775 en storage y bootstrap/cache)
- [ ] Sitio accesible en navegador

---

# 🚨 RESUMEN: ¿Qué herramienta usar?

| Herramienta          | ¿Cuándo usarla?                          | ¿Para qué?                    |
|----------------------|------------------------------------------|-------------------------------|
| **Git Toolkit**      | PRIMERO - Para clonar repositorio       | ✅ Clonar desde GitHub        |
| **Laravel Toolkit**  | DESPUÉS - Cuando Laravel ya está clonado | ✅ Gestionar Laravel          |
| **SSH**              | Si Git Toolkit no está disponible       | ✅ Clonar y configurar manual |

---

**TU ERROR**: Intentaste usar Laravel Toolkit para clonar.
**LA SOLUCIÓN**: Usa Git Toolkit para clonar primero.

---

¿Tienes Git Toolkit en tu Plesk? Si no, usa la Opción 2 (SSH).
