#!/bin/bash
################################################################################
# Diagnóstico COMPLETO - Todas las causas posibles de ERR_CONNECTION_REFUSED
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

APP_DIR="/var/www/vhosts/crm-prueba.test/public"

show_header() {
    echo ""
    echo "=========================================================================="
    echo -e "  ${BOLD}$1${NC}"
    echo "=========================================================================="
}

cd "$APP_DIR"

show_header "DIAGNÓSTICO COMPLETO - Todas las Causas Posibles"

echo ""
echo "[1] VERIFICAR CONFIGURACIÓN DE NGINX"
echo "----------------------------------------------------------------------"

# Encontrar archivos de configuración de nginx
echo "Buscando configuraciones de nginx..."
echo ""

NGINX_CONFIGS=$(find /etc/nginx -name "*.conf" 2>/dev/null | grep -E "(sites-enabled|conf.d|plesk)" | head -20 || echo "")

if [ -n "$NGINX_CONFIGS" ]; then
    echo "Archivos de configuración encontrados:"
    echo "$NGINX_CONFIGS"
    echo ""

    # Buscar configuraciones que mencionen el dominio o IP
    echo "Configuraciones que mencionan crm-prueba o 217.154.186.92:"
    grep -l "crm-prueba\|217.154.186.92" /etc/nginx/sites-enabled/*.conf 2>/dev/null || echo "  → Ninguna encontrada"
    grep -l "crm-prueba\|217.154.186.92" /etc/nginx/conf.d/*.conf 2>/dev/null || echo "  → Ninguna en conf.d"
    echo ""

    # Buscar proxy_pass en configuraciones activas
    echo "Configuraciones con proxy_pass:"
    grep -r "proxy_pass" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | head -10 || echo "  → Ninguna encontrada"
else
    echo "No se encontraron configuraciones de nginx"
fi

echo ""
echo "[2] VERIFICAR DEFAULT SERVER EN NGINX"
echo "----------------------------------------------------------------------"

# Ver qué configuración está activa por defecto
nginx -T 2>/dev/null | grep -A 20 "server {" | head -50 || echo "No se pudo ejecutar nginx -T"

echo ""
echo "[3] VERIFICAR FIREWALL (iptables)"
echo "----------------------------------------------------------------------"

echo "Reglas de iptables para puerto 80:"
iptables -L INPUT -n -v 2>/dev/null | grep -E "dpt:80|anywhere" | head -10 || echo "No se pudo leer iptables (requiere sudo)"

echo ""
echo "[4] VERIFICAR FIREWALL (ufw)"
echo "----------------------------------------------------------------------"

ufw status 2>/dev/null || echo "ufw no está instalado o requiere sudo"

echo ""
echo "[5] VERIFICAR FIREWALL (firewalld)"
echo "----------------------------------------------------------------------"

firewall-cmd --list-all 2>/dev/null || echo "firewalld no está activo"

echo ""
echo "[6] VERIFICAR QUÉ ESTÁ ESCUCHANDO EN PUERTO 80"
echo "----------------------------------------------------------------------"

echo "Proceso escuchando en puerto 80:"
lsof -i :80 2>/dev/null || ss -tlnp | grep ":80 "

echo ""
echo "[7] PRUEBAS DE CONECTIVIDAD DETALLADAS"
echo "----------------------------------------------------------------------"

# Desde localhost
echo "→ curl http://127.0.0.1:80 -v (primeras líneas)"
curl http://127.0.0.1:80 -v 2>&1 | head -20

echo ""
echo "→ curl http://localhost:80 -I"
curl http://localhost:80 -I 2>&1 | head -10

echo ""
echo "→ curl http://217.154.186.92:80 -I"
curl http://217.154.186.92:80 -I 2>&1 | head -10

echo ""
echo "[8] LOGS DE NGINX (últimas 20 líneas)"
echo "----------------------------------------------------------------------"

echo "Error log:"
tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No se pudo leer error.log"

echo ""
echo "Access log:"
tail -20 /var/log/nginx/access.log 2>/dev/null || echo "No se pudo leer access.log"

echo ""
echo "[9] CONFIGURACIÓN ACTUAL DE NGINX DEFAULT"
echo "----------------------------------------------------------------------"

# Mostrar configuración default
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "Contenido de /etc/nginx/sites-enabled/default:"
    cat /etc/nginx/sites-enabled/default | head -50
elif [ -f /etc/nginx/conf.d/default.conf ]; then
    echo "Contenido de /etc/nginx/conf.d/default.conf:"
    cat /etc/nginx/conf.d/default.conf | head -50
else
    echo "No hay configuración default"
fi

echo ""
echo "[10] VERIFICAR SI NGINX ESTÁ EN MODO PLESK"
echo "----------------------------------------------------------------------"

if [ -d "/etc/nginx/plesk.conf.d" ]; then
    echo "SÍ - Nginx en modo Plesk detectado"
    echo ""
    echo "Archivos en /etc/nginx/plesk.conf.d/vhosts/:"
    ls -la /etc/nginx/plesk.conf.d/vhosts/ 2>/dev/null || echo "Directorio vacío o no existe"
else
    echo "NO - Nginx NO está en modo Plesk"
fi

echo ""
echo "[11] VERIFICAR SELINUX"
echo "----------------------------------------------------------------------"

getenforce 2>/dev/null || echo "SELinux no está instalado"

echo ""
echo "[12] LOGS DE APACHE (últimas 10 líneas)"
echo "----------------------------------------------------------------------"

journalctl -u apache2 -n 10 --no-pager 2>/dev/null || echo "No se pudo leer logs de apache2"

echo ""
echo "[13] CONFIGURACIÓN PHP"
echo "----------------------------------------------------------------------"

php -v | head -1
echo "PHP-FPM corriendo:"
ps aux | grep php-fpm | grep -v grep | head -3 || echo "PHP-FPM no detectado"

echo ""
show_header "RESUMEN Y CAUSA RAÍZ"

echo ""
echo "ANÁLISIS AUTOMÁTICO:"
echo ""

# Análisis automático
HAS_PROXY_PASS=false
if grep -r "proxy_pass.*7080" /etc/nginx/ 2>/dev/null | grep -q "proxy_pass"; then
    HAS_PROXY_PASS=true
fi

HAS_DOMAIN_CONFIG=false
if grep -r "crm-prueba\|217.154.186.92" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | grep -q "server_name"; then
    HAS_DOMAIN_CONFIG=true
fi

if [ "$HAS_PROXY_PASS" = false ]; then
    echo "❌ PROBLEMA ENCONTRADO #1: nginx NO tiene configuración proxy_pass a Apache"
    echo "   → nginx está escuchando en puerto 80 pero no sabe qué hacer con las peticiones"
    echo "   → SOLUCIÓN: Copiar configuración de proxy"
    echo ""
fi

if [ "$HAS_DOMAIN_CONFIG" = false ]; then
    echo "❌ PROBLEMA ENCONTRADO #2: nginx NO tiene configuración para crm-prueba.test o 217.154.186.92"
    echo "   → nginx usa configuración default (probablemente /var/www/html)"
    echo "   → SOLUCIÓN: Crear virtualhost para el dominio/IP"
    echo ""
fi

# Verificar si iptables bloquea
IPTABLES_BLOCKS=false
if iptables -L INPUT -n 2>/dev/null | grep -q "DROP.*dpt:80"; then
    IPTABLES_BLOCKS=true
    echo "❌ PROBLEMA ENCONTRADO #3: iptables está bloqueando puerto 80"
    echo "   → SOLUCIÓN: Permitir puerto 80 en iptables"
    echo ""
fi

echo ""
echo "=========================================================================="
echo ""
