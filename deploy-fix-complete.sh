#!/bin/bash
################################################################################
# Script de despliegue COMPLETO para WaterCRM en Plesk
#
# Este script:
# 1. Limpia todos los cachés de Laravel
# 2. Configura .env correctamente
# 3. Verifica/instala configuración de nginx
# 4. Reinicia servicios
# 5. Diagnostica y resuelve ERR_CONNECTION_REFUSED
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

show_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
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

show_header "WaterCRM - Despliegue Completo en Plesk"

# Verificar directorio
if [ ! -d "$APP_DIR" ]; then
    show_error "Directorio $APP_DIR no existe"
    exit 1
fi

cd "$APP_DIR"

# ============================================================================
# PASO 1: Limpiar cachés
# ============================================================================
echo "[1/8] Limpiando cachés de Laravel..."
echo "----------------------------------------------------------------------"

php artisan config:clear 2>/dev/null || show_warning "config:clear tuvo problemas"
php artisan route:clear 2>/dev/null || show_warning "route:clear tuvo problemas"
php artisan cache:clear 2>/dev/null || show_warning "cache:clear tuvo problemas"
php artisan view:clear 2>/dev/null || show_warning "view:clear tuvo problemas"

rm -f bootstrap/cache/config.php 2>/dev/null
rm -f bootstrap/cache/routes*.php 2>/dev/null
rm -f bootstrap/cache/services.php 2>/dev/null
rm -f bootstrap/cache/packages.php 2>/dev/null

show_message "Cachés limpiados"
echo ""

# ============================================================================
# PASO 2: Configurar .env
# ============================================================================
echo "[2/8] Configurando .env..."
echo "----------------------------------------------------------------------"

if grep -q "^FORCE_HTTPS=true" .env 2>/dev/null; then
    sed -i 's/^FORCE_HTTPS=true/FORCE_HTTPS=false/' .env
    show_message "FORCE_HTTPS cambiado a false"
elif ! grep -q "^FORCE_HTTPS=" .env 2>/dev/null; then
    echo "FORCE_HTTPS=false" >> .env
    show_message "FORCE_HTTPS=false agregado"
else
    show_message "FORCE_HTTPS ya está configurado correctamente"
fi

# Verificar APP_DEBUG
if grep -q "^APP_DEBUG=true" .env 2>/dev/null; then
    show_info "APP_DEBUG está en true (modo desarrollo)"
else
    show_info "APP_DEBUG está en false (modo producción)"
fi

echo ""

# ============================================================================
# PASO 3: Verificar nginx
# ============================================================================
echo "[3/8] Verificando nginx..."
echo "----------------------------------------------------------------------"

NGINX_RUNNING=false
if systemctl is-active --quiet nginx 2>/dev/null; then
    NGINX_RUNNING=true
    show_message "nginx está corriendo"
else
    show_error "nginx NO está corriendo - PROBLEMA CRÍTICO"
fi

# Verificar puerto 80
PORT_80_LISTENING=false
if ss -tln 2>/dev/null | grep -q ":80 " || lsof -i :80 2>/dev/null | grep -q LISTEN; then
    PORT_80_LISTENING=true
    show_message "Puerto 80 está escuchando"
else
    show_error "Puerto 80 NO está escuchando"
fi

# Buscar configuración de nginx
NGINX_CONF_EXISTS=false
for conf_path in "/etc/nginx/sites-enabled/crm-prueba.test.conf" \
                 "/etc/nginx/conf.d/crm-prueba.test.conf" \
                 "/etc/nginx/plesk.conf.d/vhosts/crm-prueba.test.conf"; do
    if [ -f "$conf_path" ]; then
        NGINX_CONF_EXISTS=true
        show_message "Configuración de nginx encontrada: $conf_path"

        # Verificar si tiene proxy_pass
        if grep -q "proxy_pass.*7080" "$conf_path" 2>/dev/null; then
            show_message "nginx configurado como proxy a Apache:7080"
        else
            show_warning "nginx NO parece estar configurado como proxy a Apache"
        fi
        break
    fi
done

if [ "$NGINX_CONF_EXISTS" = false ]; then
    show_warning "No se encontró configuración de nginx"
    show_info "Archivo de ejemplo creado en: config/nginx-plesk-proxy.conf"
fi

echo ""

# ============================================================================
# PASO 4: Verificar Apache
# ============================================================================
echo "[4/8] Verificando Apache..."
echo "----------------------------------------------------------------------"

APACHE_RUNNING=false
if systemctl is-active --quiet apache2 2>/dev/null; then
    APACHE_RUNNING=true
    show_message "Apache está corriendo"
else
    show_error "Apache NO está corriendo"
fi

# Verificar puerto 7080
PORT_7080_LISTENING=false
if ss -tln 2>/dev/null | grep -q ":7080 " || lsof -i :7080 2>/dev/null | grep -q LISTEN; then
    PORT_7080_LISTENING=true
    show_message "Puerto 7080 está escuchando"
else
    show_error "Puerto 7080 NO está escuchando"
fi

echo ""

# ============================================================================
# PASO 5: Intentar corregir servicios
# ============================================================================
echo "[5/8] Corrigiendo servicios si es necesario..."
echo "----------------------------------------------------------------------"

if [ "$NGINX_RUNNING" = false ]; then
    show_info "Intentando iniciar nginx..."
    if systemctl start nginx 2>/dev/null; then
        show_message "nginx iniciado correctamente"
        NGINX_RUNNING=true
    elif service nginx start 2>/dev/null; then
        show_message "nginx iniciado correctamente (via service)"
        NGINX_RUNNING=true
    else
        show_error "No se pudo iniciar nginx automáticamente"
        echo "  Ejecuta: sudo systemctl start nginx"
        echo "  Ver logs: sudo journalctl -u nginx -n 50"
    fi
    sleep 2
fi

if [ "$APACHE_RUNNING" = false ]; then
    show_info "Intentando iniciar Apache..."
    if systemctl restart apache2 2>/dev/null; then
        show_message "Apache iniciado correctamente"
        APACHE_RUNNING=true
    elif service apache2 restart 2>/dev/null; then
        show_message "Apache iniciado correctamente (via service)"
        APACHE_RUNNING=true
    else
        show_error "No se pudo iniciar Apache automáticamente"
        echo "  Ejecuta: sudo systemctl restart apache2"
    fi
    sleep 2
fi

echo ""

# ============================================================================
# PASO 6: Verificar permisos
# ============================================================================
echo "[6/8] Verificando permisos..."
echo "----------------------------------------------------------------------"

# Propietario
OWNER=$(stat -c '%U' storage 2>/dev/null || echo "unknown")
show_info "Propietario de storage/: $OWNER"

# Permisos de escritura
if [ -w "storage/logs" ]; then
    show_message "storage/logs es escribible"
else
    show_error "storage/logs NO es escribible"
    echo "  Ejecuta: sudo chown -R www-data:www-data storage bootstrap/cache"
    echo "  Ejecuta: sudo chmod -R 775 storage bootstrap/cache"
fi

echo ""

# ============================================================================
# PASO 7: Probar conectividad
# ============================================================================
echo "[7/8] Probando conectividad..."
echo "----------------------------------------------------------------------"

# Probar Apache directamente
HTTP_7080=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7080 2>/dev/null)
if [ "$HTTP_7080" = "200" ] || [ "$HTTP_7080" = "302" ] || [ "$HTTP_7080" = "500" ]; then
    show_message "Apache responde: HTTP $HTTP_7080"
else
    show_error "Apache NO responde correctamente (HTTP $HTTP_7080)"
fi

# Probar nginx
HTTP_80=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80 2>/dev/null)
if [ "$HTTP_80" = "200" ] || [ "$HTTP_80" = "302" ] || [ "$HTTP_80" = "500" ]; then
    show_message "nginx responde: HTTP $HTTP_80"
else
    show_error "nginx NO responde correctamente (HTTP $HTTP_80)"
fi

# Probar IP pública
HTTP_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" http://217.154.186.92 2>/dev/null)
if [ "$HTTP_PUBLIC" = "200" ] || [ "$HTTP_PUBLIC" = "302" ]; then
    show_message "IP pública responde: HTTP $HTTP_PUBLIC"
else
    show_error "IP pública NO responde correctamente (HTTP $HTTP_PUBLIC)"
fi

echo ""

# ============================================================================
# PASO 8: Verificar logs recientes
# ============================================================================
echo "[8/8] Verificando logs recientes..."
echo "----------------------------------------------------------------------"

if [ -f "storage/logs/laravel.log" ]; then
    ERROR_COUNT=$(tail -50 storage/logs/laravel.log 2>/dev/null | grep -c "ERROR" || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        show_warning "Hay $ERROR_COUNT errores en los últimos 50 líneas del log"
        echo "  Ver: tail -50 storage/logs/laravel.log"
    else
        show_message "No hay errores recientes en laravel.log"
    fi
else
    show_info "No hay archivo laravel.log todavía"
fi

echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
show_header "RESUMEN FINAL"

ALL_GOOD=true

echo "Estado de Servicios:"
if [ "$NGINX_RUNNING" = true ]; then
    show_message "nginx: CORRIENDO"
else
    show_error "nginx: DETENIDO"
    ALL_GOOD=false
fi

if [ "$APACHE_RUNNING" = true ]; then
    show_message "Apache: CORRIENDO"
else
    show_error "Apache: DETENIDO"
    ALL_GOOD=false
fi

echo ""
echo "Estado de Puertos:"
if [ "$PORT_80_LISTENING" = true ]; then
    show_message "Puerto 80: ESCUCHANDO (nginx)"
else
    show_error "Puerto 80: CERRADO"
    ALL_GOOD=false
fi

if [ "$PORT_7080_LISTENING" = true ]; then
    show_message "Puerto 7080: ESCUCHANDO (Apache)"
else
    show_error "Puerto 7080: CERRADO"
    ALL_GOOD=false
fi

echo ""
echo "Respuestas HTTP:"
show_info "Apache (7080): HTTP $HTTP_7080"
show_info "nginx (80): HTTP $HTTP_80"
show_info "IP Pública: HTTP $HTTP_PUBLIC"

echo ""
show_header "INSTRUCCIONES PARA ACCEDER"

if [ "$ALL_GOOD" = true ] && [ "$HTTP_PUBLIC" = "200" -o "$HTTP_PUBLIC" = "302" ]; then
    echo -e "${GREEN}${BOLD}✓ SERVIDOR FUNCIONANDO CORRECTAMENTE${NC}"
    echo ""
    echo "Accede a tu aplicación usando:"
    echo ""
    echo -e "  ${GREEN}${BOLD}http://217.154.186.92${NC}"
    echo ""
    echo -e "${YELLOW}${BOLD}IMPORTANTE:${NC}"
    echo "  • Usa HTTP, NO HTTPS"
    echo "  • Si ves ERR_CONNECTION_REFUSED:"
    echo "    - Verifica que estés usando http:// (no https://)"
    echo "    - Prueba en modo incógnito del navegador"
    echo "    - Limpia la caché del navegador"
    echo "    - Prueba desde otro navegador"
else
    echo -e "${RED}${BOLD}✗ HAY PROBLEMAS QUE RESOLVER${NC}"
    echo ""

    if [ "$NGINX_RUNNING" = false ]; then
        echo "• nginx no está corriendo:"
        echo "  sudo systemctl start nginx"
        echo "  sudo systemctl enable nginx"
        echo ""
    fi

    if [ "$APACHE_RUNNING" = false ]; then
        echo "• Apache no está corriendo:"
        echo "  sudo systemctl restart apache2"
        echo "  sudo systemctl enable apache2"
        echo ""
    fi

    if [ "$NGINX_CONF_EXISTS" = false ]; then
        echo "• nginx necesita configuración:"
        echo "  Copia config/nginx-plesk-proxy.conf al directorio de nginx"
        echo "  sudo nginx -t  # Verificar configuración"
        echo "  sudo systemctl reload nginx"
        echo ""
    fi
fi

echo ""
show_header "DIAGNÓSTICO ADICIONAL"

echo "Si el problema persiste, ejecuta:"
echo ""
echo "  ./fix-connection-refused.sh"
echo ""
echo "Para ver logs detallados:"
echo "  tail -50 storage/logs/laravel.log"
echo "  sudo journalctl -u nginx -n 50"
echo "  sudo journalctl -u apache2 -n 50"
echo ""
