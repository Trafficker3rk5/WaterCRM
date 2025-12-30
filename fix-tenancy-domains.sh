#!/bin/bash
################################################################################
# Script para corregir error de Tenancy - domains()
# Error: Call to undefined method Stancl\Tenancy\Database\Models\Tenant::domains()
################################################################################

set -e

APP_DIR="/var/www/vhosts/crm-prueba.test/public"

echo "=========================================="
echo "Corrigiendo configuración de Tenancy"
echo "=========================================="
echo ""

cd "$APP_DIR"

# 1. Verificar modelo Tenant personalizado
echo "[1/5] Verificando modelo Tenant..."
if [ -f app/Models/Tenant.php ]; then
    echo "✓ Modelo Tenant personalizado existe"

    # Verificar si tiene el trait HasDomains
    if grep -q "HasDomains" app/Models/Tenant.php; then
        echo "✓ Modelo tiene trait HasDomains"
    else
        echo "⚠ Modelo NO tiene trait HasDomains - esto puede causar el error"
    fi
else
    echo "⚠ No existe modelo Tenant personalizado - usando el del paquete"
fi
echo ""

# 2. Verificar y ejecutar migraciones principales (incluyendo tabla domains)
echo "[2/5] Verificando migraciones principales..."
PENDING=$(php artisan migrate:status | grep -c "Pending" || echo "0")
if [ "$PENDING" -gt "0" ]; then
    echo "⚠ Hay $PENDING migraciones pendientes - ejecutando..."
    php artisan migrate --force
    echo "✓ Migraciones ejecutadas"
else
    echo "✓ Todas las migraciones están al día"
fi
echo ""

# 3. Verificar tabla domains
echo "[3/5] Verificando tabla domains..."
DOMAINS_EXISTS=$(php -r "
    require 'vendor/autoload.php';
    \$app = require_once 'bootstrap/app.php';
    \$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
    \$kernel->bootstrap();
    try {
        DB::table('domains')->count();
        echo 'yes';
    } catch (Exception \$e) {
        echo 'no';
    }
")

if [ "$DOMAINS_EXISTS" = "yes" ]; then
    echo "✓ Tabla domains existe"
else
    echo "✗ Tabla domains NO existe"
    echo "  Ejecutando todas las migraciones..."
    php artisan migrate --force
fi
echo ""

# 4. Limpiar cachés
echo "[4/5] Limpiando cachés..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
echo "✓ Cachés limpiadas"
echo ""

# 5. Optimizar para producción
echo "[5/5] Optimizando aplicación..."
php artisan config:cache
php artisan route:cache
echo "✓ Aplicación optimizada"
echo ""

echo "=========================================="
echo "Corrección completada"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Probar la aplicación:"
echo "   curl http://217.154.186.92"
echo ""
echo "2. Si sigue el error, verificar el modelo Tenant:"
echo "   cat app/Models/Tenant.php"
echo ""
echo "3. Volver a poner APP_DEBUG=false cuando funcione:"
echo "   nano .env"
echo ""
