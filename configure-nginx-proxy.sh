#!/bin/bash
################################################################################
# Script para configurar nginx como proxy reverso a Apache en Plesk
# Ejecutar en el servidor Plesk con acceso root
#
# nginx (puerto 80) -> Apache (puerto 8080)
################################################################################

set -e

echo "=========================================="
echo "Configurando nginx como proxy reverso"
echo "=========================================="
echo ""

DOMAIN="crm-prueba.test"
IP="217.154.186.92"
NGINX_CONF="/etc/nginx/conf.d/${DOMAIN}_proxy.conf"

# 1. Verificar que Apache esté corriendo en 8080
echo "[1/4] Verificando Apache en puerto 8080..."
if netstat -tlnp 2>/dev/null | grep -q ":8080.*apache" || ss -tlnp 2>/dev/null | grep -q ":8080.*apache"; then
    echo "✓ Apache escuchando en puerto 8080"
else
    echo "⚠ Apache no está escuchando en puerto 8080"
    echo "Ejecuta primero: bash fix-apache-ports.sh"
    exit 1
fi

# 2. Crear configuración de nginx como proxy
echo "[2/4] Creando configuración de nginx..."
cat > "$NGINX_CONF" << 'NGINX_EOF'
# Proxy reverso para WaterCRM
# nginx (80/443) -> Apache (8080/8443)

server {
    listen 80;
    listen [::]:80;
    server_name 217.154.186.92 crm-prueba.test;

    # Logs
    access_log /var/log/nginx/watercrm_access.log;
    error_log /var/log/nginx/watercrm_error.log;

    # Proxy headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;

    # Timeouts
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;

    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;

    # Proxy pass a Apache
    location / {
        proxy_pass http://127.0.0.1:8080;
    }

    # Archivos estáticos - servir directamente (opcional)
    # location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|otf|eot)$ {
    #     root /var/www/vhosts/crm-prueba.test/public/public;
    #     expires 1y;
    #     access_log off;
    # }
}

# HTTPS (descomentar cuando tengas certificado SSL)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name 217.154.186.92 crm-prueba.test;
#
#     ssl_certificate /path/to/cert.pem;
#     ssl_certificate_key /path/to/key.pem;
#
#     # Proxy headers (igual que arriba)
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
#     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     proxy_set_header X-Forwarded-Proto $scheme;
#
#     location / {
#         proxy_pass http://127.0.0.1:8080;
#     }
# }
NGINX_EOF

echo "✓ Configuración de nginx creada en $NGINX_CONF"

# 3. Verificar sintaxis de nginx
echo "[3/4] Verificando configuración de nginx..."
if nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo "✓ Configuración de nginx válida"
else
    echo "✗ Error en configuración de nginx:"
    nginx -t
    exit 1
fi

# 4. Recargar nginx
echo "[4/4] Recargando nginx..."
systemctl reload nginx

if systemctl is-active --quiet nginx; then
    echo "✓ nginx recargado correctamente"
else
    echo "✗ nginx no pudo recargarse"
    systemctl status nginx --no-pager -l | tail -20
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ nginx configurado como proxy reverso"
echo "=========================================="
echo ""
echo "Verifica la configuración:"
echo "  curl -I http://217.154.186.92"
echo ""
echo "O abre en navegador:"
echo "  http://217.154.186.92"
echo "  http://crm-prueba.test"
echo ""
