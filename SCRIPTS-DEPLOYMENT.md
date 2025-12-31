# Scripts de Despliegue para WaterCRM

Este documento describe los scripts disponibles para el despliegue y resolución de problemas en WaterCRM.

## 📋 Scripts Disponibles

### 1. `deploy-fix-complete.sh` ⭐ **RECOMENDADO**

**Script principal de despliegue completo.**

```bash
./deploy-fix-complete.sh
```

**Qué hace:**
- ✅ Limpia todos los cachés de Laravel
- ✅ Configura `.env` correctamente (FORCE_HTTPS=false)
- ✅ Verifica estado de nginx y Apache
- ✅ Verifica puertos 80 y 7080
- ✅ Intenta corregir servicios automáticamente
- ✅ Verifica permisos de archivos
- ✅ Prueba conectividad HTTP
- ✅ Proporciona diagnóstico completo
- ✅ Muestra instrucciones claras para acceder

**Cuándo usar:**
- Primera vez desplegando en Plesk
- Después de hacer cambios en el código
- Cuando necesitas verificar que todo funciona
- Como diagnóstico general

---

### 2. `fix-connection-refused.sh`

**Script especializado para resolver ERR_CONNECTION_REFUSED en el navegador.**

```bash
./fix-connection-refused.sh
```

**Qué hace:**
- 🔍 Diagnostica por qué el navegador no puede conectar
- 🔍 Verifica si nginx está corriendo
- 🔍 Verifica si los puertos están escuchando
- 🔧 Intenta iniciar nginx/Apache si están detenidos
- 📝 Proporciona instrucciones específicas según el problema

**Cuándo usar:**
- Cuando ves ERR_CONNECTION_REFUSED en el navegador
- Cuando curl funciona pero el navegador no
- Para diagnosticar problemas de nginx

---

### 3. `fix-final.sh`

**Script de reparación sin usar route:cache.**

```bash
./fix-final.sh
```

**Qué hace:**
- 🧹 Limpia todos los cachés
- ⚙️ Configura FORCE_HTTPS=false
- 🔄 Reinicia Apache
- ✅ Verifica estado del servidor

**Cuándo usar:**
- Cuando hay conflictos de rutas
- Cuando route:cache falla
- Como alternativa más simple a deploy-fix-complete.sh

**Nota:** Este script NO intenta hacer `route:cache` porque hay conflictos de nombres de rutas en el código. Las rutas se cargan dinámicamente.

---

### 4. `fix-server-now.sh`

**Script de reparación rápida que descarga archivos corregidos desde GitHub.**

```bash
./fix-server-now.sh
```

**Qué hace:**
- 📥 Descarga archivos corregidos desde GitHub:
  - `routes/tenant-api.php` (sin conflictos de nombres)
  - `app/Providers/RouteServiceProvider.php` (routes/api.php deshabilitado)
- 🧹 Limpia todos los cachés
- 🔧 Intenta hacer route:cache
- 🔄 Reinicia Apache
- ✅ Verifica estado del servidor

**Cuándo usar:**
- Cuando has actualizado archivos en GitHub y necesitas desplegarlos
- Para obtener las últimas correcciones de rutas
- Cuando quieres probar si route:cache funciona después de correcciones

---

### 5. `diagnostico.sh`

**Script de diagnóstico sin hacer cambios.**

```bash
./diagnostico.sh
```

**Qué hace:**
- 📊 Muestra estado de Apache y nginx
- 📊 Muestra puertos escuchando
- 📊 Prueba accesos HTTP
- 📊 Muestra logs recientes
- 📊 Muestra configuración de .env

**Cuándo usar:**
- Cuando solo quieres ver el estado actual
- Para generar un reporte de diagnóstico
- Antes de hacer cambios

---

## 🎯 Flujo Recomendado

### Primera vez desplegando:

```bash
# 1. Despliegue completo
./deploy-fix-complete.sh

# 2. Si hay problemas de conexión en el navegador
./fix-connection-refused.sh
```

### Después de cambios en el código:

```bash
# 1. Descargar últimas correcciones desde GitHub
./fix-server-now.sh

# 2. Si hay problemas
./deploy-fix-complete.sh
```

### Solo diagnóstico (sin cambios):

```bash
./diagnostico.sh
```

---

## 🔧 Configuración de nginx para Plesk

En Plesk, nginx actúa como **proxy reverso** a Apache:

```
Internet → nginx (puerto 80) → Apache (puerto 7080) → PHP-FPM → Laravel
```

### Archivo de configuración de nginx

Se ha creado un archivo de configuración de ejemplo en:

```
config/nginx-plesk-proxy.conf
```

Este archivo debe copiarse al directorio de configuración de nginx:

```bash
sudo cp config/nginx-plesk-proxy.conf /etc/nginx/sites-enabled/crm-prueba.test.conf

# O en Plesk:
sudo cp config/nginx-plesk-proxy.conf /etc/nginx/plesk.conf.d/vhosts/crm-prueba.test.conf

# Verificar configuración
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

---

## ❌ Problema Común: ERR_CONNECTION_REFUSED

### Síntoma:
- `curl http://217.154.186.92` funciona (devuelve 302)
- Navegador muestra: "ERR_CONNECTION_REFUSED"

### Causa más común:
El navegador está intentando usar **HTTPS** en lugar de **HTTP**.

### Solución:

1. **Verifica la URL en el navegador:**
   - ✅ CORRECTO: `http://217.154.186.92`
   - ❌ INCORRECTO: `https://217.154.186.92`
   - ❌ INCORRECTO: `217.154.186.92` (el navegador asume HTTPS)

2. **Si el navegador fuerza HTTPS:**
   - Prueba en modo incógnito
   - Limpia la caché del navegador
   - Prueba otro navegador (Firefox, Edge, Safari)

3. **Verificar nginx:**
   ```bash
   sudo systemctl status nginx
   sudo systemctl start nginx  # Si no está corriendo
   ```

4. **Ejecutar script de diagnóstico:**
   ```bash
   ./fix-connection-refused.sh
   ```

---

## 🐛 Problema: Route Caching Errors

### Síntoma:
```
Unable to prepare route [xxx] for serialization.
Another route has already been assigned name [xxx].
```

### Causa:
Hay rutas duplicadas con el mismo nombre en diferentes archivos de rutas.

### Solución:

**Opción 1: No usar route:cache (actual)**
```bash
./fix-final.sh
```
Las rutas se cargan dinámicamente. Es más lento pero funcional.

**Opción 2: Corregir conflictos de rutas (futuro)**
- Revisar `routes/tenant/main.php`
- Eliminar definiciones manuales de rutas que `Route::resource()` ya crea
- Usar prefijos de nombres diferentes para evitar colisiones

---

## 📝 Logs Importantes

### Laravel:
```bash
tail -50 storage/logs/laravel.log
```

### Apache:
```bash
sudo journalctl -u apache2 -n 50
# O
tail -50 /var/www/vhosts/system/crm-prueba.test/logs/error_log
```

### nginx:
```bash
sudo journalctl -u nginx -n 50
# O
tail -50 /var/log/nginx/error.log
```

---

## ✅ Verificación de Funcionamiento

Un sistema funcionando correctamente debería mostrar:

```
✓ Apache está corriendo
✓ nginx está corriendo
✓ Puerto 80 escuchando (nginx)
✓ Puerto 7080 escuchando (Apache)
✓ HTTP responde con código 200 o 302
✓ IP pública responde con código 302
```

Si todos los checks pasan pero el navegador no funciona, es casi seguro que:
- Estás usando HTTPS en lugar de HTTP
- O hay un firewall externo bloqueando

---

## 🚀 Acceso a la Aplicación

Una vez todo funcione:

### URL de acceso:
```
http://217.154.186.92
```

### IMPORTANTE:
- ✅ Usa **HTTP** (no HTTPS)
- ✅ El puerto 80 debe estar abierto
- ✅ nginx debe estar corriendo
- ✅ Apache debe estar corriendo

### Primera carga:
- Puede mostrar un error 500 inicialmente
- Verifica los logs: `tail -50 storage/logs/laravel.log`
- Las migraciones deben haberse ejecutado correctamente
- El tenant 'demo' debe existir en la base de datos

---

## 📞 Soporte

Si los problemas persisten:

1. Ejecuta `./diagnostico.sh` y guarda el output
2. Revisa los logs de Laravel y Apache
3. Verifica que las migraciones se ejecutaron: `php artisan migrate:status`
4. Verifica que el tenant existe: `php artisan tenants:list`

---

**Última actualización:** 2025-12-31
