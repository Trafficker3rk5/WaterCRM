#!/bin/bash
################################################################################
# Script para corregir VirtualHost 7080 - Escuchar en todas las IPs
# El problema: VirtualHost solo escucha en 217.154.186.92:7080
# La solución: Cambiar a *:7080 para que escuche en todas las IPs
################################################################################

set -e

CONFIG="/etc/apache2/plesk.conf.d/vhosts/crm-prueba.test.conf"

echo "=========================================="
echo "Corrigiendo VirtualHost para escuchar en todas las IPs"
echo "=========================================="
echo ""

# Backup
echo "[1/4] Creando backup..."
cp "$CONFIG" "$CONFIG.backup-listen-$(date +%Y%m%d-%H%M%S)"
echo "✓ Backup creado"

# Cambiar 217.154.186.92:7080 a *:7080
echo "[2/4] Cambiando VirtualHost de IP específica a todas las IPs..."
sed -i 's/<VirtualHost 217\.154\.186\.92:7080 >/<VirtualHost *:7080 >/g' "$CONFIG"
echo "✓ VirtualHost cambiado a *:7080"

# Verificar el cambio
echo "[3/4] Verificando cambio..."
if grep -q "<VirtualHost \*:7080 >" "$CONFIG"; then
    echo "✓ Cambio aplicado correctamente"
else
    echo "✗ Error: El cambio no se aplicó"
    exit 1
fi

# Verificar sintaxis
echo "[4/4] Verificando sintaxis de Apache..."
if apachectl configtest 2>&1 | grep -q "Syntax OK"; then
    echo "✓ Sintaxis correcta"
else
    echo "✗ Error de sintaxis:"
    apachectl configtest
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ Configuración corregida exitosamente"
echo "=========================================="
echo ""
echo "Cambio realizado:"
echo "  Antes: <VirtualHost 217.154.186.92:7080 >"
echo "  Ahora: <VirtualHost *:7080 >"
echo ""
echo "Esto permite que Apache escuche en:"
echo "  • 127.0.0.1:7080 (para nginx proxy)"
echo "  • 217.154.186.92:7080 (IP pública)"
echo "  • Cualquier otra IP en puerto 7080"
echo ""
echo "Próximos pasos:"
echo "  1. systemctl restart apache2"
echo "  2. curl http://127.0.0.1:7080"
echo "  3. curl http://217.154.186.92"
echo ""
