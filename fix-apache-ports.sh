#!/bin/bash
################################################################################
# Script para corregir los puertos de Apache en Plesk
# Ejecutar en el servidor Plesk con acceso root
#
# Contexto: Apache debe usar puertos 8080/8443 porque nginx usa 80/443
################################################################################

set -e

echo "=========================================="
echo "Corrigiendo configuración de puertos de Apache"
echo "=========================================="
echo ""

# 1. Modificar server.conf para cambiar puertos 80/443 a 8080/8443
echo "[1/6] Modificando /etc/apache2/plesk.conf.d/server.conf..."
sed -i 's/:80 >/:8080 >/g' /etc/apache2/plesk.conf.d/server.conf
sed -i 's/:443 >/:8443 >/g' /etc/apache2/plesk.conf.d/server.conf
echo "✓ server.conf modificado"

# 2. Deshabilitar el sitio por defecto si existe
echo "[2/6] Deshabilitando sitio por defecto..."
if [ -f /etc/apache2/sites-enabled/000-default.conf ]; then
    a2dissite 000-default 2>/dev/null || true
    echo "✓ Sitio por defecto deshabilitado"
else
    echo "✓ No existe sitio por defecto"
fi

# 3. Verificar configuración de Apache
echo "[3/6] Verificando configuración de Apache..."
if apachectl configtest 2>&1 | grep -q "Syntax OK"; then
    echo "✓ Configuración de Apache válida"
else
    echo "⚠ Advertencias en configuración (puede ser normal)"
    apachectl configtest 2>&1 | tail -5
fi

# 4. Verificar VirtualHosts configurados
echo "[4/6] Verificando VirtualHosts..."
echo "VirtualHosts configurados:"
apachectl -S 2>&1 | grep -E "VirtualHost|port" | head -20
echo ""

# 5. Iniciar Apache
echo "[5/6] Iniciando Apache..."
systemctl start apache2
sleep 2

if systemctl is-active --quiet apache2; then
    echo "✓ Apache iniciado correctamente"
else
    echo "✗ Apache no pudo iniciarse"
    echo "Error:"
    systemctl status apache2 --no-pager -l | tail -20
    exit 1
fi

# 6. Verificar puertos en uso
echo "[6/6] Verificando puertos en uso..."
echo "Puertos HTTP activos:"
netstat -tlnp | grep -E ":80 |:443 |:8080 |:8443 " || ss -tlnp | grep -E ":80 |:443 |:8080 |:8443 "

echo ""
echo "=========================================="
echo "✓ Configuración completada"
echo "=========================================="
echo ""
echo "Siguiente paso:"
echo "1. Verificar que nginx esté activo en puerto 80:"
echo "   systemctl status nginx"
echo ""
echo "2. Probar la aplicación en:"
echo "   http://217.154.186.92"
echo ""
echo "3. Si nginx no está configurado como proxy reverso, ejecuta:"
echo "   bash configure-nginx-proxy.sh"
echo ""
