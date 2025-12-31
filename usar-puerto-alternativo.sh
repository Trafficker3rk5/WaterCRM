#!/bin/bash
################################################################################
# Configurar WaterCRM en puerto alternativo (8080)
# Para cuando IONOS bloquea puerto 80
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

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

show_header "Configurar WaterCRM en Puerto Alternativo (8080)"

echo "RAZÓN: IONOS bloquea puerto 80 desde fuera del servidor"
echo "SOLUCIÓN: Usar puerto 8080 que suele estar abierto"
echo ""

# Crear configuración nginx en puerto 8080
cat > /tmp/nginx-watercrm-8080.conf <<'EOF'
# WaterCRM en puerto 8080 (alternativo)
server {
    listen 8080;
    listen [::]:8080;

    server_name 217.154.186.92 crm-prueba.test *.crm-prueba.test;

    # Logging
    access_log /var/log/nginx/watercrm-8080-access.log;
    error_log /var/log/nginx/watercrm-8080-error.log;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Tamaño máximo de subida
    client_max_body_size 100M;

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

echo "[1/3] Instalando configuración nginx en puerto 8080..."
echo "----------------------------------------------------------------------"

# Determinar directorio
if [ -d "/etc/nginx/plesk.conf.d/vhosts" ]; then
    NGINX_DIR="/etc/nginx/plesk.conf.d/vhosts"
elif [ -d "/etc/nginx/sites-enabled" ]; then
    NGINX_DIR="/etc/nginx/sites-enabled"
else
    NGINX_DIR="/etc/nginx/conf.d"
fi

cp /tmp/nginx-watercrm-8080.conf "${NGINX_DIR}/watercrm-8080.conf"
show_message "Configuración instalada en: ${NGINX_DIR}/watercrm-8080.conf"

echo ""
echo "[2/3] Verificando y reiniciando nginx..."
echo "----------------------------------------------------------------------"

if nginx -t 2>&1; then
    show_message "Sintaxis correcta"
    systemctl reload nginx
    show_message "nginx reiniciado"
else
    show_error "Error en configuración"
    exit 1
fi

echo ""
echo "[3/3] Verificando conectividad..."
echo "----------------------------------------------------------------------"

sleep 2

HTTP_8080=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080 2>/dev/null)
if [ "$HTTP_8080" = "200" ] || [ "$HTTP_8080" = "302" ] || [ "$HTTP_8080" = "500" ]; then
    show_message "Puerto 8080 responde: HTTP $HTTP_8080"
else
    show_error "Puerto 8080 NO responde (HTTP $HTTP_8080)"
fi

HTTP_8080_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" http://217.154.186.92:8080 2>/dev/null)
if [ "$HTTP_8080_PUBLIC" = "200" ] || [ "$HTTP_8080_PUBLIC" = "302" ] || [ "$HTTP_8080_PUBLIC" = "500" ]; then
    show_message "IP pública puerto 8080 responde: HTTP $HTTP_8080_PUBLIC"
else
    show_error "IP pública puerto 8080 NO responde (HTTP $HTTP_8080_PUBLIC)"
fi

echo ""
show_header "ACCESO A LA APLICACIÓN"

echo -e "${GREEN}${BOLD}Accede desde tu navegador usando:${NC}"
echo ""
echo -e "  ${BLUE}${BOLD}http://217.154.186.92:8080${NC}"
echo ""
echo "Nota: Incluye el :8080 al final"
echo ""
echo "Si funciona con puerto 8080, contacta a IONOS para:"
echo "  1. Abrir puerto 80 permanentemente, o"
echo "  2. Configurar redirección de 80 → 8080"
echo ""
