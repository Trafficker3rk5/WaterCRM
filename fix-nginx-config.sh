#!/bin/bash
################################################################################
# Script para INSTALAR configuración de nginx correctamente
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

APP_DIR="/var/www/vhosts/crm-prueba.test/public"
REPO_BRANCH="claude/fix-laravel-github-path-g0Yhx"
GITHUB_RAW_URL="https://raw.githubusercontent.com/Trafficker3rk5/WaterCRM/${REPO_BRANCH}"

show_message() {
    echo -e "${GREEN}✓${NC} $1"
}

show_error() {
    echo -e "${RED}✗${NC} $1"
}

show_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

show_header() {
    echo ""
    echo "=========================================================================="
    echo -e "  ${BOLD}$1${NC}"
    echo "=========================================================================="
    echo ""
}

show_header "Instalando Configuración de nginx"

cd "$APP_DIR"

# Determinar dónde poner la configuración
NGINX_CONF_DIR=""

if [ -d "/etc/nginx/plesk.conf.d/vhosts" ]; then
    NGINX_CONF_DIR="/etc/nginx/plesk.conf.d/vhosts"
    show_info "Detectado: Plesk nginx"
elif [ -d "/etc/nginx/sites-enabled" ]; then
    NGINX_CONF_DIR="/etc/nginx/sites-enabled"
    show_info "Detectado: nginx estándar (sites-enabled)"
elif [ -d "/etc/nginx/conf.d" ]; then
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    show_info "Detectado: nginx estándar (conf.d)"
else
    show_error "No se encontró directorio de configuración de nginx"
    echo "Ejecuta: ls -la /etc/nginx/"
    exit 1
fi

echo ""
echo "[1/5] Descargando configuración de nginx desde GitHub..."
echo "----------------------------------------------------------------------"

curl -o /tmp/nginx-watercrm.conf "$GITHUB_RAW_URL/config/nginx-plesk-proxy.conf"
show_message "Configuración descargada"

echo ""
echo "[2/5] Creando configuración de nginx..."
echo "----------------------------------------------------------------------"

# Crear configuración
cat > /tmp/nginx-watercrm-final.conf <<'EOF'
# WaterCRM - Configuración nginx proxy a Apache
# Generado automáticamente por fix-nginx-config.sh

server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name 217.154.186.92 crm-prueba.test *.crm-prueba.test;

    # Logging
    access_log /var/log/nginx/watercrm-access.log;
    error_log /var/log/nginx/watercrm-error.log;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Tamaño máximo de subida
    client_max_body_size 100M;

    # Timeouts
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;

    # PROXY A APACHE
    location / {
        proxy_pass http://127.0.0.1:7080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
EOF

show_message "Configuración creada"

echo ""
echo "[3/5] Instalando configuración..."
echo "----------------------------------------------------------------------"

# Backup de configuración existente
if [ -f "${NGINX_CONF_DIR}/default" ]; then
    cp "${NGINX_CONF_DIR}/default" "${NGINX_CONF_DIR}/default.backup.$(date +%s)" 2>/dev/null || true
    show_info "Backup de configuración default creado"
fi

# Copiar nueva configuración
cp /tmp/nginx-watercrm-final.conf "${NGINX_CONF_DIR}/watercrm.conf"
show_message "Configuración instalada en: ${NGINX_CONF_DIR}/watercrm.conf"

# Si hay default, deshabilitarlo
if [ -f "${NGINX_CONF_DIR}/default" ] && [ "$NGINX_CONF_DIR" = "/etc/nginx/sites-enabled" ]; then
    rm -f "${NGINX_CONF_DIR}/default"
    show_info "Configuración default deshabilitada"
fi

echo ""
echo "[4/5] Verificando sintaxis de nginx..."
echo "----------------------------------------------------------------------"

if nginx -t 2>&1; then
    show_message "Sintaxis de nginx correcta"
else
    show_error "Error en la configuración de nginx"
    echo "Revirtiendo cambios..."
    rm -f "${NGINX_CONF_DIR}/watercrm.conf"
    if [ -f "${NGINX_CONF_DIR}/default.backup."* ]; then
        mv "${NGINX_CONF_DIR}/default.backup."* "${NGINX_CONF_DIR}/default" 2>/dev/null || true
    fi
    exit 1
fi

echo ""
echo "[5/5] Reiniciando nginx..."
echo "----------------------------------------------------------------------"

systemctl reload nginx || systemctl restart nginx
show_message "nginx reiniciado"

sleep 2

echo ""
show_header "VERIFICACIÓN"

# Verificar que está funcionando
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "500" ]; then
    show_message "nginx responde: HTTP $HTTP_CODE"
else
    show_error "nginx NO responde correctamente (HTTP $HTTP_CODE)"
fi

HTTP_CODE_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" http://217.154.186.92 2>/dev/null)
if [ "$HTTP_CODE_PUBLIC" = "200" ] || [ "$HTTP_CODE_PUBLIC" = "302" ] || [ "$HTTP_CODE_PUBLIC" = "500" ]; then
    show_message "IP pública responde: HTTP $HTTP_CODE_PUBLIC"
else
    show_error "IP pública NO responde (HTTP $HTTP_CODE_PUBLIC)"
fi

echo ""
show_header "SIGUIENTE PASO"

echo "Configuración de nginx instalada correctamente."
echo ""
echo "Ahora prueba en tu navegador:"
echo ""
echo "  ${GREEN}${BOLD}http://217.154.186.92${NC}"
echo ""
echo "Si aún ves ERR_CONNECTION_REFUSED:"
echo "  1. Verifica que uses http:// (NO https://)"
echo "  2. Prueba en modo incógnito del navegador"
echo "  3. Ejecuta: ./verificar-firewall.sh"
echo ""
