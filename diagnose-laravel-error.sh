#!/bin/bash
################################################################################
# Script de diagnóstico para error 500 de Laravel en Plesk
################################################################################

set -e

APP_DIR="/var/www/vhosts/crm-prueba.test/public"

echo "=========================================="
echo "Diagnóstico de Laravel - Error 500"
echo "=========================================="
echo ""

cd "$APP_DIR"

# 1. Verificar permisos de storage
echo "[1/7] Verificando permisos de storage..."
ls -la storage/
ls -la storage/logs/ 2>/dev/null || echo "⚠ Directorio storage/logs no existe"
echo ""

# 2. Crear directorios de logs si no existen
echo "[2/7] Asegurando que existan directorios necesarios..."
mkdir -p storage/logs
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache
mkdir -p bootstrap/cache
echo "✓ Directorios creados"

# 3. Configurar permisos correctos
echo "[3/7] Configurando permisos (775 para storage y bootstrap/cache)..."
chmod -R 775 storage bootstrap/cache
chown -R crm-prueba.test_kovfbpusm6d:psacln storage bootstrap/cache
echo "✓ Permisos configurados"

# 4. Verificar .env
echo "[4/7] Verificando archivo .env..."
if [ -f .env ]; then
    echo "✓ Archivo .env existe"

    # Verificar APP_KEY
    if grep -q "APP_KEY=base64:" .env; then
        echo "✓ APP_KEY configurado"
    else
        echo "⚠ APP_KEY no configurado - generando..."
        php artisan key:generate
    fi

    # Verificar APP_DEBUG
    if grep -q "APP_DEBUG=true" .env; then
        echo "✓ APP_DEBUG está en true (modo desarrollo)"
    else
        echo "⚠ APP_DEBUG está en false (modo producción)"
        echo "  Para ver errores detallados, cambia APP_DEBUG=true temporalmente"
    fi
else
    echo "✗ Archivo .env NO existe"
    echo "  Copiando desde .env.example..."
    cp .env.example .env
    php artisan key:generate
fi
echo ""

# 5. Verificar conexión a base de datos
echo "[5/7] Verificando conexión a base de datos..."
if php artisan migrate:status 2>&1 | grep -q "Migration table not found"; then
    echo "⚠ Tablas de migración no existen - ejecuta: php artisan migrate"
elif php artisan migrate:status 2>&1 | grep -q "could not find driver"; then
    echo "✗ Driver de base de datos no encontrado"
elif php artisan migrate:status 2>&1 | grep -q "Access denied"; then
    echo "✗ Acceso denegado a la base de datos - verifica credenciales en .env"
else
    echo "✓ Conexión a base de datos OK"
fi
echo ""

# 6. Limpiar cachés
echo "[6/7] Limpiando cachés de Laravel..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
echo "✓ Cachés limpiadas"
echo ""

# 7. Ver últimos errores de Apache/PHP
echo "[7/7] Verificando logs de errores de Apache/PHP..."
echo "Últimos 10 errores de PHP:"
tail -10 /var/www/vhosts/system/crm-prueba.test/logs/error_log 2>/dev/null || echo "No hay errores recientes"
echo ""

echo "=========================================="
echo "Diagnóstico completado"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Si APP_DEBUG=false, cámbialo temporalmente a true para ver el error:"
echo "   nano .env"
echo "   Cambia: APP_DEBUG=true"
echo "   Guarda y prueba: curl http://217.154.186.92"
echo ""
echo "2. Ver el error completo en el navegador o con curl"
echo ""
echo "3. Una vez identificado y resuelto el error, vuelve a poner:"
echo "   APP_DEBUG=false"
echo ""
