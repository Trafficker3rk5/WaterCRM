#!/bin/bash
################################################################################
# Script de reparación rápida para WaterCRM
#
# Este script:
# 1. Descarga archivos corregidos desde GitHub
# 2. Limpia TODOS los cachés de Laravel
# 3. Reinicia Apache
# 4. Verifica que todo funcione
################################################################################

set -e

# Colores
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
echo "  WaterCRM - Reparación Rápida"
echo "=========================================="
echo ""

cd "$APP_DIR"

# 1. DESCARGAR ARCHIVOS CORREGIDOS
echo "[1/6] Descargando archivos corregidos..."
echo "----------------------------------------------------------------------"

echo "Descargando routes/tenant-api.php (sin conflictos de nombres)..."
curl -s -o routes/tenant-api.php "${GITHUB_RAW_URL}/routes/tenant-api.php"
if [ $? -eq 0 ]; then
    show_message "routes/tenant-api.php actualizado"
else
    show_error "Error al descargar tenant-api.php"
fi

echo "Descargando routes/api.php (api.login comentado para evitar conflicto)..."
curl -s -o routes/api.php "${GITHUB_RAW_URL}/routes/api.php"
if [ $? -eq 0 ]; then
    show_message "routes/api.php actualizado (ruta api.login comentada)"
else
    show_error "Error al descargar api.php"
fi

echo ""

# 2. LIMPIAR TODOS LOS CACHÉS
echo "[2/6] Limpiando TODOS los cachés..."
echo "----------------------------------------------------------------------"

php artisan config:clear 2>/dev/null || show_warning "config:clear tuvo problemas"
php artisan route:clear 2>/dev/null || show_warning "route:clear tuvo problemas"
php artisan cache:clear 2>/dev/null || show_warning "cache:clear tuvo problemas"
php artisan view:clear 2>/dev/null || show_warning "view:clear tuvo problemas"

# Eliminar archivos de cache manualmente por si acaso
rm -f bootstrap/cache/config.php 2>/dev/null
rm -f bootstrap/cache/routes*.php 2>/dev/null
rm -f bootstrap/cache/services.php 2>/dev/null

show_message "Cachés eliminados"
echo ""

# 3. VERIFICAR RUTAS
echo "[3/6] Verificando configuración de rutas..."
echo "----------------------------------------------------------------------"

if grep -q "tenant\.api\." routes/tenant-api.php; then
    show_message "routes/tenant-api.php: Usa prefijo 'tenant.api.' (correcto)"
else
    show_error "routes/tenant-api.php: Todavía usa 'api.' (problema)"
fi

if grep -q "// Route::post('/login'" routes/api.php; then
    show_message "routes/api.php: Ruta api.login comentada (conflicto resuelto)"
else
    show_warning "routes/api.php: Ruta api.login podría estar activa"
fi

echo ""

# 4. INTENTAR CACHEAR RUTAS
echo "[4/6] Intentando cachear rutas..."
echo "----------------------------------------------------------------------"

if php artisan route:cache 2>&1; then
    show_message "route:cache FUNCIONÓ - Rutas duplicadas RESUELTAS"
else
    show_error "route:cache FALLÓ - Aún hay problemas"
    echo ""
    echo "Probando sin cache..."
    php artisan route:clear
fi

echo ""

# 5. REINICIAR APACHE
echo "[5/6] Reiniciando Apache..."
echo "----------------------------------------------------------------------"

if systemctl restart apache2 2>/dev/null; then
    show_message "Apache reiniciado correctamente"
elif service apache2 restart 2>/dev/null; then
    show_message "Apache reiniciado correctamente (via service)"
else
    show_warning "No se pudo reiniciar Apache (puede requerir root)"
    echo "  Ejecuta manualmente: sudo systemctl restart apache2"
fi

# Esperar a que Apache inicie
sleep 3

echo ""
echo "=========================================="
echo "  Verificación Final"
echo "=========================================="
echo ""

# 6. VERIFICAR ESTADO DEL SERVIDOR
echo "[6/6] Verificando estado del servidor..."
echo "----------------------------------------------------------------------"

# Verificar que Apache está corriendo
echo "Estado de Apache:"
if systemctl is-active --quiet apache2 2>/dev/null; then
    show_message "Apache está corriendo (systemctl)"
elif service apache2 status 2>/dev/null | grep -q "running"; then
    show_message "Apache está corriendo (service)"
else
    show_error "Apache NO está corriendo"
    echo "  Ver logs: tail -50 /var/www/vhosts/system/crm-prueba.test/logs/error_log"
    echo "  Intentar reiniciar: sudo systemctl restart apache2"
fi

# Verificar que Apache está escuchando en el puerto
echo "Verificando puerto 7080..."
if ss -tln 2>/dev/null | grep -q ":7080" || lsof -i :7080 2>/dev/null | grep -q LISTEN; then
    show_message "Puerto 7080 está en LISTEN"
else
    show_warning "Puerto 7080 NO está en LISTEN (netstat/lsof no disponibles o puerto cerrado)"
fi

# Verificar que responde
echo "Probando acceso HTTP..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7080 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
    show_message "HTTP responde con código $HTTP_CODE"
else
    show_error "HTTP responde con código $HTTP_CODE (esperaba 200 o 302)"
fi

# Verificar desde IP pública
echo "Probando desde IP pública..."
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
echo "Próximos pasos:"
echo ""
echo "1. Probar en navegador:"
echo "   http://217.154.186.92"
echo ""
echo "2. Si aún no funciona, verificar logs:"
echo "   tail -50 storage/logs/laravel.log"
echo "   tail -50 /var/www/vhosts/system/crm-prueba.test/logs/error_log"
echo ""
echo "3. Si Apache no está corriendo:"
echo "   sudo systemctl status apache2"
echo "   sudo systemctl restart apache2"
echo ""
