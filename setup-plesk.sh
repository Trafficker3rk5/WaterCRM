#!/bin/bash
################################################################################
# Script de Configuración Inicial para WaterCRM en Plesk
#
# Este script debe ejecutarse UNA VEZ después de clonar el repositorio
# para configurar permisos, dependencias y ejecutar la configuración inicial
#
# Uso: bash setup-plesk.sh
################################################################################

set -e # Salir si hay errores

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables de entorno (ajusta según tu instalación)
APP_DIR="/var/www/vhosts/crm-prueba.test/httpdocs"
DOMAIN="crm-prueba.test"
PHP_BIN="/usr/bin/php"
COMPOSER_BIN="/usr/bin/composer"

# Funciones de logging
log_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

ask_confirm() {
    while true; do
        read -p "$1 [y/N] " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor responde 'y' o 'n'.";;
        esac
    done
}

# Banner
clear
echo -e "${BLUE}"
cat << "EOF"
 __        __    _            ____ ____  __  __
 \ \      / /_ _| |_ ___ _ __|  _ |  _ \|  \/  |
  \ \ /\ / / _` | __/ _ \ '__| |_) | |_) | |\/| |
   \ V  V / (_| | ||  __/ |  |  _ <|  _ <| |  | |
    \_/\_/ \__,_|\__\___|_|  |_| \_\_| \_\_|  |_|

EOF
echo -e "${NC}"
echo -e "${GREEN}Script de Configuración Inicial para Plesk/IONOS${NC}\n"

# ============================================================================
# VERIFICACIONES PREVIAS
# ============================================================================

log_header "1. VERIFICACIONES PREVIAS"

# Verificar que estamos en el directorio correcto
if [ ! -f "artisan" ]; then
    log_error "Este script debe ejecutarse desde la raíz del proyecto Laravel"
    log_error "No se encontró el archivo 'artisan'"
    exit 1
fi
log_info "Directorio correcto: $(pwd)"

# Verificar PHP
if ! command -v php &> /dev/null; then
    log_error "PHP no está instalado o no está en PATH"
    exit 1
fi
PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
log_info "PHP versión: $PHP_VERSION"

if (( $(echo "$PHP_VERSION < 8.2" | bc -l) )); then
    log_warn "Se recomienda PHP 8.2 o superior (actual: $PHP_VERSION)"
fi

# Verificar extensiones requeridas
log_info "Verificando extensiones PHP requeridas..."

required_extensions=("pgsql" "pdo" "pdo_pgsql" "mbstring" "openssl" "tokenizer" "xml" "ctype" "json" "bcmath")
missing_extensions=()

for ext in "${required_extensions[@]}"; do
    if ! php -m | grep -qi "^$ext$"; then
        missing_extensions+=("$ext")
        log_warn "Extensión faltante: $ext"
    fi
done

if [ ${#missing_extensions[@]} -gt 0 ]; then
    log_error "Faltan extensiones requeridas: ${missing_extensions[*]}"
    log_info "Puedes habilitarlas en Plesk → PHP Settings"
    if ! ask_confirm "¿Continuar de todos modos?"; then
        exit 1
    fi
fi

# ============================================================================
# COMPOSER
# ============================================================================

log_header "2. INSTALACIÓN DE COMPOSER"

# Verificar si Composer está instalado
if ! command -v composer &> /dev/null; then
    log_warn "Composer no está instalado globalmente"

    if [ -f "composer.phar" ]; then
        log_info "Usando composer.phar local"
        COMPOSER_BIN="php composer.phar"
    else
        log_info "Descargando Composer..."
        php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
        php composer-setup.php
        php -r "unlink('composer-setup.php');"
        COMPOSER_BIN="php composer.phar"
        log_info "Composer descargado exitosamente"
    fi
else
    COMPOSER_VERSION=$(composer --version | cut -d " " -f 3)
    log_info "Composer instalado: versión $COMPOSER_VERSION"
    COMPOSER_BIN="composer"
fi

# ============================================================================
# DEPENDENCIAS
# ============================================================================

log_header "3. INSTALACIÓN DE DEPENDENCIAS"

log_info "Instalando dependencias de Composer..."
log_warn "Esto puede tomar varios minutos..."

$COMPOSER_BIN install --no-dev --optimize-autoloader --no-interaction

if [ $? -eq 0 ]; then
    log_info "Dependencias instaladas exitosamente"
else
    log_error "Error al instalar dependencias"
    exit 1
fi

# ============================================================================
# ARCHIVO .env
# ============================================================================

log_header "4. CONFIGURACIÓN DE .env"

if [ ! -f ".env" ]; then
    log_info "Creando archivo .env desde .env.example..."
    cp .env.example .env
    log_info "Archivo .env creado"

    # Generar APP_KEY
    log_info "Generando APP_KEY..."
    php artisan key:generate --force
    log_info "APP_KEY generado"
else
    log_warn "El archivo .env ya existe"

    # Verificar si APP_KEY está configurado
    if grep -q "^APP_KEY=\s*$" .env; then
        log_warn "APP_KEY está vacío, generando..."
        php artisan key:generate --force
        log_info "APP_KEY generado"
    else
        log_info "APP_KEY ya está configurado"
    fi
fi

# ============================================================================
# PERMISOS
# ============================================================================

log_header "5. CONFIGURACIÓN DE PERMISOS"

log_info "Configurando permisos de directorios..."

# Permisos básicos
chmod -R 755 .
log_info "Permisos base: 755"

# Permisos especiales para storage y bootstrap/cache
chmod -R 775 storage
chmod -R 775 bootstrap/cache
log_info "Permisos storage/: 775"
log_info "Permisos bootstrap/cache/: 775"

# Detectar usuario del sistema
CURRENT_USER=$(stat -c '%U' .)
CURRENT_GROUP=$(stat -c '%G' .)

log_info "Usuario del sistema: $CURRENT_USER"
log_info "Grupo del sistema: $CURRENT_GROUP"

# Intentar cambiar propietario (puede fallar sin sudo)
if [ "$EUID" -eq 0 ]; then
    chown -R "$CURRENT_USER:$CURRENT_GROUP" .
    log_info "Propietario actualizado"
else
    log_warn "No se puede cambiar propietario (se requiere sudo)"
    log_info "Si tienes problemas de permisos, ejecuta:"
    echo "  sudo chown -R $CURRENT_USER:$CURRENT_GROUP $(pwd)"
fi

# Hacer ejecutables los scripts
chmod +x deploy.sh 2>/dev/null || true
chmod +x setup-plesk.sh 2>/dev/null || true
log_info "Scripts hechos ejecutables"

# ============================================================================
# STORAGE LINK
# ============================================================================

log_header "6. ENLACE SIMBÓLICO DE STORAGE"

if [ -L "public/storage" ]; then
    log_info "El enlace simbólico ya existe"
else
    log_info "Creando enlace simbólico..."
    php artisan storage:link
    log_info "Enlace simbólico creado"
fi

# ============================================================================
# BASE DE DATOS
# ============================================================================

log_header "7. CONFIGURACIÓN DE BASE DE DATOS"

echo ""
log_warn "IMPORTANTE: Antes de continuar, configura la base de datos en .env"
echo ""
echo "Edita el archivo .env y configura:"
echo "  DB_CONNECTION=pgsql"
echo "  DB_HOST=127.0.0.1"
echo "  DB_PORT=5432"
echo "  DB_DATABASE=nombre_base_datos"
echo "  DB_USERNAME=usuario_db"
echo "  DB_PASSWORD=password_db"
echo ""

if ask_confirm "¿Ya configuraste la base de datos en .env?"; then
    log_info "Probando conexión a base de datos..."

    if php artisan db:show 2>/dev/null; then
        log_info "Conexión a base de datos exitosa"

        if ask_confirm "¿Ejecutar migraciones ahora?"; then
            log_info "Ejecutando migraciones..."
            php artisan migrate --force

            log_info "Ejecutando migraciones de tenants..."
            php artisan tenants:migrate --force || log_warn "Migraciones de tenants fallaron (puede ser normal si no hay tenants)"

            log_info "Migraciones completadas"

            if ask_confirm "¿Ejecutar seeders (datos de ejemplo)?"; then
                php artisan db:seed --force
                log_info "Seeders ejecutados"
            fi
        else
            log_warn "Migraciones omitidas - puedes ejecutarlas después con: php artisan migrate"
        fi
    else
        log_error "No se pudo conectar a la base de datos"
        log_warn "Verifica tu configuración en .env"
    fi
else
    log_warn "Configuración de base de datos omitida"
    log_info "Recuerda ejecutar después:"
    echo "  php artisan migrate --force"
    echo "  php artisan tenants:migrate --force"
fi

# ============================================================================
# OPTIMIZACIÓN
# ============================================================================

log_header "8. OPTIMIZACIÓN PARA PRODUCCIÓN"

if ask_confirm "¿Optimizar para producción (caché de configuración)?"; then
    log_info "Limpiando caché existente..."
    php artisan config:clear
    php artisan cache:clear
    php artisan view:clear
    php artisan route:clear

    log_info "Generando caché optimizada..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

    log_info "Optimización completada"
else
    log_warn "Optimización omitida"
    log_info "Para desarrollo local, está bien. Para producción, ejecuta:"
    echo "  php artisan config:cache"
    echo "  php artisan route:cache"
    echo "  php artisan view:cache"
fi

# ============================================================================
# DEPLOYMENT AUTOMÁTICO
# ============================================================================

log_header "9. CONFIGURACIÓN DE DEPLOYMENT AUTOMÁTICO"

echo ""
log_info "Para habilitar deployment automático desde GitHub:"
echo ""
echo "1. Edita public/deploy.php y cambia el SECRET:"
echo "   GITHUB_SECRET = 'tu-secret-super-seguro'"
echo ""
echo "2. Edita deploy.sh y ajusta las rutas si es necesario"
echo ""
echo "3. En GitHub, ve a Settings → Webhooks → Add webhook:"
echo "   - Payload URL: https://$DOMAIN/deploy.php"
echo "   - Content type: application/json"
echo "   - Secret: [el mismo que pusiste en deploy.php]"
echo "   - Events: Just the push event"
echo ""

if ask_confirm "¿Quieres editar el secret del webhook ahora?"; then
    read -p "Ingresa un secret seguro (mínimo 20 caracteres): " webhook_secret

    if [ ${#webhook_secret} -lt 20 ]; then
        log_warn "Secret muy corto, usando uno generado automáticamente"
        webhook_secret=$(openssl rand -hex 32)
    fi

    # Reemplazar en deploy.php
    if [ -f "public/deploy.php" ]; then
        sed -i "s/tu-secret-super-seguro-aqui-cambiame/$webhook_secret/" public/deploy.php
        log_info "Secret configurado en public/deploy.php"
        echo ""
        echo "Tu secret es: $webhook_secret"
        echo "Guárdalo para configurar el webhook en GitHub"
    fi
fi

# ============================================================================
# VERIFICACIÓN FINAL
# ============================================================================

log_header "10. VERIFICACIÓN FINAL"

log_info "Verificando instalación..."

# Verificar que artisan funciona
if php artisan --version > /dev/null 2>&1; then
    log_info "✓ Artisan funcionando"
else
    log_error "✗ Artisan no funciona"
fi

# Verificar permisos
if [ -w "storage/logs" ]; then
    log_info "✓ Permisos de escritura en storage/logs"
else
    log_warn "✗ No se puede escribir en storage/logs"
fi

if [ -w "bootstrap/cache" ]; then
    log_info "✓ Permisos de escritura en bootstrap/cache"
else
    log_warn "✗ No se puede escribir en bootstrap/cache"
fi

# Verificar .env
if [ -f ".env" ] && grep -q "APP_KEY=base64:" .env; then
    log_info "✓ APP_KEY configurado"
else
    log_warn "✗ APP_KEY no está configurado"
fi

# ============================================================================
# RESUMEN
# ============================================================================

log_header "CONFIGURACIÓN COMPLETADA"

echo -e "${GREEN}"
cat << "EOF"
   _____ _    _ _____  _____ ______  _____  ____  _
  / ____| |  | |  __ \|  __ \|  ____|/ ____|/ __ \| |
 | (___ | |  | | |  | | |  | | |__  | (___ | |  | | |
  \___ \| |  | | |  | | |  | |  __|  \___ \| |  | | |
  ____) | |__| | |__| | |__| | |____ ____) | |__| |_|
 |_____/ \____/|_____/|_____/|______|_____/ \____/(_)

EOF
echo -e "${NC}"

echo ""
log_info "WaterCRM está listo para usarse!"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Verifica que el Document Root en Plesk apunte a:"
echo "   /httpdocs/public"
echo ""
echo "2. Configura las variables de entorno en .env:"
echo "   - APP_URL"
echo "   - APP_DOMAIN"
echo "   - Base de datos (si no lo hiciste)"
echo "   - SMTP para emails"
echo ""
echo "3. Prueba la aplicación en:"
echo "   http://$DOMAIN"
echo ""
echo "4. Para deployment automático, configura el webhook en GitHub"
echo ""
echo "5. Revisa la documentación completa en:"
echo "   PLESK_SETUP.md"
echo ""

log_info "¡Gracias por usar WaterCRM!"

exit 0
