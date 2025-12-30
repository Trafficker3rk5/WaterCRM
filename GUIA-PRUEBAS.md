# Guía de Pruebas - WaterCRM en IONOS/Plesk

Esta guía te explica paso a paso cómo probar que WaterCRM funciona correctamente en tu servidor IONOS después de aplicar las correcciones.

---

## 📋 PREPARACIÓN

### Datos de tu servidor IONOS:
- **IP Pública:** 217.154.186.92
- **Dominio:** crm-prueba.test
- **Arquitectura:** nginx (puerto 80) → Apache (puerto 7080) → PHP-FPM
- **Base de datos:** MySQL (watercrm_production)
- **Tenant configurado:** demo (con dominios: crm-prueba.test, 217.154.186.92)

---

## 🚀 PASO 1: APLICAR CORRECCIONES EN EL SERVIDOR

### 1.1 Conectarse al servidor vía SSH

```bash
# Desde tu terminal local
ssh root@217.154.186.92
# O usa la terminal de Plesk
```

### 1.2 Navegar al directorio de la aplicación

```bash
cd /var/www/vhosts/crm-prueba.test/public
```

### 1.3 Descargar y ejecutar script de despliegue

```bash
# Descargar el script actualizado
curl -o deploy-watercrm.sh https://raw.githubusercontent.com/Trafficker3rk5/WaterCRM/claude/fix-laravel-github-path-g0Yhx/deploy-watercrm.sh

# Hacer ejecutable
chmod +x deploy-watercrm.sh

# Ejecutar (aplicará todas las correcciones)
./deploy-watercrm.sh
```

### 1.4 Verificar la salida del script

Deberías ver **TODAS** estas líneas:

```
✓ config/tenancy.php actualizado
✓ TenancyServiceProvider actualizado
✓ RouteServiceProvider actualizado (rutas duplicadas corregidas)
✓ AppServiceProvider actualizado (HTTPS condicional)
✓ Modelo Tenant actualizado
✓ create-tenant-manual.sh descargado y hecho ejecutable

✓ RouteServiceProvider corregido (sin rutas duplicadas)
✓ AppServiceProvider con HTTPS condicional

✓ Config cached
✓ Routes cached  ← MUY IMPORTANTE: Debe completar SIN ERRORES

✓ HTTP 200 - Aplicación responde correctamente
```

**Si ves errores en `Routes cached`, reporta cuál es el error.**

---

## 🖥️ PASO 2: PRUEBAS DESDE TERMINAL (SSH)

### 2.1 Verificar que NO redirige a HTTPS

```bash
curl -I http://217.154.186.92
```

**✅ SALIDA CORRECTA:**
```
HTTP/1.1 302 Found
Location: http://217.154.186.92/login   ← DEBE SER HTTP (no https)
```

**❌ SALIDA INCORRECTA:**
```
Location: https://217.154.186.92/login  ← Si ves HTTPS, hay problema
```

Si ves `https`, ejecuta:
```bash
# Verificar .env
grep FORCE_HTTPS .env

# Si dice FORCE_HTTPS=true, cambiarlo a false
sed -i 's/FORCE_HTTPS=true/FORCE_HTTPS=false/' .env

# Limpiar cache
php artisan config:clear
php artisan config:cache
```

### 2.2 Verificar que la página de login se carga

```bash
curl http://217.154.186.92/login 2>/dev/null | grep -i "login\|watercrm\|csrf"
```

**✅ SALIDA CORRECTA:** Deberías ver HTML con:
```
<title>Login - WaterCRM</title>
<input type="hidden" name="_token" ...
<input type="email" ...
<input type="password" ...
```

### 2.3 Verificar que route:cache funciona

```bash
php artisan route:cache
```

**✅ SALIDA CORRECTA:**
```
   INFO  Routes cached successfully.
```

**❌ SALIDA INCORRECTA:**
```
Unable to prepare route [api/login] for serialization...
```

Si ves el error, reporta y verificaremos el RouteServiceProvider.

### 2.4 Verificar tenant y dominios

```bash
php artisan tinker --execute="
echo 'Tenants: ' . \App\Models\Main\Tenant::count() . PHP_EOL;
echo 'Dominios: ' . DB::table('domains')->count() . PHP_EOL;
\$tenant = \App\Models\Main\Tenant::with('domains')->first();
if (\$tenant) {
    echo 'Tenant ID: ' . \$tenant->id . PHP_EOL;
    echo 'Dominios: ' . \$tenant->domains->pluck('domain')->implode(', ') . PHP_EOL;
}
"
```

**✅ SALIDA CORRECTA:**
```
Tenants: 1
Dominios: 2
Tenant ID: demo
Dominios: crm-prueba.test, 217.154.186.92
```

### 2.5 Verificar logs (en caso de errores)

```bash
# Ver últimos errores de Laravel
tail -50 storage/logs/laravel.log

# Ver errores de Apache
tail -50 /var/www/vhosts/system/crm-prueba.test/logs/error_log
```

---

## 🌐 PASO 3: PRUEBAS DESDE NAVEGADOR

### 3.1 Acceso por IP pública

1. **Abrir navegador** (Chrome, Firefox, Edge, Safari)
2. **Ir a:** `http://217.154.186.92`

**✅ RESULTADO CORRECTO:**
- Te redirige a `http://217.154.186.92/login` (sin cambiar a HTTPS)
- Ves la página de login de WaterCRM
- Formulario con campos Email y Password

**❌ RESULTADO INCORRECTO:**
- Si redirige a `https://217.154.186.92/login` → Problema con FORCE_HTTPS
- Si ves error 500 → Verificar logs con comando del paso 2.5
- Si ves página por defecto de Plesk → Apache no está configurado correctamente

### 3.2 Captura de pantalla esperada

La página de login debería verse así:

```
┌─────────────────────────────────────────┐
│  WaterCRM Logo                          │
│                                         │
│  Iniciar Sesión                         │
│                                         │
│  Email    [________________]            │
│  Password [________________]            │
│                                         │
│  [ ] Recordarme                         │
│                                         │
│  [  Iniciar Sesión  ]                   │
│                                         │
│  ¿Olvidaste tu contraseña?              │
└─────────────────────────────────────────┘
```

### 3.3 Verificar que NO hay errores en Consola del navegador

1. **Presionar F12** (abrir Developer Tools)
2. **Ir a pestaña "Console"**
3. **Verificar que NO hay errores rojos**

**✅ CORRECTO:** Solo advertencias (warnings) en amarillo o nada
**❌ INCORRECTO:** Errores rojos (especialmente errores 404 o 500)

### 3.4 Verificar recursos (CSS, JavaScript)

1. **En Developer Tools → Pestaña "Network"**
2. **Recargar la página (F5)**
3. **Verificar que todos los recursos cargan con código 200**

Deberías ver:
```
login                  200  HTML
app.css               200  CSS
app.js                200  JavaScript
logo.png              200  Image
```

**Si ves códigos 404:** Algún archivo no se encuentra (no crítico para login)
**Si ves códigos 500:** Error del servidor (verificar logs)

---

## 🧪 PASO 4: PRUEBAS FUNCIONALES

### 4.1 Intentar login (esperando fallo - no hay usuario)

1. Ingresar email: `test@test.com`
2. Ingresar password: `password`
3. Click en "Iniciar Sesión"

**✅ RESULTADO ESPERADO:**
```
Mensaje de error: "Credenciales incorrectas" o "Usuario no encontrado"
```

**Esto es CORRECTO** - significa que Laravel está procesando el formulario.

**❌ RESULTADO INCORRECTO:**
- Error 500 → Problema de configuración
- Página en blanco → Error de JavaScript
- No pasa nada → Error de CSRF token

### 4.2 Crear usuario de prueba (desde terminal SSH)

```bash
php artisan tinker --execute="
\$user = new \App\Models\User();
\$user->name = 'Admin Test';
\$user->email = 'admin@watercrm.com';
\$user->password = bcrypt('password123');
\$user->save();
echo 'Usuario creado: ' . \$user->email . PHP_EOL;
"
```

### 4.3 Intentar login con usuario creado

1. Volver al navegador
2. Email: `admin@watercrm.com`
3. Password: `password123`
4. Click en "Iniciar Sesión"

**✅ RESULTADO CORRECTO:**
- Te lleva al dashboard `/dashboard`
- Ves el panel de WaterCRM
- No hay errores

**❌ RESULTADO INCORRECTO:**
- Error 500 → Verificar logs
- No redirige → Verificar configuración de sesiones

---

## 🔧 PASO 5: PRUEBAS ADICIONALES

### 5.1 Verificar que el sistema multi-tenant funciona

```bash
# Acceder con el dominio específico del tenant
curl -H "Host: 217.154.186.92" http://127.0.0.1:7080/login 2>/dev/null | grep -i "login"
```

Debería devolver HTML de login.

### 5.2 Crear un tenant adicional (opcional)

```bash
./create-tenant-manual.sh cliente1 cliente1.watercrm.com
```

Luego seguir las instrucciones para crear la base de datos.

---

## 📊 CHECKLIST COMPLETO

Marca cada item cuando lo completes:

### En Terminal SSH:
- [ ] Script `deploy-watercrm.sh` ejecutado sin errores
- [ ] `curl http://217.154.186.92` redirige a HTTP (no HTTPS)
- [ ] `php artisan route:cache` funciona sin errores
- [ ] Tenant "demo" existe con 2 dominios
- [ ] No hay errores en `storage/logs/laravel.log`

### En Navegador:
- [ ] `http://217.154.186.92` carga la página de login
- [ ] NO redirige a HTTPS
- [ ] CSS y JavaScript cargan correctamente (código 200)
- [ ] No hay errores rojos en Console (F12)
- [ ] Formulario de login funciona (muestra error de credenciales)
- [ ] Login con usuario real funciona y lleva al dashboard

### Configuración:
- [ ] `.env` tiene `FORCE_HTTPS=false`
- [ ] `.env` tiene `APP_DEBUG=false` (o true si estás probando)
- [ ] `.env` tiene `APP_URL=http://217.154.186.92`

---

## ❓ SOLUCIÓN DE PROBLEMAS COMUNES

### Problema 1: Redirige a HTTPS

**Solución:**
```bash
cd /var/www/vhosts/crm-prueba.test/public
grep FORCE_HTTPS .env
# Si dice true, cambiar a false:
sed -i 's/FORCE_HTTPS=true/FORCE_HTTPS=false/' .env
php artisan config:clear
php artisan config:cache
```

### Problema 2: Error "route:cache" falla

**Solución:**
```bash
# Re-ejecutar deploy
./deploy-watercrm.sh

# Verificar que RouteServiceProvider fue actualizado
grep "CORREGIDO" app/Providers/RouteServiceProvider.php
```

### Problema 3: Error 500 al acceder

**Solución:**
```bash
# Habilitar debug
sed -i 's/APP_DEBUG=false/APP_DEBUG=true/' .env
php artisan config:clear

# Ver el error completo
curl http://217.154.186.92/login
```

### Problema 4: Página en blanco

**Solución:**
```bash
# Verificar permisos
chmod -R 775 storage bootstrap/cache
chown -R crm-prueba.test_kovfbpusm6d:psacln storage bootstrap/cache

# Limpiar cachés
php artisan cache:clear
php artisan view:clear
```

---

## 📞 REPORTAR RESULTADOS

Al reportar resultados, incluye:

1. **Salida del comando:** `./deploy-watercrm.sh` (últimas 30 líneas)
2. **Salida de:** `curl -I http://217.154.186.92`
3. **Captura de pantalla** del navegador mostrando la página
4. **Contenido de .env** (solo estas líneas):
   ```bash
   grep -E "APP_DEBUG|FORCE_HTTPS|APP_URL" .env
   ```
5. **Últimas 20 líneas de logs** (si hay errores):
   ```bash
   tail -20 storage/logs/laravel.log
   ```

---

## ✅ RESULTADO ESPERADO FINAL

Si todo funciona correctamente:

✅ **Terminal SSH:**
```
$ curl -I http://217.154.186.92
HTTP/1.1 302 Found
Location: http://217.154.186.92/login

$ php artisan route:cache
INFO  Routes cached successfully.
```

✅ **Navegador:**
- URL: `http://217.154.186.92/login`
- Página de login visible
- Sin errores en console
- Login funcional

✅ **Sistema:**
- Multi-tenancy funcionando
- Base de datos conectada
- Sin errores en logs

---

**¡Listo para usar WaterCRM!** 🎉
