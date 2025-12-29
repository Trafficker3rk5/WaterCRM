#!/bin/bash
################################################################################
# Script de Deployment para WaterCRM en Plesk/IONOS
#
# Este script automatiza el proceso de deployment cuando hay cambios en GitHub
# Puede ser ejecutado manualmente o via webhook
################################################################################

set -e # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuración - Ajusta según tu instalación
APP_DIR="/var/www/vhosts/crm-prueba.test/httpdocs"
BRANCH="claude/fix-laravel-github-path-g0Yhx"
PHP_BIN="/usr/bin/php"
COMPOSER_BIN="/usr/bin/composer"

# Si composer no está en PATH, usa el local
if [ ! -f "$COMPOSER_BIN" ]; then
    COMPOSER_BIN="$APP_DIR/composer.phar"
fi

log_info "=== Iniciando deployment de WaterCRM ==="
log_info "Fecha: $(date)"
log_info "Directorio: $APP_DIR"
log_info "Rama: $BRANCH"

# Verificar que el directorio existe
if [ ! -d "$APP_DIR" ]; then
    log_error "El directorio $APP_DIR no existe"
    exit 1
fi

# Cambiar al directorio de la aplicación
cd "$APP_DIR"

# 1. Activar modo mantenimiento
log_info "Activando modo mantenimiento..."
$PHP_BIN artisan down --retry=60 || log_warn "No se pudo activar modo mantenimiento (puede que ya esté activo)"

# 2. Hacer backup de .env
log_info "Haciendo backup de .env..."
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# 3. Pull cambios desde GitHub
log_info "Obteniendo cambios desde GitHub..."
git fetch origin $BRANCH
git reset --hard origin/$BRANCH

# Restaurar .env si fue modificado
if [ -f .env.backup.* ]; then
    latest_backup=$(ls -t .env.backup.* | head -1)
    if [ -f "$latest_backup" ]; then
        cp "$latest_backup" .env
        log_info ".env restaurado desde backup"
    fi
fi

# 4. Instalar/actualizar dependencias de Composer
log_info "Instalando dependencias de Composer..."
if [ -f "$COMPOSER_BIN" ]; then
    $COMPOSER_BIN install --no-dev --optimize-autoloader --no-interaction
else
    log_warn "Composer no encontrado, saltando instalación de dependencias"
fi

# 5. Ejecutar migraciones de base de datos
log_info "Ejecutando migraciones de base de datos..."
$PHP_BIN artisan migrate --force

# 6. Ejecutar migraciones de tenants (multi-tenancy)
log_info "Ejecutando migraciones de tenants..."
$PHP_BIN artisan tenants:migrate --force || log_warn "No se pudieron ejecutar migraciones de tenants"

# 7. Limpiar caché
log_info "Limpiando caché..."
$PHP_BIN artisan config:clear
$PHP_BIN artisan cache:clear
$PHP_BIN artisan view:clear
$PHP_BIN artisan route:clear

# 8. Optimizar aplicación para producción
log_info "Optimizando aplicación..."
$PHP_BIN artisan config:cache
$PHP_BIN artisan route:cache
$PHP_BIN artisan view:cache

# 9. Optimizar autoloader de Composer
if [ -f "$COMPOSER_BIN" ]; then
    log_info "Optimizando autoloader..."
    $COMPOSER_BIN dump-autoload --optimize --no-dev
fi

# 10. Crear enlace simbólico de storage (si no existe)
log_info "Verificando enlace simbólico de storage..."
$PHP_BIN artisan storage:link || log_warn "Storage link ya existe o no se pudo crear"

# 11. Ajustar permisos
log_info "Ajustando permisos..."
chmod -R 755 "$APP_DIR"
chmod -R 775 "$APP_DIR/storage"
chmod -R 775 "$APP_DIR/bootstrap/cache"

# Detectar usuario del sistema (Plesk usa formato dominio_usuario)
SYSTEM_USER=$(stat -c '%U' "$APP_DIR")
SYSTEM_GROUP=$(stat -c '%G' "$APP_DIR")

if [ ! -z "$SYSTEM_USER" ] && [ ! -z "$SYSTEM_GROUP" ]; then
    log_info "Ajustando propietario a $SYSTEM_USER:$SYSTEM_GROUP..."
    chown -R "$SYSTEM_USER:$SYSTEM_GROUP" "$APP_DIR" || log_warn "No se pudieron cambiar permisos (puede requerir sudo)"
fi

# 12. Limpiar backups antiguos de .env (mantener solo últimos 5)
log_info "Limpiando backups antiguos..."
ls -t .env.backup.* 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true

# 13. Desactivar modo mantenimiento
log_info "Desactivando modo mantenimiento..."
$PHP_BIN artisan up

# 14. Verificar estado
log_info "Verificando estado de la aplicación..."
if $PHP_BIN artisan --version > /dev/null 2>&1; then
    log_info "✓ Artisan funcionando correctamente"
else
    log_error "✗ Artisan no está funcionando"
fi

log_info "=== Deployment completado exitosamente ==="
log_info "Fecha de finalización: $(date)"

# Mostrar últimos commits
log_info "\nÚltimos commits:"
git log --oneline -5

exit 0
