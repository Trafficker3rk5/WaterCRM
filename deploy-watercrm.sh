#!/bin/bash
################################################################################
# Script de despliegue completo para WaterCRM en servidor Plesk
#
# Este script:
# 1. Sincroniza archivos de configuración desde GitHub
# 2. Corrige permisos
# 3. Limpia cachés de Laravel
# 4. Verifica configuración de tenancy
# 5. Ejecuta diagnósticos
################################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_DIR="/var/www/vhosts/crm-prueba.test/public"
REPO_BRANCH="claude/fix-laravel-github-path-g0Yhx"
GITHUB_RAW_URL="https://raw.githubusercontent.com/Trafficker3rk5/WaterCRM/${REPO_BRANCH}"

echo "=========================================="
echo "  WaterCRM - Script de Despliegue"
echo "=========================================="
echo ""

# Función para mostrar mensajes
show_message() {
    echo -e "${GREEN}✓${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

show_error() {
    echo -e "${RED}✗${NC} $1"
}

# Cambiar al directorio de la aplicación
cd "$APP_DIR"

# 1. SINCRONIZAR ARCHIVOS DE CONFIGURACIÓN DESDE GITHUB
echo ""
echo "[1/8] Sincronizando archivos de configuración desde GitHub..."
echo "----------------------------------------------------------------------"

# Descargar config/tenancy.php actualizado
echo "Descargando config/tenancy.php..."
curl -s -o config/tenancy.php "${GITHUB_RAW_URL}/config/tenancy.php"
if [ $? -eq 0 ]; then
    show_message "config/tenancy.php actualizado"
else
    show_error "Error al descargar config/tenancy.php"
fi

# Descargar TenancyServiceProvider actualizado
echo "Descargando app/Providers/TenancyServiceProvider.php..."
curl -s -o app/Providers/TenancyServiceProvider.php "${GITHUB_RAW_URL}/app/Providers/TenancyServiceProvider.php"
if [ $? -eq 0 ]; then
    show_message "TenancyServiceProvider actualizado"
else
    show_error "Error al descargar TenancyServiceProvider"
fi

# Descargar modelo Tenant actualizado
echo "Descargando app/Models/Main/Tenant.php..."
mkdir -p app/Models/Main
curl -s -o app/Models/Main/Tenant.php "${GITHUB_RAW_URL}/app/Models/Main/Tenant.php"
if [ $? -eq 0 ]; then
    show_message "Modelo Tenant actualizado"
else
    show_error "Error al descargar Tenant.php"
fi

echo ""

# 2. VERIFICAR ARCHIVOS CRÍTICOS
echo "[2/8] Verificando archivos críticos..."
echo "----------------------------------------------------------------------"

# Verificar que config/tenancy.php tiene la configuración correcta
if grep -q "App\\\\Models\\\\Main\\\\Tenant" config/tenancy.php || grep -q "use App\\\\Models\\\\Main\\\\Tenant" config/tenancy.php; then
    show_message "config/tenancy.php tiene tenant_model correcto"
else
    show_warning "config/tenancy.php podría tener configuración incorrecta"
    echo "  Verificando contenido..."
    grep "tenant_model" config/tenancy.php
fi

# Verificar que el modelo Tenant tiene HasDomains trait
if grep -q "HasDomains" app/Models/Main/Tenant.php; then
    show_message "Modelo Tenant tiene trait HasDomains"
else
    show_error "Modelo Tenant NO tiene trait HasDomains"
fi

# Verificar que TenancyServiceProvider NO intenta crear bases de datos
if grep -q "// Jobs\\\\CreateDatabase::class" app/Providers/TenancyServiceProvider.php; then
    show_message "TenancyServiceProvider NO intenta crear BD automáticamente"
else
    show_warning "TenancyServiceProvider podría intentar crear BD (causará errores)"
fi

echo ""

# 3. CONFIGURAR PERMISOS
echo "[3/8] Configurando permisos..."
echo "----------------------------------------------------------------------"

# Crear directorios necesarios
mkdir -p storage/logs
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache
mkdir -p bootstrap/cache

# Configurar permisos
chmod -R 775 storage bootstrap/cache
chown -R crm-prueba.test_kovfbpusm6d:psacln storage bootstrap/cache 2>/dev/null || show_warning "No se pudieron cambiar owners (podría requerir root)"

show_message "Permisos configurados"
echo ""

# 4. VERIFICAR .ENV
echo "[4/8] Verificando configuración .env..."
echo "----------------------------------------------------------------------"

if [ ! -f .env ]; then
    show_error "Archivo .env NO existe - copiando desde .env.example"
    cp .env.example .env
fi

# Verificar APP_KEY
if grep -q "APP_KEY=base64:" .env; then
    show_message "APP_KEY configurado"
else
    show_warning "APP_KEY no configurado - generando..."
    php artisan key:generate
fi

# Verificar modo debug
if grep -q "APP_DEBUG=true" .env; then
    show_warning "APP_DEBUG=true (modo desarrollo)"
    echo "  Recuerda cambiar a false en producción"
else
    show_message "APP_DEBUG=false (modo producción)"
fi

# Verificar configuración de base de datos
if grep -q "DB_CONNECTION=mysql" .env; then
    show_message "Base de datos MySQL configurada"
else
    show_warning "DB_CONNECTION no está configurado como mysql"
    grep "DB_CONNECTION" .env
fi

echo ""

# 5. LIMPIAR CACHÉS
echo "[5/8] Limpiando cachés de Laravel..."
echo "----------------------------------------------------------------------"

php artisan config:clear
show_message "Config cache cleared"

php artisan cache:clear
show_message "Application cache cleared"

php artisan route:clear
show_message "Route cache cleared"

php artisan view:clear
show_message "View cache cleared"

echo ""

# 6. VERIFICAR CONFIGURACIÓN DE TENANCY
echo "[6/8] Verificando configuración de tenancy..."
echo "----------------------------------------------------------------------"

# Verificar que las migraciones principales están ejecutadas
echo "Estado de migraciones:"
php artisan migrate:status | head -10

echo ""
echo "Verificando tenant y dominios en la base de datos..."
php artisan tinker --execute="
echo 'Tenants: ' . \App\Models\Main\Tenant::count() . PHP_EOL;
echo 'Domains: ' . \Stancl\Tenancy\Database\Models\Domain::count() . PHP_EOL;

\$tenants = \App\Models\Main\Tenant::with('domains')->get();
foreach (\$tenants as \$tenant) {
    echo PHP_EOL . 'Tenant ID: ' . \$tenant->id . PHP_EOL;
    echo '  Dominios: ' . \$tenant->domains->pluck('domain')->implode(', ') . PHP_EOL;
}
"

echo ""

# 7. OPTIMIZAR PARA PRODUCCIÓN
echo "[7/8] Optimizando aplicación..."
echo "----------------------------------------------------------------------"

php artisan config:cache
show_message "Config cached"

php artisan route:cache
show_message "Routes cached"

echo ""

# 8. PROBAR LA APLICACIÓN
echo "[8/8] Probando la aplicación..."
echo "----------------------------------------------------------------------"

echo "Probando acceso HTTP local (127.0.0.1:7080)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:7080)
if [ "$HTTP_CODE" = "200" ]; then
    show_message "HTTP 200 - Aplicación responde correctamente"
elif [ "$HTTP_CODE" = "500" ]; then
    show_error "HTTP 500 - Error en la aplicación"
    echo "  Ver detalles con: curl http://127.0.0.1:7080 2>/dev/null | head -100"
else
    show_warning "HTTP $HTTP_CODE - Código inesperado"
fi

echo ""
echo "Probando acceso desde IP pública (217.154.186.92)..."
HTTP_CODE_PUB=$(curl -s -o /dev/null -w "%{http_code}" http://217.154.186.92)
echo "  Código HTTP: $HTTP_CODE_PUB"

echo ""
echo "=========================================="
echo "  Despliegue completado"
echo "=========================================="
echo ""
echo "Resumen:"
echo "  - Archivos de configuración sincronizados desde GitHub"
echo "  - Permisos configurados"
echo "  - Cachés limpiados y optimizados"
echo "  - Configuración de tenancy verificada"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Verificar que la aplicación funciona:"
echo "   curl http://217.154.186.92 2>/dev/null | head -100"
echo ""
echo "2. Si hay errores, ver los logs:"
echo "   tail -50 storage/logs/laravel.log"
echo ""
echo "3. Si todo funciona, cambiar APP_DEBUG=false en .env"
echo ""
echo "4. Acceder desde el navegador:"
echo "   http://217.154.186.92"
echo ""
