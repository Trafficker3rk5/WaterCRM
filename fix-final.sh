#!/bin/bash
################################################################################
# Script de reparación DEFINITIVA - Sin route:cache
#
# SOLUCIÓN: No usar route:cache en absoluto
# Las rutas se cargarán dinámicamente (sin cache) lo cual es perfectamente
# válido en producción, solo un poco más lento.
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

echo "=========================================="
echo "  WaterCRM - Reparación DEFINITIVA"
echo "=========================================="
echo ""

cd "$APP_DIR"

# 1. LIMPIAR TODOS LOS CACHÉS
echo "[1/4] Limpiando TODOS los cachés..."
echo "----------------------------------------------------------------------"

php artisan config:clear 2>/dev/null
php artisan route:clear 2>/dev/null
php artisan cache:clear 2>/dev/null
php artisan view:clear 2>/dev/null

# Eliminar archivos de cache manualmente
rm -f bootstrap/cache/config.php 2>/dev/null
rm -f bootstrap/cache/routes*.php 2>/dev/null
rm -f bootstrap/cache/services.php 2>/dev/null
rm -f bootstrap/cache/packages.php 2>/dev/null

show_message "Todos los cachés eliminados"
echo ""

# 2. CONFIGURAR .ENV PARA NO FORZAR HTTPS
echo "[2/4] Configurando .env..."
echo "----------------------------------------------------------------------"

if grep -q "^FORCE_HTTPS=true" .env 2>/dev/null; then
    sed -i 's/^FORCE_HTTPS=true/FORCE_HTTPS=false/' .env
    show_message "FORCE_HTTPS cambiado a false"
elif ! grep -q "^FORCE_HTTPS=" .env 2>/dev/null; then
    echo "FORCE_HTTPS=false" >> .env
    show_message "FORCE_HTTPS=false agregado"
else
    show_message "FORCE_HTTPS ya está en false"
fi

echo ""

# 3. REINICIAR APACHE
echo "[3/4] Reiniciando Apache..."
echo "----------------------------------------------------------------------"

if systemctl restart apache2 2>/dev/null; then
    show_message "Apache reiniciado correctamente"
elif service apache2 restart 2>/dev/null; then
    show_message "Apache reiniciado correctamente (via service)"
else
    show_warning "No se pudo reiniciar Apache automáticamente"
fi

sleep 3
echo ""

# 4. VERIFICAR
echo "[4/4] Verificando estado del servidor..."
echo "----------------------------------------------------------------------"

# Apache corriendo
if systemctl is-active --quiet apache2 2>/dev/null; then
    show_message "Apache está corriendo"
else
    show_error "Apache NO está corriendo"
fi

# Puerto escuchando
if ss -tln 2>/dev/null | grep -q ":7080" || lsof -i :7080 2>/dev/null | grep -q LISTEN; then
    show_message "Puerto 7080 en LISTEN"
else
    show_warning "Puerto 7080 no verificable"
fi

# HTTP responde
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7080 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
    show_message "HTTP responde con código $HTTP_CODE"
else
    show_warning "HTTP responde con código $HTTP_CODE"
fi

# IP pública
HTTP_CODE_PUB=$(curl -s -o /dev/null -w "%{http_code}" http://217.154.186.92 2>/dev/null)
if [ "$HTTP_CODE_PUB" = "200" ] || [ "$HTTP_CODE_PUB" = "302" ]; then
    show_message "IP pública responde con código $HTTP_CODE_PUB"
else
    show_error "IP pública responde con código $HTTP_CODE_PUB"
fi

echo ""
echo "=========================================="
echo "  Reparación completada"
echo "=========================================="
echo ""
echo "IMPORTANTE:"
echo "  - NO se usa route:cache (rutas se cargan dinámicamente)"
echo "  - Esto es normal y funciona perfectamente"
echo "  - La aplicación puede ser un poco más lenta, pero funcional"
echo ""
echo "Próximos pasos:"
echo "  1. Probar en navegador: http://217.154.186.92"
echo "  2. Si funciona, dejar así (sin route:cache)"
echo "  3. Para mejorar rendimiento, arreglar conflictos de nombres en routes/"
echo ""
