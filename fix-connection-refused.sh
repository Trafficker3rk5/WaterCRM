#!/bin/bash
################################################################################
# Script de corrección para ERR_CONNECTION_REFUSED
#
# Este script resuelve el problema donde curl funciona (302) pero el navegador
# muestra ERR_CONNECTION_REFUSED
#
# Causas comunes:
# 1. Usuario accede a HTTPS en lugar de HTTP
# 2. nginx no está corriendo
# 3. nginx no está configurado correctamente como proxy
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

APP_DIR="/var/www/vhosts/crm-prueba.test/public"

show_message() {
    echo -e "${GREEN}✓${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

show_error() {
    echo -e "${RED}✗${NC} $1"
}

show_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo "=========================================================================="
echo -e "  ${BOLD}WaterCRM - Solución ERR_CONNECTION_REFUSED${NC}"
echo "=========================================================================="
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -d "$APP_DIR" ]; then
    show_error "Directorio $APP_DIR no existe"
    echo "Ejecuta este script desde el servidor de producción"
    exit 1
fi

cd "$APP_DIR"

echo "[1/6] Diagnosticando el problema..."
echo "----------------------------------------------------------------------"

# Verificar Apache
APACHE_STATUS="stopped"
if systemctl is-active --quiet apache2 2>/dev/null; then
    APACHE_STATUS="running"
    show_message "Apache está corriendo"
else
    show_error "Apache NO está corriendo"
fi

# Verificar nginx
NGINX_STATUS="stopped"
if systemctl is-active --quiet nginx 2>/dev/null; then
    NGINX_STATUS="running"
    show_message "nginx está corriendo"
else
    show_error "nginx NO está corriendo - ESTE ES EL PROBLEMA"
fi

# Verificar puerto 80 (nginx)
PORT_80_STATUS="closed"
if ss -tln 2>/dev/null | grep -q ":80 " || lsof -i :80 2>/dev/null | grep -q LISTEN; then
    PORT_80_STATUS="open"
    show_message "Puerto 80 está escuchando"
else
    show_error "Puerto 80 NO está escuchando - ESTE ES EL PROBLEMA"
fi

# Verificar puerto 7080 (Apache)
PORT_7080_STATUS="closed"
if ss -tln 2>/dev/null | grep -q ":7080 " || lsof -i :7080 2>/dev/null | grep -q LISTEN; then
    PORT_7080_STATUS="open"
    show_message "Puerto 7080 está escuchando"
else
    show_error "Puerto 7080 NO está escuchando"
fi

echo ""
echo "[2/6] Análisis de la causa raíz..."
echo "----------------------------------------------------------------------"

if [ "$NGINX_STATUS" = "stopped" ]; then
    echo -e "${RED}${BOLD}PROBLEMA IDENTIFICADO:${NC}"
    echo "  nginx NO está corriendo. Los navegadores se conectan al puerto 80,"
    echo "  que es manejado por nginx. Si nginx no está corriendo, el navegador"
    echo "  muestra ERR_CONNECTION_REFUSED."
    echo ""
    echo "  curl puede estar funcionando porque:"
    echo "  - Estás haciendo curl a localhost:7080 (Apache directo)"
    echo "  - O hay un nginx temporal que curl ve pero el navegador no"
    echo ""
    NEED_FIX="nginx"
elif [ "$PORT_80_STATUS" = "closed" ]; then
    echo -e "${RED}${BOLD}PROBLEMA IDENTIFICADO:${NC}"
    echo "  Puerto 80 no está escuchando. nginx puede estar corriendo pero no"
    echo "  está configurado para escuchar en el puerto 80."
    echo ""
    NEED_FIX="port80"
elif [ "$APACHE_STATUS" = "stopped" ]; then
    echo -e "${YELLOW}${BOLD}PROBLEMA SECUNDARIO:${NC}"
    echo "  Apache no está corriendo. nginx está bien, pero necesita que Apache"
    echo "  responda en el puerto 7080."
    echo ""
    NEED_FIX="apache"
else
    echo -e "${GREEN}${BOLD}SERVICIOS CORRIENDO CORRECTAMENTE${NC}"
    echo ""
    echo "  Si aún ves ERR_CONNECTION_REFUSED, verifica:"
    echo "  1. ¿Estás usando HTTP o HTTPS en el navegador?"
    echo "     ✓ CORRECTO: http://217.154.186.92"
    echo "     ✗ INCORRECTO: https://217.154.186.92"
    echo ""
    echo "  2. ¿Hay un firewall bloqueando el puerto 80?"
    echo "  3. ¿Estás accediendo desde la misma red?"
    echo ""
    NEED_FIX="none"
fi

echo ""
echo "[3/6] Verificando configuración de nginx..."
echo "----------------------------------------------------------------------"

# Buscar archivos de configuración de nginx
NGINX_CONF=""
if [ -f "/etc/nginx/sites-enabled/crm-prueba.test.conf" ]; then
    NGINX_CONF="/etc/nginx/sites-enabled/crm-prueba.test.conf"
elif [ -f "/etc/nginx/conf.d/crm-prueba.test.conf" ]; then
    NGINX_CONF="/etc/nginx/conf.d/crm-prueba.test.conf"
elif [ -f "/etc/nginx/nginx.conf" ]; then
    NGINX_CONF="/etc/nginx/nginx.conf"
fi

if [ -n "$NGINX_CONF" ]; then
    show_message "Configuración de nginx encontrada: $NGINX_CONF"

    # Verificar si tiene proxy_pass configurado
    if grep -q "proxy_pass.*7080" "$NGINX_CONF" 2>/dev/null; then
        show_message "nginx configurado para hacer proxy a Apache:7080"
    else
        show_warning "nginx NO parece tener proxy_pass a Apache:7080"
    fi
else
    show_warning "No se encontró configuración de nginx"
fi

echo ""
echo "[4/6] Aplicando correcciones..."
echo "----------------------------------------------------------------------"

if [ "$NEED_FIX" = "nginx" ]; then
    echo "Intentando iniciar nginx..."
    if systemctl start nginx 2>/dev/null; then
        show_message "nginx iniciado correctamente"
    elif service nginx start 2>/dev/null; then
        show_message "nginx iniciado correctamente (via service)"
    else
        show_error "No se pudo iniciar nginx automáticamente"
        echo "  Ejecuta manualmente: sudo systemctl start nginx"
        echo "  Ver logs: sudo journalctl -u nginx -n 50"
    fi
    sleep 2
elif [ "$NEED_FIX" = "apache" ]; then
    echo "Intentando iniciar Apache..."
    if systemctl start apache2 2>/dev/null; then
        show_message "Apache iniciado correctamente"
    elif service apache2 start 2>/dev/null; then
        show_message "Apache iniciado correctamente (via service)"
    else
        show_error "No se pudo iniciar Apache automáticamente"
        echo "  Ejecuta manualmente: sudo systemctl start apache2"
    fi
    sleep 2
else
    show_info "No se requieren correcciones automáticas"
fi

echo ""
echo "[5/6] Verificación final..."
echo "----------------------------------------------------------------------"

# Re-verificar servicios
echo "Servicios:"
if systemctl is-active --quiet nginx 2>/dev/null; then
    show_message "nginx corriendo"
else
    show_error "nginx NO corriendo"
fi

if systemctl is-active --quiet apache2 2>/dev/null; then
    show_message "Apache corriendo"
else
    show_error "Apache NO corriendo"
fi

# Verificar puertos
echo ""
echo "Puertos:"
if ss -tln 2>/dev/null | grep -q ":80 "; then
    show_message "Puerto 80 escuchando (nginx)"
else
    show_error "Puerto 80 NO escuchando"
fi

if ss -tln 2>/dev/null | grep -q ":7080 "; then
    show_message "Puerto 7080 escuchando (Apache)"
else
    show_error "Puerto 7080 NO escuchando"
fi

# Probar conexiones
echo ""
echo "Pruebas HTTP:"

HTTP_LOCALHOST_7080=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7080 2>/dev/null)
if [ "$HTTP_LOCALHOST_7080" = "200" ] || [ "$HTTP_LOCALHOST_7080" = "302" ] || [ "$HTTP_LOCALHOST_7080" = "500" ]; then
    show_message "Apache responde: $HTTP_LOCALHOST_7080"
else
    show_error "Apache NO responde (código: $HTTP_LOCALHOST_7080)"
fi

HTTP_LOCALHOST_80=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80 2>/dev/null)
if [ "$HTTP_LOCALHOST_80" = "200" ] || [ "$HTTP_LOCALHOST_80" = "302" ] || [ "$HTTP_LOCALHOST_80" = "500" ]; then
    show_message "nginx responde: $HTTP_LOCALHOST_80"
else
    show_error "nginx NO responde (código: $HTTP_LOCALHOST_80)"
fi

HTTP_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" http://217.154.186.92 2>/dev/null)
if [ "$HTTP_PUBLIC" = "200" ] || [ "$HTTP_PUBLIC" = "302" ]; then
    show_message "IP pública responde: $HTTP_PUBLIC"
else
    show_error "IP pública NO responde (código: $HTTP_PUBLIC)"
fi

echo ""
echo "[6/6] Generando informe..."
echo "----------------------------------------------------------------------"

echo ""
echo "=========================================================================="
echo -e "  ${BOLD}INFORME FINAL${NC}"
echo "=========================================================================="
echo ""

if systemctl is-active --quiet nginx 2>/dev/null && systemctl is-active --quiet apache2 2>/dev/null; then
    echo -e "${GREEN}${BOLD}✓ SERVICIOS FUNCIONANDO CORRECTAMENTE${NC}"
    echo ""
    echo "Ambos servicios están corriendo:"
    echo "  • nginx (puerto 80) → proxy reverso"
    echo "  • Apache (puerto 7080) → aplicación Laravel"
    echo ""
    echo "=========================================================================="
    echo -e "  ${BOLD}CÓMO ACCEDER A LA APLICACIÓN${NC}"
    echo "=========================================================================="
    echo ""
    echo -e "${GREEN}${BOLD}CORRECTO:${NC}"
    echo "  http://217.154.186.92"
    echo "  (nota el HTTP, no HTTPS)"
    echo ""
    echo -e "${RED}${BOLD}INCORRECTO (causará ERR_CONNECTION_REFUSED):${NC}"
    echo "  https://217.154.186.92  ← ¡No usar HTTPS!"
    echo "  217.154.186.92          ← Sin protocolo, el navegador asume HTTPS"
    echo ""
    echo "=========================================================================="
    echo ""
    echo "Si aún ves ERR_CONNECTION_REFUSED:"
    echo ""
    echo "1. Verifica en la barra de direcciones del navegador:"
    echo "   - Debe decir exactamente: http://217.154.186.92"
    echo "   - NO debe decir: https://217.154.186.92"
    echo "   - Algunos navegadores fuerzan HTTPS automáticamente"
    echo ""
    echo "2. Prueba en modo incógnito/privado del navegador"
    echo "   - Esto evita cachés y configuraciones guardadas"
    echo ""
    echo "3. Prueba desde otro navegador"
    echo "   - Chrome, Firefox, Edge, Safari"
    echo ""
    echo "4. Verifica que no haya firewall bloqueando:"
    echo "   sudo iptables -L -n | grep 80"
    echo "   sudo ufw status"
    echo ""
else
    echo -e "${RED}${BOLD}✗ HAY PROBLEMAS CON LOS SERVICIOS${NC}"
    echo ""

    if ! systemctl is-active --quiet nginx 2>/dev/null; then
        echo "• nginx NO está corriendo"
        echo "  Iniciar: sudo systemctl start nginx"
        echo "  Ver logs: sudo journalctl -u nginx -n 50"
        echo ""
    fi

    if ! systemctl is-active --quiet apache2 2>/dev/null; then
        echo "• Apache NO está corriendo"
        echo "  Iniciar: sudo systemctl start apache2"
        echo "  Ver logs: sudo journalctl -u apache2 -n 50"
        echo ""
    fi

    echo "Después de iniciar los servicios, ejecuta este script nuevamente."
fi

echo ""
echo "=========================================================================="
echo ""
