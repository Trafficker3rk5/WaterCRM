# 🎯 Próximos Pasos - Completar Deployment

## Contexto Actual

Tu aplicación WaterCRM está **casi lista** en el servidor Plesk. Solo falta resolver un conflicto de puertos para que Apache pueda iniciar correctamente.

**El problema**: Apache intenta usar el puerto 80, pero nginx ya lo está usando.

**La solución**: Apache debe usar puerto 8080, y nginx actuará como proxy reverso.

---

## ✅ Pasos a Seguir (5 minutos)

### Paso 1: Conectar al Servidor

```bash
ssh crm-prueba.test_kovfbpusm6d@217.154.186.92
```

Cuando te pida la contraseña, ingresa la contraseña de SSH.

Una vez dentro, cambia a root:

```bash
su root
```

Ingresa la contraseña de root cuando te la pida.

---

### Paso 2: Ir al Directorio de la Aplicación

```bash
cd /var/www/vhosts/crm-prueba.test/public/
```

---

### Paso 3: Actualizar los Archivos del Repositorio

```bash
git pull origin claude/fix-laravel-github-path-g0Yhx
```

Esto descargará los nuevos scripts que acabamos de crear.

---

### Paso 4: Corregir los Puertos de Apache

```bash
bash fix-apache-ports.sh
```

Este script:
- ✅ Cambia todos los VirtualHosts de Apache a usar puertos 8080/8443
- ✅ Verifica la configuración
- ✅ Inicia Apache correctamente

**Resultado esperado**: "✓ Apache iniciado correctamente"

---

### Paso 5: Configurar nginx como Proxy Reverso

```bash
bash configure-nginx-proxy.sh
```

Este script:
- ✅ Configura nginx para recibir peticiones en puerto 80
- ✅ Redirige esas peticiones a Apache en puerto 8080
- ✅ Recarga nginx

**Resultado esperado**: "✓ nginx configurado como proxy reverso"

---

### Paso 6: Configurar Document Root en Plesk (UI)

1. Abre Plesk en tu navegador
2. Ve a **Sitios web y dominios**
3. Click en **crm-prueba.test**
4. Click en **Configuración de alojamiento**
5. Busca **"Raíz del documento"** y cámbialo a:
   ```
   /public/public
   ```
6. Scroll hacia abajo hasta **"Configuración adicional de Apache & nginx"**
7. Pega esto:
   ```apache
   <Directory /var/www/vhosts/crm-prueba.test/public/public>
       Options -Indexes +FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   ```
8. Click **Aceptar**

---

### Paso 7: Probar la Aplicación

Abre tu navegador y ve a:

```
http://217.154.186.92
```

**Deberías ver**: La pantalla de login de WaterCRM 🎉

---

## 🐛 Si Algo Sale Mal

### Apache no inicia

```bash
# Ver el error
systemctl status apache2

# Ver logs
tail -20 /var/log/apache2/error.log
```

### nginx devuelve 502 Bad Gateway

```bash
# Verificar que Apache esté corriendo
systemctl status apache2

# Si no está corriendo, iniciarlo
systemctl start apache2
```

### Error 500 en el navegador

```bash
cd /var/www/vhosts/crm-prueba.test/public/
php artisan config:clear
php artisan cache:clear
chmod -R 775 storage bootstrap/cache
```

### Ver logs de Laravel

```bash
tail -50 /var/www/vhosts/crm-prueba.test/public/storage/logs/laravel.log
```

---

## 📋 Checklist de Verificación

Después de completar todos los pasos:

- [ ] SSH conectado al servidor
- [ ] Ejecutado `fix-apache-ports.sh` exitosamente
- [ ] Ejecutado `configure-nginx-proxy.sh` exitosamente
- [ ] Document Root cambiado a `/public/public` en Plesk
- [ ] Aplicación accesible en `http://217.154.186.92`
- [ ] Pantalla de login visible

---

## 📚 Documentación Completa

Si necesitas más detalles, consulta:

- **[DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)** - Estado completo del deployment
- **[PLESK_SETUP.md](PLESK_SETUP.md)** - Guía detallada paso a paso
- **[PLESK_QUICKSTART.md](PLESK_QUICKSTART.md)** - Guía rápida de 5 minutos

---

## 🎉 ¡Eso es Todo!

Una vez que completes estos pasos, tu aplicación WaterCRM estará **completamente funcional** en Plesk.

Si tienes problemas, revisa los logs mencionados arriba o consulta la documentación completa.

**¡Éxito con tu deployment!** 🚀
