# ✅ SOLUCIÓN: ERR_CONNECTION_REFUSED

## 🎯 Problema Identificado

**Síntoma reportado:**
- Terminal: `curl http://217.154.186.92` devuelve **HTTP 302** ✓
- Navegador: **ERR_CONNECTION_REFUSED** ✗

**Causa raíz:**
En Plesk, la arquitectura es: `nginx (puerto 80) → Apache (puerto 7080)`

Si **nginx NO está corriendo** o **no está configurado correctamente**:
- Los navegadores intentan conectar al puerto 80 y fallan (ERR_CONNECTION_REFUSED)
- curl puede funcionar si accedes directamente a localhost:7080

**Otras causas posibles:**
1. El navegador está intentando usar **HTTPS** en lugar de **HTTP**
2. El puerto 80 no está escuchando
3. La configuración de nginx no existe o está incorrecta

---

## 🚀 SOLUCIÓN INMEDIATA

### En el servidor de producción:

```bash
cd /var/www/vhosts/crm-prueba.test/public

# 1. Descargar el script principal
curl -o deploy-fix-complete.sh \
  https://raw.githubusercontent.com/Trafficker3rk5/WaterCRM/claude/fix-laravel-github-path-g0Yhx/deploy-fix-complete.sh

chmod +x deploy-fix-complete.sh

# 2. Ejecutar el script
./deploy-fix-complete.sh
```

Este script:
- ✅ Verifica si nginx está corriendo
- ✅ Verifica si Apache está corriendo
- ✅ Verifica puertos 80 y 7080
- ✅ Intenta iniciar servicios automáticamente
- ✅ Diagnostica la causa del problema
- ✅ Proporciona instrucciones específicas

---

## 🔍 Si el problema persiste

### Ejecutar script especializado:

```bash
# Descargar script de diagnóstico
curl -o fix-connection-refused.sh \
  https://raw.githubusercontent.com/Trafficker3rk5/WaterCRM/claude/fix-laravel-github-path-g0Yhx/fix-connection-refused.sh

chmod +x fix-connection-refused.sh

# Ejecutar
./fix-connection-refused.sh
```

Este script te dirá **exactamente** cuál es el problema:
- ¿nginx está corriendo?
- ¿El puerto 80 está escuchando?
- ¿Apache está corriendo?
- ¿Qué servicio necesita iniciarse?

---

## ⚙️ Configuración de nginx

Si nginx no está configurado correctamente:

```bash
# 1. Descargar configuración de nginx
curl -o nginx-plesk-proxy.conf \
  https://raw.githubusercontent.com/Trafficker3rk5/WaterCRM/claude/fix-laravel-github-path-g0Yhx/config/nginx-plesk-proxy.conf

# 2. Copiar al directorio correcto (puede variar según instalación)
# Opción A - Sites enabled:
sudo cp nginx-plesk-proxy.conf /etc/nginx/sites-enabled/crm-prueba.test.conf

# Opción B - Plesk conf.d:
sudo cp nginx-plesk-proxy.conf /etc/nginx/plesk.conf.d/vhosts/crm-prueba.test.conf

# 3. Verificar configuración
sudo nginx -t

# 4. Recargar nginx
sudo systemctl reload nginx

# 5. Verificar que está corriendo
sudo systemctl status nginx
```

---

## 🌐 CÓMO ACCEDER AL NAVEGADOR

### ✅ CORRECTO:

Escribe exactamente esto en la barra de direcciones:

```
http://217.154.186.92
```

**Importante:** Debe empezar con `http://` (NO `https://`)

### ❌ INCORRECTO (causará ERR_CONNECTION_REFUSED):

```
https://217.154.186.92   ← NO usar HTTPS
217.154.186.92           ← Sin protocolo, navegador asume HTTPS
```

### 💡 Tips:

1. **Si el navegador fuerza HTTPS automáticamente:**
   - Prueba en **modo incógnito/privado**
   - Limpia la caché del navegador
   - Prueba otro navegador (Firefox, Chrome, Edge, Safari)

2. **En la barra de direcciones:**
   - Chrome: Verifica que diga "No seguro" (normal para HTTP)
   - Firefox: Verifica que NO haya candado
   - Si hay candado, está usando HTTPS (incorrecto)

3. **Algunos navegadores modernos fuerzan HTTPS:**
   - Firefox Developer Edition
   - Chrome con HSTS preload activado
   - Brave Browser

---

## 📊 Verificación Manual

### Verificar nginx:

```bash
# ¿Está corriendo?
sudo systemctl status nginx

# Iniciar si no está corriendo
sudo systemctl start nginx
sudo systemctl enable nginx

# Ver logs
sudo journalctl -u nginx -n 50
```

### Verificar Apache:

```bash
# ¿Está corriendo?
sudo systemctl status apache2

# Iniciar si no está corriendo
sudo systemctl restart apache2
sudo systemctl enable apache2

# Ver logs
sudo journalctl -u apache2 -n 50
```

### Verificar puertos:

```bash
# Ver qué está escuchando
sudo ss -tlnp | grep -E ":(80|7080)"

# Debería mostrar:
# *:80    ... nginx
# *:7080  ... apache2
```

### Probar conectividad:

```bash
# Probar Apache directamente (puerto 7080)
curl -I http://127.0.0.1:7080

# Probar nginx (puerto 80)
curl -I http://127.0.0.1:80

# Probar IP pública
curl -I http://217.154.186.92

# Todos deberían devolver HTTP 200 o 302
```

---

## 🔥 Firewall

Si todo lo anterior funciona pero el navegador externo no puede conectar:

```bash
# Verificar firewall
sudo ufw status

# Si el puerto 80 está bloqueado:
sudo ufw allow 80/tcp
sudo ufw reload

# O con iptables:
sudo iptables -L -n | grep 80

# Permitir puerto 80:
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
```

---

## 📝 Checklist Completo

Ejecuta estos pasos en orden:

- [ ] 1. Ejecutar `./deploy-fix-complete.sh`
- [ ] 2. Verificar que nginx está corriendo: `sudo systemctl status nginx`
- [ ] 3. Verificar que Apache está corriendo: `sudo systemctl status apache2`
- [ ] 4. Verificar puerto 80: `sudo ss -tlnp | grep :80`
- [ ] 5. Verificar puerto 7080: `sudo ss -tlnp | grep :7080`
- [ ] 6. Probar curl local: `curl -I http://127.0.0.1:80`
- [ ] 7. Probar curl público: `curl -I http://217.154.186.92`
- [ ] 8. Abrir navegador en **modo incógnito**
- [ ] 9. Escribir: `http://217.154.186.92` (con http://)
- [ ] 10. Si falla, ejecutar: `./fix-connection-refused.sh`

---

## 📚 Documentación Adicional

Para más información, consulta:

- **SCRIPTS-DEPLOYMENT.md** - Descripción completa de todos los scripts
- **GUIA-PRUEBAS.md** - Guía paso a paso de pruebas
- **DEPLOYMENT-PLESK.md** - Guía completa de despliegue en Plesk

---

## 🎓 Resumen Técnico

### Arquitectura Plesk:

```
Internet (puerto 80/443)
    ↓
nginx (proxy reverso)
    ↓ proxy_pass http://127.0.0.1:7080
Apache (servidor web)
    ↓ fastcgi
PHP-FPM
    ↓
Laravel (WaterCRM)
```

### Por qué ERR_CONNECTION_REFUSED:

1. **nginx detenido** → Puerto 80 cerrado → Navegador no puede conectar
2. **nginx mal configurado** → No hace proxy a Apache → 502 Bad Gateway
3. **Navegador usa HTTPS** → Puerto 443 cerrado → ERR_CONNECTION_REFUSED

### Solución:

1. Asegurar que nginx esté corriendo
2. Asegurar que nginx esté configurado como proxy a Apache:7080
3. Asegurar que navegador use HTTP (no HTTPS)

---

## ✅ Resultado Esperado

Cuando todo funcione, deberías ver:

```
✓ nginx: CORRIENDO
✓ Apache: CORRIENDO
✓ Puerto 80: ESCUCHANDO
✓ Puerto 7080: ESCUCHANDO
✓ HTTP 127.0.0.1:80: 200 o 302
✓ HTTP 217.154.186.92: 200 o 302
```

Y en el navegador (con `http://217.154.186.92`):
- Pantalla de login de WaterCRM, o
- Página de inicio de Laravel, o
- Error 500 (que significa que Apache/Laravel responden, solo hay error de aplicación)

---

**Fecha:** 2025-12-31
**Branch:** claude/fix-laravel-github-path-g0Yhx
**Estado:** Scripts listos para usar en producción
