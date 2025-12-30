#!/bin/bash
################################################################################
# Script para crear el primer tenant en WaterCRM
# El sistema multi-tenant requiere al menos un tenant configurado
################################################################################

set -e

APP_DIR="/var/www/vhosts/crm-prueba.test/public"

echo "=========================================="
echo "Creando primer tenant para WaterCRM"
echo "=========================================="
echo ""

cd "$APP_DIR"

# Crear tenant usando artisan
echo "[1/3] Creando tenant 'demo'..."

php artisan tenancy:create-tenant demo \
    --domain=crm-prueba.test \
    --domain=217.154.186.92 \
    --name="Empresa Demo" \
    --email="admin@crm-prueba.test" 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Tenant creado exitosamente"
else
    echo "⚠ El comando anterior falló, intentando método alternativo..."

    # Método alternativo usando tinker
    php artisan tinker --execute="
    \$tenant = \App\Models\Main\Tenant::create([
        'id' => 'demo'
    ]);
    \$tenant->domains()->create(['domain' => 'crm-prueba.test']);
    \$tenant->domains()->create(['domain' => '217.154.186.92']);
    echo 'Tenant creado: ' . \$tenant->id . PHP_EOL;
    "
fi
echo ""

# Verificar que se creó
echo "[2/3] Verificando tenant creado..."
php artisan tinker --execute="
echo 'Tenants: ' . \App\Models\Main\Tenant::count() . PHP_EOL;
echo 'Domains: ' . \Stancl\Tenancy\Database\Models\Domain::count() . PHP_EOL;
"
echo ""

# Ejecutar migraciones para el tenant
echo "[3/3] Ejecutando migraciones para el tenant..."
php artisan tenants:migrate --tenants=demo
echo "✓ Migraciones de tenant ejecutadas"
echo ""

echo "=========================================="
echo "✓ Tenant configurado exitosamente"
echo "=========================================="
echo ""
echo "Tenant creado:"
echo "  ID: demo"
echo "  Dominios: crm-prueba.test, 217.154.186.92"
echo ""
echo "Ahora puedes acceder a la aplicación en:"
echo "  http://217.154.186.92"
echo "  http://crm-prueba.test"
echo ""
echo "Credenciales por defecto:"
echo "  Usuario: Admin"
echo "  Contraseña: Mario.:123"
echo ""
