#!/bin/bash
################################################################################
# Script para crear un nuevo tenant manualmente en WaterCRM
#
# Este script ayuda a crear un tenant cuando el usuario MySQL no tiene
# permisos para crear bases de datos automáticamente.
#
# Uso:
#   ./create-tenant-manual.sh <tenant_id> <domain1> [domain2] [domain3]
#
# Ejemplo:
#   ./create-tenant-manual.sh demo crm-prueba.test 217.154.186.92
################################################################################

set -e

APP_DIR="/var/www/vhosts/crm-prueba.test/public"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_message() {
    echo -e "${GREEN}✓${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

show_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar argumentos
if [ $# -lt 2 ]; then
    echo "Uso: $0 <tenant_id> <domain1> [domain2] [domain3]"
    echo ""
    echo "Ejemplo:"
    echo "  $0 demo crm-prueba.test 217.154.186.92"
    echo ""
    exit 1
fi

TENANT_ID="$1"
shift
DOMAINS=("$@")

echo "=========================================="
echo "  Crear Tenant: $TENANT_ID"
echo "=========================================="
echo ""
echo "Dominios: ${DOMAINS[@]}"
echo ""

cd "$APP_DIR"

# 1. VERIFICAR QUE EL TENANT NO EXISTE
echo "[1/5] Verificando que el tenant no existe..."
TENANT_EXISTS=$(php artisan tinker --execute="
try {
    \$tenant = \App\Models\Main\Tenant::find('${TENANT_ID}');
    echo \$tenant ? 'yes' : 'no';
} catch (Exception \$e) {
    echo 'no';
}
")

if [ "$TENANT_EXISTS" = "yes" ]; then
    show_error "El tenant '${TENANT_ID}' ya existe"
    exit 1
else
    show_message "Tenant ID disponible"
fi
echo ""

# 2. CREAR REGISTRO DE TENANT
echo "[2/5] Creando registro de tenant..."
php artisan tinker --execute="
\$tenant = \App\Models\Main\Tenant::create([
    'id' => '${TENANT_ID}'
]);
echo 'Tenant creado: ' . \$tenant->id . PHP_EOL;
"

if [ $? -eq 0 ]; then
    show_message "Tenant creado en la tabla tenants"
else
    show_error "Error al crear tenant"
    exit 1
fi
echo ""

# 3. CREAR DOMINIOS
echo "[3/5] Creando dominios para el tenant..."

for domain in "${DOMAINS[@]}"; do
    echo "  Creando dominio: $domain"
    php artisan tinker --execute="
    DB::table('domains')->insert([
        'domain' => '${domain}',
        'tenant_id' => '${TENANT_ID}',
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo 'Dominio creado: ${domain}' . PHP_EOL;
    "

    if [ $? -eq 0 ]; then
        show_message "Dominio ${domain} creado"
    else
        show_error "Error al crear dominio ${domain}"
    fi
done
echo ""

# 4. VERIFICAR CONFIGURACIÓN
echo "[4/5] Verificando configuración del tenant..."
php artisan tinker --execute="
\$tenant = \App\Models\Main\Tenant::with('domains')->find('${TENANT_ID}');
if (\$tenant) {
    echo 'Tenant ID: ' . \$tenant->id . PHP_EOL;
    echo 'Dominios (' . \$tenant->domains->count() . '):' . PHP_EOL;
    foreach (\$tenant->domains as \$domain) {
        echo '  - ' . \$domain->domain . PHP_EOL;
    }
} else {
    echo 'ERROR: Tenant no encontrado' . PHP_EOL;
}
"
echo ""

# 5. INSTRUCCIONES PARA CREAR BASE DE DATOS
echo "[5/5] Próximos pasos"
echo "----------------------------------------------------------------------"
echo ""
show_warning "IMPORTANTE: Debes crear la base de datos manualmente"
echo ""
echo "Nombre de la base de datos: tenant${TENANT_ID}"
echo ""
echo "Opciones para crear la base de datos:"
echo ""
echo "OPCIÓN A - Usando phpMyAdmin de Plesk:"
echo "  1. Accede a Plesk > Bases de datos > Agregar base de datos"
echo "  2. Nombre: tenant${TENANT_ID}"
echo "  3. Usuario: watercrm_user (el mismo que usa la aplicación)"
echo "  4. Después de crear la BD, ejecuta las migraciones:"
echo "     php artisan tenants:migrate --tenants=${TENANT_ID}"
echo ""
echo "OPCIÓN B - Usando línea de comandos MySQL (requiere usuario root):"
echo "  mysql -u root -p -e \"CREATE DATABASE IF NOT EXISTS tenant${TENANT_ID} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
echo "  mysql -u root -p -e \"GRANT ALL PRIVILEGES ON tenant${TENANT_ID}.* TO 'watercrm_user'@'localhost';\""
echo "  mysql -u root -p -e \"FLUSH PRIVILEGES;\""
echo "  php artisan tenants:migrate --tenants=${TENANT_ID}"
echo ""
echo "Una vez creada la base de datos, el tenant estará completamente funcional."
echo ""
echo "Para verificar:"
echo "  curl -H 'Host: ${DOMAINS[0]}' http://127.0.0.1:7080"
echo ""
